import { db } from '@/firebaseConfig';
import { useFocusEffect, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
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
  const [ukonczoneQuizy, setUkonczoneQuizy] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const pobierzQuizy = async () => {
        const docRef = doc(db, 'appState', 'uczestnik1');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const dane = snap.data();
          const lista = Array.isArray(dane.quizy) ? dane.quizy : [];
          console.log('✔️ Ukonczone quizy z Firestore:', lista);
          setUkonczoneQuizy(lista);
        }
      };

      pobierzQuizy();
    }, [])
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.srodek}>
          <Text style={styles.tytul}>🧠 Wybierz zestaw quizów</Text>

          <View style={styles.lista}>
            {[...Array(15)].map((_, i) => {
              const id = (i + 1).toString(); // ważne: string!
              const ukonczony = ukonczoneQuizy.includes(id);
              console.log(`Quiz ${id} ukończony?`, ukonczony);

              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.kafelek, ukonczony && styles.kafelekUkonczony]}
                  onPress={() => router.push(`/zadania/quizy/${id}`)}
                >
                  <Text style={styles.kafelekText}>
                    {ukonczony ? `✅ Quiz ${id}` : `Quiz ${id}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    width: 90,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 50,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
