import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
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
import { supabase } from '@/supabaseClient';

const { width, height } = Dimensions.get('window');

export default function Zlap() {
  const router = useRouter();
  const [position, setPosition] = useState({ top: 100, left: 100 });
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(true);
  const [finished, setFinished] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(true);

  const total = 10;
  const duration = 900;

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

      if (data?.zrecznosciowe?.includes('zlap')) {
        setFinished(true);
      }
    };

    sprawdzCzyUkonczona();
  }, [userId]);

  useEffect(() => {
    if (finished) return;

    const timer = setTimeout(() => {
      if (show) {
        setShow(false);
      } else {
        setRandomPosition();
        setIsCorrect(Math.random() > 0.4); // 60% szans na poprawną
        setShow(true);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [show, finished]);

  const setRandomPosition = () => {
    const minTop = 200;
    const top = minTop + Math.random() * (height - 300);
    const left = Math.random() * (width - 100);
    setPosition({ top, left });
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

    if (!aktualne.includes('zlap')) {
      const zaktualizowane = [...aktualne, 'zlap'];
      const { error: updateError } = await supabase
        .from('zadania')
        .update({ zrecznosciowe: zaktualizowane })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('❌ Błąd aktualizacji zrecznosciowe:', updateError.message);
      } else {
        console.log('✅ Gra "zlap" zapisana jako ukończona!');
      }
    } else {
      console.log('ℹ️ Gra "zlap" była już wcześniej ukończona.');
    }
  };

  const handlePress = () => {
    if (finished) return;

    if (isCorrect) {
      const now = count + 1;
      setCount(now);
      if (now >= total) {
        setFinished(true);
        oznaczGreJakoUkonczona();
      }
    }

    setShow(false);
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.tytul}>Tapnij bardziej aktualnego Alka!</Text>
          <Text style={styles.tekst}>
  
          </Text>
          <Text style={styles.wynik}>Złapano poprawnie: {count} / {total}</Text>

          {show && !finished && (
            <TouchableOpacity
              onPress={handlePress}
              style={[styles.ikona, { top: position.top, left: position.left }]}
            >
              <Image
                source={
                  isCorrect
                    ? require('@/assets/ikona-dobra.png')
                    : require('@/assets/ikona-zla.png')
                }
                style={styles.image}
              />
            </TouchableOpacity>
          )}

          {finished && <Text style={styles.sukces}>Gra zaliczona!</Text>}

          <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania/zrecznosciowe')}>
            <Text style={styles.powrotText}>← Wybierz inną grę</Text>
          </TouchableOpacity>
        </View>

        {finished && (
          <View style={styles.nakladka}>
            <Text style={styles.tekstNakladka}>Gra została już ukończona</Text>
            <TouchableOpacity style={styles.przyciskNakladka} onPress={() => router.replace('/zadania//zrecznosciowe')}>
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
    marginBottom: 10,
  },
  wynik: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ikona: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E76617',
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
