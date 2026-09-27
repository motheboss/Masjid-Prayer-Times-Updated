import { useEffect, useState } from "react";
import { useStripeTerminal } from "@stripe/stripe-terminal-react-native";

export type ReaderStatus = "disconnected" | "discovering" | "connecting" | "connected" | "error";

/**
 * Discovers and connects to a Bluetooth card reader (BBPOS/WisePOS-style standalone reader -
 * the "reader lights up, tap card" hardware) once, on mount, and keeps that connection alive
 * for as long as the app runs - this is the "maintain continuous reader connection"
 * requirement. If you're instead using a phone's own NFC as the reader (Tap to Pay on
 * iPhone/Android) rather than separate hardware, swap `connectBluetoothReader` below for
 * `connectLocalMobileReader` - the rest of this file (and DonationsScreen) is unaffected.
 */
export function useReaderConnection() {
  const { initialize, discoverReaders, connectBluetoothReader, connectedReader, discoveredReaders } = useStripeTerminal();
  const [status, setStatus] = useState<ReaderStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const init = await initialize();
      if (init.error) { setStatus("error"); setError(init.error.message); return; }

      setStatus("discovering");
      const disc = await discoverReaders({ discoveryMethod: "bluetoothScan", simulated: __DEV__ });
      if (disc?.error) { setStatus("error"); setError(disc.error.message); return; }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (connectedReader || status !== "discovering" || !discoveredReaders.length) return;
    (async () => {
      setStatus("connecting");
      const { reader, error: connErr } = await connectBluetoothReader({
        reader: discoveredReaders[0],
        locationId: discoveredReaders[0].locationId ?? "",
      });
      if (connErr) { setStatus("error"); setError(connErr.message); return; }
      if (reader) setStatus("connected");
    })();
  }, [discoveredReaders, status, connectedReader]);

  useEffect(() => { if (connectedReader) setStatus("connected"); }, [connectedReader]);

  return { status, error, connectedReader };
}
