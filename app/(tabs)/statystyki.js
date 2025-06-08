import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default function Statystyki() {
  const [daneZadan, setDaneZadan] = useState({
    quizy: 0,
    rebusy: 0,
    zrecznosciowe: 0,
    specjalne: 0,
    razem: 0,
    procent: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const ref = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const dane = snap.data();
        const quizy = dane.quizy || [];
        const rebusy = dane.rebusy || [];
        const zrecznosciowe = dane.zrecznosciowe || [];
        const specjalne = dane.specjalne || {};

        const q = quizy.length;
        const r = rebusy.length;
        const z = zrecznosciowe.length;
        const s = Object.keys(specjalne).length;

        const razem = q + r + z + s;
        const procent = Math.round((razem / 45) * 100);

        setDaneZadan({ quizy: q, rebusy: r, zrecznosciowe: z, specjalne: s, razem, procent });
      }
    };

    fetchStats();
  }, []);

  const renderProgress = (label, done, total) => (
    <View style={styles.barWrapper}>
      <Text style={styles.barLabel}>{label}: {done}/{total}</Text>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${(done / total) * 100}%` }]} />
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}> 
        <ScrollView contentContainerStyle={styles.wrapper}>
          <Text style={styles.header}>📊 Statystyki</Text>
          <View style={styles.card}>
            {renderProgress('Quizy', daneZadan.quizy, 15)}
            {renderProgress('Rebusy', daneZadan.rebusy, 10)}
            {renderProgress('Zręcznościowe', daneZadan.zrecznosciowe, 10)}
            {renderProgress('Specjalne', daneZadan.specjalne, 10)}
            <Text style={styles.summary}>Łącznie wykonano: {daneZadan.razem}/45</Text>
            <Text style={styles.summary}>Procent ukończenia: {daneZadan.procent}%</Text>
          </View>
        </ScrollView>
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
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 20,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    alignItems: 'center',
  },
  barWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  barLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  progressBackground: {
    height: 14,
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3F51B5',
  },
  summary: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
});
