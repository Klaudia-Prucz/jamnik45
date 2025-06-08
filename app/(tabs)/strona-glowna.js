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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function StronaGlowna() {
  const router = useRouter();
  const [procent, setProcent] = useState(0);
  const [szybkieZadanie, setSzybkieZadanie] = useState(null);

  const pobierzProcent = async () => {
    try {
      const docRef = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dane = snap.data();
        let liczba = 0;
        if (Array.isArray(dane.quizy)) liczba += dane.quizy.length;
        if (Array.isArray(dane.rebusy)) liczba += dane.rebusy.length;
        if (Array.isArray(dane.zrecznosciowe)) liczba += dane.zrecznosciowe.length;
        if (typeof dane.specjalne === 'object') liczba += Object.keys(dane.specjalne).length;
        const progres = Math.min(Math.round((liczba / 45) * 100), 100);
        setProcent(progres);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
    }
  };

  const pobierzSzybkieZadanie = async () => {
    try {
      const docRef = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dane = snap.data();
        const wszystkie = [
          ...Array(15).fill(null).map((_, i) => ({ typ: 'quizy', id: `${i}` })),
          ...Array(10).fill(null).map((_, i) => ({ typ: 'rebusy', id: `${i}` })),
          ...Array(10).fill(null).map((_, i) => ({ typ: 'specjalne', id: `${i}` })),
          ...Array(10).fill(null).map((_, i) => ({ typ: 'zrecznosciowe', id: `${i}` })),
        ];

        const wykonane = new Set([
          ...(dane.quizy || []),
          ...(dane.rebusy || []),
          ...(dane.zrecznosciowe || []),
          ...Object.keys(dane.specjalne || {}),
        ]);

        const niewykonane = wszystkie.filter((z) => !wykonane.has(z.id));

        if (niewykonane.length > 0) {
          const losowe = niewykonane[Math.floor(Math.random() * niewykonane.length)];
          setSzybkieZadanie(losowe);
        } else {
          setSzybkieZadanie(null);
        }
      }
    } catch (e) {
      console.error('Błąd pobierania szybkiego zadania:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      pobierzProcent();
      pobierzSzybkieZadanie();
    }, [])
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrapper}>
          <Text style={styles.naglowek}>🎉 Witaj w Questniku45!</Text>

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
  tlo: {
    flex: 1,
  },
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
    color: '#fff',
    marginVertical: 20,
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
  szybkieTytul: {
    marginTop: 6,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#000',
    textAlign: 'center',
  },
});
