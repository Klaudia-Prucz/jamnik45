import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ImageBackground,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { supabase } from '@/supabaseClient';

const { height } = Dimensions.get('window');

const obrazki = {
  '1': require('@/assets/rebusy/rebus1.png'),
  '2': require('@/assets/rebusy/rebus2.png'),
  '3': require('@/assets/rebusy/rebus3.png'),
  '4': require('@/assets/rebusy/rebus4.png'),
  '5': require('@/assets/rebusy/rebus5.png'),
  '6': require('@/assets/rebusy/rebus6.png'),
  '7': require('@/assets/rebusy/rebus7.png'),
  '8': require('@/assets/rebusy/rebus8.png'),
  '9': require('@/assets/rebusy/rebus9.png'),
  '10': require('@/assets/rebusy/rebus10.png'),
};

const hasla = {
  '1': 'alicja',
  '2': 'foch',
  '3': 'pierdoling',
  '4': 'warszawa',
  '5': 'dyrektor',
  '6': 'jamnik',
  '7': 'trójkąt',
  '8': 'tajlandia',
  '9': 'zosia',
  '10': 'maruda',
};

export default function RebusZadanie() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [odpowiedz, setOdpowiedz] = useState('');
  const [status, setStatus] = useState(null);
  const [userId, setUserId] = useState(null);
  const [zapisano, setZapisano] = useState(false);

  const poprawna = hasla[id]?.toLowerCase();

  useEffect(() => {
    setOdpowiedz('');
    setStatus(null);
    setZapisano(false);
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  const sprawdzOdpowiedz = async () => {
    Keyboard.dismiss();
    const czysta = odpowiedz.trim().toLowerCase();

    if (czysta === poprawna) {
      setStatus('correct');

      if (!zapisano && userId) {
        const zadanieId = `rebus${id}`;

        let { data: rekord, error } = await supabase
          .from('zadania')
          .select('rebusy')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('❌ Błąd pobierania:', error.message);
          return;
        }

        const aktualne = rekord?.rebusy || [];

        if (!aktualne.includes(zadanieId)) {
          const nowe = [...aktualne, zadanieId];

          const { error: updateError } = await supabase
            .from('zadania')
            .update({ rebusy: nowe })
            .eq('user_id', userId);

          if (updateError) {
            console.error('❌ Błąd zapisu:', updateError.message);
          } else {
            setZapisano(true);
          }
        } else {
          setZapisano(true);
        }
      }
    } else {
      setStatus('wrong');
    }
  };

  const gotowa = odpowiedz.trim().length > 0;
  const zakonczony = zapisano;

  if (!obrazki[id] || !poprawna) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <Text>Nie znaleziono rebusa.</Text>
      </SafeAreaView>
    );
  }

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
              <Image source={obrazki[id]} style={styles.rebusImage} />

              <TextInput
                style={styles.input}
                placeholder="Twoja odpowiedź..."
                value={odpowiedz}
                onChangeText={(text) => {
                  setOdpowiedz(text);
                  if (status !== null) setStatus(null);
                }}
                editable={!zakonczony}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.button, (!gotowa || zakonczony) && styles.buttonDisabled]}
                onPress={sprawdzOdpowiedz}
                disabled={!gotowa || zakonczony}
              >
                <Text style={styles.buttonText}>Sprawdź</Text>
              </TouchableOpacity>

              {status === 'correct' && (
                <Text style={styles.success}>✅ Brawo! Poprawna odpowiedź!</Text>
              )}
              {status === 'wrong' && (
                <Text style={styles.error}>❌ Spróbuj jeszcze raz!</Text>
              )}

              <TouchableOpacity
                style={styles.powrot}
                onPress={() => router.push('/zadania/rebusy')}
              >
                <Text style={styles.powrotText}>← Wybierz inny rebus</Text>
              </TouchableOpacity>

              {zakonczony && (
                <View style={styles.nakladka}>
                  <Text style={styles.nakladkaText}>Rebus zaliczony!</Text>
                  <TouchableOpacity style={styles.nakladkaBtn} onPress={() => router.push('/zadania/rebusy')}>
                    <Text style={styles.nakladkaBtnText}>Wróć do reszty rebusów</Text>
                  </TouchableOpacity>
                </View>
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
  rebusImage: {
    width: '100%',
    height: height * 0.5,
    resizeMode: 'contain',
    marginBottom: 32,
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
    backgroundColor: '#D45500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
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
  powrot: {
    marginTop: 24,
  },
  powrotText: {
    fontSize: 16,
    color: '#3F51B5',
    fontWeight: '600',
  },
  nakladka: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  nakladkaText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nakladkaBtn: {
    marginTop: 24,
    backgroundColor: '#3F51B5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nakladkaBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
