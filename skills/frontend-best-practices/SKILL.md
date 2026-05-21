---
name: "frontend-best-practices"
description: "全面覆盖前端开发最佳实践，包含代码规范、性能优化、安全防护、可访问性等十大核心领域。提供详细实施方法、示例代码、常见问题解决方案及安全防护措施。适用于 React + TypeScript 项目开发指导和代码审查。"
---

# 前端开发最佳实践技能指南

## 概述

本技能提供全面的前端开发最佳实践指南，基于 OWASP 安全标准、行业最佳实践和实际项目经验总结。涵盖十大核心领域：代码规范、组件开发、性能优化、安全防护、可访问性、跨浏览器兼容、工程化配置等。

**核心目标**：
- 提供全面、健壮、安全的前端开发指导
- 覆盖前端开发全流程的关键领域
- 包含具体实施方法、示例代码、常见问题解决方案
- 重点强化安全防护，降低被攻击风险

**适用技术栈**：React / Next.js、TypeScript、Vue.js、JavaScript (ES6+)、Tailwind CSS

## 快速导航

| 领域 | 参考文档 | 示例代码 |
|------|----------|----------|
| 代码规范 | [code-standards.md](references/code-standards.md) | [typescript-patterns.ts](examples/typescript-patterns.ts) |
| 组件开发 | [code-standards.md](references/code-standards.md) | [react-patterns.tsx](examples/react-patterns.tsx) |
| 性能优化 | [performance.md](references/performance.md) | - |
| 安全防护 | [security-practices.md](references/security-practices.md) | [security-patterns.ts](examples/security-patterns.ts) |
| 可访问性 | [accessibility.md](references/accessibility.md) | - |
| 跨浏览器兼容 | [cross-browser.md](references/cross-browser.md) | - |
| 工程化配置 | [engineering.md](references/engineering.md) | - |
| 常见问题 | [troubleshooting.md](references/troubleshooting.md) | - |

## 核心要点速览

### 代码规范
- TypeScript 严格模式，避免 any 类型
- 命名规范：camelCase / PascalCase / UPPER_SNAKE_CASE
- ESLint + Prettier 配置
- 类型守卫和运行时验证（Zod）

### 性能优化
- 渲染优化：React.memo、useMemo、useCallback
- 代码分割和动态导入
- 图片优化：WebP、懒加载
- Core Web Vitals 监控

### 安全防护
- XSS 防护：输入验证、输出编码、CSP
- CSRF 防护：Token、SameSite Cookie
- 敏感数据脱敏和加密存储
- 依赖包安全审计

### 可访问性
- 语义化 HTML 和 ARIA 属性
- 键盘导航和焦点管理
- 屏幕阅读器支持
- WCAG 2.1 AA 标准

## 检查清单

### 开发检查清单
- [ ] TypeScript 严格模式，无 any 类型
- [ ] 组件有完整的 Props 接口定义
- [ ] useEffect 依赖项完整且正确
- [ ] 异步操作有错误处理
- [ ] 列表渲染有唯一的 key

### 安全检查清单
- [ ] 所有用户输入经过验证和过滤
- [ ] 输出到 DOM 的内容经过编码
- [ ] 敏感数据已脱敏或加密
- [ ] API 请求有 CSRF Token
- [ ] Cookie 设置了安全标志

### 部署检查清单
- [ ] 所有环境变量已配置
- [ ] 生产构建成功
- [ ] 安全头已设置
- [ ] 性能指标达标（LCP < 2.5s）
- [ ] 依赖安全审计通过

📖 **完整清单**：[checklists/](references/checklists/)

## 命令速查

```bash
# 代码质量
npx tsc --noEmit        # TypeScript 检查
npm run lint            # ESLint 检查
npx prettier --write "src/**/*.{ts,tsx}"

# 性能优化
npm run build -- --analyze    # Bundle 分析
npx lighthouse https://example.com

# 安全审计
npm audit               # 依赖安全审计
npx snyk test           # Snyk 扫描
```

## 快速参考摘要

📖 **[SUMMARY.md](SUMMARY.md)** - 包含所有核心要点的快速参考摘要

## 相关技能

- **[frontend-code-review](frontend-code-review)** - 前端代码审查
- **[frontend-modification-security](frontend-modification-security)** - 前端修改安全约束
- **[frontend-design](frontend-design)** - UI 设计美学指南
- **[seo-audit](seo-audit)** - SEO 审计工具

## 参考资源

- **安全标准**: OWASP Top 10、CSP 规范
- **性能标准**: Web Vitals、Lighthouse
- **可访问性**: WCAG 2.1、WAI-ARIA

---

**创建时间**：2026-05-21
**版本**：2.1（精简版）
**维护者**：前端最佳实践团队
