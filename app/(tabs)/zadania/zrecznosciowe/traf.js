import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TrafGra() {
  const router = useRouter();
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [status, setStatus] = useState('ready');
  const [userId, setUserId] = useState(null);
  const [finished, setFinished] = useState(false);
  const [spawnTimeout, setSpawnTimeout] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const checkCompletion = async () => {
      const { data, error } = await supabase
        .from('zadania')
        .select('zrecznosciowe')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data?.zrecznosciowe?.includes('traf')) {
        setFinished(true);
      }
    };
    checkCompletion();
  }, [userId]);

  useEffect(() => {
    let interval;
    if (status === 'playing' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (status === 'playing' && timeLeft === 0) {
      if (spawnTimeout) clearTimeout(spawnTimeout);
      if (score >= 15) {
        setStatus('win');
        saveCompletion();
      } else {
        setStatus('fail');
      }
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  useEffect(() => {
    if (status === 'playing') {
      spawnTarget();
    }
  }, [status]);

  const saveCompletion = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('zadania')
      .select('zrecznosciowe')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return;
    const current = data.zrecznosciowe || [];

    if (!current.includes('traf')) {
      const updated = [...current, 'traf'];
      await supabase
        .from('zadania')
        .update({ zrecznosciowe: updated })
        .eq('user_id', userId);
    }
  };

  const spawnTarget = () => {
    if (spawnTimeout) clearTimeout(spawnTimeout);
    const id = Date.now();
    const top = Math.random() * 60 + 20;
    const left = Math.random() * 80 + 10;
    const newTarget = { id, top, left };
    setTargets((prev) => [newTarget]);
    const timeout = setTimeout(() => {
      setTargets([]);
      if (status === 'playing') spawnTarget();
    }, 1000);
    setSpawnTimeout(timeout);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setTargets([]);
    setStatus('playing');
  };

  const hitTarget = (id) => {
    setScore((s) => s + 1);
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBack = () => {
    setStatus('ready');
    setScore(0);
    setTimeLeft(15);
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <View style={styles.topContent}>
            {status === 'ready' && (
              <>
                <Text style={styles.description}>Złap uciekającego Alka!</Text>
                <TouchableOpacity style={styles.startButton} onPress={startGame}>
                  <Text style={styles.startText}>Rozpocznij</Text>
                </TouchableOpacity>
              </>
            )}
            {status === 'playing' && (
              <>
                <Text style={styles.info}>Czas: {timeLeft}s | Trafienia: {score}</Text>
                {targets.map((target) => (
                  <TouchableOpacity
                    key={target.id}
                    onPress={() => hitTarget(target.id)}
                    style={[styles.target, {
                      top: `${target.top}%`,
                      left: `${target.left}%`,
                    }]}
                  >
                    <Image source={require('@/assets/traf.png')} style={styles.targetImage} />
                  </TouchableOpacity>
                ))}
              </>
            )}
            {status === 'win' && (
              <View style={styles.nakladka}>
                <Text style={styles.tekstNakladka}>🎯 Udało się! Gra zaliczona!</Text>
                <TouchableOpacity style={styles.przyciskNakladka} onPress={() => router.replace('/zadania/zrecznosciowe')}>
                  <Text style={styles.przyciskNakladkaText}>Wróć do pozostałych gier</Text>
                </TouchableOpacity>
              </View>
            )}
            {status === 'fail' && (
              <>
                <Text style={styles.result}>😿 Za mało trafień!</Text>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backButtonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {status === 'ready' && finished && (
            <View style={styles.nakladka}>
              <Text style={styles.tekstNakladka}>Gra została już ukończona</Text>
              <TouchableOpacity style={styles.przyciskNakladka} onPress={() => router.replace('/zadania/zrecznosciowe')}>
                <Text style={styles.przyciskNakladkaText}>Wróć do pozostałych gier</Text>
              </TouchableOpacity>
            </View>
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
  topContent: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  description: { fontSize: 22, color: '#3F51B5', fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  startButton: {
    backgroundColor: '#E76617',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { fontSize: 20, color: '#222', marginBottom: 12 },
  result: { fontSize: 24, fontWeight: 'bold', color: '#222', textAlign: 'center', marginBottom: 16 },
  target: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  targetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    alignSelf: 'center',
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nakladka: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tekstNakladka: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  przyciskNakladka: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3F51B5',
    borderRadius: 8,
  },
  przyciskNakladkaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
