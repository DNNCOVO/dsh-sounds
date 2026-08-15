# harness-sounds 🔊

**DeepSeek Harness 系统提示音** — 任务完成/失败/回合完成/等待批准/提问时的声音提示。

一个独立的 [DeepSeek Harness](https://github.com/deepseek-ai/dsh) (DSH) 插件，**不依赖任何宠物插件**（如 whale-girl）——声音是 Harness 自己的"系统提示音"，由官方事件驱动，即使宠物未显示/未安装/动画异常，提示音照常播放。

## ✨ 功能

| 场景 | 音效 | 触发事件 |
|---|---|---|
| 任务完成 / 回合完成 | 叮咚叮咚叮咚（523/659/784Hz 上行三连音） | `jobs.onJobDone` completed、`turn/end` |
| 任务失败 / 请求出错 | 嘟——（170Hz 方波） | `jobs.onJobDone` failed、`agent/request-error` |
| 等待批准 | 叮（880Hz 短音） | `approval/asked` |
| Agent 提问选择 | 叮（880Hz 短音） | `tool/call`（`ask_user_question`） |

声音使用 **Web Audio 实时合成**（振荡器），无任何音频文件依赖：零体积、不占空间、无版权问题。

## 🚀 安装

1. 把本包放入你的 web profile 的 `node_modules/` 下（或任意 bundle 解析位置）
2. 在 profile 的 `package.json` 中注册 bundle：

```json
{
  "dependencies": {
    "harness-sounds": "file:./node_modules/harness-sounds"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "harness-sounds"
      ]
    }
  }
}
```

3. 重启 `dsh web`，刷新页面
4. **点击页面任意位置一次**（浏览器自动播放策略需要用户手势解锁音频）

## 🔧 工作原理

```
┌─────────────────────────────────────────────┐
│  Host (Node.js)                             │
│                                             │
│  jobs.onJobDone ──┐                         │
│  agent/request-error ──┤                     │
│  session/event (approval/asked,             │
│    tool/call ask_user_question, turn/end) ──┘
│           │                                 │
│           ▼                                 │
│  SSE 广播  /harness-sounds/events           │
└───────────┬─────────────────────────────────┘
            │ EventSource
┌───────────▼─────────────────────────────────┐
│  Client (browser)                           │
│  Web Audio 合成 → 播放提示音                 │
└─────────────────────────────────────────────┘
```

- **Host 端** (`.dsh-plugin/index.mjs`)：直接订阅官方服务事件（`jobs`、`session/event`、`agent/request-error`），通过独立的 SSE 端点 `/harness-sounds/events` 推送。
- **Client 端** (`.dsh-plugin/client.js`)：用 `EventSource` 订阅，`Web Audio` 振荡器合成三种音效。
- **完全独立**：不使用 whale-girl 的任何接口，不依赖其 `/state` 或事件流。

## 📁 项目结构

```
harness-sounds/
├── package.json            # DSH bundle 声明（dsh.bundle / dsh.client）
├── cordis.patch.yml        # 组合补丁：挂载 harness-sounds 插件
└── .dsh-plugin/
    ├── index.mjs           # Host：事件订阅 + SSE 广播
    ├── client/
    │   └── index.mjs       # Client 源码：EventSource + Web Audio
    ├── client.js           # Client 构建产物（bundle 加载）
    └── src/
        └── session-events.mjs  # turn/start · turn/end 边沿解析（纯函数）
```

## 🔧 开发

```bash
# 构建 client（esbuild → __ModuleLoader__ 包装）
npx esbuild .dsh-plugin/client/index.mjs --bundle --format=cjs --platform=browser --target=es2020 --outfile=.dsh-plugin/client-bundle.js
node wrap-client.mjs .dsh-plugin/client-bundle.js .dsh-plugin/client.js harness-sounds
```

## 📄 许可证

MIT © 2026

## 🙏 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/dsh) — 本插件运行的平台
- [vlln/whale-girl](https://github.com/vlln/whale-girl) — 桌宠设计参考（本插件与其完全解耦）
