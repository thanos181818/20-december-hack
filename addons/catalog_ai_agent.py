import torch
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration, CLIPProcessor, CLIPModel

# Load the models (This will download about 1GB of models on first run)
print("Initializing AI Vision Models...")
# BLIP for Captioning (Description)
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# CLIP for Tagging (Classification)
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def process_product_image(image_path):
    # 1. Load Image
    raw_image = Image.open(image_path).convert('RGB')
    
    # 2. Generate Description (Image-to-Text) using BLIP
    inputs = blip_processor(raw_image, return_tensors="pt")
    out = blip_model.generate(**inputs)
    description = blip_processor.decode(out[0], skip_special_tokens=True)
    
    # 3. Categorize (Tagging) using CLIP
    # We give CLIP a list of possible fashion categories
    candidate_labels = ["a shirt", "a kurta", "a hoodie", "denim pants", "a dress", "a scarf"]
    
    inputs = clip_processor(
        text=candidate_labels, 
        images=raw_image, 
        return_tensors="pt", 
        padding=True
    )
    
    outputs = clip_model(**inputs)
    logits_per_image = outputs.logits_per_image 
    probs = logits_per_image.softmax(dim=1) # Get probabilities
    
    # Find the highest probability label
    max_idx = torch.argmax(probs)
    category = candidate_labels[max_idx]

    return {
        "generated_title": description.capitalize(),
        "detected_category": category,
        "confidence": f"{probs[0][max_idx]:.2%}"
    }

# --- TEST THE AGENT ---
if __name__ == "__main__":
    # Ensure you have an image file named 'test_item.jpg' in your folder
    IMAGE_FILE = "test_item3.jpg" 
    
    try:
        print(f"Analyzing image: {IMAGE_FILE}...")
        result = process_product_image(IMAGE_FILE)
        
        print("\n" + "="*30)
        print("AI CATALOG ENRICHMENT RESULT")
        print("="*30)
        print(f"Suggested Title: {result['generated_title']}")
        print(f"Detected Category: {result['detected_category']}")
        print(f"AI Confidence: {result['confidence']}")
        print("="*30)
        
    except FileNotFoundError:
        print(f"Error: Please place an image named '{IMAGE_FILE}' in the folder.")