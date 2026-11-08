const PROFILES = ['webvtt-lssdh-ios8', 'imsc1.1', 'dfxp-ls-sdh'];
const cfg = () => { try { return JSON.parse(document.documentElement.dataset.dualSub); } catch { return { a: 'zh-Hant', b: 'en', on: true }; } };

let tracks = null;
let loadedId = null;
const manifests = {}; // movieId -> textTracks
const currentId = () => +location.pathname.match(/\/watch\/(\d+)/)?.[1];
let cues = [[], []];

// Ask Netflix for WebVTT subs too
const origStringify = JSON.stringify;
JSON.stringify = function (v, ...a) {
  if (v?.params?.profiles && !v.params.profiles.includes(PROFILES[0])) v.params.profiles.push(PROFILES[0]);
  return origStringify.call(this, v, ...a);
};

// Grab subtitle track list from the playback manifest
const origParse = JSON.parse;
JSON.parse = function (...a) {
  const r = origParse.apply(this, a);
  const tt = r?.result?.textTracks || r?.result?.timedtexttracks; // Netflix renamed the field in newer manifests
  // Netflix prefetches the NEXT episode's manifest near the end, so key by movieId
  // instead of taking whichever manifest arrived last.
  if (tt && r.result.movieId) manifests[r.result.movieId] = tt;
  return r;
};
window.addEventListener('dual-sub-langs', () => tracks && reload());

function reload() {
  [cfg().a, cfg().b].forEach((l, i) => load(l).then(c => cues[i] = c).catch(e => { cues[i] = []; console.warn('[dual-sub]', e); }));
}

async function load(lang) {
  if (!lang) return [];
  const ok = t => !t.isForcedNarrative && !t.isNoneTrack;
  const t = tracks.find(t => ok(t) && t.language === lang)
         || tracks.find(t => ok(t) && t.language?.startsWith(lang.split('-')[0]));
  if (!t) throw `no track for ${lang}; available: ${tracks.map(t => t.language)}`;
  const dl = t.downloadables || t.ttDownloadables;
  const p = PROFILES.find(p => dl?.[p]);
  const d = dl[p];
  const url = d.urls?.[0]?.url || Object.values(d.downloadUrls || {})[0];
  const text = await (await fetch(url)).text();
  return p.startsWith('webvtt') ? parseVtt(text) : parseTtml(text);
}

const ts = s => s.split(':').reduce((acc, x) => acc * 60 + parseFloat(x.replace(',', '.')), 0);

function parseVtt(text) {
  return text.split(/\r?\n\r?\n/).flatMap(b => {
    const lines = b.split(/\r?\n/);
    const i = lines.findIndex(l => l.includes('-->'));
    if (i < 0) return [];
    const [s, e] = lines[i].split('-->').map(x => ts(x.trim().split(' ')[0]));
    return [{ s, e, txt: lines.slice(i + 1).join('\n').replace(/<[^>]+>/g, '') }];
  });
}

function parseTtml(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const tick = +doc.documentElement.getAttribute('ttp:tickRate') || 10000000;
  const t = v => v.endsWith('t') ? parseInt(v) / tick : ts(v.replace(/s$/, ''));
  return [...doc.getElementsByTagName('p')].map(p => {
    p.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    return { s: t(p.getAttribute('begin')), e: t(p.getAttribute('end')), txt: p.textContent };
  });
}

// Overlay: two lines stacked at the bottom
const box = document.createElement('div');
box.style.cssText = 'position:absolute;bottom:10%;left:0;right:0;text-align:center;z-index:9999;pointer-events:none;' +
  'color:#fff;font-size:2.2vw;white-space:pre-line;text-shadow:0 0 4px #000,0 0 4px #000';
const lines = [0, 1].map(() => box.appendChild(document.createElement('div')));
lines[1].style.cssText = 'color:#ffd54f;font-size:0.85em';
setInterval(() => {
  const id = currentId();
  if (id !== loadedId && manifests[id]) { loadedId = id; tracks = manifests[id]; reload(); }
  box.style.display = cfg().on ? '' : 'none';
  const v = document.querySelector('video');
  if (!v) return;
  const host = v.closest('.watch-video') || v.parentElement;
  if (box.parentElement !== host) host.appendChild(box);
  const now = v.currentTime;
  cues.forEach((cs, i) => lines[i].textContent = cs.filter(c => now >= c.s && now <= c.e).map(c => c.txt).join('\n'));
}, 200);
