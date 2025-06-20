import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets(); // ⬅️ Pobieramy marginesy systemowe

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#E76617',
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          height: 65 + insets.bottom,        // ⬆️ Wyższy pasek z zapasem
          paddingBottom: insets.bottom,      // ⬆️ Treść tabbara wyżej
          elevation: 0,
        },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            'strona-glowna': <Feather name="home" size={24} color={color} />,
            zadania: <Feather name="check-circle" size={24} color={color} />,
            pomoc: <Feather name="help-circle" size={24} color={color} />,
            statystyki: <Feather name="bar-chart" size={24} color={color} />,
          };

          return (
            <View style={{ alignItems: 'center' }}>
              {icons[route.name]}
              {focused && (
                <View
                  style={{
                    marginTop: 4,
                    width: 28,
                    height: 4,
                    borderRadius: 10,
                    backgroundColor: '#E76617',
                  }}
                />
              )}
            </View>
          );
        },
      })}
    >
      {/* Ekrany widoczne w tab barze */}
      <Tabs.Screen name="strona-glowna" options={{ title: 'Strona Główna' }} />
      <Tabs.Screen name="zadania" options={{ title: 'Zadania' }} />
      <Tabs.Screen name="pomoc" options={{ title: 'Pomoc' }} />
      <Tabs.Screen name="statystyki" options={{ title: 'Statystyki' }} />

      {/* Ukryte ekrany */}
      <Tabs.Screen name="gift" options={{ href: null }} />
      <Tabs.Screen name="dziekujemy" options={{ href: null }} />
      <Tabs.Screen name="end" options={{ href: null }} />

      <Tabs.Screen name="zadania/zrecznosciowe/index" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/kliknij" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/memory" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/reakcja" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/rzut" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/shake" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/sound" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/traf" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/unik" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/zlap" options={{ href: null }} />
      <Tabs.Screen name="zadania/zrecznosciowe/znajdz" options={{ href: null }} />

      <Tabs.Screen name="zadania/quizy" options={{ href: null }} />
      <Tabs.Screen name="zadania/quizy/index" options={{ href: null }} />
      <Tabs.Screen name="zadania/quizy/[id]" options={{ href: null }} />

      <Tabs.Screen name="zadania/specjalne" options={{ href: null }} />
      <Tabs.Screen name="zadania/specjalne/index" options={{ href: null }} />
      <Tabs.Screen name="zadania/specjalne/[id]" options={{ href: null }} />

      <Tabs.Screen name="zadania/rebusy/index" options={{ href: null }} />
      <Tabs.Screen name="zadania/rebusy/[id]" options={{ href: null }} />
      <Tabs.Screen name="wroc-za-rok" options={{ href: null }} />
    </Tabs>
  );
}
