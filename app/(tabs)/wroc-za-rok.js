import { useEffect } from 'react';
import { BackHandler, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from 'expo-router';

export default function EndScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    // Ukryj header i tabsy
    navigation.setOptions({ headerShown: false, tabBarStyle: { display: 'none' } });

    // Zablokuj cofanie
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/end2.png')}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
});
