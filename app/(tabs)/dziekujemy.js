import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { useEffect, useState } from 'react';

export default function Dziekujemy() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id); // Ustawiamy UUID, bo to używasz w całej aplikacji
    };
    getUser();
  }, []);

const zakoncz = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('zadania')
    .update({ zakonczono: true })
    .eq('user_id', user.id); // <-- UUID pasuje do kolumny user_id

  if (error) {
    console.error('❌ Błąd zapisu:', error.message);
  } else {
    console.log('✅ Zapisano zakonczono: true');
    router.replace('/wroc-za-rok');
  }
};


  const wrocDoPrezentu = () => {
    router.push('/gift');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dziękuję za udział w zabawie!</Text>

      <Text style={styles.description}>
        Aplikacja została przygotowana z myślą o Twoich 45. urodzinach i mam nadzieję, że się spodobała.
        {'\n\n'}
        Wszystkie prawa zastrzeżone — wszystko jest pomysłem własnym: od tekstów, przez grafikę, aż po kod.
        Jest jednak też mocną praktyką w zakresie projektowania aplikacji mobilnych – co, mam nadzieję, zaprocentuje w przyszłości.
        {'\n\n'}
        Jeżeli widzisz elementy, które mogłabym poprawić, będę wdzięczna za feedback – ale niezbyt krytyczny, bo jestem wrażliwa 😉
      </Text>

      <TouchableOpacity style={styles.button} onPress={zakoncz}>
        <Text style={styles.buttonText}>Zakończ aplikację</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={wrocDoPrezentu}>
        <Text style={styles.buttonText}>Wróć do kodu do sejfu</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E76617',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginBottom: 16,
  },
  secondary: {
    backgroundColor: '#E76617',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
