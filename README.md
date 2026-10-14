# 海哥的多线作战台（workmin）

一个**单文件 HTML**个人工作台，覆盖旺旺城市经理、AI 小游戏、海外 TikTok、六爻抖音、子女作业辅导等多线任务。零构建依赖，浏览器直接打开即用。

## 目录
- `workbench/index.html` —— 主作战台页面（数据层 / 计算层 / 渲染层，统一 `refreshAll`）
- `workbench/runtime-check.js` —— 本地 jsdom 回归测试（含双环境：本地 + 线上副本）
- `workbench/区块速查表.html`、`workbench/W5区块速查表.html` —— 模块速查参考页

## 本地预览
直接用浏览器打开 `workbench/index.html`。

## 回归测试
```bash
cd workbench
node runtime-check.js
```
> 需要 `jsdom`（`npm i jsdom`）。

## 数据模式（双模）
- **WorkBuddy 空间内**（有云端 SDK）：读写资料库，数据上云。
- **GitHub Pages / 本地无 SDK**：自动切换本地 mock，数据存浏览器 `localStorage`，录入刷新不丢（独立单机版，不与云端同步）。
- 页面内不含任何真实资料库 ID；ID 集中在 `config.js`（见下），公开仓库不会泄露。

## 配置
真实资料库 / 节点 ID 放在 `workbench/config.js`（**已被 .gitignore 排除，不进公开仓库**）。首次使用：
```bash
cd workbench
cp config.example.js config.js   # 再按注释填入你的真实 ID
```
`config.js` 存在且填了真实 ID 时，本地打开可连云端；GitHub Pages 上没有 `config.js`，自动走本地离线模式。

## 在线演示（GitHub Pages）
已启用 GitHub Pages，在线打开即为**离线可用版**（数据存浏览器本地，录入刷新不丢）：

- 入口：https://pohimin.github.io/workmin/
- 作战台：https://pohimin.github.io/workmin/workbench/index.html
