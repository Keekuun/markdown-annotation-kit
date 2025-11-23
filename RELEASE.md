# 版本发布指南

本文档说明如何使用 `standard-version` 进行版本发布。

## 快速开始

### 标准发布流程

```bash
# 1. 确保所有更改已提交
git status

# 2. 运行 release（会自动确定版本类型）
pnpm release

# 3. 推送代码和标签
git push --follow-tags origin main
```

## Release 命令说明

### 自动版本管理（推荐）

```bash
pnpm release
```

`standard-version` 会根据你的 commit 信息自动确定版本类型：
- `feat:` → minor (0.1.0 → 0.2.0)
- `fix:` → patch (0.1.0 → 0.1.1)
- `feat!:` 或 `fix!:` → major (0.1.0 → 1.0.0)

### 手动指定版本类型

```bash
# 次要版本 (0.1.0 → 0.2.0)
pnpm release:minor

# 主要版本 (0.1.0 → 1.0.0)
pnpm release:major
```

### 预发布版本

```bash
# Alpha 版本 (0.1.0 → 0.1.1-alpha.0)
pnpm release:alpha

# Beta 版本 (0.1.0 → 0.1.1-beta.0)
pnpm release:beta

# RC 版本 (0.1.0 → 0.1.1-rc.0)
pnpm release:rc
```

## 工作流程

### 1. 开发阶段

确保你的 commit 信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
git commit -m "feat: add support for custom themes"
git commit -m "fix: resolve duplicate text annotation bug"
git commit -m "docs: update API documentation"
```

### 2. 发布前检查

```bash
# 运行所有检查
pnpm validate

# 确保所有更改已提交
git status
```

### 3. 运行 Release

```bash
pnpm release
```

这会自动：
- ✅ 根据 commit 信息确定版本号
- ✅ 更新 `package.json` 中的版本号
- ✅ 更新 `CHANGELOG.md`
- ✅ 创建 git tag
- ✅ 提交所有更改

### 4. 推送发布

```bash
# 推送代码和标签
git push --follow-tags origin main
```

如果使用 GitHub Actions 自动发布，推送标签会自动触发发布流程。

## Commit 信息规范

### 版本类型映射

| Commit 类型 | 版本类型 | 示例 |
|------------|---------|------|
| `feat:` | minor | `feat: add new feature` |
| `fix:` | patch | `fix: resolve bug` |
| `feat!:` | major | `feat!: breaking change` |
| `fix!:` | major | `fix!: breaking fix` |

### 示例

```bash
# 这些 commit 会导致 minor 版本升级
git commit -m "feat: add dark mode support"
git commit -m "feat: add custom annotation colors"

# 这些 commit 会导致 patch 版本升级
git commit -m "fix: resolve duplicate text bug"
git commit -m "fix: improve context matching"

# 这些 commit 会导致 major 版本升级
git commit -m "feat!: change API structure"
git commit -m "fix!: remove deprecated API"
```

## 配置文件

`.versionrc.json` 配置文件定义了：
- commit 类型到 CHANGELOG 章节的映射
- 发布 commit 信息格式
- 发布后执行的脚本

## 常见问题

### Q: 如何跳过某个版本类型？

```bash
# 跳过 patch，直接发布 minor
pnpm release:minor

# 跳过 minor，直接发布 major
pnpm release:major
```

### Q: 如何撤销 release？

```bash
# 删除本地 tag
git tag -d v0.1.0

# 删除远程 tag（如果已推送）
git push origin :refs/tags/v0.1.0

# 重置到 release 前的 commit
git reset --hard HEAD~1
```

### Q: 如何发布预发布版本？

```bash
# 发布 alpha 版本
pnpm release:alpha

# 从 alpha 升级到正式版本
pnpm release
```

### Q: CHANGELOG 没有自动更新？

确保：
1. commit 信息遵循 Conventional Commits 规范
2. commit 信息是英文（standard-version 默认解析英文）
3. 检查 `.versionrc.json` 配置是否正确

## 与 GitHub Actions 集成

如果配置了 GitHub Actions 自动发布，推送 tag 后会自动：
1. 运行测试
2. 构建项目
3. 发布到 npm
4. 创建 GitHub Release

## 参考资源

- [standard-version 文档](https://github.com/conventional-changelog/standard-version)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [语义化版本](https://semver.org/)

