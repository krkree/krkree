# KrKree · Departures

个人名片与社交链接页，支持中文 / 日本語。

- 站点：https://krkree.github.io/krkree/
- 日语：https://krkree.github.io/krkree/?lang=ja
- GitHub Pages 发布分支：`gh-pages`，目录：`/`。

## 功能

- 哔哩哔哩、X、小红书、Bangumi 与抖音入口。
- QQ / 抖音名片查看、保存与账号复制。
- 学园偶像大师主号 `3D5J5EBB`、小号 `9NYXTKD6` 一键复制。
- 9 张本地背景淡入轮播，支持前后切换、暂停和减少动态效果。
- 顶部语言切换，记住浏览器内的选择；`?lang=zh` / `?lang=ja` 可直接指定。
- 个人网站入口已停用。

## 维护

`index.html` 保存页面结构和账号链接，`i18n.js` 保存双语词条及背景路径，
`styles.css` 和 `script.js` 控制样式与交互。
`assets/avatar.svg` 使用原插画的头部视窗取景；`assets/douyin-card.jpg` 与 `qq-qr.jpg` 为名片原图。

无需构建。在仓库目录执行 `python -m http.server 4173 --bind 127.0.0.1` 即可预览。
修改后推送到 `gh-pages`，由 GitHub Pages 自动发布。不要添加已停用域名的 CNAME 文件。
