# dsh-sounds 🔊

**DeepSeek Harness 提示音分享**

我用的三种系统提示音，[点这里试听](https://dnncovo.github.io/dsh-sounds/) 👈

| 场景 | 音效 |
|---|---|
| 🎉 任务完成 / 回合完成 | 叮咚叮咚叮咚（上行三连音） |
| ❌ 任务失败 / 请求出错 | 嘟——（低音警示） |
| ⏳ 等待批准 / Agent 提问 | 叮（轻柔短音） |

声音用 Web Audio 实时合成，无音频文件。音效由 DeepSeek Harness 官方事件驱动（任务、会话、批准），浏览器端直接播放。

## 插件安装（DeepSeek Harness）

把本仓库作为 bundle 加入你的 web profile：

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

重启 `dsh web`，在页面上点击一次（浏览器音频解锁）即可。

## 项目结构

```
├── index.html              # 音效试听页（GitHub Pages）
├── package.json            # DSH bundle 声明
├── cordis.patch.yml        # 组合补丁
└── .dsh-plugin/
    ├── index.mjs           # Host：事件订阅 + SSE 广播
    ├── client.js           # Client：Web Audio 播放
    └── src/                # turn 边沿解析
```

## 许可证

MIT
