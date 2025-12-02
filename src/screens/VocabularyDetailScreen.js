// screens/VocabularyDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech'; 

import { callGemini } from '../services/GeminiService';

// --- ESQUEMA DE JSON PARA VOCABULARIO ---
const vocabSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            infinitive: { type: "STRING", description: "Forma infinitiva del verbo." },
            simple_past: { type: "STRING", description: "Pasado simple." },
            past_participle: { type: "STRING", description: "Participio pasado." },
            spanish: { type: "STRING", description: "Traducción al español." },
            example: { type: "STRING", description: "Oración de ejemplo en inglés." },
        },
        required: ["infinitive", "simple_past", "past_participle", "spanish", "example"],
    },
};

// Componente de Cabecera de Columna
const HeaderText = ({ text, flex }) => (
    <Text style={[styles.tableHeaderCell, { flex }]}>{text}</Text>
);

// Componente para una fila de verbo
const VerbRow = ({ verb, category, columnWeights }) => {
    
    // Función TTS
    const speakText = (text) => {
        if (text) {
            Speech.stop();
            Speech.speak(text, { language: 'en-US' }); 
        }
    };

    // La columna de Past Participle solo aplica a verbos irregulares y regulares.
    const showParticiple = category !== 'phrasal';
    
    return (
        <View style={styles.tableRow}>
            {/* 1. Infinitive */}
            <View style={[styles.tableCell, { flex: columnWeights.inf }]}>
                <Text style={styles.verbText}>{verb.infinitive}</Text>
                <TouchableOpacity onPress={() => speakText(verb.infinitive)} style={styles.playButton}>
                    <Icon name="play-circle" size={20} color={GlobalStyles.secondaryColor.color} />
                </TouchableOpacity>
            </View>

            {/* 2. Simple Past */}
            <View style={[styles.tableCell, { flex: columnWeights.past }]}>
                <Text style={styles.verbText}>{verb.simple_past}</Text>
                <TouchableOpacity onPress={() => speakText(verb.simple_past)} style={styles.playButton}>
                    <Icon name="play-circle" size={20} color={GlobalStyles.secondaryColor.color} />
                </TouchableOpacity>
            </View>

            {/* 3. Past Participle */}
            {showParticiple && (
                <View style={[styles.tableCell, { flex: columnWeights.part }]}>
                    <Text style={styles.verbText}>{verb.past_participle}</Text>
                    <TouchableOpacity onPress={() => speakText(verb.past_participle)} style={styles.playButton}>
                        <Icon name="play-circle" size={20} color={GlobalStyles.secondaryColor.color} />
                    </TouchableOpacity>
                </View>
            )}

            {/* 4. Spanish */}
            <View style={[styles.tableCell, { flex: columnWeights.span }]}>
                <Text style={styles.verbText}>{verb.spanish}</Text>
            </View>

            {/* 5. Example */}
            <View style={[styles.tableCell, styles.tableCellExample, { flex: columnWeights.example }]}>
                <Text style={styles.verbExampleText}>{verb.example}</Text>
                {/* Usamos un ícono de audio para el ejemplo */}
                <TouchableOpacity onPress={() => speakText(verb.example)} style={styles.playButtonExample}>
                    <Icon name="volume-high" size={20} color={GlobalStyles.primaryColor.color} />
                </TouchableOpacity>
            </View>
            
            {/* LA COLUMNA DE IMAGEN/ICONO FUE ELIMINADA */}
        </View>
    );
};


export default function VocabularyDetailScreen({ route, navigation }) {
    const { vocabLevel, category, title, color } = route.params; 
    const [verbs, setVerbs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch data from Gemini
    useEffect(() => {
        const fetchVerbs = async () => {
            setLoading(true);
            setError(null);
            
            const categoryName = title.split(' - ')[0]; 
            
            const systemPrompt = `Eres un generador de contenido de vocabulario de inglés. Genera una lista de 7 verbos de la categoría **${categoryName}** para el nivel **${vocabLevel}**. La respuesta DEBE ser un array JSON.`;
            
            const userQuery = `Genera la lista de 7 ${categoryName} más comunes para el nivel ${vocabLevel}, incluyendo todas las formas y un ejemplo de uso en inglés. Si es un Phrasal Verb, usa el Simple Past y Past Participle como 'N/A' o repite el infinitivo si aplica.`;

            try {
                const verbData = await callGemini(systemPrompt, userQuery, vocabSchema);
                if (verbData && verbData.length > 0) {
                    setVerbs(verbData);
                } else {
                    setError("No se pudieron generar los verbos. Inténtalo de nuevo.");
                }
            } catch (err) {
                setError(err.message);
                console.error("Error generating verbs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVerbs();
    }, [vocabLevel, category, title]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeAreaContainer}>
                 <ActivityIndicator size="large" color={GlobalStyles.primaryColor.color} style={{ flex: 1, justifyContent: 'center' }} />
                 <Text style={styles.loadingText}>Generando lista de {title} con IA...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeAreaContainer}>
                <Text style={GlobalStyles.errorMessage}>{error}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={GlobalStyles.errorButton}>
                    <Text style={GlobalStyles.errorButtonText}>Volver a Categorías</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    
    const isPhrasal = category === 'phrasal';
    const headerTitle = `${title} - ${vocabLevel}`;

    // Pesos de las columnas ajustados para 5 columnas (suman ~10)
    const columnWeights = isPhrasal 
        // Phrasal Verbs (5 columnas): Inf, Past, Spanish, Example
        ? { inf: 2.5, past: 2.5, span: 2, example: 3 } 
        // Regulares/Irregulares (5 columnas): Inf, Past, Participle, Spanish, Example
        : { inf: 1.8, past: 1.8, part: 1.8, span: 1.8, example: 2.8 };
    
    return (
        <SafeAreaView style={styles.safeAreaContainer}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={GlobalStyles.textColor.color} />
                </TouchableOpacity>
                <View style={[styles.headerBubble, {backgroundColor: color || '#1CB0F6'}]}>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                </View>
            </View>
            
            <ScrollView style={styles.scrollView}>
                <View style={styles.tableContainer}>
                    {/* Header de la Tabla */}
                    <View style={styles.tableHeader}>
                        <HeaderText text="Infinitive" flex={columnWeights.inf} />
                        <HeaderText text="Simple Past" flex={columnWeights.past} />
                        {!isPhrasal && <HeaderText text="Past Participle" flex={columnWeights.part} />}
                        <HeaderText text="Spanish" flex={columnWeights.span} />
                        <HeaderText text="Example" flex={columnWeights.example} />
                    </View>

                    {/* Filas de Verbos */}
                    {verbs.map((verb, index) => (
                        <VerbRow key={index} verb={verb} category={category} columnWeights={columnWeights} />
                    ))}
                </View>
                
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: GlobalStyles.backgroundLight.color,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyles.lightGray.color,
        backgroundColor: GlobalStyles.white.color,
    },
    backButton: {
        paddingRight: 10,
    },
    headerBubble: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 999,
        marginLeft: 10,
        shadowColor: 'rgba(0,0,0,0.4)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: GlobalStyles.white.color,
    },
    loadingText: {
        fontSize: 16,
        color: GlobalStyles.textLight.color,
        textAlign: 'center',
        marginBottom: 20
    },
    // --- ESTILOS DE TABLA ---
    scrollView: {
        flex: 1,
        paddingHorizontal: 10,
    },
    tableContainer: {
        width: '100%',
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 15,
        marginTop: 20,
        ...GlobalStyles.shadow,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: GlobalStyles.mediumGray.color,
        backgroundColor: '#F7F7F7',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    tableHeaderCell: {
        fontSize: 11,
        fontWeight: '900',
        color: GlobalStyles.textColor.color,
        textAlign: 'center',
        paddingHorizontal: 2,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyles.lightGray.color,
    },
    tableCell: {
        // Base para todas las celdas de contenido
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    tableCellExample: {
        alignItems: 'flex-start',
        position: 'relative',
        paddingVertical: 5, // Aseguramos espacio vertical
    },
    verbText: {
        fontSize: 12,
        color: GlobalStyles.textColor.color,
        fontWeight: '500',
        textAlign: 'center',
    },
    verbExampleText: {
        fontSize: 12,
        color: GlobalStyles.textColor.color,
        fontStyle: 'italic',
        textAlign: 'left',
        paddingRight: 25, 
    },
    playButton: {
        marginTop: 4,
    },
    playButtonExample: {
        position: 'absolute',
        right: 0,
        top: 0, // Ajustamos la posición superior para que flote
        bottom: 0,
        justifyContent: 'center',
        padding: 5,
    },
});