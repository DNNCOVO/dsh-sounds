// harness-sounds client：DeepSeek Harness 提示音（Web Audio 合成，无音频文件依赖）。
// 经 EventSource 订阅 /harness-sounds/events，收到事件即播放。
// 自动播放策略：首次 pointerdown/keydown 解锁 AudioContext（autoplay policy），
// 解锁后页面在后台标签也能响（Firefox 后台 Web Audio 继续播放）。
const EVENTS_PATH = '/harness-sounds/events'

let sfxCtx = null
let unlocked = false

function unlockAudio() {
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (Ctor && !sfxCtx) sfxCtx = new Ctor()
    if (sfxCtx && sfxCtx.state === 'suspended') sfxCtx.resume()
    unlocked = true
  } catch {}
}

document.addEventListener('pointerdown', unlockAudio, { once: true })
document.addEventListener('keydown', unlockAudio, { once: true })

function playSfx(kind) {
  try {
    unlockAudio()
    if (!sfxCtx) return
    const t0 = sfxCtx.currentTime
    if (kind === 'celebrate') {
      // 欢快上行三音（任务完成/升级/称号/回合完成）
      ;[523.25, 659.25, 783.99].forEach((f, i) => {
        const o = sfxCtx.createOscillator(); o.type = 'sine'; o.frequency.value = f
        const g = sfxCtx.createGain()
        g.gain.setValueAtTime(0, t0 + i * 0.13)
        g.gain.linearRampToValueAtTime(0.16, t0 + i * 0.13 + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.13 + 0.38)
        o.connect(g); g.connect(sfxCtx.destination)
        o.start(t0 + i * 0.13); o.stop(t0 + i * 0.13 + 0.42)
      })
    } else if (kind === 'error') {
      // 低音警示（嘟——）
      const o = sfxCtx.createOscillator(); o.type = 'square'; o.frequency.value = 170
      const g = sfxCtx.createGain()
      g.gain.setValueAtTime(0.1, t0)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5)
      o.connect(g); g.connect(sfxCtx.destination)
      o.start(t0); o.stop(t0 + 0.55)
    } else if (kind === 'wait') {
      // 轻柔提示（叮）
      const o = sfxCtx.createOscillator(); o.type = 'sine'; o.frequency.value = 880
      const g = sfxCtx.createGain()
      g.gain.setValueAtTime(0, t0)
      g.gain.linearRampToValueAtTime(0.08, t0 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25)
      o.connect(g); g.connect(sfxCtx.destination)
      o.start(t0); o.stop(t0 + 0.3)
    }
  } catch {}
}

function connect() {
  try {
    if (!window.EventSource) return
    const es = new EventSource(EVENTS_PATH)
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data || '{}')
        const kind = typeof payload.kind === 'string' ? payload.kind : null
        if (kind === 'celebrate' || kind === 'turn') playSfx('celebrate')
        else if (kind === 'error') playSfx('error')
        else if (kind === 'wait') playSfx('wait')
      } catch {}
    }
    es.onerror = () => { /* 自动重连（EventSource 内建） */ }
  } catch {}
}

export function apply() {
  // 页面就绪后连接（EventSource 可在 DOMContentLoaded 前建立；延迟无害且稳）。
  connect()
  return () => {}
}

export default { apply }
