import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

export default function TestResultsScreen({ route, navigation }) {
    // Aseguramos que 'results' y sus propiedades existan
    const { results } = route.params;
    const { score, level, skill, newLevel, newStreak, details } = results;

    const isLevelUp = newLevel !== level;
    
    const titleText = skill === 'placement' 
        ? (isLevelUp ? `Nivel Asignado: ${newLevel}` : `Nivel Confirmado: ${newLevel}`)
        : 'Resultados del Test';

    // Función segura para obtener la pregunta o un mensaje de error
    const getSafeQuestionText = (question) => {
        // VERIFICACIÓN ESTRICTA: Solo intenta el substring si es una cadena válida
        const text = String(question || '').trim();
        if (text.length > 0) {
            return text.length > 50 ? text.substring(0, 50) + '...' : text;
        }
        return 'Pregunta no disponible.';
    };

    return (
        <SafeAreaView style={styles.resultsSafeArea}>
            <ScrollView contentContainerStyle={styles.resultsScrollContent}>
                
                {/* ICONO DE RESULTADO */}
                <View style={[styles.iconContainer, { backgroundColor: isLevelUp ? GlobalStyles.accentColor.color : GlobalStyles.primaryColor.color }]}>
                     <Icon 
                        name={isLevelUp ? "arrow-up-bold" : "check-all"} 
                        size={50} 
                        color={GlobalStyles.white.color} 
                    />
                </View>

                <View style={styles.resultsHeader}>
                    <Text style={[styles.resultsTitle, isLevelUp ? styles.resultsTitleYellow : styles.resultsTitleGreen]}>
                        {skill === 'placement' ? '¡EVALUACIÓN COMPLETA!' : '¡Fantástico!'}
                    </Text>
                    <Text style={styles.resultsSubTitle}>{titleText}</Text>
                </View>

                {/* TARJETA RESUMEN */}
                <View style={styles.resultsSummaryCard}>
                     <View style={styles.resultsStatsRow}>
                        <View style={styles.resultsStatBox}>
                            <Text style={styles.resultsStatLabel}>NIVEL FINAL</Text>
                            <Text style={[styles.resultsStatValue, isLevelUp ? styles.resultsStatValueYellow : styles.resultsStatValueNormal]}>{newLevel}</Text>
                        </View>
                        <View style={styles.resultsStatBox}>
                            <Text style={styles.resultsStatLabelRed}>PUNTAJE</Text>
                            <Text style={styles.resultsStatValueScore}>{Math.round(score)}%</Text>
                        </View>
                        <View style={styles.resultsStatBox}>
                            <Text style={styles.resultsStatLabelFire}>RACHA 🔥</Text>
                            <Text style={styles.resultsStatValueFire}>{newStreak}</Text>
                        </View>
                    </View>
                </View>

                {/* TARJETA DE FEEDBACK DETALLADO */}
                <View style={styles.resultsFeedbackCard}>
                    <Text style={styles.resultsFeedbackTitle}>Desglose Detallado (Feedback IA)</Text>
                    
                    <View style={styles.resultsFeedbackContainer}>
                        {/* ITERAMOS SOBRE LOS DETALLES */}
                        {(details || []).map((d, index) => (
                            <View key={d.id || index} style={styles.feedbackItem}>
                                <View style={styles.feedbackItemHeader}>
                                    <Text style={styles.feedbackQuestionText}>
                                        {/* APLICAMOS LA FUNCIÓN DE VERIFICACIÓN AQUÍ */}
                                        Q{index + 1}: {getSafeQuestionText(d.question)}
                                    </Text>
                                    <View style={[styles.feedbackBadge, d.is_correct ? styles.badgeCorrect : styles.badgeIncorrect]}>
                                        <Text style={styles.badgeText}>
                                            {d.is_correct ? '✅ CORRECTO' : '❌ INCORRECTO'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.feedbackAnswerText}>
                                    <Text style={styles.feedbackAnswerLabel}>Tu Respuesta:</Text> <Text style={styles.feedbackAnswerItalic}>{d.user_answer || '(No Respondió)'}</Text>
                                </Text>
                                <Text style={styles.feedbackAiText}>
                                    <Text style={styles.feedbackAiLabel}>Feedback (IA):</Text> {d.feedback || 'No disponible.'}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
            
            {/* BOTÓN CONTINUAR */}
            <View style={styles.resultsFooter}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={[GlobalStyles.button, GlobalStyles.primaryButton, styles.resultsContinueButton]}
                >
                    <Text style={GlobalStyles.buttonText}>CONTINUAR</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    resultsSafeArea: {
        flex: 1,
        backgroundColor: GlobalStyles.backgroundLight,
    },
    resultsScrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        ...GlobalStyles.shadow,
    },
    resultsHeader: {
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    resultsTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    resultsTitleGreen: {
        color: GlobalStyles.primaryColor.color,
    },
    resultsTitleYellow: {
        color: GlobalStyles.accentColor.color,
    },
    resultsSubTitle: {
        fontSize: 18,
        color: GlobalStyles.textColor.color,
        textAlign: 'center',
        fontWeight: '500',
    },
    resultsSummaryCard: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 20,
        ...GlobalStyles.shadow,
        marginBottom: 24,
    },
    resultsStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    resultsStatBox: {
        alignItems: 'center',
    },
    resultsStatLabel: {
        fontSize: 12,
        color: GlobalStyles.darkGray.color,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    resultsStatLabelRed: {
        fontSize: 12,
        color: GlobalStyles.textColor.color,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    resultsStatLabelFire: {
        fontSize: 12,
        color: GlobalStyles.errorColor.color,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    resultsStatValue: {
        fontSize: 38,
        fontWeight: '900',
        color: GlobalStyles.textColor.color,
    },
    resultsStatValueYellow: {
        color: GlobalStyles.accentColor.color,
    },
    resultsStatValueScore: {
        fontSize: 38,
        fontWeight: '900',
        color: GlobalStyles.secondaryColor.color,
    },
    resultsStatValueFire: {
        fontSize: 38,
        fontWeight: '900',
        color: GlobalStyles.errorColor.color,
    },
    
    resultsFeedbackCard: {
        width: '100%',
        maxWidth: 400,
        padding: 20,
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 20,
        ...GlobalStyles.shadow,
    },
    resultsFeedbackTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyles.lightGray.color,
        paddingBottom: 10,
        marginBottom: 15,
    },
    resultsFeedbackContainer: {
        gap: 12,
    },
    feedbackItem: {
        padding: 12,
        backgroundColor: GlobalStyles.lightGray.color,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: GlobalStyles.mediumGray.color,
    },
    feedbackItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    feedbackQuestionText: {
        fontSize: 14,
        fontWeight: '600',
        color: GlobalStyles.textColor.color,
        flex: 1,
        marginRight: 8,
    },
    feedbackBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        minWidth: 90,
        alignItems: 'center',
    },
    badgeCorrect: {
        backgroundColor: '#D1FAE5', // Verde muy claro
    },
    badgeIncorrect: {
        backgroundColor: '#FEE2E2', // Rojo muy claro
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: GlobalStyles.primaryColor.color, // Color original del texto
    },
    feedbackAnswerText: {
        fontSize: 12,
        color: GlobalStyles.textLight.color,
        marginTop: 4,
    },
    feedbackAnswerLabel: {
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
    },
    feedbackAnswerItalic: {
        fontStyle: 'italic',
    },
    feedbackAiText: {
        fontSize: 13,
        color: GlobalStyles.secondaryColor.color, 
        marginTop: 8,
        fontWeight: 'bold',
    },
    feedbackAiLabel: {
        fontWeight: 'bold',
    },
    resultsFooter: {
        padding: 15,
        backgroundColor: GlobalStyles.white.color,
        borderTopWidth: 1,
        borderTopColor: GlobalStyles.mediumGray.color,
    },
    resultsContinueButton: {
        width: '100%',
    },
});