import { StyleSheet } from 'react-native';

// Definición de la Sombra para reutilización
const SHADOW = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Sombra más pronunciada
    shadowOpacity: 0.15, 
    shadowRadius: 5.46,
    elevation: 8,
};

export const GlobalStyles = StyleSheet.create({
    // --- COLORES ---
    primaryColor: '#58CC02', // Verde Duolingo
    secondaryColor: '#1CB0F6', // Azul de botones
    accentColor: '#FFC800', // Amarillo para estrellas/vocabulario
    errorColor: '#FF4B4B', // Rojo para errores
    tertiaryColor: '#AF24EC', // Morado para gramática

    textColor: '#4B4B4B', 
    textLight: '#777777', 
    white: '#FFFFFF',
    lightGray: '#F0F0F0', // Fondo de inputs, botones inactivos
    mediumGray: '#DDDDDD',
    darkGray: '#A0A0A0',
    backgroundLight: '#F7FCFF', // Fondo general

    // --- SOMBRAS Y ELEVACIÓN ---
    shadow: SHADOW, 

    // --- CONTENEDORES ---
    container: {
        flex: 1,
        backgroundColor: '#F7FCFF', 
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20, 
        padding: 25,
        width: '100%',
        maxWidth: 400,
        ...SHADOW, 
    },

    // --- TEXTO ---
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3C3C3C',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    sectionTitle: { 
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3C3C3C',
        marginTop: 20,
        marginBottom: 15,
        alignSelf: 'flex-start',
    },

    // --- INPUTS ---
    input: {
        borderWidth: 1, 
        borderColor: '#E5E5E5',
        borderRadius: 15, 
        paddingVertical: 18, 
        paddingHorizontal: 20,
        fontSize: 17, 
        color: '#4B4B4B',
        width: '100%',
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        ...SHADOW,
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    inputFocused: {
        borderColor: '#1CB0F6',
        borderWidth: 2, 
    },

    // --- BOTONES ---
    button: {
        paddingVertical: 18,
        paddingHorizontal: 25,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...SHADOW,
    },
    primaryButton: {
        backgroundColor: '#58CC02', 
        marginBottom: 10,
    },
    secondaryButton: { 
        backgroundColor: '#1CB0F6', 
        marginBottom: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 20, 
        fontWeight: 'bold',
    },
    textButton: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignSelf: 'center',
    },
    textButtonText: {
        color: '#1CB0F6',
        fontSize: 16,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    buttonDisabled: {
        backgroundColor: '#E0E0E0', 
        shadowOpacity: 0, 
        elevation: 0,
    },
    errorText: {
        color: '#FF4B4B', 
        fontSize: 14,
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 15,
        fontWeight: '600',
    }
});