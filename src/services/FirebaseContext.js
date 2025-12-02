import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    initializeAuth, 
    getReactNativePersistence, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    onSnapshot 
} from 'firebase/firestore';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// --- CONFIGURACIÓN GLOBAL DE LA BD (MANDATORY FOR CANVAS) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'english-app-default-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// TU CONFIGURACIÓN DE FIREBASE (Integrada directamente)
const firebaseConfig = {
    apiKey: "AIzaSyBMMbE-WD1OAAw_gvtW97YwMG1tH7qxbeM",
    authDomain: "keia-fa694.firebaseapp.com",
    projectId: "keia-fa694",
    storageBucket: "keia-fa694.firebasestorage.app",
    messagingSenderId: "865150753562",
    appId: "1:865150753562:web:c1829e2ea2927dc2006aa3",
};


// Initialize Firebase services
let db = null, auth = null; 

try {
    if (Object.keys(firebaseConfig).length !== 0) {
        const firebaseApp = initializeApp(firebaseConfig);
        
        // --- INICIALIZACIÓN DE AUTH CON PERSISTENCIA ---
        auth = initializeAuth(firebaseApp, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
        
        db = getFirestore(firebaseApp);
        console.log("✅ Firebase inicializado con éxito.");
    } else {
        console.error("❌ ERROR: La configuración de Firebase está vacía.");
    }
} catch (e) {
    console.error("❌ ERROR CRÍTICO al inicializar Firebase. Revisa la configuración:", e);
}


// Create a Context
const FirebaseContext = createContext(null);

/**
 * Provides core Firebase services via Context.
 */
export const FirebaseProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        if (!auth) {
            setIsAuthReady(true);
            return; 
        }

        // 1. Logic for initial Authentication
        const authenticate = async () => {
            const useCustomToken = typeof initialAuthToken === 'string' && initialAuthToken.length > 0;
            
            try {
                if (useCustomToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Custom token failed or timed out. Falling back to anonymous sign-in:", error);
                await signInAnonymously(auth); 
            }
        };

        // 2. Observe Auth State: 
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
            setIsAuthReady(true);
        });

        authenticate();
        return () => unsubscribe();
    }, []);

    const value = useMemo(() => ({ db, auth, userId, isAuthReady }), [userId, isAuthReady]);

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
};

// Custom Hook to use Firebase services
export const useFirebase = () => useContext(FirebaseContext);

/**
 * Custom Hook to manage user data (profile, skills, streak).
 */
export const useUserData = () => {
    const { db, auth, userId, isAuthReady } = useFirebase();
    const [userData, setUserData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const userDocRef = useMemo(() => {
        if (db && userId) {
            // Ruta de datos privados: artifacts/{appId}/users/{userId}/user_profile/profile
            return doc(db, `artifacts/${appId}/users/${userId}/user_profile`, 'profile');
        }
        return null;
    }, [db, userId]);

    const createInitialProfile = useCallback(async (level = null, username = 'Usuario KeIA') => {
        if (!userDocRef || !db) return;
        
        const initialData = {
            email: auth.currentUser?.email || 'anon@app.com',
            username: auth.currentUser?.displayName || username, 
            level: level, 
            streak: 0,
            xp: 0,
            skills: { 
                speaking: 0, 
                writing: 0, 
                listening: 0, 
                vocabulary: 0, 
                grammar: 0, 
                levelTest: 0, 
            },
            lastTestDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        try {
            await setDoc(userDocRef, initialData, { merge: true });
            setUserData(initialData);
        } catch (e) {
            console.error("Error creating initial profile:", e);
        }
    }, [userDocRef, auth, db]);

    useEffect(() => {
        if (!isAuthReady || !userDocRef || !db) {
            setIsLoadingData(true);
            return;
        }
        
        const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
            } else {
                const authUser = auth.currentUser;
                const nameFromAuth = authUser?.displayName || 'Usuario KeIA'; 
                await createInitialProfile(null, nameFromAuth); 
            }
            setIsLoadingData(false);
        }, (error) => {
            console.error("Error listening to user data:", error);
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, userDocRef, createInitialProfile, db, auth]);

    return { userData, isLoadingData, createInitialProfile, userDocRef };
};