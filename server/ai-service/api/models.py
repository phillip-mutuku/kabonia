from pydantic import BaseModel, Field
from datetime import date
from typing import Dict, Any, List, Optional


class ProjectData(BaseModel):
    """
    Data model for carbon project information used for valuation
    """
    projectType: str = Field(..., description="Type of carbon project (reforestation, conservation, etc.)")
    area: float = Field(..., description="Area of the project in hectares")
    location: str = Field(..., description="Geographic location of the project")
    estimatedCarbonCapture: float = Field(..., description="Estimated carbon capture in tons of CO2")
    actualCarbonCapture: Optional[float] = Field(None, description="Verified carbon capture in tons of CO2")
    startDate: date = Field(..., description="Project start date")
    endDate: date = Field(..., description="Project end date")
    id: Optional[str] = Field(None, description="Project ID")
    name: Optional[str] = Field(None, description="Project name")
    description: Optional[str] = Field(None, description="Project description")


class PriceRangeData(BaseModel):
    """
    Data model for price range information
    """
    min: float = Field(..., description="Minimum recommended price")
    max: float = Field(..., description="Maximum recommended price")


class PredictionResponse(BaseModel):
    """
    Response model for carbon credit value prediction
    """
    creditValue: float = Field(..., description="Predicted value per carbon credit")
    confidence: float = Field(..., description="Confidence level of the prediction (0-1)")
    marketTrend: str = Field(..., description="Market trend (rising, stable, falling)")
    factors: Dict[str, str] = Field(..., description="Impact factors affecting the valuation")
    recommendedInitialPrice: float = Field(..., description="Recommended initial price for offering")
    priceRange: PriceRangeData = Field(..., description="Recommended price range")


class PriceHistoryItem(BaseModel):
    """
    Data model for price history item
    """
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    price: float = Field(..., description="Price on that date")


class PriceHistoryResponse(BaseModel):
    """
    Response model for price history
    """
    token_id: str = Field(..., description="Token ID")
    price_history: List[PriceHistoryItem] = Field(..., description="List of price history items")