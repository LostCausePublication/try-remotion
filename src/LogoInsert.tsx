import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useLogoFont } from "./fonts";
import type { LogoInsertProps } from "./logo-inserts";

export const LogoInsert: React.FC<LogoInsertProps> = ({
  logoSrc,
  label,
  subtitle,
  backgroundColor,
  accentColor,
  textColor,
  fontName,
  zoom,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const fontFamily = useLogoFont(fontName);
  const lastFrame = Math.max(1, durationInFrames - 1);

  const progress = interpolate(frame, [0, lastFrame], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = 1 + (Math.max(zoom, 1) - 1) * progress;
  const logoWidth = Math.round(width * 0.42);
  const logoHeight = Math.round(height * 0.46);
  const glowSize = Math.round(Math.min(width, height) * 0.28);
  const glowBlur = Math.max(8, Math.round(Math.min(width, height) * 0.06));

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${scale})`,
          }}
        >
          <div
            style={{
              position: "relative",
              width: logoWidth,
              height: logoHeight,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: glowSize,
                height: glowSize,
                marginLeft: -glowSize / 2,
                marginTop: -glowSize / 2,
                borderRadius: "50%",
                backgroundColor: accentColor,
                opacity: 0.85,
                filter: `blur(${glowBlur}px)`,
              }}
            />
            {logoSrc ? (
              <Img
                src={logoSrc}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderWidth: 0
                }}
              />
            ) : null}
          </div>
          {label || subtitle ? (
            <div
              style={{
                marginTop: Math.round(height * 0.02),
                maxWidth: Math.round(width * 0.72),
                textAlign: "center",
                color: textColor,
              }}
            >
              {label ? (
                <div
                  style={{
                    fontSize: Math.round(height * 0.058),
                    fontWeight: 600,
                    letterSpacing: -1,
                    lineHeight: 1.1,
                  }}
                >
                  {label}
                </div>
              ) : null}
              {subtitle ? (
                <div
                  style={{
                    marginTop: Math.round(height * 0.012),
                    fontSize: Math.round(height * 0.028),
                    fontWeight: 500,
                    lineHeight: 1.3,
                    opacity: 0.72,
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
