import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const pytania = [
  { pytanie: 'Ile nóg ma pająk?', odpowiedzi: ['6', '8', '10'], poprawna: '8' },
  { pytanie: 'Stolica Francji to?', odpowiedzi: ['Berlin', 'Paryż', 'Rzym'], poprawna: 'Paryż' },
  { pytanie: 'Kolor nieba to?', odpowiedzi: ['Zielony', 'Niebieski', 'Czerwony'], poprawna: 'Niebieski' },
];

export default function SzybkiQuiz({ onSuccess }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [status, setStatus] = useState('ready'); // ready | playing | win | fail

  useEffect(() => {
    if (status === 'playing') {
      setStartTime(Date.now());
    }
  }, [status]);

  const oznaczGreJakoUkonczona = async () => {
    const docRef = doc(db, 'appState', 'uczestnik1');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const dane = snap.data();
      const ukonczone = dane.zrecznosciowe || [];
      if (!ukonczone.includes('szybkiquiz')) {
        await updateDoc(docRef, {
          zrecznosciowe: [...ukonczone, 'szybkiquiz'],
        });
      }
    }
  };

  const handleAnswer = (odp) => {
    if (odp === pytania[index].poprawna) {
      setScore(score + 1);
    }

    if (index + 1 < pytania.length) {
      setIndex(index + 1);
    } else {
      const czas = (Date.now() - startTime) / 1000;
      if (score + 1 === pytania.length && czas <= 15) {
        setStatus('win');
        oznaczGreJakoUkonczona();
        onSuccess?.();
      } else {
        setStatus('fail');
      }
    }
  };

  const startGame = () => {
    setIndex(0);
    setScore(0);
    setStatus('playing');
  };

  const goBack = () => {
    router.replace('/zadania/zrecznosciowe');
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          {status === 'ready' && (
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          )}

          {status === 'playing' && (
            <View>
              <Text style={styles.pytanie}>{pytania[index].pytanie}</Text>
              {pytania[index].odpowiedzi.map((o, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.odpowiedzBtn}
                  onPress={() => handleAnswer(o)}
                >
                  <Text style={styles.odpowiedzText}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {status === 'win' && (
            <>
              <Text style={styles.result}>✅ Udało się! Odpowiedzi w dobrym czasie!</Text>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>⬅ Wróć do zestawu gier</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'fail' && (
            <>
              <Text style={styles.result}>❌ Za wolno lub błędne odpowiedzi</Text>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>⬅ Wróć do zestawu gier</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  wrapper: { flex: 1, padding: 16, justifyContent: 'center' },
  pytanie: { color: '#fff', fontSize: 22, textAlign: 'center', marginBottom: 16 },
  odpowiedzBtn: {
    backgroundColor: '#E76617',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 6,
    alignSelf: 'center',
  },
  odpowiedzText: {
    color: '#fff',
    fontSize: 18,
  },
  startButton: {
    backgroundColor: '#E76617',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  startText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  result: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    alignSelf: 'center',
    backgroundColor: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
