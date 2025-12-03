import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Importamos Hooks del contexto
import { useFirebase, useUserData } from '../services/FirebaseContext'; 
import { GlobalStyles } from '../styles/GlobalStyles'; // Importación estática original

// Importamos todas las pantallas
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import LevelSelectScreen from '../screens/LevelSelectScreen';
import TestingScreen from '../screens/TestingScreen';
import TestResultsScreen from '../screens/TestResultsScreen';
import SkillTestSelectScreen from '../screens/SkillTestSelectScreen'; 
import VocabularyLevelSelectScreen from '../screens/VocabularyLevelSelectScreen';
import VocabularyCategorySelectScreen from '../screens/VocabularyCategorySelectScreen';
import VocabularyDetailScreen from '../screens/VocabularyDetailScreen';
import AboutScreen from '../screens/AboutScreen'; 

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GlobalStyles.secondaryColor.color} />
        <Text style={styles.loadingText}>Cargando aplicación y autenticación...</Text>
    </View>
);

export default function AppNavigator() {
    // Obtenemos el estado de autenticación y los datos del usuario del contexto
    const { userId, isAuthReady } = useFirebase();
    const { userData, isLoadingData } = useUserData();

    // 1. Mostrar pantalla de carga si la autenticación básica NO está lista.
    if (!isAuthReady) {
        return <LoadingScreen />;
    }

    // 2. Determinar la ruta inicial.
    let initialRouteName = '';
    
    // --- LÓGICA DE REDIRECCIÓN ESTABLE ---
    if (!userId) {
        // CASO 1: No hay usuario autenticado -> Ir a Auth
        initialRouteName = 'Auth';
    } else if (isLoadingData) {
        // CASO 2: Usuario existe, pero los datos aún están cargando -> Mostrar Carga
        return <LoadingScreen />;
    } else {
        // CASO 3: Usuario existe y la data cargó -> Determinar Home o LevelSelect
        initialRouteName = (userData?.level) 
            ? 'Home'      
            : 'LevelSelect'; 
    }
    // ----------------------------------------
    
    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName={initialRouteName}
                screenOptions={{
                    headerShown: false, // Ocultamos el header nativo de React Navigation
                    animation: 'slide_from_right'
                }}
            >
                {/* Flujo de Autenticación */}
                <Stack.Screen name="Auth" component={AuthScreen} />

                {/* Flujo de Configuración Inicial (Obligatorio) */}
                <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />

                {/* Flujo Principal de la App */}
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SkillDetails" component={SkillTestSelectScreen} /> 
                <Stack.Screen name="Testing" component={TestingScreen} />
                <Stack.Screen name="Results" component={TestResultsScreen} />
                
                {/* RUTAS DE VOCABULARIO */}
                <Stack.Screen name="VocabLevels" component={VocabularyLevelSelectScreen} />
                <Stack.Screen name="VocabCategories" component={VocabularyCategorySelectScreen} />
                <Stack.Screen name="VocabDetail" component={VocabularyDetailScreen} />
                
                {/* RUTA DE CRÉDITOS */}
                <Stack.Screen name="About" component={AboutScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GlobalStyles.backgroundLight.color,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: GlobalStyles.textColor.color,
    },
});