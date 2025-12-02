import React from 'react';
import { StatusBar } from 'react-native';

// Importamos el proveedor de Firebase (FirebaseContext.js)
import { FirebaseProvider } from './src/services/FirebaseContext'; 

// Importamos el NUEVO componente de navegación
import AppNavigator from './src/navigation/AppNavigator'; 

// --- Componente Raíz ---
export default function App() {
    return (
        // Envolvemos toda la app en el FirebaseProvider para que todas las pantallas accedan a la BD
        <FirebaseProvider>
            <StatusBar barStyle="dark-content" />
            <AppNavigator />
        </FirebaseProvider>
    );
}