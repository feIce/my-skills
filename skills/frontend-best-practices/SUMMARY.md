# 前端最佳实践快速参考

## 目录

1. [代码规范](#代码规范)
2. [组件开发](#组件开发)
3. [性能优化](#性能优化)
4. [安全防护](#安全防护)
5. [可访问性](#可访问性)
6. [跨浏览器兼容](#跨浏览器兼容)
7. [工程化配置](#工程化配置)
8. [检查清单](#检查清单)
9. [命令速查](#命令速查)

---

## 代码规范

### TypeScript
- ✅ 使用严格模式（strict: true）
- ✅ 避免 any 类型，使用 unknown + 类型守卫
- ✅ 接口优先，类型别名用于联合类型
- ✅ 泛型约束明确
- ✅ 使用 Zod/Yup 进行运行时验证

### 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | getUserInfo |
| 组件/类 | PascalCase | UserProfile |
| 常量 | UPPER_SNAKE_CASE | MAX_RETRY |
| 文件 | kebab-case | user-profile.tsx |

### 代码风格
- ✅ ESLint + Prettier 配置
- ✅ import 按字母排序
- ✅ 注释使用中文
- ✅ 函数有类型注解

---

## 组件开发

### React 组件
- ✅ 函数组件优先
- ✅ Props 接口完整定义
- ✅ 默认值处理
- ✅ children 类型正确

### Hooks 最佳实践
- ✅ useState 用于简单状态
- ✅ useReducer 用于复杂状态逻辑
- ✅ useEffect 依赖项完整
- ✅ useMemo/useCallback 按需使用
- ✅ 自定义 Hooks 命名以 use 开头

### 状态管理
- ✅ useState: 组件级简单状态
- ✅ Context: 跨组件共享
- ✅ Zustand/Redux: 全局复杂状态

---

## 性能优化

### 运行时优化
- ✅ React.memo 避免不必要重渲染
- ✅ useMemo 缓存计算结果
- ✅ useCallback 缓存函数引用
- ✅ 列表渲染使用 React.memo + key

### 包体积优化
- ✅ Tree Shaking（sideEffects: false）
- ✅ 代码分割（React.lazy + Suspense）
- ✅ 动态导入（import()）
- ✅ 第三方库按需导入

### 资源优化
- ✅ 图片使用 WebP/AVIF
- ✅ 图片懒加载（loading="lazy"）
- ✅ 字体子集化
- ✅ CSS 提取和压缩

### Core Web Vitals
- ✅ LCP < 2.5s
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ INP < 200ms

---

## 安全防护

### XSS 防护
- ✅ 输入验证和过滤
- ✅ 输出 HTML 编码
- ✅ 使用 textContent 而非 innerHTML
- ✅ 配置 CSP（Content-Security-Policy）
- ✅ React 自动转义（避免 dangerouslySetInnerHTML）

### CSRF 防护
- ✅ 使用 CSRF Token
- ✅ Cookie 设置 SameSite=Strict/Lax
- ✅ 双重提交 Cookie 验证

### 敏感数据处理
- ✅ 数据脱敏（邮箱、手机号）
- ✅ 本地存储使用加密
- ✅ 密钥存于环境变量
- ✅ 日志脱敏

### 依赖安全
- ✅ npm audit 定期检查
- ✅ 使用 dependabot 自动更新
- ✅ 避免使用有已知漏洞的包

---

## 可访问性

### 语义化 HTML
- ✅ 使用正确的标签（button, a, input）
- ✅ 标题结构正确（H1-H6）
- ✅ 表单有 label 关联
- ✅ 使用 fieldset/legend 分组

### ARIA 属性
- ✅ role 属性正确使用
- ✅ aria-label 提供替代文本
- ✅ aria-hidden 隐藏装饰性元素
- ✅ 避免过度使用 ARIA

### 键盘导航
- ✅ Tab 顺序逻辑清晰
- ✅ 焦点可见（outline）
- ✅ 支持 Enter/Space 激活按钮
- ✅ 提供跳过导航链接

### 视觉设计
- ✅ 颜色对比度 ≥ 4.5:1（WCAG AA）
- ✅ 焦点指示器明显
- ✅ 动画可通过 prefers-reduced-motion 禁用

---

## 跨浏览器兼容

### 目标浏览器
- ✅ Chrome (latest 2)
- ✅ Firefox (latest 2)
- ✅ Safari (latest 2)
- ✅ Edge (latest 2)

### CSS 兼容
- ✅ 自动前缀（autoprefixer）
- ✅ 特性检测（@supports）
- ✅ 降级方案

### JavaScript 兼容
- ✅ Babel 转译
- ✅ Polyfill（按需）
- ✅ 避免使用实验性 API

---

## 工程化配置

### 构建工具
- ✅ Vite/Webpack 配置
- ✅ 开发/生产环境分离
- ✅ Source Map 配置

### 代码检查
- ✅ ESLint 配置
- ✅ TypeScript 检查
- ✅ Git Hooks（pre-commit）

### 测试
- ✅ 单元测试（Jest/Vitest）
- ✅ 集成测试
- ✅ E2E 测试（Playwright）

### 部署
- ✅ 环境变量管理
- ✅ 安全头配置
- ✅ 监控集成

---

## 检查清单

### 开发检查清单
- [ ] TypeScript 严格模式
- [ ] 组件 Props 接口完整
- [ ] useEffect 依赖正确
- [ ] 异步操作有错误处理
- [ ] 列表有唯一 key
- [ ] 定时器正确清理
- [ ] 状态更新安全（避免卸载后更新）

### 安全检查清单
- [ ] 用户输入已验证
- [ ] DOM 输出已编码
- [ ] 敏感数据已脱敏
- [ ] API 请求有 CSRF Token
- [ ] Cookie 有安全标志
- [ ] CSP 已配置
- [ ] 依赖无已知漏洞

### 部署检查清单
- [ ] 环境变量已配置
- [ ] 生产构建成功
- [ ] 安全头已设置
- [ ] 性能指标达标
- [ ] 可访问性检查通过
- [ ] 跨浏览器测试通过
- [ ] 依赖安全审计通过

---

## 命令速查

### 代码质量
```bash
npx tsc --noEmit                    # TypeScript 检查
npm run lint                        # ESLint
npx prettier --write "src/**/*"     # Prettier 格式化
```

### 性能优化
```bash
npm run build -- --analyze          # Bundle 分析
npx lighthouse https://example.com  # Lighthouse 审计
```

### 安全审计
```bash
npm audit                           # 依赖安全审计
npx snyk test                       # Snyk 扫描
```

### 可访问性
```bash
npx lighthouse https://example.com --only-categories=accessibility
```

---

**参考文档**: [SKILL.md](SKILL.md) | [详细文档](references/)
**版本**: 2.1
**创建时间**: 2026-05-21
