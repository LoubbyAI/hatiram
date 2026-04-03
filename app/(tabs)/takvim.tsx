import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbum, Foto } from '../../context/AlbumContext';
import { useLanguage } from '../../i18n';

const { width: EKRAN_GENISLIK } = Dimensions.get('window');

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  altin: '#D4AF37', antik: '#F9F7F2', antik2: '#F0ECE4',
  komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF',
};

function fotoAyGrup(fotolar: Foto[], months: string[]) {
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
      return { baslik: `${months[ayIdx]} ${yil}`, sayi: fotolar.length, fotolar };
    });
}

export default function Takvim() {
  const insets = useSafeAreaInsets();
  const { fotolar } = useAlbum();
  const { t } = useLanguage();
  const gruplar = fotoAyGrup(fotolar, t.months);
  const [lightbox, setLightbox] = useState<{ fotolar: Foto[]; index: number } | null>(null);

  return (
    <View style={styles.kapsayici}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.selamlama}>{t.calendarSubtitle}</Text>
            <Text style={styles.baslik}>{t.calendarTitle}</Text>
          </View>
        </View>
        <View style={styles.gizlilikCubugu}>
          <View style={styles.gizlilikDot} />
          <Text style={styles.gizlilikYazi}>{t.privacy}</Text>
        </View>
      </View>

      <ScrollView style={styles.icerik} showsVerticalScrollIndicator={false}>
        <View style={{ height: 16 }} />

        {gruplar.length === 0 ? (
          <View style={styles.bosWrap}>
            <View style={styles.bosCerceve}>
              <Ionicons name="calendar-outline" size={36} color={RENKLER.gulAcik} />
            </View>
            <Text style={styles.bosBaslik}>{t.timelineEmpty}</Text>
            <Text style={styles.bosAlt}>{t.timelineEmptyDesc}</Text>
          </View>
        ) : (
          gruplar.map((grup) => (
            <View key={grup.baslik} style={styles.ayKart}>
              <View style={styles.ayKartHeader}>
                <Text style={styles.ayKartBaslik}>{grup.baslik}</Text>
                <Text style={styles.ayKartSayi}>{t.photoCount(grup.sayi)}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ayKartFotolar}
              >
                {grup.fotolar.map((foto, fotoIdx) => (
                  <TouchableOpacity
                    key={foto.id}
                    style={styles.ayFoto}
                    onPress={() => setLightbox({ fotolar: grup.fotolar, index: fotoIdx })}
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

      <Modal visible={!!lightbox} transparent animationType="fade" onRequestClose={() => setLightbox(null)}>
        <View style={styles.lightboxArkaplan}>
          <TouchableOpacity style={styles.lightboxKapat} onPress={() => setLightbox(null)}>
            <Ionicons name="close" size={24} color={RENKLER.beyaz} />
          </TouchableOpacity>
          {lightbox && (
            <FlatList
              data={lightbox.fotolar}
              keyExtractor={(f) => f.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={lightbox.index}
              getItemLayout={(_, i) => ({ length: EKRAN_GENISLIK, offset: EKRAN_GENISLIK * i, index: i })}
              renderItem={({ item }) => (
                <View style={{ width: EKRAN_GENISLIK, flex: 1, justifyContent: 'center' }}>
                  <Image source={{ uri: item.uri }} style={{ width: EKRAN_GENISLIK, flex: 1 }} contentFit="contain" />
                </View>
              )}
            />
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
