const LANGS = { 'zh-Hant': '繁體中文', 'zh-Hans': '簡體中文', en: 'English', ja: '日本語', ko: '한국어',
  es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano', pt: 'Português', th: 'ไทย', vi: 'Tiếng Việt', id: 'Indonesia', '': '（無）' };
chrome.storage.sync.get({ a: 'zh-Hant', b: 'en', on: true }, cfg => {
  for (const id of ['a', 'b']) {
    const sel = document.getElementById(id);
    sel.innerHTML = Object.entries(LANGS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    sel.value = cfg[id];
    sel.onchange = () => chrome.storage.sync.set({ [id]: sel.value });
  }
  const on = document.getElementById('on');
  on.checked = cfg.on;
  on.onchange = () => chrome.storage.sync.set({ on: on.checked });
});
// Any storage change makes bridge.js re-send settings, which re-downloads subtitles
document.getElementById('reload').onclick = () => chrome.storage.local.set({ reloadAt: Date.now() });
