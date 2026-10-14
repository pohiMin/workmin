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

## 数据说明
页面通过 WorkBuddy 资料库云端 SDK 读写业务数据；本地仓库不含任何业务数据或密钥。
