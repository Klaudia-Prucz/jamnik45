import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';
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

export default function TrafGra({ onSuccess }) {
  const router = useRouter();
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [status, setStatus] = useState('ready');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let interval;
    if (status === 'playing' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (status === 'playing' && timeLeft === 0) {
      if (score >= 10) {
        setStatus('win');
        onSuccess?.();
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

  useEffect(() => {
    if (status === 'win') {
      oznaczGreJakoUkonczona();
    }
  }, [status]);

  const oznaczGreJakoUkonczona = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('zadania')
      .select('id')
      .eq('user_id', userId)
      .eq('zadanie_id', 'traf')
      .eq('kategoria', 'zrecznosciowe');

    if (!data || data.length === 0) {
      await supabase.from('zadania').insert([
        {
          user_id: userId,
          zadanie_id: 'traf',
          kategoria: 'zrecznosciowe',
        },
      ]);
    }
  };

  const spawnTarget = () => {
    const id = Date.now();
    const top = Math.random() * 60 + 20;
    const left = Math.random() * 80 + 10;
    const newTarget = { id, top, left };
    setTargets((prev) => [...prev, newTarget]);
    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== id));
      if (status === 'playing') spawnTarget();
    }, 800);
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

  const goBack = () => {
    router.replace('/zadania/zrecznosciowe');
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <View style={styles.topContent}>
            {status === 'ready' && (
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startText}>Rozpocznij</Text>
              </TouchableOpacity>
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
                  />
                ))}
              </>
            )}
            {status === 'win' && (
              <>
                <Text style={styles.result}>🎯 Udało się! Gra zaliczona!</Text>
                <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania/zrecznosciowe')}>
                  <Text style={styles.powrotText}>← Wybierz inną grę</Text>
                </TouchableOpacity>
              </>
            )}
            {status === 'fail' && <Text style={styles.result}>😿 Za mało trafień!</Text>}
          </View>

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
  topContent: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
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
    width: 50,
    height: 50,
    backgroundColor: '#FFD580',
    borderRadius: 25,
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
  powrot: {
    marginTop: 12,
    alignSelf: 'center',
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
