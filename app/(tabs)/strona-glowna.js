import { useRouter } from 'expo-router';
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function StronaGlowna() {
  const router = useRouter();

  const wykonane = 12; // przykładowo
  const wszystkie = 45;
  const procent = Math.round((wykonane / wszystkie) * 100);

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.tytul}>Witaj!</Text>
          <Text style={styles.podtytul}>Gotowy na wyzwania urodzinowe?</Text>

          <View style={styles.postep}>
            <Text style={styles.postepText}>
              ✅ Wykonano {wykonane} z {wszystkie} zadań ({procent}%)
            </Text>
          </View>

          <TouchableOpacity style={styles.przycisk} onPress={() => router.push('/zadania')}>
            <Text style={styles.tekstPrzycisku}>📝 Przejdź do Zadań</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.przycisk, { backgroundColor: '#3F51B5' }]}
            onPress={() => router.push('/statystyki')}
          >
            <Text style={styles.tekstPrzycisku}>📊 Statystyki</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  tytul: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#3F51B5',
  },
  podtytul: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  jamnik: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  postep: {
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 12,
    borderRadius: 10,
  },
  postepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E76617',
    textAlign: 'center',
  },
  przycisk: {
    backgroundColor: '#E76617',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  tekstPrzycisku: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
