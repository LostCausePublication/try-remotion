import { getAvailableFonts, type GoogleFont } from "@remotion/google-fonts";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { continueRender, delayRender } from "remotion";

const availableFonts = getAvailableFonts();

export const googleFontNames = availableFonts.map((font) => font.fontFamily);

export const findGoogleFont = (fontName: string) => {
  const query = fontName.trim().toLowerCase();
  if (!query) {
    return undefined;
  }

  return availableFonts.find((font) => font.fontFamily.toLowerCase() === query);
};

const preferredWeights = ["600", "500", "400", "700"];

const loadFontFace = async (font: GoogleFont) => {
  const info = font.getInfo();
  const styles = Object.keys(info.fonts);
  const style = styles.includes("normal") ? "normal" : styles[0];
  const availableWeights = style ? Object.keys(info.fonts[style] ?? {}) : [];
  const weights = preferredWeights
    .filter((weight) => availableWeights.includes(weight))
    .slice(0, 4);
  const subsets = info.subsets.includes("latin")
    ? ["latin"]
    : info.subsets.slice(0, 1);

  if (style && weights.length > 0 && subsets.length > 0) {
    const loaded = font.loadFont(style, {
      weights,
      subsets,
      ignoreTooManyRequestsWarning: true,
    });
    await loaded.waitUntilDone();
    return loaded.fontFamily;
  }

  if (!font.loadVariableFont || subsets.length === 0) {
    throw new Error(`No loadable styles for ${info.fontFamily}`);
  }

  const variable = font.loadVariableFont("normal", {
    subsets,
    ignoreTooManyRequestsWarning: true,
  });
  await variable.waitUntilDone();
  return variable.fontFamily;
};

export const useLogoFont = (fontName: string) => {
  const [fontFamily, setFontFamily] = useState("sans-serif");

  useEffect(() => {
    const handle = delayRender(`Loading ${fontName}`);
    let finished = false;
    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      continueRender(handle);
    };

    const match = findGoogleFont(fontName);
    if (!match) {
      flushSync(() => {
        setFontFamily("sans-serif");
      });
      finish();
      return;
    }

    match
      .load()
      .then((font) => loadFontFace(font))
      .then((family) => {
        if (finished) {
          return;
        }
        flushSync(() => {
          setFontFamily(family);
        });
        finish();
      })
      .catch(() => {
        if (!finished) {
          flushSync(() => {
            setFontFamily("sans-serif");
          });
        }
        finish();
      });

    return () => {
      finish();
    };
  }, [fontName]);

  return fontFamily;
};
