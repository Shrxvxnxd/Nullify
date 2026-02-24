# NULLIFY Sustainability Platform

AI-powered sustainability platform that detects plastic waste using YOLOv8 and ranks communities for environmental impact.

## Tech Stack
- **OS**: Windows
- **Language**: Python 3.x
- **Deep Learning**: YOLOv8 (Ultralytics)
- **Computer Vision**: OpenCV
- **Libraries**: Torch, Torchvision, PyYAML, tqdm

## Dataset & Training
The model is trained on specific plastic-related classes:
- Combined plastic
- Plastic bag
- Plastic bottle
- Plastic can

Training was performed on CPU using an accelerated strategy (imgsz=320, 8 epochs) to demonstrate fast inference and rapid prototyping for the NULLIFY platform.

## Setup Instructions

### 1. Requirements
Ensure you have Python installed. Install the necessary dependencies:
```bash
pip install ultralytics torch torchvision
```

### 2. Dataset Preparation
Filter the waste dataset for plastic classes:
```bash
python prepare_dataset.py
```

### 3. Training the Model
Run the training script:
```bash
python train_yolo.py
```

### 4. Running Inference
The best weights were saved to `models/nullify_plastic_best.pt`. Use these weights with the YOLOv8 CLI or Python API to detect plastic waste in images or video streams.

## Features
- **Plastic Detection**: Real-time identification of common plastic waste.
- **Community Ranking**: (Module in progress) Metrics to encourage community sustainability participation.
- **Hackathon-Ready**: Modular script-based architecture for easy integration.

---
*Developed for the NULLIFY sustainability initiative.*
