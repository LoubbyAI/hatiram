import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useLanguage } from '../../i18n';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A2E44',
        tabBarInactiveTintColor: '#6B6B6B',
        tabBarStyle: {
          backgroundColor: '#F9F7F2',
          borderTopColor: 'rgba(166,123,113,0.15)',
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabAlbums, tabBarIcon: ({ color, size }) => <Ionicons name="images-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="takvim" options={{ title: t.tabCalendar, tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
      <Tabs.Screen
        name="ekle"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.ekleBtn}>
              <Ionicons name="add" size={28} color="#D4AF37" />
            </View>
          ),
          tabBarButton: (props) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <TouchableOpacity {...(props as any)} style={styles.ekleBtnWrap} />
          ),
        }}
      />
      <Tabs.Screen name="paylasim" options={{ title: t.tabShare, tabBarIcon: ({ color, size }) => <Ionicons name="paper-plane-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="ayarlar" options={{ title: t.tabSettings, tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  ekleBtnWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ekleBtn: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: '#1A2E44',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1A2E44',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 10,
    elevation: 8,
  },
});
