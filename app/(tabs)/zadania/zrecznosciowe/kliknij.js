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
  Dimensions,
} from 'react-native';
import { supabase } from '@/supabaseClient';

const screenWidth = Dimensions.get('window').width;

const images = {
  ice: require('@/assets/ice.jpg'),
  reveal: require('@/assets/hidden.png'),
};

export default function KliknijGra() {
  const router = useRouter();
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [status, setStatus] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

      if (data?.zrecznosciowe?.includes('kliknij')) {
        setFinished(true);
      }
    };

    sprawdzCzyUkonczona();
  }, [userId]);

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

    if (!aktualne.includes('kliknij')) {
      const zaktualizowane = [...aktualne, 'kliknij'];
      const { error: updateError } = await supabase
        .from('zadania')
        .update({ zrecznosciowe: zaktualizowane })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('❌ Błąd aktualizacji zrecznosciowe:', updateError.message);
      } else {
        console.log('✅ Gra "kliknij" zapisana jako ukończona!');
      }
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      if (clicks >= 45) {
        setStatus('win');
        oznaczGreJakoUkonczona();
        setFinished(true);
      } else {
        setStatus('fail');
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(10);
    setStatus(null);
    setIsPlaying(true);
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <View style={styles.centered}>
            <Text style={styles.tytul}>Klikaj w bruk, żeby odkryć niespodziankę!</Text>
            <Text style={styles.podtytul}>Czas: {timeLeft}s | Kliknięcia: {clicks}</Text>

            <View style={styles.clickArea}>
              <Image source={images.reveal} style={styles.revealImage} />
              {clicks < 45 && (
                <Image
                  source={images.ice}
                  style={[
                    styles.iceImage,
                    { opacity: 1 - clicks / 45 }
                  ]}
                />
              )}
              {isPlaying && (
                <TouchableOpacity
                  style={styles.invisibleClickZone}
                  onPress={() => setClicks((prev) => prev + 1)}
                />
              )}
            </View>

            {status === 'win' && (
              <Text style={[styles.infoText, styles.zaliczone]}>Gra zaliczona!</Text>
            )}
            {status === 'fail' && (
              <Text style={[styles.infoText, styles.niezaliczone]}>Za mało kliknięć!</Text>
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/zadania/zrecznosciowe')}>
            <Text style={styles.backButtonText}>← Wybierz inną grę</Text>
          </TouchableOpacity>
        </View>

        {finished && (
          <View style={styles.nakladka}>
            <Image source={images.reveal} style={styles.nakladkaReveal} />
            <Text style={styles.tekstNakladka}>Gra została już ukończona</Text>
            <TouchableOpacity style={styles.przyciskNakladka} onPress={() => router.replace('/zadania')}>
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
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tytul: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 12,
    textAlign: 'center',
  },
  podtytul: {
    fontSize: 18,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  clickArea: {
    width: 250,
    height: 250,
    position: 'relative',
    marginBottom: 20,
  },
  revealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
  iceImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
  invisibleClickZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  infoText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  zaliczone: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  niezaliczone: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  nakladka: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
  },
  nakladkaReveal: {
    width: 400,
    height: (400 * 42) / 59,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  tekstNakladka: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
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
