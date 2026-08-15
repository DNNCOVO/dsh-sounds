(function () {
  function __boot() {
    if (window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === "function") {
      window.__ModuleLoader__.load({
        id: "harness-sounds",
        factory: (require) => {
          var module = { exports: {} };
          var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// profiles/web/node_modules/harness-sounds/.dsh-plugin/client/index.mjs
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var EVENTS_PATH = "/harness-sounds/events";
var sfxCtx = null;
var unlocked = false;
function unlockAudio() {
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor && !sfxCtx) sfxCtx = new Ctor();
    if (sfxCtx && sfxCtx.state === "suspended") sfxCtx.resume();
    unlocked = true;
  } catch {
  }
}
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
function playSfx(kind) {
  try {
    unlockAudio();
    if (!sfxCtx) return;
    const t0 = sfxCtx.currentTime;
    if (kind === "celebrate") {
      ;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = sfxCtx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = sfxCtx.createGain();
        g.gain.setValueAtTime(0, t0 + i * 0.13);
        g.gain.linearRampToValueAtTime(0.16, t0 + i * 0.13 + 0.02);
        g.gain.exponentialRampToValueAtTime(1e-3, t0 + i * 0.13 + 0.38);
        o.connect(g);
        g.connect(sfxCtx.destination);
        o.start(t0 + i * 0.13);
        o.stop(t0 + i * 0.13 + 0.42);
      });
    } else if (kind === "error") {
      const o = sfxCtx.createOscillator();
      o.type = "square";
      o.frequency.value = 170;
      const g = sfxCtx.createGain();
      g.gain.setValueAtTime(0.1, t0);
      g.gain.exponentialRampToValueAtTime(1e-3, t0 + 0.5);
      o.connect(g);
      g.connect(sfxCtx.destination);
      o.start(t0);
      o.stop(t0 + 0.55);
    } else if (kind === "wait") {
      const o = sfxCtx.createOscillator();
      o.type = "sine";
      o.frequency.value = 880;
      const g = sfxCtx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.08, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(1e-3, t0 + 0.25);
      o.connect(g);
      g.connect(sfxCtx.destination);
      o.start(t0);
      o.stop(t0 + 0.3);
    }
  } catch {
  }
}
function connect() {
  try {
    if (!window.EventSource) return;
    const es = new EventSource(EVENTS_PATH);
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data || "{}");
        const kind = typeof payload.kind === "string" ? payload.kind : null;
        if (kind === "celebrate" || kind === "turn") playSfx("celebrate");
        else if (kind === "error") playSfx("error");
        else if (kind === "wait") playSfx("wait");
      } catch {
      }
    };
    es.onerror = () => {
    };
  } catch {
  }
}
function apply() {
  connect();
  return () => {
  };
}
var index_default = { apply };
          return module.exports;
        }
      });
    } else {
      setTimeout(__boot, 50);
    }
  }
  __boot();
})();
