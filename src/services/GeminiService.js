import { useState } from 'react';

// --- GLOBAL CONFIGURATION ---
// *** ¡CRÍTICO! REEMPLAZA EL TEXTO ENTRE COMILLAS CON TU CLAVE REAL DE GEMINI ***
const API_KEY = "AIzaSyAB5RqM7NmnSYvTnnSEnr5BmBltBtZrHl4"; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// JSON Schema for structured test questions
export const testSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            id: { type: "STRING", description: "Unique question identifier." },
            type: { type: "STRING", enum: ["mc", "write"], description: "Question type: 'mc' (Multiple Choice) or 'write' (Short Answer)." },
            question: { type: "STRING", description: "The question text." },
            options: { type: "ARRAY", items: { type: "STRING" }, description: "Options for MC questions (empty if 'write')." },
            correct_answer: { type: "STRING", description: "The correct answer or expected phrase/word." },
        },
        required: ["id", "type", "question", "correct_answer"],
    },
};

/**
 * Llama a la API de Gemini con reintentos y maneja la respuesta JSON estructurada.
 */
export const callGemini = async (systemPrompt, userQuery, responseSchema, maxRetries = 3) => {
    // Usamos la clave definida arriba
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
    
    if (API_KEY === "TU_CLAVE_DE_GEMINI_AQUÍ" || !API_KEY) {
        throw new Error("La clave de API de Gemini no está configurada o es incorrecta.");
    }

    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    };

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: generationConfig,
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Aquí es donde obtenemos el error 403 (Forbidden)
                throw new Error(`API error: ${response.statusText || response.status}`);
            }

            const result = await response.json();
            
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
                return JSON.parse(jsonText);
            }
            throw new Error("Respuesta de Gemini vacía o malformada.");

        } catch (error) {
            console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);
            if (attempt === maxRetries - 1) {
                console.error("Gemini call failed after all retries.");
                throw new Error("No se pudo obtener una respuesta de la IA. Inténtalo de nuevo más tarde.");
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
};