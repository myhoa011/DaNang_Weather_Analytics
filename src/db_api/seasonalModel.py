from pydantic import BaseModel
from datetime import datetime

class SeasonalRecord(BaseModel):
    dt: datetime
    
    observed_temp: float
    trend_temp: float
    seasonal_temp: float
    residual_temp: float
    
    observed_pressure: float
    trend_pressure: float
    seasonal_pressure: float
    residual_pressure: float
    
    observed_humidity: float
    trend_humidity: float
    seasonal_humidity: float
    residual_humidity: float
    
    observed_clouds: float
    trend_clouds: float
    seasonal_clouds: float
    residual_clouds: float
    
    observed_visibility: float
    trend_visibility: float
    seasonal_visibility: float
    residual_visibility: float
    
    observed_wind_speed: float
    trend_wind_speed: float
    seasonal_wind_speed: float
    residual_wind_speed: float
    
    observed_wind_deg: float
    trend_wind_deg: float
    seasonal_wind_deg: float
    residual_wind_deg: float
    
    @classmethod
    def from_raw_data(cls, raw_data: dict) -> 'SeasonalRecord':
        return cls(
            dt= raw_data.get("dt"),
            
            observed_temp= raw_data.get("observed_temp"),
            trend_temp= raw_data.get("trend_temp"),
            seasonal_temp= raw_data.get("seasonal_temp"),
            residual_temp= raw_data.get("residual_temp"),
            
            observed_pressure= raw_data.get("observed_pressure"),
            trend_pressure= raw_data.get("trend_pressure"),
            seasonal_pressure= raw_data.get("seasonal_pressure"),
            residual_pressure= raw_data.get("residual_pressure"),
            
            observed_humidity= raw_data.get("observed_humidity"),
            trend_humidity= raw_data.get("trend_humidity"),
            seasonal_humidity= raw_data.get("seasonal_humidity"),
            residual_humidity= raw_data.get("residual_humidity"),
            
            observed_clouds= raw_data.get("observed_clouds"),
            trend_clouds= raw_data.get("trend_clouds"),
            seasonal_clouds= raw_data.get("seasonal_clouds"),
            residual_clouds= raw_data.get("residual_clouds"),
            
            observed_visibility=raw_data.get("observed_visibility"),
            trend_visibility=raw_data.get("trend_visibility"),
            seasonal_visibility=raw_data.get("seasonal_visibility"),
            residual_visibility=raw_data.get("residual_visibility"),
            
            observed_wind_speed = raw_data.get("observed_wind_speed"),
            trend_wind_speed = raw_data.get("trend_wind_speed"),
            seasonal_wind_speed = raw_data.get("seasonal_wind_speed"),
            residual_wind_speed = raw_data.get("residual_wind_speed"),
            
            observed_wind_deg = raw_data.get("observed_wind_deg"),
            trend_wind_deg = raw_data.get("trend_wind_deg"),
            seasonal_wind_deg = raw_data.get("seasonal_wind_deg"),
            residual_wind_deg = raw_data.get("residual_wind_deg"),
            
        )
        
        