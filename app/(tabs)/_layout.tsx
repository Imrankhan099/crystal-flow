import { Tabs } from 'expo-router';
import { Home, Grid3x3, User, Trophy, ShoppingBag } from 'lucide-react-native';
import { Colors, Typography } from '@/lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.82)',
          borderTopColor: 'rgba(255,255,255,0.9)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.blue[500],
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: Typography.tab,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ size, color }) => <Home size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="levels" options={{ title: 'Levels', tabBarIcon: ({ size, color }) => <Grid3x3 size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ size, color }) => <User size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Ranks', tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: ({ size, color }) => <ShoppingBag size={size} color={color} strokeWidth={2} /> }} />
    </Tabs>
  );
}
