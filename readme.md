# nodejs-template

一个 Node.js 项目快速起手模板。

## 集成技术

- [x] TypeScript：使用 TypeScript 编写代码
- [x] ESLint：代码风格检查
- [x] commitlint：规范 commit message
- [x] commitizen：规范 commit message，主要是与 git-hook 侧的交互
- [x] lefthook：git-hook 工具

## 构建过程

```bash
# commitlint
pnpm install --save-dev @commitlint/cli @commitlint/config-conventional
# commitizen
pnpm install --save-dev commitizen cz-git
# eslint & lefthook
pnpm install --save-dev eslint @antfu/eslint-config lefthook
```

安装了 `commitizen` & `cz-git` 之后，
需要在 `package.json` 中添加如下配置：

```json
{
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
}
```
