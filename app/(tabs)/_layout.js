import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
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
          height: 65,
          elevation: 0,
        },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            'strona-glowna': <Feather name="home" size={24} color={color} />,
            zadania: <Feather name="check-circle" size={24} color={color} />,
            pomoc: <Feather name="file-check" size={24} color={color} />,
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
      <Tabs.Screen name="strona-glowna" options={{ title: 'Strona Główna' }} />
      <Tabs.Screen name="zadania" options={{ title: 'Zadania' }} />
      <Tabs.Screen name="pomoc" options={{ title: 'Pomoc' }} />
      <Tabs.Screen name="statystyki" options={{ title: 'Statystyki' }} />
    </Tabs>
  );
}
