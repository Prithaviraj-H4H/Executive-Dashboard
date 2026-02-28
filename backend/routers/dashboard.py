from fastapi import APIRouter, HTTPException
from models.schemas import FilterParams, DashboardResponse
from services.data_processor import apply_filters, compute_kpis, compute_sparklines
from services.chart_builder import build_all_charts
from routers.upload import session_store

router = APIRouter()


@router.post("/dashboard", response_model=DashboardResponse)
async def get_dashboard(params: FilterParams):
    df = session_store.get(params.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found. Please re-upload the file.")

    filters = params.model_dump(exclude={"session_id"})
    filtered_df = apply_filters(df.copy(), filters)

    if len(filtered_df) == 0:
        raise HTTPException(status_code=422, detail="No data matches the selected filters.")

    return DashboardResponse(
        kpis=compute_kpis(filtered_df),
        charts=build_all_charts(filtered_df),
        sparklines=compute_sparklines(filtered_df),
    )
