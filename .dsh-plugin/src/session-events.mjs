// 会话事件边沿判定：纯函数，从官方 SessionEvent 判定 turn 边沿（零宿主依赖，可单测）。
// 契约：输入是宿主 `session/event` 回调的第二个参数（append 日志条目）：{ type, seq, time, data }。
// 事件类型字段是 `type`（'turn/start' | 'turn/end' | ...），不是 `kind`。
// 返回 null（非 turn 事件/结构异常）或 { kind: 'start' | 'end', blocked }；
// blocked 仅 turn/end 有意义：reason.kind === 'blocked'（回合被阻塞，等待用户批准/权限）。
export function parseTurnEvent(event) {
  if (event === null || typeof event !== 'object') return null
  const type = typeof event.type === 'string' ? event.type : null
  if (type === 'turn/start') return { kind: 'start', blocked: false }
  if (type === 'turn/end') {
    const reason = typeof event.data === 'object' && event.data !== null ? event.data.reason : null
    const blocked = typeof reason === 'object' && reason !== null && reason.kind === 'blocked'
    return { kind: 'end', blocked }
  }
  return null
}
