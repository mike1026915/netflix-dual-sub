// Isolated world → page: pass settings via a DOM attribute + event
const DEFAULTS = { a: 'zh-Hant', b: 'en', on: true };
const send = cfg => {
  document.documentElement.dataset.dualSub = JSON.stringify(cfg);
  window.dispatchEvent(new Event('dual-sub-langs'));
};
chrome.storage.sync.get(DEFAULTS, send);
chrome.storage.onChanged.addListener(() => chrome.storage.sync.get(DEFAULTS, send));
