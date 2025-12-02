import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Definición de la secuencia de niveles
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Función para mapear un nivel numérico (1-6) a una etiqueta CEFR (A1-C2)
const mapLevelToCEFR = (levelNum) => {
    const index = Math.max(0, Math.min(CEFR_ORDER.length - 1, levelNum - 1));
    return CEFR_ORDER[index] || 'A1';
};

// Función para determinar si un nivel está desbloqueado
const isLevelUnlocked = (userCurrentLevelCEFR, requiredLevel) => {
    // CORRECCIÓN: Nos aseguramos de que userCurrentLevelCEFR sea una cadena válida antes de usar toUpperCase()
    const safeUserLevel = (userCurrentLevelCEFR || 'A1').toUpperCase();
    
    const userIndex = CEFR_ORDER.indexOf(safeUserLevel);
    const requiredIndex = CEFR_ORDER.indexOf(requiredLevel.toUpperCase());
    
    // El nivel está desbloqueado si el índice del usuario es igual o mayor al nivel requerido.
    // Usamos (userIndex + 1) para permitir que se muestre el siguiente nivel, aunque esté bloqueado
    return userIndex >= requiredIndex;
};

export default function SkillTestSelectScreen({ route, navigation }) {
    // Obtenemos los parámetros de la pantalla principal (Home)
    const { skill, userLevel } = route.params; 
    
    // 1. OBTENEMOS EL NIVEL CEFR SEGURO
    // userLevel viene como número (1, 2, 3...) de HomeScreen. Lo mapeamos a CEFR (A1, A2...)
    const userLevelCEFR = mapLevelToCEFR(userLevel); 

    const skillDisplayName = skill.charAt(0).toUpperCase() + skill.slice(1);
    
    // Mapeamos los niveles CEFR que serán visibles en esta habilidad (A1, A2, B1, B2, C1)
    const visibleLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    // Generación de los tests dentro de cada nivel (3 tests por fase)
    const tests = [
        { id: 1, name: "Test 1: Fundamentos", icon: 'test-tube', color: '#1CB0F6' },
        { id: 2, name: "Test 2: Práctica Clave", icon: 'flask-outline', color: '#58CC02' },
        { id: 3, name: "Test 3: Desafío Final", icon: 'trophy-variant-outline', color: '#FFC800' },
    ];

    const handleStartTest = (levelId, testNumber) => {
        // Navegamos al TestingScreen con detalles específicos
        navigation.navigate('Testing', { 
            skill: skill, 
            level: userLevelCEFR, // Pasamos el nivel CEFR
            subLevel: levelId, // A1, B1, C1...
            testPhase: testNumber, // 1, 2, 3
            numQuestions: 7, // Requisito: 7 preguntas
        });
    };
    
    // Mapeo de iconos para el header
    const headerIcon = skill === 'writing' ? 'pencil-box-outline' : 'volume-high';

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={GlobalStyles.textColor.color} />
                </TouchableOpacity>
                <Text style={styles.title}>{skillDisplayName}</Text>
                <Icon name={headerIcon} size={30} color={GlobalStyles.textColor.color} style={{marginLeft: 10}} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {visibleLevels.map((levelId) => {
                    // 2. USAMOS EL NIVEL CEFR DEL USUARIO PARA EL DESBLOQUEO
                    const isUnlocked = isLevelUnlocked(userLevelCEFR, levelId);
                    const isCurrentLevel = userLevelCEFR.toUpperCase() === levelId.toUpperCase();
                    const statusText = isCurrentLevel ? 'ACTIVO' : (isUnlocked ? 'COMPLETADO' : 'BLOQUEADO');
                    const statusStyle = isCurrentLevel ? styles.statusActive : (isUnlocked ? styles.statusUnlocked : styles.statusLocked);

                    return (
                        <View key={levelId} style={[styles.levelSection, !isUnlocked && styles.levelSectionLocked]}>
                            <View style={styles.levelHeader}>
                                <Text style={styles.levelTitleText}>Nivel {levelId}</Text>
                                <Text style={[styles.statusText, statusStyle]}>
                                    {statusText}
                                </Text>
                            </View>

                            <View style={styles.testContainer}>
                                {tests.map((test) => {
                                    // Simulación de que el test está completado
                                    const isCompleted = false; 
                                    const isDisabled = !isUnlocked || isCompleted;

                                    return (
                                        <TouchableOpacity
                                            key={test.id}
                                            style={[
                                                styles.testButton,
                                                { backgroundColor: test.color },
                                                isDisabled && styles.testButtonLocked,
                                            ]}
                                            onPress={() => handleStartTest(levelId, test.id)}
                                            disabled={isDisabled}
                                        >
                                            <View style={styles.testIcon}>
                                                <Icon 
                                                    name={isCompleted ? 'check' : test.icon} 
                                                    size={24} 
                                                    color={GlobalStyles.white.color} 
                                                />
                                            </View>
                                            <Text style={styles.testButtonText}>
                                                {test.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}
// ... (resto de los estilos sin cambios)
const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: GlobalStyles.backgroundLight.color,
    },
    // ... (El resto de tus estilos)
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
        marginLeft: 10,
    },
    scrollContent: {
        padding: 20,
        gap: 20,
    },
    levelSection: {
        width: '100%',
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 15,
        padding: 15,
        ...GlobalStyles.shadow,
        shadowOpacity: 0.1,
        borderBottomWidth: 4,
        borderBottomColor: GlobalStyles.mediumGray.color,
    },
    levelSectionLocked: {
        opacity: 0.6,
        borderBottomColor: GlobalStyles.darkGray.color,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyles.lightGray.color,
        paddingBottom: 10,
        marginBottom: 10,
    },
    levelTitleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusActive: {
        color: GlobalStyles.secondaryColor.color,
        backgroundColor: '#E0F4FF',
    },
    statusUnlocked: {
        color: GlobalStyles.primaryColor.color,
        backgroundColor: '#E6FFE6',
    },
    statusLocked: {
        color: GlobalStyles.darkGray.color,
        backgroundColor: GlobalStyles.lightGray.color,
    },
    testContainer: {
        gap: 10,
        paddingTop: 5,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        ...GlobalStyles.shadow,
        shadowOpacity: 0.2,
        borderBottomWidth: 3,
        borderBottomColor: 'rgba(0,0,0,0.2)', // Sombra interna
    },
    testButtonLocked: {
        backgroundColor: GlobalStyles.mediumGray.color,
        borderBottomColor: GlobalStyles.darkGray.color,
        shadowOpacity: 0,
        elevation: 0,
    },
    testIcon: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fondo transparente para el icono
        marginRight: 15,
    },
    testButtonText: {
        color: GlobalStyles.white.color,
        fontSize: 16,
        fontWeight: '600',
    },
    testButtonTextLocked: {
        color: GlobalStyles.darkGray.color,
        fontWeight: 'normal',
    }
});