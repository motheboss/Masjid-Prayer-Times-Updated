import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../lib/theme";
import { usePrayerData } from "../lib/usePrayerData";
import { buildDisplaySchedule, formatCountdown, resolveJumuahTime, gregorianDate, hijriDate } from "../lib/time";
import PrayerRow from "../components/PrayerRow";

export default function TimingsScreen() {
  const { times, settings, status, now, error } = usePrayerData();

  if (error) return <Centered><Text style={styles.error}>{error}</Text></Centered>;
  if (!times || !status) return <Centered><ActivityIndicator color={colors.accent} /></Centered>;

  const schedule = buildDisplaySchedule(times, settings, now);
  const jumuah = resolveJumuahTime(times, settings);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>St. Clair Masjid and Islamic Education Center</Text>
        <Text style={styles.date}>{gregorianDate(now)}</Text>
        <Text style={styles.hijri}>{hijriDate(now)}</Text>

        <View style={styles.countdown}>
          <Text style={styles.countdownLabel}>{status.phase === "athan" ? "Next athan" : "Next iqamah"} · {status.next.label}</Text>
          <Text style={styles.countdownValue}>{formatCountdown(status.countdownMs)}</Text>
        </View>

        {schedule.map((p) => (
          <PrayerRow key={p.key} label={p.label} arabic={p.arabic} athan={p.athan} iqamah={p.iqamah} active={p.key === status.next.key} />
        ))}
        <PrayerRow label="Jumu'ah" arabic="الجمعة" athan={schedule[0].athan} iqamah={parseJumuah(jumuah, now)} />
      </ScrollView>
    </SafeAreaView>
  );
}

function parseJumuah(hhmm: string, base: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base); d.setHours(h || 13, m || 10, 0, 0); return d;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={[styles.safe, { alignItems: "center", justifyContent: "center" }]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { color: colors.accent, fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  date: { color: colors.fg, fontSize: 22, fontWeight: "700", marginTop: 8 },
  hijri: { color: colors.accent, fontSize: 16, marginTop: 2, marginBottom: 20 },
  countdown: { backgroundColor: `${colors.card}cc`, borderRadius: 16, padding: 18, marginBottom: 20 },
  countdownLabel: { color: colors.muted, fontSize: 13, textTransform: "uppercase" },
  countdownValue: { color: colors.accent, fontSize: 38, fontWeight: "800", marginTop: 4 },
  error: { color: colors.danger, fontSize: 16, padding: 20, textAlign: "center" },
});
