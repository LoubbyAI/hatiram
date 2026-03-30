import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePremium, MAX_UCRETSIZ_ALBUM, MAX_UCRETSIZ_FOTO } from '../context/PremiumContext';
import { useLanguage } from '../i18n';

const RENKLER = {
  gece: '#1A2E44', gul: '#A67B71', altin: '#D4AF37',
  antik: '#F9F7F2', komur: '#2D2D2D', komurAcik: '#6B6B6B',
  beyaz: '#FFFFFF', yesil: '#3A7D52',
};

type PaywallTip = 'album' | 'foto';

interface Props {
  gorunur: boolean;
  tip: PaywallTip;
  onKapat: () => void;
}

export default function PaywallModal({ gorunur, tip, onKapat }: Props) {
  const { satinAl, yenile, satin_al_yukleniyor } = usePremium();
  const { t } = useLanguage();

  const baslik = tip === 'album' ? t.paywallAlbumTitle : t.paywallPhotoTitle;
  const aciklama = tip === 'album'
    ? t.paywallAlbumDesc(MAX_UCRETSIZ_ALBUM)
    : t.paywallPhotoDesc(MAX_UCRETSIZ_FOTO);

  const ozellikler = [
    { ikon: 'albums-outline' as const, yazi: t.premiumFeature1 },
    { ikon: 'images-outline' as const, yazi: t.premiumFeature2 },
    { ikon: 'checkmark-circle-outline' as const, yazi: t.premiumFeature3 },
  ];

  return (
    <Modal visible={gorunur} transparent animationType="slide" onRequestClose={onKapat}>
      <View style={styles.arkaplan}>
        <View style={styles.kart}>
          <View style={styles.tutamac} />

          {/* Limit uyarısı */}
          <View style={styles.uyariSatir}>
            <View style={styles.uyariIkon}>
              <Ionicons name="lock-closed" size={18} color={RENKLER.gul} />
            </View>
            <Text style={styles.uyariYazi}>{baslik}</Text>
          </View>
          <Text style={styles.aciklama}>{aciklama}</Text>

          <View style={styles.ayrac} />

          {/* Premium başlık */}
          <View style={styles.baslikSatir}>
            <View style={styles.altinRozet}>
              <Ionicons name="star" size={12} color={RENKLER.altin} />
              <Text style={styles.altinRozetYazi}>PREMIUM</Text>
            </View>
          </View>
          <Text style={styles.premiumBaslik}>{t.premiumUpgradeTitle}</Text>
          <Text style={styles.premiumAcik}>{t.premiumUpgradeDesc}</Text>

          {/* Özellikler */}
          <View style={styles.ozelliklerWrap}>
            {ozellikler.map((o, i) => (
              <View key={i} style={styles.ozellikSatir}>
                <View style={styles.ozellikIkon}>
                  <Ionicons name={o.ikon} size={16} color={RENKLER.yesil} />
                </View>
                <Text style={styles.ozellikYazi}>{o.yazi}</Text>
              </View>
            ))}
          </View>

          {/* Fiyat ve satın alma */}
          <View style={styles.fiyatWrap}>
            <Text style={styles.fiyat}>{t.premiumPrice}</Text>
            <Text style={styles.fiyatAlt}>tek seferlik</Text>
          </View>

          <TouchableOpacity
            style={[styles.btnSatinAl, satin_al_yukleniyor && styles.btnDeaktif]}
            onPress={satinAl}
            disabled={satin_al_yukleniyor}
            activeOpacity={0.85}
          >
            {satin_al_yukleniyor ? (
              <ActivityIndicator color={RENKLER.beyaz} size="small" />
            ) : (
              <Text style={styles.btnSatinAlYazi}>{t.premiumBuyBtn}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnYenile} onPress={yenile} activeOpacity={0.7}>
            <Text style={styles.btnYenileYazi}>{t.premiumRestoreBtn}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnKapat} onPress={onKapat} activeOpacity={0.7}>
            <Text style={styles.btnKapatYazi}>{t.paywallContinueFree}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  arkaplan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  kart: { backgroundColor: RENKLER.antik, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  tutamac: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.15)', alignSelf: 'center', marginBottom: 20 },
  uyariSatir: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  uyariIkon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(166,123,113,0.12)', alignItems: 'center', justifyContent: 'center' },
  uyariYazi: { fontSize: 16, fontWeight: '700', color: RENKLER.komur },
  aciklama: { fontSize: 13, color: RENKLER.komurAcik, lineHeight: 20, marginBottom: 20 },
  ayrac: { height: 1, backgroundColor: 'rgba(166,123,113,0.15)', marginBottom: 20 },
  baslikSatir: { flexDirection: 'row', marginBottom: 8 },
  altinRozet: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(212,175,55,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  altinRozetYazi: { fontSize: 11, fontWeight: '700', color: RENKLER.altin },
  premiumBaslik: { fontSize: 22, fontWeight: '800', color: RENKLER.gece, marginBottom: 6 },
  premiumAcik: { fontSize: 13, color: RENKLER.komurAcik, lineHeight: 20, marginBottom: 20 },
  ozelliklerWrap: { gap: 12, marginBottom: 24 },
  ozellikSatir: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ozellikIkon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(58,125,82,0.1)', alignItems: 'center', justifyContent: 'center' },
  ozellikYazi: { fontSize: 14, color: RENKLER.komur, fontWeight: '500' },
  fiyatWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 16 },
  fiyat: { fontSize: 32, fontWeight: '800', color: RENKLER.gece },
  fiyatAlt: { fontSize: 13, color: RENKLER.komurAcik },
  btnSatinAl: { backgroundColor: RENKLER.gece, paddingVertical: 16, borderRadius: 18, alignItems: 'center', marginBottom: 10, shadowColor: RENKLER.gece, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  btnDeaktif: { opacity: 0.6 },
  btnSatinAlYazi: { color: RENKLER.beyaz, fontSize: 17, fontWeight: '700' },
  btnYenile: { paddingVertical: 12, alignItems: 'center', marginBottom: 4 },
  btnYenileYazi: { fontSize: 13, color: RENKLER.gul, fontWeight: '500' },
  btnKapat: { paddingVertical: 10, alignItems: 'center' },
  btnKapatYazi: { fontSize: 13, color: RENKLER.komurAcik },
});
