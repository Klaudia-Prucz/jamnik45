import { supabase } from '@/supabaseClient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { QUIZY } from './quizyBaza';

export default function Quiz() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const quizId = (Array.isArray(id) ? id[0] : String(id)).replace('quiz', '');
  const quiz = QUIZY.find((q) => q.id === quizId);

  const [aktualne, setAktualne] = useState(0);
  const [odpowiedzi, setOdpowiedzi] = useState([]);
  const [pokazWynik, setPokazWynik] = useState(false);
  const [poprawne, setPoprawne] = useState(0);

  useEffect(() => {
    if (pokazWynik && poprawne >= 3) {
      zapiszDoBazy();
    }
  }, [pokazWynik]);

  const klikOdpowiedz = (index) => {
    const nowe = [...odpowiedzi, index];
    setOdpowiedzi(nowe);

    if (nowe.length === quiz.pytania.length) {
      const liczbaPoprawnych = nowe.filter(
        (o, i) => o === quiz.pytania[i].poprawna
      ).length;
      setPoprawne(liczbaPoprawnych);
      setPokazWynik(true);
    } else {
      setAktualne((prev) => prev + 1);
    }
  };

  const zapiszDoBazy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('zadania').insert([
      {
        user_id: user.id,
        kategoria: 'quiz',
        zadanie_id: quiz.id,
        status: true,
      },
    ]);
  };

  if (!quiz) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.error}>Nie znaleziono quizu 😢</Text>
      </SafeAreaView>
    );
  }

  if (pokazWynik) {
    return (
      <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
        <SafeAreaView style={styles.wrapper}>
          <Text style={styles.tytul}>Wynik quizu</Text>
          <Text style={styles.pytanie}>Poprawne odpowiedzi: {poprawne} / {quiz.pytania.length}</Text>
          {poprawne >= 3 ? (
            <Text style={styles.sukces}>Quiz zaliczony ✅</Text>
          ) : (
            <TouchableOpacity style={styles.przycisk} onPress={() => {
              setAktualne(0);
              setOdpowiedzi([]);
              setPokazWynik(false);
              setPoprawne(0);
            }}>
              <Text style={styles.tekst}>Spróbuj ponownie</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.powrot} onPress={() => router.back()}>
            <Text style={styles.powrotText}>← Powrót</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const pytanie = quiz.pytania[aktualne];

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.tytul}>{quiz.nazwa}</Text>

        <View style={styles.blok}>
          <Text style={styles.pytanie}>{pytanie.pytanie}</Text>

          {pytanie.odpowiedzi.map((odp, i) => (
            <TouchableOpacity
              key={i}
              style={styles.odpowiedz}
              onPress={() => klikOdpowiedz(i)}
            >
              <Text style={styles.odpText}>{odp}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.powrot} onPress={() => router.back()}>
          <Text style={styles.powrotText}>← Powrót</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  wrapper: { flex: 1, padding: 20, justifyContent: 'space-between' },
  tytul: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 20,
  },
  blok: { gap: 12 },
  pytanie: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  odpowiedz: {
    backgroundColor: '#E76617',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  odpText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  sukces: {
    fontSize: 20,
    color: 'green',
    textAlign: 'center',
    marginVertical: 20,
  },
  przycisk: {
    backgroundColor: '#3F51B5',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  tekst: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  powrot: { marginTop: 30, alignItems: 'center' },
  powrotText: { color: '#3F51B5', fontSize: 16, fontWeight: '600' },
  error: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 50 },
});
