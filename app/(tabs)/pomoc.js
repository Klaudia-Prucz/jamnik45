import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Pomoc() {
  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.tytul}>❓ Pomoc</Text>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>🎂 O co chodzi w tej aplikacji?</Text>
            <Text style={styles.odpowiedz}>
              To urodzinowa gra z 45 zadaniami! 🐶 Aplikacja poprowadzi Cię przez quizy, rebusy, gry i zadania specjalne. Na końcu czeka Cię finałowy kod do sejfu z prezentem! Dostępne tylko jeżeli ukończysz wszystkie zabawy 🎁
            </Text>
          </View>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>📸 Jak działają zadania specjalne?</Text>
            <Text style={styles.odpowiedz}>
              Wymagają zrobienia zdjęcia (np. z galerii lub aparatu). Zdjęcie zostaje zapisane w bazie i ja muszę je ręcznie zaakceptować. Jeśli wszystko się zgadza – zaliczam zadanie. Jeśli nie – wraca do poprawy.
            </Text>
          </View>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>🌀 Aplikacja się nie ładuje?</Text>
            <Text style={styles.odpowiedz}>
              Daj mi znać – może coś poszło nie tak. Spróbuję to naprawić jak najszybciej.
            </Text>
          </View>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>🧠 Nie wiesz, jak rozwiązać zadanie?</Text>
            <Text style={styles.odpowiedz}>
              Odezwij się do mnie – mogę podrzucić Ci małą podpowiedź, ale bez spoilerów 😉
            </Text>
          </View>

          <View style={styles.blok}>
            <Text style={styles.pytanie}>📩 Inne problemy?</Text>
            <Text style={styles.odpowiedz}>
              Niezależnie od sytuacji – pisz śmiało! 😉
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
    lineHeight: 22,
  },
});
