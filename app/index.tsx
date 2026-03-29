import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';

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

const ONBOARDING = [
  {
    baslik: "Hatıram'a\nHoş Geldin",
    aciklama: "Çocuklarınızın fotoğrafları her yere dağılmış mı? Artık her kıymetli an kendi albümünde, düzenli ve huzurlu.",
    ikon: '📸',
  },
  {
    baslik: "Galerini bir kerede\ndüzenle",
    aciklama: "Fotoğrafların çekim tarihini okuyarak hangi albüme ait olduğunu önerir. Sen sadece onayla.",
    ikon: '🗂️',
  },
  {
    baslik: "Fotoğrafların\nsadece sende",
    aciklama: "Bulut yok. Sunucu yok. Fotoğrafların yalnızca senin telefonunda durur.",
    ikon: '🔒',
  },
];

export default function Onboarding() {
  const [adim, setAdim] = useState(0);
  const [cocukAdi, setCocukAdi] = useState('');
  const sonAdim = adim === ONBOARDING.length;

  const ileri = () => {
    if (adim < ONBOARDING.length) {
      setAdim(adim + 1);
    }
  };

  const geri = () => {
    if (adim > 0) setAdim(adim - 1);
  };

  const basla = () => {
    if (!cocukAdi.trim()) return;
    // İleride AsyncStorage'a kaydedilecek
    router.replace('/(tabs)');
  };

  // Çocuk adı ekranı
  if (sonAdim) {
    return (
      <SafeAreaView style={styles.kapsayici}>
        <View style={styles.icerik}>
          <Text style={styles.logoEmoji}>👶</Text>
          <Text style={styles.baslik}>Çocuğunun{'\n'}<Text style={styles.italik}>adı ne?</Text></Text>
          <Text style={styles.aciklama}>İlk albümünü ona göre hazırlayalım.</Text>

          <TextInput
            style={styles.input}
            placeholder="Örn: Elif, Ahmet..."
            placeholderTextColor={RENKLER.gulAcik}
            value={cocukAdi}
            onChangeText={setCocukAdi}
            autoFocus
          />

          <View style={styles.noktalar}>
            {[...ONBOARDING, {}].map((_, i) => (
              <View key={i} style={[styles.nokta, i === adim && styles.noktaAktif]} />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btnAna, !cocukAdi.trim() && styles.btnDeaktif]}
            onPress={basla}
            activeOpacity={0.85}
          >
            <Text style={styles.btnAnaYazi}>Başla →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={geri} style={styles.btnGeri}>
            <Text style={styles.btnGeriYazi}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ekran = ONBOARDING[adim];

  return (
    <SafeAreaView style={styles.kapsayici}>
      <View style={styles.icerik}>
        <Text style={styles.logoEmoji}>{ekran.ikon}</Text>
        <Text style={styles.baslik}>
          {ekran.baslik.split('\n').map((satir, i) =>
            i === 1 ? <Text key={i} style={styles.italik}>{'\n'}{satir}</Text> : satir
          )}
        </Text>
        <Text style={styles.aciklama}>{ekran.aciklama}</Text>

        <View style={styles.noktalar}>
          {[...ONBOARDING, {}].map((_, i) => (
            <View key={i} style={[styles.nokta, i === adim && styles.noktaAktif]} />
          ))}
        </View>

        <TouchableOpacity style={styles.btnAna} onPress={ileri} activeOpacity={0.85}>
          <Text style={styles.btnAnaYazi}>Devam →</Text>
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

const styles = StyleSheet.create({
  kapsayici: {
    flex: 1,
    backgroundColor: RENKLER.antik,
  },
  icerik: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 32,
  },
  baslik: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: RENKLER.gece,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 36,
  },
  italik: {
    fontStyle: 'italic',
    color: RENKLER.gul,
  },
  aciklama: {
    fontSize: 15,
    color: RENKLER.komurAcik,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    maxWidth: 280,
  },
  noktalar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 36,
  },
  nokta: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RENKLER.antik2,
    borderWidth: 1,
    borderColor: RENKLER.gulAcik,
  },
  noktaAktif: {
    width: 26,
    borderRadius: 4,
    backgroundColor: RENKLER.gece,
    borderColor: RENKLER.gece,
  },
  btnAna: {
    width: '100%',
    paddingVertical: 17,
    backgroundColor: RENKLER.gece,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnDeaktif: {
    opacity: 0.4,
  },
  btnAnaYazi: {
    color: RENKLER.beyaz,
    fontSize: 17,
    fontWeight: '600',
  },
  btnGeri: {
    paddingVertical: 14,
  },
  btnGeriYazi: {
    color: RENKLER.komurAcik,
    fontSize: 15,
  },
  input: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 18,
    backgroundColor: RENKLER.beyaz,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: RENKLER.gulAcik,
    fontSize: 18,
    color: RENKLER.gece,
    textAlign: 'center',
    marginBottom: 32,
  },
});
