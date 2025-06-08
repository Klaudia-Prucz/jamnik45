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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: haslo,
    });

    if (error) {
      Alert.alert('Błąd logowania 🐾', 'Niepoprawny email lub hasło.');
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
          <View style={styles.overlay}>
            <Text style={styles.tytul}>Cześć! 🎉</Text>
            <Text style={styles.podtytul}>Zaloguj się, aby rozpocząć urodzinową przygodę!</Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              textContentType="emailAddress"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Hasło"
              secureTextEntry
              value={haslo}
              onChangeText={setHaslo}
              style={styles.input}
              textContentType="password"
              autoCapitalize="none"
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
  },
  overlay: {
    marginTop: '85%',
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
  },
  tytul: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  podtytul: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
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
