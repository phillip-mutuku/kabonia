from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from .models import ProjectData, PredictionResponse, PriceHistoryResponse
from .prediction import predict_carbon_value, get_price_recommendation
import datetime

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_project_value(project_data: ProjectData):
    """
    Predict the carbon credit value based on project data
    """
    try:
        prediction = predict_carbon_value(project_data)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/recommend-price")
async def recommend_price(project_data: ProjectData):
    """
    Get price recommendation for a carbon project
    """
    try:
        recommendation = get_price_recommendation(project_data)
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@router.get("/price-history/{token_id}")
async def get_price_history(token_id: str, days: int = 30):
    """
    Get price history for a token
    """
    try:
        # Generate simulated price history
        price_history = []
        today = datetime.datetime.now()
        
        for i in range(days):
            date = today - datetime.timedelta(days=i)
            price_history.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": 15 + i * 0.1 
            })
        
        return {"token_id": token_id, "price_history": price_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting price history: {str(e)}")


@router.get("/market-data")
async def get_market_data():
    """
    Get general market data and trends
    """
    return {
        "average_price": 17.25,
        "volume_24h": 15000,
        "price_change": 2.5,
        "trending_projects": [
            {"name": "Amazon Reforestation", "price": 22.50},
            {"name": "Kenya Soil Carbon", "price": 18.75},
            {"name": "Indonesian Mangrove", "price": 20.10}
        ]
    }