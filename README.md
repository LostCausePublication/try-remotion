# Logo insert

Upload an SVG or PNG, preview a zoom-in insert, and download an MP4. Rendering runs in the browser with [Remotion](https://www.remotion.dev/).

## Use it

```console
npm i
npm run dev
```

Open the URL Vite prints. Use Chrome, and keep the tab visible while a render is in progress.

Defaults are 3840×2160, 30 fps, 3 seconds, and a zoom of 1.10. The downloaded file uses the logo’s name (`lostcause.png` becomes `lostcause.mp4`) unless you change **File name**.

Name and subtitle are optional lines under the logo. Font is any Google Font name, such as `Inter`.

## Studio

`npm run studio` opens Remotion Studio with the sample logo and the same defaults.

## License

Remotion has its own license terms for some companies. [Read them here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
