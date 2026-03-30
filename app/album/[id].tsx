import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Alert, Modal, Platform, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import RNShare from 'react-native-share';
import { File, Paths } from 'expo-file-system';
import { useState } from 'react';
import { useAlbum } from '../../context/AlbumContext';
import { usePremium, MAX_UCRETSIZ_FOTO } from '../../context/PremiumContext';
import PaywallModal from '../../components/PaywallModal';
import { useLanguage } from '../../i18n';

const { width } = Dimensions.get('window');
const FOTO_BOYUTU = (width - 6) / 3;
const MAX_SECIM = 20;

const toShareUri = async (uri: string, idx: number): Promise<string> => {
  try {
    const cacheFile = new File(Paths.cache, `rnshare_${Date.now()}_${idx}.jpg`);
    if (uri.startsWith('file://')) {
      new File(uri).copy(cacheFile);
    } else {
      const res = await fetch(uri);
      const buf = await res.arrayBuffer();
      cacheFile.write(new Uint8Array(buf));
    }
    return cacheFile.uri;
  } catch { return uri; }
};

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  altin: '#D4AF37', antik: '#F9F7F2', antik2: '#F0ECE4',
  komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF',
};

export default function AlbumDetay() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { albumler, albumFotolari, fotolarTopluEkle, fotoEkle, fotoSil, fotoTasi, albumSil } = useAlbum();
  const { t } = useLanguage();
  const { isPremium } = usePremium();
  const [menuAcik, setMenuAcik] = useState(false);
  const [secimModu, setSecimModu] = useState(false);
  const [seciliFotolar, setSeciliFotolar] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [paywallAcik, setPaywallAcik] = useState(false);
  const [tasiModalAcik, setTasiModalAcik] = useState(false);
  const [tasinanFotoId, setTasinanFotoId] = useState<string | null>(null);

  const album = albumler.find(a => a.id === id);
  const fotolar = id ? albumFotolari(id) : [];

  if (!album) {
    return (
      <View style={styles.hata}>
        <Text style={styles.hataYazi}>Albüm bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: RENKLER.gul }}>{t.back}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const secimBaslat = (fotoId: string) => {
    setSecimModu(true);
    setSeciliFotolar(new Set([fotoId]));
  };

  const fotoMenuGoster = (foto: { id: string; uri: string }) => {
    Alert.alert(t.photoMenuTitle, undefined, [
      {
        text: t.sharePhoto,
        onPress: async () => {
          const mevcut = await Sharing.isAvailableAsync();
          if (mevcut) await Sharing.shareAsync(foto.uri);
        },
      },
      {
        text: t.moveToAlbum,
        onPress: () => { setTasinanFotoId(foto.id); setTasiModalAcik(true); },
      },
      {
        text: t.startSelectionMode,
        onPress: () => secimBaslat(foto.id),
      },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => fotoSilOnay(foto.id),
      },
      { text: t.cancel, style: 'cancel' },
    ]);
  };

  const fotoToggle = (fotoId: string) => {
    if (!secimModu) return;
    setSeciliFotolar(prev => {
      const yeni = new Set(prev);
      if (yeni.has(fotoId)) {
        yeni.delete(fotoId);
        if (yeni.size === 0) setSecimModu(false);
      } else {
        if (yeni.size >= MAX_SECIM) {
          Alert.alert(t.maxSelectionTitle, t.maxSelectMsg(MAX_SECIM));
          return prev;
        }
        yeni.add(fotoId);
      }
      return yeni;
    });
  };

  const secimiIptal = () => {
    setSecimModu(false);
    setSeciliFotolar(new Set());
  };

  const seciliPaylas = async () => {
    const secilen = fotolar.filter(f => seciliFotolar.has(f.id));
    if (secilen.length === 0) return;

    const uriList = secilen.map(f => f.uri);

    try {
      if (Platform.OS === 'android') {
        const shareUrilar = await Promise.all(uriList.map((u, i) => toShareUri(u, i)));
        if (shareUrilar.length === 1) {
          await RNShare.open({ url: shareUrilar[0], type: 'image/*', failOnCancel: false });
        } else {
          await RNShare.open({ urls: shareUrilar, type: 'image/*', failOnCancel: false });
        }
      } else {
        const mevcut = await Sharing.isAvailableAsync();
        if (!mevcut) { Alert.alert('Paylaşım desteklenmiyor'); return; }
        await Sharing.shareAsync(uriList[0]);
      }
    } catch {
      Alert.alert(t.error, t.shareErrorMsg);
    }

    secimiIptal();
  };

  const limitKontrol = () => {
    if (!isPremium && fotolar.length >= MAX_UCRETSIZ_FOTO) {
      setPaywallAcik(true);
      return false;
    }
    return true;
  };

  const fotoEkleGaleri = async () => {
    if (!limitKontrol()) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t.permissionRequired, t.galleryPermissionMsg); return; }

    const sonuc = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (!sonuc.canceled) {
      await fotolarTopluEkle(album.id, sonuc.assets.map(a => a.uri));
    }
  };

  const fotoEkleKamera = async () => {
    if (!limitKontrol()) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t.permissionRequired, t.cameraPermissionMsg); return; }

    const sonuc = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!sonuc.canceled) {
      const uri = sonuc.assets[0].uri;
      // Galeriye kaydet
      try {
        const { status: mlStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mlStatus === 'granted') await MediaLibrary.saveToLibraryAsync(uri);
      } catch {}
      await fotoEkle(album.id, uri);
    }
  };

  const paylasAlbum = async () => {
    if (fotolar.length === 0) { Alert.alert(t.noPhotosAlert, t.noPhotosAlertMsg); return; }
    const paylasabilir = await Sharing.isAvailableAsync();
    if (!paylasabilir) { Alert.alert(t.sharingNotSupported); return; }
    await Sharing.shareAsync(fotolar[0].uri);
  };

  const albumSilOnay = () => {
    Alert.alert(t.deleteAlbumTitle, t.deleteAlbumMsg(album.ad), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => { await albumSil(album.id); router.back(); } },
    ]);
  };

  const fotoSilOnay = (fotoId: string) => {
    Alert.alert(t.deletePhotoTitle, t.deletePhotoMsg, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => fotoSil(fotoId) },
    ]);
  };

  return (
    <View style={styles.kapsayici}>
      {/* Header */}
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.geriBtn} onPress={secimModu ? secimiIptal : () => router.back()}>
            <Ionicons name={secimModu ? 'close' : 'chevron-back'} size={20} color={RENKLER.beyaz} />
          </TouchableOpacity>
          <View style={styles.baslikWrap}>
            {secimModu ? (
              <Text style={styles.baslik}>{t.selectionInfo(seciliFotolar.size, MAX_SECIM)}</Text>
            ) : (
              <>
                <Text style={styles.baslik} numberOfLines={1}>{album.ad}</Text>
                <Text style={styles.altBaslik}>{t.photoCountLabel(fotolar.length)}</Text>
              </>
            )}
          </View>
          {!secimModu && (
            <>
              <TouchableOpacity style={styles.paylasBtn} onPress={paylasAlbum}>
                <Ionicons name="share-outline" size={18} color={RENKLER.beyaz} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuAcik(true)}>
                <Ionicons name="ellipsis-vertical" size={18} color={RENKLER.beyaz} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {secimModu && (
          <View style={styles.secimBilgi}>
            <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.secimBilgiYazi}>{t.selectionHint(MAX_SECIM)}</Text>
          </View>
        )}
      </View>

      {/* Fotoğraf grid */}
      <ScrollView style={styles.icerik} showsVerticalScrollIndicator={false}>
        {fotolar.length === 0 ? (
          <View style={styles.bosFoto}>
            <Ionicons name="images-outline" size={48} color={RENKLER.gulAcik} />
            <Text style={styles.bosFotoYazi}>{t.albumEmpty}</Text>
            <Text style={styles.bosFotoAlt}>{t.albumEmptyDesc}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {fotolar.map((foto) => {
              const secili = seciliFotolar.has(foto.id);
              return (
                <TouchableOpacity
                  key={foto.id}
                  style={[styles.fotoDurum, secili && styles.fotoDurumSecili]}
                  onPress={() => secimModu ? fotoToggle(foto.id) : setLightboxIndex(fotolar.indexOf(foto))}
                  onLongPress={() => secimModu ? fotoSilOnay(foto.id) : fotoMenuGoster(foto)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: foto.uri }} style={styles.fotoImg} contentFit="cover" />
                  {secimModu && (
                    <View style={[styles.secimCerceve, secili && styles.secimCerceveDolu]}>
                      {secili && <Ionicons name="checkmark" size={14} color={RENKLER.beyaz} />}
                    </View>
                  )}
                  {secili && <View style={styles.secimOverlay} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Alt bar */}
      {secimModu ? (
        <View style={[styles.secimAltBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.iptalBtn} onPress={secimiIptal} activeOpacity={0.88}>
            <Text style={styles.iptalBtnYazi}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paylasSecimBtn, seciliFotolar.size === 0 && styles.paylasSecimBtnPasif]}
            onPress={seciliPaylas}
            activeOpacity={0.88}
            disabled={seciliFotolar.size === 0}
          >
            <Ionicons name="share-outline" size={18} color={RENKLER.beyaz} />
            <Text style={styles.paylasSecimBtnYazi}>
              {seciliFotolar.size > 0 ? t.shareSelectedBtn(seciliFotolar.size) : t.shareBtn}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.altBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.ekleBtn} onPress={fotoEkleGaleri} activeOpacity={0.88}>
            <Ionicons name="images-outline" size={18} color={RENKLER.beyaz} />
            <Text style={styles.ekleBtnYazi}>{t.addFromGallery}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.kameraBtn} onPress={fotoEkleKamera} activeOpacity={0.88}>
            <Ionicons name="camera-outline" size={20} color={RENKLER.gece} />
          </TouchableOpacity>
        </View>
      )}

      {/* Lightbox */}
      <Modal visible={lightboxIndex !== null} transparent animationType="fade" onRequestClose={() => setLightboxIndex(null)}>
        <View style={styles.lightboxArkaplan}>
          <TouchableOpacity style={styles.lightboxKapat} onPress={() => setLightboxIndex(null)}>
            <Ionicons name="close" size={24} color={RENKLER.beyaz} />
          </TouchableOpacity>
          {lightboxIndex !== null && (
            <>
              <FlatList
                data={fotolar}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={lightboxIndex}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setLightboxIndex(null)}
                    style={{ width, height: '100%', justifyContent: 'center' }}
                  >
                    <Image source={{ uri: item.uri }} style={{ width, flex: 1 }} contentFit="contain" />
                  </TouchableOpacity>
                )}
                onMomentumScrollEnd={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                  setLightboxIndex(idx);
                }}
              />
              <View style={styles.lightboxSayac}>
                <Text style={styles.lightboxSayacYazi}>{lightboxIndex + 1} / {fotolar.length}</Text>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Menü modal */}
      <Modal visible={menuAcik} transparent animationType="fade" onRequestClose={() => setMenuAcik(false)}>
        <TouchableOpacity style={styles.menuArkaplan} activeOpacity={1} onPress={() => setMenuAcik(false)}>
          <View style={styles.menuPanel}>
            <TouchableOpacity style={styles.menuSatir} onPress={() => { setMenuAcik(false); paylasAlbum(); }}>
              <Ionicons name="share-outline" size={18} color={RENKLER.gece} />
              <Text style={styles.menuSatirYazi}>{t.shareAlbum}</Text>
            </TouchableOpacity>
            <View style={styles.menuAyrac} />
            <TouchableOpacity style={styles.menuSatir} onPress={() => { setMenuAcik(false); albumSilOnay(); }}>
              <Ionicons name="trash-outline" size={18} color="#C0392B" />
              <Text style={[styles.menuSatirYazi, { color: '#C0392B' }]}>{t.deleteAlbumBtn}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <PaywallModal gorunur={paywallAcik} tip="foto" onKapat={() => setPaywallAcik(false)} />

      {/* Albüme Taşı Modal */}
      <Modal visible={tasiModalAcik} transparent animationType="slide" onRequestClose={() => setTasiModalAcik(false)}>
        <TouchableOpacity style={styles.menuArkaplan} activeOpacity={1} onPress={() => setTasiModalAcik(false)}>
          <View style={styles.tasiPanel}>
            <View style={styles.tasiTutamac} />
            <Text style={styles.tasiBaslik}>{t.moveToAlbumTitle}</Text>
            {albumler.filter(a => a.id !== album.id).map(a => (
              <TouchableOpacity
                key={a.id}
                style={styles.tasiSatir}
                onPress={async () => {
                  if (tasinanFotoId) await fotoTasi(tasinanFotoId, a.id);
                  setTasiModalAcik(false);
                  setTasinanFotoId(null);
                }}
              >
                <View style={[styles.tasiIkon, { backgroundColor: a.renk }]}>
                  <Ionicons name={a.ikon as React.ComponentProps<typeof Ionicons>['name']} size={18} color={a.ikonRenk} />
                </View>
                <Text style={styles.tasiAlbumAd}>{a.ad}</Text>
                <Ionicons name="chevron-forward" size={16} color={RENKLER.komurAcik} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.antik },
  hata: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hataYazi: { fontSize: 16, color: RENKLER.komurAcik },

  headerWrap: { backgroundColor: RENKLER.gece },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  geriBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  baslikWrap: { flex: 1 },
  baslik: { fontSize: 18, fontWeight: '700', color: RENKLER.beyaz },
  altBaslik: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  paylasBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2A9958', alignItems: 'center', justifyContent: 'center' },
  menuBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  secimBilgi: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.05)' },
  secimBilgiYazi: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },

  icerik: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, padding: 3 },
  fotoDurum: { width: FOTO_BOYUTU, height: FOTO_BOYUTU, position: 'relative' },
  fotoDurumSecili: { opacity: 0.85 },
  fotoImg: { width: '100%', height: '100%' },
  secimCerceve: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: RENKLER.beyaz, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  secimCerceveDolu: { backgroundColor: RENKLER.gece, borderColor: RENKLER.gece },
  secimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,46,68,0.25)' },

  bosFoto: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  bosFotoYazi: { fontSize: 17, fontWeight: '600', color: RENKLER.gece },
  bosFotoAlt: { fontSize: 13, color: RENKLER.komurAcik, textAlign: 'center', lineHeight: 20 },

  altBar: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: RENKLER.beyaz, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.15)' },
  ekleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: RENKLER.gece, borderRadius: 14 },
  ekleBtnYazi: { color: RENKLER.beyaz, fontSize: 15, fontWeight: '600' },
  kameraBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: RENKLER.antik2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(166,123,113,0.2)' },

  secimAltBar: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: RENKLER.beyaz, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.15)' },
  iptalBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: RENKLER.antik2, borderWidth: 1, borderColor: 'rgba(166,123,113,0.2)' },
  iptalBtnYazi: { fontSize: 15, fontWeight: '600', color: RENKLER.komurAcik },
  paylasSecimBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#2A9958', borderRadius: 14 },
  paylasSecimBtnPasif: { backgroundColor: RENKLER.komurAcik, opacity: 0.4 },
  paylasSecimBtnYazi: { color: RENKLER.beyaz, fontSize: 15, fontWeight: '600' },

  lightboxArkaplan: { flex: 1, backgroundColor: '#000' },
  lightboxKapat: { position: 'absolute', top: 52, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  lightboxSayac: { position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  lightboxSayacYazi: { color: RENKLER.beyaz, fontSize: 13, fontWeight: '600' },

  menuArkaplan: { flex: 1, backgroundColor: 'rgba(26,46,68,0.4)', justifyContent: 'flex-end' },
  menuPanel: { position: 'absolute', top: 110, right: 16, backgroundColor: RENKLER.beyaz, borderRadius: 16, overflow: 'hidden', minWidth: 200, shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8, borderWidth: 1, borderColor: 'rgba(166,123,113,0.15)' },
  menuSatir: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  menuSatirYazi: { fontSize: 14, fontWeight: '500', color: RENKLER.gece },
  menuAyrac: { height: 1, backgroundColor: 'rgba(166,123,113,0.1)' },

  tasiPanel: { backgroundColor: RENKLER.antik, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.2)', paddingBottom: 40 },
  tasiTutamac: { width: 40, height: 4, borderRadius: 2, backgroundColor: RENKLER.antik2, alignSelf: 'center', margin: 16 },
  tasiBaslik: { fontSize: 15, fontWeight: '700', color: RENKLER.gece, paddingHorizontal: 20, paddingBottom: 12 },
  tasiSatir: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.1)' },
  tasiIkon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tasiAlbumAd: { flex: 1, fontSize: 15, fontWeight: '500', color: RENKLER.komur },
});
