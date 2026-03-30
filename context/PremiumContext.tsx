import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type PurchaseError,
  type Purchase,
} from 'react-native-iap';

export const PREMIUM_SKU = 'hatiram_premium';
export const MAX_UCRETSIZ_ALBUM = 5;
export const MAX_UCRETSIZ_FOTO = 50;

interface PremiumContextType {
  isPremium: boolean;
  yukleniyor: boolean;
  satin_al_yukleniyor: boolean;
  satinAl: () => Promise<void>;
  yenile: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

const DEPOLAMA_ANAHTARI = 'premium_durum';

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [satin_al_yukleniyor, setSatinAlYukleniyor] = useState(false);
  const purchaseUpdatedSub = useRef<ReturnType<typeof purchaseUpdatedListener> | null>(null);
  const purchaseErrorSub = useRef<ReturnType<typeof purchaseErrorListener> | null>(null);

  useEffect(() => {
    let baglanti = false;

    const baslat = async () => {
      // Önce cache'den oku (hızlı yükleme)
      try {
        const kayitli = await AsyncStorage.getItem(DEPOLAMA_ANAHTARI);
        if (kayitli === 'true') setIsPremium(true);
      } catch {}

      try {
        await initConnection();
        baglanti = true;

        // Satın alımları doğrula
        await dogrula();

        // Satın alma listener
        purchaseUpdatedSub.current = purchaseUpdatedListener(
          async (purchase: Purchase) => {
            if (purchase.productId === PREMIUM_SKU) {
              await finishTransaction({ purchase, isConsumable: false });
              await premiumAktiflestir();
            }
          }
        );

        purchaseErrorSub.current = purchaseErrorListener((_error: PurchaseError) => {
          setSatinAlYukleniyor(false);
        });
      } catch {
        // IAP bağlanamadı (emulator, test cihazı vs.) — devam et
      } finally {
        setYukleniyor(false);
      }
    };

    baslat();

    return () => {
      purchaseUpdatedSub.current?.remove();
      purchaseErrorSub.current?.remove();
      if (baglanti) endConnection();
    };
  }, []);

  const premiumAktiflestir = async () => {
    setIsPremium(true);
    setSatinAlYukleniyor(false);
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARI, 'true');
  };

  const dogrula = async () => {
    try {
      const purchases = await getAvailablePurchases();
      const aktif = purchases.some(p => p.productId === PREMIUM_SKU);
      if (aktif) {
        await premiumAktiflestir();
      } else {
        setIsPremium(false);
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARI, 'false');
      }
    } catch {}
  };

  const satinAl = async () => {
    setSatinAlYukleniyor(true);
    try {
      await fetchProducts({ skus: [PREMIUM_SKU] });
      await requestPurchase({
        type: 'in-app',
        request: {
          android: { skus: [PREMIUM_SKU] },
          apple: { sku: PREMIUM_SKU, andDangerouslyFinishTransactionAutomatically: false },
        },
      });
    } catch {
      setSatinAlYukleniyor(false);
    }
  };

  const yenile = async () => {
    setYukleniyor(true);
    await dogrula();
    setYukleniyor(false);
  };

  return (
    <PremiumContext.Provider value={{ isPremium, yukleniyor, satin_al_yukleniyor, satinAl, yenile }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
