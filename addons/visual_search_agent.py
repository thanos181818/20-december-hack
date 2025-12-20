import torch
import os
from PIL import Image
import matplotlib.pyplot as plt
from transformers import CLIPProcessor, CLIPModel
from torch.nn.functional import cosine_similarity

# 1. Load the Model
print("Loading Vision Engine...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def get_image_embedding(image_path):
    """Converts an image into a mathematical vector (embedding)"""
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embeddings = model.get_image_features(**inputs)
    # Normalize the vector so comparison is accurate
    return embeddings / embeddings.norm(p=2, dim=-1, keepdim=True)

def find_nearest_product(query_image_path, database_folder):
    """Compares query image against a folder of images"""
    
    # Get embedding for the input image
    query_vec = get_image_embedding(query_image_path)
    
    best_match = None
    highest_similarity = -1
    
    # Supported image formats
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    
    print(f"Searching through folder: {database_folder}...")
    
    for filename in os.listdir(database_folder):
        if filename.lower().endswith(valid_extensions):
            img_path = os.path.join(database_folder, filename)
            
            # Get embedding for current folder image
            db_vec = get_image_embedding(img_path)
            
            # Calculate Cosine Similarity (1.0 = identical, 0.0 = completely different)
            sim = cosine_similarity(query_vec, db_vec).item()
            
            if sim > highest_similarity:
                highest_similarity = sim
                best_match = img_path
    
    return best_match, highest_similarity

def display_results(query_path, match_path, score):
    """Displays the input and the match side-by-side"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
    
    ax1.imshow(Image.open(query_path))
    ax1.set_title("Your Input Image")
    ax1.axis('off')
    
    ax2.imshow(Image.open(match_path))
    ax2.set_title(f"Best Match (Sim: {score:.2f})")
    ax2.axis('off')
    
    print(f"\nMatch Found: {match_path}")
    print(f"Similarity Score: {score:.4%}")
    plt.show()

# --- RUN THE SEARCH ---
if __name__ == "__main__":
    # CONFIGURATION
    FOLDER_PATH = "catalog_images"      # Your folder with many images
    INPUT_IMAGE = "user_query3.jpg"      # The single image you provide
    
    # Create folder if it doesn't exist for the user
    if not os.path.exists(FOLDER_PATH):
        os.makedirs(FOLDER_PATH)
        print(f"Created folder '{FOLDER_PATH}'. Please put images inside it.")
    elif not os.path.exists(INPUT_IMAGE):
        print(f"Please provide an input image named '{INPUT_IMAGE}'")
    else:
        match, score = find_nearest_product(INPUT_IMAGE, FOLDER_PATH)
        if match:
            display_results(INPUT_IMAGE, match, score)
        else:
            print("No images found in folder to compare.")