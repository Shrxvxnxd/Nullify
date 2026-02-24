import yaml
import os
import shutil
from pathlib import Path
from tqdm import tqdm

# Configuration
SOURCE_DIR = Path(r"c:\Users\heman\OneDrive\Documents\New folder\YOLO Waste Detection.v1i.yolov8")
TARGET_DIR = Path(r"c:\Users\heman\OneDrive\Documents\New folder\plastic_dataset")

# Class mapping: Source ID -> Target ID (0-indexed for new dataset)
PLASTIC_CLASSES = {
    6: 0,   # Combined plastic
    23: 1,  # Plastic bag
    24: 2,  # Plastic bottle
    25: 3   # Plastic can
}

CLASS_NAMES = ["combined_plastic", "plastic_bag", "plastic_bottle", "plastic_can"]

def filter_file(label_path, target_label_path):
    with open(label_path, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        parts = line.strip().split()
        if not parts:
            continue
        class_id = int(parts[0])
        if class_id in PLASTIC_CLASSES:
            new_id = PLASTIC_CLASSES[class_id]
            new_lines.append(f"{new_id} {' '.join(parts[1:])}")
            
    if new_lines:
        os.makedirs(target_label_path.parent, exist_ok=True)
        with open(target_label_path, 'w') as f:
            f.write('\n'.join(new_lines))
        return True
    return False

def process_split(split_name):
    print(f"Processing {split_name} split...")
    source_img_dir = SOURCE_DIR / split_name / "images"
    source_lbl_dir = SOURCE_DIR / split_name / "labels"
    
    # Check if images are directly in the split folder or in an "images" subfolder
    if not source_img_dir.exists():
        # Fallback to direct directory structure if Roboflow structure differs
        source_img_dir = SOURCE_DIR / split_name
        source_lbl_dir = SOURCE_DIR / split_name
    
    target_img_dir = TARGET_DIR / "images" / split_name
    target_lbl_dir = TARGET_DIR / "labels" / split_name
    
    os.makedirs(target_img_dir, exist_ok=True)
    os.makedirs(target_lbl_dir, exist_ok=True)
    
    label_files = list(source_lbl_dir.glob("*.txt"))
    count = 0
    
    for lbl_path in tqdm(label_files):
        target_lbl_path = target_lbl_dir / lbl_path.name
        if filter_file(lbl_path, target_lbl_path):
            # Find corresponding image
            # Images can have multiple extensions
            img_found = False
            for ext in ['.jpg', '.jpeg', '.png']:
                img_path = source_img_dir / (lbl_path.stem + ext)
                if img_path.exists():
                    shutil.copy(img_path, target_img_dir / img_path.name)
                    img_found = True
                    break
            if img_found:
                count += 1
            else:
                # If image not found, remove the filtered label file
                if target_lbl_path.exists():
                    os.remove(target_lbl_path)
                    
    print(f"Copied {count} images/labels for {split_name}")

def main():
    if TARGET_DIR.exists():
        shutil.rmtree(TARGET_DIR)
    
    # Roboflow export usually has train, valid, test. 
    # Use 'valid' as 'val' for YOLO training convention if needed.
    splits = {
        "train": "train",
        "valid": "val",
        "test": "test"
    }
    
    for src_split, target_split in splits.items():
        process_split(src_split)
        
    # Create data.yaml
    data_yaml = {
        'train': str(TARGET_DIR / "images" / "train"),
        'val': str(TARGET_DIR / "images" / "valid"),
        'test': str(TARGET_DIR / "images" / "test"),
        'nc': len(CLASS_NAMES),
        'names': CLASS_NAMES
    }
    
    with open(TARGET_DIR / "data.yaml", 'w') as f:
        yaml.dump(data_yaml, f)
        
    print(f"Dataset preparation complete at {TARGET_DIR}")

if __name__ == "__main__":
    main()
