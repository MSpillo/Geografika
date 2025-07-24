from fastapi import FastAPI, HTTPException, Request, Query
import json
import random
from fastapi.middleware.cors import CORSMiddleware
import re
from rapidfuzz import fuzz
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the absolute path to the project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load countries data
with open(os.path.join(BASE_DIR, "data", "countries.json"), "r") as f:
    data = json.load(f)

def normalize_string(text: str) -> str:
    """Removes punctuation and converts to lowercase for flexible comparison."""
    # Remove punctuation and convert to lowercase
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text).lower()
    # Normalize spaces (replace multiple spaces with a single one, strip leading/trailing spaces)
    text = ' '.join(text.split())
    return text

@app.get("/quiz")
async def get_quiz(continents: str = Query(...)):
    continent_list = [c.strip() for c in continents.split(',')]
    continent_countries = [c for c in data["countries"] if c["continent"] in continent_list]
    if not continent_countries:
        raise HTTPException(status_code=404, detail="No countries found for these continents")
    country = random.choice(continent_countries)
    response = {
        "country": country["name"],
        "capital": country["capital"],
        "facts": {
            "Population": f"{country['population']:,}",
            "Average age": country["average_age"],
            "Gender ratio": f"{country['male_percentage']}% male, {country['female_percentage']}% female",
            "Average income": f"${country['average_income']:,}",
            "Main language": country.get("main_language"),
            "Famous celebrity": country.get("famous_celebrity"),
            "Famous celebrity image": country.get("famous_celebrity_image"),
            "Surface area": country.get("surface_area_km2")
        },
        "celebrity_type": country.get("celebrity_type"),
        "flag_image": country.get("flag_image"),
        "tough": country.get("tough", False)
    }
    return response

@app.post("/check-answer")
async def check_answer(request: Request):
    data_json = await request.json()
    country = data_json.get("country")
    answer = data_json.get("answer")
    country_data = next((c for c in data["countries"] if c["name"].lower() == country.lower()), None)
    if not country_data:
        raise HTTPException(status_code=404, detail="Country not found")

    normalized_answer = normalize_string(answer)
    
    correct_capitals = country_data["capital"]
    if not isinstance(correct_capitals, list):
        # If capital is not a list, put it in a list for consistent processing
        correct_capitals = [correct_capitals]

    is_correct = False
    # Iterate through all acceptable capitals for the country
    for correct_capital in correct_capitals:
        normalized_correct_capital = normalize_string(correct_capital)
        # Use fuzzy matching to allow for minor typos
        # You can adjust the threshold (e.g., 80, 85, 90) based on desired strictness
        similarity_score = fuzz.ratio(normalized_answer, normalized_correct_capital)
        if similarity_score > 85:
            is_correct = True
            break # No need to check other capitals if one matches

    # Return the primary capital for display purposes (the first one in the list or the original string)
    display_correct_answer = country_data["capital"]
    if isinstance(display_correct_answer, list):
        display_correct_answer = display_correct_answer[0]

    # Now, send the entire capital_curiosities object
    return {
        "is_correct": is_correct,
        "correct_answer": display_correct_answer,
        "tough": country_data.get("tough", False),
        "capital_curiosities": country_data.get("capital_curiosities", {}),
        "latitude": country_data["capital_curiosities"].get("Latitude"),
        "longitude": country_data["capital_curiosities"].get("Longitude")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)