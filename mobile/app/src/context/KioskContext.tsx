import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FavoritedMasjid { id: string; name: string }

interface KioskState {
  kioskMode: boolean;
  favoritedMasjid: FavoritedMasjid | null;
  setKioskMode: (v: boolean) => void;
  setFavoritedMasjid: (m: FavoritedMasjid | null) => void;
  loaded: boolean;
}

const Ctx = createContext<KioskState | null>(null);
export const useKiosk = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useKiosk must be used inside <KioskProvider>");
  return v;
};

const KIOSK_KEY = "scmec.kioskMode";
const FAV_KEY = "scmec.favoritedMasjid";

/** Kiosk mode + the favorited masjid are persisted locally (AsyncStorage), not in Supabase -
 *  they describe *this device's* fixed role (a lobby tablet), not something synced across
 *  a person's devices. See README: this is what "auto-lock to the favorited masjid" reads. */
export function KioskProvider({ children }: { children: React.ReactNode }) {
  const [kioskMode, setKioskModeState] = useState(false);
  const [favoritedMasjid, setFavoritedMasjidState] = useState<FavoritedMasjid | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [k, f] = await Promise.all([AsyncStorage.getItem(KIOSK_KEY), AsyncStorage.getItem(FAV_KEY)]);
      if (k) setKioskModeState(k === "true");
      if (f) setFavoritedMasjidState(JSON.parse(f));
      setLoaded(true);
    })();
  }, []);

  const setKioskMode = (v: boolean) => { setKioskModeState(v); AsyncStorage.setItem(KIOSK_KEY, String(v)); };
  const setFavoritedMasjid = (m: FavoritedMasjid | null) => {
    setFavoritedMasjidState(m);
    if (m) AsyncStorage.setItem(FAV_KEY, JSON.stringify(m)); else AsyncStorage.removeItem(FAV_KEY);
  };

  return (
    <Ctx.Provider value={{ kioskMode, favoritedMasjid, setKioskMode, setFavoritedMasjid, loaded }}>
      {children}
    </Ctx.Provider>
  );
}
