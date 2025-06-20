import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const images = [
  require('@/assets/memory/1.png'),
  require('@/assets/memory/2.png'),
  require('@/assets/memory/3.png'),
  require('@/assets/memory/4.png'),
  require('@/assets/memory/5.png'),
  require('@/assets/memory/6.png'),
  require('@/assets/memory/7.png'),
];

export default function UnikGame() {
  const router = useRouter();
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showSequence, setShowSequence] = useState(false);
  const [status, setStatus] = useState('loading');
  const [userId, setUserId] = useState(null);
  const [roundsPassed, setRoundsPassed] = useState(0);
  const [initialRound, setInitialRound] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('zadania')
          .select('zrecznosciowe')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.zrecznosciowe?.includes('unik')) {
          setStatus('done');
        } else {
          setStatus('ready');
        }
      }
    };
    fetchUser();
  }, []);

  const startRound = () => {
    const newSeq = Array.from({ length: 3 }, () => Math.floor(Math.random() * 7));
    setSequence(newSeq);
    setUserSequence([]);
    setShowSequence(true);
    setTimeout(() => setShowSequence(false), 2500);
    setStatus('showing');
  };

  const handleChoice = (index) => {
    const newSequence = [...userSequence, index];
    setUserSequence(newSequence);
    if (newSequence.length === sequence.length) {
      const isCorrect = sequence.every((val, idx) => val === newSequence[idx]);
      if (isCorrect) {
        const nextRound = roundsPassed + 1;
        setRoundsPassed(nextRound);
        if (nextRound >= 5) {
          saveCompletion();
          setStatus('done');
        } else {
          setStatus('success');
          setInitialRound(false);
        }
      } else {
        setStatus('fail');
        setInitialRound(false);
      }
    }
  };

  const saveCompletion = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('zadania')
      .select('zrecznosciowe')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error && data) {
      const current = data.zrecznosciowe || [];
      if (!current.includes('unik')) {
        const updated = [...current, 'unik'];
        await supabase.from('zadania').update({ zrecznosciowe: updated }).eq('user_id', userId);
      }
    }
  };

  return (
    <ImageBackground source={require('@/assets/backstandard.png')} style={styles.tlo}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.counter}>Zaliczono: {roundsPassed}/5</Text>

        {status === 'loading' && <Text style={styles.info}>Ładowanie...</Text>}

        {(status === 'ready' || status === 'success' || status === 'fail') && (
          <View style={styles.wrapper}>
            {initialRound && status === 'ready' && (
              <Text style={styles.info}>Zapamiętaj sekwencję, a potem ją odtwórz</Text>
            )}
            {status === 'success' && (
              <Text style={styles.info}>Dobrze! Lecimy dalej</Text>
            )}
            {status === 'fail' && (
              <Text style={styles.info}>Błędna sekwencja. Spróbuj jeszcze raz!</Text>
            )}
            <TouchableOpacity style={styles.startButton} onPress={startRound}>
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          </View>
        )}

        {showSequence && (
          <View style={styles.sequenceWrapper}>
            {sequence.map((i, idx) => (
              <Image key={idx} source={images[i]} style={styles.img} />
            ))}
          </View>
        )}

        {!showSequence && status === 'showing' && userSequence.length < sequence.length && sequence.length > 0 && (
          <View style={styles.choiceWrapper}>
            {images.map((img, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleChoice(idx)}>
                <Image source={img} style={styles.img} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Nakładka końcowa */}
        {status === 'done' && (
          <View style={styles.nakladka}>
            <Text style={styles.tekstNakladka}>Gra została już ukończona</Text>
            <TouchableOpacity style={styles.przyciskNakladka} onPress={() => router.replace('/zadania/zrecznosciowe')}>
              <Text style={styles.przyciskNakladkaText}>Wróć do pozostałych gier</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  tlo: { flex: 1 },
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  counter: { textAlign: 'center', fontSize: 18, color: '#444', marginVertical: 8 },
  wrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  info: { fontSize: 20, color: '#222', textAlign: 'center', marginBottom: 20 },
  startButton: { backgroundColor: '#E76617', padding: 16, borderRadius: 12 },
  startText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  sequenceWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  choiceWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  img: { width: 70, height: 70, margin: 10, borderRadius: 12 },
  nakladka: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tekstNakladka: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F51B5',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  przyciskNakladka: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3F51B5',
    borderRadius: 8,
  },
  przyciskNakladkaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
