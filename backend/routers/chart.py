from fastapi import APIRouter, HTTPException
from models.schemas import ChartRequest, ChartData
from services.data_processor import apply_filters
from services.chart_builder import build_single_chart
from routers.upload import session_store

router = APIRouter()


@router.post("/chart", response_model=ChartData)
async def get_single_chart(request: ChartRequest):
    df = session_store.get(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found. Please re-upload the file.")

    filters = request.model_dump(exclude={"session_id", "chart_id", "options"})
    filtered_df = apply_filters(df.copy(), filters)

    if len(filtered_df) == 0:
        raise HTTPException(status_code=422, detail="No data matches the selected filters.")

    try:
        return build_single_chart(filtered_df, request.chart_id, request.options or {})
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
