
import { GoogleGenAI, Type } from "@google/genai";
import { Dataset } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAIResponse = async (prompt: string, dataset: Dataset, history: any[], businessContext: string = "") => {
  const model = 'gemini-3-flash-preview'; 
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const systemInstruction = `
    Eres "GPS Soporte IA", un asistente especializado en ayudar a los usuarios a utilizar la herramienta GPS Process Discovery.
    Tu objetivo no es solo analizar datos, sino guiar al usuario en el uso de la plataforma.
    
    FUNCIONES PRINCIPALES:
    1. Explicar cómo cargar datos (CSV).
    2. Explicar las visualizaciones (Mapa de Flujo, grosores de flecha, colores de nodos).
    3. Ayudar a configurar el "Smart Context" para mejores resultados.
    4. Guiar en la generación de reportes ejecutivos.
    
    CONTEXTO DEL PROCESO ACTUAL:
    - Proceso: "${dataset.name}"
    - Smart Context del usuario: "${businessContext || 'No definido'}"

    REGLAS:
    - Sé amable, pedagógico y directo.
    - Si el usuario pregunta algo técnico sobre el proceso, responde integrando cómo la herramienta lo visualiza.
    - Fomenta el uso de Smart Context para dar mejores insights.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "No pude generar una respuesta de soporte.";
  } catch (error) {
    console.error("Gemini Support Error:", error);
    return "Error de conexión con el motor de soporte IA.";
  }
};

export const generateExecutivePresentation = async (dataset: Dataset, customInstructions: string = "", template: string = "Standard") => {
  const model = 'gemini-3-pro-preview';
  
  const basePrompt = `
    Como consultor experto, genera un DECK EJECUTIVO de exactamente 5 slides para el proceso "${dataset.name}" usando el template: "${template}".
    
    DATOS CLAVE DEL PROCESO:
    - Eficiencia: ${dataset.stats.efficiency}%
    - Casos analizados: ${dataset.stats.cases}
    - Lead Time: ${dataset.stats.meanDuration}
    - ROI Potencial: ${dataset.stats.roi}
    - Mayores desperdicios: ${dataset.wastes.sort((a,b) => b.score - a.score).slice(0,3).map(w => w.category).join(', ')}

    ESTRUCTURA SEGÚN TEMPLATE "${template}":
    Slide 1: Título y Visión General.
    Slide 2: Diagnóstico de Eficiencia (Estado Actual).
    Slide 3: Análisis de Cuellos de Botella e Impacto Financiero.
    Slide 4: Plan de Acción y Recomendaciones Lean.
    Slide 5: Proyección de Resultados y ROI.

    ${customInstructions ? `INSTRUCCIONES ESPECIALES DEL USUARIO: "${customInstructions}"` : ""}

    Responde ESTRICTAMENTE en formato JSON con esta estructura:
    { "slides": [{ "title": "Título del Slide", "content": ["Punto clave 1", "Punto clave 2", "Punto clave 3"] }] }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: basePrompt }] }],
      config: { 
        responseMimeType: "application/json", 
        temperature: 0.4 
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating deck:", error);
    return { 
      slides: [{ 
        title: "Error de Generación", 
        content: ["Hubo un problema conectando con el motor de IA.", "Por favor, intenta nuevamente."] 
      }] 
    };
  }
};
