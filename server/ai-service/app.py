from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os
from typing import Dict, Any, List, Optional
import json

# Import prediction modules
from api.prediction import predict_carbon_value, get_price_recommendation
from api.models import ProjectData, PredictionResponse, PriceHistoryResponse

# Initialize FastAPI app
app = FastAPI(
    title="CarbonX AI Valuation Service",
    description="AI-powered valuation service for carbon credit projects",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained model if it exists
model_path = os.path.join("models", "carbon_value_model.joblib")
try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        # If model doesn't exist, we'll use our backup calculation method
        model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None


@app.get("/")
def read_root():
    return {"message": "CarbonX AI Valuation Service is running"}


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/api/predict", response_model=PredictionResponse)
def predict_value(project_data: ProjectData):
    try:
        # Call the prediction function
        prediction = predict_carbon_value(project_data, model)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/recommend-price")
def recommend_price(project_data: ProjectData):
    try:
        # Get price recommendation
        recommendation = get_price_recommendation(project_data, model)
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@app.get("/api/price-history/{token_id}")
def get_price_history(token_id: str, days: int = 30):
    try:
        # Generate simulated price history data
        today = datetime.now()
        price_history = []
        
        # Generate some random but realistic price history
        base_price = int(token_id.split('.')[-1]) % 10 + 15 if token_id else 20
        
        for i in range(days, -1, -1):
            date = today.replace(day=today.day - i)
            
            # Create some random variation with a slight upward trend
            random_factor = 0.95 + (np.random.random() * 0.1)
            trend_factor = 1 + (0.001 * (days - i))
            price = base_price * random_factor * trend_factor
            
            price_history.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(price, 2)
            })
        
        return {"token_id": token_id, "price_history": price_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating price history: {str(e)}")


@app.get("/api/market-metrics")
def get_market_metrics():
    try:
        # Generate simulated market metrics
        metrics = {
            "average_price": 17.50,
            "daily_volume": 12500,
            "price_change_24h": 2.3,
            "most_active_sectors": [
                {"name": "Reforestation", "volume": 5200},
                {"name": "Conservation", "volume": 3800},
                {"name": "Renewable Energy", "volume": 2100}
            ],
            "regional_distribution": [
                {"region": "Africa", "percentage": 35},
                {"region": "South America", "percentage": 28},
                {"region": "Asia", "percentage": 18},
                {"region": "North America", "percentage": 12},
                {"region": "Europe", "percentage": 7}
            ]
        }
        
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating market metrics: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)