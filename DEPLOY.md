# 部署文档到 Vercel

## 方式一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择 `Keekuun/markdown-annotation-kit` 仓库
   - Vercel 会自动检测到项目配置

3. **配置项目设置**
   - **Framework Preset**: 选择 "Other" 或 "Vite"
   - **Root Directory**: 留空（根目录）
   - **Build Command**: `pnpm docs:build`
   - **Output Directory**: `docs/.vitepress/dist`
   - **Install Command**: `pnpm install`

4. **环境变量**（如果需要）
   - 通常不需要额外的环境变量

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成

## 方式二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

## Base 路径配置

当前配置的 `base` 路径是 `/markdown-annotation-kit/`，适用于：
- GitHub Pages 部署
- Vercel 子路径部署

如果部署到自定义域名（如 `docs.yourdomain.com`），需要修改 `docs/.vitepress/config.ts`：

```typescript
base: "/", // 改为根路径
```

## 注意事项

1. **构建前确保依赖已安装**
   ```bash
   pnpm install
   ```

2. **本地测试构建**
   ```bash
   pnpm docs:build
   pnpm docs:preview
   ```

3. **自动部署**
   - 推送到 `main` 分支会自动触发部署
   - 可以通过 Vercel Dashboard 配置分支部署规则

4. **自定义域名**
   - 在 Vercel Dashboard 的 Project Settings > Domains 中添加自定义域名

## 故障排查

如果遇到构建错误：

1. **检查 Node.js 版本**
   - Vercel 默认使用 Node.js 18.x
   - 可以在 `package.json` 中指定：
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

2. **检查依赖安装**
   - 确保 `pnpm-lock.yaml` 已提交到仓库
   - Vercel 会自动使用 pnpm（如果检测到 lockfile）

3. **查看构建日志**
   - 在 Vercel Dashboard 中查看详细的构建日志

