// HomeScreen.js — Estilo "Duolingo" (lista de tarjetas, avatar, barra de XP)
// VERSION: coherence removido
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, Pressable, Dimensions, SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFirebase, useUserData } from '../services/FirebaseContext';
import { GlobalStyles } from '../styles/GlobalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
const CARD_HORIZONTAL_PADDING = 18; // coincide con container padding
const CARD_WIDTH = screenWidth - (CARD_HORIZONTAL_PADDING * 2);

const LEVEL_LABELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const XP_PER_LEVEL = 100;

export default function HomeScreen({ navigation }) {
  // Hooks (always same order)
  const { auth } = useFirebase();
  const { userData, isLoadingData } = useUserData();
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Icons & colors (coherence removed)
  const skillIcons = {
    speaking: 'account-voice',
    writing: 'pencil',
    vocabulary: 'book-open-variant',
    grammar: 'puzzle',
    listening: 'headphones',
    levelTest: 'medal',
  };

  const skillColors = {
    speaking: '#FF4B4B',
    writing: '#1CB0F6',
    vocabulary: '#FFC800',
    grammar: '#9B4DFF',
    listening: '#FF7F00',
    levelTest: GlobalStyles.primaryColor?.color || '#1CB0F6',
  };

  // Menu actions
  const handleLogout = async () => {
    setIsMenuVisible(false);
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      alert('No se pudo cerrar sesión. Intenta de nuevo.');
    }
  };

  const handleSettings = () => {
    setIsMenuVisible(false);
    alert('Configuración aún no implementada.');
  };

  // --- MODIFICACIÓN DE NAVEGACIÓN ---
  const handleNavigateToSkill = (skillName, currentLevel) => {
    setIsMenuVisible(false);
    
    if (skillName === 'vocabulary') {
        // Nueva ruta para la selección de niveles de vocabulario
        navigation.navigate('VocabLevels'); 
    } else {
        // Las demás habilidades van a la selección de tests (SkillTestSelectScreen)
        navigation.navigate('SkillDetails', { skill: skillName, userLevel: currentLevel });
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={GlobalStyles.primaryColor.color} />
        <Text style={{ marginTop: 15, color: GlobalStyles.textLight.color }}>Cargando tu perfil...</Text>
      </View>
    );
  }

  // User data (fallbacks)
  const {
    username = 'Usuario',
    level = 1,
    xp = 0,
    streak = 0,
    skills = {}
  } = userData || {};

  const displayName = username && username.length ? username : 'Usuario';

  // CEFR mapping (assumes level is numeric 1..6 mapping to LEVEL_LABELS)
  const levelNumber = Math.max(1, Math.floor(Number(level) || 1));
  const currentIndex = Math.min(LEVEL_LABELS.length - 1, levelNumber - 1);
  const currentLabel = LEVEL_LABELS[currentIndex] || `Nivel ${levelNumber}`;
  const nextIndex = Math.min(LEVEL_LABELS.length - 1, currentIndex + 1);
  const nextLabel = LEVEL_LABELS[nextIndex];
  const isMaxLevel = currentIndex >= LEVEL_LABELS.length - 1;

  // XP progress inside current level (simple modulo approach)
  const xpWithinLevel = xp % XP_PER_LEVEL;
  const xpToNextLevel = isMaxLevel ? 0 : (XP_PER_LEVEL - xpWithinLevel);
  const progressPercentage = isMaxLevel ? 100 : Math.round((xpWithinLevel / XP_PER_LEVEL) * 100);

  // ensure skills (coherence excluded)
  const allSkills = {
    speaking: skills.speaking ?? 0,
    writing: skills.writing ?? 0,
    vocabulary: skills.vocabulary ?? 0,
    grammar: skills.grammar ?? 0,
    listening: skills.listening ?? 0,
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Drawer Modal (sin cambios) */}
      <Modal
        animationType="fade"
        transparent
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsMenuVisible(false)}>
          <SafeAreaView edges={['top', 'right', 'bottom']} style={[styles.drawerSafeArea, { paddingTop: Math.max(18, insets.top + 12) }]}>
            <View style={styles.drawerContent}>
              <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setIsMenuVisible(false)}>
                <Icon name="close" size={28} color={GlobalStyles.textColor.color} />
              </TouchableOpacity>

              <View style={styles.drawerHeader}>
                <View style={styles.avatarBig}>
                  <Text style={styles.avatarBigText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.drawerName}>{displayName}</Text>
                  <Text style={styles.drawerLevel}>{currentLabel}</Text>
                </View>
              </View>

              <View style={styles.drawerBody}>
                <TouchableOpacity onPress={handleSettings} style={styles.drawerItem}>
                  <Icon name="cog-outline" size={24} color={GlobalStyles.textColor.color} />
                  <Text style={styles.drawerText}>Configuración</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout} style={styles.drawerItem}>
                  <Icon name="logout" size={24} color={GlobalStyles.errorColor.color} />
                  <Text style={[styles.drawerText, { color: GlobalStyles.errorColor.color }]}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header (sin cambios) */}
          <View style={[styles.header, { paddingTop: Math.max(6, insets.top / 2) }]}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.headerHi}>¡Hola, {displayName}!</Text>
                <View style={styles.stats}>
                  <View style={styles.badge}>
                    <Icon name="star" size={14} color={GlobalStyles.accentColor.color || '#FFD700'} />
                    <Text style={styles.badgeText}>{currentLabel}</Text>
                  </View>

                  <View style={[styles.badge, { marginLeft: 10, backgroundColor: '#FFF4F2', borderColor: GlobalStyles.errorColor.color }]}>
                    <Icon name="fire" size={14} color={GlobalStyles.errorColor.color || '#FF4B4B'} />
                    <Text style={[styles.badgeText, { color: GlobalStyles.errorColor.color }]}>{streak}</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.menuBtn}>
              <Icon name="dots-vertical" size={28} color={GlobalStyles.textColor.color} />
            </TouchableOpacity>
          </View>

          {/* Progress Row (sin cambios) */}
          <View style={styles.levelRow}>
            <Text style={styles.levelRowText}>{currentLabel} {isMaxLevel ? '' : `→ ${nextLabel}`}</Text>
            <View style={styles.xpPill}>
              {isMaxLevel ? <Text style={styles.xpPillText}>Nivel máximo</Text> : <Text style={styles.xpPillText}>{xpWithinLevel}/{XP_PER_LEVEL} XP</Text>}
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            <Text style={styles.progressText}>{isMaxLevel ? '¡Has alcanzado el nivel máximo!' : `${xpToNextLevel} XP para ${nextLabel}`}</Text>
          </View>

          <Text style={styles.sectionTitle}>Practica tus Habilidades</Text>

          {/* Cards (one per row) */}
          <View style={styles.cardsColumn}>
            {Object.entries(allSkills).map(([skillName, score]) => (
              <TouchableOpacity
                key={skillName}
                activeOpacity={0.9}
                // --- CAMBIO AQUÍ: Usamos la nueva función de navegación ---
                onPress={() => handleNavigateToSkill(skillName, levelNumber)}
                style={[styles.cardRow, { borderColor: skillColors[skillName] ?? '#DDD' }]}
              >
                <View style={[styles.cardRowAccent, { backgroundColor: (skillColors[skillName] ?? '#AAA') + '20' }]} />

                <View style={styles.cardRowContent}>
                  <View style={[styles.iconCircle, { backgroundColor: (skillColors[skillName] ?? '#AAA') }]}>
                    <Icon name={skillIcons[skillName] ?? 'help-circle-outline'} size={28} color="#fff" />
                  </View>

                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{skillName.charAt(0).toUpperCase() + skillName.slice(1)}</Text>
                    <Text style={styles.cardSubtitle}>
                      {skillName === 'speaking' ? 'Pronunciación' :
                        skillName === 'writing' ? 'Gramática' :
                        skillName === 'vocabulary' ? 'Vocabulario' :
                        skillName === 'grammar' ? 'Ejercicios' :
                        skillName === 'listening' ? 'Listening' : 'Practica'}
                    </Text>
                  </View>

                  <View style={styles.cardRight}>
                    <Text style={styles.cardScore}>Puntaje {score}%</Text>
                    <TouchableOpacity onPress={() => handleNavigateToSkill(skillName, levelNumber)} style={[styles.goBtn, { borderColor: skillColors[skillName] ?? '#CCC' }]}>
                      <Text style={[styles.goText, { color: skillColors[skillName] ?? '#333' }]}>GO</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Level Test button (sin cambios) */}
          <TouchableOpacity onPress={() => handleNavigateToSkill('levelTest', levelNumber)} style={styles.levelButton}>
            <View style={styles.levelButtonContent}>
              <Icon name="medal" size={18} color="#fff" />
              <Text style={styles.levelButtonText}>TEST DE NIVEL</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: Math.max(16, insets.bottom) }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GlobalStyles.backgroundLight || '#FBFCFF' },
  container: { padding: CARD_HORIZONTAL_PADDING, alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
    alignItems: 'center'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: GlobalStyles.secondaryColor?.color || '#1CB0F6',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
    ...GlobalStyles.shadow
  },
  avatarText: { fontSize: 22, color: '#fff', fontWeight: '800' },
  headerHi: { fontSize: 20, fontWeight: '800', color: GlobalStyles.textColor.color || '#222' },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F8FF', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16,
    borderWidth: 0, alignSelf: 'flex-start'
  },
  badgeText: { marginLeft: 6, fontWeight: '800', color: GlobalStyles.textColor.color || '#333' },
  menuBtn: { padding: 8, borderRadius: 20 },

  levelRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  levelRowText: { fontSize: 16, fontWeight: '800', color: GlobalStyles.textColor.color || '#222' },
  xpPill: {
    backgroundColor: GlobalStyles.lightGray?.color || '#EEE',
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12
  },
  xpPillText: { fontWeight: '800', color: GlobalStyles.textColor.color || '#333' },

  progressBar: {
    width: '100%', backgroundColor: '#E7EDF7', height: 18, borderRadius: 50, overflow: 'hidden',
    marginBottom: 18, justifyContent: 'center'
  },
  progressFill: { backgroundColor: GlobalStyles.primaryColor?.color || '#1CB0F6', height: '100%', borderRadius: 50 },
  progressText: { position: 'absolute', alignSelf: 'center', fontWeight: '700', color: GlobalStyles.textColor.color || '#333' },

  sectionTitle: { width: '100%', fontSize: 20, fontWeight: '800', marginBottom: 12, color: GlobalStyles.textColor.color || '#222' },

  cardsColumn: { width: '100%', marginBottom: 12 },

  cardRow: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 3,
    overflow: 'hidden',
    ...GlobalStyles.shadow
  },
  cardRowAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: '#00000010'
  },
  cardRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 22,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  cardText: { flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: GlobalStyles.textColor.color || '#222' },
  cardSubtitle: { fontSize: 14, color: GlobalStyles.textLight.color || '#777', marginTop: 6 },

  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  cardScore: { fontWeight: '800', color: GlobalStyles.textLight.color || '#666', marginBottom: 8 },
  goBtn: {
    borderWidth: 1.6, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10
  },
  goText: { fontWeight: '900' },

  levelButton: { width: '100%', paddingVertical: 10, marginTop: 4 },
  levelButtonContent: {
    backgroundColor: GlobalStyles.primaryColor?.color || '#1CB0F6',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'
  },
  levelButtonText: { color: '#fff', fontWeight: '900', marginLeft: 8, fontSize: 15 },

  /* Drawer styles */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'flex-end' },
  drawerSafeArea: { width: screenWidth * 0.78, backgroundColor: '#fff', height: '100%' },
  drawerContent: { flex: 1, paddingHorizontal: 18 },
  drawerCloseBtn: { alignSelf: 'flex-end', marginBottom: 6, padding: 6 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#EEE', paddingBottom: 14, marginBottom: 14 },
  avatarBig: { width: 66, height: 66, borderRadius: 33, backgroundColor: GlobalStyles.secondaryColor?.color || '#1CB0F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarBigText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  drawerName: { fontSize: 18, fontWeight: '900', color: GlobalStyles.textColor.color || '#222' },
  drawerLevel: { fontSize: 14, color: GlobalStyles.textLight.color || '#777' },
  drawerBody: { marginTop: 6 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  drawerText: { fontSize: 16, marginLeft: 12, fontWeight: '700', color: GlobalStyles.textColor.color || '#222' },
});