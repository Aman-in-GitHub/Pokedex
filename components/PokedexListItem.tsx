import React from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, View, Pressable, Vibration, ToastAndroid } from "react-native";

import { capitalizeFirstLetter } from "@/lib/utils";

export default function PokedexListItem({ item, styles }: any) {
  return (
    <Pressable
      style={[
        {
          height: 150,
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          flexDirection: "row",
          paddingHorizontal: 20,
          backgroundColor: item.color,
        },
        styles.centered,
      ]}
      android_ripple={
        item.isCaught ? { borderless: false, foreground: true } : null
      }
      onPress={() => {
        if (item.isCaught) {
          router.navigate({
            pathname: "/detail",
            params: { item: JSON.stringify(item) },
          });
        } else {
          Vibration.vibrate(100);

          ToastAndroid.show("Pokémon not caught yet", ToastAndroid.SHORT);
        }
      }}
    >
      {item.isCaught ? (
        <>
          <View style={{ marginLeft: 16 }}>
            <Text style={{ fontFamily: "Solid", letterSpacing: 1 }}>
              {capitalizeFirstLetter(item.name)}
            </Text>

            <View style={{ gap: 6, marginTop: 6 }}>
              {item.types.map((type: string) => (
                <View
                  key={`${item.name}-${type}`}
                  style={[
                    {
                      borderRadius: 1000,
                      paddingVertical: 4,
                      paddingHorizontal: 16,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                    styles.centered,
                  ]}
                >
                  <Text style={{ fontSize: 10, fontFamily: "Regular" }}>
                    {capitalizeFirstLetter(type)}
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
            transition={150}
            contentFit="cover"
            source={item.isShiny ? item.shiny || item.image : item.image}
          />
        </>
      ) : (
        <Image
          style={{
            width: 100,
            height: 100,
          }}
          transition={150}
          contentFit="cover"
          source={require("@/assets/images/locked.png")}
        />
      )}
    </Pressable>
  );
}
