import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useUserData } from '../services/FirebaseContext';
import { GlobalStyles } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LevelSelectScreen({ navigation }) {
    const { createInitialProfile } = useUserData();
    const [loading, setLoading] = useState(false);
    const [selectedLevelId, setSelectedLevelId] = useState(null); 
    const [error, setError] = useState('');

    const levels = [
        { id: 'A1', name: 'Básico', description: 'Empieza con los fundamentos.', icon: 'leaf', color: GlobalStyles.primaryColor },
        { id: 'B1', name: 'Intermedio', description: 'Comunícate en el día a día.', icon: 'book-open-outline', color: GlobalStyles.secondaryColor },
        { id: 'C1', name: 'Avanzado', description: 'Domina estructuras complejas.', icon: 'rocket', color: GlobalStyles.tertiaryColor },
    ];

    const handleLevelSelection = async (levelId) => {
        setSelectedLevelId(levelId); 
        setError('');
        setLoading(true);
        // Navegamos al test para que el test haga la validación y el guardado final.
        navigation.navigate('Testing', { level: levelId, skill: 'placement' });
    };

    const handlePlacementTest = () => {
        // Opción "No sé mi nivel" - Inicia el test de colocación.
        navigation.navigate('Testing', { skill: 'placement', level: 'Basic' });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1, backgroundColor: GlobalStyles.backgroundLight }}>
            
            <View style={styles.rocketContainer}>
                <Text style={styles.rocketEmoji}>⭐</Text>
            </View>

            <View style={styles.header}>
                <Text style={GlobalStyles.title}>Elige tu Nivel</Text>
                <Text style={GlobalStyles.subtitle}>
                    Valida tu conocimiento o haz una prueba general.
                </Text>
            </View>

            <View style={styles.levelOptionsContainer}>
                {levels.map(level => (
                    <TouchableOpacity
                        key={level.id}
                        style={[
                            styles.levelOption,
                            { borderColor: level.color },
                            { borderBottomColor: level.color, borderBottomWidth: 6 }, // Efecto 3D
                            selectedLevelId === level.id && styles.levelOptionSelected,
                            loading && styles.levelOptionDisabled
                        ]}
                        onPress={() => handleLevelSelection(level.id)}
                        disabled={loading}
                    >
                        <Icon 
                            name={level.icon} 
                            size={35} 
                            color={selectedLevelId === level.id ? GlobalStyles.white.color : level.color} 
                        />
                        <View style={styles.levelTextContent}>
                            <Text style={[styles.levelOptionText, selectedLevelId === level.id && styles.levelOptionTextSelected]}>
                                {level.id} - {level.name}
                            </Text>
                            <Text style={[styles.levelOptionDescription, selectedLevelId === level.id && styles.levelOptionTextSelected]}>
                                {level.description}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            
            <View style={styles.separatorContainer}>
                 <Text style={styles.separatorText}>O</Text>
            </View>

            {/* Opción: No sé mi nivel / Test de Nivelación - Diseño de botón flotante */}
            <TouchableOpacity
                style={[
                    GlobalStyles.button, 
                    styles.placementTestButton,
                    loading && GlobalStyles.buttonDisabled
                ]}
                onPress={handlePlacementTest}
                disabled={loading}
            >
                <Icon name="earth" size={30} color={GlobalStyles.textColor.color} style={{marginRight: 10}} />
                <Text style={styles.placementTestText}>
                    No sé mi nivel de inglés
                </Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color={GlobalStyles.primaryColor.color} style={{ marginTop: 20 }} />}
            {error && <Text style={GlobalStyles.errorText}>{error}</Text>}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 60,
        alignItems: 'center',
        flexGrow: 1,
    },
    rocketContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 50,
        backgroundColor: GlobalStyles.accentColor,
    },
    rocketEmoji: {
        fontSize: 40,
    },
    header: {
        width: '100%',
        marginBottom: 30,
        alignItems: 'center',
    },
    levelOptionsContainer: {
        width: '100%',
        maxWidth: 450,
    },
    levelOption: {
        backgroundColor: GlobalStyles.white.color,
        padding: 20, 
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 3, 
        borderColor: GlobalStyles.mediumGray.color,
        flexDirection: 'row',
        alignItems: 'center',
        ...GlobalStyles.shadow,
        shadowOpacity: 0.1,
    },
    levelOptionSelected: {
        // Estilos cuando se selecciona
        backgroundColor: GlobalStyles.secondaryColor.color,
        borderColor: GlobalStyles.secondaryColor.color,
        shadowOpacity: 0.3,
        elevation: 5,
    },
    levelOptionDisabled: {
        opacity: 0.6,
    },
    levelTextContent: {
        marginLeft: 15,
        flex: 1,
    },
    levelOptionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
    },
    levelOptionTextSelected: {
        color: GlobalStyles.white.color,
    },
    levelOptionDescription: {
        fontSize: 14,
        color: GlobalStyles.textLight.color,
        marginTop: 3,
    },
    separatorContainer: {
        marginVertical: 25,
        width: '100%',
        alignItems: 'center',
    },
    separatorText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: GlobalStyles.darkGray.color,
        backgroundColor: GlobalStyles.backgroundLight,
        paddingHorizontal: 10,
    },
    placementTestButton: {
        backgroundColor: GlobalStyles.white.color,
        borderColor: GlobalStyles.darkGray.color,
        borderWidth: 2,
        borderBottomWidth: 4, 
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        ...GlobalStyles.shadow,
        shadowOpacity: 0.1,
        elevation: 3,
    },
    placementTestText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
    }
});