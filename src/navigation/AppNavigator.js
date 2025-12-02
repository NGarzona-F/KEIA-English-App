import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Importamos Hooks del contexto
import { useFirebase, useUserData } from '../services/FirebaseContext'; 
import { GlobalStyles } from '../styles/GlobalStyles'; 

// Importamos todas las pantallas
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import LevelSelectScreen from '../screens/LevelSelectScreen';
import TestingScreen from '../screens/TestingScreen';
import TestResultsScreen from '../screens/TestResultsScreen';

// --- NUEVAS PANTALLAS (Asegúrate de que existan en la carpeta screens) ---
import SkillTestSelectScreen from '../screens/SkillTestSelectScreen'; // <--- SkillDetailScreen renombrado
import VocabularyLevelSelectScreen from '../screens/VocabularyLevelSelectScreen';
import VocabularyCategorySelectScreen from '../screens/VocabularyCategorySelectScreen';
import VocabularyDetailScreen from '../screens/VocabularyDetailScreen';
// --- FIN NUEVAS PANTALLAS ---

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
    let initialRouteName = 'Auth'; 

    if (userId) {
        // Si el usuario está autenticado, pero los datos (perfil/nivel) no han cargado, mostramos carga.
        if (isLoadingData) {
            return <LoadingScreen />;
        }
        
        // Si ya cargamos los datos del usuario:
        initialRouteName = (userData && userData.level) 
            ? 'Home'       // Si tiene nivel, va al Dashboard
            : 'LevelSelect'; // Si no tiene nivel, va a selección de nivel
    } else {
        initialRouteName = 'Auth'; // Si no tiene userId, va a Login/Registro.
    }
    
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
                
                {/* Pantalla de selección de tests (ex-SkillDetailScreen) */}
                <Stack.Screen name="SkillDetails" component={SkillTestSelectScreen} /> 
                
                {/* Rutas de Testing */}
                <Stack.Screen name="Testing" component={TestingScreen} />
                <Stack.Screen name="Results" component={TestResultsScreen} />

                {/* --- NUEVAS RUTAS DE VOCABULARIO --- */}
                <Stack.Screen name="VocabLevels" component={VocabularyLevelSelectScreen} />
                <Stack.Screen name="VocabCategories" component={VocabularyCategorySelectScreen} />
                <Stack.Screen name="VocabDetail" component={VocabularyDetailScreen} />
                {/* --- FIN NUEVAS RUTAS DE VOCABULARIO --- */}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4b5563',
    }
});