/* eslint-disable */

import { StyleSheet } from "react-native-unistyles";

const pokemonTheme = {
  colors: {
    primary: "#FF0000",
    blue: "#3B4CCA",
    yellow: "#FFDE00",
  },
};

const THEMES = {
  primary: pokemonTheme,
};

const BREAKPOINTS = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppThemes = typeof THEMES;
type AppBreakpoints = typeof BREAKPOINTS;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    initialTheme: "primary",
  },
  themes: THEMES,
  breakpoints: BREAKPOINTS,
});
