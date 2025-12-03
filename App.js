import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { FirebaseProvider } from './src/services/FirebaseContext';
// DEBES ELIMINAR LA IMPORTACIÓN DE ThemeProvider SI ESTABA AQUÍ

// Omitir warnings
LogBox.ignoreAllLogs();

export default function App() {
  
  return (
    // Asegúrate de que solo FirebaseProvider envuelve el AppNavigator
    <FirebaseProvider>
        <AppNavigator />
    </FirebaseProvider>
  );
}