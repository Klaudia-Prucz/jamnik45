import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';

export default function StronaGlowna() {
  const router = useRouter();

  const wykonane = 12;
  const wszystkie = 45;
  const procent = Math.round((wykonane / wszystkie) * 100);
  const [dzisiejszeZadanie, setDzisiejszeZadanie] = useState('');
  const [czasDoPrezentu, setCzasDoPrezentu] = useState('');

  useEffect(() => {
    const zadania = [
      'Zrób 10 pajacyków 💪',
      'Powiedz komuś komplement 💬',
      'Znajdź coś w kolorze żółtym 🟡',
      'Napisz wiadomość z podziękowaniem 💌',
      'Zrób zdjęcie czemuś śmiesznemu 📸',
    ];
    const index = new Date().getDate() % zadania.length;
    setDzisiejszeZadanie(zadania[index]);

    const docelowaData = dayjs('2025-06-29T00:00:00');
    const aktualizujCzas = () => {
      const teraz = dayjs();
      const roznica = docelowaData.diff(teraz);
      const dni = Math.floor(roznica / (1000 * 60 * 60 * 24));
      const godziny = Math.floor((roznica / (1000 * 60 * 60)) % 24);
      const minuty = Math.floor((roznica / (1000 * 60)) % 60);
      const sekundy = Math.floor((roznica / 1000) % 60);
      setCzasDoPrezentu(`${dni}d ${godziny}h ${minuty}m ${sekundy}s`);
    };

    aktualizujCzas();
    const interval = setInterval(aktualizujCzas, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.tytul}>🎉 Witaj!</Text>
        <Text style={styles.podtytul}>Gotowy na dzisiejsze wyzwanie?</Text>

        <View style={styles.kartaZadania}>
          <Text style={styles.kartaTytul}>Kolejne zadanie</Text>
          <Text style={styles.kartaText}>{dzisiejszeZadanie}</Text>
        </View>

        <View style={styles.postep}>
          <Text style={styles.postepText}>
            ✅ Ukończono {wykonane} z {wszystkie} zadań ({procent}%)
          </Text>
        </View>

        <TouchableOpacity style={styles.kafelekWaski} onPress={() => router.push('/zadania')}>
          <Text style={styles.kafelekTekst}>Zobacz wszystkie zadania</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.kafelekWaski, styles.kafelekPomoc]} onPress={() => router.push('/pomoc')}>
          <Text style={styles.kafelekTekst}>Nie wiesz o co chodzi?</Text>
        </TouchableOpacity>

        <View style={styles.odliczanieBox}>
          <Text style={styles.odliczanieTytul}>Odliczanie do urodzin</Text>
          <Text style={styles.odliczanieText}>{czasDoPrezentu}</Text>
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  tytul: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#3F51B5',
  },
  podtytul: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  kartaZadania: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#E76617',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  kartaTytul: {
    fontWeight: '600',
    fontSize: 16,
    color: '#E76617',
    marginBottom: 5,
  },
  kartaText: {
    fontSize: 16,
    color: '#333',
  },
  postep: {
    marginBottom: 20,
    backgroundColor: '#FFF7F0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderWidth: 2,
    borderColor: '#E76617',
  },
  postepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E76617',
    textAlign: 'center',
  },
  kafelekWaski: {
    backgroundColor: '#E76617',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  kafelekPomoc: {
    backgroundColor: '#3F51B5',
  },
  kafelekTekst: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  odliczanieBox: {
    marginTop: 30,
    backgroundColor: '#FFF8E1',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#E76617',
  },
  odliczanieTytul: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#3F51B5',
  },
  odliczanieText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E76617',
  },
});
