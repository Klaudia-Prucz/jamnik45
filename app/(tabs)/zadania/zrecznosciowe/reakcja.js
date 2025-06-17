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
import { supabase } from '@/supabaseClient';

export default function ReakcjaGra() {
  const router = useRouter();
  const [status, setStatus] = useState('intro'); // intro | ready | waiting | now | win | fail
  const [message, setMessage] = useState('Klikaj tylko wtedy kiedy pojawi się sygnał!');
  const [timeoutId, setTimeoutId] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
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

      if (data?.zrecznosciowe?.includes('reakcja')) {
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

    if (!aktualne.includes('reakcja')) {
      const zaktualizowane = [...aktualne, 'reakcja'];
      const { error: updateError } = await supabase
        .from('zadania')
        .update({ zrecznosciowe: zaktualizowane })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('❌ Błąd aktualizacji zrecznosciowe:', updateError.message);
      } else {
        console.log('✅ Gra "reakcja" zapisana jako ukończona!');
      }
    }
  };

  const startRound = () => {
    setStatus('waiting');
    setMessage('Czekaj na sygnał...');
    const delay = Math.floor(Math.random() * 3000) + 2000;

    const id = setTimeout(() => {
      setStatus('now');
      setMessage('KLIKNIJ TERAZ!');
      const failTimeout = setTimeout(() => {
        setStatus('fail');
        setMessage('Za wolno! Kliknij, aby zacząć od nowa');
        setSuccessCount(0);
      }, 800);
      setTimeoutId(failTimeout);
    }, delay);

    setTimeoutId(id);
  };

  const startGame = () => {
    setSuccessCount(0);
    setStatus('ready');
    setMessage('Kliknij, aby rozpocząć');
  };

  const handlePress = () => {
    if (status === 'intro') {
      startGame();
    } else if (status === 'ready') {
      startRound();
    } else if (status === 'waiting') {
      clearTimeout(timeoutId);
      setStatus('fail');
      setMessage('Za wcześnie! Kliknij, aby zacząć od nowa');
      setSuccessCount(0);
    } else if (status === 'now') {
      clearTimeout(timeoutId);
      const newCount = successCount + 1;
      setSuccessCount(newCount);

      if (newCount >= 10) {
        setStatus('win');
        setMessage('🎉 Udało się!');
        oznaczGreJakoUkonczona();
        setFinished(true);
      } else {
        startRound();
      }
    } else if (status === 'win' || status === 'fail') {
      startGame();
    }
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <TouchableOpacity style={styles.touchArea} onPress={handlePress} activeOpacity={0.8}>
            <Text style={styles.tytul}>{message}</Text>
            {(status === 'waiting' || status === 'now') && (
              <Text style={styles.counter}>{successCount} / 10</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/zadania/zrecznosciowe')}>
            <Text style={styles.backButtonText}>← Wróć do pozostałych gier</Text>
          </TouchableOpacity>
        </View>

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
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 24,
  },
  tytul: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 16,
  },
  counter: {
    fontSize: 22,
    color: '#333',
    marginTop: 10,
    fontWeight: '600',
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
