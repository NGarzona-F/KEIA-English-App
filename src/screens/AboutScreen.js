import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
// Importación original: Usamos GlobalStyles estático para la estabilidad.
import { GlobalStyles } from '../styles/GlobalStyles'; 

export default function AboutScreen({ navigation }) {
    
    // Datos proporcionados por el usuario
    const credits = [
        { role: 'Aplicación Creada por:', name: 'BIOSAI' },
        { role: 'CEOs:', name: 'Jorge Sanchez, Nestor Garzona' },
        { role: 'Soporte Técnico:', name: 'William Garzona' },
        { role: 'Diseñadora:', name: 'Sucely Mejia' },
        { role: 'Marketing:', name: 'Tania Garcia' },
    ];
    
    // NOTA: El Switch de Modo Oscuro se convierte en un simple View para no usar Hooks.
    // La funcionalidad de alternar el modo oscuro ha sido eliminada para la estabilidad.

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AntDesign name="arrowleft" size={24} color={GlobalStyles.textColor.color} />
                </TouchableOpacity>
                <Text style={styles.title}>Acerca de KeIA</Text>
                <View style={styles.spacer} />
            </View>
            
            <ScrollView contentContainerStyle={styles.content}>
                
                {/* --- SECCIÓN DE CONFIGURACIÓN (Switch simulado como View) --- */}
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsTitle}>Ajustes</Text>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingText}>Modo Oscuro (Próximamente)</Text>
                        <Switch
                            trackColor={{ false: GlobalStyles.mediumGray.color, true: GlobalStyles.secondaryColor.color }}
                            thumbColor={GlobalStyles.white.color}
                            value={false} // Siempre falso ya que la funcionalidad fue deshabilitada
                            disabled={true}
                        />
                    </View>
                </View>
                {/* ----------------------------------------------------------------- */}

                <Icon name="robot-happy-outline" size={80} color={GlobalStyles.secondaryColor.color} style={styles.logoIcon} />
                <Text style={styles.appName}>KeIA - Smart English Tutor</Text>
                <Text style={styles.version}>Versión 1.0.0 (Build Estable)</Text>
                
                <View style={styles.creditsContainer}>
                    <Text style={styles.creditsTitle}>Créditos de Desarrollo</Text>
                    {credits.map((item, index) => (
                        <View key={index} style={styles.creditItem}>
                            <Text style={styles.creditRole}>{item.role}</Text>
                            <Text style={styles.creditName}>{item.name}</Text>
                        </View>
                    ))}
                </View>
                
                <View style={styles.legalContainer}>
                    <Text style={styles.legalText}>© {new Date().getFullYear()} BIOSAI. Todos los derechos reservados.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
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
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: GlobalStyles.textColor.color,
    },
    spacer: {
        width: 34,
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    
    // --- ESTILOS DE CONFIGURACIÓN ---
    settingsSection: {
        width: '100%',
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 15,
        padding: 20,
        ...GlobalStyles.shadow,
        shadowOpacity: 0.1,
        marginBottom: 30,
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyles.lightGray.color,
        paddingBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingText: {
        fontSize: 16,
        color: GlobalStyles.textColor.color,
    },
    // ---------------------------------

    logoIcon: {
        marginBottom: 10,
        marginTop: 15,
    },
    appName: {
        fontSize: 26,
        fontWeight: '900',
        color: GlobalStyles.textColor.color,
        marginBottom: 5,
    },
    version: {
        fontSize: 14,
        color: GlobalStyles.textLight.color,
        marginBottom: 30,
    },
    creditsContainer: {
        width: '100%',
        backgroundColor: GlobalStyles.white.color,
        borderRadius: 15,
        padding: 20,
        ...GlobalStyles.shadow,
        shadowOpacity: 0.1,
        marginBottom: 30,
    },
    creditsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: GlobalStyles.textColor.color,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: GlobalStyles.lightGray.color,
        paddingBottom: 10,
    },
    creditItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: GlobalStyles.lightGray.color,
    },
    creditRole: {
        fontSize: 15,
        fontWeight: '600',
        color: GlobalStyles.secondaryColor.color,
    },
    creditName: {
        fontSize: 15,
        color: GlobalStyles.textColor.color,
        textAlign: 'right',
    },
    legalContainer: {
        marginTop: 20,
    },
    legalText: {
        fontSize: 12,
        color: GlobalStyles.textLight.color,
        textAlign: 'center',
    }
});