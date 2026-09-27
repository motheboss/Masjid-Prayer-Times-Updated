import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../lib/theme";
import { usePrayerData } from "../lib/usePrayerData";
import { formatCountdown, formatTime } from "../lib/time";

export default function HomeScreen() {
  const { status, now, error } = usePrayerData();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.clock}>{formatTime(now)}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {!error && !status && <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />}
        {status && (
          <View style={styles.card}>
            <Text style={styles.label}>{status.phase === "athan" ? "Next athan" : "Next iqamah"}</Text>
            <Text style={styles.next}>{status.next.label}</Text>
            <Text style={styles.countdown}>{formatCountdown(status.countdownMs)}</Text>
          </View>
        )}
        <Text style={styles.masjid}>St. Clair Masjid and Islamic Education Center</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  clock: { color: colors.fg, fontSize: 56, fontWeight: "800" },
  card: { marginTop: 28, alignItems: "center", backgroundColor: `${colors.card}cc`, borderRadius: 20, padding: 24, width: "100%" },
  label: { color: colors.muted, fontSize: 13, textTransform: "uppercase" },
  next: { color: colors.fg, fontSize: 26, fontWeight: "700", marginTop: 4 },
  countdown: { color: colors.accent, fontSize: 44, fontWeight: "800", marginTop: 6 },
  masjid: { color: colors.muted, fontSize: 13, marginTop: 32, textAlign: "center" },
  error: { color: colors.danger, marginTop: 20 },
});
