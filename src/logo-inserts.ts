export type LogoInsertProps = {
  logoSrc: string;
  label: string;
  subtitle: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  fontName: string;
  zoom: number;
};

export const defaultSettings = {
  width: 3840,
  height: 2160,
  fps: 30,
  durationInSeconds: 3,
  zoom: 1.1,
  backgroundColor: "#f9f7f2",
  accentColor: "#ffffff",
  textColor: "#000000",
  fontName: "Inter",
  label: "",
  subtitle: "",
};

export const durationInFramesFor = (durationInSeconds: number, fps: number) => {
  return Math.max(1, Math.round(durationInSeconds * fps));
};
