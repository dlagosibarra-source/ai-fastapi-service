import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Activity, AlertCircle, Loader2, Printer } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Anomaly {
  parametro: string;
  valor: string;
  estado: string;
  significancia_clinica: string;
}

interface AnalysisResult {
  tipo_estudio: string;
  analisis_general: string;
  anomalias: Anomaly[];
  clasificacion_urgencia: string;
  sugerencias: {
    especialista: string;
    estudios_adicionales: string[];
    literatura_cientifica: string[];
  };
}

const translations = {
  "Español": {
    appTitle: "Clinical AI Dashboard",
    admissionPanelTitle: "Panel de Admisión",
    admissionPanelDesc: "Ingresa los datos del paciente y sube los resultados de laboratorio.",
    ageLabel: "Edad",
    agePlaceholder: "Ej. 45",
    sexLabel: "Sexo",
    sexPlaceholder: "Selecciona",
    sexMale: "Masculino",
    sexFemale: "Femenino",
    languageLabel: "Idioma del Reporte",
    languagePlaceholder: "Selecciona",
    notesLabel: "Notas Clínicas",
    notesPlaceholder: "Síntomas relevantes, historial médico previo...",
    fileLabel: "Resultados de Laboratorio (PDF)",
    filePlaceholder: "Haz clic o arrastra para subir un PDF",
    alertNoFile: "Por favor, sube un documento PDF o imagen.",
    alertSize: "El archivo supera el límite de 5MB",
    analyzeButton: "Analizar Documento",
    analyzingButton: "Analizando documento...",
    resultsPanelTitle: "Panel de Resultados",
    resultsPanelDesc: "Resultados del análisis impulsado por IA.",
    printButton: "Imprimir Reporte",
    waitingMessage: "Esperando documento para análisis...",
    loadingMessage: "Analizando documento y traduciendo...",
    loadingMsg1: "Leyendo documento seguro...",
    loadingMsg2: "Procesando biomarcadores con IA...",
    loadingMsg3: "Generando reporte clínico...",
    loadingEstimation: "Este proceso toma alrededor de 15 segundos...",
    initialEvaluation: "Evaluación Inicial",
    generalAnalysis: "Análisis General",
    detectedAnomalies: "Anomalías Detectadas",
    paramCol: "Parámetro",
    valCol: "Valor",
    statusCol: "Estado",
    sigCol: "Significancia",
    noAnomalies: "No se detectaron anomalías significativas.",
    actionPlan: "Plan de Acción Recomendado",
    suggestedSpecialist: "Especialista Sugerido",
    additionalStudies: "Estudios Adicionales",
    scientificLiterature: "Literatura Científica de Referencia",
    serverError: "Error en el servidor:",
  },
  "English": {
    appTitle: "Clinical AI Dashboard",
    admissionPanelTitle: "Admission Panel",
    admissionPanelDesc: "Enter patient details and upload laboratory results.",
    ageLabel: "Age",
    agePlaceholder: "e.g. 45",
    sexLabel: "Sex",
    sexPlaceholder: "Select",
    sexMale: "Male",
    sexFemale: "Female",
    languageLabel: "Report Language",
    languagePlaceholder: "Select",
    notesLabel: "Clinical Notes",
    notesPlaceholder: "Relevant symptoms, prior medical history...",
    fileLabel: "Laboratory Results (PDF/Image)",
    filePlaceholder: "Click or drag to upload",
    alertNoFile: "Please upload a PDF or image document.",
    alertSize: "File size exceeds the 5MB limit.",
    analyzeButton: "Analyze Document",
    analyzingButton: "Analyzing document...",
    resultsPanelTitle: "Results Panel",
    resultsPanelDesc: "AI-powered analysis results.",
    printButton: "Print Report",
    waitingMessage: "Waiting for document to analyze...",
    loadingMessage: "Analyzing document and translating...",
    loadingMsg1: "Reading document securely...",
    loadingMsg2: "Processing biomarkers with AI...",
    loadingMsg3: "Generating clinical report...",
    loadingEstimation: "This process takes about 15 seconds...",
    initialEvaluation: "Initial Evaluation",
    generalAnalysis: "General Analysis",
    detectedAnomalies: "Detected Anomalies",
    paramCol: "Parameter",
    valCol: "Value",
    statusCol: "Status",
    sigCol: "Significance",
    noAnomalies: "No significant anomalies detected.",
    actionPlan: "Recommended Action Plan",
    suggestedSpecialist: "Suggested Specialist",
    additionalStudies: "Additional Studies",
    scientificLiterature: "Scientific Literature Reference",
    serverError: "Server error:",
  }
};

export default function App() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [language, setLanguage] = useState("Español");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations] || translations["Español"];
  const loadingMessages = [t.loadingMsg1, t.loadingMsg2, t.loadingMsg3];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, loadingMessages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    // Validamos que haya un archivo
    if (!file) {
      alert(t.alertNoFile);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t.alertSize);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Armamos la caja de datos exactamente con las etiquetas que espera FastAPI
    const formData = new FormData();
    formData.append("age", age.toString());
    formData.append("sex", sex);
    formData.append("language", language);
    formData.append("clinical_notes", notes); // Ajustado al nombre del estado 'notes'
    formData.append("file", file); // El archivo adjunto

    try {
      // Hacemos la llamada al backend
      const response = await fetch("http://127.0.0.1:8080/analyze-lab", {
        method: "POST",
        body: formData,
        // ⚠️ REGLA DE ORO FULL STACK: 
        // NUNCA pongas "Content-Type": "multipart/form-data" aquí. 
        // El navegador debe hacerlo automáticamente para no romper el archivo.
      });

      if (!response.ok) {
        throw new Error(`${t.serverError} ${response.status}`);
      }

      const data = await response.json();
      setResult(data); // Guardamos el JSON mágico en el estado de React

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (classification: string) => {
    if (!classification) return "default";
    const lower = classification.toLowerCase();
    if (lower.includes("alta") || lower.includes("crítica")) return "destructive";
    if (lower.includes("media") || lower.includes("moderada")) return "default";
    return "secondary";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center space-x-3 mb-8">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.appTitle}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Panel de Admisión */}
          <Card className="shadow-sm border-slate-200 print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.admissionPanelTitle}
              </CardTitle>
              <CardDescription>
                {t.admissionPanelDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">{t.ageLabel}</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder={t.agePlaceholder}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">{t.sexLabel}</Label>
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder={t.sexPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">{t.sexMale}</SelectItem>
                      <SelectItem value="femenino">{t.sexFemale}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t.languageLabel}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder={t.languagePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Español">Español</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t.notesLabel}</Label>
                <Textarea
                  id="notes"
                  placeholder={t.notesPlaceholder}
                  className="min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">{t.fileLabel}</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                      <p className="mb-2 text-sm text-slate-500 font-medium">
                        {file ? file.name : t.filePlaceholder}
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf, image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t.analyzingButton}
                  </>
                ) : (
                  t.analyzeButton
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Columna Derecha: Panel de Resultados */}
          <Card className="shadow-sm border-slate-200 bg-white print:w-full print:col-span-2 print:border-none print:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t.resultsPanelTitle}
                </CardTitle>
                <CardDescription>
                  {t.resultsPanelDesc}
                </CardDescription>
              </div>
              {result && !loading && (
                <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-2 print:hidden">
                  <Printer className="w-4 h-4" />
                  {t.printButton}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!loading && !result && (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                  <FileText className="w-12 h-12 mb-4 opacity-50" />
                  <p>{t.waitingMessage}</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-[400px] space-y-6">
                  <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-slate-700 animate-pulse transition-all duration-500">
                      {loadingMessages[loadingStep]}
                    </p>
                    <p className="text-sm text-slate-400">
                      {t.loadingEstimation}
                    </p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <ScrollArea className="h-[500px] pr-4 print:h-auto print:overflow-visible">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800">{t.initialEvaluation}</h3>
                      <Badge variant={getUrgencyColor(result.clasificacion_urgencia) as any} className="text-sm px-3 py-1">
                        {result.clasificacion_urgencia}
                      </Badge>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">{t.generalAnalysis}</h4>
                      <p className="text-slate-700 leading-relaxed text-sm">
                        {result.analisis_general}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wider">{t.detectedAnomalies}</h4>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>{t.paramCol}</TableHead>
                              <TableHead>{t.valCol}</TableHead>
                              <TableHead>{t.statusCol}</TableHead>
                              <TableHead>{t.sigCol}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.anomalias && result.anomalias.length > 0 ? (
                              result.anomalias.map((anomaly, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{anomaly.parametro}</TableCell>
                                  <TableCell>{anomaly.valor}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={anomaly.estado.toLowerCase().includes('alto') ? 'text-red-600 border-red-200 bg-red-50' : anomaly.estado.toLowerCase().includes('bajo') ? 'text-orange-600 border-orange-200 bg-orange-50' : ''}>
                                      {anomaly.estado}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-slate-600 text-sm">{anomaly.significancia_clinica}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                                  {t.noAnomalies}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {result.sugerencias && (
                      <div className="mt-8">
                        <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wider">{t.actionPlan}</h4>
                        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                          <div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.suggestedSpecialist}</span>
                            <p className="text-slate-800 font-medium mt-1 text-base">{result.sugerencias.especialista}</p>
                          </div>

                          {result.sugerencias.estudios_adicionales && result.sugerencias.estudios_adicionales.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">{t.additionalStudies}</span>
                              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                                {result.sugerencias.estudios_adicionales.map((estudio, i) => (
                                  <li key={i}>{estudio}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {result.sugerencias.literatura_cientifica && result.sugerencias.literatura_cientifica.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-wider">{t.scientificLiterature}</span>
                              <ul className="text-xs text-slate-500 space-y-1.5">
                                {result.sugerencias.literatura_cientifica.map((lit, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-slate-300 mt-0.5">•</span>
                                    <span className="leading-relaxed">{lit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
