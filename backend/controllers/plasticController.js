const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Media = require('../models/Media');
const os = require('os');
const crypto = require('crypto');

// Multer Setup for temporary detection images
// Multer Setup for Memory Storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images (jpg, png, webp) are allowed'));
    }
}).single('image');

const PRICING_MAP = {
    "Plastic Bottle": 22,
    "Plastic Glass": 18,
    "Plastic Cover": 12,
    "Plastic Container": 20,
    "Other Plastic Material": 10
};

exports.detectPlastic = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        if (!req.file) return res.status(400).json({ success: false, error: "No image uploaded" });

        const weight = parseFloat(req.body.weight) || 1.0;

        // Save to Media model for persistence
        const media = new Media({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer
        });
        await media.save();
        const mediaUrl = `/api/media/${media._id}`;

        // Create a temporary file for Python inference
        const tempDir = os.tmpdir();
        const tempFileName = `detect_${crypto.randomBytes(8).toString('hex')}${path.extname(req.file.originalname)}`;
        const tempFilePath = path.join(tempDir, tempFileName);

        fs.writeFileSync(tempFilePath, req.file.buffer);

        const absImagePath = path.resolve(tempFilePath);
        const pythonScript = path.resolve(__dirname, '../../agent/inference.py');

        if (!fs.existsSync(pythonScript)) {
            return res.status(500).json({ success: false, error: "AI model script not found on server" });
        }

        // Try 'python3' first, fall back to 'python'
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const pythonProcess = spawn(pythonCmd, [pythonScript, absImagePath]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (errorOutput) {
                console.error('[Plastic AI] Python stderr:', errorOutput.substring(0, 500));
            }

            // Cleanup temp file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }

            const trimmed = output.trim();
            if (!trimmed) {
                const errMsg = errorOutput.includes('ModuleNotFoundError') || errorOutput.includes('No module')
                    ? 'Python dependencies missing (run: pip install ultralytics)'
                    : errorOutput.includes('No such file')
                        ? 'AI model weights not found'
                        : `AI script failed (exit ${code}): ${errorOutput.substring(0, 200) || 'no output'}`;
                return res.status(500).json({ success: false, error: errMsg });
            }

            try {
                const result = JSON.parse(trimmed);
                if (result.error) return res.status(500).json({ success: false, error: result.error });

                // Model could not recognize a valid plastic type
                if (result.unrecognized) {
                    return res.status(422).json({
                        success: false,
                        unrecognized: true,
                        message: "Uh oh! We don't take this type of plastic 🚫"
                    });
                }

                const ratePerKg = PRICING_MAP[result.object_type] || 10;
                const estimatedPrice = ratePerKg * weight;

                res.json({
                    success: true,
                    object_type: result.object_type,
                    confidence: result.confidence,
                    rate_per_kg: ratePerKg,
                    weight: weight,
                    estimated_price: estimatedPrice,
                    image_path: mediaUrl
                });
            } catch (e) {
                console.error('[Plastic AI] Failed to parse AI output:', trimmed);
                res.status(500).json({ success: false, error: 'AI returned unexpected output. Please try again.' });
            }
        });

        pythonProcess.on('error', (spawnErr) => {
            console.error('[Plastic AI] Spawn error:', spawnErr.message);
            res.status(500).json({ success: false, error: `Python not found: ${spawnErr.message}. Ensure Python is installed.` });
        });
    });
};


exports.confirmSale = async (req, res) => {
    try {
        const { object_type, confidence, weight, rate_per_kg, estimated_price, image_path } = req.body;
        const userId = req.user.id;
        console.log("Analyzing operative credentials for ID:", userId);

        // Proactive validation of operative existence
        const [userCheck] = await db.query('SELECT id FROM nullify_users WHERE id = ?', [userId]);
        if (userCheck.length === 0) {
            console.error("Tactical Error: Operative ID not found in neural database. Session may be stale.");
            return res.status(401).json({
                success: false,
                error: "Invalid Session",
                details: "Your operative credentials were not found in the grid. Please logout and login again to re-sync your tactical profile."
            });
        }

        const [result] = await db.query(
            'INSERT INTO plastic_sales (user_id, object_type, confidence, weight, rate_per_kg, estimated_price, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, object_type, confidence, weight, rate_per_kg, estimated_price, image_path]
        );

        res.json({ success: true, saleId: result.insertId, message: "Sale confirmed! Credits will be added after verification." });
    } catch (error) {
        console.error("Error confirming sale:", error);
        console.error("Request Body:", req.body);
        res.status(500).json({ success: false, error: "Failed to store sale record", details: error.message });
    }
};
