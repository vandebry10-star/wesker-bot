// wesker-bot · febry.is-a.dev · github.com/vandebry10-star/wesker-bot


export const BOT_INFO = {
  name: 'Wesker MD',
  owner: 'Febry Wesker',
  version: '1.0.0',
  prefix: ['.', '!', '#'],
  description: 'Professional WhatsApp Bot Base - Clean, Modular, Scalable'
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// format dari satuan detik (untuk uptime / runtime)
export const formatSeconds = (s) => {
  s = Math.floor(s);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
};
