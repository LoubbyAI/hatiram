import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Alert,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useAlbum, Album } from '../../context/AlbumContext';
import { usePremium, MAX_UCRETSIZ_FOTO } from '../../context/PremiumContext';
import PaywallModal from '../../components/PaywallModal';
import { useLanguage } from '../../i18n';

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  altin: '#D4AF37', antik: '#F9F7F2', antik2: '#F0ECE4',
  komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF',
};

type IonIconName = React.ComponentProps<typeof Ionicons>['name'];

function AlbumSecModal({ gorünür, onSec, onKapat }: {
  gorünür: boolean;
  onSec: (album: Album) => void;
  onKapat: () => void;
}) {
  const { albumler } = useAlbum();
  const { t } = useLanguage();

  return (
    <Modal visible={gorünür} transparent animationType="slide" onRequestClose={onKapat}>
      <View style={albumModal.kaplama}>
        <TouchableOpacity style={albumModal.arkaplan} activeOpacity={1} onPress={onKapat} />
        <View style={albumModal.kart}>
          <View style={albumModal.tutamac} />
          <Text style={albumModal.baslik}>{t.addSelectAlbumTitle}</Text>
          {albumler.length === 0 ? (
            <View style={albumModal.bosWrap}>
              <Text style={albumModal.bosYazi}>{t.addNoAlbumsEmpty}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}>
              {albumler.map((album) => (
                <TouchableOpacity key={album.id} style={albumModal.satir} onPress={() => onSec(album)} activeOpacity={0.8}>
                  <View style={[albumModal.ikon, { backgroundColor: album.renk }]}>
                    <Ionicons name={album.ikon as IonIconName} size={22} color={album.ikonRenk} />
                  </View>
                  <Text style={albumModal.ad}>{album.ad}</Text>
                  <Ionicons name="chevron-forward" size={16} color={RENKLER.gulAcik} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={albumModal.iptal} onPress={onKapat}>
            <Text style={albumModal.iptalYazi}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function Ekle() {
  const { fotoEkle, fotolarTopluEkle, albumler, albumFotolari } = useAlbum();
  const { isPremium } = usePremium();
  const { t } = useLanguage();
  const [albumSecAcik, setAlbumSecAcik] = useState(false);
  const [seciliUriList, setSeciliUriList] = useState<string[]>([]);
  const [paywallAcik, setPaywallAcik] = useState(false);

  const izinKontrol = async (tip: 'galeri' | 'kamera') => {
    if (tip === 'galeri') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t.permissionRequired, t.galleryPermissionMsg);
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t.permissionRequired, t.cameraPermissionMsg);
        return false;
      }
    }
    return true;
  };

  const galeriden = async () => {
    if (!await izinKontrol('galeri')) return;
    if (albumler.length === 0) { Alert.alert(t.addNoAlbumsAlert, t.addNoAlbumsAlertMsg); return; }

    const sonuc = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (!sonuc.canceled && sonuc.assets.length > 0) {
      setSeciliUriList(sonuc.assets.map(a => a.uri));
      setAlbumSecAcik(true);
    }
  };

  const kamerayla = async () => {
    if (!await izinKontrol('kamera')) return;
    if (albumler.length === 0) { Alert.alert(t.addNoAlbumsAlert, t.addNoAlbumsAlertMsg); return; }

    const sonuc = await ImagePicker.launchCameraAsync({
      quality: 0.85,
    });

    if (!sonuc.canceled) {
      const uri = sonuc.assets[0].uri;
      try {
        const { status: mlStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mlStatus === 'granted') await MediaLibrary.saveToLibraryAsync(uri);
      } catch {}
      setSeciliUriList([uri]);
      setAlbumSecAcik(true);
    }
  };

  const albumSec = async (album: Album) => {
    setAlbumSecAcik(false);
    if (seciliUriList.length === 0) return;

    if (!isPremium && albumFotolari(album.id).length >= MAX_UCRETSIZ_FOTO) {
      setPaywallAcik(true);
      return;
    }

    try {
      if (seciliUriList.length === 1) {
        await fotoEkle(album.id, seciliUriList[0]);
      } else {
        await fotolarTopluEkle(album.id, seciliUriList);
      }
      Alert.alert(t.addSuccessTitle, t.addSuccessMsg(album.ad));
    } catch (e) {
      Alert.alert(t.error, t.addErrorMsg);
    }
    setSeciliUriList([]);
  };

  const SECENEKLER = [
    { ikon: 'images-outline' as IonIconName, ikonBg: '#E8EEF5', ikonRenk: '#6B7AAA', baslik: t.addOptionGalleryTitle, aciklama: t.addOptionGalleryDesc, onPress: galeriden },
    { ikon: 'camera-outline' as IonIconName, ikonBg: '#EAF0EA', ikonRenk: '#5A7A5C', baslik: t.addOptionCameraTitle, aciklama: t.addOptionCameraDesc, onPress: kamerayla },
  ];

  return (
    <View style={styles.kapsayici}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => router.back()} />
      <View style={styles.modal}>
        <View style={styles.tutamac} />
        <Text style={styles.modalBaslik}>{t.addTabTitle}</Text>
        <Text style={styles.modalAltBaslik}>{t.addTabSubtitle}</Text>

        <View style={styles.secenekler}>
          {SECENEKLER.map((s) => (
            <TouchableOpacity key={s.baslik} style={styles.secenek} onPress={s.onPress} activeOpacity={0.8}>
              <View style={[styles.secenekIkon, { backgroundColor: s.ikonBg }]}>
                <Ionicons name={s.ikon} size={24} color={s.ikonRenk} />
              </View>
              <View style={styles.secenekMetin}>
                <Text style={styles.secenekBaslik}>{s.baslik}</Text>
                <Text style={styles.secenekAciklama}>{s.aciklama}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={RENKLER.gulAcik} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.aiRozet}>
          <Ionicons name="lock-closed-outline" size={14} color={RENKLER.gece} />
          <Text style={styles.aiRozetYazi}>{t.addPrivacyNote}</Text>
        </View>
      </View>

      <AlbumSecModal
        gorünür={albumSecAcik}
        onSec={albumSec}
        onKapat={() => { setAlbumSecAcik(false); setSeciliUriList([]); }}
      />
      <PaywallModal
        gorunur={paywallAcik}
        tip="foto"
        onKapat={() => setPaywallAcik(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,46,68,0.55)' },
  modal: { backgroundColor: RENKLER.antik, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 48, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.2)' },
  tutamac: { width: 40, height: 4, backgroundColor: RENKLER.antik2, borderRadius: 2, margin: 16, alignSelf: 'center' },
  modalBaslik: { fontSize: 20, fontWeight: '600', color: RENKLER.gece, paddingHorizontal: 24, marginBottom: 4 },
  modalAltBaslik: { fontSize: 13, color: RENKLER.komurAcik, paddingHorizontal: 24, marginBottom: 20, lineHeight: 20 },
  secenekler: { paddingHorizontal: 16, gap: 10 },
  secenek: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 17, backgroundColor: RENKLER.beyaz, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(166,123,113,0.15)', shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  secenekIkon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  secenekMetin: { flex: 1 },
  secenekBaslik: { fontSize: 15, fontWeight: '600', color: RENKLER.gece },
  secenekAciklama: { fontSize: 12, color: RENKLER.komurAcik, marginTop: 2 },
  aiRozet: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(26,46,68,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(26,46,68,0.1)' },
  aiRozetYazi: { fontSize: 12, color: RENKLER.gece, fontWeight: '500', opacity: 0.8 },
});

const albumModal = StyleSheet.create({
  kaplama: { flex: 1, justifyContent: 'flex-end' },
  arkaplan: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,46,68,0.5)' },
  kart: { backgroundColor: RENKLER.antik, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.2)' },
  tutamac: { width: 40, height: 4, backgroundColor: RENKLER.antik2, borderRadius: 2, alignSelf: 'center', margin: 16 },
  baslik: { fontSize: 18, fontWeight: '600', color: RENKLER.gece, paddingHorizontal: 24, marginBottom: 16 },
  bosWrap: { alignItems: 'center', padding: 32 },
  bosYazi: { fontSize: 14, color: RENKLER.komurAcik },
  satir: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: RENKLER.beyaz, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(166,123,113,0.15)' },
  ikon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ad: { flex: 1, fontSize: 15, fontWeight: '600', color: RENKLER.gece },
  iptal: { alignItems: 'center', padding: 12 },
  iptalYazi: { fontSize: 15, color: RENKLER.komurAcik },
});
