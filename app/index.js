import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from 'react-native';
import { supabase } from '../supabaseClient';

export default function EkranLogowania() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');

  const zaloguj = async () => {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password: haslo,
    });

    if (error || !user) {
      Alert.alert('Błąd logowania 🐾', 'Niepoprawny email lub hasło.');
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('zadania')
      .select('zakonczono')
      .eq('user_id', user.id)
      .single();

    if (!fetchError && data?.zakonczono === true) {
      router.replace('/wroc-za-rok');
    } else {
      router.replace('/(tabs)/strona-glowna');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground source={require('@/assets/startback.png')} style={styles.tlo}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.wrapper}
        >
          <View style={styles.centerBox}>
            <Text style={styles.tytul}>Cześć! 🎉</Text>
            <Text style={styles.podtytul}>Zaloguj się, aby rozpocząć urodzinową przygodę!</Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              textContentType="emailAddress"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />

            <TextInput
              placeholder="Hasło"
              secureTextEntry
              value={haslo}
              onChangeText={setHaslo}
              style={styles.input}
              textContentType="password"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />

            <TouchableOpacity style={styles.przycisk} onPress={zaloguj}>
              <Text style={styles.tekstPrzycisku}>Zaloguj się</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  tlo: {
    flex: 1,
    resizeMode: 'cover',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: '90%',
  },
  centerBox: {
    alignItems: 'center',
  },
  tytul: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  podtytul: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    color: '#000',
  },
  przycisk: {
    backgroundColor: '#E76617',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  tekstPrzycisku: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
