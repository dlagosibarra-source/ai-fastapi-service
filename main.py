import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Initialize FastAPI application with metadata
app = FastAPI(
    title="AI FastAPI Service",
    description="A service for analyzing text sentiment and extracting keywords.",
    version="1.0.0"
)

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite que cualquier sitio le pida datos
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request model using Pydantic
class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="The text to be analyzed")

# Define the response model
class AnalyzeResponse(BaseModel):
    sentiment: str = Field(..., description="The sentiment of the text")
    keywords: list[str] = Field(..., description="Extracted keywords from the text")
    status: str = Field(default="success", description="Status of the analysis")

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
        
        # Simple rule-based logic to simulate real AI analysis
        text_lower = request.text.lower()
        palabras_negativas = ["malo", "mal", "horrible", "triste", "odio", "feo", "pésimo", "pesimo", "terrible", "peor", "asco"]
        palabras_positivas = ["bueno", "bien", "feliz", "excelente", "amor", "bonito", "genial", "increíble", "increible", "mejor"]
        
        sentiment = "Neutral"
        if any(word in text_lower for word in palabras_negativas):
            sentiment = "Negative"
        elif any(word in text_lower for word in palabras_positivas):
            sentiment = "Positive"
            
        # Extract simplistic keywords based on the words typed
        words = [w for w in text_lower.split() if len(w) > 3]
        mock_keywords = words[:3] if words else ["demo", "api", "realtime"]
        
        return AnalyzeResponse(
            sentiment=sentiment,
            keywords=mock_keywords,
            status="success"
        )
    except Exception as e:
        # Proper error handling for unexpected issues
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
