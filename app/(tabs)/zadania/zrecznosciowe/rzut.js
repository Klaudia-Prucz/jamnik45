import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    Animated,
    ImageBackground,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RzutGra({ onSuccess }) {
  const router = useRouter();
  const [rzuty, setRzuty] = useState(0);
  const [trafione, setTrafione] = useState(0);
  const [status, setStatus] = useState('ready'); // ready | playing | win | fail
  const targetAnim = useState(new Animated.Value(0))[0];

  const oznaczGreJakoUkonczona = async () => {
    const docRef = doc(db, 'appState', 'uczestnik1');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const dane = snap.data();
      const ukonczone = dane.zrecznosciowe || [];
      if (!ukonczone.includes('rzut')) {
        await updateDoc(docRef, {
          zrecznosciowe: [...ukonczone, 'rzut'],
        });
      }
    }
  };

  const startGame = () => {
    setRzuty(0);
    setTrafione(0);
    setStatus('playing');
    animateTarget();
  };

  const animateTarget = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(targetAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(targetAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const handleThrow = () => {
    if (status !== 'playing') return;
    setRzuty((r) => r + 1);
    targetAnim.stopAnimation((val) => {
      if (val > 0.4 && val < 0.6) {
        setTrafione((t) => {
          const newT = t + 1;
          if (newT >= 5) {
            setStatus('win');
            oznaczGreJakoUkonczona();
            onSuccess?.();
          }
          return newT;
        });
      } else if (rzuty + 1 >= 10) {
        setStatus('fail');
      }
    });
  };

  const goBack = () => {
    router.replace('/zadania/zrecznosciowe');
  };

  const barHeight = targetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['10%', '90%'],
  });

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.info}>Rzuty: {rzuty} / 10 | Trafienia: {trafione} / 5</Text>

          <View style={styles.targetContainer}>
            <Animated.View style={[styles.movingTarget, { top: barHeight }]} />
          </View>

          {status === 'playing' && (
            <TouchableOpacity style={styles.throwButton} onPress={handleThrow}>
              <Text style={styles.throwText}>Rzuć 🎯</Text>
            </TouchableOpacity>
          )}

          {status === 'ready' && (
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          )}

          {status === 'win' && (
            <>
              <Text style={styles.result}>🎉 Trafienia celne! Gra zaliczona!</Text>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>⬅ Wróć do zestawu gier</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'fail' && (
            <Text style={styles.result}>😿 Za mało trafień!</Text>
          )}

          {status !== 'win' && (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Text style={styles.backButtonText}>⬅ Wróć do zestawu gier</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  wrapper: { flex: 1, padding: 16, justifyContent: 'space-between' },
  info: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 12 },
  targetContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movingTarget: {
    width: 40,
    height: 40,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    position: 'absolute',
    left: '50%',
    marginLeft: -20,
  },
  throwButton: {
    backgroundColor: '#E76617',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  throwText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  startButton: {
    backgroundColor: '#E76617',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  startText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
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
