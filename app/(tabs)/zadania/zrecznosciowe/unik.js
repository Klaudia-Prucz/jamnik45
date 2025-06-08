import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ImageBackground,
    PanResponder,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function UnikGra({ onSuccess }) {
  const router = useRouter();
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(20);
  const [status, setStatus] = useState('ready');
  const [obstacles, setObstacles] = useState([]);
  const playerLane = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer;
    if (status === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (status === 'playing' && timeLeft === 0) {
      setStatus('win');
      onSuccess?.();
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  useEffect(() => {
    if (status === 'playing') {
      const interval = setInterval(spawnObstacle, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'win') {
      oznaczGreJakoUkonczona();
    }
  }, [status]);

  const oznaczGreJakoUkonczona = async () => {
    try {
      const docRef = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dane = snap.data();
        const ukonczone = dane.zrecznosciowe || [];
        if (!ukonczone.includes('unik')) {
          await updateDoc(docRef, {
            zrecznosciowe: [...ukonczone, 'unik'],
          });
        }
      }
    } catch (e) {
      console.warn('Błąd zapisu gry unik:', e);
    }
  };

  const spawnObstacle = () => {
    const lane = Math.round(Math.random());
    const id = Date.now();
    const newObs = { id, lane, left: new Animated.Value(100) };
    setObstacles((prev) => [...prev, newObs]);

    Animated.timing(newObs.left, {
      toValue: -20,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      checkCollision(newObs);
      setObstacles((prev) => prev.filter((o) => o.id !== id));
    });
  };

  const checkCollision = (obstacle) => {
    playerLane.stopAnimation((laneValue) => {
      const playerPos = laneValue < 0.5 ? 0 : 1;
      if (playerPos === obstacle.lane) {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) setStatus('fail');
          return newLives;
        });
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 20,
      onPanResponderRelease: (_, gesture) => {
        playerLane.stopAnimation(() => {
          const target = gesture.dy < 0 ? 0 : 1;
          Animated.timing(playerLane, {
            toValue: target,
            duration: 200,
            useNativeDriver: false,
          }).start();
        });
      },
    })
  ).current;

  const startGame = () => {
    setLives(3);
    setTimeLeft(20);
    setStatus('playing');
    setObstacles([]);
    playerLane.setValue(1);
  };

  const goBack = () => {
    router.replace('/zadania/zrecznosciowe');
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper} {...panResponder.panHandlers}>
          <Text style={styles.info}>Czas: {timeLeft}s | Życia: {lives}</Text>
          <View style={styles.playfield}>
            <Animated.View
              style={[
                styles.player,
                {
                  top: playerLane.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['25%', '70%'],
                  }),
                },
              ]}
            >
              <Text style={styles.emoji}>🎁</Text>
            </Animated.View>

            {obstacles.map((obs) => (
              <Animated.View
                key={obs.id}
                style={[
                  styles.obstacle,
                  {
                    left: obs.left.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    top: obs.lane === 0 ? '25%' : '70%',
                  },
                ]}
              />
            ))}
          </View>

          {status === 'ready' && (
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          )}

          {status === 'win' && (
            <>
              <Text style={styles.result}>✅ Udało się uniknąć!</Text>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>⬅ Wróć do zestawu gier</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'fail' && (
            <Text style={styles.result}>😿 Trafiła Cię przeszkoda!</Text>
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
  wrapper: { flex: 1, padding: 16 },
  info: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 8 },
  playfield: { flex: 1, backgroundColor: 'transparent' },
  player: {
    position: 'absolute',
    left: '10%',
  },
  emoji: { fontSize: 36 },
  obstacle: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#FF6666',
    borderRadius: 25,
  },
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
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
