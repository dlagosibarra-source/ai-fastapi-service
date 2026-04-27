# 🚀 AI Text Analysis Microservice

A high-performance text analysis microservice built with **Python** and **FastAPI**, designed to serve as a robust foundation for AI-driven applications and ready for seamless integration with Large Language Models (LLMs) like OpenAI, Anthropic, or open-source alternatives.

## 🛠️ Technologies Used

*   **[FastAPI](https://fastapi.tiangolo.com/):** A modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints.
*   **[Pydantic](https://docs.pydantic.dev/):** Data validation and settings management using Python type annotations.
*   **[Uvicorn](https://www.uvicorn.org/):** A lightning-fast ASGI server implementation, used to run the application.
*   **[Python](https://www.python.org/):** The core programming language powering the service.

## ⚙️ Prerequisites

*   Python 3.8 or higher installed on your system.

## 🚀 Installation & Setup

Follow these steps to set up your local development environment using a virtual environment.

1.  **Navigate to the project directory:**
    ```bash
    cd ai-fastapi-service
    ```

2.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On **macOS/Linux**:
        ```bash
        source venv/bin/activate
        ```
    *   On **Windows**:
        ```bash
        venv\Scripts\activate
        ```

4.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## 🏃‍♂️ Running the Server

Start the local development server with live reloading enabled. This is perfect for development!

```bash
uvicorn main:app --reload --port 8080
```
*(Note: If you run it without `--port 8080`, it will default to port 8000)*

Once the server is running, you can explore the automatically generated interactive API documentation:
*   **Swagger UI:** [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)
*   **ReDoc:** [http://127.0.0.1:8080/redoc](http://127.0.0.1:8080/redoc)

## 🧪 Testing the Endpoint

The core functionality of this microservice is exposed through the `/analyze` endpoint.

### `POST /analyze`

**Request Payload (JSON):**

```json
{
  "text": "FastAPI makes it incredibly easy to build modern and fast web APIs."
}
```

**cURL Command Example:**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8080/analyze' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "text": "FastAPI makes it incredibly easy to build modern and fast web APIs."
}'
```

**Expected Response (JSON):**

```json
{
  "sentiment": "Positive",
  "keywords": [
    "fastapi",
    "python",
    "async"
  ]
}
```

> 💡 **Note:** The current `/analyze` endpoint simulates a 0.5-second processing delay to mimic real-world AI inference times and returns a mock response. It is fully prepared to be wired up to an actual LLM service in the next development phase.
