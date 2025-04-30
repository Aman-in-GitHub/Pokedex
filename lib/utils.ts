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
): Promise<string | null> {
  try {
    const sourcePath = mediaPath.startsWith("file://")
      ? mediaPath
      : `file://${mediaPath}`;
    const filename = `${Date.now()}.jpg`;
    const targetDirectory = `${FileSystem.documentDirectory}caught/`;

    const dirInfo = await FileSystem.getInfoAsync(targetDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetDirectory, {
        intermediates: true,
      });
    }

    const destinationPath = `${targetDirectory}${filename}`;
    await FileSystem.copyAsync({ from: sourcePath, to: destinationPath });

    FileSystem.deleteAsync(sourcePath, { idempotent: true }).catch((error) => {
      console.error("Failed to delete source file:", error);
    });

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

    const response = await fetch("http://localhost:5000/pokedex", {
      method: "POST",
      body: formData,
    });

    result = await response.json();
  } catch (error) {
    console.error("Picture upload failed:", error);
  }

  return result;
}
