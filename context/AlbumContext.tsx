import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

export interface Kisi {
  id: string;
  ad: string;
  renk: string;
  ikonRenk: string;
}

export interface Album {
  id: string;
  ad: string;
  etiket: string;
  renk: string;
  ikon: string;
  ikonRenk: string;
  olusturmaTarihi: number;
  kisiId?: string;
  kapakFotoId?: string;
}

export interface Foto {
  id: string;
  albumId: string;
  uri: string;
  eklenmeTarihi: number;
}

interface AlbumContextType {
  albumler: Album[];
  fotolar: Foto[];
  kisiler: Kisi[];
  yukleniyor: boolean;
  albumEkle: (album: Omit<Album, 'id' | 'olusturmaTarihi'>) => Promise<void>;
  albumSil: (id: string) => Promise<void>;
  albumGuncelle: (id: string, guncellemeler: Partial<Album>) => Promise<void>;
  fotoEkle: (albumId: string, tempUri: string) => Promise<void>;
  fotolarTopluEkle: (albumId: string, uriList: string[]) => Promise<void>;
  fotoSil: (id: string) => Promise<void>;
  fotoTasi: (fotoId: string, hedefAlbumId: string) => Promise<void>;
  kapakAyarla: (albumId: string, fotoId: string) => Promise<void>;
  albumFotolari: (albumId: string) => Foto[];
  kisiEkle: (ad: string) => Promise<void>;
  kisiSil: (id: string) => Promise<void>;
  tumVerileriSil: () => Promise<void>;
}

const AlbumContext = createContext<AlbumContextType | null>(null);

const KISI_RENKLERI = [
  { renk: '#F5EDE6', ikonRenk: '#A67B71' },
  { renk: '#EAF2FB', ikonRenk: '#2E6EA6' },
  { renk: '#EAF4EC', ikonRenk: '#3A7D52' },
  { renk: '#F0EBF5', ikonRenk: '#8B6BAA' },
  { renk: '#FFF0F3', ikonRenk: '#B03060' },
  { renk: '#FFFBEA', ikonRenk: '#B58A00' },
  { renk: '#EEF0FB', ikonRenk: '#5B6BBF' },
  { renk: '#EDFAF3', ikonRenk: '#1F7A4A' },
];

const fotoKlasoru = () => new Directory(Paths.document, 'fotolar');

export function AlbumProvider({ children }: { children: React.ReactNode }) {
  const [albumler, setAlbumler] = useState<Album[]>([]);
  const [fotolar, setFotolar] = useState<Foto[]>([]);
  const [kisiler, setKisiler] = useState<Kisi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => { yukle(); }, []);

  const yukle = async () => {
    try {
      const [albumJson, fotoJson, kisiJson] = await Promise.all([
        AsyncStorage.getItem('albumler'),
        AsyncStorage.getItem('fotolar'),
        AsyncStorage.getItem('kisiler'),
      ]);
      if (albumJson) setAlbumler(JSON.parse(albumJson));
      if (fotoJson) setFotolar(JSON.parse(fotoJson));
      if (kisiJson) setKisiler(JSON.parse(kisiJson));

      const klasor = fotoKlasoru();
      if (!klasor.exists) klasor.create({ intermediates: true });
    } catch (e) {
      console.error('Yükleme hatası:', e);
    } finally {
      setYukleniyor(false);
    }
  };

  const albumKaydet = async (yeniListe: Album[]) => {
    setAlbumler(yeniListe);
    await AsyncStorage.setItem('albumler', JSON.stringify(yeniListe));
  };

  const fotoKaydet = async (yeniListe: Foto[]) => {
    setFotolar(yeniListe);
    await AsyncStorage.setItem('fotolar', JSON.stringify(yeniListe));
  };

  const kisiKaydet = async (yeniListe: Kisi[]) => {
    setKisiler(yeniListe);
    await AsyncStorage.setItem('kisiler', JSON.stringify(yeniListe));
  };

  const albumEkle = async (album: Omit<Album, 'id' | 'olusturmaTarihi'>) => {
    const yeni: Album = { ...album, id: Date.now().toString(), olusturmaTarihi: Date.now() };
    await albumKaydet([...albumler, yeni]);
  };

  const albumSil = async (id: string) => {
    const silinecekFotolar = fotolar.filter(f => f.albumId === id);
    for (const foto of silinecekFotolar) {
      try {
        // Sadece bizim kopyaladığımız dosyaları sil, galeri orijinallerine dokunma
        if (foto.uri.startsWith('file://')) {
          const dosya = new File(foto.uri);
          if (dosya.exists) dosya.delete();
        }
      } catch {}
    }
    await fotoKaydet(fotolar.filter(f => f.albumId !== id));
    await albumKaydet(albumler.filter(a => a.id !== id));
  };

  const albumGuncelle = async (id: string, guncellemeler: Partial<Album>) => {
    await albumKaydet(albumler.map(a => a.id === id ? { ...a, ...guncellemeler } : a));
  };

  const fotoEkle = async (albumId: string, tempUri: string) => {
    let kaliciUri = tempUri;
    // content:// URI = galeri referansı, kopyalamaya gerek yok
    // file:// URI = geçici dosya (ör. kameradan), filesDir'e kopyala
    if (tempUri.startsWith('file://')) {
      const dosyaAdi = `foto_${Date.now()}.jpg`;
      const klasor = fotoKlasoru();
      try {
        if (!klasor.exists) klasor.create({ intermediates: true });
        const hedefDosya = new File(klasor, dosyaAdi);
        new File(tempUri).copy(hedefDosya);
        kaliciUri = hedefDosya.uri;
      } catch {
        kaliciUri = tempUri;
      }
    }
    await fotoKaydet([...fotolar, {
      id: Date.now().toString(), albumId, uri: kaliciUri, eklenmeTarihi: Date.now(),
    }]);
  };

  // Toplu ekleme — stale closure sorununu önlemek için AsyncStorage'dan okur
  const fotolarTopluEkle = async (albumId: string, uriList: string[]) => {
    const json = await AsyncStorage.getItem('fotolar');
    const mevcut: Foto[] = json ? JSON.parse(json) : [];
    const yeniler: Foto[] = [];

    for (let i = 0; i < uriList.length; i++) {
      const tempUri = uriList[i];
      let kaliciUri = tempUri;

      // content:// URI = galeri referansı, kopyalamaya gerek yok
      // file:// URI = geçici dosya, filesDir'e kopyala
      if (tempUri.startsWith('file://')) {
        const dosyaAdi = `foto_${Date.now()}_${i}.jpg`;
        const klasor = fotoKlasoru();
        try {
          if (!klasor.exists) klasor.create({ intermediates: true });
          const hedefDosya = new File(klasor, dosyaAdi);
          new File(tempUri).copy(hedefDosya);
          kaliciUri = hedefDosya.uri;
        } catch {
          kaliciUri = tempUri;
        }
      }

      yeniler.push({
        id: `${Date.now()}_${i}`,
        albumId,
        uri: kaliciUri,
        eklenmeTarihi: Date.now() + i,
      });
    }

    await fotoKaydet([...mevcut, ...yeniler]);
  };

  const fotoSil = async (id: string) => {
    const foto = fotolar.find(f => f.id === id);
    if (foto) {
      try {
        // Sadece bizim kopyaladığımız dosyaları sil, galeri orijinallerine dokunma
        if (foto.uri.startsWith('file://')) {
          const dosya = new File(foto.uri);
          if (dosya.exists) dosya.delete();
        }
      } catch {}
    }
    await fotoKaydet(fotolar.filter(f => f.id !== id));
  };

  const fotoTasi = async (fotoId: string, hedefAlbumId: string) => {
    await fotoKaydet(fotolar.map(f => f.id === fotoId ? { ...f, albumId: hedefAlbumId } : f));
  };

  const kapakAyarla = async (albumId: string, fotoId: string) => {
    await albumKaydet(albumler.map(a => a.id === albumId ? { ...a, kapakFotoId: fotoId } : a));
  };

  const kisiEkle = async (ad: string) => {
    const renkIdx = kisiler.length % KISI_RENKLERI.length;
    const yeni: Kisi = {
      id: Date.now().toString(),
      ad: ad.trim(),
      ...KISI_RENKLERI[renkIdx],
    };
    await kisiKaydet([...kisiler, yeni]);
  };

  const kisiSil = async (id: string) => {
    // Kişiye bağlı albümleri koru, sadece kisiId'yi temizle
    await albumKaydet(albumler.map(a => a.kisiId === id ? { ...a, kisiId: undefined } : a));
    await kisiKaydet(kisiler.filter(k => k.id !== id));
  };

  const tumVerileriSil = async () => {
    for (const foto of fotolar) {
      try {
        if (foto.uri.startsWith('file://')) {
          const dosya = new File(foto.uri);
          if (dosya.exists) dosya.delete();
        }
      } catch {}
    }
    await fotoKaydet([]);
    await albumKaydet([]);
    await kisiKaydet([]);
    await AsyncStorage.multiRemove([
      'ayar_cocuk_adi', 'ayar_dogum_tarihi',
      'ayar_og_gun_bildirim', 'ayar_haftalik_ozet',
      'onboarding_goruldu',
    ]);
  };

  const albumFotolari = (albumId: string) =>
    fotolar.filter(f => f.albumId === albumId).sort((a, b) => b.eklenmeTarihi - a.eklenmeTarihi);

  return (
    <AlbumContext.Provider value={{
      albumler, fotolar, kisiler, yukleniyor,
      albumEkle, albumSil, albumGuncelle,
      fotoEkle, fotolarTopluEkle, fotoSil, fotoTasi, kapakAyarla, albumFotolari,
      kisiEkle, kisiSil, tumVerileriSil,
    }}>
      {children}
    </AlbumContext.Provider>
  );
}

export function useAlbum() {
  const ctx = useContext(AlbumContext);
  if (!ctx) throw new Error('useAlbum must be used within AlbumProvider');
  return ctx;
}
