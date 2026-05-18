from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

# 1. Cargar la llave secreta desde el archivo .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("¡Alerta! No se encontró GEMINI_API_KEY en el archivo .env")

# 2. Configurar la conexión con Google Gemini
genai.configure(api_key=GEMINI_API_KEY)

# 3. El "Cerebro" que diseñamos
instrucciones_sistema = """
Eres un "Analista Clínico y Médico Internista Experto", un sistema avanzado de Inteligencia Artificial diseñado para procesar e interpretar resultados de laboratorio.
REGLAS ESTRICTAS:
1. Precisión Demográfica: Evalúa cada parámetro usando los rangos de referencia estrictos para la edad y el sexo biológico proporcionados.
2. Correlación: Relaciona los hallazgos de laboratorio con los síntomas clínicos.
3. Seguridad Clínica: Si un valor es alarmante, clasifícalo como "Urgente".
4. Formato: Tu respuesta debe ser ÚNICA Y EXCLUSIVAMENTE un objeto JSON válido con la estructura solicitada.
"""

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    system_instruction=instrucciones_sistema,
    generation_config={"response_mime_type": "application/json"}
)

# 4. Configurar el Servidor FastAPI
app = FastAPI(title="Clinical AI Agent", description="API de análisis médico multimodal")

# --- CONFIGURACIÓN CORS BLINDADA ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # El puerto por defecto de Vite
        "http://127.0.0.1:5173"    # Variante de localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Clinical AI Agent is running. Go to /docs to test it."}

# 5. La Puerta de Entrada para las muestras médicas
@app.post("/analyze-lab")
async def analyze_lab(
    age: int = Form(...),
    sex: str = Form(...),
    clinical_notes: str = Form(...),
    language: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        contenido_archivo = await file.read()
        documento = [
            {
                "mime_type": file.content_type,
                "data": contenido_archivo
            }
        ]
        
        prompt_usuario = f"""
        Datos del Paciente:
        - Edad: {age} años
        - Sexo: {sex}
        - Notas Clínicas: {clinical_notes}
        
        Instrucción:
        Analiza el documento adjunto y los datos del paciente. Devuelve el análisis en este formato JSON exacto:
        {{
          "tipo_estudio": "...",
          "analisis_general": "...",
          "anomalias": [
            {{"parametro": "...", "valor": "...", "estado": "Alto/Bajo", "significancia_clinica": "..."}}
          ],
          "clasificacion_urgencia": "...",
          "sugerencias": {{"especialista": "...", "estudios_adicionales": [], "literatura_cientifica": []}}
        }}
        
        IMPORTANTE: Analiza el documento sin importar su idioma original, pero TODO el JSON de respuesta DEBE estar obligatoriamente traducido y redactado en este idioma: {language}
        REGLA CRÍTICA: TRADUCE LOS VALORES AL IDIOMA {language}, PERO MANTÉN LAS CLAVES DEL JSON EXACTAMENTE EN ESPAÑOL COMO SE DEFINIERON EN EL FORMATO. NUNCA TRADUZCAS LAS CLAVES DEL JSON (ej. mantén "anomalias", "analisis_general").
        """
        
        respuesta = model.generate_content([prompt_usuario, documento[0]])
        texto_limpio = respuesta.text.replace('```json', '').replace('```', '').strip()
        return json.loads(texto_limpio)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))