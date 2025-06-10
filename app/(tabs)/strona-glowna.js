import { useCallback, useState } from 'react';
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
  const [szybkieZadanie, setSzybkieZadanie] = useState(null);
  const [userId, setUserId] = useState(null);

  // 📥 Pobierz aktualnego użytkownika
  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      };
      fetchUser();
    }, [])
  );

  // 📥 Pobierz dane i przelicz procent
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!userId) return;

        const { data, error } = await supabase
          .from('zadania')
          .select('quizy, rebusy, zrecznosciowe, specjalne')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('❌ Błąd pobierania danych:', error.message);
          return;
        }

        if (data) {
          const { quizy = [], rebusy = [], zrecznosciowe = [], specjalne = {} } = data;
          const wykonane = new Set([
            ...quizy,
            ...rebusy,
            ...zrecznosciowe,
            ...Object.keys(specjalne),
          ]);

          const progres = Math.min(Math.round((wykonane.size / 45) * 100), 100);
          setProcent(progres);

          // Wybierz losowe szybkie zadanie
          const wszystkie = [
            ...Array(15).fill(null).map((_, i) => ({ typ: 'quizy', id: `${i}` })),
            ...Array(10).fill(null).map((_, i) => ({ typ: 'rebusy', id: `${i}` })),
            ...Array(10).fill(null).map((_, i) => ({ typ: 'specjalne', id: `${i}` })),
            ...Array(10).fill(null).map((_, i) => ({ typ: 'zrecznosciowe', id: `${i}` })),
          ];

          const niewykonane = wszystkie.filter(z => !wykonane.has(z.id));
          if (niewykonane.length > 0) {
            const losowe = niewykonane[Math.floor(Math.random() * niewykonane.length)];
            setSzybkieZadanie(losowe);
          } else {
            setSzybkieZadanie(null);
          }
        }
      };

      fetchData();
    }, [userId])
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.naglowek}>Witaj w swojej urodzinowej appce!</Text>

          <View style={styles.postepContainer}>
            <Text style={styles.procent}>{procent}%</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${procent}%` }]} />
            </View>
          </View>

          {szybkieZadanie && (
            <TouchableOpacity
              style={[styles.card, { borderColor: '#E76617', borderWidth: 2 }]}
              onPress={() => router.push(`/zadania/${szybkieZadanie.typ}/${szybkieZadanie.id}`)}
            >
              <Feather name="zap" size={28} color="#E76617" />
              <Text style={styles.cardText}>Losuj zadanie</Text>
            </TouchableOpacity>
          )}

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
    marginBottom: 20,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
    fontSize: 20,
    fontWeight: 'bold',
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
