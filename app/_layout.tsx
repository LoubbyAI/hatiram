import { Stack } from "expo-router";
import { AlbumProvider } from "../context/AlbumContext";
import { LanguageProvider } from "../i18n";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AlbumProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AlbumProvider>
    </LanguageProvider>
  );
}
