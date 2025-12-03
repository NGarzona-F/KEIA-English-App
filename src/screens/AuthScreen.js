// AuthScreen.js — Colorido + animado (sin nave), preparado para teclado

import React, { useState, useEffect, useRef } from 'react';

import {

  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,

  SafeAreaView, KeyboardAvoidingView, Platform, Animated, Easing, Dimensions, ScrollView

} from 'react-native';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { useFirebase, useUserData } from '../services/FirebaseContext';

import { GlobalStyles } from '../styles/GlobalStyles';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');



export default function AuthScreen() {

  const { auth } = useFirebase();

  const { createInitialProfile } = useUserData();



  // form state

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [username, setUsername] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);



  // Animated values

  const cardAnim = useRef(new Animated.Value(0)).current;      // entry

  const bgPulse = useRef(new Animated.Value(0)).current;      // background subtle pulse

  const btnScale = useRef(new Animated.Value(1)).current;     // button press

  const emojiScale = useRef(new Animated.Value(1)).current;   // emoji bounce



  // Stars opacities (array)

  const starOpacities = useRef([

    new Animated.Value(0.25),

    new Animated.Value(0.28),

    new Animated.Value(0.2),

    new Animated.Value(0.3),

    new Animated.Value(0.22),

  ]).current;



  // Keep loops to stop on unmount

  const loopsRef = useRef([]);



  useEffect(() => {

    // Entry animation + background pulse + emoji bounce

    const entry = Animated.timing(cardAnim, { toValue: 1, duration: 580, easing: Easing.out(Easing.cubic), useNativeDriver: true });

    const pulseLoop = Animated.loop(Animated.sequence([

      Animated.timing(bgPulse, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),

      Animated.timing(bgPulse, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),

    ]));

    const emojiLoop = Animated.loop(Animated.sequence([

      Animated.timing(emojiScale, { toValue: 1.06, duration: 450, useNativeDriver: true }),

      Animated.timing(emojiScale, { toValue: 1.0, duration: 450, useNativeDriver: true }),

    ]));



    entry.start();

    pulseLoop.start();

    emojiLoop.start();



    // stars twinkle

    const starLoops = starOpacities.map((anim, i) =>

      Animated.loop(

        Animated.sequence([

          Animated.timing(anim, { toValue: 1, duration: 700 + i * 140, useNativeDriver: true }),

          Animated.timing(anim, { toValue: 0.2, duration: 900 + i * 160, useNativeDriver: true }),

        ])

      )

    );

    Animated.stagger(120, starLoops).start();



    loopsRef.current = [pulseLoop, emojiLoop, ...starLoops];



    return () => {

      loopsRef.current.forEach(loop => {

        try { loop.stop(); } catch (e) { /* ignore */ }

      });

    };

  }, [cardAnim, bgPulse, emojiScale, starOpacities]);



  // Button press animation helpers

  const onPressInBtn = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, friction: 7 }).start();

  const onPressOutBtn = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 7 }).start();



  // Animated styles

  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

  const cardOpacity = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const bgScale = bgPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  const bgOpacity = bgPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });



  // Auth submit logic (same as tuya)

  const isButtonDisabled = loading || email.trim() === '' || password.trim() === '' || (!isLogin && username.trim() === '');



  const handleSubmit = async () => {

    setError('');

    setLoading(true);

    if (!auth) {

      setError("Error de inicialización de Firebase.");

      setLoading(false);

      return;

    }



    try {

      if (isLogin) {

        await signInWithEmailAndPassword(auth, email.trim(), password);

      } else {

        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

        await updateProfile(userCredential.user, { displayName: username.trim() });

        await createInitialProfile(userCredential.user.uid, username.trim());

      }

    } catch (err) {

      let errorMessage = "Error de autenticación. Verifica tus datos.";

      const m = (err?.message || '').toLowerCase();

      if (m.includes('weak-password')) errorMessage = 'La contraseña debe tener al menos 6 caracteres.';

      else if (m.includes('email-already-in-use')) errorMessage = 'Este correo ya está registrado.';

      else if (m.includes('invalid-email')) errorMessage = 'El formato del correo electrónico no es válido.';

      else if (m.includes('user-not-found') || m.includes('wrong-password')) errorMessage = 'Credenciales incorrectas.';

      setError(errorMessage);

    } finally {

      setLoading(false);

    }

  };



  const toggleMode = () => {

    setIsLogin(prev => !prev);

    setError('');

    setEmail(''); setPassword(''); setUsername('');

  };



  return (

    <SafeAreaView style={styles.container}>

      {/* Animated background circles */}

      <Animated.View style={[styles.bgCircleTop, { transform: [{ scale: bgScale }], opacity: bgOpacity }]} />

      <Animated.View style={[styles.bgCircleBottom, { transform: [{ scale: bgScale }], opacity: bgOpacity }]} />



      {/* Stars */}

      <Animated.View style={[styles.star, { top: 44, left: SCREEN_W * 0.12, opacity: starOpacities[0] }]} />

      <Animated.View style={[styles.star, { top: 96, left: SCREEN_W * 0.7, opacity: starOpacities[1] }]} />

      <Animated.View style={[styles.star, { top: 26, left: SCREEN_W * 0.46, opacity: starOpacities[2] }]} />

      <Animated.View style={[styles.star, { top: SCREEN_H * 0.12, left: SCREEN_W - 48, opacity: starOpacities[3] }]} />

      <Animated.View style={[styles.star, { top: SCREEN_H * 0.18, left: SCREEN_W * 0.33, opacity: starOpacities[4] }]} />



      {/* Content with KeyboardAvoiding and ScrollView so keyboard won't cover the button */}

      <KeyboardAvoidingView

        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

        style={styles.keyboardContainer}

        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}

      >

        <ScrollView

          contentContainerStyle={styles.scrollContent}

          keyboardShouldPersistTaps="handled"

        >

          <Animated.View style={[styles.card, { transform: [{ translateY: cardTranslateY }], opacity: cardOpacity }]}>

            <View style={styles.header}>

              <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiScale }] }]}>

                {isLogin ? '👋' : '🚀'}

              </Animated.Text>



              <Text style={styles.title}>{isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu perfil KeIA'}</Text>

              <Text style={styles.subtitle}>{isLogin ? 'Sigue practicando cada día' : 'Comienza tu viaje espacial de aprendizaje'}</Text>

            </View>



            <View style={styles.form}>

              {!isLogin && (

                <View style={styles.inputWrap}>

                  <Icon name="account" size={20} color={GlobalStyles.textLight.color} style={styles.inputIcon} />

                  <TextInput

                    placeholder="Nombre de usuario"

                    value={username}

                    onChangeText={setUsername}

                    autoCapitalize="words"

                    style={styles.input}

                    placeholderTextColor={GlobalStyles.textLight.color}

                    returnKeyType="next"

                  />

                </View>

              )}



              <View style={styles.inputWrap}>

                <Icon name="email-outline" size={20} color={GlobalStyles.textLight.color} style={styles.inputIcon} />

                <TextInput

                  placeholder="Correo electrónico"

                  value={email}

                  onChangeText={setEmail}

                  keyboardType="email-address"

                  autoCapitalize="none"

                  style={styles.input}

                  placeholderTextColor={GlobalStyles.textLight.color}

                  textContentType="emailAddress"

                  returnKeyType="next"

                />

              </View>



              <View style={styles.inputWrap}>

                <Icon name="lock-outline" size={20} color={GlobalStyles.textLight.color} style={styles.inputIcon} />

                <TextInput

                  placeholder="Contraseña (min 6)"

                  value={password}

                  onChangeText={setPassword}

                  secureTextEntry={!showPassword}

                  style={[styles.input, { paddingRight: 44 }]}

                  placeholderTextColor={GlobalStyles.textLight.color}

                  autoCapitalize="none"

                  textContentType="password"

                  returnKeyType="done"

                />

                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(s => !s)}>

                  <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={GlobalStyles.textLight.color} />

                </TouchableOpacity>

              </View>



              {error ? <Text style={GlobalStyles.errorText}>{error}</Text> : <View style={{ height: 8 }} />}



              {/* Submit button */}

              <Animated.View style={[styles.submitWrap, { transform: [{ scale: btnScale }] }]}>

                <TouchableOpacity

                  onPressIn={onPressInBtn}

                  onPressOut={onPressOutBtn}

                  onPress={handleSubmit}

                  disabled={isButtonDisabled}

                  activeOpacity={0.9}

                  style={[

                    styles.submitBtn,

                    isLogin ? styles.secondaryBtn : styles.primaryBtn,

                    isButtonDisabled && styles.disabledBtn

                  ]}

                >

                  {loading ? <ActivityIndicator color="#fff" /> : (

                    <Text style={styles.submitText}>{isLogin ? 'ENTRAR AHORA' : 'EMPEZAR AHORA'}</Text>

                  )}

                </TouchableOpacity>

              </Animated.View>



              <TouchableOpacity onPress={toggleMode} disabled={loading} style={styles.toggleWrap}>

                <Text style={styles.toggleText}>{isLogin ? '¿Nuevo aquí? CREAR CUENTA' : '¿Ya tienes cuenta? INGRESAR'}</Text>

              </TouchableOpacity>

            </View>

          </Animated.View>



          {/* bottom spacing so keyboard doesn't hide content on small screens */}

          <View style={{ height: Platform.OS === 'ios' ? 30 : 60 }} />

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );

}



/* -------------------------

   Styles

   ------------------------- */

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: GlobalStyles.backgroundLight,

  },

  keyboardContainer: {

    flex: 1,

  },

  scrollContent: {

    flexGrow: 1,

    justifyContent: 'center',

    paddingHorizontal: 18,

    paddingVertical: 28,

  },



  // background elements

  bgCircleTop: {

    position: 'absolute',

    width: 380,

    height: 380,

    borderRadius: 190,

    backgroundColor: '#F4E8FF',

    top: -120,

    left: -70,

    opacity: 0.95,

  },

  bgCircleBottom: {

    position: 'absolute',

    width: 320,

    height: 320,

    borderRadius: 160,

    backgroundColor: '#D6F7FF',

    bottom: -90,

    right: -60,

    opacity: 0.95,

  },

  star: {

    position: 'absolute',

    width: 6,

    height: 6,

    borderRadius: 3,

    backgroundColor: '#FFF',

    shadowColor: '#fff',

    shadowOpacity: 0.4,

    elevation: 1,

  },



  card: {

    backgroundColor: '#ffffff',

    borderRadius: 20,

    padding: 22,

    ...GlobalStyles.shadow,

  },



  header: {

    alignItems: 'center',

    marginBottom: 14

  },

  emoji: { fontSize: 46, marginBottom: 6 },

  title: { fontSize: 22, fontWeight: '900', color: GlobalStyles.textColor.color, marginBottom: 4 },

  subtitle: { fontSize: 14, color: GlobalStyles.textLight.color },



  form: { marginTop: 8 },



  inputWrap: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#FBF9FF',

    borderRadius: 12,

    paddingHorizontal: 10,

    marginBottom: 12,

    borderWidth: 1,

    borderColor: '#F0E9FF'

  },

  inputIcon: { marginRight: 8 },

  input: {

    flex: 1,

    height: 48,

    fontSize: 15,

    color: GlobalStyles.textColor.color,

    paddingVertical: 8,

  },

  eyeBtn: {

    position: 'absolute',

    right: 12,

    padding: 6

  },



  submitWrap: {

    marginTop: 8

  },

  submitBtn: {

    height: 52,

    borderRadius: 14,

    alignItems: 'center',

    justifyContent: 'center',

    elevation: 3,

    shadowColor: '#000',

    shadowOpacity: 0.06,

    shadowRadius: 8

  },

  primaryBtn: {

    backgroundColor: '#7C4DFF',

  },

  secondaryBtn: {

    backgroundColor: '#1CB0F6',

  },

  disabledBtn: {

    opacity: 0.6

  },

  submitText: {

    color: '#fff',

    fontWeight: '900',

    fontSize: 15

  },



  toggleWrap: {

    marginTop: 12,

    alignItems: 'center'

  },

  toggleText: {

    color: '#6B21A8',

    fontWeight: '700'

  }

});