import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const zadania = [
  { id: 1, tytul: 'Zadanie 1 – Quiz o solenizantce' },
  { id: 2, tytul: 'Zadanie 2 – Znajdź różnice' },
  { id: 3, tytul: 'Zadanie 3 – Zrób śmieszne zdjęcie' },
  { id: 4, tytul: 'Zadanie 4 – Memory jamnika' },
  { id: 5, tytul: 'Zadanie 5 – Wyzwanie ruchowe' },
  // dodaj kolejne aż do 45!
];

export default function ZadaniaScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.tytul}>🎯 Twoje Zadania</Text>

        {zadania.map((zadanie) => (
          <TouchableOpacity
            key={zadanie.id}
            style={styles.kafelek}
            onPress={() => router.push(`/zadania/${zadanie.id}`)}
          >
            <Text style={styles.tekstKafla}>{zadanie.tytul}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    padding: 20,
    paddingTop: 80,
  },
  tytul: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 20,
    textAlign: 'center',
  },
  kafelek: {
    backgroundColor: '#E76617',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  tekstKafla: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
