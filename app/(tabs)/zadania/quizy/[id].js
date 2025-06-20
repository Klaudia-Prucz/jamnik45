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

export default function Quiz() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [aktualne, setAktualne] = useState(0);
  const [odpowiedzi, setOdpowiedzi] = useState([]);
  const [pokazWynik, setPokazWynik] = useState(false);
  const [poprawne, setPoprawne] = useState(0);
  const [czyZaliczony, setCzyZaliczony] = useState(false);

  const quizId = Array.isArray(id) ? id[0] : String(id);

  useEffect(() => {
    if (!quizId) return;

    // Reset stanu przy zmianie quizu
    setQuiz(null);
    setAktualne(0);
    setOdpowiedzi([]);
    setPokazWynik(false);
    setPoprawne(0);
    setCzyZaliczony(false);

    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from('quizy')
        .select('*')
        .eq('id', quizId)
        .maybeSingle();

      if (!data) {
        setQuiz(null);
        return;
      }

      setQuiz(data);
    };

    const sprawdzCzyZaliczony = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('zadania')
        .select('quizy')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.quizy?.includes(quizId)) {
        setCzyZaliczony(true);
      }
    };

    fetchQuiz();
    sprawdzCzyZaliczony();
  }, [quizId]);

  useEffect(() => {
    if (pokazWynik && poprawne >= quiz?.pytania?.length) {
      zapiszDoBazy();
    }
  }, [pokazWynik]);

  const zapiszDoBazy = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      console.warn('Brak zalogowanego użytkownika:', userError);
      return;
    }

    let { data: rekordy } = await supabase
      .from('zadania')
      .select('*')
      .eq('user_id', user.id);

    let rekord = rekordy?.[0];

    if (!rekord) {
      const { data: nowy, error: insertError } = await supabase
        .from('zadania')
        .insert([{
          user_id: user.id,
          quizy: [quizId],
          rebusy: [],
          zrecznosciowe: [],
          specjalne: {},
        }])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Nie udało się utworzyć nowego wpisu:', insertError);
        return;
      }

      setCzyZaliczony(true);
      return;
    }

    const aktualneQuizy = rekord.quizy || [];

    if (aktualneQuizy.includes(quizId)) {
      console.log('Quiz już zapisany');
      setCzyZaliczony(true);
      return;
    }

    const { error: updateError } = await supabase
      .from('zadania')
      .update({ quizy: [...aktualneQuizy, quizId] })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Błąd podczas zapisu:', updateError.message);
    } else {
      console.log('✅ Quiz zapisany do bazy!');
      setCzyZaliczony(true);
    }
  };

  if (!quiz || !quiz.pytania || quiz.pytania.length === 0) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.error}>Nie znaleziono pytań w quizie 😢</Text>
      </SafeAreaView>
    );
  }

  if (czyZaliczony || pokazWynik) {
    return (
      <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
        <SafeAreaView style={styles.wrapper}>
          <View style={styles.top}>
            <Text style={styles.tytul}>Wynik quizu</Text>
            <Text style={styles.pytanie}>Poprawne odpowiedzi: {poprawne} / {quiz.pytania.length}</Text>
            <Text style={styles.sukces}>Quiz zaliczony ✅</Text>
          </View>

          <View style={styles.bottom}>
            <TouchableOpacity style={styles.przyciskDol} onPress={() => router.push('/zadania/quizy')}>
              <Text style={styles.tekst}>← Powrót do reszty quizów</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const pytanie = quiz.pytania[aktualne];

  function klikOdpowiedz(index) {
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
  }

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

        <TouchableOpacity style={styles.przyciskPowrot} onPress={() => router.back()}>
          <Text style={styles.powrotText}>← Powrót</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  wrapper: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    paddingBottom: 30,
  },
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
  przyciskDol: {
    backgroundColor: '#3F51B5',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  tekst: { color: '#FFF', fontSize: 16, fontWeight: '600' },

 
  przyciskPowrot: {
    backgroundColor: '#3F51B5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40, 
    alignSelf: 'center',
  },
  powrotText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});
