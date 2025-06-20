import { supabase } from '@/supabaseClient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ListaQuizow() {
  const router = useRouter();
  const [wszystkieQuizy, setWszystkieQuizy] = useState([]);
  const [ukonczoneQuizy, setUkonczoneQuizy] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const pobierzDane = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
          console.error('❌ Błąd autoryzacji:', userError?.message);
          return;
        }

        console.log('🔐 Użytkownik:', user.id);

        const { data: quizy, error: quizError } = await supabase
          .from('quizy')
          .select('*');

        console.log('📦 Quizy z bazy:', quizy);
        if (quizError) {
          console.error('❌ Błąd pobierania quizów:', quizError.message);
        }

        setWszystkieQuizy(quizy || []);

        const { data, error } = await supabase
          .from('zadania')
          .select('quizy')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Błąd pobierania quizów z zadania:', error.message);
          return;
        }

        console.log('📋 Zadania użytkownika (quizy):', data);

        const lista = Array.isArray(data?.quizy) ? data.quizy : [];
        setUkonczoneQuizy(lista);
      };

      pobierzDane();
    }, [])
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.srodek}>
          <Text style={styles.tytul}>Wybierz zestaw quizów</Text>

          <View style={styles.lista}>
            {wszystkieQuizy.length === 0 ? (
              <Text style={styles.info}>Brak dostępnych quizów.</Text>
            ) : (
              wszystkieQuizy.map((quiz, i) => {
                const id = quiz.id;
                const ukonczony = ukonczoneQuizy.includes(id);

                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.kafelek, ukonczony && styles.kafelekUkonczony]}
                    onPress={() => router.push(`/zadania/quizy/${id}`)}
                  >
                    <Text style={styles.kafelekText}>
                      {ukonczony ? `✅ ${quiz.nazwa}` : quiz.nazwa}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania')}>
          <Text style={styles.powrotText}>← Powrót do kategorii zadań</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  wrapper: { flex: 1, padding: 20, justifyContent: 'space-between' },
  srodek: { alignItems: 'center', justifyContent: 'center', flex: 1 },
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
    backgroundColor: '#E76617',
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  kafelekUkonczony: {
    backgroundColor: '#4CAF50',
  },
  kafelekText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  info: {
    marginTop: 30,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  powrot: {
    alignItems: 'center',
    marginBottom: 50,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
