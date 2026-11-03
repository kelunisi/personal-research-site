# 智脑 · 个人研究站 —— 使用说明

这是一个纯静态的个人研究站：深色系“数字研究实验室”风格，只用 HTML/CSS/JavaScript，系统字体，没有 CDN、没有构建工具、没有第三方依赖。整个站点就在当前目录（`个人站/`）里。

## 一、直接打开

双击 `index.html` 即可在浏览器中查看，不需要安装任何东西。

## 二、用本地服务器打开（可选）

如果希望以“本地网站”的方式访问（行为更接近将来部署后的效果）：

```bash
# 在本目录（个人站/）下执行，任选一个：
py -m http.server 8000
python -m http.server 8000
```

然后浏览器访问 <http://localhost:8000>。停止服务在终端按 `Ctrl+C`。

## 三、日常修改：只改 content.js

站点文案几乎全部集中在 `content.js`（通过 `window.SITE_CONTENT` 提供），包括：

- 品牌名、首屏标题与简介、两个按钮；
- 首屏统计数字（研究文档数、架构版本数、探索主线数）；
- 研究成果卡片（真实成果 + 预留方向）；
- 研究框架的流程、节点说明与四条原则；
- 未来实验（路线图）；
- 更新动态（时间线）；
- 关于我；
- 支持我的收款码路径。

修改后保存文件，刷新浏览器即可生效，不需要任何构建步骤。

## 四、添加新的研究文档

1. 把整理好的 HTML 文件放进 `research/` 目录，例如 `research/my-new-paper.html`；
2. 打开 `content.js`，在 `research.real` 数组里仿照现有卡片新增一项，把 `link` 写成 `"research/my-new-paper.html"`；
3. 如需同步更新首屏统计，改 `hero.stats` 里的数字。

站内卡片会自带“新标签页打开 + `rel=\"noopener\"`”，无需额外处理。

## 五、添加真实收款码

1. 把微信/支付宝收款码图片（PNG/JPG 均可）复制到 `assets/`，例如 `assets/wechat-qr.png`；
2. 打开 `content.js`，找到 `support.tabs`，把对应 `qrPath` 从空字符串 `""` 改成 `"assets/wechat-qr.png"`；
3. 刷新页面即可。路径留空时，页面会显示设计好的“收款码待添加”占位，不会出现破图。

## 六、公开发布与更新

首个公开版本 `V1.0.0` 使用 GitHub Pages 托管：

- 站点：<https://kelunisi.github.io/personal-research-site/>
- 仓库：<https://github.com/kelunisi/personal-research-site>

日常修改保存并验证后，将变更推送到 `main` 分支即可触发 Pages 更新。只提交当前目录中用于公开展示的站点文件；`.gitignore` 已排除 `个人站.md` 工作交接。**不要把整个智脑知识库公开**。公开副本中的本机用户名与目录路径应泛化处理，原始研究文件不受影响。

## 文件结构

```
个人站/
├── index.html          页面结构
├── styles.css          全部样式
├── content.js          站点文案与内容配置（日常只改这里）
├── script.js           渲染与交互（Canvas 动画、滚动效果等）
├── assets/
│   ├── favicon.svg     站点图标
│   ├── wechat-qr.jpg   微信收款码
│   └── alipay-qr.jpg   支付宝收款码
├── research/
│   ├── multi-agent-knowledge-system.html   研究文档 ①（公开副本）
│   └── architecture-comparison.html        研究文档 ②
├── .gitignore          排除工作交接与系统文件
├── README.md           本说明
└── 个人站.md           工作交接（不公开上传）
```
