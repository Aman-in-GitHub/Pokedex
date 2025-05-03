import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";

export function lightenColor(color: string, opacity = 0.2) {
  "worklet";

  return (
    color +
    Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")
  );
}

export async function savePokemonToDex(
  mediaPath: string,
  directory: string,
): Promise<string | null> {
  try {
    const sourcePath = mediaPath.startsWith("file://")
      ? mediaPath
      : `file://${mediaPath}`;
    const filename = `${Date.now()}.jpg`;
    const targetDirectory = `${FileSystem.documentDirectory}${directory}/`;

    const dirInfo = await FileSystem.getInfoAsync(targetDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetDirectory, {
        intermediates: true,
      });
    }

    const destinationPath = `${targetDirectory}${filename}`;
    await FileSystem.copyAsync({ from: sourcePath, to: destinationPath });

    return destinationPath;
  } catch (error) {
    console.error("Failed to save photo:", error);
    return null;
  }
}

export async function verifyWithPokedex(mediaPath: string) {
  let result = null;

  try {
    const fileInfo = await FileSystem.getInfoAsync(mediaPath);

    if (!fileInfo.exists) {
      throw new Error("File does not exist at " + mediaPath);
    }

    const formData = new FormData();
    formData.append("mon", {
      uri: mediaPath,
      name: `${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pokedex`, {
      method: "POST",
      body: formData,
    });

    result = await response.json();
  } catch (error) {
    console.error("Picture upload failed:", error);
  }

  return result;
}

export async function getCurrentLocation() {
  let location = await Location.getCurrentPositionAsync({});

  const { longitude, latitude } = location.coords;

  return [longitude, latitude];
}

export function formatISODate(isoString: string) {
  const date = new Date(isoString);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const time = date.toLocaleTimeString("en-US", timeOptions).toLowerCase();

  const day = date.getDate();
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const dateFormatted = `${day}${getOrdinal(day)} of ${monthName}, ${year}`;

  return {
    time,
    date: dateFormatted,
  };
}

export function sanitizeForSpeech(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9\s.,!?']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function cleanDirectory(directory: string) {
  try {
    const targetDirectory = `${FileSystem.documentDirectory}${directory}/`;

    const dirInfo = await FileSystem.getInfoAsync(targetDirectory);

    if (dirInfo.exists) {
      const files = await FileSystem.readDirectoryAsync(targetDirectory);

      const deletionPromises = files.map((file) =>
        FileSystem.deleteAsync(`${targetDirectory}${file}`, {
          idempotent: true,
        }),
      );

      await Promise.all(deletionPromises);

      console.log(`Cleaned up ${files.length} files from ${directory}`);
    }
  } catch (error) {
    console.error(`Error cleaning up temp directory: ${error}`);
  }
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
