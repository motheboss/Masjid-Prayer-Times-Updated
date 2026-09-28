import { useEffect, useState } from "react";
import { useStripeTerminal } from "./terminalNative";

export type ReaderStatus = "disconnected" | "discovering" | "connecting" | "connected" | "error";

/** Only call inside a component rendered when terminalAvailable is true. */
export function useReaderConnection() {
  const { initialize, discoverReaders, connectBluetoothReader, connectedReader, discoveredReaders } = useStripeTerminal();
  const [status, setStatus] = useState<ReaderStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const init = await initialize();
        if (init?.error) { setStatus("error"); setError(init.error.message); return; }
        setStatus("discovering");
        const disc = await discoverReaders({ discoveryMethod: "bluetoothScan", simulated: __DEV__ });
        if (disc?.error) { setStatus("error"); setError(disc.error.message); }
      } catch (e: any) {
        setStatus("error"); setError(e?.message ?? "Reader setup failed");
      }
    })();
  }, []);

  useEffect(() => {
    if (connectedReader || status !== "discovering" || !discoveredReaders?.length) return;
    (async () => {
      try {
        setStatus("connecting");
        const r = discoveredReaders[0];
        const { reader, error: connErr } = await connectBluetoothReader({ reader: r, locationId: r.locationId ?? "" });
        if (connErr) { setStatus("error"); setError(connErr.message); return; }
        if (reader) setStatus("connected");
      } catch (e: any) {
        setStatus("error"); setError(e?.message ?? "Reader connection failed");
      }
    })();
  }, [discoveredReaders, status, connectedReader]);

  useEffect(() => { if (connectedReader) setStatus("connected"); }, [connectedReader]);

  return { status, error, connectedReader };
}
