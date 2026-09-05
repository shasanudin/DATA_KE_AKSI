// =====================================================
// Firebase Configuration - NIRBITA CORE
// =====================================================

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    onSnapshot, 
    query, 
    orderBy,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    where,
    limit,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
    authDomain: "data-ke-aksi-auth.firebaseapp.com",
    projectId: "data-ke-aksi-auth",
    storageBucket: "data-ke-aksi-auth.firebasestorage.app",
    messagingSenderId: "631382692174",
    appId: "1:631382692174:web:c10a099fb3021849eace1f",
    measurementId: "G-9NMBBB79EQ"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
    console.log('📁 Project ID:', firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    // Fallback: try to reinitialize
    try {
        app = initializeApp(firebaseConfig, 'nirbita-core');
        db = getFirestore(app);
        console.log('✅ Firebase reinitialized with fallback');
    } catch (fallbackError) {
        console.error('❌ Fallback initialization also failed:', fallbackError);
    }
}

// =====================================================
// Firebase Service Functions
// =====================================================

class FirebaseService {
    constructor(db) {
        this.db = db;
        this.collectionName = 'wilayah_desa';
        this.isConnected = false;
        this.listeners = [];
    }

    // Test connection
    async testConnection() {
        try {
            const testQuery = query(
                collection(this.db, this.collectionName),
                limit(1)
            );
            const snapshot = await getDocs(testQuery);
            this.isConnected = true;
            console.log('✅ Firebase connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Firebase connection test failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Get all wilayah data
    async getAllWilayah() {
        try {
            const q = query(
                collection(this.db, this.collectionName),
                orderBy("periode.tahun", "desc")
            );
            const snapshot = await getDocs(q);
            const data = [];
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log(`📊 Loaded ${data.length} wilayah records`);
            return data;
        } catch (error) {
            console.error('❌ Error loading wilayah data:', error);
            return [];
        }
    }

    // Real-time listener for wilayah data
    listenWilayah(callback) {
        try {
            const q = query(
                collection(this.db, this.collectionName),
                orderBy("periode.tahun", "desc")
            );
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = [];
                snapshot.forEach(doc => {
                    data.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                console.log(`📊 Real-time update: ${data.length} wilayah records`);
                this.isConnected = true;
                if (callback) callback(data);
            }, (error) => {
                console.error('❌ Real-time listener error:', error);
                this.isConnected = false;
                // Retry connection after 5 seconds
                setTimeout(() => {
                    console.log('🔄 Retrying Firebase connection...');
                    this.listenWilayah(callback);
                }, 5000);
            });
            
            this.listeners.push(unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error setting up listener:', error);
            return null;
        }
    }

    // Add new wilayah data
    async addWilayah(data) {
        try {
            const id = data.id || `wilayah_${Date.now()}`;
            const docRef = doc(this.db, this.collectionName, id);
            await setDoc(docRef, {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Added wilayah: ${id}`);
            return { success: true, id };
        } catch (error) {
            console.error('❌ Error adding wilayah:', error);
            return { success: false, error: error.message };
        }
    }

    // Update wilayah data
    async updateWilayah(id, data) {
        try {
            const docRef = doc(this.db, this.collectionName, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Updated wilayah: ${id}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating wilayah:', error);
            return { success: false, error: error.message };
        }
    }

    // Get single wilayah
    async getWilayah(id) {
        try {
            const docRef = doc(this.db, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            } else {
                return { success: false, error: 'Document not found' };
            }
        } catch (error) {
            console.error('❌ Error getting wilayah:', error);
            return { success: false, error: error.message };
        }
    }

    // Clean up listeners
    cleanup() {
        this.listeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners = [];
        console.log('🧹 Cleaned up Firebase listeners');
    }
}

// Create and export service instance
const firebaseService = new FirebaseService(db);

// Test connection on load
setTimeout(async () => {
    await firebaseService.testConnection();
}, 1000);

// Export both db and service
export { db, firebaseService };

// Export individual functions for backward compatibility
export {
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    where,
    limit,
    getDoc
};
