# 2048

一个纯前端实现的 2048 数字合并游戏，支持深浅色主题切换、桌面键盘与移动端触控操作，最佳分数本地存储。

🎮 **在线体验**：<https://2048-ten-gilt.vercel.app>

---

## 功能特性

- **经典 4×4 网格 2048 玩法**：相同数字方块合并，目标达成 2048
- **深浅色主题切换**：右上角主题按钮一键切换，偏好自动记忆
- **多端适配**：
  - 桌面端：方向键（↑ ↓ ← →）操作
  - 移动端：滑动手势操作
- **最佳分数持久化**：通过 `localStorage` 保存历史最高分
- **流畅动画**：方块滑动、合并、新生成的过渡动画
- **纯前端实现**：无后端依赖，可直接作为静态站点部署

## 技术栈

- HTML5（语义化结构）
- 原生 JavaScript（ES6 Class，无外部框架）
- CSS3（响应式 + 主题变量 + 动画）
- Python `http.server`（仅用于本地预览）

## 本地预览

无需安装依赖，任选一种方式：

```bash
# 方式 1：Python 本地服务器（默认端口 3000）
python server.py

# 方式 2：直接在浏览器打开 index.html
```

访问 <http://localhost:3000> 即可开始游戏。

## 部署

最小部署只需要以下文件：

- `index.html` — 页面入口
- `script.js` — 游戏逻辑
- `style.css` — 样式

可直接部署到 Vercel、宝塔静态站点、对象存储或任意 Nginx 静态目录。

仓库内附 `nginx_2048.conf.example` 作为 Nginx 配置参考。

## 项目结构

```text
.
├── index.html                    # 页面入口
├── script.js                     # 游戏主逻辑（Game2048 类）
├── style.css                     # 样式与主题
├── server.py                     # 本地预览服务器
├── nginx_2048.conf.example       # Nginx 配置示例
├── .gitignore
└── .vercelignore
```

## 控制方式

| 平台 | 操作 |
|------|------|
| 桌面 | ↑ ↓ ← → 方向键移动方块 |
| 移动端 | 屏幕滑动手势 |

## 许可证

[MIT License](./LICENSE)
