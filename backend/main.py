from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import portfolio, analytics, market_data, ml_insights

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Investment Hub API - Advanced portfolio analytics and ML insights",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(market_data.router, prefix="/api/v1/market", tags=["market"])
app.include_router(ml_insights.router, prefix="/api/v1/ml", tags=["ml-insights"])

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Investment Hub API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )