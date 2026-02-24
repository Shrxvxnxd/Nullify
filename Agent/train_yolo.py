from ultralytics import YOLO
import os
from pathlib import Path

def train():
    # Load a pretrained YOLOv8n model
    model = YOLO('yolov8n.pt')
    
    # Define project and name for logging
    project_dir = Path(r"c:\Users\heman\OneDrive\Documents\New folder\runs")
    name = "plastic_detection"
    
    # Train the model
    results = model.train(
        data=Path(r"c:\Users\heman\OneDrive\Documents\New folder\plastic_dataset\data.yaml"),
        epochs=8,
        imgsz=320,
        batch=-1,  # Auto-batch
        device='cpu',
        patience=10,
        project=project_dir,
        name=name,
        exist_ok=True
    )
    
    # Save best weights to the requested location
    save_dir = Path(r"c:\Users\heman\OneDrive\Documents\New folder\models")
    os.makedirs(save_dir, exist_ok=True)
    
    best_weights = project_dir / name / 'weights' / 'best.pt'
    if best_weights.exists():
        target_path = save_dir / "nullify_plastic_best.pt"
        import shutil
        shutil.copy(best_weights, target_path)
        print(f"Best weights saved to {target_path}")
    
    # Print metrics
    print("\nTraining Metrics:")
    print(f"mAP@50: {results.results_dict['metrics/mAP50(B)']}")
    print(f"Precision: {results.results_dict['metrics/precision(B)']}")
    print(f"Recall: {results.results_dict['metrics/recall(B)']}")

if __name__ == "__main__":
    train()
