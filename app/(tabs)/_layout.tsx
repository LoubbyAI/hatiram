import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

function EkleButonu({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.ekleBtn}>
      <Ionicons name="add" size={28} color="#D4AF37" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Albümler', tabBarIcon: ({ color, size }) => <Ionicons name="images-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="takvim" options={{ title: 'Takvim', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
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
            <TouchableOpacity {...props} style={styles.ekleBtnWrap} />
          ),
        }}
      />
      <Tabs.Screen name="paylasim" options={{ title: 'Paylaş', tabBarIcon: ({ color, size }) => <Ionicons name="paper-plane-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="ayarlar" options={{ title: 'Ayarlar', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
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