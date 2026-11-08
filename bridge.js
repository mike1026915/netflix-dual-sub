// Isolated world → page: pass language settings via a DOM attribute + event
const send = cfg => {
  document.documentElement.dataset.dualSub = JSON.stringify([cfg.a, cfg.b]);
  window.dispatchEvent(new Event('dual-sub-langs'));
};
chrome.storage.sync.get({ a: 'zh-Hant', b: 'en' }, send);
chrome.storage.onChanged.addListener(() => chrome.storage.sync.get({ a: 'zh-Hant', b: 'en' }, send));
