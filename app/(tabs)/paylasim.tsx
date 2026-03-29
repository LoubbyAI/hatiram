import { View, Text, StyleSheet } from 'react-native';

export default function Paylasim() {
  return (
    <View style={styles.kapsayici}>
      <Text style={styles.baslik}>Paylaş</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: {
    flex: 1,
    backgroundColor: '#F9F7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baslik: {
    fontSize: 24,
    color: '#1A2E44',
  },
});