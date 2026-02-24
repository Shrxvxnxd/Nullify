const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Set up EJS for SSR
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'))); // For CSS/JS assets if any

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const statsRoutes = require('./routes/statsRoutes');
const communityRoutes = require('./routes/communityRoutes');
const eventRoutes = require('./routes/eventRoutes');
const plasticRoutes = require('./routes/plasticRoutes');
const productRoutes = require('./routes/productRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const issueRoutes = require('./routes/issueRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const adminController = require('./controllers/adminController'); // Publicly accessible alert fetch

const connectMongo = require('./config/mongoDb');
connectMongo();

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/plastic', plasticRoutes);
app.use('/api/products', productRoutes);
app.use('/api', weatherRoutes);
app.use('/api', issueRoutes);
app.use('/api/media', mediaRoutes);

// Publicly available critical alerts
app.get('/api/public/alerts', adminController.getActiveAlerts);

app.get('/', (req, res) => {
    res.json({ message: "Backend is running!" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
