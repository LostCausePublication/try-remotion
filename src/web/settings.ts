import {
  defaultSettings,
  durationInFramesFor,
  type LogoInsertProps,
} from "../logo-inserts";
import { findGoogleFont } from "../fonts";

export type FormState = LogoInsertProps & {
  chosenFileName: string;
  downloadName: string;
  durationInSeconds: number;
  width: number;
  height: number;
  fps: number;
};

export const initialFormState = (): FormState => ({
  logoSrc: "",
  chosenFileName: "",
  downloadName: "",
  label: defaultSettings.label,
  subtitle: defaultSettings.subtitle,
  backgroundColor: defaultSettings.backgroundColor,
  accentColor: defaultSettings.accentColor,
  textColor: defaultSettings.textColor,
  fontName: defaultSettings.fontName,
  zoom: defaultSettings.zoom,
  durationInSeconds: defaultSettings.durationInSeconds,
  width: defaultSettings.width,
  height: defaultSettings.height,
  fps: defaultSettings.fps,
});

const hexColor = /^#[0-9a-fA-F]{6}$/;

export const isLogoFile = (file: File) => {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".svg") ||
    name.endsWith(".png") ||
    file.type === "image/png" ||
    file.type === "image/svg+xml"
  );
};

export const baseName = (filename: string) => {
  return filename.replace(/\.[^.]+$/, "");
};

export const ensureMp4 = (name: string) => {
  const trimmed = name.trim();
  if (/\.mp4$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}.mp4`;
};

export const insertProps = (form: FormState): LogoInsertProps => ({
  logoSrc: form.logoSrc,
  label: form.label,
  subtitle: form.subtitle,
  backgroundColor: form.backgroundColor,
  accentColor: form.accentColor,
  textColor: form.textColor,
  fontName: form.fontName.trim(),
  zoom: form.zoom,
});

export const getSettingsError = (form: FormState) => {
  if (!form.logoSrc) {
    return "Choose an SVG or PNG logo.";
  }
  if (!Number.isFinite(form.zoom) || form.zoom < 1) {
    return "Zoom must be at least 1.";
  }
  if (!Number.isFinite(form.durationInSeconds) || form.durationInSeconds <= 0) {
    return "Duration must be greater than 0.";
  }
  if (!Number.isInteger(form.fps) || form.fps < 1) {
    return "FPS must be a whole number of at least 1.";
  }
  if (!Number.isInteger(form.width) || form.width < 2 || form.width % 2 !== 0) {
    return "Width must be an even number of at least 2.";
  }
  if (
    !Number.isInteger(form.height) ||
    form.height < 2 ||
    form.height % 2 !== 0
  ) {
    return "Height must be an even number of at least 2.";
  }
  if (!hexColor.test(form.backgroundColor)) {
    return "Background color must be a hex color like #f9f7f2.";
  }
  if (!hexColor.test(form.accentColor)) {
    return "Glow color must be a hex color like #ffffff.";
  }
  if (!hexColor.test(form.textColor)) {
    return "Font color must be a hex color like #000000.";
  }
  if (!findGoogleFont(form.fontName)) {
    return "Font must be a Google Font name, such as Inter.";
  }
  if (!form.downloadName.trim()) {
    return "Enter a file name.";
  }
  return null;
};

export const frameCount = (form: FormState) => {
  return durationInFramesFor(form.durationInSeconds, form.fps);
};
