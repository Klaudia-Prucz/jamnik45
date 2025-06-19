import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'expo-router';

export default function EkranPrezentu() {
  const [gotowe, setGotowe] = useState(false);
  const [zaladowano, setZaladowano] = useState(false);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const kodSejfu = '7452';

  useEffect(() => {
    const sprawdzCzyWszystkoUkonczone = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from('zadania')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('Błąd pobierania:', error.message);
        return;
      }

      const quizy = data.quizy?.length || 0;
      const rebusy = data.rebusy?.length || 0;
      const specjalne = data.specjalne?.length || 0;
      const zrecznosciowe = data.zrecznosciowe?.length || 0;

      const suma = quizy + rebusy + specjalne + zrecznosciowe;
      setGotowe(suma >= 20);
      setZaladowano(true);
    };

    sprawdzCzyWszystkoUkonczone();
  }, []);

  const przejdzDalej = () => {
    router.push('../dziekujemy');
  };

  return (
    <SafeAreaView style={styles.container}>
      {!zaladowano ? (
        <Text style={styles.tekst}>⏳ Sprawdzanie postępu...</Text>
      ) : gotowe ? (
        <>
          <Text style={styles.gratulacje}>🎉 GRATULACJE!</Text>
          <Text style={styles.tekst}>W końcu możesz zobaczyć właściwy prezent.</Text>

          <View style={styles.kodContainer}>
            <Text style={styles.kod}>{kodSejfu}</Text>
            <Text style={styles.podpowiedz}>Użyj tego kodu, by otworzyć sejf</Text>
          </View>

          <TouchableOpacity style={styles.przycisk} onPress={przejdzDalej}>
            <Text style={styles.przyciskText}>➡ Co dalej?</Text>
          </TouchableOpacity>

          <Text style={styles.koncoweZyczenia}>Jeszcze raz wszystkiego najlepszego! Mam nadzieję, że choć raz się uśmiechnąłeś dzięki tej aplikacji!</Text>

          <Image source={require('../../assets/end1.png')} style={styles.obrazek} />
        </>
      ) : (
        <Text style={styles.tekst}>
          🔒 Ukończ wszystkie zadania (44), by odkryć kod do sejfu!
        </Text>
      )}
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
  przycisk: {
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 24,
  },
  przyciskText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  koncoweZyczenia: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000',
    marginTop: 40,
  },
  obrazek: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    marginTop: 20,
  },
});
