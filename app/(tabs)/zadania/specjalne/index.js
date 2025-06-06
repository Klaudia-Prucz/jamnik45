import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ListaZadanSpecjalnych() {
  const router = useRouter();
  const [zadania, setZadania] = useState({});

  useEffect(() => {
    const pobierzDane = async () => {
      const docRef = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dane = snap.data();
        setZadania(dane.specjalne || {});
      }
    };
    pobierzDane();
  }, []);

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.tytul}>📸 Wybierz zadanie specjalne</Text>

        <View style={styles.lista}>
          {[...Array(10)].map((_, i) => {
            const id = String(i + 1);
            const zadanie = zadania?.[id];

            let status = 'brak';
            if (zadanie) {
              status = zadanie.accepted ? 'zaakceptowane' : 'oczekujące';
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
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
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
  },
  kafelekText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
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
