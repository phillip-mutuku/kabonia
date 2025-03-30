import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List, Optional
from api.models import ProjectData, PredictionResponse
from fastapi import HTTPException

def predict_carbon_value(project_data: ProjectData, model=None) -> PredictionResponse:
    try:
        # trained model, use it
        if model is not None:
            # Extract features for the model
            features = extract_features(project_data)
            prediction = model.predict([features])[0]
            
            # Assuming the model has an attribute 'score' from training
            confidence = 0.85  # Default confidence if no score available
            
            # You can add a try-block to get actual model score
            try:
                # This would typically be calculated during model training
                confidence = min(0.95, max(0.5, model.score))
            except:
                pass
        else:
            # Fall back to rule-based calculation
            prediction, confidence = calculate_credit_value(project_data)
        
        # Generate market trend analysis
        market_trend = analyze_market_trend(project_data)
        
        # Generate factor impact analysis
        factors = analyze_factors(project_data)
        
        # Calculate recommended price range
        price_range = {
            "min": round(prediction * 0.9, 2),
            "max": round(prediction * 1.3, 2)
        }
        
        # Create full response
        return PredictionResponse(
            creditValue=round(prediction, 2),
            confidence=round(confidence, 2),
            marketTrend=market_trend,
            factors=factors,
            recommendedInitialPrice=round(prediction * 1.1, 2),
            priceRange=price_range
        )
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

def extract_features(project_data: ProjectData) -> List[float]:
    """Extract numerical features from project data for model input"""
    
    # Calculate project duration in years
    duration_years = (project_data.endDate - project_data.startDate).days / 365.25
    
    # Get carbon capture amount (actual if available, otherwise estimated)
    carbon_capture = project_data.actualCarbonCapture or project_data.estimatedCarbonCapture or 0.0
    
    # Ensure all are converted to float and handle potential NaN
    features = [
        float(project_data.area) if pd.notna(project_data.area) else 0.0,
        float(carbon_capture) if pd.notna(carbon_capture) else 0.0,
        float(duration_years) if pd.notna(duration_years) else 0.0,
        # Project type encoding (simplified)
        {
            'reforestation': 1.0,
            'conservation': 2.0,
            'renewable_energy': 3.0,
            'methane_capture': 4.0,
            'soil_carbon': 5.0
        }.get(project_data.projectType.lower(), 0.0),
        # Location premium (simplified)
        1.3 if 'rainforest' in project_data.location.lower() else 1.0
    ]
    
    return features

def calculate_credit_value(project_data: ProjectData) -> tuple:
    """
    Calculate carbon credit value using a rule-based approach
    
    Returns:
        Tuple of (predicted_value, confidence)
    """
    # Get carbon capture (actual if available, otherwise estimated)
    carbon_capture = project_data.actualCarbonCapture or project_data.estimatedCarbonCapture
    
    # Calculate project duration in years
    start_date = datetime.fromisoformat(str(project_data.startDate).split('T')[0])
    end_date = datetime.fromisoformat(str(project_data.endDate).split('T')[0])
    duration_years = (end_date - start_date).days / 365.25
    
    # Base value factors
    base_value_per_ton = 15  # Base value per ton of carbon
    
    # Project type multipliers
    project_type_multipliers = {
        'reforestation': 1.2,
        'conservation': 1.0,
        'renewable_energy': 0.9,
        'methane_capture': 1.1,
        'soil_carbon': 1.05
    }
    
    # Get project type multiplier (default to 1.0 if not found)
    type_multiplier = project_type_multipliers.get(project_data.projectType.lower(), 1.0)
    
    # Location premium (simplified)
    location_premium = 1.3 if 'rainforest' in project_data.location.lower() else 1.0
    
    # Scale factor based on project size
    scale_factor = min(1.0, 0.7 + (0.3 * min(project_data.area / 1000, 1.0)))
    
    # Durability factor based on project duration
    durability_factor = min(1.5, 0.8 + (0.7 * min(duration_years / 30, 1.0)))
    
    # Calculate credit value
    credit_value = base_value_per_ton * type_multiplier * location_premium * scale_factor * durability_factor
    
    # Determine confidence (higher for verified projects with actual data)
    confidence = 0.85 if project_data.actualCarbonCapture else 0.75
    
    return credit_value, confidence

def analyze_market_trend(project_data: ProjectData) -> str:
    """Analyze market trend for this type of carbon credit"""
    
    # In a real implementation, this would analyze market data
    # For this MVP, we'll return a simple assessment based on project type
    
    project_type = project_data.projectType.lower()
    
    if project_type in ['reforestation', 'conservation']:
        return 'rising'
    elif project_type in ['soil_carbon']:
        return 'stable_rising'
    elif project_type in ['renewable_energy']:
        return 'stable'
    else:
        return 'stable'

def analyze_factors(project_data: ProjectData) -> Dict[str, str]:
    """Analyze which factors have the most impact on valuation"""
    
    factors = {}
    
    # Analyze location impact
    if 'rainforest' in project_data.location.lower():
        factors['location'] = 'high impact'
    elif 'forest' in project_data.location.lower():
        factors['location'] = 'medium impact'
    else:
        factors['location'] = 'low impact'
    
    # Analyze project type impact
    if project_data.projectType.lower() in ['reforestation', 'conservation']:
        factors['projectType'] = 'high impact'
    else:
        factors['projectType'] = 'medium impact'
    
    # Analyze duration impact
    start_date = datetime.fromisoformat(str(project_data.startDate).split('T')[0])
    end_date = datetime.fromisoformat(str(project_data.endDate).split('T')[0])
    duration_years = (end_date - start_date).days / 365.25
    
    if duration_years > 20:
        factors['duration'] = 'high impact'
    elif duration_years > 10:
        factors['duration'] = 'medium impact'
    else:
        factors['duration'] = 'low impact'
    
    # Analyze scale impact
    if project_data.area > 5000:
        factors['scale'] = 'high impact'
    elif project_data.area > 1000:
        factors['scale'] = 'medium impact'
    else:
        factors['scale'] = 'low impact'
    
    return factors

def get_price_recommendation(project_data: ProjectData, model=None) -> Dict[str, Any]:
    """
    Get price recommendation for a token based on project data and market analysis
    
    Args:
        project_data: Project data
        model: ML model (if available)
        
    Returns:
        Price recommendation data
    """
    # Get AI prediction
    prediction = predict_carbon_value(project_data, model)
    
    # In a real implementation, we would fetch current market prices
    # For this MVP, we'll simulate market data
    average_market_price = 16.75
    
    # Blend AI prediction with market data (70% AI, 30% market)
    blended_price = (prediction.creditValue * 0.7) + (average_market_price * 0.3)
    
    return {
        "recommendedPrice": round(blended_price, 2),
        "aiPrediction": prediction.creditValue,
        "marketAverage": average_market_price,
        "confidence": prediction.confidence,
        "priceRange": prediction.priceRange,
        "marketTrend": prediction.marketTrend,
        "factors": prediction.factors
    }