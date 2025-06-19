import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '@/supabaseClient';

const opisyZadan = {
  '1': 'Zrób zdjęcie Luny na spacerze w spokojnym, wyjątkowym miejscu (park, las, nad wodą).',
  '2': 'Zrób zdjęcie ulubionemu pracownikowi w Dr IT :D',
  '3': 'Stwórz kreatywny portret Luny, może być zabawny lub emocjonalny.',
  '4': 'wrzuć swoje ulubione zdjęcie z wakacji',
  '5': 'Znajdź chwilę dla siebie i pokaż jak się relaksujesz.',
  '6': 'Uchwyć moment z Alicją',
  '7': 'Zrób zdjęcie swojemu ulubionemu meblowi w domu :) .',
  '8': 'Zrób coś dla siebie i przebiegnij jeszcze przed urlopem swoje 3 km!',
  '9': 'Wypij pysznego drineczka (dla zdrowotności) i pokaż jakiego!',
  '10': 'Ach, niech będzie - zrób fotkę lubianego miejsca w Krakowie :)',
};

export default function ZadanieSpecjalne() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [localUri, setLocalUri] = useState(null);
  const [firebaseUri, setFirebaseUri] = useState(null);
  const [status, setStatus] = useState(null); // null | 'pending' | 'accepted'
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setLocalUri(null);
    setFirebaseUri(null);
    setStatus(null);
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const pobierz = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('zadania')
        .select('specjalne')
        .eq('user_id', userId)
        .maybeSingle();

      if (data?.specjalne && data.specjalne[id]) {
        setFirebaseUri(data.specjalne[id].zdjecie_url);
        setStatus(data.specjalne[id].accepted ? 'accepted' : 'pending');
      }
    };
    pobierz();
  }, [userId, id]);

  const wybierzZdjecie = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLocalUri(uri);

      const { data: rekord, error } = await supabase
        .from('zadania')
        .select('specjalne')
        .eq('user_id', userId)
        .maybeSingle();

      let aktualne = rekord?.specjalne || {};

      aktualne[id] = {
        zdjecie_url: uri,
        accepted: false,
      };

      const { error: updateError } = await supabase
        .from('zadania')
        .update({ specjalne: aktualne })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Błąd podczas zapisu specjalnego zadania:', updateError.message);
      } else {
        setStatus('pending');
      }
    }
  };

  const pokazaneZdjecie = localUri || firebaseUri;

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.tytul}>📸 Zadanie specjalne {id}</Text>

        <Text style={styles.opisZadania}>{opisyZadan[id] || 'Opis zadania niedostępny.'}</Text>

        {pokazaneZdjecie ? (
          <>
            <Image
              source={{ uri: pokazaneZdjecie }}
              style={[
                styles.zdjecie,
                status === 'accepted' ? styles.zielonaRamka : styles.zoltaRamka,
              ]}
            />
            {status && (
              <Text
                style={[
                  styles.statusText,
                  status === 'accepted' ? styles.statusAccepted : styles.statusPending,
                ]}
              >
                {status === 'accepted'
                  ? '✅ Zdjęcie zaakceptowane'
                  : '🕒 Oczekuje na akceptację'}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.info}>Nie przesłano jeszcze zdjęcia</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={wybierzZdjecie}>
          <Text style={styles.buttonText}>
            {pokazaneZdjecie ? 'Zmień zdjęcie' : 'Prześlij zdjęcie'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.powrot}
          onPress={() => router.replace('/zadania/specjalne')}
        >
          <Text style={styles.powrotText}>← Powrót do listy zadań</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  wrapper: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tytul: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 10,
    textAlign: 'center',
  },
  opisZadania: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  zdjecie: {
    width: 300,
    height: 300,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 4,
  },
  zielonaRamka: {
    borderColor: '#4CAF50',
  },
  zoltaRamka: {
    borderColor: '#FFC107',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusAccepted: {
    color: '#4CAF50',
  },
  statusPending: {
    color: '#FFC107',
  },
  button: {
    backgroundColor: '#E76617',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  powrot: {
    marginTop: 10,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});