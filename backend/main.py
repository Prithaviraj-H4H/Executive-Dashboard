from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, dashboard, chart
import os

app = FastAPI(title="Executive BI Dashboard API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(chart.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "Executive Dashboard API is running"}
