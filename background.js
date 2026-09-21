// Same check gongo.tv's own server does: live if the first result is type "live".
const API = 'https://api.angelthump.com/v3/streams?username=greatsphynx';
const STREAM_URL = 'https://gongo.tv/stream';
const CHECK_EVERY_MINUTES = 1;

const STATES = {
  live: { text: 'LIVE', color: '#e0245e', icon: 'live', title: 'Gongo is LIVE - click to watch' },
  off:  { text: 'OFF',  color: '#555555', icon: 'off',  title: 'Gongo is offline' },
  err:  { text: '?',    color: '#a06a00', icon: 'off',  title: 'Gongo - could not reach AngelThump' }
};

async function check() {
  let state = 'off';
  try {
    const res = await fetch(API, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state = Array.isArray(data) && data.length > 0 && data[0]?.type === 'live' ? 'live' : 'off';
  } catch {
    state = 'err';
  }
  await show(state);
}

async function show(state) {
  const s = STATES[state];
  await chrome.action.setBadgeText({ text: s.text });
  await chrome.action.setBadgeBackgroundColor({ color: s.color });
  await chrome.action.setBadgeTextColor({ color: '#ffffff' });
  await chrome.action.setTitle({ title: s.title });
  await chrome.action.setIcon({
    path: {
      16: `icons/${s.icon}16.png`,
      32: `icons/${s.icon}32.png`,
      48: `icons/${s.icon}48.png`,
      128: `icons/${s.icon}128.png`
    }
  });
}

function start() {
  chrome.alarms.create('gongo-check', { periodInMinutes: CHECK_EVERY_MINUTES });
  check();
}

chrome.runtime.onInstalled.addListener(start);
chrome.runtime.onStartup.addListener(start);
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'gongo-check') check();
});
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: STREAM_URL });
  check();
});
