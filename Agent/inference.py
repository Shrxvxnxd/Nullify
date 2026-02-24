import sys
import json
import os
from ultralytics import YOLO

def run_inference(image_path):
    # Load the best weights
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'nullify_plastic_best.pt')
    
    if not os.path.exists(model_path):
        return json.dumps({"error": "Model not found"})
    
    try:
        model = YOLO(model_path)
        results = model.predict(source=image_path, save=False, conf=0.25, verbose=False)
        
        if len(results) == 0 or len(results[0].boxes) == 0:
            return json.dumps({"unrecognized": True, "reason": "no_detection"})
        
        # Get the highest confidence detection
        best_box = None
        max_conf = -1.0
        
        for box in results[0].boxes:
            conf = float(box.conf[0])
            if conf > max_conf:
                max_conf = conf
                best_box = box
        
        class_id = int(best_box.cls[0])
        class_name = results[0].names[class_id]

        # Reject low-confidence detections as unrecognized
        if max_conf < 0.40:
            return json.dumps({"unrecognized": True, "reason": "low_confidence", "confidence": round(max_conf, 2)})

        # Map model class names to user requested display names
        mapping = {
            "plastic_bottle": "Plastic Bottle",
            "plastic_bag": "Plastic Cover",
            "plastic_can": "Plastic Container",
            "combined_plastic": "Other Plastic Material"
        }

        display_name = mapping.get(class_name, None)

        # Class not in known mapping → unrecognized
        if display_name is None:
            return json.dumps({"unrecognized": True, "reason": "unknown_class", "class": class_name})

        return json.dumps({
            "object_type": display_name,
            "confidence": round(max_conf, 2)
        })

    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    print(run_inference(image_path))
