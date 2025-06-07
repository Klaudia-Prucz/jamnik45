import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import {
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ListaMiniGier() {
  const router = useRouter();
  const [ukonczone, setUkonczone] = useState([]);

  const paths = [
    'zlap',
    'pamiec',
    'kliknij',
    'reakcja',
    'traf',
    'unik',
    'rzut',
    'shake',
    'kierunek',
    'dotknij',
  ];

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dane = snap.data();
        setUkonczone(dane.zrecznosciowe || []);
      }
    };
    fetchData();
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/backstandard.png')}
      style={styles.tlo}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.innerWrapper}>
            <Text style={styles.tytul}>🎮 Wybierz mini-grę</Text>
            <View style={styles.lista}>
              {paths.map((path, index) => {
                const isDone = ukonczone.includes(path);
                return (
                  <TouchableOpacity
                    key={path}
                    style={[styles.kafelek, isDone && styles.kafelekDone]}
                    onPress={() => router.push(`/zadania/zrecznosciowe/${path}`)}
                  >
                    <Text style={styles.kafelekText}>
                      {isDone ? `✅ Gra ${index + 1}` : `🎯 Gra ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania')}>
              <Text style={styles.powrotText}>← Powrót do kategorii zadań</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  innerWrapper: {
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
    width: 160,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  kafelekDone: {
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
