from fastapi import FastAPI, UploadFile, File
from PIL import Image
from transformers import pipeline
import io

app = FastAPI(title="JanaSeva AI Service")


# Load AI model
classifier = pipeline(
    "zero-shot-image-classification",
    model="openai/clip-vit-base-patch32"
)


# Possible civic issue types
ISSUE_LABELS = [
    "a photo of a pothole",
    "a photo of a damaged road",
    "a photo of a broken street light",
    "a photo of water leakage",
    "a photo of garbage or dumped waste",
    "a photo of a drainage problem",
    "a photo of a damaged traffic signal",
    "a photo of an electricity problem"
]


# Convert AI labels into application issue names
LABEL_MAPPING = {
    "a photo of a pothole": "Pothole",
    "a photo of a damaged road": "Damaged Road",
    "a photo of a broken street light": "Broken Street Light",
    "a photo of water leakage": "Water Leakage",
    "a photo of garbage or dumped waste": "Garbage",
    "a photo of a drainage problem": "Drainage Problem",
    "a photo of a damaged traffic signal": "Traffic Signal Problem",
    "a photo of an electricity problem": "Electricity Problem"
}


@app.get("/")
def home():
    return {
        "success": True,
        "message": "JanaSeva AI Service is running"
    }


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):

    try:

        # Read uploaded image
        image_data = await file.read()

        # Convert image to RGB
        image = Image.open(
            io.BytesIO(image_data)
        ).convert("RGB")


        # Run AI classification
        results = classifier(
            image,
            candidate_labels=ISSUE_LABELS
        )


        # Get highest probability prediction
        prediction = results[0]


        # Get detected issue
        detected_label = prediction["label"]

        issue = LABEL_MAPPING[detected_label]


        # Convert confidence to percentage
        confidence = round(
            prediction["score"] * 100,
            2
        )


        # Confidence threshold
        # Below 70% = needs human/admin review
        if confidence < 70:

            return {
                "success": True,
                "issue": "Needs Review",
                "confidence": confidence,
                "original_prediction": issue
            }


        # High-confidence prediction
        return {
            "success": True,
            "issue": issue,
            "confidence": confidence
        }


    except Exception as error:

        print("AI ERROR:", error)

        return {
            "success": False,
            "message": "Image analysis failed"
        }