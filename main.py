import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

# Initialize FastAPI application with metadata
app = FastAPI(
    title="AI FastAPI Service",
    description="A service for analyzing text sentiment and extracting keywords.",
    version="1.0.0"
)

# Define the request model using Pydantic
class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="The text to be analyzed")

# Define the response model
class AnalyzeResponse(BaseModel):
    sentiment: str = Field(..., description="The sentiment of the text")
    keywords: list[str] = Field(..., description="Extracted keywords from the text")

@app.get("/")
async def root():
    # Redirige automáticamente a la documentación
    return RedirectResponse(url="/docs")

@app.post("/analyze", response_model=AnalyzeResponse, summary="Analyze text")
async def analyze_text(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyzes the provided text to determine its sentiment and extract keywords.
    
    - **text**: The input string to analyze (must not be empty).
    """
    try:
        # Simulate processing latency (e.g., calling an AI model)
        await asyncio.sleep(0.5)
        
        # Simulated analysis logic
        # In a real-world scenario, this would call an ML model or external AI service
        mock_sentiment = "Positive"
        mock_keywords = ["fastapi", "python", "async"]
        
        return AnalyzeResponse(
            sentiment=mock_sentiment,
            keywords=mock_keywords
        )
    except Exception as e:
        # Proper error handling for unexpected issues
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
