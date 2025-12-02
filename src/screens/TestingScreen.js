import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, TextInput, ScrollView, Dimensions, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import * as Speech from 'expo-speech'; 
import { callGemini, testSchema } from '../services/GeminiService';
import { useUserData } from '../services/FirebaseContext';
import { setDoc } from 'firebase/firestore';
import { GlobalStyles } from '../styles/GlobalStyles';

const screenWidth = Dimensions.get('window').width;

// Componente de Carga Centrado
const LoadingScreen = ({ message }) => (
    <SafeAreaView style={styles.loadingSafeArea}>
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GlobalStyles.secondaryColor.color} />
            <Text style={styles.loadingText}>{message}</Text>
            <Text style={styles.loadingSubText}>Usando IA de Gemini para generar contenido...</Text></View>
    </SafeAreaView>
);

export default function TestingScreen({ route, navigation }) {
    const { level, skill, subLevel, testPhase } = route.params; 
    const { userData, userDocRef } = useUserData();

    const [questions, setQuestions] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Eliminamos la grabación de voz para estabilidad
    const isRecording = false; 

    const question = questions ? questions[currentQuestionIndex] : null;

    // Control de voz para Speaking/Listening
    const speakQuestion = (text) => {
        if (text) {
            Speech.stop();
            // Especificamos el idioma inglés para la reproducción
            Speech.speak(text, { language: 'en-US' }); 
        }
    };
    
    // Hablamos la pregunta tan pronto como cambia (para Listening)
    useEffect(() => {
        // En Listening, solo hablamos la primera "pregunta" (que es la historia)
        // O si es un listening de frases cortas (Fase 1/2)
        if (question && skill === 'listening' && (currentQuestionIndex === 0 || testPhase !== 3)) { 
            speakQuestion(question.question);
        }
    }, [question, skill]);

    // 1. Generate the test with Gemini
    useEffect(() => {
        const fetchTest = async () => {
            setLoading(true);
            setError(null);
            
            let systemPrompt;
            let userQuery;
            const currentLevel = subLevel || level;
            const totalQ = (skill === 'placement') ? 10 : 7; 

            if (skill === 'placement') {
                systemPrompt = `Eres un evaluador de idioma (CEFR). Crea una prueba de 10 preguntas de nivelación que contenga una mezcla equitativa de complejidad entre los niveles A1, B1 y C1. La respuesta DEBE ser un array JSON.`;
                userQuery = `Genera el test de 10 preguntas. TODAS deben ser de respuesta corta (type: 'write'). Las preguntas deben estar formuladas en ESPAÑOL (para traducción o instrucción) y la respuesta esperada ('correct_answer') debe ser SIEMPRE EN INGLÉS.`;
            
            } else if (skill === 'writing') {
                
                const isFinalChallenge = testPhase === 3;
                
                if (isFinalChallenge) {
                    systemPrompt = `Eres un generador de ejercicios de escritura de nivel ${currentLevel} enfocado en la aplicación del idioma y estructuras complejas. Crea un set de 7 preguntas de WRITING tipo desafío. La respuesta DEBE ser un array JSON.`;
                    userQuery = `Genera 7 ejercicios de ${currentLevel}. Pide: 3 de escritura libre (respuesta corta sobre un tema de opinión/situación), 2 de reescribir frases usando estructuras gramaticales complejas específicas (ej: voz pasiva, condicionales), y 2 de traducción inversa (Inglés -> Español) para que el usuario valide comprensión. Las respuestas esperadas ('correct_answer') deben ser SIEMPRE EN INGLÉS.`;
                    
                } else {
                    systemPrompt = `Eres un generador de ejercicios de escritura (CEFR). Crea un set de 7 preguntas de WRITING para el nivel **${currentLevel}**, fase ${testPhase}. La respuesta DEBE ser un array JSON.`;
                    userQuery = `Genera 7 ejercicios. Mezcla: 3 de traducción simple (Español -> Inglés, enfocadas en vocabulario), 3 de completar oraciones con el tiempo verbal correcto, y 1 de respuesta corta. Las respuestas esperadas ('correct_answer') deben ser SIEMPRE EN INGLÉS.`;
                }
                
            // --- INICIO DEL BLOQUE LISTENING/SPEAKING MODIFICADO ---
            } else if (skill === 'speaking') {
                // SPEAKING: práctica de frases cortas (respuesta tipo 'write')
                systemPrompt = `Eres un generador de ejercicios de idioma. Crea un set de 7 frases EN INGLÉS para SPEAKING en el nivel **${currentLevel}**, fase ${testPhase}. El usuario debe repetir la frase. La respuesta DEBE ser un array JSON.`;
                userQuery = `Genera 7 frases de práctica EN INGLÉS. La pregunta ('question') debe ser la frase en INGLÉS, y la respuesta esperada ('correct_answer') debe ser la misma frase en INGLÉS. Utiliza preguntas tipo 'write'.`;

            } else if (skill === 'listening') {
                // LISTENING: Historias cortas y preguntas de selección (tipo 'mc')
                const isFinalChallenge = testPhase === 3;
                
                if (isFinalChallenge) {
                    // Test 3: Historia larga y preguntas MC de comprensión profunda
                    systemPrompt = `Eres un generador de pruebas de LISTENING. Crea un ejercicio de 7 preguntas de comprensión para el nivel **${currentLevel}** con una sola historia de aproximadamente 150 palabras. La respuesta DEBE ser un array JSON.`;
                    userQuery = `Genera una historia corta en INGLÉS adecuada para el nivel ${currentLevel}. El texto completo de la historia debe ir en el campo 'question' de la primera entrada del array (id: 1, type: 'mc', options: ['Continuar']). Luego, genera 6 preguntas de opción múltiple ('mc') sobre la historia. Las preguntas deben ser: 2 de detalles, 2 de inferencia y 2 de vocabulario.`;
                } else {
                    // Test 1/2: Frases cortas y preguntas MC de traducción/comprensión superficial
                    systemPrompt = `Eres un generador de pruebas de LISTENING. Crea 7 ejercicios cortos de comprensión de audio. Cada ejercicio consta de una frase o diálogo corto y una pregunta. La respuesta DEBE ser un array JSON.`;
                    userQuery = `Genera 7 preguntas de opción múltiple ('mc') para el nivel **${currentLevel}**. La 'question' debe ser la frase o diálogo corto en INGLÉS que el usuario debe escuchar. Las opciones de respuesta deben ser frases en ESPAÑOL que validen la comprensión.`;
                }
            // --- FIN DEL BLOQUE LISTENING/SPEAKING MODIFICADO ---
            
            } else {
                // Test de habilidad normal (Grammar/Vocabulary)
                systemPrompt = `Eres un generador de evaluaciones de inglés (CEFR). Crea una prueba concisa de 5 preguntas sobre la habilidad "${skill}" para el nivel "${level}". La respuesta DEBE ser un array JSON.`;
                userQuery = `Genera un test de 5 preguntas, mezcla preguntas de opción múltiple y de respuesta corta ('write'). Las respuestas esperadas deben ser EN INGLÉS.`;
            }
            
            try {
                const testData = await callGemini(systemPrompt, userQuery, testSchema);
                if (testData && testData.length > 0) {
                    setQuestions(testData);
                    setUserAnswers(new Array(testData.length).fill(null));
                } else {
                    setError("No se pudieron generar las preguntas. Inténtalo de nuevo.");
                }
            } catch (err) {
                setError(err.message);
                console.error("Error generating test:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [level, skill, subLevel, testPhase]);

    // 2. Evaluate the test and update Firestore (VERSION ESTABLE)
    const evaluateTest = async () => {
        setLoading(true);
        setError(null);
        
        let correctCount = 0;
        
        let finalQuestions = questions.map((q, index) => ({
            ...q,
            user_answer: userAnswers[index], 
            is_correct: false,
            feedback: "No evaluado.",
        }));


        try {
            // A. Local MC evaluation: Procesa TODAS las MC.
            finalQuestions = finalQuestions.map(item => {
                if (item.type === 'mc') {
                    // Ignoramos la primera pregunta si es la historia del Listening 
                    // (la cual forzamos a ser MC con opción "Continuar" para que el usuario la vea primero)
                    if (skill === 'listening' && testPhase === 3 && item.id === questions[0].id) {
                         return item;
                    }
                    
                    const cleanAnswer = String(item.user_answer || '').trim();
                    const isAnswered = cleanAnswer !== '';
                    const isCorrect = isAnswered && (cleanAnswer.toLowerCase() === (item.correct_answer || '').toLowerCase());
                    if (isCorrect) correctCount++;
                    
                    return { 
                        ...item, 
                        is_correct: isCorrect, 
                        feedback: isAnswered ? (isCorrect ? "¡Correcto!" : `La respuesta correcta era: ${item.correct_answer}`) : "No fue respondida.", 
                    };
                }
                return item;
            });

            // B. AI evaluation for 'write' questions: 
            const writeQuestionsAnswered = finalQuestions.filter(item => item.type === 'write' && String(item.user_answer || '').trim() !== '');
            
            // Si hay preguntas escritas para evaluar
            if (writeQuestionsAnswered.length > 0) {
                const writeEvalSystem = "Eres un evaluador de idioma de inglés basado en el marco CEFR. Evalúa la respuesta del usuario ('user_answer') a la pregunta ('question') y compárala con la respuesta esperada ('correct_answer'). Indica si es 'correct' (true) o 'incorrect' (false) y proporciona un feedback conciso y **específico sobre la gramática (tiempo verbal, concordancia, estructura, uso de preposiciones) y coherencia**. La respuesta debe ser un JSON array con el mismo 'id'.";
                
                const writeEvalQuery = `Evalúa estas respuestas: ${JSON.stringify(writeQuestionsAnswered)}`;

                const writeEvalSchema = {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "STRING" },
                            is_correct: { type: "BOOLEAN" },
                            feedback: { type: "STRING" },
                        },
                        required: ["id", "is_correct", "feedback"],
                    },
                };

                const aiResults = await callGemini(writeEvalSystem, writeEvalQuery, writeEvalSchema);
                
                // Integrar resultados de IA de vuelta en finalQuestions
                finalQuestions = finalQuestions.map(item => {
                    const aiRes = aiResults.find(r => r.id === item.id);
                    if (item.type === 'write' && aiRes) {
                        if (aiRes.is_correct) correctCount++;
                        return {
                            ...item,
                            is_correct: aiRes.is_correct,
                            feedback: aiRes.feedback,
                        };
                    } else if (item.type === 'write' && String(item.user_answer || '').trim() === '') {
                        return {
                            ...item,
                            is_correct: false,
                            feedback: "No fue respondida.",
                        };
                    }
                    return item;
                });
            }

            // C. Procesar las preguntas escritas que se dejaron vacías.
            finalQuestions = finalQuestions.map(item => {
                 if (item.type === 'write' && String(item.user_answer || '').trim() === '' && item.feedback === 'No evaluado.') {
                    return {
                        ...item,
                        is_correct: false,
                        feedback: "No fue respondida.",
                    };
                }
                return item;
            });


            const totalQuestions = questions.length;
            
            // Ajuste de puntaje total si la primera pregunta es la historia (solo tiene 6 preguntas evaluables)
            const totalEvaluableQuestions = (skill === 'listening' && testPhase === 3) ? totalQuestions - 1 : totalQuestions;
            
            const finalScore = (correctCount / totalEvaluableQuestions) * 100;

            // D. LEVEL ADJUSTMENT & Persistence Logic (Aseguramos que no haya UNDEFINED)
            const levelMap = ['A1', 'B1', 'C1']; 
            let newLevel = userData?.level || level; 
            
            if (skill === 'placement') {
                const currentLevelIndex = levelMap.indexOf(level);
                
                let calculatedLevel; 

                if (finalScore < 30) {
                    calculatedLevel = 'A1'; 
                } else if (finalScore >= 30 && finalScore < 70) {
                    calculatedLevel = 'B1'; 
                } else if (finalScore >= 70) {
                    calculatedLevel = 'C1'; 
                }
                
                newLevel = calculatedLevel || 'A1'; 

            } else {
                 if (finalScore >= 80) {
                     if (level === 'A1') newLevel = 'B1';
                     else if (level === 'B1') newLevel = 'C1';
                 }
                 if (!newLevel) {
                     newLevel = userData?.level || 'A1'; 
                 }
            }


            // E. Persistence Logic (Weighted Score Update)
            const skillKey = skill === 'placement' ? 'levelTest' : skill;
            const currentSkillScore = userData?.skills?.[skillKey] || 0;
            const newSkillScore = Math.min(100, Math.round((currentSkillScore * 0.7) + (finalScore * 0.3))); 
            
            const newStreak = finalScore >= 60 ? (userData?.streak || 0) + 1 : 0;
            const newXP = (userData?.xp || 0) + Math.round(finalScore / 5); 

            await setDoc(userDocRef, {
                level: newLevel, 
                skills: { ...userData.skills, [skillKey]: newSkillScore },
                xp: newXP, 
                streak: newStreak,
                lastTestDate: new Date().toISOString(),
            }, { merge: true });

            // 3. Navegar a Results Screen con los 5/10 detalles.
            navigation.replace('Results', {
                results: {
                    score: finalScore,
                    level: level, 
                    skill: skill,
                    details: finalQuestions.sort((a,b) => a.id.localeCompare(b.id)), 
                    newLevel: newLevel, 
                    newStreak: newStreak,
                }
            });

        } catch (err) {
            setError("Error evaluating test: " + err.message);
            console.error("Error evaluating test:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleAnswer = (answer, isSimulatedTranscription = false) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = answer; 
        setUserAnswers(newAnswers);
        
        // Auto-avanzar si es la "pregunta" de la historia (solo sirve para avanzar a la pregunta 2)
        if (skill === 'listening' && testPhase === 3 && currentQuestionIndex === 0) {
            setTimeout(handleNext, 100); 
        }
        
        if (isSimulatedTranscription) {
            setTimeout(handleNext, 500); 
        }
    };

    const handleNext = () => {
        Keyboard.dismiss(); 
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            evaluateTest(); 
        }
    };
    
    // Determinamos si es la pantalla de la historia (solo ocurre en Listening Fase 3)
    const isStoryScreen = skill === 'listening' && testPhase === 3 && currentQuestionIndex === 0;

    if (loading) {
        return <LoadingScreen message={`Generando prueba de ${skill === 'placement' ? 'Nivelación' : skill}...`} />;
    }

    if (error) {
        return <View style={GlobalStyles.errorContainer}><Text style={GlobalStyles.errorMessage}>{error}</Text><TouchableOpacity onPress={() => navigation.navigate('Home')} style={GlobalStyles.errorButton}><Text style={GlobalStyles.errorButtonText}>Volver a Inicio</Text></TouchableOpacity></View>;
    }

    const screenTitle = skill === 'placement' 
        ? 'Test de Nivelación' 
        : `${subLevel} - Fase ${testPhase || 1}`;
        
    const questionTextDisplay = isStoryScreen ? 'Historia de Listening' : `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;


    return (
        <SafeAreaView style={styles.testSafeArea}>
            {/* KeyboardAvoidingView para manejar el teclado */}
            <KeyboardAvoidingView 
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0} 
            >
                <View style={styles.testHeader}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.testBackButton}>
                        <AntDesign name="arrowleft" size={24} color="#6b7280" />
                    </TouchableOpacity>
                    <Text style={styles.testTitle}>
                       {screenTitle}
                    </Text>
                    <View style={styles.testSpacer} />
                </View>

                {question && (
                    <View style={styles.testContent}>
                        
                        {/* CONTROLES DE AUDIO (TTS) */}
                        {(skill === 'speaking' || skill === 'listening') && (
                            <View style={styles.speakingControls}>
                                {/* ÚNICO BOTÓN DE AUDIO/REPETICIÓN */}
                                <TouchableOpacity 
                                    style={[styles.audioButtonOnly, { backgroundColor: GlobalStyles.secondaryColor.color }]} 
                                    onPress={() => speakQuestion(question.question)}
                                >
                                    <Icon name="volume-high" size={30} color={GlobalStyles.white.color} />
                                    <Text style={styles.audioButtonText}>
                                        {isStoryScreen ? 'Reproducir Historia' : 'Escuchar Frase'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        {/* CORRECCIÓN: ScrollView con gestión de taps mínima, confiando en el KAV */}
                        <ScrollView contentContainerStyle={styles.testScrollContent} keyboardShouldPersistTaps="handled"> 
                            
                            {/* Ocultamos el contador y barra de progreso si es la pantalla de la historia */}
                            {!isStoryScreen && (
                                <>
                                    <Text style={styles.testProgressText}>
                                        Pregunta {currentQuestionIndex} de {questions.length - 1}
                                    </Text>
                                    {/* Barra de Progreso Superior */}
                                    <View style={styles.progressBarBackground}>
                                        <View style={[styles.progressBarFill, { width: `${(currentQuestionIndex / (questions.length - 1)) * 100}%` }]} />
                                    </View>
                                </>
                            )}
                            
                            {/* Si es la pantalla de la historia, mostramos la instrucción */}
                            {isStoryScreen && (
                                <View style={[styles.testQuestionBox, styles.storyInstructionBox]}>
                                    <Text style={styles.storyInstructionTitle}>Escucha la historia y haz clic en continuar.</Text>
                                </View>
                            )}

                            <View style={styles.testQuestionBox}>
                                <Text style={styles.testQuestionText}>
                                    {/* Si es la historia, forzamos a que solo se muestre el texto de la historia.
                                    Si no, mostramos la pregunta. */}
                                    {isStoryScreen ? question.question : question.question}
                                </Text>
                            </View>

                            {/* Opciones de Respuesta */}
                            <View style={styles.testOptionsContainer}>
                                {question.type === 'mc' && question.options.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => handleAnswer(option)}
                                        style={[
                                            styles.optionButton, 
                                            userAnswers[currentQuestionIndex] === option ? styles.optionSelected : styles.optionDefault
                                        ]}
                                    >
                                        <Text style={[styles.optionText, userAnswers[currentQuestionIndex] === option ? styles.optionTextSelected : styles.optionTextDefault]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                {question.type === 'write' && (
                                    <TextInput
                                        multiline
                                        placeholder={'Escribe la respuesta aquí...'}
                                        value={userAnswers[currentQuestionIndex] || ''}
                                        onChangeText={(text) => handleAnswer(text)}
                                        style={styles.writeInput}
                                        autoCorrect={false}
                                        keyboardType="default"
                                        spellCheck={false}
                                        autoCapitalize="none" 
                                        editable={!isRecording} 
                                    />
                                )}
                            </View>
                        </ScrollView>

                        {/* Botón Inferior */}
                        <View style={styles.testFooter}>
                            <TouchableOpacity
                                onPress={handleNext}
                                // Si es la pantalla de historia, solo necesitamos que se haya seleccionado "Continuar" o tocado.
                                disabled={!isStoryScreen && (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === '' || isRecording)}
                                style={[GlobalStyles.button, styles.nextButton, (!isStoryScreen && (userAnswers[currentQuestionIndex] === null || userAnswers[currentQuestionIndex] === '' || isRecording)) ? GlobalStyles.buttonDisabled : GlobalStyles.primaryButton]}
                            >
                                <Text style={GlobalStyles.buttonText}>
                                    {isStoryScreen ? 'CONTINUAR' : currentQuestionIndex === questions.length - 1 ? 'FINALIZAR TEST' : 'SIGUIENTE PREGUNTA'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
    },
    // --- ESTILOS DE CARGA CENTRADA ---
    loadingSafeArea: {
        flex: 1,
        backgroundColor: GlobalStyles.backgroundLight,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
        marginTop: 20,
        textAlign: 'center',
    },
    loadingSubText: {
        fontSize: 16,
        color: GlobalStyles.textLight.color,
        marginTop: 10,
        textAlign: 'center',
    },
    // --- FIN ESTILOS CARGA ---

    testSafeArea: {
        flex: 1,
        backgroundColor: GlobalStyles.backgroundLight,
    },
    testHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyles.lightGray.color,
        backgroundColor: GlobalStyles.white.color,
    },
    testBackButton: {
        paddingRight: 10,
    },
    testTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: GlobalStyles.textColor.color,
    },
    testSpacer: {
        width: 34,
    },
    testContent: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    testScrollContent: {
        paddingBottom: 20,
    },
    testProgressText: {
        fontSize: 14,
        color: GlobalStyles.textLight.color,
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 10,
        width: '100%',
        backgroundColor: GlobalStyles.mediumGray.color,
        borderRadius: 5,
        marginBottom: 30,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: GlobalStyles.secondaryColor.color,
        borderRadius: 5,
    },
    testQuestionBox: {
        padding: 25,
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 15,
        marginBottom: 30,
        ...GlobalStyles.shadow,
        shadowOpacity: 0.1,
    },
    storyInstructionBox: {
        backgroundColor: '#D1FAE5',
        borderColor: GlobalStyles.primaryColor.color,
        borderWidth: 2,
    },
    storyInstructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: GlobalStyles.primaryColor.color,
        textAlign: 'center',
    },
    testQuestionText: {
        fontSize: 22,
        fontWeight: '600',
        color: GlobalStyles.textColor.color,
    },
    // --- CONTROLES DE AUDIO Y GRABACIÓN ---
    speakingControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        width: '100%',
    },
    // Botón que solo aparece en Listening
    audioButtonOnly: {
        backgroundColor: GlobalStyles.secondaryColor.color,
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...GlobalStyles.shadow,
        width: '80%',
    },
    audioButtonText: {
        color: GlobalStyles.white.color,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    // --- FIN CONTROLES ---
    testOptionsContainer: {
        gap: 12,
    },
    optionButton: {
        width: '100%',
        padding: 18,
        borderRadius: 15,
        borderWidth: 2,
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        ...GlobalStyles.shadow,
        shadowOpacity: 0.05,
        elevation: 2,
    },
    optionDefault: {
        borderColor: GlobalStyles.lightGray.color,
        backgroundColor: GlobalStyles.white.color,
    },
    optionSelected: {
        borderColor: GlobalStyles.primaryColor.color,
        backgroundColor: '#E6FFE6', 
        borderWidth: 3, 
    },
    optionText: {
        fontSize: 18,
        fontWeight: '500',
    },
    optionTextDefault: {
        color: GlobalStyles.textColor.color,
    },
    optionTextSelected: {
        color: GlobalStyles.primaryColor.color,
        fontWeight: 'bold',
    },
    writeInput: {
        width: '100%',
        height: 120,
        padding: 20,
        borderWidth: 2,
        borderColor: GlobalStyles.mediumGray.color,
        borderRadius: 15,
        textAlignVertical: 'top',
        fontSize: 18,
        backgroundColor: GlobalStyles.white.color,
        ...GlobalStyles.shadow,
        shadowOpacity: 0.1,
    },
    testFooter: {
        paddingTop: 10,
    },
    nextButton: {
        ...GlobalStyles.primaryButton,
    },
});