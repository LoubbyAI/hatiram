import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, TextInput, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAlbum, Album, Kisi } from '../../context/AlbumContext';

const { width } = Dimensions.get('window');

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  altin: '#D4AF37', antik: '#F9F7F2', antik2: '#F0ECE4',
  komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF',
};

type IonIconName = React.ComponentProps<typeof Ionicons>['name'];

const KATEGORILER = ['Tümü', 'Günlük', 'Büyüme', 'Tatil', 'Aile', 'Okul', 'Spor & Aktivite', 'Doğum Günü', 'Özel Günler'];
const KATEGORI_ETIKETLER: Record<string, string[]> = {
  'Günlük': ['Günlük'], 'Büyüme': ['Büyüme'], 'Tatil': ['Tatil'],
  'Aile': ['Aile'], 'Okul': ['Okul'], 'Spor & Aktivite': ['Spor & Aktivite'],
  'Doğum Günü': ['Doğum Günü'], 'Özel Günler': ['Özel Günler'],
};

const ALBUM_SABLONLARI = [
  { etiket: 'Günlük',          renk: '#FDF0EB', ikon: 'sunny-outline' as IonIconName,          ikonRenk: '#C0634E' },
  { etiket: 'Doğum Günü',     renk: '#EEF0FB', ikon: 'gift-outline' as IonIconName,            ikonRenk: '#5B6BBF' },
  { etiket: 'Tatil',           renk: '#EAF4EC', ikon: 'airplane-outline' as IonIconName,        ikonRenk: '#3A7D52' },
  { etiket: 'Aile',            renk: '#EAF2FB', ikon: 'people-outline' as IonIconName,          ikonRenk: '#2E6EA6' },
  { etiket: 'Okul',            renk: '#FFF0F3', ikon: 'school-outline' as IonIconName,          ikonRenk: '#B03060' },
  { etiket: 'Spor & Aktivite', renk: '#EDFAF3', ikon: 'basketball-outline' as IonIconName,     ikonRenk: '#1F7A4A' },
  { etiket: 'Özel Günler',     renk: '#FFFBEA', ikon: 'sparkles-outline' as IonIconName,       ikonRenk: '#B58A00' },
  { etiket: 'Büyüme',          renk: '#F3EEFB', ikon: 'trending-up-outline' as IonIconName,    ikonRenk: '#7B52BF' },
];

// Kişi avatar baş harfi
function kisiInitial(ad: string) {
  return ad.trim().charAt(0).toUpperCase();
}

function KisiChip({ kisi, secili, onPress }: { kisi: Kisi; secili: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[kisiStil.chip, secili && { borderColor: kisi.ikonRenk, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[kisiStil.avatar, { backgroundColor: secili ? kisi.ikonRenk : kisi.renk }]}>
        <Text style={[kisiStil.avatarHarf, { color: secili ? RENKLER.beyaz : kisi.ikonRenk }]}>
          {kisiInitial(kisi.ad)}
        </Text>
      </View>
      <Text style={[kisiStil.ad, secili && { color: kisi.ikonRenk, fontWeight: '600' }]}>
        {kisi.ad}
      </Text>
    </TouchableOpacity>
  );
}

function AlbumKart({ album, kapakUri, sayi, buyuk = false, onLongPress, kisi }: {
  album: Album; kapakUri?: string; sayi: number; buyuk?: boolean; onLongPress?: () => void; kisi?: Kisi;
}) {
  return (
    <TouchableOpacity
      style={[styles.albumKartWrap, buyuk && styles.albumKartWrapBuyuk]}
      activeOpacity={0.85}
      onPress={() => router.push(`/album/${album.id}`)}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      <View style={[styles.stackAlt2, { backgroundColor: RENKLER.antik2 }]} />
      <View style={[styles.stackAlt1, { backgroundColor: RENKLER.antik2 }]} />
      <View style={styles.albumKart}>
        <View style={[styles.albumGorsel, buyuk && styles.albumGorselBuyuk, { backgroundColor: album.renk }]}>
          {kapakUri ? (
            <Image source={{ uri: kapakUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.albumPlaceholder}>
              <View style={styles.donemDaire}>
                <Ionicons name={album.ikon as IonIconName} size={buyuk ? 28 : 22} color={album.ikonRenk} />
              </View>
              <Text style={[styles.donemEtiket, { color: album.ikonRenk }]}>{album.etiket.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.gorselOverlay} />
          <View style={styles.fotoRozet}>
            <Text style={styles.fotoRozetYazi}>{sayi} kare</Text>
          </View>
        </View>
        <View style={[styles.albumBilgi, buyuk && styles.albumBilgiBuyuk]}>
          <Text style={[styles.albumAd, buyuk && styles.albumAdBuyuk]}>{album.ad}</Text>
          {kisi && (
            <View style={styles.kisiEtiket}>
              <View style={[styles.kisiEtiketDot, { backgroundColor: kisi.ikonRenk }]} />
              <Text style={[styles.kisiEtiketYazi, { color: kisi.ikonRenk }]}>{kisi.ad}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function KategoriSecici({ secili, onChange }: { secili: number; onChange: (i: number) => void }) {
  return (
    <View style={katSec.grid}>
      {ALBUM_SABLONLARI.map((s, i) => (
        <TouchableOpacity
          key={i}
          style={[katSec.kart, { backgroundColor: s.renk }, secili === i && { borderColor: s.ikonRenk, borderWidth: 2 }]}
          onPress={() => onChange(i)}
          activeOpacity={0.8}
        >
          <View style={[katSec.ikonDaire, { backgroundColor: s.ikonRenk + '20' }]}>
            <Ionicons name={s.ikon} size={22} color={s.ikonRenk} />
          </View>
          <Text style={[katSec.ad, { color: s.ikonRenk }]}>{s.etiket}</Text>
          {secili === i && (
            <View style={[katSec.checkDaire, { backgroundColor: s.ikonRenk }]}>
              <Ionicons name="checkmark" size={10} color={RENKLER.beyaz} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function KisiSecici({ seciliKisiId, onChange, kisiler }: {
  seciliKisiId: string | undefined;
  onChange: (id: string | undefined) => void;
  kisiler: Kisi[];
}) {
  const { kisiEkle } = useAlbum();
  const [ekleAcik, setEkleAcik] = useState(false);
  const [yeniAd, setYeniAd] = useState('');

  const hizliEkle = async () => {
    if (!yeniAd.trim()) return;
    await kisiEkle(yeniAd.trim());
    setYeniAd('');
    setEkleAcik(false);
  };

  return (
    <View style={kisiSecStil.wrap}>
      <Text style={kisiSecStil.baslik}>KİŞİ (İSTEĞE BAĞLI)</Text>

      {ekleAcik ? (
        <View style={kisiSecStil.ekleWrap}>
          <TextInput
            style={kisiSecStil.ekleInput}
            value={yeniAd}
            onChangeText={setYeniAd}
            placeholder="Kişi adı..."
            placeholderTextColor={RENKLER.gulAcik}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={hizliEkle}
          />
          <TouchableOpacity style={kisiSecStil.ekleKaydet} onPress={hizliEkle}>
            <Ionicons name="checkmark" size={18} color={RENKLER.beyaz} />
          </TouchableOpacity>
          <TouchableOpacity style={kisiSecStil.ekleIptal} onPress={() => { setEkleAcik(false); setYeniAd(''); }}>
            <Ionicons name="close" size={18} color={RENKLER.komurAcik} />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={kisiSecStil.satir}>
          <TouchableOpacity
            style={[kisiSecStil.chip, !seciliKisiId && kisiSecStil.chipSecili]}
            onPress={() => onChange(undefined)}
          >
            <Ionicons name="people-outline" size={14} color={!seciliKisiId ? RENKLER.beyaz : RENKLER.komurAcik} />
            <Text style={[kisiSecStil.chipYazi, !seciliKisiId && kisiSecStil.chipYaziSecili]}>Aile Geneli</Text>
          </TouchableOpacity>
          {kisiler.map(k => (
            <TouchableOpacity
              key={k.id}
              style={[kisiSecStil.chip, seciliKisiId === k.id && { backgroundColor: k.ikonRenk, borderColor: k.ikonRenk }]}
              onPress={() => onChange(seciliKisiId === k.id ? undefined : k.id)}
            >
              <View style={[kisiSecStil.dot, { backgroundColor: seciliKisiId === k.id ? RENKLER.beyaz : k.ikonRenk }]} />
              <Text style={[kisiSecStil.chipYazi, seciliKisiId === k.id && { color: RENKLER.beyaz, fontWeight: '600' }]}>
                {k.ad}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={kisiSecStil.ekleChip} onPress={() => setEkleAcik(true)}>
            <Ionicons name="person-add-outline" size={14} color={RENKLER.gul} />
            <Text style={kisiSecStil.ekleChipYazi}>Kişi Ekle</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

function YeniAlbumModal({ gorünür, onKapat }: { gorünür: boolean; onKapat: () => void }) {
  const { albumEkle, kisiler } = useAlbum();
  const [ad, setAd] = useState('');
  const [seciliSablon, setSeciliSablon] = useState(0);
  const [seciliKisiId, setSeciliKisiId] = useState<string | undefined>(undefined);

  const olustur = async () => {
    if (!ad.trim()) { Alert.alert('Albüm adı gerekli'); return; }
    const sablon = ALBUM_SABLONLARI[seciliSablon];
    await albumEkle({
      ad: ad.trim(), etiket: sablon.etiket, renk: sablon.renk,
      ikon: sablon.ikon, ikonRenk: sablon.ikonRenk, kisiId: seciliKisiId,
    });
    setAd(''); setSeciliSablon(0); setSeciliKisiId(undefined);
    onKapat();
  };

  return (
    <Modal visible={gorünür} transparent animationType="slide" onRequestClose={onKapat}>
      <KeyboardAvoidingView style={modal.kaplama} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={modal.arkaplan} activeOpacity={1} onPress={onKapat} />
        <View style={modal.kart}>
          <View style={modal.tutamac} />
          <Text style={modal.baslik}>Yeni Albüm</Text>
          <TextInput
            style={modal.input}
            placeholder="Albüm adı..."
            placeholderTextColor={RENKLER.gulAcik}
            value={ad}
            onChangeText={setAd}
            autoFocus
          />
          <KisiSecici seciliKisiId={seciliKisiId} onChange={setSeciliKisiId} kisiler={kisiler} />
          <Text style={modal.etiketBaslik}>KATEGORİ SEÇ</Text>
          <KategoriSecici secili={seciliSablon} onChange={setSeciliSablon} />
          <TouchableOpacity style={modal.btn} onPress={olustur} activeOpacity={0.85}>
            <Text style={modal.btnYazi}>Albümü Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modal.iptal} onPress={onKapat}>
            <Text style={modal.iptalYazi}>İptal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function DuzenleModal({ album, gorünür, onKapat }: { album: Album | null; gorünür: boolean; onKapat: () => void }) {
  const { albumGuncelle, albumSil, kisiler } = useAlbum();
  const [ad, setAd] = useState('');
  const [seciliSablon, setSeciliSablon] = useState(0);
  const [seciliKisiId, setSeciliKisiId] = useState<string | undefined>(undefined);

  const onShow = () => {
    if (album) {
      setAd(album.ad);
      const idx = ALBUM_SABLONLARI.findIndex(s => s.ikon === album.ikon);
      setSeciliSablon(idx >= 0 ? idx : 0);
      setSeciliKisiId(album.kisiId);
    }
  };

  const kaydet = async () => {
    if (!album) return;
    if (!ad.trim()) { Alert.alert('Albüm adı gerekli'); return; }
    const sablon = ALBUM_SABLONLARI[seciliSablon];
    await albumGuncelle(album.id, {
      ad: ad.trim(), etiket: sablon.etiket, renk: sablon.renk,
      ikon: sablon.ikon, ikonRenk: sablon.ikonRenk, kisiId: seciliKisiId,
    });
    onKapat();
  };

  const silOnay = () => {
    if (!album) return;
    Alert.alert('Albümü Sil', `"${album.ad}" albümü ve tüm fotoğrafları silinecek. Emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => { await albumSil(album.id); onKapat(); } },
    ]);
  };

  return (
    <Modal visible={gorünür} transparent animationType="slide" onRequestClose={onKapat} onShow={onShow}>
      <KeyboardAvoidingView style={modal.kaplama} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={modal.arkaplan} activeOpacity={1} onPress={onKapat} />
        <View style={modal.kart}>
          <View style={modal.tutamac} />
          <View style={duzenleModal.headerSatir}>
            <Text style={modal.baslik}>Albümü Düzenle</Text>
            <TouchableOpacity style={duzenleModal.silBtn} onPress={silOnay}>
              <Ionicons name="trash-outline" size={18} color="#C0392B" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={modal.input}
            placeholder="Albüm adı..."
            placeholderTextColor={RENKLER.gulAcik}
            value={ad}
            onChangeText={setAd}
          />
          <KisiSecici seciliKisiId={seciliKisiId} onChange={setSeciliKisiId} kisiler={kisiler} />
          <Text style={modal.etiketBaslik}>KATEGORİ SEÇ</Text>
          <KategoriSecici secili={seciliSablon} onChange={setSeciliSablon} />
          <TouchableOpacity style={modal.btn} onPress={kaydet} activeOpacity={0.85}>
            <Text style={modal.btnYazi}>Kaydet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modal.iptal} onPress={onKapat}>
            <Text style={modal.iptalYazi}>İptal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function Albumler() {
  const insets = useSafeAreaInsets();
  const { albumler, albumFotolari, kisiler } = useAlbum();
  const [aktifKategori, setAktifKategori] = useState(0);
  const [seciliKisiId, setSeciliKisiId] = useState<string | null>(null);
  const [yeniAlbumAcik, setYeniAlbumAcik] = useState(false);
  const [aramaAcik, setAramaAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [duzenleAlbum, setDuzenleAlbum] = useState<Album | null>(null);

  const sonFoto = (albumId: string) => albumFotolari(albumId)[0]?.uri;
  const fotoSayisi = (albumId: string) => albumFotolari(albumId).length;
  const toplamFoto = albumler.reduce((t, a) => t + fotoSayisi(a.id), 0);
  const kisiById = (id?: string) => kisiler.find(k => k.id === id);

  const filtreliAlbumler = (() => {
    let liste = albumler;
    if (seciliKisiId) liste = liste.filter(a => a.kisiId === seciliKisiId);
    if (aramaMetni.trim()) {
      liste = liste.filter(a => a.ad.toLowerCase().includes(aramaMetni.toLowerCase()));
    } else if (aktifKategori > 0) {
      const etiketler = KATEGORI_ETIKETLER[KATEGORILER[aktifKategori]] ?? [];
      liste = liste.filter(a => etiketler.includes(a.etiket));
    }
    return liste;
  })();

  const sonFotolar = albumler
    .map(a => ({ album: a, uri: sonFoto(a.id) }))
    .filter(x => x.uri)
    .slice(0, 8);

  const aramayiKapat = () => { setAramaAcik(false); setAramaMetni(''); };

  const kisiSec = (id: string) => {
    setSeciliKisiId(prev => prev === id ? null : id);
    setAktifKategori(0);
  };

  return (
    <View style={styles.kapsayici}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {aramaAcik ? (
            <View style={styles.aramaWrap}>
              <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.aramaInput}
                placeholder="Albüm ara..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={aramaMetni}
                onChangeText={setAramaMetni}
                autoFocus
              />
              <TouchableOpacity onPress={aramayiKapat}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ flex: 1 }}>
                <Text style={styles.selamlama}>Merhaba 👋</Text>
                <Text style={styles.baslik}>Hatıralarım</Text>
                {albumler.length > 0 && (
                  <Text style={styles.istatistik}>{albumler.length} albüm · {toplamFoto} fotoğraf</Text>
                )}
              </View>
              <View style={styles.headerSag}>
                <TouchableOpacity style={styles.ikonBtn} onPress={() => setAramaAcik(true)}>
                  <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.ikonBtn} onPress={() => setYeniAlbumAcik(true)}>
                  <Ionicons name="add" size={20} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.gizlilikCubugu}>
          <View style={styles.gizlilikDot} />
          <Text style={styles.gizlilikYazi}>Anıların yalnızca bu telefonda · Bulut yok</Text>
        </View>

        {/* Kişi filtresi */}
        {kisiler.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kisiScroll} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
            {kisiler.map(k => (
              <KisiChip key={k.id} kisi={k} secili={seciliKisiId === k.id} onPress={() => kisiSec(k.id)} />
            ))}
          </ScrollView>
        )}

        {/* Kategori filtresi */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kategoriScroll} contentContainerStyle={{ paddingHorizontal: 14 }}>
          {KATEGORILER.map((k, i) => (
            <TouchableOpacity key={k} style={[styles.sek, aktifKategori === i && styles.sekAktif]} onPress={() => { setAktifKategori(i); setSeciliKisiId(null); }}>
              <Text style={[styles.sekYazi, aktifKategori === i && styles.sekYaziAktif]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.icerik} showsVerticalScrollIndicator={false}>
        {filtreliAlbumler.length === 0 && aramaMetni.trim() ? (
          <View style={bosDurum.wrap}>
            <Ionicons name="search-outline" size={48} color={RENKLER.gulAcik} />
            <Text style={bosDurum.baslik}>Sonuç bulunamadı</Text>
            <Text style={bosDurum.alt}>"{aramaMetni}" ile eşleşen albüm yok</Text>
          </View>
        ) : albumler.length === 0 ? (
          <View style={bosDurum.wrap}>
            <View style={bosDurum.cercevelerWrap}>
              <View style={bosDurum.k3} />
              <View style={bosDurum.k2} />
              <View style={bosDurum.k1}>
                <Ionicons name="images-outline" size={36} color={RENKLER.gulAcik} />
              </View>
            </View>
            <Text style={bosDurum.baslik}>Henüz hiç anın yok</Text>
            <Text style={bosDurum.alt}>İlk albümünü oluştur ve anılarını toplamaya başla</Text>
            <TouchableOpacity style={bosDurum.btn} onPress={() => setYeniAlbumAcik(true)} activeOpacity={0.85}>
              <Ionicons name="add" size={18} color={RENKLER.beyaz} />
              <Text style={bosDurum.btnYazi}>İlk Albümü Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {sonFotolar.length > 0 && !seciliKisiId && aktifKategori === 0 && (
              <>
                <View style={styles.bolumSatir}>
                  <Text style={styles.bolumBaslik}>Son Eklenenler</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sonListe} contentContainerStyle={{ paddingHorizontal: 16 }}>
                  {sonFotolar.map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.sonFoto} activeOpacity={0.85} onPress={() => router.push(`/album/${item.album.id}`)}>
                      <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                      <View style={styles.sonFotoOverlay} />
                      <Text style={styles.sonFotoEtiket}>{item.album.ad}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {(aktifKategori > 0 || seciliKisiId) && (
              <View style={styles.bolumSatir}>
                <Text style={styles.bolumBaslik}>
                  {seciliKisiId ? kisiler.find(k => k.id === seciliKisiId)?.ad : KATEGORILER[aktifKategori]}
                </Text>
                <Text style={styles.bolumLink}>{filtreliAlbumler.length} albüm</Text>
              </View>
            )}

            {filtreliAlbumler.length === 0 && (aktifKategori > 0 || seciliKisiId) && (
              <View style={styles.kategoriBosDurum}>
                <Ionicons name="folder-open-outline" size={40} color={RENKLER.gulAcik} />
                <Text style={styles.kategoriBosYazi}>
                  {seciliKisiId ? 'Bu kişiye ait albüm yok' : 'Bu kategoride albüm yok'}
                </Text>
                <Text style={styles.kategoriBosAlt}>
                  {seciliKisiId
                    ? 'Albüm oluştururken bu kişiyi seçebilirsin'
                    : 'Albüm oluştururken bu kategoriye ait simge seç'}
                </Text>
              </View>
            )}

            <View style={styles.albumIzgara}>
              {filtreliAlbumler.map((album, idx) => (
                idx === 0 ? (
                  <AlbumKart key={album.id} album={album} kapakUri={sonFoto(album.id)} sayi={fotoSayisi(album.id)} buyuk kisi={kisiById(album.kisiId)} onLongPress={() => setDuzenleAlbum(album)} />
                ) : idx % 2 === 1 ? (
                  <View key={album.id} style={styles.albumSatir}>
                    <View style={styles.albumYarim}>
                      <AlbumKart album={album} kapakUri={sonFoto(album.id)} sayi={fotoSayisi(album.id)} kisi={kisiById(album.kisiId)} onLongPress={() => setDuzenleAlbum(album)} />
                    </View>
                    {filtreliAlbumler[idx + 1] ? (
                      <View style={styles.albumYarim}>
                        <AlbumKart album={filtreliAlbumler[idx + 1]} kapakUri={sonFoto(filtreliAlbumler[idx + 1].id)} sayi={fotoSayisi(filtreliAlbumler[idx + 1].id)} kisi={kisiById(filtreliAlbumler[idx + 1].kisiId)} onLongPress={() => setDuzenleAlbum(filtreliAlbumler[idx + 1])} />
                      </View>
                    ) : <View style={styles.albumYarim} />}
                  </View>
                ) : null
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.yeniAlbumBtn} onPress={() => setYeniAlbumAcik(true)}>
          <Ionicons name="add" size={18} color={RENKLER.gul} />
          <Text style={styles.yeniAlbumYazi}>Yeni Albüm Aç</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <YeniAlbumModal gorünür={yeniAlbumAcik} onKapat={() => setYeniAlbumAcik(false)} />
      <DuzenleModal album={duzenleAlbum} gorünür={!!duzenleAlbum} onKapat={() => setDuzenleAlbum(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.antik },
  headerWrap: { backgroundColor: RENKLER.gece },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  selamlama: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  baslik: { fontSize: 22, fontWeight: '700', color: RENKLER.beyaz, marginTop: 2 },
  headerSag: { flexDirection: 'row', gap: 8, marginTop: 4 },
  ikonBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  istatistik: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  aramaWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  aramaInput: { flex: 1, fontSize: 15, color: RENKLER.beyaz },
  gizlilikCubugu: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  gizlilikDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RENKLER.altin },
  gizlilikYazi: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  kisiScroll: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  kategoriScroll: { paddingVertical: 12 },
  sek: { paddingHorizontal: 12, paddingVertical: 7, marginRight: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sekAktif: { backgroundColor: RENKLER.altin, borderColor: RENKLER.altin },
  sekYazi: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  sekYaziAktif: { color: RENKLER.gece, fontWeight: '600' },
  icerik: { flex: 1 },
  bolumSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  bolumBaslik: { fontSize: 17, fontWeight: '700', color: RENKLER.gece },
  bolumLink: { fontSize: 13, color: RENKLER.gul, fontWeight: '500' },
  kategoriBosDurum: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40, gap: 10 },
  kategoriBosYazi: { fontSize: 16, fontWeight: '600', color: RENKLER.gece },
  kategoriBosAlt: { fontSize: 13, color: RENKLER.komurAcik, textAlign: 'center', lineHeight: 20 },
  sonListe: { marginBottom: 4 },
  sonFoto: { width: 76, height: 76, borderRadius: 13, marginRight: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(166,123,113,0.15)', position: 'relative' },
  sonFotoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: 'rgba(26,46,68,0.55)' },
  sonFotoEtiket: { position: 'absolute', bottom: 6, left: 0, right: 0, color: RENKLER.beyaz, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  albumIzgara: { paddingHorizontal: 16, gap: 12 },
  albumSatir: { flexDirection: 'row', gap: 12 },
  albumYarim: { flex: 1 },
  albumKartWrap: { position: 'relative', marginBottom: 8 },
  albumKartWrapBuyuk: { width: '100%' },
  stackAlt2: { position: 'absolute', bottom: -8, left: 12, right: 12, top: 8, borderRadius: 20, opacity: 0.4, borderWidth: 1, borderColor: 'rgba(166,123,113,0.1)' },
  stackAlt1: { position: 'absolute', bottom: -4, left: 6, right: 6, top: 4, borderRadius: 20, opacity: 0.7, borderWidth: 1, borderColor: 'rgba(166,123,113,0.18)' },
  albumKart: { backgroundColor: RENKLER.beyaz, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(166,123,113,0.15)', shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  albumGorsel: { height: 110, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  albumGorselBuyuk: { height: 150 },
  albumPlaceholder: { alignItems: 'center', gap: 6 },
  donemDaire: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  donemEtiket: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  gorselOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(26,46,68,0.15)' },
  fotoRozet: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(26,46,68,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  fotoRozetYazi: { color: RENKLER.beyaz, fontSize: 11, fontWeight: '600' },
  albumBilgi: { padding: 12 },
  albumBilgiBuyuk: { padding: 14 },
  albumAd: { fontSize: 14, fontWeight: '600', color: RENKLER.gece, marginBottom: 3 },
  albumAdBuyuk: { fontSize: 17 },
  kisiEtiket: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  kisiEtiketDot: { width: 6, height: 6, borderRadius: 3 },
  kisiEtiketYazi: { fontSize: 11, fontWeight: '500' },
  yeniAlbumBtn: { margin: 16, padding: 16, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(166,123,113,0.3)', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  yeniAlbumYazi: { fontSize: 14, fontWeight: '500', color: RENKLER.gul },
});

const bosDurum = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 40, paddingBottom: 16 },
  cercevelerWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 28, position: 'relative' },
  k3: { position: 'absolute', width: 120, height: 120, borderRadius: 22, backgroundColor: RENKLER.antik2, opacity: 0.5, transform: [{ rotate: '8deg' }], borderWidth: 1, borderColor: 'rgba(166,123,113,0.12)' },
  k2: { position: 'absolute', width: 120, height: 120, borderRadius: 22, backgroundColor: RENKLER.antik2, opacity: 0.75, transform: [{ rotate: '3deg' }], borderWidth: 1, borderColor: 'rgba(166,123,113,0.2)' },
  k1: { width: 120, height: 120, borderRadius: 22, backgroundColor: RENKLER.beyaz, borderWidth: 1, borderColor: 'rgba(166,123,113,0.25)', alignItems: 'center', justifyContent: 'center', shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  baslik: { fontSize: 18, fontWeight: '700', color: RENKLER.gece, textAlign: 'center', marginBottom: 8 },
  alt: { fontSize: 14, color: RENKLER.komurAcik, textAlign: 'center', lineHeight: 22, marginBottom: 28, maxWidth: 260 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: RENKLER.gece, borderRadius: 16, shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  btnYazi: { color: RENKLER.beyaz, fontSize: 15, fontWeight: '600' },
});

const modal = StyleSheet.create({
  kaplama: { flex: 1, justifyContent: 'flex-end' },
  arkaplan: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,46,68,0.5)' },
  kart: { backgroundColor: RENKLER.antik, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(166,123,113,0.2)' },
  tutamac: { width: 40, height: 4, backgroundColor: RENKLER.antik2, borderRadius: 2, alignSelf: 'center', margin: 16 },
  baslik: { fontSize: 20, fontWeight: '600', color: RENKLER.gece, paddingHorizontal: 24, marginBottom: 16 },
  input: { marginHorizontal: 16, padding: 15, backgroundColor: RENKLER.beyaz, borderRadius: 14, borderWidth: 1.5, borderColor: RENKLER.gulAcik, fontSize: 16, color: RENKLER.gece, marginBottom: 16 },
  etiketBaslik: { fontSize: 12, fontWeight: '600', color: RENKLER.komurAcik, paddingHorizontal: 24, marginBottom: 10, letterSpacing: 0.5 },
  btn: { marginHorizontal: 16, marginTop: 20, padding: 15, backgroundColor: RENKLER.gece, borderRadius: 14, alignItems: 'center' },
  btnYazi: { color: RENKLER.beyaz, fontSize: 16, fontWeight: '600' },
  iptal: { alignItems: 'center', padding: 12 },
  iptalYazi: { fontSize: 15, color: RENKLER.komurAcik },
});

const duzenleModal = StyleSheet.create({
  headerSatir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20, marginBottom: 0 },
  silBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(192,57,43,0.1)', alignItems: 'center', justifyContent: 'center' },
});

const katSec = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  kart: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent', position: 'relative' },
  ikonDaire: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ad: { fontSize: 13, fontWeight: '600', flex: 1 },
  checkDaire: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

const kisiStil = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, borderWidth: 1.5, borderColor: 'transparent' },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarHarf: { fontSize: 11, fontWeight: '700' },
  ad: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
});

const kisiSecStil = StyleSheet.create({
  wrap: { marginBottom: 4 },
  baslik: { fontSize: 12, fontWeight: '600', color: RENKLER.komurAcik, paddingHorizontal: 24, marginBottom: 8, letterSpacing: 0.5 },
  satir: { paddingHorizontal: 16, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: RENKLER.beyaz, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(166,123,113,0.2)' },
  chipSecili: { backgroundColor: RENKLER.gece, borderColor: RENKLER.gece },
  chipYazi: { fontSize: 13, fontWeight: '500', color: RENKLER.komurAcik },
  chipYaziSecili: { color: RENKLER.beyaz, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ekleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: RENKLER.beyaz, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(166,123,113,0.4)' },
  ekleChipYazi: { fontSize: 13, fontWeight: '500', color: RENKLER.gul },
  ekleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  ekleInput: { flex: 1, padding: 10, backgroundColor: RENKLER.beyaz, borderRadius: 12, borderWidth: 1.5, borderColor: RENKLER.gulAcik, fontSize: 15, color: RENKLER.gece },
  ekleKaydet: { width: 36, height: 36, borderRadius: 18, backgroundColor: RENKLER.gece, alignItems: 'center', justifyContent: 'center' },
  ekleIptal: { width: 36, height: 36, borderRadius: 18, backgroundColor: RENKLER.antik2, alignItems: 'center', justifyContent: 'center' },
});
