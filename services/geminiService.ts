
import { GoogleGenAI, Type } from "@google/genai";
import { Dataset } from "../types";

// Always use process.env.API_KEY directly in the initialization object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIResponse = async (prompt: string, dataset: Dataset, history: any[], businessContext: string = "") => {
  const model = 'gemini-3-flash-preview'; 
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const systemInstruction = `
    Eres un experto en propuestas de negocio y mejora de procesos con enfoque Lean y experto en marketing.
    Tu función es actuar como el motor analítico de GPS Process Discovery.
    
    DIRECTRICES DE COMUNICACIÓN:
    1. Información Factual: Usa exclusivamente datos del dataset y contexto proporcionado.
    2. Tono Formal y Estructurado: Emplea un lenguaje técnico, preciso y profesional.
    3. Comportamientos Observables: En lugar de usar adjetivos subjetivos, describe acciones y resultados medibles (ej. "el proceso se detiene en X" en lugar de "el proceso es lento").
    4. Sin Creatividad No Solicitada: No inventes datos ni propongas escenarios hipotéticos fuera del análisis de procesos.
    5. Terminología Lean: Aplica conceptos como Desperdicio (Muda), Valor Agregado, Lead Time y Cuellos de Botella de forma técnica.

    CONTEXTO OPERATIVO:
    - Proceso Analizado: "${dataset.name}"
    - Contexto de Negocio (Smart Context): "${businessContext || 'No definido'}"
    - Datos Estadísticos: Eficiencia ${dataset.stats.efficiency}%, Casos: ${dataset.stats.cases}, Duración Media: ${dataset.stats.meanDuration}.

    REGLA DE ORO: Evita el uso excesivo de adjetivos. Prioriza la estructura: Dato -> Impacto Observado -> Acción Recomendada.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.2, // Reducida para asegurar consistencia factual
      },
    });

    return response.text || "Error: No se pudo generar una respuesta basada en datos.";
  } catch (error) {
    console.error("Gemini Support Error:", error);
    return "Error de conexión con el motor analítico.";
  }
};

export const generateExecutivePresentation = async (dataset: Dataset, customInstructions: string = "", template: string = "Standard") => {
  const model = 'gemini-3-pro-preview';
  
  const basePrompt = `
    Como consultor experto en Lean y Marketing Estratégico, genera un reporte ejecutivo estructurado de 5 slides para el proceso "${dataset.name}".
    
    RESTRICCIONES DE ESTILO:
    - Solo información factual.
    - Sin adjetivos excesivos.
    - Foco en comportamientos observables y métricas.
    - Tono formal y estructurado.

    DATOS DEL DATASET:
    - Eficiencia: ${dataset.stats.efficiency}%
    - Casos: ${dataset.stats.cases}
    - Lead Time: ${dataset.stats.meanDuration}
    - ROI: ${dataset.stats.roi}
    - Desperdicios identificados: ${dataset.wastes.sort((a,b) => b.score - a.score).slice(0,3).map(w => w.category).join(', ')}

    ESTRUCTURA TÉCNICA REQUERIDA:
    Slide 1: Título del Proyecto y Resumen de Métricas Base.
    Slide 2: Estado Actual: Identificación de Desperdicios (Muda) Observados.
    Slide 3: Cuellos de Botella: Impacto en el Lead Time y Eficiencia.
    Slide 4: Estrategia de Mejora: Acciones Lean Específicas.
    Slide 5: Proyección Factual de ROI y Plan de Seguimiento.

    ${customInstructions ? `INSTRUCCIONES ADICIONALES: "${customInstructions}"` : ""}

    Responde ESTRICTAMENTE en formato JSON:
    { "slides": [{ "title": "Título Factual", "content": ["Punto técnico 1", "Punto técnico 2", "Punto técnico 3"] }] }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: basePrompt }] }],
      config: { 
        responseMimeType: "application/json", 
        temperature: 0.1 // Mínima aleatoriedad para máxima precisión factual
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating deck:", error);
    return { 
      slides: [{ 
        title: "Error de Análisis", 
        content: ["El motor analítico no pudo procesar los datos actuales.", "Verifique la integridad del dataset."] 
      }] 
    };
  }
};
