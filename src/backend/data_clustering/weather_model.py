from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WeatherData(BaseModel):
    temp: float  
    pressure: int
    humidity: int
    clouds: int
    visibility: Optional[int]
    wind_speed: float
    wind_deg: int

    def get_formatted_time(self) -> str:
        return datetime.fromtimestamp(self.dt).strftime("%Y-%m-%d %H:%M:%S")
    
    @classmethod
    def from_raw_data(cls, raw_data: dict) -> 'WeatherData':
        return cls(
            dt=raw_data.get("dt"),
            temp=raw_data.get("temp"),
            pressure=raw_data.get("pressure"), 
            humidity=raw_data.get("humidity"),
            clouds=raw_data.get("clouds"),
            visibility=raw_data.get("visibility"),  
            wind_speed=raw_data.get("wind_speed"),
            wind_deg=raw_data.get("wind_deg")
        )


class ClusterData(BaseModel):
    dt: int
    temp: float  
    pressure: int
    humidity: int
    clouds: int
    visibility: Optional[int]
    wind_speed: float
    wind_deg: int
    date: datetime
    month: int 
    scaled_temp: float
    kmean_label: int
    custom_label: int
    

    def get_formatted_time(self) -> str:
        return datetime.fromtimestamp(self.dt).strftime("%Y-%m-%d %H:%M:%S")
    
    @classmethod
    def from_raw_data(cls, raw_data: dict) -> 'ClusterData':
        return cls(
            dt=raw_data.get("dt"),
            temp=raw_data.get("temp"),
            pressure=raw_data.get("pressure"), 
            humidity=raw_data.get("humidity"),
            clouds=raw_data.get("clouds"),
            visibility=raw_data.get("visibility"),  
            wind_speed=raw_data.get("wind_speed"),
            wind_deg=raw_data.get("wind_deg"),
            date=raw_data.get("date"),
            month=raw_data.get("month"),
            scaled_temp=raw_data.get("scaled_temp"),
            kmean_label=raw_data.get("kmean_label"),
            custom_label=raw_data.get("custom_label")
        )