import { ImageBackground, ScrollView, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function Statystyki() {
  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.tytul}>📊 Statystyki</Text>

          <View style={styles.box}>
            <Text style={styles.label}>Wykonane zadania:</Text>
            <Text style={styles.value}>12 z 45</Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>Procent ukończenia:</Text>
            <Text style={styles.value}>27%</Text>
          </View>

          <View style={styles.box}>
            <Text style={styles.label}>Ostatnie wykonane zadanie:</Text>
            <Text style={styles.value}>Zadanie 12 – Zrób zdjęcie kota 🎉</Text>
          </View>
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
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tytul: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 30,
    textAlign: 'center',
  },
  box: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E76617',
  },
});
