import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../lib/theme";
import { formatTime } from "../lib/time";

export default function PrayerRow({ label, arabic, athan, iqamah, active }: {
  label: string; arabic: string; athan: Date; iqamah?: Date; active?: boolean;
}) {
  return (
    <View style={[styles.row, active && styles.rowActive]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.arabic}>{arabic}</Text>
      <View style={styles.times}>
        <Text style={styles.athan}>{formatTime(athan)}</Text>
        <Text style={[styles.iqamah, active && { color: colors.accent }]}>{iqamah ? formatTime(iqamah) : "—"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: `${colors.card}cc`, marginBottom: 8, borderWidth: 1, borderColor: "transparent" },
  rowActive: { borderColor: colors.accent, backgroundColor: `${colors.accent}22` },
  label: { flex: 1, color: colors.fg, fontSize: 18, fontWeight: "700" },
  arabic: { color: colors.fg, fontSize: 18, opacity: 0.8, marginRight: 16 },
  times: { flexDirection: "row", gap: 16, alignItems: "baseline" },
  athan: { color: colors.muted, fontSize: 14, width: 56 },
  iqamah: { color: colors.fg, fontSize: 20, fontWeight: "800", width: 64, textAlign: "right" },
});
