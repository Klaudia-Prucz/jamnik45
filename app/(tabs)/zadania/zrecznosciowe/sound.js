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

const EMOJI_POOL = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🦇', '🐍', '🦖', '🐢', '🐙', '🦑', '🦞', '🦀', '🐡', '🐠', '🐳', '🦈', '🐊', '🦓', '🦍', '🦧', '🦒', '🐫', '🐘', '🦣'];
const CELE = ['🐱', '🐶', '🐯', '🦁', '🐻'];

export default function ZnajdzEmoji({ onSuccess }) {
  const router = useRouter();
  const [klikniete, setKlikniete] = useState([]);
  const [emojiGrid, setEmojiGrid] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const shuffled = [...EMOJI_POOL].sort(() => 0.5 - Math.random());
    setEmojiGrid(shuffled.slice(0, 40));
  }, []);

  useEffect(() => {
    if (klikniete.length === CELE.length) {
      oznaczGreJakoUkonczona();
      onSuccess?.();
    }
  }, [klikniete]);

  const oznaczGreJakoUkonczona = async () => {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
    }

    const { data } = await supabase
      .from('zadania')
      .select('id')
      .eq('user_id', userId)
      .eq('zadanie_id', 'znajdz')
      .eq('kategoria', 'zrecznosciowe');

    if (!data || data.length === 0) {
      await supabase.from('zadania').insert([
        {
          user_id: userId,
          zadanie_id: 'znajdz',
          kategoria: 'zrecznosciowe',
        },
      ]);
    }
  };

  const handlePress = (emoji) => {
    if (CELE.includes(emoji) && !klikniete.includes(emoji)) {
      setKlikniete([...klikniete, emoji]);
    }
  };

  const goBack = () => {
    router.replace('/zadania/zrecznosciowe');
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>      
        <View style={styles.wrapper}>
          <Text style={styles.tytul}>🔍 Znajdź ukryte zwierzaki!</Text>
          <View style={styles.grid}>
            {emojiGrid.map((em, i) => (
              <TouchableOpacity key={i} style={styles.cell} onPress={() => handlePress(em)}>
                <Text style={styles.emoji}>{em}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {klikniete.length === CELE.length && (
            <>
              <Text style={styles.result}>✅ Udało się! Znalazłeś wszystkie!</Text>
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
  wrapper: { flex: 1, padding: 16 },
  tytul: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
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
  emoji: {
    fontSize: 24,
  },
  result: {
    fontSize: 20,
    color: '#66ffcc',
    fontWeight: 'bold',
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
});
