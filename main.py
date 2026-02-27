from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import subprocess
import json
import math
import os

app = FastAPI(title="Let's Go! Backend API")

# Update CORS for production (frontend domain) and local development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Add your Vercel frontend URL here once deployed:
    # "https://lets-go-frontend.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For Railway, it's often easiest to allow all or specify the exact Vercel origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # This ensures CORS headers are returned even on unhandled 500 errors!
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "details": str(exc)},
    )

@app.on_event("startup")
def startup_event():
    # Force install the chromium browser on startup to guarantee it exists 
    # regardless of whether Railway uses Docker or Nixpacks.
    print("Ensuring Playwright Chromium is installed...")
    os.system("playwright install chromium")

class ScrapeRequest(BaseModel):
    city: str
    category: str
    mood: Optional[str] = None
    userLat: Optional[float] = None
    userLng: Optional[float] = None

@app.get("/")
def read_root():
    return {"status": "Let's Go! API is running"}

@app.post("/api/scrape")
async def scrape_google_maps(req: ScrapeRequest):
    if not req.city or not req.category:
        raise HTTPException(status_code=400, detail="City and category are required")

    query = f"{req.mood} {req.category}" if req.mood else req.category
    scraper_path = os.path.join(os.path.dirname(__file__), "scraper.py")
    
    args = ["python3", scraper_path, query, req.city, "--max", "5"]
    
    if req.mood:
        args.extend(["--mood", req.mood])
    if req.userLat is not None:
        args.extend(["--lat", str(req.userLat)])
    if req.userLng is not None:
        args.extend(["--lng", str(req.userLng)])

    try:
        # Run the Playwright scraper script
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            print("Scraper stderr:", result.stderr)
            raise Exception(f"Scraper failed with code {result.returncode}")
            
        # Parse the JSON output from the scraper
        data = json.loads(result.stdout)
        return data

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Scraping timed out")
    except json.JSONDecodeError:
        print("Raw output:", result.stdout)
        raise HTTPException(status_code=500, detail="Failed to parse scraper output")
    except Exception as e:
        print(f"Scrape error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Make sure to bind to 0.0.0.0 and use the PORT environment variable for Railway
    port = int(os.getenv("PORT", 3001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
