import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '@/supabaseClient';

const { width, height } = Dimensions.get('window');

export default function Zlap() {
  const router = useRouter();
  const [position, setPosition] = useState({ top: 100, left: 100 });
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(true);
  const [finished, setFinished] = useState(false);
  const [userId, setUserId] = useState(null);

  const total = 5; // ile trzeba złapać
  const duration = 1000; // czas widoczności

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (finished) return;

    if (!show) {
      const timer = setTimeout(() => {
        setRandomPosition();
        setShow(true);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, finished]);

  const setRandomPosition = () => {
    const top = Math.random() * (height - 200);
    const left = Math.random() * (width - 100);
    setPosition({ top, left });
  };

  const oznaczGreJakoUkonczona = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('zadania')
      .select('id')
      .eq('user_id', userId)
      .eq('zadanie_id', 'zlap')
      .eq('kategoria', 'zrecznosciowe');

    if (!data || data.length === 0) {
      await supabase.from('zadania').insert([
        {
          user_id: userId,
          zadanie_id: 'zlap',
          kategoria: 'zrecznosciowe',
        },
      ]);
    }
  };

  const handlePress = () => {
    if (!finished) {
      const now = count + 1;
      setCount(now);
      setShow(false);
      if (now >= total) {
        setFinished(true);
        oznaczGreJakoUkonczona();
      }
    }
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.tytul}>🎁 Złap prezent!</Text>
          <Text style={styles.tekst}>
            Złap {total} prezentów, które pojawiają się losowo na ekranie.
          </Text>
          <Text style={styles.wynik}>Złapano: {count} / {total}</Text>

          {show && !finished && (
            <TouchableOpacity
              onPress={handlePress}
              style={[styles.prezent, { top: position.top, left: position.left }]}
            >
              <Text style={styles.emoji}>🎁</Text>
            </TouchableOpacity>
          )}

          {finished && <Text style={styles.sukces}>✅ Gra zaliczona!</Text>}

          <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania/zrecznosciowe')}>
            <Text style={styles.powrotText}>← Wybierz inną grę</Text>
          </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
  },
  tytul: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginTop: 20,
    marginBottom: 10,
  },
  tekst: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  wynik: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  prezent: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E76617',
  },
  emoji: { fontSize: 36 },
  sukces: {
    marginTop: 30,
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  powrot: {
    marginTop: 40,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
