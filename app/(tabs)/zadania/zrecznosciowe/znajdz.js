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

const rundyBazowe = [
  { emoji: ['🍎', '🍊', '🍌'], niepasuje: '🐶' },
  { emoji: ['🚌', '🚗', '🚕'], niepasuje: '🍰' },
  { emoji: ['🌧️', '☀️', '🌩️'], niepasuje: '🎸' },
  { emoji: ['✏️', '📐', '📏'], niepasuje: '🐸' },
  { emoji: ['🦊', '🐱', '🐶'], niepasuje: '🍕' },
  { emoji: ['🚀', '🛸', '✈️'], niepasuje: '🍦' },
  { emoji: ['🐟', '🐠', '🐡'], niepasuje: '🚗' },
  { emoji: ['⚽', '🏀', '🏈'], niepasuje: '🎨' },
  { emoji: ['🍔', '🍟', '🌭'], niepasuje: '🎹' },
  { emoji: ['🐘', '🦏', '🐪'], niepasuje: '🎮' },
  { emoji: ['🍓', '🍉', '🍇'], niepasuje: '🐒' },
  { emoji: ['🚴‍♂️', '🏊‍♀️', '🤸‍♂️'], niepasuje: '📚' },
  { emoji: ['📱', '💻', '🖥️'], niepasuje: '🍩' },
  { emoji: ['🌹', '🌻', '🌷'], niepasuje: '🐔' },
  { emoji: ['🎬', '🎤', '🎧'], niepasuje: '🛏️' },
];

const wymieszajEmoji = (emoji, niepasuje) => {
  const combined = [...emoji, niepasuje];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined;
};

export default function GraLogiczna({ onSuccess }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [błędy, setBłędy] = useState(0);
  const [poprawne, setPoprawne] = useState(0);
  const [status, setStatus] = useState('ready');
  const [userId, setUserId] = useState(null);
  const [rundy, setRundy] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('zadania')
          .select('zrecznosciowe')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.zrecznosciowe?.includes('znajdz')) {
          setStatus('done');
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const shuffledRounds = [...rundyBazowe]
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
    setRundy(shuffledRounds);
  }, []);

  const startGame = () => {
    setIndex(0);
    setBłędy(0);
    setPoprawne(0);
    setStatus('playing');
  };

  const oznaczGreJakoUkonczona = async () => {
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      currentUserId = user.id;
      setUserId(currentUserId);
    }

    const { data: rekord, error } = await supabase
      .from('zadania')
      .select('zrecznosciowe')
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (error) return false;

    const obecne = rekord?.zrecznosciowe || [];
    if (obecne.includes('znajdz')) return true;

    const nowe = [...obecne, 'znajdz'];
    const { error: updateError } = await supabase
      .from('zadania')
      .update({ zrecznosciowe: nowe })
      .eq('user_id', currentUserId);

    return !updateError;
  };

  const handleClick = async (em) => {
    if (status !== 'playing') return;
    const aktualna = rundy[index];
    if (!aktualna) return;

    if (em === aktualna.niepasuje) {
      const nowyIndex = index + 1;
      const nowaLiczbaPoprawnych = poprawne + 1;
      setPoprawne(nowaLiczbaPoprawnych);

      if (nowyIndex >= rundy.length || nowaLiczbaPoprawnych >= 10) {
        setStatus('win');
        await oznaczGreJakoUkonczona();
        onSuccess?.();
      } else {
        setIndex(nowyIndex);
      }
    } else {
      const nowaLiczbaBledow = błędy + 1;
      setBłędy(nowaLiczbaBledow);
      if (nowaLiczbaBledow >= 3) {
        setStatus('fail');
      }
    }
  };

  const goBack = () => {
    setStatus('ready');
    setIndex(0);
    setBłędy(0);
    setPoprawne(0);
    router.replace('/zadania/zrecznosciowe');
  };

  const aktualnaRunda = rundy[index];
  const emojiDoWyswietlenia = aktualnaRunda
    ? wymieszajEmoji(aktualnaRunda.emoji, aktualnaRunda.niepasuje)
    : [];

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
              <Text style={styles.sub}>Poprawne: {poprawne} / 10</Text>
              <View style={styles.grid}>
                {emojiDoWyswietlenia.map((em, i) => (
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

        {status === 'done' && (
          <View style={styles.nakladka}>
            <Text style={styles.tekstNakladka}>Gra została już ukończona</Text>
            <TouchableOpacity style={styles.przyciskNakladka} onPress={goBack}>
              <Text style={styles.przyciskNakladkaText}>Wróć do pozostałych gier</Text>
            </TouchableOpacity>
          </View>
        )}
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
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 12,
  },
  sub: {
    fontSize: 18,
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 8,
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
    backgroundColor: '#ffffffcc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  emoji: {
    fontSize: 30,
  },
  result: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3F51B5',
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
    color: '#fff',
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
  startText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nakladka: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
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
