from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CorrelationRecord(BaseModel):
    temp: float  
    pressure: float
    humidity: float
    clouds: float
    visibility: Optional[float]
    wind_speed: float
    wind_deg: float
    
    @classmethod
    def from_raw_data(cls, raw_data: dict) -> 'CorrelationRecord':
        return cls(
            temp=raw_data.get("temp"),
            pressure=raw_data.get("pressure"), 
            humidity=raw_data.get("humidity"),
            clouds=raw_data.get("clouds"),
            visibility=raw_data.get("visibility"),
            wind_speed=raw_data.get("wind_speed"),
            wind_deg=raw_data.get("wind_deg")
        )