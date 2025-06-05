// plik: app/zadania/quizy/[id].js
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function QuizZestaw() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.tytul}>Quiz #{id} jest w trakcie 🔄</Text>
      <Text style={styles.podtekst}>Wkrótce pojawią się tu pytania...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tytul: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 10,
    textAlign: 'center',
  },
  podtekst: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
