from pydantic import BaseModel
from typing import Optional, List, Dict


class FilterParams(BaseModel):
    session_id: str
    date_start: Optional[str] = None
    date_end: Optional[str] = None
    category: Optional[List[str]] = None
    sub_category: Optional[List[str]] = None
    market: Optional[List[str]] = None
    region: Optional[List[str]] = None
    segment: Optional[List[str]] = None
    ship_mode: Optional[List[str]] = None
    order_priority: Optional[List[str]] = None


class KPIData(BaseModel):
    total_sales: float
    total_profit: float
    profit_margin: float
    total_orders: int
    total_quantity: int
    avg_order_value: float
    total_shipping_cost: float
    avg_discount: float


class ChartData(BaseModel):
    chart_id: str
    title: str
    figure_json: str


class FilterOptions(BaseModel):
    categories: List[str]
    sub_categories: Dict[str, List[str]]
    markets: List[str]
    regions: Dict[str, List[str]]
    segments: List[str]
    ship_modes: List[str]
    order_priorities: List[str]
    date_range: Dict[str, str]


class UploadResponse(BaseModel):
    session_id: str
    kpis: KPIData
    charts: List[ChartData]
    filter_options: FilterOptions
    row_count: int


class DashboardResponse(BaseModel):
    kpis: KPIData
    charts: List[ChartData]
