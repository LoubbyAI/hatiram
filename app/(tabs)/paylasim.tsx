import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, FlatList, Platform,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import RNShare from 'react-native-share';
import { File, Paths } from 'expo-file-system';
import { useAlbum, Foto } from '../../context/AlbumContext';
import { useLanguage } from '../../i18n';

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  altin: '#D4AF37', antik: '#F9F7F2', antik2: '#F0ECE4',
  komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF', wp: '#2A9958',
};

type IonIconName = React.ComponentProps<typeof Ionicons>['name'];
const FOTO_ADETLER = [5, 10, 20, 9999];
const MAX_PAYLASIM = 20;

const toShareUri = async (uri: string, idx: number): Promise<string> => {
  try {
    const cacheFile = new File(Paths.cache, `rnshare_${Date.now()}_${idx}.jpg`);
    if (uri.startsWith('file://')) {
      new File(uri).copy(cacheFile);
    } else {
      // content:// URI — fetch ile oku, cache'e yaz
      const res = await fetch(uri);
      const buf = await res.arrayBuffer();
      cacheFile.write(new Uint8Array(buf));
    }
    return cacheFile.uri;
  } catch { return uri; }
};

export default function Paylasim() {
  const { albumler, albumFotolari } = useAlbum();
  const { t } = useLanguage();
  const [seciliAlbumId, setSeciliAlbumId] = useState<string | null>(albumler[0]?.id ?? null);
  const [seciliFotoSayi, setSeciliFotoSayi] = useState(1);
  const [seciliFotolar, setSeciliFotolar] = useState<Set<string>>(new Set());

  const FOTO_SAYILARI = [t.last5, t.last10, t.last20, t.allPhotos];

  const aktifAlbumFotolari: Foto[] = seciliAlbumId
    ? albumFotolari(seciliAlbumId).slice(0, FOTO_ADETLER[seciliFotoSayi])
    : [];

  const albumSecildi = (id: string) => {
    setSeciliAlbumId(id);
    setSeciliFotolar(new Set());
  };

  const fotoToggle = (id: string) => {
    setSeciliFotolar(prev => {
      const yeni = new Set(prev);
      if (yeni.has(id)) {
        yeni.delete(id);
      } else {
        if (yeni.size >= MAX_PAYLASIM) {
          Alert.alert(t.maxSelectionTitle, t.maxSelectionMsg(MAX_PAYLASIM));
          return prev;
        }
        yeni.add(id);
      }
      return yeni;
    });
  };

  const tumuSec = () => {
    if (seciliFotolar.size === aktifAlbumFotolari.length) {
      setSeciliFotolar(new Set());
    } else {
      setSeciliFotolar(new Set(aktifAlbumFotolari.slice(0, MAX_PAYLASIM).map(f => f.id)));
    }
  };

  const paylas = async () => {
    const paylasılacak = aktifAlbumFotolari.filter(f => seciliFotolar.has(f.id));
    if (paylasılacak.length === 0) {
      Alert.alert(t.selectPhotosAlert, t.selectPhotosMsg);
      return;
    }

    const uriList = paylasılacak.map(f => f.uri);

    try {
      if (Platform.OS === 'android') {
        const shareUrilar = await Promise.all(uriList.map((u, i) => toShareUri(u, i)));
        if (shareUrilar.length === 1) {
          await RNShare.open({ url: shareUrilar[0], type: 'image/*', failOnCancel: false });
        } else {
          await RNShare.open({ urls: shareUrilar, type: 'image/*', failOnCancel: false });
        }
        return;
      }
    } catch {
      Alert.alert(t.sharingNotSupported);
      return;
    }

    const mevcut = await Sharing.isAvailableAsync();
    if (!mevcut) { Alert.alert(t.sharingNotSupported); return; }
    await Sharing.shareAsync(uriList[0]);
  };

  const insets = useSafeAreaInsets();
  return (
    <View style={styles.kapsayici}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.selamlama}>{t.shareSubtitle}</Text>
            <Text style={styles.baslik}>{t.shareTitle}</Text>
          </View>
        </View>
        <View style={styles.gizlilikCubugu}>
          <View style={styles.gizlilikDot} />
          <Text style={styles.gizlilikYazi}>{t.privacy}</Text>
        </View>
      </View>

      {albumler.length === 0 ? (
        <View style={styles.bosWrap}>
          <Ionicons name="images-outline" size={48} color={RENKLER.gulAcik} />
          <Text style={styles.bosYazi}>{t.noAlbumsYet}</Text>
          <Text style={styles.bosAlt}>{t.noAlbumsYetDesc}</Text>
        </View>
      ) : (
        <View style={styles.icerik}>
          <View style={styles.bolumSatir}>
            <Text style={styles.bolumBaslik}>{t.selectAlbum}</Text>
          </View>
          <FlatList
            data={albumler}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumListePadding}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item: album }) => (
              <TouchableOpacity
                style={[styles.albumKart, seciliAlbumId === album.id && styles.albumKartSecili]}
                onPress={() => albumSecildi(album.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.albumIkon, { backgroundColor: album.renk }]}>
                  <Ionicons name={album.ikon as IonIconName} size={20} color={album.ikonRenk} />
                </View>
                <Text style={[styles.albumAd, seciliAlbumId === album.id && styles.albumAdSecili]} numberOfLines={1}>
                  {album.ad}
                </Text>
                <Text style={styles.albumSayi}>{t.photosBadge(albumFotolari(album.id).length)}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={[styles.bolumSatir, { paddingTop: 20 }]}>
            <Text style={styles.bolumBaslik}>{t.howManyPhotos}</Text>
          </View>
          <View style={styles.fotoSayisiWrap}>
            <View style={styles.fotoSayisiSecici}>
              {FOTO_SAYILARI.map((sayi, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.fotoSayisiBtn, seciliFotoSayi === idx && styles.fotoSayisiBtnAktif]}
                  onPress={() => { setSeciliFotoSayi(idx); setSeciliFotolar(new Set()); }}
                >
                  <Text style={[styles.fotoSayisiBtnYazi, seciliFotoSayi === idx && styles.fotoSayisiBtnYaziAktif]}>{sayi}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {aktifAlbumFotolari.length > 0 ? (
            <>
              <View style={[styles.bolumSatir, { paddingTop: 20 }]}>
                <Text style={styles.bolumBaslik}>{t.preview}</Text>
                <TouchableOpacity onPress={tumuSec}>
                  <Text style={styles.bolumLink}>
                    {seciliFotolar.size === aktifAlbumFotolari.length ? t.deselectAll : t.selectAll}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
                {aktifAlbumFotolari.map((foto) => (
                  <TouchableOpacity
                    key={foto.id}
                    style={[styles.onizlemeFoto, seciliFotolar.has(foto.id) && styles.onizlemeFotoSecili]}
                    onPress={() => fotoToggle(foto.id)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: foto.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    {seciliFotolar.has(foto.id) && (
                      <View style={styles.secimIsareti}>
                        <Ionicons name="checkmark" size={14} color={RENKLER.beyaz} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <View style={styles.bosOnizleme}>
              <Ionicons name="images-outline" size={32} color={RENKLER.gulAcik} />
              <Text style={styles.bosOnizlemeYazi}>{t.noPhotosInAlbum}</Text>
            </View>
          )}

          <View style={styles.altBar}>
            <View style={styles.infoNot}>
              <Ionicons name="lock-closed-outline" size={14} color={RENKLER.komurAcik} style={{ flexShrink: 0 }} />
              <Text style={styles.infoNotYazi}>{t.sharePrivacyNote}</Text>
            </View>
            <TouchableOpacity style={styles.paylasBtn} onPress={paylas} activeOpacity={0.88}>
              <Ionicons name="share-outline" size={22} color={RENKLER.beyaz} />
              <Text style={styles.paylasBtnYazi}>
                {seciliFotolar.size > 0 ? t.shareCount(seciliFotolar.size) : t.shareBtn}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  bosWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  bosYazi: { fontSize: 17, fontWeight: '700', color: RENKLER.gece },
  bosAlt: { fontSize: 13, color: RENKLER.komurAcik },
  bosOnizleme: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  bosOnizlemeYazi: { fontSize: 13, color: RENKLER.komurAcik },
  bolumSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  bolumBaslik: { fontSize: 17, fontWeight: '700', color: RENKLER.gece },
  bolumLink: { fontSize: 13, color: RENKLER.gul, fontWeight: '500' },
  albumListePadding: { paddingHorizontal: 16 },
  albumKart: { alignItems: 'center', padding: 12, width: 96, backgroundColor: RENKLER.beyaz, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, gap: 6 },
  albumKartSecili: { borderColor: RENKLER.gece, backgroundColor: 'rgba(26,46,68,0.04)' },
  albumIkon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  albumAd: { fontSize: 12, fontWeight: '600', color: RENKLER.gece, textAlign: 'center' },
  albumAdSecili: { color: RENKLER.gece },
  albumSayi: { fontSize: 11, color: RENKLER.komurAcik },
  fotoSayisiWrap: { marginHorizontal: 16 },
  fotoSayisiSecici: { flexDirection: 'row', gap: 8 },
  fotoSayisiBtn: { flex: 1, paddingVertical: 10, backgroundColor: RENKLER.antik, borderWidth: 1.5, borderColor: 'rgba(166,123,113,0.2)', borderRadius: 12, alignItems: 'center' },
  fotoSayisiBtnAktif: { backgroundColor: RENKLER.gece, borderColor: RENKLER.gece },
  fotoSayisiBtnYazi: { fontSize: 13, fontWeight: '600', color: RENKLER.komurAcik },
  fotoSayisiBtnYaziAktif: { color: RENKLER.beyaz },
  onizlemeFoto: { width: 72, height: 72, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  onizlemeFotoSecili: { borderColor: RENKLER.gece },
  secimIsareti: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: RENKLER.gece, alignItems: 'center', justifyContent: 'center' },
  altBar: { padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.12)', backgroundColor: RENKLER.antik },
  infoNot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  infoNotYazi: { flex: 1, fontSize: 11, color: RENKLER.komurAcik },
  paylasBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15, backgroundColor: RENKLER.gece, borderRadius: 18, shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  paylasBtnYazi: { color: RENKLER.beyaz, fontSize: 17, fontWeight: '600' },
});
