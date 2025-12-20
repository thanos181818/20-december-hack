"""
Visual Search API using CLIP model
Allows users to upload an image and find similar products
"""
import os
import torch
from PIL import Image
from io import BytesIO
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

# Lazy load heavy dependencies
_model = None
_processor = None

def get_clip_model():
    """Lazy load CLIP model to avoid startup delay"""
    global _model, _processor
    if _model is None:
        from transformers import CLIPProcessor, CLIPModel
        print("Loading CLIP Vision Engine...")
        _model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        _processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print("CLIP Vision Engine loaded!")
    return _model, _processor

router = APIRouter(prefix="/visual-search", tags=["visual-search"])

class VisualSearchResult(BaseModel):
    product_id: int
    product_name: str
    similarity_score: float
    image_url: Optional[str] = None
    price: float
    category: Optional[str] = None

class VisualSearchResponse(BaseModel):
    results: List[VisualSearchResult]
    query_processed: bool

def get_image_embedding(image: Image.Image):
    """Converts an image into a mathematical vector (embedding)"""
    model, processor = get_clip_model()
    image = image.convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embeddings = model.get_image_features(**inputs)
    # Normalize the vector so comparison is accurate
    return embeddings / embeddings.norm(p=2, dim=-1, keepdim=True)

def get_text_embedding(text: str):
    """Converts text description into embedding for comparison"""
    model, processor = get_clip_model()
    inputs = processor(text=[text], return_tensors="pt", padding=True)
    with torch.no_grad():
        embeddings = model.get_text_features(**inputs)
    return embeddings / embeddings.norm(p=2, dim=-1, keepdim=True)

def calculate_similarity(query_embedding, target_embedding) -> float:
    """Calculate cosine similarity between two embeddings"""
    from torch.nn.functional import cosine_similarity
    return cosine_similarity(query_embedding, target_embedding).item()

# In-memory cache for product embeddings (text-based for now)
_product_embeddings_cache = {}

async def get_product_embedding(product_name: str, product_category: str = ""):
    """Get or compute embedding for a product based on its name and category"""
    cache_key = f"{product_name}_{product_category}"
    if cache_key not in _product_embeddings_cache:
        # Create a descriptive text for the product
        description = f"{product_name} {product_category} clothing apparel fashion"
        _product_embeddings_cache[cache_key] = get_text_embedding(description)
    return _product_embeddings_cache[cache_key]

@router.post("/search", response_model=VisualSearchResponse)
async def visual_search(
    image: UploadFile = File(...),
    top_k: int = 5
):
    """
    Search for products visually similar to the uploaded image.
    Uses CLIP model to compare the uploaded image against product descriptions.
    """
    try:
        # Read and process the uploaded image
        contents = await image.read()
        pil_image = Image.open(BytesIO(contents))
        
        # Get embedding for the query image
        query_embedding = get_image_embedding(pil_image)
        
        # Import here to avoid circular imports
        from backend.db import get_session, engine
        from backend.models import Product
        
        # Get all products from database
        async with AsyncSession(engine) as session:
            result = await session.execute(select(Product))
            products = result.scalars().all()
        
        if not products:
            return VisualSearchResponse(results=[], query_processed=True)
        
        # Calculate similarity for each product
        similarities = []
        for product in products:
            product_embedding = await get_product_embedding(
                product.name, 
                product.category or ""
            )
            similarity = calculate_similarity(query_embedding, product_embedding)
            similarities.append({
                "product": product,
                "similarity": similarity
            })
        
        # Sort by similarity and get top results
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_results = similarities[:top_k]
        
        # Format response
        results = [
            VisualSearchResult(
                product_id=item["product"].id,
                product_name=item["product"].name,
                similarity_score=round(item["similarity"] * 100, 2),  # Convert to percentage
                image_url=item["product"].image_url,
                price=item["product"].price,
                category=item["product"].category
            )
            for item in top_results
        ]
        
        return VisualSearchResponse(results=results, query_processed=True)
        
    except Exception as e:
        print(f"Visual search error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.get("/health")
async def visual_search_health():
    """Check if visual search is available"""
    try:
        # Try to load model (lazy load)
        get_clip_model()
        return {"status": "ready", "model": "clip-vit-base-patch32"}
    except Exception as e:
        return {"status": "unavailable", "error": str(e)}
