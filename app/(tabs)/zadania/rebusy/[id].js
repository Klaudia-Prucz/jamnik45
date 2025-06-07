import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { rebusy } from './rebusy';
import { db } from '@/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function RebusZadanie() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [odpowiedz, setOdpowiedz] = useState('');
  const [status, setStatus] = useState(null); // 'correct' | 'wrong' | null
  const [zrobione, setZrobione] = useState(false);

  const rebus = rebusy.find((r) => r.id === id);

  useEffect(() => {
    // Resetuj stan przy zmianie rebusa
    setOdpowiedz('');
    setStatus(null);
    setZrobione(false);
  }, [id]);

  const sprawdzOdpowiedz = async () => {
    Keyboard.dismiss();
    const czysta = odpowiedz.trim().toLowerCase();
    const poprawna = rebus?.odpowiedz?.toLowerCase();

    if (czysta === poprawna) {
      setStatus('correct');
      setZrobione(true);

      try {
        const docRef = doc(db, 'appState', 'uczestnik1');
        const snap = await getDoc(docRef);
        const dane = snap.data();
        const poprzednie = dane?.rebusy || [];

        if (!poprzednie.includes(id)) {
          await updateDoc(docRef, {
            rebusy: [...poprzednie, id],
          });
        }
      } catch (err) {
        console.error('❌ Błąd zapisu do Firestore:', err);
      }
    } else {
      setStatus('wrong');
    }
  };

  const handleChange = (text) => {
    setOdpowiedz(text);
    if (status !== null) setStatus(null);
  };

  const gotowa = odpowiedz.trim().length > 0;

  if (!rebus) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <Text>Nie znaleziono rebusa.</Text>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/backstandard.png')}
      style={styles.tlo}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <Text style={styles.rebus}>{rebus.emojiRebus}</Text>

              <TextInput
                style={styles.input}
                placeholder="Twoja odpowiedź..."
                value={odpowiedz}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.button, !gotowa && styles.buttonDisabled]}
                onPress={sprawdzOdpowiedz}
                disabled={!gotowa}
              >
                <Text style={styles.buttonText}>Sprawdź</Text>
              </TouchableOpacity>

              {status === 'correct' && (
                <Text style={styles.success}>✅ Brawo! Poprawna odpowiedź!</Text>
              )}
              {status === 'wrong' && (
                <Text style={styles.error}>❌ Spróbuj jeszcze raz!</Text>
              )}

              <TouchableOpacity
                style={styles.powrot}
                onPress={() => router.push('/zadania/rebusy')}
              >
                <Text style={styles.powrotText}>← Wybierz inny rebus</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rebus: {
    fontSize: 48,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
    padding: 12,
    fontSize: 18,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#E76617',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  success: {
    color: 'green',
    fontSize: 18,
    marginTop: 12,
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginTop: 12,
  },
  powrot: {
    marginTop: 24,
  },
  powrotText: {
    fontSize: 16,
    color: '#3F51B5',
    fontWeight: '600',
  },
});
