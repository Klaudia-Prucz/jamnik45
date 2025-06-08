import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    ImageBackground,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ReakcjaGra({ onSuccess }) {
  const router = useRouter();
  const [status, setStatus] = useState('ready'); // ready | waiting | now | win | fail
  const [message, setMessage] = useState('Kliknij, aby rozpocząć');
  const [timeoutId, setTimeoutId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [successCount, setSuccessCount] = useState(0);

  const oznaczGreJakoUkonczona = async () => {
    const docRef = doc(db, 'appState', 'uczestnik1');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const dane = snap.data();
      const ukonczone = dane.zrecznosciowe || [];
      if (!ukonczone.includes('reakcja')) {
        await updateDoc(docRef, {
          zrecznosciowe: [...ukonczone, 'reakcja'],
        });
      }
    }
  };

  const startRound = () => {
    setStatus('waiting');
    setMessage('Czekaj na sygnał...');
    const delay = Math.floor(Math.random() * 3000) + 2000;
    const id = setTimeout(() => {
      setStatus('now');
      setMessage('KLIKNIJ TERAZ!');
      setStartTime(Date.now());

      const failTimeout = setTimeout(() => {
        setStatus('fail');
        setMessage('⏱️ Za wolno!');
      }, 800);

      setTimeoutId(failTimeout);
    }, delay);
    setTimeoutId(id);
  };

  const startGame = () => {
    setSuccessCount(0);
    startRound();
  };

  const handlePress = () => {
    if (status === 'ready') {
      startGame();
    } else if (status === 'waiting') {
      clearTimeout(timeoutId);
      setStatus('fail');
      setMessage('❌ Za wcześnie!');
    } else if (status === 'now') {
      clearTimeout(timeoutId);
      const newCount = successCount + 1;
      setSuccessCount(newCount);

      if (newCount >= 10) {
        setStatus('win');
        setMessage('🎉 Udało się!');
        oznaczGreJakoUkonczona();
        onSuccess?.();
      } else {
        startRound();
      }
    } else if (status === 'win' || status === 'fail') {
      setStatus('ready');
      setMessage('Kliknij, aby spróbować ponownie');
    }
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <TouchableOpacity style={styles.touchArea} onPress={handlePress} activeOpacity={0.8}>
            <Text style={styles.tytul}>{message}</Text>
            {status !== 'ready' && status !== 'win' && status !== 'fail' && (
              <Text style={styles.counter}>✔️ {successCount} / 10</Text>
            )}
          </TouchableOpacity>

          {(status === 'ready' || status === 'fail' || status === 'win') && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/zadania/zrecznosciowe')}
            >
              <Text style={styles.backButtonText}>⬅ Wróć do wyboru gry</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 24,
  },
  tytul: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 12,
  },
  counter: {
    fontSize: 20,
    color: '#333333',
    marginTop: 8,
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
