# dsh-sounds 🔊

> 我给 DeepSeek Harness（一个 AI 编程助手）加的三段提示音：任务完成、任务失败、等待批准时，电脑会响一声提醒我。

**[👉 点这里试听](https://dnncovo.github.io/dsh-sounds/)**

| 什么时候响 | 声音 | 感觉 |
|---|---|---|
| 🎉 任务完成 / 回合完成 | 叮咚叮咚叮咚 | 欢快的庆祝三连音 |
| ❌ 任务失败 / 请求出错 | 嘟—— | 低沉的警示音 |
| ⏳ 等待批准 / Agent 提问 | 叮 | 轻轻一声提醒 |

- 声音是**浏览器现场合成**的（Web Audio），没有音频文件，不占空间
- 完全独立，不影响 DeepSeek Harness 本身，也不用装别的插件

---

## 专业版说明（给想自己用/改造的人）

### 它是什么

一个 [DeepSeek Harness](https://github.com/deepseek-ai/dsh) (DSH) 插件（bundle），订阅官方事件后通过独立 SSE 端点 `/harness-sounds/events` 推送，浏览器端用 Web Audio 合成播放。

### 触发事件 → 音效映射

| 场景 | 音效 | 触发事件 |
|---|---|---|
| 任务完成 / 回合完成 | celebrate（523/659/784Hz 上行三连音） | `jobs.onJobDone` completed、`turn/end` |
| 任务失败 / 请求出错 | error（170Hz 方波） | `jobs.onJobDone` failed、`agent/request-error` |
| 等待批准 | wait（880Hz 短音） | `approval/asked` |
| Agent 提问选择 | wait（880Hz 短音） | `tool/call`（`ask_user_question`） |

### 架构

```
Host (Node.js)
  jobs.onJobDone / agent/request-error / session/event
    → SSE 广播 /harness-sounds/events
Client (browser)
  EventSource 订阅 → Web Audio 合成 → 播放
```

- **Host** (`.dsh-plugin/index.mjs`)：直接订阅官方服务事件，SSE 推送，不依赖任何其他插件
- **Client** (`.dsh-plugin/client.js`)：`EventSource` 订阅 + `Web Audio` 振荡器合成
- 浏览器自动播放策略：首次 `pointerdown`/`keydown` 解锁 AudioContext

### 安装到 DeepSeek Harness

1. 把本包放到 web profile 的 `node_modules/`（或任意 bundle 解析位置）
2. 在 profile 的 `package.json` 注册 bundle：

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

3. 重启 `dsh web`，刷新页面，点击页面任意位置一次（解锁音频）

### 项目结构

```
├── index.html              # 音效试听页（GitHub Pages 首页）
├── package.json            # DSH bundle 声明（dsh.bundle / dsh.client）
├── cordis.patch.yml        # 组合补丁：挂载插件
└── .dsh-plugin/
    ├── index.mjs           # Host：事件订阅 + SSE 广播
    ├── client/
    │   └── index.mjs       # Client 源码：EventSource + Web Audio
    ├── client.js           # Client 构建产物（bundle 加载）
    └── src/
        └── session-events.mjs  # turn/start · turn/end 边沿解析（纯函数）
```

### 开发 / 构建

```bash
# 构建 client（esbuild → __ModuleLoader__ 包装）
npx esbuild .dsh-plugin/client/index.mjs --bundle --format=cjs --platform=browser --target=es2020 --outfile=.dsh-plugin/client-bundle.js
node wrap-client.mjs .dsh-plugin/client-bundle.js .dsh-plugin/client.js harness-sounds
```

### 许可证

MIT © 2026
