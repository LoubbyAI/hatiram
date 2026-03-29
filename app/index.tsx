import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', gulAcik: '#C4A09A',
  gulCokAcik: '#F5EDEB', altin: '#D4AF37', antik: '#F9F7F2',
  antik2: '#F0ECE4', komur: '#2D2D2D', komurAcik: '#6B6B6B', beyaz: '#FFFFFF',
};

type IonIconName = React.ComponentProps<typeof Ionicons>['name'];

const ONBOARDING = [
  {
    baslik: "Hatıram'a\nHoş Geldin",
    aciklama: "Çocuklarınızın fotoğrafları her yere dağılmış mı? Artık her kıymetli an kendi albümünde, düzenli ve huzurlu.",
    ikon: 'images-outline' as IonIconName,
    ikonRenk: '#A67B71',
    rozetler: ['camera-outline', 'heart-outline', 'star-outline'] as IonIconName[],
  },
  {
    baslik: "Albümlerini\nDüzenle",
    aciklama: "Fotoğraflarını kategorilere ayır, istediğin zaman bul. Galeri, kamera — hepsi tek yerde.",
    ikon: 'folder-open-outline' as IonIconName,
    ikonRenk: '#6B7AAA',
    rozetler: ['grid-outline', 'albums-outline', 'bookmark-outline'] as IonIconName[],
  },
  {
    baslik: "Fotoğrafların\nSadece Sende",
    aciklama: "Bulut yok. Sunucu yok. Fotoğrafların yalnızca senin telefonunda durur.",
    ikon: 'lock-closed-outline' as IonIconName,
    ikonRenk: '#5A7A5C',
    rozetler: ['shield-checkmark-outline', 'phone-portrait-outline', 'eye-off-outline'] as IonIconName[],
  },
];

function IlustrasYon({ ikon, ikonRenk, rozetler }: {
  ikon: IonIconName; ikonRenk: string; rozetler: IonIconName[];
}) {
  return (
    <View style={[ilustr.dis, { borderColor: ikonRenk + '20' }]}>
      {/* Arka dekoratif halkalar */}
      <View style={[ilustr.halka2, { borderColor: ikonRenk + '15' }]} />
      <View style={[ilustr.halka1, { borderColor: ikonRenk + '25' }]} />

      {/* Ana ikon kutusu */}
      <View style={[ilustr.merkez, { backgroundColor: ikonRenk + '12' }]}>
        <View style={[ilustr.merkezIc, { backgroundColor: ikonRenk + '20' }]}>
          <View style={[ilustr.ikonDaire, { backgroundColor: ikonRenk }]}>
            <Ionicons name={ikon} size={38} color={RENKLER.beyaz} />
          </View>
        </View>
      </View>

      {/* Köşe rozetleri */}
      <View style={[ilustr.rozet, ilustr.rozetSolUst, { backgroundColor: ikonRenk + '15', borderColor: ikonRenk + '30' }]}>
        <Ionicons name={rozetler[0]} size={14} color={ikonRenk} />
      </View>
      <View style={[ilustr.rozet, ilustr.rozetSagUst, { backgroundColor: ikonRenk + '15', borderColor: ikonRenk + '30' }]}>
        <Ionicons name={rozetler[1]} size={14} color={ikonRenk} />
      </View>
      <View style={[ilustr.rozet, ilustr.rozetAlt, { backgroundColor: ikonRenk + '15', borderColor: ikonRenk + '30' }]}>
        <Ionicons name={rozetler[2]} size={14} color={ikonRenk} />
      </View>

      {/* Dekoratif noktalar */}
      <View style={[ilustr.nokta, { top: 18, left: 38, backgroundColor: ikonRenk, opacity: 0.3 }]} />
      <View style={[ilustr.nokta, { top: 30, right: 32, backgroundColor: ikonRenk, opacity: 0.2 }]} />
      <View style={[ilustr.nokta, { bottom: 22, left: 30, backgroundColor: ikonRenk, opacity: 0.25 }]} />
    </View>
  );
}

export default function Onboarding() {
  const [adim, setAdim] = useState(0);
  const sonAdim = adim === ONBOARDING.length - 1;

  const ileri = () => {
    if (sonAdim) { router.replace('/(tabs)'); return; }
    setAdim(adim + 1);
  };
  const geri = () => { if (adim > 0) setAdim(adim - 1); };

  const ekran = ONBOARDING[adim];

  return (
    <SafeAreaView style={styles.kapsayici}>
      <View style={styles.icerik}>
        <IlustrasYon ikon={ekran.ikon} ikonRenk={ekran.ikonRenk} rozetler={ekran.rozetler} />
        <Text style={styles.baslik}>
          {ekran.baslik.split('\n').map((satir, i) =>
            i === 1 ? <Text key={i} style={styles.italik}>{'\n'}{satir}</Text> : satir
          )}
        </Text>
        <Text style={styles.aciklama}>{ekran.aciklama}</Text>

        <View style={styles.noktalar}>
          {ONBOARDING.map((_, i) => (
            <View key={i} style={[styles.nokta, i === adim && styles.noktaAktif]} />
          ))}
        </View>

        <TouchableOpacity style={styles.btnAna} onPress={ileri} activeOpacity={0.85}>
          <Text style={styles.btnAnaYazi}>{sonAdim ? 'Başla →' : 'Devam →'}</Text>
        </TouchableOpacity>

        {adim > 0 && (
          <TouchableOpacity onPress={geri} style={styles.btnGeri}>
            <Text style={styles.btnGeriYazi}>← Geri</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const ilustr = StyleSheet.create({
  dis: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 32, position: 'relative', borderRadius: 100, borderWidth: 1 },
  halka2: { position: 'absolute', width: 176, height: 176, borderRadius: 88, borderWidth: 1 },
  halka1: { position: 'absolute', width: 152, height: 152, borderRadius: 76, borderWidth: 1.5 },
  merkez: { width: 124, height: 124, borderRadius: 62, alignItems: 'center', justifyContent: 'center' },
  merkezIc: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  ikonDaire: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  rozet: { position: 'absolute', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  rozetSolUst: { top: 16, left: 16 },
  rozetSagUst: { top: 16, right: 16 },
  rozetAlt: { bottom: 16, right: 40 },
  nokta: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
});

const styles = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.antik },
  icerik: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  baslik: { fontFamily: 'serif', fontSize: 28, fontWeight: '700', color: RENKLER.gece, textAlign: 'center', marginBottom: 14, lineHeight: 36 },
  italik: { fontStyle: 'italic', color: RENKLER.gul },
  aciklama: { fontSize: 15, color: RENKLER.komurAcik, textAlign: 'center', lineHeight: 24, marginBottom: 48, maxWidth: 280 },
  noktalar: { flexDirection: 'row', gap: 8, marginBottom: 36 },
  nokta: { width: 8, height: 8, borderRadius: 4, backgroundColor: RENKLER.antik2, borderWidth: 1, borderColor: RENKLER.gulAcik },
  noktaAktif: { width: 26, borderRadius: 4, backgroundColor: RENKLER.gece, borderColor: RENKLER.gece },
  btnAna: { width: '100%', paddingVertical: 17, backgroundColor: RENKLER.gece, borderRadius: 18, alignItems: 'center', marginBottom: 10 },
  btnDeaktif: { opacity: 0.4 },
  btnAnaYazi: { color: RENKLER.beyaz, fontSize: 17, fontWeight: '600' },
  btnGeri: { paddingVertical: 14 },
  btnGeriYazi: { color: RENKLER.komurAcik, fontSize: 15 },
  input: { width: '100%', paddingVertical: 15, paddingHorizontal: 18, backgroundColor: RENKLER.beyaz, borderRadius: 14, borderWidth: 1.5, borderColor: RENKLER.gulAcik, fontSize: 18, color: RENKLER.gece, textAlign: 'center', marginBottom: 32 },
});
