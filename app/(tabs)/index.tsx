import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useState } from 'react';

const { width } = Dimensions.get('window');

const RENKLER = {
  gece: '#1A2E44',
  gul: '#A67B71',
  gulAcik: '#C4A09A',
  gulCokAcik: '#F5EDEB',
  altin: '#D4AF37',
  antik: '#F9F7F2',
  antik2: '#F0ECE4',
  komur: '#2D2D2D',
  komurAcik: '#6B6B6B',
  beyaz: '#FFFFFF',
};

const ALBUMLER = [
  { id: '1', ad: 'İlk 3 Ay', tarih: 'Ocak – Mart 2024', sayi: 47, renk: '#F5EDE6', renkKoyu: '#EDD8C8' },
  { id: '2', ad: '1. Doğum Günü', tarih: 'Ocak 2025', sayi: 32, renk: '#E8EEF5', renkKoyu: '#D0DCE8' },
  { id: '3', ad: 'Bolu Tatili', tarih: 'Ağustos 2024', sayi: 61, renk: '#EAF0EA', renkKoyu: '#D0E0D0' },
  { id: '4', ad: 'İlk Adımlar', tarih: 'Mart 2025', sayi: 14, renk: '#F0EBF5', renkKoyu: '#DDD0E8' },
];

function AlbumKart({ album, buyuk = false }: { album: typeof ALBUMLER[0], buyuk?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.albumKartWrap, buyuk && styles.albumKartWrapBuyuk]}
      activeOpacity={0.85}
    >
      {/* Stacked efekt */}
      <View style={[styles.stackAlt2, { backgroundColor: RENKLER.antik2 }]} />
      <View style={[styles.stackAlt1, { backgroundColor: RENKLER.antik2 }]} />

      {/* Ana kart */}
      <View style={styles.albumKart}>
        <View style={[
          styles.albumGorsel,
          buyuk && styles.albumGorselBuyuk,
          { backgroundColor: album.renk }
        ]}>
          <View style={styles.albumPlaceholder}>
            <View style={[styles.donemDaire, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
              <Text style={styles.donemHarf}>{album.ad.charAt(0)}</Text>
            </View>
            <Text style={[styles.donemEtiket, { color: RENKLER.gulAcik }]}>
              {album.ad.toUpperCase()}
            </Text>
          </View>
          <View style={styles.gorselOverlay} />
          <View style={styles.fotoRozet}>
            <Text style={styles.fotoRozetYazi}>{album.sayi} kare</Text>
          </View>
        </View>
        <View style={[styles.albumBilgi, buyuk && styles.albumBilgiBuyuk]}>
          <Text style={[styles.albumAd, buyuk && styles.albumAdBuyuk]}>{album.ad}</Text>
          <Text style={styles.albumMeta}>{album.tarih}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Albumler() {
  return (
    <View style={styles.kapsayici}>
      {/* Header */}
      <SafeAreaView style={styles.headerWrap}>
        <View style={styles.header}>
          <View>
            <Text style={styles.selamlama}>Merhaba 👋</Text>
            <Text style={styles.baslik}>Albümlerim</Text>
          </View>
          <TouchableOpacity style={styles.ikonBtn}>
            <Text style={styles.ikonBtnYazi}>🔍</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gizlilikCubugu}>
          <View style={styles.gizlilikDot} />
          <Text style={styles.gizlilikYazi}>Anıların yalnızca bu telefonda · Bulut yok</Text>
        </View>
        {/* Kategori sekmeleri */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kategoriScroll}>
          {['Tümü', 'Büyüme', 'Tatil', 'Özel Günler'].map((k, i) => (
            <TouchableOpacity key={k} style={[styles.sek, i === 0 && styles.sekAktif]}>
              <Text style={[styles.sekYazi, i === 0 && styles.sekYaziAktif]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* İçerik */}
      <ScrollView style={styles.icerik} showsVerticalScrollIndicator={false}>
        <View style={styles.bolumSatir}>
          <Text style={styles.bolumBaslik}>Albümler</Text>
          <Text style={styles.bolumLink}>Tümünü gör</Text>
        </View>

        {/* Büyük albüm */}
        <View style={styles.albumIzgara}>
          <AlbumKart album={ALBUMLER[0]} buyuk />

          {/* 2'li grid */}
          <View style={styles.albumSatir}>
            <View style={styles.albumYarim}>
              <AlbumKart album={ALBUMLER[1]} />
            </View>
            <View style={styles.albumYarim}>
              <AlbumKart album={ALBUMLER[2]} />
            </View>
          </View>
          <View style={styles.albumSatir}>
            <View style={styles.albumYarim}>
              <AlbumKart album={ALBUMLER[3]} />
            </View>
            <View style={styles.albumYarim} />
          </View>
        </View>

        {/* Yeni albüm */}
        <TouchableOpacity style={styles.yeniAlbumBtn}>
          <Text style={styles.yeniAlbumYazi}>＋  Yeni Albüm Aç</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const KART_GENISLIK = (width - 48) / 2;

const styles = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.antik },

  // Header
  headerWrap: { backgroundColor: RENKLER.gece },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  selamlama: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  baslik: {
    fontSize: 22, fontWeight: '700', color: RENKLER.beyaz, marginTop: 2,
  },
  ikonBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  ikonBtnYazi: { fontSize: 16 },

  gizlilikCubugu: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  gizlilikDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: RENKLER.altin,
  },
  gizlilikYazi: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },

  kategoriScroll: { paddingHorizontal: 16, paddingVertical: 12 },
  sek: {
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sekAktif: { backgroundColor: RENKLER.altin, borderColor: RENKLER.altin },
  sekYazi: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  sekYaziAktif: { color: RENKLER.gece, fontWeight: '600' },

  // İçerik
  icerik: { flex: 1 },
  bolumSatir: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
  },
  bolumBaslik: { fontSize: 18, fontWeight: '700', color: RENKLER.gece },
  bolumLink: { fontSize: 13, color: RENKLER.gul, fontWeight: '500' },

  albumIzgara: { paddingHorizontal: 16, gap: 12 },
  albumSatir: { flexDirection: 'row', gap: 12 },
  albumYarim: { flex: 1 },

  // Kart
  albumKartWrap: { position: 'relative', marginBottom: 8 },
  albumKartWrapBuyuk: { width: '100%' },

  stackAlt2: {
    position: 'absolute', bottom: -8, left: 12, right: 12,
    top: 8, borderRadius: 20, opacity: 0.4,
    borderWidth: 1, borderColor: 'rgba(166,123,113,0.1)',
  },
  stackAlt1: {
    position: 'absolute', bottom: -4, left: 6, right: 6,
    top: 4, borderRadius: 20, opacity: 0.7,
    borderWidth: 1, borderColor: 'rgba(166,123,113,0.18)',
  },

  albumKart: {
    backgroundColor: RENKLER.beyaz, borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(166,123,113,0.15)',
    shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  albumGorsel: {
    height: 110, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  albumGorselBuyuk: { height: 150 },
  albumPlaceholder: { alignItems: 'center', gap: 6 },
  donemDaire: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  donemHarf: { fontSize: 18, fontWeight: '700', color: RENKLER.gulAcik },
  donemEtiket: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  gorselOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
    backgroundColor: 'rgba(26,46,68,0.15)',
  },
  fotoRozet: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(26,46,68,0.7)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  fotoRozetYazi: { color: RENKLER.beyaz, fontSize: 11, fontWeight: '600' },

  albumBilgi: { padding: 12 },
  albumBilgiBuyuk: { padding: 14 },
  albumAd: { fontSize: 14, fontWeight: '600', color: RENKLER.gece, marginBottom: 3 },
  albumAdBuyuk: { fontSize: 17 },
  albumMeta: { fontSize: 12, color: RENKLER.komurAcik },

  yeniAlbumBtn: {
    margin: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2, borderStyle: 'dashed',
    borderColor: 'rgba(166,123,113,0.3)',
    alignItems: 'center',
  },
  yeniAlbumYazi: { fontSize: 14, fontWeight: '500', color: RENKLER.gul },
});
