import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  File,
  Type,
} from "@google/genai";
import { Hono } from "hono";
import { logger } from "hono/logger";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const app = new Hono();

app.use(logger());

app.get("/", (c) => {
  return c.text("Pikachu");
});

app.post("/pokedex", async (c) => {
  try {
    const body = await c.req.parseBody();
    const picture: any = body["mon"];

    if (!picture || !picture.type) {
      return c.json(
        {
          success: false,
          message: "Invalid picture, Try again",
        },
        400,
      );
    }

    const pokemon: File = await ai.files.upload({
      file: picture,
      config: { mimeType: picture.type },
    });

    const MAX_RETRIES = 3;
    let attempts = 0;
    let validResponse = false;
    let result;

    while (!validResponse && attempts < MAX_RETRIES) {
      attempts++;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: createUserContent([
            createPartFromUri(
              pokemon.uri as string,
              pokemon.mimeType as string,
            ),
            "Please identify what Pokémon this image most resembles. Take into consideration it's shape, it's color & it's looks. Look for pokémons across all generations until now. The image may be a drawing, toy, real animal, mythical creature, or object that shares it's looks or characteristics with a Pokémon. Return only the official pokémon name (in lowercase) and its official pokédex number like(9, 25 or 813). If multiple Pokémon are possible matches, list only the closest match. If it matches no pokemon return {dexNumber:'undefined', name:'undefined'} No explanations or additional text.",
          ]),
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "Name of the pokemon (in lowercase)",
                    nullable: false,
                  },
                  dexNumber: {
                    type: Type.STRING,
                    description: "Pokedex number (in number)",
                    nullable: false,
                  },
                },
                required: ["name", "dexNumber"],
              },
            },
          },
        });

        result = JSON.parse(response.text || "[]");

        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0].name &&
          result[0].dexNumber
        ) {
          validResponse = true;
        } else {
          console.log(`Attempt ${attempts}: Invalid response format`);
        }
      } catch (parseError) {
        console.error(
          `Attempt ${attempts}: Error parsing response:`,
          parseError,
        );
      }
    }

    if (!validResponse) {
      return c.json(
        {
          success: false,
          message: "Failed to identify Pokémon after multiple attempts",
        },
        500,
      );
    }

    console.log(`Found: ${result[0].dexNumber} - ${result[0].name}`);

    return c.json({
      success: true,
      message: result,
    });
  } catch (error) {
    console.error("Error processing request:", error);

    return c.json(
      {
        success: false,
        message: "An error occurred while processing your request",
      },
      500,
    );
  }
});

export default app;
