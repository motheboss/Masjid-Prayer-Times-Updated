import React from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../lib/theme";
import { useKiosk } from "../context/KioskContext";

/** "My Masjid": this device's favorited masjid + kiosk-mode toggle. There's no multi-masjid
 *  directory in the existing Supabase schema (it's single-masjid, see README), so this favorites
 *  SCMEC itself by default rather than offering a "nearby masjids" picker like Athan+'s. */
export default function MyMasjidScreen() {
  const { kioskMode, setKioskMode, favoritedMasjid, setFavoritedMasjid } = useKiosk();
  const SCMEC = { id: "scmec", name: "St. Clair Masjid and Islamic Education Center" };
  const isFavorited = favoritedMasjid?.id === SCMEC.id;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>My Masjid</Text>

        <View style={styles.card}>
          <Text style={styles.name}>{SCMEC.name}</Text>
          <Text
            style={styles.favLink}
            onPress={() => setFavoritedMasjid(isFavorited ? null : SCMEC)}
          >
            {isFavorited ? "★ Favorited (tap to remove)" : "☆ Tap to favorite"}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Kiosk mode</Text>
            <Text style={styles.rowSub}>Locks this device to Donations, hides other tabs. Meant for a lobby tablet, not a personal phone.</Text>
          </View>
          <Switch value={kioskMode} onValueChange={setKioskMode} trackColor={{ true: colors.accent }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20 },
  title: { color: colors.fg, fontSize: 24, fontWeight: "800", marginBottom: 16 },
  card: { backgroundColor: `${colors.card}cc`, borderRadius: 16, padding: 18, marginBottom: 20 },
  name: { color: colors.fg, fontSize: 18, fontWeight: "700" },
  favLink: { color: colors.accent, fontSize: 15, marginTop: 10, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: `${colors.card}cc`, borderRadius: 16, padding: 18, gap: 12 },
  rowTitle: { color: colors.fg, fontSize: 16, fontWeight: "700" },
  rowSub: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
