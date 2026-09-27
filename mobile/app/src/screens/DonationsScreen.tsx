import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStripeTerminal } from "@stripe/stripe-terminal-react-native";
import { colors } from "../lib/theme";
import { useKiosk } from "../context/KioskContext";
import { useReaderConnection } from "../lib/useReaderConnection";
import { createDonationPaymentIntent } from "../lib/stripeTerminalApi";

const AMOUNTS = [5, 10, 20, 50, 100];
type Phase = "idle" | "collecting" | "processing" | "success" | "error";

export default function DonationsScreen() {
  const { favoritedMasjid } = useKiosk();
  const { status: readerStatus, error: readerError, connectedReader } = useReaderConnection();
  const { collectPaymentMethod, confirmPaymentIntent, retrievePaymentIntent } = useStripeTerminal();

  const [masjidName, setMasjidName] = useState(favoritedMasjid?.name ?? "");
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");

  const needsMasjidPicker = !favoritedMasjid; // kiosk mode is normally entered only once a masjid is favorited, but this covers the edge case where it isn't

  async function charge(amountDollars: number) {
    if (!connectedReader) { setPhase("error"); setMessage("No card reader connected yet."); return; }
    const name = favoritedMasjid?.name || masjidName || "the masjid";
    setPhase("collecting"); setMessage("");
    try {
      const clientSecret = await createDonationPaymentIntent(Math.round(amountDollars * 100), name);
      const retrieved = await retrievePaymentIntent(clientSecret);
      if (retrieved.error || !retrieved.paymentIntent) throw new Error(retrieved.error?.message ?? "Could not start payment");

      const collected = await collectPaymentMethod({ paymentIntent: retrieved.paymentIntent });
      if (collected.error || !collected.paymentIntent) throw new Error(collected.error?.message ?? "Card was not read");

      setPhase("processing");
      const confirmed = await confirmPaymentIntent({ paymentIntent: collected.paymentIntent });
      if (confirmed.error || !confirmed.paymentIntent) throw new Error(confirmed.error?.message ?? "Payment was not confirmed");

      setPhase("success"); setMessage(`Thanks for your donation to ${name}`);
      setTimeout(() => { setPhase("idle"); setCustomOpen(false); setCustomAmount(""); }, 2500);
    } catch (e: any) {
      setPhase("error"); setMessage(e.message ?? "The payment could not be completed.");
      setTimeout(() => setPhase("idle"), 3000);
    }
  }

  if (phase === "success") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.successCheck}>✓</Text>
          <Text style={styles.successText}>{message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Donate</Text>

        {needsMasjidPicker && (
          <TextInput
            style={styles.input}
            placeholder="Which masjid is this donation for?"
            placeholderTextColor={colors.muted}
            value={masjidName}
            onChangeText={setMasjidName}
          />
        )}
        {(favoritedMasjid || (!needsMasjidPicker && masjidName)) && (
          <Text style={styles.subtitle}>to {favoritedMasjid?.name ?? masjidName}</Text>
        )}

        <Text style={[styles.readerStatus, readerStatus === "connected" ? styles.readerOk : styles.readerWarn]}>
          {readerStatus === "connected" ? "● Reader connected" : readerStatus === "error" ? `● Reader error: ${readerError}` : "● Connecting to reader…"}
        </Text>

        {phase === "idle" && (
          <>
            <View style={styles.grid}>
              {AMOUNTS.map((a) => (
                <Pressable key={a} style={styles.amountBtn} onPress={() => charge(a)}>
                  <Text style={styles.amountText}>${a}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.amountBtn} onPress={() => setCustomOpen(true)}>
                <Text style={styles.amountText}>Custom</Text>
              </Pressable>
            </View>

            {customOpen && (
              <View style={styles.customRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Amount ($)"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  autoFocus
                />
                <Pressable
                  style={styles.confirmBtn}
                  onPress={() => { const n = parseFloat(customAmount); if (n > 0) charge(n); }}
                >
                  <Text style={styles.confirmText}>Charge</Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        {(phase === "collecting" || phase === "processing") && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.readerPrompt}>{phase === "collecting" ? "Tap or insert card on the reader…" : "Processing…"}</Text>
          </View>
        )}

        {phase === "error" && <Text style={styles.errorText}>{message}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { color: colors.fg, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.accent, fontSize: 15, marginTop: 4 },
  readerStatus: { fontSize: 12, marginTop: 10, marginBottom: 18 },
  readerOk: { color: colors.success }, readerWarn: { color: colors.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  amountBtn: { width: "30%", aspectRatio: 1.3, backgroundColor: `${colors.card}cc`, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  amountText: { color: colors.accent, fontSize: 24, fontWeight: "800" },
  customRow: { flexDirection: "row", gap: 10, marginTop: 16, alignItems: "center" },
  input: { backgroundColor: `${colors.card}cc`, color: colors.fg, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 10 },
  confirmBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20 },
  confirmText: { color: colors.bg, fontWeight: "800" },
  readerPrompt: { color: colors.fg, fontSize: 16, marginTop: 16, textAlign: "center" },
  errorText: { color: colors.danger, textAlign: "center", marginTop: 20 },
  successCheck: { color: colors.success, fontSize: 72, fontWeight: "800" },
  successText: { color: colors.fg, fontSize: 20, fontWeight: "700", marginTop: 12, textAlign: "center", paddingHorizontal: 30 },
});
