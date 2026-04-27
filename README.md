# 🚀 AI Text Analysis Microservice

A high-performance text analysis microservice built with **Python** and **FastAPI**, designed to serve as a robust foundation for AI-driven applications and ready for seamless integration with Large Language Models (LLMs) like OpenAI, Anthropic, or open-source alternatives.

## ✨ Features

*   **Rule-Based Sentiment Analysis**: Simulates an AI model by analyzing text and returning `Positive`, `Negative`, or `Neutral` based on keywords.
*   **Dynamic Keyword Extraction**: Extracts relevant words from the user's input to mock AI entity recognition.
*   **CORS Enabled**: Configured with `CORSMiddleware` to accept cross-origin requests from any frontend application.
*   **Automatic Documentation**: Built-in Swagger UI and ReDoc, with an automatic redirect from the root (`/`) to `/docs`.
*   **Web Tester Included**: Comes with a built-in HTML/JS interface (`index.html`) to easily test the API directly from your browser.

## 🛠️ Technologies Used

*   **[FastAPI](https://fastapi.tiangolo.com/) & [Pydantic](https://docs.pydantic.dev/):** For high-performance API routing and data validation.
*   **[Uvicorn](https://www.uvicorn.org/):** The lightning-fast ASGI server.
*   **HTML/Vanilla JS**: For the simple frontend testing interface.

## ⚙️ Prerequisites

*   Python 3.8 or higher installed on your system.

## 🚀 Installation & Setup

1.  **Navigate to the project directory:**
    ```bash
    cd ai-fastapi-service
    ```

2.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On **macOS/Linux**: `source venv/bin/activate`
    *   On **Windows**: `venv\Scripts\activate`

4.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## 🏃‍♂️ Running the Server

Start the local development server with live reloading enabled:

```bash
uvicorn main:app --reload --port 8080
```

*   **Interactive API Docs (Swagger UI):** [http://127.0.0.1:8080/](http://127.0.0.1:8080/) (Redirects to `/docs`)
*   **Alternative API Docs (ReDoc):** [http://127.0.0.1:8080/redoc](http://127.0.0.1:8080/redoc)

## 🖥️ Frontend Web Tester

To test the API using a real user interface:
1. Ensure your FastAPI server is running.
2. Open the `index.html` file located in the root of this project directly in your web browser (by double-clicking it).
3. Type a sentence and click **Analizar ahora**. It connects directly to your local API using `fetch` thanks to the CORS setup!

## 🧪 Testing via API (cURL)

The core functionality is exposed through the `/analyze` endpoint.

**Request Payload (JSON):**
```json
{
  "text": "Este servicio es excelente y muy rápido."
}
```

**cURL Command Example:**
```bash
curl -X 'POST' \
  'http://127.0.0.1:8080/analyze' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "text": "Este servicio es excelente y muy rápido."
}'
```

**Expected Response (JSON):**
```json
{
  "sentiment": "Positive",
  "keywords": [
    "este",
    "servicio",
    "excelente"
  ],
  "status": "success"
}
```

> 💡 **Note:** The current `/analyze` endpoint simulates a 0.5-second processing delay to mimic real-world AI inference times. It uses a lightweight rule-based matching system for sentiment, which serves as a great placeholder before wiring it up to a real LLM.
