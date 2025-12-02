// screens/VocabularyCategorySelectScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function VocabularyCategorySelectScreen({ route, navigation }) {
    const { vocabLevel, title: levelTitle } = route.params; 
    
    const categories = [
        { id: 'regular', name: 'REGULAR VERBS', subtitle: 'Regular Verbs', icon: 'human-dance', color: '#9B4DFF' },
        { id: 'irregular', name: 'IRREGULAR VERBS', subtitle: 'Irregular Verbs', icon: 'draw-pen', color: '#1CB0F6' },
        { id: 'phrasal', name: 'PHRASAL VERBS', subtitle: 'Basic Phrasal Verbs', icon: 'map-marker-distance', color: '#FF7F00' },
    ];

    const handleSelectCategory = (category) => {
        // Navegamos a la pantalla final que muestra la tabla de vocabulario
        navigation.navigate('VocabDetail', { 
            vocabLevel: vocabLevel,
            category: category.id,
            title: category.name,
            color: category.color,
        });
    };

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={GlobalStyles.textColor.color} />
                </TouchableOpacity>
                <Text style={styles.title}>BASIC VERBS</Text> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderTitle}>BASIC VERBS</Text>
                </View>
                
                <View style={styles.cardGrid}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.card}
                            onPress={() => handleSelectCategory(category)}
                            activeOpacity={0.9}
                        >
                            {/* Diseño Superior - Imagen y Título */}
                            <View style={[styles.topSection, {backgroundColor: category.color}]}>
                                <Text style={styles.topSectionTitle}>{category.name}</Text>
                                {/* Simulación de íconos/contenido específico de tu imagen */}
                                <View style={styles.iconContent}>
                                    <Icon name={category.icon} size={30} color={GlobalStyles.white.color} />
                                    <Text style={styles.iconText}>{category.subtitle.toUpperCase()}</Text>
                                </View>
                            </View>

                            {/* Diseño Inferior - Botón GO */}
                            <View style={styles.bottomSection}>
                                <Text style={styles.bottomSectionTitle}>{category.subtitle}</Text>
                                <TouchableOpacity style={[styles.goButton, { backgroundColor: category.color }]}>
                                    <Text style={styles.goButtonText}>Go</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
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
    },
    scrollContent: {
        padding: 20,
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
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    card: {
        width: '48%', 
        marginBottom: 20,
        borderRadius: 15,
        backgroundColor: GlobalStyles.white.color,
        ...GlobalStyles.shadow,
        overflow: 'hidden',
    },
    topSection: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 140, 
    },
    topSectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: GlobalStyles.white.color,
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    iconContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    iconText: {
        color: GlobalStyles.white.color,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    bottomSection: {
        padding: 15,
        alignItems: 'center',
    },
    bottomSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: GlobalStyles.textColor.color,
        marginBottom: 10,
    },
    goButton: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    goButtonText: {
        color: GlobalStyles.white.color,
        fontWeight: 'bold',
        fontSize: 16,
    }
});