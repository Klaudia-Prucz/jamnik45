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

export default function ListaRebusow() {
  const router = useRouter();
  const [ukonczoneRebusy, setUkonczoneRebusy] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const pobierzRebusy = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('zadania')
          .select('zadanie_id')
          .eq('user_id', user.id)
          .eq('kategoria', 'rebus')
          .eq('status', true);

        if (error) {
          console.error('❌ Błąd pobierania rebusów:', error.message);
          return;
        }

        const lista = data.map((r) => r.zadanie_id);
        setUkonczoneRebusy(lista);
      };

      pobierzRebusy();
    }, [])
  );

  return (
    <ImageBackground
      source={require('@/assets/backstandard.png')}
      style={styles.tlo}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.tytul}>🧩 Wybierz rebus</Text>

          <View style={styles.lista}>
            {[...Array(10)].map((_, i) => {
              const id = String(i + 1);
              const zadanieId = `rebus${id}`;
              const ukonczony = ukonczoneRebusy.includes(zadanieId);

              return (
                <TouchableOpacity
                  key={zadanieId}
                  style={[styles.kafelek, ukonczony && styles.kafelekUkonczony]}
                  onPress={() => router.push(`/zadania/rebusy/${id}`)}
                >
                  <Text style={styles.kafelekText}>
                    {ukonczony ? `✅ Rebus ${id}` : `Rebus ${id}`}
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
  tlo: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  tytul: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 20,
  },
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  kafelek: {
    backgroundColor: '#E76617',
    width: 90,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  kafelekUkonczony: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  kafelekText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  powrot: {
    alignItems: 'center',
    marginTop: 30,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
