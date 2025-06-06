import { db, storage } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

export default function ZadanieSpecjalne() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [zaladowane, setZaladowane] = useState(false);
  const [zapisaneUrl, setZapisaneUrl] = useState(null);
  const [przesylanie, setPrzesylanie] = useState(false);

  // 📥 Pobierz URL zdjęcia jeśli już istnieje
  useEffect(() => {
    const pobierzDane = async () => {
      const docRef = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dane = snap.data();
        const zadanie = dane?.specjalne?.[id];
        if (zadanie?.url) {
          setZapisaneUrl(zadanie.url);
          setZaladowane(true);
        }
      }
    };
    pobierzDane();
  }, [id]);

  const wybierzZdjecie = async () => {
    setPrzesylanie(true);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      console.log('📷 Wybrane zdjęcie:', uri);

      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log('🧪 Blob utworzony:', blob);

        const nazwaPliku = `specjalne/${id}.jpg`;
        const storageRef = ref(storage, nazwaPliku);
        console.log('☁️ Rozpoczynam przesyłanie do Firebase Storage...');

        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('❌ Błąd uploadu:', error);
            setPrzesylanie(false);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('✅ URL do zdjęcia:', downloadUrl);

            const docRef = doc(db, 'appState', 'uczestnik1');
            await updateDoc(docRef, {
              [`specjalne.${id}`]: {
                url: downloadUrl,
                timestamp: Date.now(),
              },
            });

            setZapisaneUrl(downloadUrl);
            setZaladowane(true);
            setPrzesylanie(false);
          }
        );
      } catch (err) {
        console.error('❌ Upload całkowicie nieudany:', err);
        setPrzesylanie(false);
      }
    } else {
      setPrzesylanie(false);
    }
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.tytul}>📸 Zadanie specjalne {id}</Text>

        {zaladowane && zapisaneUrl ? (
          <Image source={{ uri: zapisaneUrl }} style={styles.zdjecie} />
        ) : (
          <Text style={styles.info}>Nie przesłano jeszcze zdjęcia</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={wybierzZdjecie} disabled={przesylanie}>
          <Text style={styles.buttonText}>
            {przesylanie ? 'Przesyłanie...' : zaladowane ? 'Zmień zdjęcie' : 'Prześlij zdjęcie'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania/specjalne')}>
          <Text style={styles.powrotText}>← Powrót do listy zadań</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tytul: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  zdjecie: {
    width: 300,
    height: 300,
    borderRadius: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E76617',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  powrot: {
    marginTop: 10,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
