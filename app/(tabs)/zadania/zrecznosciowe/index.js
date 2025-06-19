import { supabase } from '@/supabaseClient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ListaMiniGier() {
  const router = useRouter();
  const [ukonczone, setUkonczone] = useState([]);

  const paths = [
    'zlap', 'memory', 'kliknij', 'reakcja', 'traf',
    'unik', 'rzut', 'shake', 'sound', 'znajdz',
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.warn('❌ Błąd pobierania użytkownika:', userError?.message);
          return;
        }

        const { data, error } = await supabase
          .from('zadania')
          .select('zrecznosciowe')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('❌ Błąd pobierania danych zrecznosciowe:', error.message);
          return;
        }

        if (data?.zrecznosciowe && Array.isArray(data.zrecznosciowe)) {
          setUkonczone(data.zrecznosciowe);
        } else {
          setUkonczone([]);
        }
      };

      fetchData();
    }, [])
  );

  return (
    <ImageBackground
      source={require('@/assets/backstandard.png')}
      style={styles.tlo}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.innerWrapper}>
            <Text style={styles.tytul}>Wybierz gierkę</Text>

            <View style={styles.lista}>
              {paths.map((path, index) => {
                const isDone = ukonczone.includes(path);
                return (
                  <TouchableOpacity
                    key={path}
                    style={[styles.kafelek, isDone && styles.kafelekDone]}
                    onPress={() => router.push(`/zadania/zrecznosciowe/${path}`)}
                  >
                    <Text style={styles.kafelekText}>
                      {isDone ? `Gra ${index + 1}` : ` Gra ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.powrot} onPress={() => router.replace('/zadania')}>
              <Text style={styles.powrotText}>← Powrót do kategorii zadań</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { flexGrow: 1 },
  innerWrapper: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  tytul: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    marginBottom: 20,
  },
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  kafelek: {
    backgroundColor: '#E76617',
    width: 160,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  kafelekDone: {
    backgroundColor: '#4CAF50',
  },
  kafelekText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  powrot: {
    alignItems: 'center',
    marginTop: 30,
  },
  powrotText: {
    color: '#3F51B5',
    fontSize: 16,
    fontWeight: '600',
  },
});
