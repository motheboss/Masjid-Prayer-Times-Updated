import React from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { colors } from "../lib/theme";

/** Qur'an.com's embeddable reader/player. Works on both platforms via react-native-webview.
 *  In kiosk mode this tab is hidden (see AppNavigator) but the screen/code still exists,
 *  as asked, for when kiosk mode is off. */
export default function QuranScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <WebView
        source={{ uri: "https://quran.com/embed" }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>
        )}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  webview: { flex: 1, backgroundColor: colors.bg },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
