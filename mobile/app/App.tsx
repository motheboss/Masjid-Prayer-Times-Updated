import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { activateKeepAwakeAsync } from "expo-keep-awake";
import { KioskProvider } from "./src/context/KioskContext";
import AppNavigator from "./src/navigation/AppNavigator";

// Stripe Terminal disabled for Expo Go
// import { StripeTerminalProvider, terminalAvailable } from "./src/lib/terminalNative";
// import { fetchConnectionToken } from "./src/lib/stripeTerminalApi";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorBody}>{this.state.error.message}</Text>
      </View>
    );
  }
}

// Terminal wrapper disabled for Expo Go
function TerminalWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function App() {
  React.useEffect(() => {
    activateKeepAwakeAsync().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <TerminalWrapper>
        <KioskProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </KioskProvider>
      </TerminalWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorWrap: {
    flex: 1,
    backgroundColor: "#06231b",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    color: "#e9c86b",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorBody: {
    color: "#f4f7f5",
    fontSize: 14,
    textAlign: "center",
  },
});
