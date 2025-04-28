export function lightenColor(color: string, opacity = 0.2) {
  "worklet";

  return (
    color +
    Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")
  );
}
