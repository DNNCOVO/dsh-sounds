// harness-sounds Node half：DeepSeek Harness 自己的提示音服务。
// 设计：声音是 Harness 的「系统提示音」——任务完成/失败/请求错误/回合完成/等待批准
// 由 host 事件驱动，经独立 SSE 端点推送；client 订阅后播放。完全独立：
// - 事件源直接订阅官方服务（jobs.onJobDone / agent/request-error / session/event）
// - 独立端点 /harness-sounds/events，不依赖任何其他插件
// 提示音不依赖任何界面元素是否显示/安装，事件发生即播放。
import { parseTurnEvent } from './src/session-events.mjs'

export const name = 'harness-sounds'
export const inject = ['jobs', 'agents', 'sessions', 'settings', 'webServer']

export const ROUTE_PREFIX = '/harness-sounds'
export const EVENTS_PATH = `${ROUTE_PREFIX}/events`

/** SSE 事件负载：{ kind: 'celebrate' | 'error' | 'wait' | 'turn' }，client 据此播音。 */
export function apply(ctx) {
  const webServer = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined

  // SSE 客户端集合：事件发生时广播（断开即移除，不阻塞）。
  const sseClients = new Set()
  const broadcast = (kind) => {
    const line = `data: ${JSON.stringify({ kind })}\n\n`
    for (const res of sseClients) {
      try { res.write(line) } catch { sseClients.delete(res) }
    }
  }

  ctx.effect(() => {
    const disposers = [
      // 任务终态（官方 jobs 服务）：completed → 庆祝；failed → 失败音。
      // killed（用户取消）中性：不发声。
      ctx.jobs.onJobDone((snapshot) => {
        if (snapshot.status === 'completed') broadcast('celebrate')
        else if (snapshot.status === 'failed') broadcast('error')
      }),
      // 请求错误（LLM API 抖动）：失败音（与任务失败同一负面窗口语义）。
      ctx.on('agent/request-error', () => {
        broadcast('error')
      }),
      // 会话事件：turn/end → 回合完成（庆祝）；approval/asked → 等待批准（等待音）。
      // 注意：DSH 的等待批准是独立事件 approval/asked（不是 turn/end 的 blocked 状态），
      // 必须显式监听——只靠 turn/end reason.kind==='blocked' 捕获不到（实际不产生 turn/end）。
      ctx.on('session/event', (session, event) => {
        const type = typeof event?.type === 'string' ? event.type : null
        if (type === 'approval/asked') {
          broadcast('wait')
          return
        }
        // agent 提问（ask_user_question 工具调用）→ 等待用户选择，同样提示。
        if (type === 'tool/call' && typeof event?.data?.name === 'string' && event.data.name === 'ask_user_question') {
          broadcast('wait')
          return
        }
        const parsed = parseTurnEvent(event)
        if (parsed === null) return
        if (parsed.kind === 'end') {
          if (parsed.blocked) broadcast('wait')
          else broadcast('turn')
        }
      }),
    ]

    // webServer 存在时注册 SSE 端点；headless 无 web 服务器则纯事件广播（无人订阅，无害）。
    if (webServer !== undefined && typeof webServer.register === 'function') {
      webServer.register({
        kind: 'exact',
        path: EVENTS_PATH,
        handler: async (req, res) => {
          if (req.method !== 'GET') {
            res.writeHead(405)
            res.end()
            return
          }
          res.writeHead(200, {
            'content-type': 'text/event-stream',
            'access-control-allow-origin': '*', // Firefox 扩展后台跨源订阅需要 CORS
            'cache-control': 'no-cache',
            connection: 'keep-alive',
            'x-accel-buffering': 'no',
          })
          if (typeof res.flushHeaders === 'function') res.flushHeaders()
          res.write('retry: 3000\n\n')
          sseClients.add(res)
          let heartbeat = null
          if (typeof res.on === 'function') {
            res.on('close', () => {
              clearInterval(heartbeat)
              sseClients.delete(res)
            })
          }
          heartbeat = setInterval(() => {
            try { res.write(': ping\n\n') } catch { /* 断连由 close 清理 */ }
          }, 25000)
        },
      })
    }

    return () => {
      for (const dispose of disposers) dispose()
    }
  }, 'harness-sounds: events → SSE broadcast')
}
