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
  FlatList,
} from 'react-native';
import { supabase } from '@/supabaseClient';

// Obrazy kart (6 par)
const images = {
  1: require('@/assets/memory/1.png'),
  2: require('@/assets/memory/2.png'),
  3: require('@/assets/memory/3.png'),
  4: require('@/assets/memory/4.png'),
  5: require('@/assets/memory/5.png'),
  6: require('@/assets/memory/6.png'),
};

const pairs = [1, 2, 3, 4, 5, 6];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MemoryGame() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
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
    const setup = () => {
      const duplicated = [...pairs, ...pairs];
      const shuffled = shuffle(duplicated.map((value, index) => ({
        id: index,
        value,
      })));
      setCards(shuffled);
    };
    setup();
  }, []);

  const handleFlip = (card) => {
    if (flipped.length === 2 || flipped.includes(card.id) || matched.includes(card.id)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id));
      if (first.value === second.value) {
        setMatched(prev => [...prev, first.id, second.id]);
        setTimeout(() => {
          setFlipped([]);
          if (matched.length + 2 === cards.length) {
            setFinished(true);
            oznaczGreJakoUkonczona();
          }
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const oznaczGreJakoUkonczona = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('zadania')
      .select('zrecznosciowe')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('❌ Błąd odczytu zadania:', error.message);
      return;
    }

    if (!data) {
      console.warn('❗ Nie znaleziono rekordu dla użytkownika');
      return;
    }

    const aktualne = data.zrecznosciowe || [];

    if (!aktualne.includes('memory')) {
      const zaktualizowane = [...aktualne, 'memory'];
      const { error: updateError } = await supabase
        .from('zadania')
        .update({ zrecznosciowe: zaktualizowane })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('❌ Błąd aktualizacji zrecznosciowe:', updateError.message);
      } else {
        console.log('✅ Gra "memory" zapisana jako ukończona!');
      }
    } else {
      console.log('ℹ️ Gra "memory" była już wcześniej ukończona.');
    }
  };

  const renderItem = ({ item }) => {
    const isVisible = flipped.includes(item.id) || matched.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleFlip(item)}
        activeOpacity={0.8}
      >
        {isVisible ? (
          <Image
            source={images[item.value]}
            style={styles.cardImage}
          />
        ) : (
          <View style={styles.cardBack} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.tytul}>Memory – znajdź pary</Text>
          <Text style={styles.tekst}>Odkrywaj karty i znajdź wszystkie pasujące pary.</Text>

          <FlatList
            data={cards}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.grid}
            scrollEnabled={false}
          />

          {finished && <Text style={styles.sukces}>Gra ukończona!</Text>}

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
    textAlign: 'center',
  },
  tekst: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 80,
    height: 80,
    margin: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E76617',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    backgroundColor: '#E76617',
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
});
