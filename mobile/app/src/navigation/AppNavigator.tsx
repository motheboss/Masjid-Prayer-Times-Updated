import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { colors } from "../lib/theme";
import { useKiosk } from "../context/KioskContext";
import HomeScreen from "../screens/HomeScreen";
import MyMasjidScreen from "../screens/MyMasjidScreen";
import TimingsScreen from "../screens/TimingsScreen";
import QuranScreen from "../screens/QuranScreen";
import DonationsScreen from "../screens/DonationsScreen";

const Tab = createBottomTabNavigator();
const ICON: Record<string, string> = { Home: "🏠", "My Masjid": "🕌", Timings: "🕐", "Qur'an": "📖", Donations: "💚" };

/** Kiosk mode: only the Donations tab exists, so there is nothing to navigate away to -
 *  no back button trick or nav-lock hack needed, the other four screens simply aren't
 *  mounted. Turning kiosk mode off (My Masjid tab, before it disappears) restores all five. */
export default function AppNavigator() {
  const { kioskMode, loaded } = useKiosk();
  if (!loaded) return null;

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={kioskMode ? "Donations" : "Home"}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICON[route.name]}</Text>,
        })}
      >
        {kioskMode ? (
          <Tab.Screen name="Donations" component={DonationsScreen} />
        ) : (
          <>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="My Masjid" component={MyMasjidScreen} />
            <Tab.Screen name="Timings" component={TimingsScreen} />
            <Tab.Screen name="Qur'an" component={QuranScreen} />
            <Tab.Screen name="Donations" component={DonationsScreen} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
