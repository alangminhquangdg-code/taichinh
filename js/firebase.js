/**
 * FIREBASE CONFIGURATION & CLOUD SERVICES
 * Project: taichinhdemo-60707
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC9UV35gfpnIU3i49ObAD0gudQteUiigSo",
  authDomain: "taichinhdemo-60707.firebaseapp.com",
  projectId: "taichinhdemo-60707",
  storageBucket: "taichinhdemo-60707.firebasestorage.app",
  messagingSenderId: "615782721907",
  appId: "1:615782721907:web:c49defc996ba316cc93d06",
  measurementId: "G-EP6Q28WL81"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
export let analytics = null;
isAnalyticsSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
    logEvent(analytics, 'app_initialized');
    console.log("Firebase Analytics đã sẵn sàng:", firebaseConfig.measurementId);
  }
}).catch(err => {
  console.info("Analytics không khả dụng trong môi trường hiện tại:", err);
});

// Initialize Cloud Firestore
export const db = getFirestore(app);

/**
 * Đẩy toàn bộ dữ liệu State lên Firebase Cloud Firestore
 * @param {Object} state 
 * @param {string} familyCode 
 */
export async function syncStateToFirestore(state, familyCode = 'gia_dinh_chuan') {
  try {
    const docRef = doc(db, "family_finance", familyCode);
    const payload = JSON.parse(JSON.stringify(state)); // Sanitize
    payload.lastSyncedAt = new Date().toISOString();
    
    await setDoc(docRef, payload);
    return { success: true, timestamp: payload.lastSyncedAt };
  } catch (error) {
    console.error("Lỗi đồng bộ Firebase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Tải dữ liệu State từ Firebase Cloud Firestore về máy
 * @param {string} familyCode 
 */
export async function fetchStateFromFirestore(familyCode = 'gia_dinh_chuan') {
  try {
    const docRef = doc(db, "family_finance", familyCode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "Chưa có bản lưu nào trên Cloud với Mã Gia Đình này." };
    }
  } catch (error) {
    console.error("Lỗi tải dữ liệu từ Firebase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Lắng nghe thay đổi dữ liệu thời gian thực từ Cloud
 * @param {string} familyCode 
 * @param {Function} onDataChange 
 */
export function subscribeToFirestore(familyCode, onDataChange) {
  try {
    const docRef = doc(db, "family_finance", familyCode);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onDataChange(docSnap.data());
      }
    }, (err) => {
      console.warn("Lỗi realtime sync Firebase:", err);
    });
  } catch (err) {
    console.warn("Không thể thiết lập lắng nghe Firebase:", err);
    return null;
  }
}
