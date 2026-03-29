import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Modal, TextInput, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlbum, Kisi } from '../../context/AlbumContext';

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  altin: '#D4AF37', antik: '#F9F7F2', antik2: '#F0ECE4',
  komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF',
  kirmizi: '#C0392B',
};

type IonIconName = React.ComponentProps<typeof Ionicons>['name'];

const AYAR_ANAHTARLARI = {
  cocukAdi: 'ayar_cocuk_adi',
  dogumTarihi: 'ayar_dogum_tarihi',
  ogGunBildirim: 'ayar_og_gun_bildirim',
  haftalikOzet: 'ayar_haftalik_ozet',
};

function DuzenlemeModal({ gorünür, baslik, deger, onKaydet, onKapat }: {
  gorünür: boolean; baslik: string; deger: string;
  onKaydet: (v: string) => void; onKapat: () => void;
}) {
  const [gecici, setGecici] = useState(deger);
  useEffect(() => { setGecici(deger); }, [deger, gorünür]);

  const kaydet = () => {
    if (gecici.trim()) onKaydet(gecici.trim());
    onKapat();
  };

  return (
    <Modal visible={gorünür} transparent animationType="slide" onRequestClose={onKapat}>
      <KeyboardAvoidingView style={styles.modalKaplama} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.modalArkaplan} activeOpacity={1} onPress={onKapat} />
        <View style={styles.modalKart}>
          <View style={styles.modalTutamac} />
          <Text style={styles.modalBaslik}>{baslik}</Text>
          <TextInput
            style={styles.modalInput}
            value={gecici}
            onChangeText={setGecici}
            autoFocus
            placeholder={baslik}
            placeholderTextColor={RENKLER.gulAcik}
            returnKeyType="done"
            onSubmitEditing={kaydet}
          />
          <TouchableOpacity style={styles.modalKaydetBtn} onPress={kaydet} activeOpacity={0.85}>
            <Text style={styles.modalKaydetYazi}>Kaydet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalIptalBtn} onPress={onKapat}>
            <Text style={styles.modalIptalYazi}>İptal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function KisiEkleModal({ gorünür, onKapat, onEkle }: {
  gorünür: boolean; onKapat: () => void; onEkle: (ad: string) => void;
}) {
  const [ad, setAd] = useState('');

  const ekle = () => {
    if (ad.trim()) { onEkle(ad.trim()); setAd(''); onKapat(); }
  };

  return (
    <Modal visible={gorünür} transparent animationType="slide" onRequestClose={onKapat}>
      <KeyboardAvoidingView style={styles.modalKaplama} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.modalArkaplan} activeOpacity={1} onPress={onKapat} />
        <View style={styles.modalKart}>
          <View style={styles.modalTutamac} />
          <Text style={styles.modalBaslik}>Kişi Ekle</Text>
          <Text style={styles.modalAltBaslik}>Çocuk, eş, büyükanne... dilediğin kişiyi ekle</Text>
          <TextInput
            style={styles.modalInput}
            value={ad}
            onChangeText={setAd}
            autoFocus
            placeholder="Ad (örn. Elif, Ahmet...)"
            placeholderTextColor={RENKLER.gulAcik}
            returnKeyType="done"
            onSubmitEditing={ekle}
          />
          <TouchableOpacity style={styles.modalKaydetBtn} onPress={ekle} activeOpacity={0.85}>
            <Text style={styles.modalKaydetYazi}>Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalIptalBtn} onPress={onKapat}>
            <Text style={styles.modalIptalYazi}>İptal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// 3. adım: "SİL" yazma modalı
function SilOnayModal({ gorünür, albumSayisi, fotoSayisi, onKapat, onOnayla }: {
  gorünür: boolean; albumSayisi: number; fotoSayisi: number;
  onKapat: () => void; onOnayla: () => void;
}) {
  const [metin, setMetin] = useState('');
  const aktif = metin.trim().toLocaleUpperCase('tr-TR') === 'SİL';

  useEffect(() => { if (!gorünür) setMetin(''); }, [gorünür]);

  return (
    <Modal visible={gorünür} transparent animationType="fade" onRequestClose={onKapat}>
      <KeyboardAvoidingView style={styles.modalKaplama} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.modalArkaplan} activeOpacity={1} onPress={onKapat} />
        <View style={styles.modalKart}>
          <View style={styles.modalTutamac} />
          <View style={styles.silUyariWrap}>
            <View style={styles.silUyariIkon}>
              <Ionicons name="warning-outline" size={28} color={RENKLER.kirmizi} />
            </View>
            <Text style={styles.silUyariBaslik}>Son Adım</Text>
            <Text style={styles.silUyariAlt}>
              {albumSayisi} albüm ve {fotoSayisi} fotoğraf kalıcı olarak silinecek.{'\n'}Bu işlem geri alınamaz.
            </Text>
          </View>
          <Text style={styles.silYazmaAciklama}>
            Devam etmek için aşağıya <Text style={{ fontWeight: '700', color: RENKLER.kirmizi }}>SİL</Text> yaz
          </Text>
          <TextInput
            style={[styles.modalInput, styles.silInput, aktif && styles.silInputAktif]}
            value={metin}
            onChangeText={setMetin}
            placeholder="SİL"
            placeholderTextColor="rgba(192,57,43,0.3)"
            autoCapitalize="characters"
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.modalKaydetBtn, styles.silBtn, !aktif && styles.silBtnPasif]}
            onPress={aktif ? onOnayla : undefined}
            activeOpacity={aktif ? 0.85 : 1}
          >
            <Ionicons name="trash-outline" size={18} color={RENKLER.beyaz} />
            <Text style={styles.silBtnYazi}>Tüm Verileri Sil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalIptalBtn} onPress={onKapat}>
            <Text style={styles.modalIptalYazi}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AyarSatiri({ ikon, ikonBg, ikonRenk, baslik, alt, onPress, tehlikeli = false }: {
  ikon: IonIconName; ikonBg: string; ikonRenk: string;
  baslik: string; alt: string; onPress?: () => void; tehlikeli?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.ayarSatir} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.ayarIkon, { backgroundColor: ikonBg }]}>
        <Ionicons name={ikon} size={20} color={ikonRenk} />
      </View>
      <View style={styles.ayarMetin}>
        <Text style={[styles.ayarBaslik, tehlikeli && { color: RENKLER.kirmizi }]}>{baslik}</Text>
        <Text style={styles.ayarAlt}>{alt}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={tehlikeli ? RENKLER.kirmizi : RENKLER.gulAcik} />
    </TouchableOpacity>
  );
}

function ToggleSatiri({ ikon, ikonBg, ikonRenk, baslik, alt, aktif, onDegistir }: {
  ikon: IonIconName; ikonBg: string; ikonRenk: string;
  baslik: string; alt: string; aktif: boolean; onDegistir: (v: boolean) => void;
}) {
  return (
    <View style={styles.ayarSatir}>
      <View style={[styles.ayarIkon, { backgroundColor: ikonBg }]}>
        <Ionicons name={ikon} size={20} color={ikonRenk} />
      </View>
      <View style={styles.ayarMetin}>
        <Text style={styles.ayarBaslik}>{baslik}</Text>
        <Text style={styles.ayarAlt}>{alt}</Text>
      </View>
      <Switch
        value={aktif}
        onValueChange={onDegistir}
        trackColor={{ false: 'rgba(166,123,113,0.3)', true: RENKLER.gece }}
        thumbColor={RENKLER.beyaz}
        ios_backgroundColor="rgba(166,123,113,0.3)"
      />
    </View>
  );
}

function KisiSatiri({ kisi, onSil }: { kisi: Kisi; onSil: () => void }) {
  return (
    <View style={styles.kisiSatir}>
      <View style={[styles.kisiAvatar, { backgroundColor: kisi.renk }]}>
        <Text style={[styles.kisiAvatarHarf, { color: kisi.ikonRenk }]}>
          {kisi.ad.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.kisiAd}>{kisi.ad}</Text>
      <TouchableOpacity style={styles.kisiSilBtn} onPress={onSil} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close-circle" size={20} color="rgba(166,123,113,0.5)" />
      </TouchableOpacity>
    </View>
  );
}

export default function Ayarlar() {
  const insets = useSafeAreaInsets();
  const { albumler, fotolar, kisiler, kisiEkle, kisiSil, tumVerileriSil } = useAlbum();
  const [cocukAdi, setCocukAdiState] = useState('');
  const [dogumTarihi, setDogumTarihiState] = useState('');
  const [ogGunBildirim, setOgGunBildirimState] = useState(true);
  const [haftalikOzet, setHaftalikOzetState] = useState(false);
  const [aktifModal, setAktifModal] = useState<null | 'ad' | 'tarih' | 'kisiEkle'>(null);
  const [silModalAcik, setSilModalAcik] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(Object.values(AYAR_ANAHTARLARI)).then((pairs) => {
      const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (map[AYAR_ANAHTARLARI.cocukAdi]) setCocukAdiState(map[AYAR_ANAHTARLARI.cocukAdi]!);
      if (map[AYAR_ANAHTARLARI.dogumTarihi]) setDogumTarihiState(map[AYAR_ANAHTARLARI.dogumTarihi]!);
      if (map[AYAR_ANAHTARLARI.ogGunBildirim] !== null) setOgGunBildirimState(map[AYAR_ANAHTARLARI.ogGunBildirim] !== 'false');
      if (map[AYAR_ANAHTARLARI.haftalikOzet] !== null) setHaftalikOzetState(map[AYAR_ANAHTARLARI.haftalikOzet] === 'true');
    });
  }, []);

  const setCocukAdi = async (v: string) => {
    setCocukAdiState(v);
    await AsyncStorage.setItem(AYAR_ANAHTARLARI.cocukAdi, v);
  };

  const setDogumTarihi = async (v: string) => {
    setDogumTarihiState(v);
    await AsyncStorage.setItem(AYAR_ANAHTARLARI.dogumTarihi, v);
  };

  const setOgGunBildirim = async (v: boolean) => {
    setOgGunBildirimState(v);
    await AsyncStorage.setItem(AYAR_ANAHTARLARI.ogGunBildirim, String(v));
  };

  const setHaftalikOzet = async (v: boolean) => {
    setHaftalikOzetState(v);
    await AsyncStorage.setItem(AYAR_ANAHTARLARI.haftalikOzet, String(v));
  };

  const kisiSilOnay = (kisi: Kisi) => {
    Alert.alert(
      `"${kisi.ad}" Silinsin mi?`,
      'Kişi silinir ama albümleri korunur, sadece bağlantı kaldırılır.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => kisiSil(kisi.id) },
      ],
    );
  };

  // 3 adımlı silme
  const adim1 = () => {
    Alert.alert(
      'Dikkat!',
      'Tüm albüm ve fotoğrafları silmek istediğinden emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Devam Et', style: 'destructive', onPress: adim2 },
      ],
    );
  };

  const adim2 = () => {
    Alert.alert(
      'Gerçekten emin misin?',
      `${albumler.length} albüm ve ${fotolar.length} fotoğraf kalıcı olarak silinecek. Geri dönüş yok.`,
      [
        { text: 'Hayır, Vazgeç', style: 'cancel' },
        { text: 'Evet, Devam', style: 'destructive', onPress: () => setSilModalAcik(true) },
      ],
    );
  };

  const adim3Onayla = async () => {
    setSilModalAcik(false);
    await tumVerileriSil();
    setCocukAdiState('');
    setDogumTarihiState('');
  };

  const istatistik = `${albumler.length} albüm · ${fotolar.length} fotoğraf`;

  return (
    <View style={styles.kapsayici}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.baslik}>Ayarlar</Text>
        </View>
        <View style={styles.gizlilikCubugu}>
          <View style={styles.gizlilikDot} />
          <Text style={styles.gizlilikYazi}>Anıların yalnızca bu telefonda · Bulut yok</Text>
        </View>
      </View>

      <ScrollView style={styles.icerik} showsVerticalScrollIndicator={false}>
        <View style={styles.gizlilikBanner}>
          <View style={styles.gizlilikBannerBaslik}>
            <Ionicons name="lock-closed-outline" size={16} color={RENKLER.gece} />
            <Text style={styles.gizlilikBannerBaslikYazi}>Fotoğrafların yalnızca bu telefonda</Text>
          </View>
          <Text style={styles.gizlilikBannerAlt}>Hiçbir fotoğraf sunucuya gönderilmez. Bulut depolama yok. Veriler tamamen sende.</Text>
        </View>

        {/* Kişiler */}
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>KİŞİLER</Text>
          {kisiler.length === 0 ? (
            <View style={styles.kisiBosDurum}>
              <Text style={styles.kisiBosYazi}>Henüz kimse eklenmedi</Text>
              <Text style={styles.kisiBosAlt}>Çocuk, eş veya aile üyesi ekleyerek albümleri kişilere atayabilirsin</Text>
            </View>
          ) : (
            <View style={styles.kisiListe}>
              {kisiler.map(k => (
                <KisiSatiri key={k.id} kisi={k} onSil={() => kisiSilOnay(k)} />
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.kisiEkleBtn} onPress={() => setAktifModal('kisiEkle')} activeOpacity={0.8}>
            <Ionicons name="person-add-outline" size={16} color={RENKLER.gul} />
            <Text style={styles.kisiEkleBtnYazi}>Kişi Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Genel */}
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>GENEL</Text>
          <AyarSatiri
            ikon="person-outline" ikonBg="#F5EDE6" ikonRenk="#A67B71"
            baslik="Çocuk Adı" alt={cocukAdi || 'Belirtilmedi'}
            onPress={() => setAktifModal('ad')}
          />
          <AyarSatiri
            ikon="gift-outline" ikonBg="#E8EEF5" ikonRenk="#6B7AAA"
            baslik="Doğum Tarihi" alt={dogumTarihi || 'Belirtilmedi'}
            onPress={() => setAktifModal('tarih')}
          />
        </View>

        {/* Bildirimler */}
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>BİLDİRİMLER</Text>
          <ToggleSatiri
            ikon="calendar-outline" ikonBg="#F5EDEB" ikonRenk="#A67B71"
            baslik='"O Gün" Hatırlatması'
            alt="Geçen yıl bugün — anılar"
            aktif={ogGunBildirim} onDegistir={setOgGunBildirim}
          />
          <ToggleSatiri
            ikon="notifications-outline" ikonBg="#F0EBF5" ikonRenk="#8B6BAA"
            baslik="Haftalık Özet"
            alt="Bu hafta eklenen fotoğraflar"
            aktif={haftalikOzet} onDegistir={setHaftalikOzet}
          />
        </View>

        {/* Depolama */}
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>DEPOLAMA</Text>
          <View style={styles.ayarSatir}>
            <View style={[styles.ayarIkon, { backgroundColor: '#F5EDE6' }]}>
              <Ionicons name="bar-chart-outline" size={20} color="#A67B71" />
            </View>
            <View style={styles.ayarMetin}>
              <Text style={styles.ayarBaslik}>İstatistikler</Text>
              <Text style={styles.ayarAlt}>{istatistik}</Text>
            </View>
          </View>
        </View>

        {/* Uygulama */}
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>UYGULAMA</Text>
          <AyarSatiri
            ikon="star-outline" ikonBg="#F5EDE6" ikonRenk={RENKLER.altin}
            baslik="Uygulamayı Değerlendir" alt="Bizi değerlendirin"
            onPress={() => Alert.alert('Teşekkürler!', 'Play Store\'a yönlendiriliyorsunuz.')}
          />
          <View style={[styles.ayarSatir, { marginBottom: 0 }]}>
            <View style={[styles.ayarIkon, { backgroundColor: '#E8EEF5' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7AAA" />
            </View>
            <View style={styles.ayarMetin}>
              <Text style={styles.ayarBaslik}>Versiyon</Text>
              <Text style={styles.ayarAlt}>Hatıram v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Tehlikeli */}
        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>TEHLİKELİ BÖLGE</Text>
          <AyarSatiri
            ikon="trash-outline" ikonBg="#FEF0EE" ikonRenk={RENKLER.kirmizi}
            baslik="Tüm Verileri Sil" alt="Albümler ve fotoğraflar kalıcı silinir"
            onPress={adim1}
            tehlikeli
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <DuzenlemeModal gorünür={aktifModal === 'ad'} baslik="Çocuk Adı" deger={cocukAdi} onKaydet={setCocukAdi} onKapat={() => setAktifModal(null)} />
      <DuzenlemeModal gorünür={aktifModal === 'tarih'} baslik="Doğum Tarihi" deger={dogumTarihi} onKaydet={setDogumTarihi} onKapat={() => setAktifModal(null)} />
      <KisiEkleModal gorünür={aktifModal === 'kisiEkle'} onKapat={() => setAktifModal(null)} onEkle={kisiEkle} />
      <SilOnayModal
        gorünür={silModalAcik}
        albumSayisi={albumler.length}
        fotoSayisi={fotolar.length}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={adim3Onayla}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.antik },
  headerWrap: { backgroundColor: RENKLER.gece },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  baslik: { fontSize: 22, fontWeight: '700', color: RENKLER.beyaz },
  gizlilikCubugu: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  gizlilikDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RENKLER.altin },
  gizlilikYazi: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  icerik: { flex: 1 },
  gizlilikBanner: { margin: 16, padding: 16, backgroundColor: 'rgba(26,46,68,0.05)', borderWidth: 1, borderColor: 'rgba(26,46,68,0.1)', borderRadius: 16 },
  gizlilikBannerBaslik: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  gizlilikBannerBaslikYazi: { fontSize: 14, fontWeight: '600', color: RENKLER.gece },
  gizlilikBannerAlt: { fontSize: 12, color: RENKLER.komurAcik, lineHeight: 18 },
  bolum: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  bolumBaslik: { fontSize: 11, fontWeight: '700', color: RENKLER.komurAcik, letterSpacing: 0.7, marginBottom: 8, paddingLeft: 2 },
  ayarSatir: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: RENKLER.beyaz, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(166,123,113,0.12)', shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  ayarIkon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ayarMetin: { flex: 1 },
  ayarBaslik: { fontSize: 15, fontWeight: '500', color: RENKLER.gece },
  ayarAlt: { fontSize: 12, color: RENKLER.komurAcik, marginTop: 2 },

  // Kişiler
  kisiBosDurum: { padding: 16, backgroundColor: RENKLER.beyaz, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(166,123,113,0.12)', marginBottom: 8, gap: 4 },
  kisiBosYazi: { fontSize: 14, fontWeight: '500', color: RENKLER.komurAcik },
  kisiBosAlt: { fontSize: 12, color: RENKLER.gulAcik, lineHeight: 18 },
  kisiListe: { backgroundColor: RENKLER.beyaz, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(166,123,113,0.12)', marginBottom: 8, overflow: 'hidden' },
  kisiSatir: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(166,123,113,0.08)' },
  kisiAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  kisiAvatarHarf: { fontSize: 15, fontWeight: '700' },
  kisiAd: { flex: 1, fontSize: 15, fontWeight: '500', color: RENKLER.gece },
  kisiSilBtn: { padding: 4 },
  kisiEkleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(166,123,113,0.35)', marginBottom: 8 },
  kisiEkleBtnYazi: { fontSize: 14, fontWeight: '500', color: RENKLER.gul },

  // Modal
  modalKaplama: { flex: 1, justifyContent: 'flex-end' },
  modalArkaplan: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,46,68,0.5)' },
  modalKart: { backgroundColor: RENKLER.antik, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.2)' },
  modalTutamac: { width: 40, height: 4, backgroundColor: RENKLER.antik2, borderRadius: 2, alignSelf: 'center', margin: 16 },
  modalBaslik: { fontSize: 18, fontWeight: '600', color: RENKLER.gece, paddingHorizontal: 24, marginBottom: 4 },
  modalAltBaslik: { fontSize: 13, color: RENKLER.komurAcik, paddingHorizontal: 24, marginBottom: 16 },
  modalInput: { marginHorizontal: 16, padding: 15, backgroundColor: RENKLER.beyaz, borderRadius: 14, borderWidth: 1.5, borderColor: RENKLER.gulAcik, fontSize: 16, color: RENKLER.gece, marginBottom: 12 },
  modalKaydetBtn: { marginHorizontal: 16, padding: 15, backgroundColor: RENKLER.gece, borderRadius: 14, alignItems: 'center', marginBottom: 8 },
  modalKaydetYazi: { color: RENKLER.beyaz, fontSize: 16, fontWeight: '600' },
  modalIptalBtn: { alignItems: 'center', padding: 12 },
  modalIptalYazi: { fontSize: 15, color: RENKLER.komurAcik },

  // Sil onay modal
  silUyariWrap: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, gap: 8 },
  silUyariIkon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(192,57,43,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  silUyariBaslik: { fontSize: 18, fontWeight: '700', color: RENKLER.kirmizi },
  silUyariAlt: { fontSize: 14, color: RENKLER.komurAcik, textAlign: 'center', lineHeight: 22 },
  silYazmaAciklama: { fontSize: 14, color: RENKLER.komurAcik, paddingHorizontal: 24, marginBottom: 8, textAlign: 'center' },
  silInput: { borderColor: 'rgba(192,57,43,0.3)', textAlign: 'center', fontSize: 18, fontWeight: '700', letterSpacing: 3, color: RENKLER.kirmizi },
  silInputAktif: { borderColor: RENKLER.kirmizi },
  silBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: RENKLER.kirmizi },
  silBtnPasif: { backgroundColor: 'rgba(192,57,43,0.3)' },
  silBtnYazi: { color: RENKLER.beyaz, fontSize: 16, fontWeight: '600' },
});
