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

const pytania = [
  { pytanie: 'W jakim kraju znajduje się Machu Picchu?', odpowiedzi: ['Peru', 'Meksyk', 'Chile'], poprawna: 'Peru' },
  { pytanie: 'Która wyspa należy do Włoch?', odpowiedzi: ['Ibiza', 'Sardynia', 'Kreta'], poprawna: 'Sardynia' },
  { pytanie: 'W jakim kraju jest miasto Petra?', odpowiedzi: ['Egipt', 'Jordania', 'Turcja'], poprawna: 'Jordania' },
  { pytanie: 'Stolica Japonii to?', odpowiedzi: ['Kioto', 'Osaka', 'Tokio'], poprawna: 'Tokio' },
  { pytanie: 'Które państwo słynie z fiordów?', odpowiedzi: ['Szwecja', 'Norwegia', 'Finlandia'], poprawna: 'Norwegia' },
  { pytanie: 'W jakim kraju jest safari Serengeti?', odpowiedzi: ['Kenia', 'Tanzania', 'RPA'], poprawna: 'Tanzania' },
  { pytanie: 'W jakim kraju znajduje się Angkor Wat?', odpowiedzi: ['Tajlandia', 'Kambodża', 'Wietnam'], poprawna: 'Kambodża' },
  { pytanie: 'W jakim kraju są wyspy Galapagos?', odpowiedzi: ['Ekwador', 'Brazylia', 'Kuba'], poprawna: 'Ekwador' },
  { pytanie: 'Stolica Australii to?', odpowiedzi: ['Sydney', 'Canberra', 'Melbourne'], poprawna: 'Canberra' },
  { pytanie: 'W jakim kraju leży miasto Dubaj?', odpowiedzi: ['Arabia Saudyjska', 'Katar', 'ZEA'], poprawna: 'ZEA' },
];

export default function SzybkiQuiz() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('loading');
  const [userId, setUserId] = useState(null);
  const [timer, setTimer] = useState(null);

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
        if (data?.zrecznosciowe?.includes('shake')) {
          setStatus('done');
        } else {
          setStatus('ready');
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (status === 'playing') {
      const timeout = setTimeout(() => handleAnswer(null), 3000);
      setTimer(timeout);
    }
    return () => clearTimeout(timer);
  }, [index, status]);

  const oznaczGreJakoUkonczona = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('zadania')
      .select('zrecznosciowe')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      const aktualne = data.zrecznosciowe || [];
      if (!aktualne.includes('shake')) {
        const nowe = [...aktualne, 'shake'];
        await supabase
          .from('zadania')
          .update({ zrecznosciowe: nowe })
          .eq('user_id', userId);
      }
    }
  };

  const handleAnswer = (odp) => {
    clearTimeout(timer);
    if (odp === pytania[index].poprawna) setScore((s) => s + 1);
    if (index + 1 < pytania.length) {
      setIndex(index + 1);
    } else {
      if (score + (odp === pytania[index].poprawna ? 1 : 0) >= 8) {
        setStatus('win');
        oznaczGreJakoUkonczona();
      } else {
        setStatus('fail');
      }
    }
  };

  const startGame = () => {
    setIndex(0);
    setScore(0);
    setStatus('playing');
  };

  const goBack = () => {
    router.replace('/zadania/zrecznosciowe');
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          {status === 'ready' && (
            <View>
              <Text style={styles.instrukcja}>
                Odpowiedz na 10 pytań w 3 sekundy każde. Musisz zdobyć co najmniej 8 poprawnych odpowiedzi, aby zaliczyć!
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startText}>Start</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'playing' && (
            <View>
              <Text style={styles.pytanie}>{pytania[index].pytanie}</Text>
              {pytania[index].odpowiedzi.map((o, i) => (
                <TouchableOpacity key={i} style={styles.odpowiedzBtn} onPress={() => handleAnswer(o)}>
                  <Text style={styles.odpowiedzText}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {status === 'win' && (
            <>
              <Text style={styles.result}>✅ Udało się! Zaliczyłeś quiz!</Text>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>⬅ Wróć do zestawu gier</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'fail' && (
            <>
              <Text style={styles.result}>❌ Za mało poprawnych odpowiedzi</Text>
              <TouchableOpacity style={styles.backButton} onPress={startGame}>
                <Text style={styles.backButtonText}>🔁 Spróbuj ponownie</Text>
              </TouchableOpacity>
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
  pytanie: { color: '#3F51B5', fontSize: 22, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  odpowiedzBtn: {
    backgroundColor: '#E76617',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 6,
    alignSelf: 'center',
  },
  odpowiedzText: { color: '#fff', fontSize: 18 },
  startButton: {
    backgroundColor: '#E76617',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  startText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  instrukcja: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
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
    marginBottom: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
