import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const docRef = doc(db, 'appState', 'uczestnik1');

export const getUserData = async () => {
  try {
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('Błąd pobierania danych:', e);
    return null;
  }
};

export const updateUserData = async (newData) => {
  try {
    await updateDoc(docRef, newData);
  } catch (e) {
    console.error('Błąd zapisu danych:', e);
  }
};
