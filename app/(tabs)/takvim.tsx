import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useAlbum, Foto } from '../../context/AlbumContext';

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  altin: '#D4AF37', antik: '#F9F7F2', antik2: '#F0ECE4',
  komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF',
};

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function fotoAyGrup(fotolar: Foto[]) {
  const gruplar: Record<string, Foto[]> = {};
  for (const foto of fotolar) {
    const tarih = new Date(foto.eklenmeTarihi);
    const anahtar = `${tarih.getFullYear()}-${tarih.getMonth()}`;
    if (!gruplar[anahtar]) gruplar[anahtar] = [];
    gruplar[anahtar].push(foto);
  }
  return Object.entries(gruplar)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([anahtar, fotolar]) => {
      const [yil, ayIdx] = anahtar.split('-').map(Number);
      return { baslik: `${AYLAR[ayIdx]} ${yil}`, sayi: fotolar.length, fotolar };
    });
}

export default function Takvim() {
  const { fotolar } = useAlbum();
  const gruplar = fotoAyGrup(fotolar);
  const [buyukFotoUri, setBuyukFotoUri] = useState<string | null>(null);

  return (
    <View style={styles.kapsayici}>
      <SafeAreaView style={styles.headerWrap}>
        <View style={styles.header}>
          <View>
            <Text style={styles.selamlama}>Zaman tüneli</Text>
            <Text style={styles.baslik}>Takvim</Text>
          </View>
        </View>
        <View style={styles.gizlilikCubugu}>
          <View style={styles.gizlilikDot} />
          <Text style={styles.gizlilikYazi}>Anıların yalnızca bu telefonda · Bulut yok</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.icerik} showsVerticalScrollIndicator={false}>
        <View style={{ height: 16 }} />

        {gruplar.length === 0 ? (
          <View style={styles.bosWrap}>
            <View style={styles.bosCerceve}>
              <Ionicons name="calendar-outline" size={36} color={RENKLER.gulAcik} />
            </View>
            <Text style={styles.bosBaslik}>Zaman tünelin boş</Text>
            <Text style={styles.bosAlt}>İlk fotoğrafını yüklediğinde takvimin dolmaya başlar.</Text>
          </View>
        ) : (
          gruplar.map((grup) => (
            <View key={grup.baslik} style={styles.ayKart}>
              <View style={styles.ayKartHeader}>
                <Text style={styles.ayKartBaslik}>{grup.baslik}</Text>
                <Text style={styles.ayKartSayi}>{grup.sayi} fotoğraf</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ayKartFotolar}
              >
                {grup.fotolar.map((foto) => (
                  <TouchableOpacity
                    key={foto.id}
                    style={styles.ayFoto}
                    onPress={() => setBuyukFotoUri(foto.uri)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: foto.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Lightbox */}
      <Modal visible={!!buyukFotoUri} transparent animationType="fade" onRequestClose={() => setBuyukFotoUri(null)}>
        <View style={styles.lightboxArkaplan}>
          <TouchableOpacity style={styles.lightboxKapat} onPress={() => setBuyukFotoUri(null)}>
            <Ionicons name="close" size={24} color={RENKLER.beyaz} />
          </TouchableOpacity>
          {buyukFotoUri && (
            <TouchableOpacity activeOpacity={1} onPress={() => setBuyukFotoUri(null)} style={StyleSheet.absoluteFill}>
              <Image source={{ uri: buyukFotoUri }} style={StyleSheet.absoluteFill} contentFit="contain" />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.antik },
  headerWrap: { backgroundColor: RENKLER.gece },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  selamlama: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  baslik: { fontSize: 22, fontWeight: '700', color: RENKLER.beyaz, marginTop: 2 },
  gizlilikCubugu: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  gizlilikDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RENKLER.altin },
  gizlilikYazi: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  icerik: { flex: 1 },
  bosWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 14 },
  bosCerceve: { width: 100, height: 100, borderRadius: 20, backgroundColor: RENKLER.beyaz, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(166,123,113,0.2)' },
  bosBaslik: { fontSize: 17, fontWeight: '700', color: RENKLER.gece },
  bosAlt: { fontSize: 13, color: RENKLER.komurAcik, textAlign: 'center', lineHeight: 20 },
  ayKart: { backgroundColor: RENKLER.beyaz, borderRadius: 20, overflow: 'hidden', marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(166,123,113,0.15)', shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  ayKartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(166,123,113,0.1)' },
  ayKartBaslik: { fontSize: 17, fontWeight: '600', color: RENKLER.gece },
  ayKartSayi: { fontSize: 12, color: RENKLER.komurAcik },
  ayKartFotolar: { flexDirection: 'row', gap: 3, padding: 3 },
  ayFoto: { width: 100, height: 100, borderRadius: 8, overflow: 'hidden' },
  lightboxArkaplan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  lightboxKapat: { position: 'absolute', top: 52, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
