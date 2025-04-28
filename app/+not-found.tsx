import React from "react";
import { Text, View } from "react-native";
import { useStyles, createStyleSheet } from "react-native-unistyles";

export default function NotFound() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Text>Not Found</Text>
    </View>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: rt.insets.top,
    backgroundColor: theme.colors.background,
  },
}));
