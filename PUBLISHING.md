# 发布指南

本文档说明如何将 `markdown-annotation-kit` 发布到 npm。

## 前置准备

### 1. npm 账号

确保你已经：
- 注册了 npm 账号：https://www.npmjs.com/signup
- 在本地登录：`npm login`

### 2. 检查包名可用性

```bash
npm view markdown-annotation-kit
```

如果返回 404，说明包名可用。如果已存在，需要修改 `package.json` 中的 `name` 字段。

### 3. 更新版本号

我们使用 `standard-version` 来自动化版本管理。它会：
- 根据 commit 信息自动确定版本号类型
- 自动更新 `CHANGELOG.md`
- 自动创建 git tag
- 自动提交更改

```bash
# 自动版本管理（推荐）
pnpm release

# 手动指定版本类型
pnpm release:minor  # 次要版本
pnpm release:major # 主要版本

# 预发布版本
pnpm release:alpha # alpha 版本
pnpm release:beta  # beta 版本
pnpm release:rc    # rc 版本
```

**注意**：使用 `standard-version` 前，确保你的 commit 信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
- `feat:` - 新功能（minor）
- `fix:` - bug 修复（patch）
- `feat!:` 或 `fix!:` - 破坏性变更（major）

或者手动编辑 `package.json` 中的 `version` 字段。

### 4. 更新 CHANGELOG.md

使用 `standard-version` 时，`CHANGELOG.md` 会自动更新。如果手动发布，请确保已更新。

## 本地发布流程

### 方式一：使用 standard-version（推荐）

这是最简单的方式，会自动处理版本号、CHANGELOG 和 git tag：

```bash
# 1. 运行验证
pnpm validate

# 2. 运行 release（会自动更新版本、CHANGELOG、创建 tag）
pnpm release

# 3. 推送代码和标签
git push --follow-tags origin main

# 4. 发布到 npm
npm publish
```

### 方式二：手动发布

如果你需要更多控制，可以手动操作：

#### 1. 运行验证

```bash
pnpm validate
```

这会运行：
- 类型检查
- 代码检查
- 格式化检查
- 测试

### 2. 构建

```bash
pnpm build
```

### 3. 检查构建产物

```bash
ls -la dist/
```

应该看到：
- `index.js` - ES 模块
- `index.cjs` - CommonJS 模块
- `index.d.ts` - TypeScript 类型定义
- `styles.css` - 样式文件

### 4. 发布到 npm

```bash
npm publish
```

或者使用 pnpm：

```bash
pnpm publish
```

### 5. 验证发布

```bash
npm view markdown-annotation-kit
```

或者访问：https://www.npmjs.com/package/markdown-annotation-kit

## 使用 GitHub Actions 自动发布

### 1. 设置 NPM Token

1. 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. 创建新的 Access Token（选择 "Automation" 类型）
3. 在 GitHub 仓库设置中添加 Secret：
   - 进入仓库 Settings > Secrets and variables > Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的 npm token

### 2. 创建 Git Tag

```bash
# 使用 standard-version 自动创建 tag（推荐）
pnpm release

# 或者手动创建
npm version patch  # 或 minor, major

# 推送代码和标签
git push origin main
git push --tags
```

### 3. 触发发布

当你推送带有 `v*` 格式的标签时（如 `v0.1.0`），GitHub Actions 会自动：
1. 运行所有测试
2. 构建项目
3. 发布到 npm
4. 创建 GitHub Release

## 发布检查清单

发布前请确认：

- [ ] 所有测试通过
- [ ] 代码已格式化
- [ ] 类型检查通过
- [ ] 构建成功
- [ ] CHANGELOG.md 已更新
- [ ] README.md 中的示例代码正确
- [ ] 版本号已更新
- [ ] 已提交所有更改
- [ ] 已创建 Git tag（如果使用自动发布）

## 发布后

### 1. 验证安装

```bash
npm install markdown-annotation-kit
```

### 2. 更新文档

- 确保 README 中的示例代码可以正常运行
- 更新任何外部文档或教程

### 3. 宣传

- 在社交媒体上分享
- 在相关社区发布（如 Reddit、Twitter、Dev.to）
- 添加到 awesome-react 等列表

## 常见问题

### 发布失败：包名已存在

修改 `package.json` 中的 `name` 字段，使用作用域包名：

```json
{
  "name": "@your-username/markdown-annotation-kit"
}
```

### 发布失败：权限不足

确保已登录正确的 npm 账号：

```bash
npm whoami
npm logout
npm login
```

### 需要撤销发布

npm 不允许删除已发布的包，但可以发布一个新版本修复问题。

## 版本管理建议

- **0.x.x** - 初始开发阶段，API 可能不稳定
- **1.x.x** - 稳定版本，遵循语义化版本
- **x.0.0** - 重大变更（破坏性更新）
- **x.x.0** - 新功能（向后兼容）
- **x.x.x** -  bug 修复

## 参考资源

- [npm 发布文档](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [语义化版本规范](https://semver.org/)
- [npm 最佳实践](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

