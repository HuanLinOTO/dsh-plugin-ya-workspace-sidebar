本项目已被dshfind.com收录

# ya-workspace-sidebar

[![npm version](https://img.shields.io/npm/v/@huanlin/dsh-plugin-ya-workspace-sidebar)](https://www.npmjs.com/package/@huanlin/dsh-plugin-ya-workspace-sidebar)

![cover](assets/cover.webp)

DSH Web 工作区侧栏替代插件。顶部固定展示 5 条全局最近会话，下方使用 Workspace → Session 二级菜单和面包屑导航；搜索、添加工作区、重命名、删除、Fork、归档与拖拽排序继续使用 DSH 原生 Host 能力。

## 运行

插件采用 bundle 形式，`cordis.patch.yml` 会禁用官方 `ui-workspace` 并插入 `@huanlin/dsh-plugin-ya-workspace-sidebar`。安装：

```powershell
# 从 npm 安装（推荐）：
dsh plugin --profile web add @huanlin/dsh-plugin-ya-workspace-sidebar

# 本地开发（热更新）：
dsh plugin --profile web add "link:D:/Projects/deepseek-harness/ya-workspace-sidebar"
```

修改源码后重新运行 `pnpm run build`，再重启 `dsh web` 并硬刷新浏览器。

## 开发

```powershell
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
```

`dsh/` 仅作为类型和行为参考，插件不会修改 DSH checkout。浏览器产物预构建到 `lib/client.js`，因此仓库发布时必须提交 `lib/`。

## 检查

```powershell
pnpm run typecheck
pnpm test
pnpm run build
```

构建后确认 `lib/index.js`、`lib/invariant.js`、`lib/client.js` 和 `lib/types/` 存在，并确认 `lib/client.js` 使用 `window.__ModuleLoader__.load()` 包装。
