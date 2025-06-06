import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RebusZadanie({ emojiRebus, odpowiedzPoprawna, onSuccess }) {
  const [odpowiedz, setOdpowiedz] = useState('');
  const [status, setStatus] = useState(null); // null | 'correct' | 'wrong'

  const sprawdzOdpowiedz = () => {
    if (odpowiedz.trim().toLowerCase() === odpowiedzPoprawna.toLowerCase()) {
      setStatus('correct');
      if (onSuccess) onSuccess();
    } else {
      setStatus('wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.rebus}>{emojiRebus}</Text>

      <TextInput
        style={styles.input}
        placeholder="Twoja odpowiedź..."
        value={odpowiedz}
        onChangeText={setOdpowiedz}
      />

      <TouchableOpacity style={styles.button} onPress={sprawdzOdpowiedz}>
        <Text style={styles.buttonText}>Sprawdź</Text>
      </TouchableOpacity>

      {status === 'correct' && <Text style={styles.success}>✅ Brawo! Poprawna odpowiedź!</Text>}
      {status === 'wrong' && <Text style={styles.error}>❌ Spróbuj jeszcze raz!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
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
  },
  button: {
    backgroundColor: '#E76617',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
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
