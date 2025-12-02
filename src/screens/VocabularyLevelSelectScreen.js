// screens/VocabularyLevelSelectScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserData } from '../services/FirebaseContext'; 

// Definición de la secuencia de niveles CEFR
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Lógica para determinar si el nivel del usuario es suficiente
const isLevelSufficient = (userCurrentLevel, requiredMinLevel) => {
    // Si el nivel no está definido (ej. usuario nuevo antes del test), lo bloqueamos
    if (!userCurrentLevel || !requiredMinLevel) return false; 
    
    const userIndex = CEFR_ORDER.indexOf(userCurrentLevel.toUpperCase());
    const requiredIndex = CEFR_ORDER.indexOf(requiredMinLevel.toUpperCase());
    
    // El nivel está desbloqueado si el índice del usuario es igual o mayor al nivel requerido.
    return userIndex >= requiredIndex;
};


// Componente para la imagen/icono del nivel
const LevelImage = ({ levelId, color }) => {
    let iconName = 'book-open-outline';
    if (levelId === 'A1A2') iconName = 'account-voice';
    if (levelId === 'B1B2') iconName = 'lightbulb-on-outline';
    if (levelId === 'C1') iconName = 'trophy-variant-outline';
    
    return (
        <View style={[styles.imageContainer, {backgroundColor: color + '20'}]}>
            <Icon name={iconName} size={80} color={color} /> 
        </View>
    );
};


export default function VocabularyLevelSelectScreen({ navigation }) {
    // Obtenemos los datos del usuario
    const { userData, isLoadingData } = useUserData();
    
    // Obtenemos el nivel del usuario. Usamos 'A1' como valor por defecto seguro si no hay datos.
    const userLevel = userData?.userLevel || 'A1';

    // Definición de los niveles de vocabulario y su nivel mínimo requerido para desbloquear
    const vocabLevels = [
        { id: 'A1A2', title: 'A1 - A2', subtitle: 'BASIC', description: 'Vocabulario esencial.', color: '#FF4B4B', requiredMinLevel: 'A1' },
        { id: 'B1B2', title: 'B1 - B2', subtitle: 'INTERMEDIATE', description: 'Vocabulario avanzado.', color: '#FFC800', requiredMinLevel: 'B1' },
        { id: 'C1', title: 'C1', subtitle: 'ADVANCED', description: 'Vocabulario de dominio.', color: '#9B4DFF', requiredMinLevel: 'C1' },
    ];

    const handleSelectLevel = (level, isLocked) => {
        if (isLocked) {
            alert(`Necesitas alcanzar el nivel ${level.requiredMinLevel} para desbloquear esta sección.`);
            return;
        }
        
        // Navegamos a la siguiente pantalla (Categorías de Vocabulario)
        navigation.navigate('VocabCategories', { vocabLevel: level.id, title: level.title, color: level.color });
    };

    if (isLoadingData) {
        return (
            <SafeAreaView style={styles.safeAreaContainer}>
                <ActivityIndicator size="large" color={GlobalStyles.primaryColor.color} style={{ flex: 1, justifyContent: 'center' }} />
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={GlobalStyles.textColor.color} />
                </TouchableOpacity>
                <Text style={styles.title}>Verbos</Text> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderTitle}>VERBS</Text>
                </View>

                {vocabLevels.map((level) => {
                    // CÁLCULO DINÁMICO
                    const isLocked = !isLevelSufficient(userLevel, level.requiredMinLevel);
                    
                    return (
                        <View key={level.id} style={styles.cardWrapper}>
                            <TouchableOpacity
                                style={[styles.levelCard, isLocked && styles.levelCardLocked]}
                                // AHORA SOLO ESTE BOTÓN MANEJA EL CLICK EN TODA LA TARJETA
                                onPress={() => handleSelectLevel(level, isLocked)}
                                activeOpacity={0.9}
                            >
                                <LevelImage levelId={level.id} color={level.color} />

                                <View style={styles.levelContent}>
                                    <Text style={styles.levelTitle}>{level.title}</Text>
                                    <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
                                    <Text style={styles.levelDescription}>{level.description}</Text>
                                    
                                    {isLocked ? (
                                        // Bloqueado: Es un simple View
                                        <View style={[styles.goButton, styles.lockedButton]}>
                                            <Icon name="lock" size={20} color={GlobalStyles.white.color} />
                                            <Text style={styles.goButtonText}>Req. {level.requiredMinLevel}</Text>
                                        </View>
                                    ) : (
                                        // Desbloqueado: AHORA ES UN SIMPLE VIEW, NO UN TOUCHABLE
                                        <View style={[styles.goButton, { backgroundColor: level.color }]}>
                                            <Text style={styles.goButtonText}>Go</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
        marginLeft: 10,
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-around',
    },
    cardHeader: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardHeaderTitle: {
        backgroundColor: '#1CB0F6',
        paddingHorizontal: 25,
        paddingVertical: 8,
        borderRadius: 999,
        fontSize: 18,
        fontWeight: '900',
        color: GlobalStyles.white.color,
        shadowColor: '#1CB0F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    cardWrapper: {
        width: '48%', 
        maxWidth: 200, 
        marginBottom: 20,
    },
    levelCard: {
        width: '100%',
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 15,
        alignItems: 'center',
        ...GlobalStyles.shadow,
        paddingBottom: 15,
        overflow: 'hidden',
    },
    levelCardLocked: {
        opacity: 0.7,
        borderWidth: 2,
        borderColor: GlobalStyles.darkGray.color,
    },
    imageContainer: {
        width: '100%',
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    levelContent: {
        alignItems: 'center',
        paddingHorizontal: 10,
        width: '100%',
    },
    levelTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: GlobalStyles.textColor.color,
        marginTop: 5,
    },
    levelSubtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: GlobalStyles.textLight.color,
        marginTop: 2,
    },
    levelDescription: {
        fontSize: 12,
        color: GlobalStyles.textLight.color,
        marginVertical: 10,
    },
    goButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 5,
    },
    goButtonText: {
        color: GlobalStyles.white.color,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 5,
    },
    lockedButton: {
        backgroundColor: GlobalStyles.darkGray.color,
        paddingHorizontal: 10,
    }
});