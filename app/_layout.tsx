import { Stack } from "expo-router";
import { AlbumProvider } from "../context/AlbumContext";

export default function RootLayout() {
  return (
    <AlbumProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AlbumProvider>
  );
}
