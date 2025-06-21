import { useCallback, useEffect, useState } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';

export default function StronaGlowna() {
  const router = useRouter();
  const [procent, setProcent] = useState(0);
  const [odliczanie, setOdliczanie] = useState('');

  useEffect(() => {
    const cel = new Date('2025-06-29T00:00:00');
    const interval = setInterval(() => {
      const teraz = new Date();
      const roznica = cel - teraz;

      if (roznica <= 0) {
        setOdliczanie('🎂 To dziś! Wszystkiego najlepszego!');
        clearInterval(interval);
      } else {
        const dni = Math.floor(roznica / (1000 * 60 * 60 * 24));
        const godziny = Math.floor((roznica / (1000 * 60 * 60)) % 24);
        const minuty = Math.floor((roznica / (1000 * 60)) % 60);
        const sekundy = Math.floor((roznica / 1000) % 60);

        setOdliczanie(`${dni}d ${godziny}h ${minuty}m ${sekundy}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        console.log('🔁 Start ładowania użytkownika i danych z Supabase');

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('❌ Błąd pobierania usera:', userError?.message);
          return;
        }

        const userId = user.id;
        console.log('✅ userId:', userId);

        const { data: quizyZBazy, error: quizyError } = await supabase
          .from('quizy')
          .select('id');

        if (quizyError) {
          console.error('❌ Błąd pobierania quizów z bazy:', quizyError.message);
        }

        const quizy = (quizyZBazy || []).map(q => q.id);

        const { data, error } = await supabase
          .from('zadania')
          .select('quizy, rebusy, zrecznosciowe, specjalne')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('❌ Błąd pobierania danych:', error.message);
          return;
        }

        if (!data) {
          console.warn('⚠️ Brak danych z tabeli zadania dla usera:', userId);
          return;
        }

        console.log('✅ Dane z bazy:', data);

        const { quizy: zaliczoneQuizy = [], rebusy = [], zrecznosciowe = [], specjalne = {} } = data;

        const specjalneAccepted = Object.entries(specjalne)
          .filter(([_, val]) => val?.accepted === true)
          .map(([key]) => key);

        const wykonane = new Set([
          ...zaliczoneQuizy,
          ...rebusy,
          ...zrecznosciowe,
          ...specjalneAccepted,
        ]);

        const progres = Math.min(Math.round((wykonane.size / 45) * 100), 100);
        setProcent(progres);
      };

      fetchData();
    }, [])
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.naglowek}>Witaj w swojej urodzinowej appce!</Text>

          <Text style={styles.odliczanie}>Do urodzin zostało: {odliczanie}</Text>

          <View style={styles.postepContainer}>
            <Text style={styles.procent}>Postęp wykonania zadań: {procent}%</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${procent}%` }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/zadania')}>
            <Feather name="target" size={32} color="#3F51B5" />
            <Text style={styles.cardText}>Zadania</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/statystyki')}>
            <Feather name="bar-chart" size={32} color="#3F51B5" />
            <Text style={styles.cardText}>Statystyki</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/pomoc')}>
            <Feather name="help-circle" size={32} color="#3F51B5" />
            <Text style={styles.cardText}>Pomoc</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
  },
  naglowek: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  odliczanie: {
    fontSize: 18,
    color: '#E76617',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  postepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBarBackground: {
    height: 16,
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3F51B5',
  },
  procent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3F51B5',
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#3F51B5',
  },
});
