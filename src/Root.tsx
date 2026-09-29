import "./index.css";
import { Composition, staticFile } from "remotion";
import { LogoInsert } from "./LogoInsert";
import { defaultSettings, durationInFramesFor } from "./logo-inserts";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LogoInsert"
      component={LogoInsert}
      durationInFrames={durationInFramesFor(
        defaultSettings.durationInSeconds,
        defaultSettings.fps,
      )}
      fps={defaultSettings.fps}
      width={defaultSettings.width}
      height={defaultSettings.height}
      defaultProps={{
        logoSrc: staticFile("logos/sample.svg"),
        label: defaultSettings.label,
        subtitle: defaultSettings.subtitle,
        backgroundColor: defaultSettings.backgroundColor,
        accentColor: defaultSettings.accentColor,
        textColor: defaultSettings.textColor,
        fontName: defaultSettings.fontName,
        zoom: defaultSettings.zoom,
      }}
    />
  );
};
