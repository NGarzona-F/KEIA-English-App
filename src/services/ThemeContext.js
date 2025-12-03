import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // 1. Inicializar con el esquema del sistema (claro/oscuro) por defecto
    const colorScheme = Appearance.getColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

    // 2. Escuchar cambios del sistema (si el usuario lo cambia en el teléfono)
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setIsDarkMode(colorScheme === 'dark');
        });
        return () => subscription.remove();
    }, []);

    // 3. Función para alternar (usada por el Switch)
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const value = useMemo(() => ({
        isDarkMode,
        toggleDarkMode,
    }), [isDarkMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};