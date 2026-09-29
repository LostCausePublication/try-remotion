import { Player } from "@remotion/player";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import { useEffect, useState } from "react";
import { googleFontNames } from "../fonts";
import { LogoInsert } from "../LogoInsert";
import {
  baseName,
  ensureMp4,
  frameCount,
  getSettingsError,
  initialFormState,
  insertProps,
  isLogoFile,
  type FormState,
} from "./settings";
import "./app.css";

const readNumber = (value: string) => {
  return value === "" ? Number.NaN : Number(value);
};

export const App = () => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [browserIssue, setBrowserIssue] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (form.logoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(form.logoSrc);
      }
    };
  }, [form.logoSrc]);

  useEffect(() => {
    let cancelled = false;
    canRenderMediaOnWeb({
      container: "mp4",
      videoCodec: "h264",
      width: 1920,
      height: 1080,
      muted: true,
    }).then((result) => {
      if (cancelled || result.canRender) {
        return;
      }
      const blocking = result.issues.find(
        (issue) => issue.severity === "error",
      );
      setBrowserIssue(
        blocking?.message ?? "This browser cannot render an MP4. Use Chrome.",
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const settingsError = getSettingsError(form);
  const canPreview =
    form.logoSrc !== "" &&
    Number.isInteger(form.width) &&
    form.width >= 2 &&
    Number.isInteger(form.height) &&
    form.height >= 2 &&
    Number.isInteger(form.fps) &&
    form.fps >= 1 &&
    Number.isFinite(form.durationInSeconds) &&
    form.durationInSeconds > 0;
  const frames = canPreview ? frameCount(form) : 1;
  const props = insertProps(form);

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const onFile = (file: File | undefined) => {
    if (!file) {
      return;
    }
    if (!isLogoFile(file)) {
      setRenderError("Use an SVG or PNG file.");
      return;
    }
    setRenderError(null);
    const url = URL.createObjectURL(file);
    setForm((current) => ({
      ...current,
      logoSrc: url,
      chosenFileName: file.name,
      downloadName: baseName(file.name),
    }));
  };

  const onDownload = async () => {
    const error = getSettingsError(form);
    if (error) {
      setRenderError(error);
      return;
    }

    setRendering(true);
    setProgress(0);
    setRenderError(null);
    try {
      const check = await canRenderMediaOnWeb({
        container: "mp4",
        videoCodec: "h264",
        width: form.width,
        height: form.height,
        muted: true,
      });
      if (!check.canRender) {
        const blocking = check.issues.find(
          (issue) => issue.severity === "error",
        );
        setRenderError(
          blocking?.message ?? "This browser cannot render an MP4. Use Chrome.",
        );
        return;
      }

      const inputProps = insertProps(form);
      const result = await renderMediaOnWeb({
        composition: {
          component: LogoInsert,
          id: "LogoInsert",
          width: form.width,
          height: form.height,
          fps: form.fps,
          durationInFrames: frameCount(form),
          defaultProps: inputProps,
        },
        inputProps,
        muted: true,
        licenseKey: "free-license",
        onProgress: ({ progress: nextProgress }) => {
          setProgress(nextProgress);
        },
      });
      const blob = await result.getBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = ensureMp4(form.downloadName);
      link.click();
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1500);
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "Render failed.");
    } finally {
      setRendering(false);
    }
  };

  return (
    <main className="page">
      <header className="header">
        <h1>Try Remotion</h1>
        <p>Upload a logo, set the zoom, and download an MP4.</p>
      </header>
      {browserIssue ? <p className="banner">{browserIssue}</p> : null}
      <div className="layout">
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            void onDownload();
          }}
        >
          <label className="field">
            <span>Logo</span>
            <span className="file-row">
              <input
                className="file-input"
                type="file"
                accept=".svg,.png,image/svg+xml,image/png"
                disabled={rendering}
                onChange={(event) => {
                  onFile(event.target.files?.[0]);
                }}
              />
              <span className="file-button">Choose logo</span>
              <span className="file-name">
                {form.chosenFileName || "SVG or PNG"}
              </span>
            </span>
          </label>

          <div className="grid">
            <label className="field">
              <span>Zoom</span>
              <input
                type="number"
                min={1}
                step={0.01}
                value={Number.isFinite(form.zoom) ? form.zoom : ""}
                disabled={rendering}
                onChange={(event) => {
                  update({ zoom: readNumber(event.target.value) });
                }}
              />
            </label>
            <label className="field">
              <span>Duration (seconds)</span>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={
                  Number.isFinite(form.durationInSeconds)
                    ? form.durationInSeconds
                    : ""
                }
                disabled={rendering}
                onChange={(event) => {
                  update({ durationInSeconds: readNumber(event.target.value) });
                }}
              />
            </label>
            <label className="field">
              <span>Width</span>
              <input
                type="number"
                min={2}
                step={2}
                value={Number.isFinite(form.width) ? form.width : ""}
                disabled={rendering}
                onChange={(event) => {
                  update({ width: readNumber(event.target.value) });
                }}
              />
            </label>
            <label className="field">
              <span>Height</span>
              <input
                type="number"
                min={2}
                step={2}
                value={Number.isFinite(form.height) ? form.height : ""}
                disabled={rendering}
                onChange={(event) => {
                  update({ height: readNumber(event.target.value) });
                }}
              />
            </label>
            <label className="field">
              <span>FPS</span>
              <input
                type="number"
                min={1}
                step={1}
                value={Number.isFinite(form.fps) ? form.fps : ""}
                disabled={rendering}
                onChange={(event) => {
                  update({ fps: readNumber(event.target.value) });
                }}
              />
            </label>
            <label className="field">
              <span>Font</span>
              <input
                type="text"
                list="google-fonts"
                spellCheck={false}
                value={form.fontName}
                disabled={rendering}
                onChange={(event) => {
                  update({ fontName: event.target.value });
                }}
              />
            </label>
          </div>
          <datalist id="google-fonts">
            {googleFontNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="colors">
            <ColorField
              label="Background"
              value={form.backgroundColor}
              disabled={rendering}
              onChange={(backgroundColor) => {
                update({ backgroundColor });
              }}
            />
            <ColorField
              label="Glow"
              value={form.accentColor}
              disabled={rendering}
              onChange={(accentColor) => {
                update({ accentColor });
              }}
            />
            <ColorField
              label="Font color"
              value={form.textColor}
              disabled={rendering}
              onChange={(textColor) => {
                update({ textColor });
              }}
            />
          </div>

          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.label}
              placeholder="Shown under the logo"
              disabled={rendering}
              onChange={(event) => {
                update({ label: event.target.value });
              }}
            />
          </label>
          <label className="field">
            <span>Subtitle</span>
            <input
              type="text"
              value={form.subtitle}
              placeholder="Smaller line under the name"
              disabled={rendering}
              onChange={(event) => {
                update({ subtitle: event.target.value });
              }}
            />
          </label>
          <label className="field">
            <span>File name</span>
            <input
              type="text"
              value={form.downloadName}
              spellCheck={false}
              disabled={rendering}
              onChange={(event) => {
                update({ downloadName: event.target.value });
              }}
            />
            <small>
              {form.downloadName.trim()
                ? ensureMp4(form.downloadName)
                : "Matches the logo file"}
            </small>
          </label>

          {form.logoSrc && settingsError ? (
            <p className="error">{settingsError}</p>
          ) : null}
          {renderError ? <p className="error">{renderError}</p> : null}
          {rendering ? (
            <div
              className="progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
              <span>{Math.round(progress * 100)}%</span>
            </div>
          ) : null}
          <button type="submit" disabled={rendering || settingsError !== null}>
            {rendering ? "Rendering…" : "Download MP4"}
          </button>
          <p className="hint">
            Keep this tab visible while rendering. 4K can take a few minutes.
            Use Chrome.
          </p>
        </form>

        <section className="preview">
          {canPreview ? (
            <Player
              key={`${form.width}x${form.height}-${form.fps}-${frames}`}
              component={LogoInsert}
              inputProps={props}
              durationInFrames={frames}
              compositionWidth={form.width}
              compositionHeight={form.height}
              fps={form.fps}
              controls
              loop
              acknowledgeRemotionLicense
              style={{ width: "100%" }}
            />
          ) : (
            <div className="empty">
              Choose an SVG or PNG to preview the insert.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const ColorField = ({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) => {
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return (
    <label className="field">
      <span>{label}</span>
      <span className="color-row">
        <input
          type="color"
          value={pickerValue}
          disabled={disabled}
          aria-label={`${label} picker`}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <input
          type="text"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      </span>
    </label>
  );
};
