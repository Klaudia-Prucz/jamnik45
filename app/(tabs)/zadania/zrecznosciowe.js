import { StyleSheet, Text, View } from 'react-native';

export default function Zrecznosciowe() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎮 Zręcznościowe - przykładowy ekran</Text>
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