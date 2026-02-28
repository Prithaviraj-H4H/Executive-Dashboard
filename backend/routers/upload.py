import uuid
import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import UploadResponse
from services.data_processor import load_and_validate, compute_kpis, get_filter_options, apply_filters, compute_sparklines
from services.chart_builder import build_all_charts

router = APIRouter()

# In-memory session store  { session_id: pd.DataFrame }
session_store: dict = {}


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are accepted.")

    contents = await file.read()

    try:
        df = load_and_validate(contents, file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    session_id = str(uuid.uuid4())
    session_store[session_id] = df

    return UploadResponse(
        session_id=session_id,
        kpis=compute_kpis(df),
        charts=build_all_charts(df),
        filter_options=get_filter_options(df),
        row_count=len(df),
        sparklines=compute_sparklines(df),
    )


@router.get("/export/{session_id}")
async def export_csv(session_id: str):
    df = session_store.get(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found. Please re-upload the file.")

    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dashboard_data.csv"},
    )
