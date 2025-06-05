import { View, Text, StyleSheet } from 'react-native';

export default function Roznice() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔍 Znajdź różnice - przykładowy ekran</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});