import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { useStyles, createStyleSheet } from "react-native-unistyles";

export default function NotFound() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={[styles.container, styles.centered]}>
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar style="dark" animated={true} translucent={true} />

      <Text
        style={{
          fontSize: 20,
          fontFamily: "Game",
          textAlign: "center",
        }}
      >
        404 | Not Found
      </Text>
    </View>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: rt.insets.top,
    backgroundColor: theme.colors.white,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
}));
