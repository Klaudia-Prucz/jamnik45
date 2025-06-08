import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';

const EMOJI = ['🎁', '🎄', '🎈', '🎉', '🍭', '🎊', '🧸', '🍬'];

const shuffle = (array) => {
  let cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

export default function MemoryGra({ onSuccess }) {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const duplicated = [...EMOJI.slice(0, 6), ...EMOJI.slice(0, 6)];
    setCards(shuffle(duplicated));

    // Get user ID
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const oznaczGreJakoUkonczona = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('zadania')
      .select('id')
      .eq('user_id', userId)
      .eq('zadanie_id', 'memory')
      .eq('kategoria', 'zrecznosciowe');

    if (!data || data.length === 0) {
      await supabase.from('zadania').insert([
        {
          user_id: userId,
          zadanie_id: 'memory',
          kategoria: 'zrecznosciowe',
        },
      ]);
    }
  };

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected;
      const isMatch = cards[first] === cards[second];

      setTimeout(() => {
        if (isMatch) {
          setMatched((prev) => [...prev, first, second]);
        }
        setSelected([]);
        setMoves((prev) => prev + 1);
      }, 800);
    }
  }, [selected]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      if (moves <= 20) {
        setStatus('win');
        oznaczGreJakoUkonczona();
        onSuccess?.();
      } else {
        setStatus('fail');
      }
    }
  }, [matched]);

  const handlePress = (index) => {
    if (selected.includes(index) || matched.includes(index)) return;
    if (selected.length < 2) {
      setSelected((prev) => [...prev, index]);
    }
  };

  const resetGame = () => {
    const duplicated = [...EMOJI.slice(0, 6), ...EMOJI.slice(0, 6)];
    setCards(shuffle(duplicated));
    setMatched([]);
    setSelected([]);
    setMoves(0);
    setStatus(null);
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <View style={styles.topContent}>
            <Text style={styles.tytul}>🧠 Znajdź pary!</Text>
            <Text style={styles.podtytul}>Ruchy: {moves} / 20</Text>

            <View style={styles.grid}>
              {cards.map((card, index) => {
                const isVisible = selected.includes(index) || matched.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.card, matched.includes(index) && styles.cardMatched]}
                    onPress={() => handlePress(index)}
                  >
                    <Text style={styles.cardText}>{isVisible ? card : '❓'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {status === 'win' && (
              <>
                <Text style={[styles.infoText, styles.zaliczone]}>🎉 Udało się! Gra zaliczona!</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/zadania/zrecznosciowe')}>
                  <Text style={styles.buttonText}>⬅ Wróć do wyboru gry</Text>
                </TouchableOpacity>
              </>
            )}
            {status === 'fail' && (
              <>
                <Text style={[styles.infoText, styles.niezaliczone]}>😿 Za dużo ruchów!</Text>
                <TouchableOpacity style={styles.button} onPress={resetGame}>
                  <Text style={styles.buttonText}>Spróbuj ponownie</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {status === null && (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
  },
  topContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tytul: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#FFE0B2',
    textAlign: 'center',
  },
  podtytul: {
    fontSize: 18,
    color: '#FFD580',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  card: {
    width: 60,
    height: 60,
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMatched: {
    backgroundColor: '#e0ffe0',
  },
  cardText: {
    fontSize: 26,
  },
  infoText: {
    fontSize: 20,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  zaliczone: {
    color: '#66ffcc',
  },
  niezaliczone: {
    color: '#ff6666',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#E76617',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFD580',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
