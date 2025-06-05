import { useRouter } from 'expo-router';
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

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.srodek}>
          <Text style={styles.tytul}>🧠 Wybierz zestaw quizów</Text>

          <View style={styles.lista}>
            {[...Array(15)].map((_, i) => (
              <TouchableOpacity
                key={i}
                style={styles.kafelek}
                onPress={() => router.push(`/zadania/quizy/zestaw${i + 1}`)}
              >
                <Text style={styles.kafelekText}>Quiz {i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.powrot} onPress={() => router.back()}>
          <Text style={styles.powrotText}>← Powrót do kategorii zadań</Text>
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
    padding: 20,
    justifyContent: 'space-between',
  },
  srodek: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  },
  kafelekText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  powrot: {
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 50,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
