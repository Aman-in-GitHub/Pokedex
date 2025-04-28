import React from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, View, Pressable, Vibration, ToastAndroid } from "react-native";

export default function PokedexListItem({ item, styles }) {
  const router = useRouter();

  return (
    <Pressable
      style={[
        {
          height: 150,
          width: "100%",
          borderRadius: 16,
          flexDirection: "row",
          overflow: "hidden",
          backgroundColor: item.color,
          paddingHorizontal: 20,
        },
        styles.centered,
      ]}
      android_ripple={
        !item.isUnlocked ? { borderless: false, foreground: true } : null
      }
      onPress={() => {
        if (item.isUnlocked) {
          router.navigate({
            pathname: "/detail",
            params: { item: JSON.stringify(item) },
          });
        } else {
          Vibration.vibrate(100);

          router.navigate({
            pathname: "/detail",
            params: { item: JSON.stringify(item) },
          });

          ToastAndroid.show(
            "Pokémon is yet to be unlocked",
            ToastAndroid.SHORT,
          );
        }
      }}
    >
      {!item.isUnlocked ? (
        <>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontFamily: "Solid", letterSpacing: 1 }}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </Text>

            <View style={{ gap: 6, marginTop: 6 }}>
              {item.types.map((type: string) => (
                <View
                  key={`${item.name}-${type}`}
                  style={[
                    {
                      paddingVertical: 4,
                      paddingHorizontal: 16,
                      borderRadius: 1000,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                    styles.centered,
                  ]}
                >
                  <Text style={{ fontSize: 10, fontFamily: "Regular" }}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Text
            style={{
              fontSize: 25,
              fontFamily: "Solid",
              position: "absolute",
              top: 0,
              right: 16,
              opacity: 0.1,
              letterSpacing: 3,
            }}
          >
            #${item.id}
          </Text>

          <Image
            style={{
              width: 75,
              height: 75,
            }}
            transition={100}
            contentFit="cover"
            source={item.image}
          />
        </>
      ) : (
        <Image
          style={{
            width: 100,
            height: 100,
          }}
          transition={100}
          contentFit="cover"
          source={require("@/assets/images/locked.png")}
        />
      )}
    </Pressable>
  );
}
