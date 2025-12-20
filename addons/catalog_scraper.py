from bing_image_downloader import downloader
import os
import shutil

def scrape_fashion_catalog(categories, limit_per_category=5):
    output_dir = 'catalog_images'
    
    # 1. Clear existing 'bad' images to start fresh
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)
    
    # These words will be added to every search to force 'Fashion' results
    search_suffix = " clothing product photography white background"

    for category in categories:
        # Create a specific search query
        # Example: "Cotton T-Shirt" becomes "Cotton T-Shirt clothing product photography"
        optimized_query = category + search_suffix
        
        print(f"\n--- 🔍 Optimized Search: {optimized_query} ---")
        
        try:
            downloader.download(
                optimized_query, 
                limit=limit_per_category, 
                output_dir='temp_download', 
                adult_filter_off=True, 
                force_replace=False, 
                timeout=15,
                verbose=False
            )
            
            # Move and Rename
            temp_path = os.path.join('temp_download', optimized_query)
            if os.path.exists(temp_path):
                for filename in os.listdir(temp_path):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        clean_name = category.replace(' ', '_').lower()
                        new_name = f"{clean_name}_{filename}"
                        shutil.move(os.path.join(temp_path, filename), os.path.join(output_dir, new_name))
        
        except Exception as e:
            print(f"❌ Error: {e}")

    if os.path.exists('temp_download'):
        shutil.rmtree('temp_download')
        
    print(f"\n✅ Warehouse Stocked with CLEAN images in '{output_dir}'")

if __name__ == "__main__":
    # Refined keywords to be more specific
    fashion_keywords = [
        "Cotton T-Shirt", 
        "Silk Scarf fashion accessory", 
        "Denim Jacket", 
        "Mens Kurta", 
        "Blue Jeans apparel", 
        "Womens Summer Dress", 
        "Winter Hoodie"
    ]
    
    scrape_fashion_catalog(fashion_keywords, limit_per_category=5)