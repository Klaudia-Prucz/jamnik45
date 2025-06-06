import { db } from '@/firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import { QUIZY } from './quizyBaza';

export default function Quiz() {
  const { id } = useLocalSearchParams();
  const quizId = String(id);
  const router = useRouter();

  const quiz = QUIZY.find((q) => q.id === quizId);
  const pytania = quiz?.pytania || [];

  const [index, setIndex] = useState(0);
  const [wynik, setWynik] = useState(0);
  const [koniec, setKoniec] = useState(false);
  const [zapisano, setZapisano] = useState(false);
  const [wczesniejUkonczony, setWczesniejUkonczony] = useState(false);

  const obecne = pytania[index];

  useEffect(() => {
    const sprawdz = async () => {
      const docRef = doc(db, 'appState', 'uczestnik1');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dane = snap.data();
        const ukonczone = dane.quizy || [];
        if (ukonczone.includes(quizId)) {
          setKoniec(true);
          setWczesniejUkonczony(true);
        }
      }
    };
    sprawdz();
  }, [quizId]);

  const wybierzOdpowiedz = (i) => {
    if (i === obecne.poprawna) setWynik((prev) => prev + 1);
    if (index + 1 < pytania.length) {
      setIndex((prev) => prev + 1);
    } else {
      setKoniec(true);
    }
  };

  useEffect(() => {
    if (koniec && !zapisano && !wczesniejUkonczony && wynik >= 3) {
      const oznaczQuiz = async () => {
        const docRef = doc(db, 'appState', 'uczestnik1');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const quizy = snap.data().quizy || [];
          if (!quizy.includes(quizId)) {
            await updateDoc(docRef, {
              quizy: arrayUnion(quizId),
            });
          }
        }
      };
      oznaczQuiz();
      setZapisano(true);
    }
  }, [koniec]);

  const zresetujQuiz = () => {
    setIndex(0);
    setWynik(0);
    setKoniec(false);
    setZapisano(false);
    setWczesniejUkonczony(false);
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.container}>
        {koniec ? (
          <>
            {wczesniejUkonczony || wynik >= 3 ? (
              <>
                <Text style={styles.tytul}>
                  🎉 {wczesniejUkonczony ? 'Quiz już wykonany' : 'Ukończono quiz!'}
                </Text>
                <Text style={styles.wynik}>Poprawne: {wynik} / {pytania.length}</Text>
                <Text style={styles.wynik}>Błędne: {pytania.length - wynik}</Text>
                <TouchableOpacity
                  onPress={() => router.replace('/zadania/quizy')}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>← Powrót do listy quizów</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.tytul}>🙁 Nie zaliczono quizu</Text>
                <Text style={styles.wynik}>Poprawne: {wynik} / {pytania.length}</Text>
                <Text style={styles.wynik}>Musisz mieć co najmniej 3 poprawne odpowiedzi</Text>
                <TouchableOpacity onPress={zresetujQuiz} style={styles.button}>
                  <Text style={styles.buttonText}>🔁 Spróbuj ponownie</Text>
                </TouchableOpacity>
                <TouchableOpacity
    onPress={() => router.replace('/zadania/quizy')}
    style={[styles.button, { backgroundColor: '#777', marginTop: 12 }]}
  >
    <Text style={styles.buttonText}>← Powrót do zestawów quizów</Text>
  </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.numer}>Pytanie {index + 1} z {pytania.length}</Text>
            <Text style={styles.pytanie}>{obecne.pytanie}</Text>
            {obecne.odpowiedzi.map((odp, i) => (
              <TouchableOpacity key={i} onPress={() => wybierzOdpowiedz(i)} style={styles.odp}>
                <Text style={styles.odpText}>{odp}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
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
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  numer: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    textAlign: 'center',
  },
  pytanie: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  odp: {
    backgroundColor: '#E76617',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  odpText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  tytul: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 16,
    textAlign: 'center',
  },
  wynik: {
    fontSize: 20,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3F51B5',
    padding: 14,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});