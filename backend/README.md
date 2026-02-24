# NULLIFY Backend & AI Plastic Detection

This is the backend service for the **NULLIFY Sustainability Platform**, an AI-powered initiative to track and incentivize plastic waste recycling.

## 🚀 Overview

The backend is built with **Node.js** and **Express**, featuring a hybrid database architecture (**MySQL** for relational data and **MongoDB** for media/unstructured data). It integrates a **Deep Learning** model (YOLOv8) to automatically identify and categorize plastic waste from user-uploaded images.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Databases**: 
  - **MySQL**: User profiles, sales records, and community stats.
  - **MongoDB**: Storage for image metadata and binary data.
- **AI/ML**: Python 3.x, YOLOv8 (Ultralytics), OpenCV, PyTorch.
- **Authentication**: JWT (JSON Web Tokens) & Google OAuth 2.0.

---

## 🤖 Deep Learning Model (Plastic Detection)

The core feature is the automatic detection of plastic types to calculate recycling credits.

### How it Works
1. **Inference Script**: Located at `Agent/inference.py`.
2. **Architecture**: Uses **YOLOv8** (You Only Look Once) for real-time object detection.
3. **Detection Logic**:
   - The backend spawns a Python process to run `inference.py` on the uploaded image.
   - The model predicts the type of plastic with a confidence score.
   - **Confidence Threshold**: Any detection below **40% confidence** is rejected as "unrecognized" to ensure accuracy.
4. **Pricing Map**:
   The backend applies a predefined pricing strategy based on the detected class:
   | Plastic Type | Rate (Credits/Kg) |
   | :--- | :--- |
   | Plastic Bottle | 22 |
   | Plastic Container | 20 |
   | Plastic Glass | 18 |
   | Plastic Cover (Bags) | 12 |
   | Other Plastic | 10 |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** & **npm** installed.
- **Python 3.8+** with the following packages:
  ```bash
  pip install ultralytics torch torchvision opencv-python
  ```
- **MySQL** and **MongoDB** instances running.

### 2. Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=8081
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nullify_db
MONGODB_URI=mongodb://localhost:27017/nullify
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

### 3. Setup Commands
```bash
# Install dependencies
npm install

# (Optional) Run database migrations/scripts
node check_db_connection.js
```

### 4. Running the Server
- **Development**: `npm run dev` (uses nodemon)
- **Production**: `npm start`

---

## 🛣️ Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User signup |
| `POST` | `/api/plastic/detect` | Upload image for AI plastic detection |
| `POST` | `/api/plastic/confirm` | Confirm sale and store credits |
| `GET` | `/api/stats/leaderboard` | Get community rankings |
| `GET` | `/api/public/alerts` | Fetch active environmental alerts |

---

## 📁 Directory Structure
- `controllers/`: Request handling logic (AI integration in `plasticController.js`).
- `routes/`: API route definitions.
- `models/`: Mongoose schemas and database models.
- `middleware/`: Authentication and file upload handling.
- `Agent/`: Python Deep Learning scripts and YOLO weights.

---
*Built for the NULLIFY Sustainability Initiative.*
