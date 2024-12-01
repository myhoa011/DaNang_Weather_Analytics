from pydantic import BaseModel
from typing import List

class Centroid(BaseModel):
    cluster_name: str
    temp: float
    scaled_temp: float

    @classmethod
    def from_raw_data(cls, raw_data: dict) -> 'Centroid':
        return cls(
            cluster_name=raw_data.get("cluster_name"),  # Updated to match the attribute name
            scaled_temp=raw_data.get("scaled_temp"),
            temp=raw_data.get("temp")
        )
class CentroidsResponse(BaseModel):
    status: str
    data_cluster: List[Centroid]