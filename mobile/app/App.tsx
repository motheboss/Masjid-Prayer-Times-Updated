import React from "react";
import { StatusBar } from "expo-status-bar";
import { StripeTerminalProvider } from "@stripe/stripe-terminal-react-native";
import { activateKeepAwakeAsync } from "expo-keep-awake";
import { KioskProvider } from "./src/context/KioskContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { fetchConnectionToken } from "./src/lib/stripeTerminalApi";

export default function App() {
  React.useEffect(() => { activateKeepAwakeAsync(); }, []); // a lobby/kiosk device should never sleep

  return (
    <StripeTerminalProvider logLevel="verbose" tokenProvider={fetchConnectionToken}>
      <KioskProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </KioskProvider>
    </StripeTerminalProvider>
  );
}
