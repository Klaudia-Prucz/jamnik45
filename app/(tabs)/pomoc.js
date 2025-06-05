import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Pomoc() {
  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.tytul}>❓ Pomoc</Text>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>💡 Jak działa aplikacja?</Text>
            <Text style={styles.odpowiedz}>
              Masz do wykonania 45 zadań. Każde zadanie odblokowuje kolejne. Na końcu czeka Cię finałowy
              kod do sejfu z prezentem! 🎁
            </Text>
          </View>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>📸 Czy muszę robić zdjęcia?</Text>
            <Text style={styles.odpowiedz}>
              Niektóre zadania zawierają zdjęcia – wystarczy zrobić je z aparatu lub galerii.
            </Text>
          </View>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>📞 Mam problem – co teraz?</Text>
            <Text style={styles.odpowiedz}>
              Skontaktuj się z organizatorką urodzin lub spróbuj ponownie później 😉
            </Text>
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
  },
  tytul: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 20,
    textAlign: 'center',
  },
  blok: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  pytanie: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#E76617',
  },
  odpowiedz: {
    fontSize: 16,
    color: '#333',
  },
});
