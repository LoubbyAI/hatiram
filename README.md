# Hatıram — Aile Fotoğraf Albümü

Türk aileler için tasarlanmış, **bulut yok, abonelik yok** dijital fotoğraf albümü uygulaması. Tüm veriler sadece cihazda saklanır.

---

## Özellikler

- Fotoğrafları albümlere ayır, düzenle
- Galeriden veya kamerayla fotoğraf ekle (kamera fotoğrafları otomatik galeriye de kaydedilir)
- Albümler arası fotoğraf taşıma
- Çoklu seçim: seç, paylaş, sil, taşı
- WhatsApp dahil tüm uygulamalara paylaşım
- Albüm kapak fotoğrafı belirleme
- Freemium: ücretsiz 10 foto/albüm, premium sınırsız (149 TL/yıl)
- Türkçe ve İngilizce dil desteği

## Teknik

- **Platform:** Android (Google Play) · iOS
- **Stack:** Expo SDK 54 · React Native 0.81.5 · TypeScript
- **Depolama:** Galeri fotoğrafları `content://` URI ile referans alınır, kopya oluşturulmaz
- **Paylaşım:** `react-native-share` + cache kopyası (WhatsApp FileProvider uyumluluğu)
- **Package:** `com.omer.hatiram`

## Geliştirme

```bash
npm install
npx expo start
```

## Build

```bash
# Preview (test)
eas build --platform android --profile preview

# Production
eas build --platform android --profile production
```

## Mimari Notlar

- Galeri fotoğrafları: `content://` URI saklanır, orijinale dokunulmaz
- Kamera fotoğrafları: `filesDir`'e kopyalanır + `expo-media-library` ile galeriye kaydedilir
- Paylaşım öncesi dosyalar `Paths.cache`'e kopyalanır (react-native-share FileProvider sadece cache/ expose ediyor)
- EAS Project ID: `571dc730-d043-475e-a490-1d16db655bc3`
