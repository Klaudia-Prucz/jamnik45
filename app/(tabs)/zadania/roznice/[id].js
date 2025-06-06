import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';

export default function RebusZadanie({ emojiRebus, odpowiedzPoprawna, onSuccess }) {
  const [odpowiedz, setOdpowiedz] = useState('');
  const [status, setStatus] = useState(null); // 'correct' | 'wrong' | null

  const sprawdzOdpowiedz = () => {
    Keyboard.dismiss();
    const czysta = odpowiedz.trim().toLowerCase();
    const poprawna = odpowiedzPoprawna.toLowerCase();

    if (czysta === poprawna) {
      setStatus('correct');
      onSuccess?.();
    } else {
      setStatus('wrong');
    }
  };

  const handleChange = (text) => {
    setOdpowiedz(text);
    if (status !== null) setStatus(null);
  };

  const gotowa = odpowiedz.trim().length > 0;

  return (
    <ImageBackground
      source={require('@/assets/backstandard.png')}
      style={styles.tlo}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <Text style={styles.rebus}>{emojiRebus}</Text>

              <TextInput
                style={styles.input}
                placeholder="Twoja odpowiedź..."
                value={odpowiedz}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.button, !gotowa && styles.buttonDisabled]}
                onPress={sprawdzOdpowiedz}
                disabled={!gotowa}
              >
                <Text style={styles.buttonText}>Sprawdź</Text>
              </TouchableOpacity>

              {status === 'correct' && (
                <Text style={styles.success}>✅ Brawo! Poprawna odpowiedź!</Text>
              )}
              {status === 'wrong' && (
                <Text style={styles.error}>❌ Spróbuj jeszcze raz!</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rebus: {
    fontSize: 48,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
    padding: 12,
    fontSize: 18,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#E76617',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  success: {
    color: 'green',
    fontSize: 18,
    marginTop: 12,
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginTop: 12,
  },
});
