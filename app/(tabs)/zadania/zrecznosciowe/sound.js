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
  ScrollView,
} from 'react-native';

const EMOJI_POOL = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🦇', '🐍', '🦖', '🐢',
  '🐙', '🦑', '🦞', '🦀', '🐡', '🐠', '🐳', '🦈', '🐊', '🦓', '🦍', '🦧',
  '🦒', '🐫', '🐘', '🦣', '🦮', '🐕‍🦺', '🐩', '🐕', '🦴', '🛏️'
];
const CELE = ['🐶', '🦮', '🐕‍🦺', '🐩', '🐕', '🦴', '🛏️'];

export default function ZnajdzEmoji() {
  const router = useRouter();
  const [emojiGrid, setEmojiGrid] = useState([]);
  const [klikniete, setKlikniete] = useState([]);
  const [userId, setUserId] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      if (error) console.warn('Błąd pobierania użytkownika:', error.message);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const sprawdzCzyUkonczona = async () => {
      const { data, error } = await supabase
        .from('zadania')
        .select('zrecznosciowe')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('❌ Błąd sprawdzania gry:', error.message);
        return;
      }

      if (data?.zrecznosciowe?.includes('sound')) {
        setFinished(true);
      }
    };

    sprawdzCzyUkonczona();
  }, [userId]);

  useEffect(() => {
    const shuffled = [...EMOJI_POOL].sort(() => 0.5 - Math.random());
    const withoutCele = shuffled.filter((e) => !CELE.includes(e));
    const final = [...CELE, ...withoutCele].sort(() => 0.5 - Math.random());
    setEmojiGrid(final.slice(0, 48));
  }, []);

  useEffect(() => {
    const poprawne = klikniete.filter((e) => CELE.includes(e));
    if (userId && !finished && poprawne.length === CELE.length) {
      oznaczGreJakoUkonczona();
      setFinished(true);
    }
  }, [klikniete]);

  const oznaczGreJakoUkonczona = async () => {
    const { data, error } = await supabase
      .from('zadania')
      .select('zrecznosciowe')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('❌ Błąd odczytu zadania:', error.message);
      return;
    }

    const aktualne = data?.zrecznosciowe || [];

    if (!aktualne.includes('sound')) {
      const zaktualizowane = [...aktualne, 'sound'];
      const { error: updateError } = await supabase
        .from('zadania')
        .update({ zrecznosciowe: zaktualizowane })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('❌ Błąd aktualizacji zrecznosciowe:', updateError.message);
      } else {
        console.log('✅ Gra "sound" zapisana jako ukończona!');
      }
    } else {
      console.log('ℹ️ Gra "sound" była już wcześniej ukończona.');
    }
  };

  const handlePress = (emoji) => {
    if (finished || !CELE.includes(emoji)) return;

    setKlikniete((prev) => {
      const zbior = new Set(prev);
      zbior.add(emoji);
      return Array.from(zbior);
    });
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.wrapper}>
          <Text style={styles.tytul}>Znajdź pieski i rzeczy z nimi związane</Text>
          <Text style={styles.tekst}>Kliknij wszystkie 7 poprawnych emoji 🐶🦴</Text>

          <View style={styles.grid}>
            {emojiGrid.map((em, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.cell, CELE.includes(em) && klikniete.includes(em) && styles.clicked]}
                onPress={() => handlePress(em)}
                disabled={finished}
              >
                <Text style={styles.emoji}>{em}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {finished && <Text style={styles.sukces}>Gra ukończona!</Text>}

          <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania/zrecznosciowe')}>
            <Text style={styles.powrotText}>← Wybierz inną grę</Text>
          </TouchableOpacity>
        </ScrollView>

        {finished && (
          <View style={styles.nakladka}>
            <Text style={styles.tekstNakladka}>Gra została już ukończona</Text>
            <TouchableOpacity style={styles.przyciskNakladka} onPress={() => router.replace('/zadania/zrecznosciowe')}>
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
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wrapper: {
    padding: 20,
    alignItems: 'center',
  },
  tytul: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  tekst: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cell: {
    width: 60,
    height: 60,
    margin: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clicked: {
    backgroundColor: '#E76617aa',
  },
  emoji: {
    fontSize: 26,
  },
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
