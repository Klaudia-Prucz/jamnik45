import { useRouter } from 'expo-router';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Zadania() {
  const router = useRouter();
  const wykonane = 45;
  const wszystkie = 45;

  const renderKafelek = (tekst, onPress, kolor = '#E76617') => (
    <TouchableOpacity
      key={tekst}
      style={[styles.kategoriaKafelek, { backgroundColor: kolor }]}
      onPress={onPress}
    >
      <Text style={styles.kategoriaTekst}>{tekst}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.tytul}>🎯 Wybierz kategorię zadań</Text>

        <View style={styles.kategorieSiatka}>
          {renderKafelek('🧠 Quizy', () => router.push('/zadania/quizy'))}
          {renderKafelek('📸 Zadania specjalne', () => router.push('/zadania/specjalne'), '#3F51B5')}
          {renderKafelek('🔍 Rebusy', () => router.push('/zadania/rebusy'), '#4CAF50')}
          {renderKafelek('🎮 Zręcznościowe', () => router.push('/zadania/zrecznosciowe'), '#FF9800')}
        </View>

        <TouchableOpacity
          style={[
            styles.prezentKafelek,
            { opacity: wykonane < wszystkie ? 0.4 : 1 },
          ]}
          onPress={() => router.push('/gift')}
          disabled={wykonane < wszystkie}
        >
          <Text style={styles.prezentTekst}>🎁 Odbierz prezent</Text>
          <Text style={styles.prezentOpis}>
            Dostępny po wykonaniu wszystkich zadań!
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: {
    flex: 1,
    resizeMode: 'cover',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tytul: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 30,
  },
  kategorieSiatka: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  kategoriaKafelek: {
    width: '48%',
    paddingVertical: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  kategoriaTekst: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  prezentKafelek: {
    backgroundColor: '#9C27B0',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    marginTop: 20,
  },
  prezentTekst: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  prezentOpis: {
    color: '#FFEAF6',
    fontSize: 14,
    textAlign: 'center',
  },
});
