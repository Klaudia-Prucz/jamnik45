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

const EMOJI_POOL = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🦇', '🐍', '🦖', '🐢',
  '🐙', '🦑', '🦞', '🦀', '🐡', '🐠', '🐳', '🦈', '🐊', '🦓', '🦍', '🦧',
  '🦒', '🐫', '🐘', '🦣', '🦮', '🐕‍🦺', '🐩', '🐕', '🦴', '🛏️'
];

const CELE = ['🐶', '🦮', '🐕‍🦺', '🐩', '🐕', '🦴', '🛏️'];

export default function ZnajdzEmoji({ onSuccess }) {
  const router = useRouter();
  const [klikniete, setKlikniete] = useState([]);
  const [emojiGrid, setEmojiGrid] = useState([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const shuffled = [...EMOJI_POOL].sort(() => 0.5 - Math.random());
    const withoutCele = shuffled.filter((e) => !CELE.includes(e));
    const final = [...CELE, ...withoutCele].sort(() => 0.5 - Math.random());
    setEmojiGrid(final.slice(0, 48));
  }, []);

  const zapiszJakoUkonczone = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: istnieje } = await supabase
      .from('zadania')
      .select('*')
      .eq('user_id', user.id)
      .eq('zadanie_id', 'sound')
      .eq('kategoria', 'zrecznosciowe')
      .maybeSingle();

    if (istnieje) return true;

    const { error } = await supabase.from('zadania').insert([
      {
        user_id: user.id,
        zadanie_id: 'sound',
        kategoria: 'zrecznosciowe',
      },
    ]);

    return !error;
  };

  const handlePress = (emoji) => {
    setKlikniete((prev) => {
      const zbior = new Set([...prev, emoji]);
      return Array.from(zbior);
    });
  };

  useEffect(() => {
    if (completed) return;

    const poprawneKlikniecia = klikniete.filter((em) => CELE.includes(em));

    if (poprawneKlikniecia.length === CELE.length) {
      const zapisz = async () => {
        const zapisane = await zapiszJakoUkonczone();
        if (zapisane) {
          setCompleted(true);
          onSuccess?.();
        }
      };
      zapisz();
    }
  }, [klikniete]);

  const goBack = () => {
    router.replace('/zadania/zrecznosciowe');
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.tytul}>🔍 Znajdź wszystkie pieski i rzeczy z nimi związane!</Text>
          <Text style={styles.counter}>
            Znaleziono: {
              klikniete.filter((em) => CELE.includes(em)).length
            } / {CELE.length}
          </Text>

          <View style={styles.grid}>
            {emojiGrid.map((em, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.cell, klikniete.includes(em) && styles.clicked]}
                onPress={() => handlePress(em)}
              >
                <Text style={styles.emoji}>{em}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {completed && (
            <View style={styles.nakladka}>
              <Text style={styles.tekstNakladka}>✅ Udało się! Znalazłeś wszystkie!</Text>
              <TouchableOpacity style={styles.przyciskNakladka} onPress={goBack}>
                <Text style={styles.przyciskNakladkaText}>⬅ Wróć do zestawu gier</Text>
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
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  tytul: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 12,
  },
  counter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  cell: {
    width: 50,
    height: 50,
    backgroundColor: '#ffffffcc',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 8,
  },
  clicked: {
    backgroundColor: '#E76617aa',
  },
  emoji: {
    fontSize: 24,
  },
  nakladka: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
    borderRadius: 12,
  },
  tekstNakladka: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 16,
  },
  przyciskNakladka: {
    backgroundColor: '#3F51B5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  przyciskNakladkaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
