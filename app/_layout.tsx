import { Stack } from "expo-router";
import { AlbumProvider } from "../context/AlbumContext";
import { PremiumProvider } from "../context/PremiumContext";
import { LanguageProvider } from "../i18n";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <PremiumProvider>
        <AlbumProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AlbumProvider>
      </PremiumProvider>
    </LanguageProvider>
  );
}
