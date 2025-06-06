import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';

export default function EkranPrezentu() {
  const kodSejfu = '7452'; // ← wpisz tu swój właściwy kod

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.gratulacje}>🎉 GRATULACJE!</Text>
      <Text style={styles.tekst}>W końcu możesz zobaczyć właściwy prezent.</Text>

      <View style={styles.kodContainer}>
        <Text style={styles.kod}>{kodSejfu}</Text>
        <Text style={styles.podpowiedz}>Użyj tego kodu, by otworzyć sejf 🎁</Text>
      </View>

      <Text style={styles.koncoweZyczenia}>Jeszcze raz wszystkiego najlepszego! 🥳</Text>

      <Image source={require('../../assets/end1.png')} style={styles.obrazek} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gratulacje: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E76617',
    marginBottom: 20,
    textAlign: 'center',
  },
  tekst: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  kodContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E76617',
    alignItems: 'center',
    marginBottom: 30,
  },
  kod: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#3F51B5',
  },
  podpowiedz: {
    fontSize: 14,
    marginTop: 8,
    color: '#666',
  },
  koncoweZyczenia: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000',
    marginTop: 40,
  },
  obrazek: {
  width: '100%',        // ← rozciąga od lewej do prawej krawędzi
  height: 300,          // ← dopasuj do proporcji obrazka
  resizeMode: 'cover',  // ← lub 'contain' jeśli chcesz widzieć całe
  marginTop: 20,
  borderRadius: 0,
  
  },
});
