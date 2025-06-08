import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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

export default function KliknijGra({ onSuccess }) {
  const router = useRouter();
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [status, setStatus] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const oznaczGreJakoUkonczona = async (nazwaGry) => {
  const docRef = doc(db, 'appState', 'uczestnik1');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const dane = snap.data();
    const ukonczone = dane.zrecznosciowe || [];
    if (!ukonczone.includes(nazwaGry)) {
      await updateDoc(docRef, {
        zrecznosciowe: [...ukonczone, nazwaGry],
      });
    }
  }
};

useEffect(() => {
  let timer;
  if (isPlaying && timeLeft > 0) {
    timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
  } else if (isPlaying && timeLeft === 0) {
    setIsPlaying(false);
    if (clicks >= 45) {
      setStatus('win');
      oznaczGreJakoUkonczona('kliknij');
      onSuccess?.();
    } else {
      setStatus('fail');
    }
  }
  return () => clearTimeout(timer);
}, [isPlaying, timeLeft]);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(10);
    setStatus(null);
    setIsPlaying(true);
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <View style={styles.centered}>
            <Text style={styles.tytul}>⚡ Klikaj jak najszybciej!</Text>
            <Text style={styles.podtytul}>Czas: {timeLeft}s | Kliknięcia: {clicks}</Text>

            {isPlaying ? (
              <TouchableOpacity
                style={styles.clickButton}
                onPress={() => setClicks((prev) => prev + 1)}
              >
                <Text style={styles.clickText}>KLIK!</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startText}>Rozpocznij</Text>
              </TouchableOpacity>
            )}

            {status === 'win' && (
              <Text style={[styles.infoText, styles.zaliczone]}>🎉 Brawo! Gra zaliczona!</Text>
            )}
            {status === 'fail' && (
              <Text style={[styles.infoText, styles.niezaliczone]}>🙁 Za mało kliknięć!</Text>
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>⬅ Wróć do wyboru gry</Text>
          </TouchableOpacity>
        </View>
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
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tytul: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FFE0B2',
    textAlign: 'center',
  },
  podtytul: {
    fontSize: 18,
    color: '#FFD580',
    marginBottom: 24,
    textAlign: 'center',
  },
  clickButton: {
    backgroundColor: '#E76617',
    paddingVertical: 30,
    paddingHorizontal: 50,
    borderRadius: 100,
    marginBottom: 20,
  },
  clickText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#FFD580',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  startText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  zaliczone: {
    color: '#66ffcc',
  },
  niezaliczone: {
    color: '#ff6666',
  },
  backButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFD580',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
