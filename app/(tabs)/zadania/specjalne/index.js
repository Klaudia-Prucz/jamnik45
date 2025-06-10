import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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

export default function ListaZadanSpecjalnych() {
  const router = useRouter();
  const [zadania, setZadania] = useState({});
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

  // 📥 Pobierz pole `specjalne` z jednego wiersza
  useFocusEffect(
    useCallback(() => {
      const pobierz = async () => {
        if (!userId) return;

        const { data, error } = await supabase
          .from('zadania')
          .select('specjalne')
          .eq('user_id', userId)
          .maybeSingle();

        if (data?.specjalne) {
          setZadania(data.specjalne);
        } else {
          setZadania({});
        }

        if (error) {
          console.error('❌ Błąd pobierania specjalnych zadań:', error.message);
        }
      };
      pobierz();
    }, [userId])
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.tytul}>📸 Wybierz zadanie specjalne</Text>

          <View style={styles.lista}>
            {[...Array(10)].map((_, i) => {
              const id = String(i + 1);
              const dane = zadania?.[id];

              let status = 'brak';
              if (dane) {
                status = dane.accepted ? 'zaakceptowane' : 'oczekujące';
              }

              const ikona = {
                zaakceptowane: '✅',
                oczekujące: '🕒',
                brak: '📭',
              }[status];

              const kolor = {
                zaakceptowane: '#4CAF50',
                oczekujące: '#FFC107',
                brak: '#3F51B5',
              }[status];

              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.kafelek, { backgroundColor: kolor }]}
                  onPress={() => router.push(`/zadania/specjalne/${id}`)}
                >
                  <Text style={styles.kafelekText}>
                    {ikona} Zadanie {id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania')}>
            <Text style={styles.powrotText}>← Powrót do kategorii zadań</Text>
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
  wrapper: { flex: 1, padding: 20, justifyContent: 'space-between' },
  tytul: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 20,
    textAlign: 'center',
  },
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  kafelek: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    margin: 5,
  },
  kafelekText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  powrot: {
    alignItems: 'center',
    marginBottom: 40,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
