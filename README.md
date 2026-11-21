# Netflix Dual Subtitles

Chrome extension (Manifest V3) that shows two subtitle languages at once on Netflix.

## Install

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Open any title on `netflix.com`.

## Usage

Click the extension icon:

- **啟用雙語字幕** – toggle on/off
- **上方字幕 / 下方字幕** – pick the two languages (default: 繁體中文 + English; choose （無） to show only one)
- **重新載入字幕** – re-download subtitles if they look wrong

Turn off Netflix's built-in subtitles, otherwise they overlap with this overlay.

## How it works

- `inject.js` (page context) adds a WebVTT profile to Netflix's playback request, reads the subtitle track list from the manifest, downloads the chosen tracks (WebVTT, or TTML as fallback) and draws them over the player.
- `bridge.js` passes settings from `chrome.storage` to the page.
- `popup.html` / `popup.js` is the settings UI.

## Limitations

Relies on undocumented Netflix manifest fields, so it may break when Netflix changes them. A language only works if the title offers that subtitle track.
