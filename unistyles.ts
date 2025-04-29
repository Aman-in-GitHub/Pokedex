/* eslint-disable */

import { UnistylesRegistry } from "react-native-unistyles";

const pokemonTheme = {
  colors: {
    red: "#E63900",
    blue: "#6AA4E6",
    green: "#73AC31",
    yellow: "#FFDE00",
    dexRed: "#CC0000",
    white: "#FFFFFF",
    black: "#000000",
    mutedBlack: "#666666",
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

UnistylesRegistry.addBreakpoints(BREAKPOINTS)
  .addThemes({
    primary: pokemonTheme,
  })
  .addConfig({
    adaptiveThemes: false,
    initialTheme: "primary",
  });
