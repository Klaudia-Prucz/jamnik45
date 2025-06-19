import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '@/supabaseClient';

const plaze = [
  { obraz: require('../../../../assets/plaze/1.png'), kraj: 'malediwy' },
  { obraz: require('../../../../assets/plaze/2.png'), kraj: 'australia' },
  { obraz: require('../../../../assets/plaze/3.png'), kraj: 'grecja' },
  { obraz: require('../../../../assets/plaze/4.png'), kraj: 'seszele' },
  { obraz: require('../../../../assets/plaze/5.png'), kraj: 'brazylia' },
  { obraz: require('../../../../assets/plaze/6.png'), kraj: 'tajlandia' },
  { obraz: require('../../../../assets/plaze/7.png'), kraj: 'meksyk' },
];

export default function RzutGra() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [odpowiedz, setOdpowiedz] = useState('');
  const [trafione, setTrafione] = useState(0);
  const [status, setStatus] = useState('intro');
  const [summary, setSummary] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  const zapiszDoBazy = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('zadania')
      .select('zrecznosciowe')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return;
    const aktualne = data.zrecznosciowe || [];

    if (!aktualne.includes('rzut')) {
      const nowe = [...aktualne, 'rzut'];
      await supabase
        .from('zadania')
        .update({ zrecznosciowe: nowe })
        .eq('user_id', userId);
    }
  };

  const startGame = () => {
    setIndex(0);
    setTrafione(0);
    setOdpowiedz('');
    setStatus('playing');
    setSummary(false);
  };

  const handleNext = () => {
    const poprawna = plaze[index].kraj.toLowerCase().trim();
    const wpisana = odpowiedz.toLowerCase().trim();
    const poprawnie = wpisana === poprawna;

    if (poprawnie) {
      setTrafione((t) => t + 1);
    }

    setOdpowiedz('');
    Keyboard.dismiss();

    const nowaLiczbaTrafien = trafione + (poprawnie ? 1 : 0);

    if (index < plaze.length - 1) {
      setIndex((i) => i + 1);
    } else {
      if (nowaLiczbaTrafien >= 5) {
        zapiszDoBazy();
      }
      setStatus('summary');
      setSummary(true);
    }
  };

  const reset = () => {
    setStatus('intro');
    setSummary(false);
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          {status === 'intro' && (
            <View style={styles.centered}>
              <Text style={styles.description}>
                W związku z tym, że jesteś podróżnikiem z krwi i kości – odgadnij kraj, w którym znajduje się plaża ze zdjęcia. Minimum 5 poprawnych zalicza zadanie. 
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startText}>Start</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'playing' && (
            <>
              <Text style={styles.info}>Plaża {index + 1} z 7</Text>
              <Image source={plaze[index].obraz} style={styles.obraz} />
              <TextInput
                style={styles.input}
                placeholder="Wpisz kraj..."
                placeholderTextColor="#999"
                value={odpowiedz}
                onChangeText={setOdpowiedz}
              />
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Dalej</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'summary' && summary && (
            <View style={styles.nakladka}>
              <Text style={styles.tekstNakladka}>
                {trafione >= 5
                  ? `🎉 Brawo! Odgadłeś ${trafione} z 7 plaż!`
                  : `😢 Odgadłeś tylko ${trafione} z 7. Spróbuj ponownie!`}
              </Text>
              <TouchableOpacity
                style={styles.przyciskNakladka}
                onPress={() => {
                  if (trafione >= 5) {
                    router.replace('/zadania/zrecznosciowe');
                  } else {
                    reset();
                  }
                }}
              >
                <Text style={styles.przyciskNakladkaText}>
                  {trafione >= 5 ? 'Wróć do zadań' : 'Spróbuj ponownie'}
                </Text>
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
  wrapper: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  description: {
    fontSize: 20,
    color: '#3F51B5',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    color: '#3F51B5',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  obraz: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    color: '#000',
  },
  button: {
    backgroundColor: '#E76617',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#E76617',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nakladka: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 12,
  },
  tekstNakladka: {
    fontSize: 22,
    color: '#3F51B5',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  przyciskNakladka: {
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  przyciskNakladkaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
