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
import { supabase } from '@/supabaseClient';

const rundy = [
  { emoji: ['🍎', '🍊', '🍌', '🐶'], niepasuje: '🐶' },
  { emoji: ['🚌', '🚗', '🚕', '🍰'], niepasuje: '🍰' },
  { emoji: ['🌧️', '☀️', '🌩️', '🎸'], niepasuje: '🎸' },
  { emoji: ['✏️', '📐', '📏', '🐸'], niepasuje: '🐸' },
  { emoji: ['🦊', '🐱', '🐶', '🍕'], niepasuje: '🍕' },
];

export default function GraLogiczna({ onSuccess }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [błędy, setBłędy] = useState(0);
  const [status, setStatus] = useState('ready');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  const startGame = () => {
    setIndex(0);
    setBłędy(0);
    setStatus('playing');
  };

  const oznaczGreJakoUkonczona = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('zadania')
      .select('id')
      .eq('user_id', userId)
      .eq('zadanie_id', 'logiczna')
      .eq('kategoria', 'zrecznosciowe');

    if (!data || data.length === 0) {
      await supabase.from('zadania').insert([
        {
          user_id: userId,
          zadanie_id: 'logiczna',
          kategoria: 'zrecznosciowe',
        },
      ]);
    }
  };

  const handleClick = (em) => {
    const aktualna = rundy[index];
    if (em === aktualna.niepasuje) {
      if (index + 1 === rundy.length) {
        setStatus('win');
        oznaczGreJakoUkonczona();
        onSuccess?.();
      } else {
        setIndex(index + 1);
      }
    } else {
      if (błędy + 1 >= 3) {
        setStatus('fail');
      } else {
        setBłędy(błędy + 1);
      }
    }
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
            <>
              <Text style={styles.tytul}>🧠 Które emoji nie pasuje?</Text>
              <Text style={styles.sub}>Błędy: {błędy} / 3</Text>
              <View style={styles.grid}>
                {rundy[index].emoji.map((em, i) => (
                  <TouchableOpacity key={i} style={styles.cell} onPress={() => handleClick(em)}>
                    <Text style={styles.emoji}>{em}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {status === 'win' && (
            <>
              <Text style={styles.result}>✅ Brawo! Ukończono grę logiczną!</Text>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>⬅ Wróć do zestawu gier</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'fail' && (
            <>
              <Text style={styles.result}>❌ Za dużo błędów! Spróbuj ponownie!</Text>
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
  tytul: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  sub: {
    fontSize: 18,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  cell: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  emoji: { fontSize: 30 },
  result: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    alignSelf: 'center',
    backgroundColor: '#3F51B5',
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
  startButton: {
    backgroundColor: '#E76617',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  startText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
