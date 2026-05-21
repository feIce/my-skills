# 可访问性详细指南

## 概述

本文档提供全面的可访问性（Accessibility，A11Y）指南，涵盖语义化 HTML、ARIA 属性、键盘导航、屏幕阅读器支持等核心领域。遵循 WCAG 2.1 AA 标准，确保所有用户都能访问和使用应用。

**核心目标**：
- 确保所有用户都能使用应用
- 支持屏幕阅读器
- 支持键盘导航
- 符合 WCAG 2.1 AA 标准

---

## 一、语义化 HTML

### 1.1 正确的标签使用

**结构化元素**
```html
<!-- ✅ 良好：使用语义化标签 -->
<header>
  <nav aria-label="主导航">
    <ul>
      <li><a href="/">首页</a></li>
      <li><a href="/about">关于我们</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>文章标题</h1>
    <section>
      <h2>第一部分</h2>
      <p>内容...</p>
    </section>
  </article>

  <aside>
    <h2>侧边栏</h2>
    <nav aria-label="相关链接">
      <ul>
        <li><a href="/related-1">相关文章1</a></li>
      </ul>
    </nav>
  </aside>
</main>

<footer>
  <p>&copy; 2024 公司名称</p>
</footer>

<!-- ❌ 不良：使用 div 代替 -->
<div class="header">
  <div class="nav">导航内容</div>
</div>
<div class="content">主内容</div>
<div class="footer">页脚</div>
```

**按钮和链接**
```html
<!-- ✅ 良好：使用 button 处理点击 -->
<button type="button" onClick={handleClick}>
  提交表单
</button>

<!-- ✅ 良好：使用 a 处理导航 -->
<a href="/dashboard">进入仪表板</a>

<!-- ❌ 不良：用 a 标签处理点击 -->
<a href="#" onClick={handleClick}>提交表单</a>

<!-- ❌ 不良：用 button 处理导航 -->
<button type="button" onClick={() => router.push('/dashboard')}>
  进入仪表板
</button>
```

### 1.2 标题结构

**正确使用标题层级**
```html
<!-- ✅ 良好：标题层级正确 -->
<h1>网站标题</h1>
  <h2>主要章节</h2>
    <h3>子章节</h3>
    <h3>另一个子章节</h3>
  <h2>另一个主要章节</h2>

<!-- ❌ 不良：跳过标题级别 -->
<h1>网站标题</h1>
<h3>直接跳到 h3</h3>
```

**每个页面一个 H1**
```html
<!-- ✅ 良好：每个页面一个 H1 -->
<!-- 页面标题 -->
<h1>产品列表</h1>

<!-- ❌ 不良：多个 H1 -->
<h1>公司名称</h1>
<h1>产品列表</h1>
```

### 1.3 表单元素

**正确关联标签**
```html
<!-- ✅ 良好：使用 label for 属性 -->
<label for="email">邮箱地址</label>
<input type="email" id="email" name="email" />

<!-- ✅ 良好：使用 aria-label -->
<input
  type="search"
  aria-label="搜索商品"
  placeholder="输入关键词..."
/>

<!-- ✅ 良好：label 包裹 input -->
<label>
  用户名
  <input type="text" name="username" />
</label>

<!-- ❌ 不良：placeholder 作为唯一标签 -->
<input
  type="email"
  placeholder="请输入邮箱"
  aria-label="请输入邮箱" <!-- 仍然需要 label -->
/>
```

---

## 二、ARIA 属性

### 2.1 ARIA 角色

**常用角色**
```html
<!-- 导航 -->
<nav role="navigation" aria-label="主导航">
  <!-- 导航内容 -->
</nav>

<!-- 主要内容 -->
<main role="main">
  <!-- 主要内容 -->
</main>

<!-- 搜索 -->
<form role="search" aria-label="站内搜索">
  <input type="search" aria-label="搜索" />
</form>

<!-- 按钮 -->
<div role="button" tabindex="0">点击我</div>

<!-- 图片 -->
<img role="img" src="/chart.png" alt="销售趋势图表" />
```

### 2.2 ARIA 属性

**aria-label**
```html
<!-- ✅ 良好：提供可访问名称 -->
<button aria-label="关闭对话框">×</button>

<a href="/menu" aria-label="打开菜单">
  <img src="/menu-icon.svg" alt="" />
</a>
```

**aria-describedby**
```html
<!-- ✅ 良好：关联描述 -->
<input
  type="text"
  id="password"
  aria-describedby="password-hint"
/>
<p id="password-hint">
  密码至少8位，包含大小写字母和数字
</p>
```

**aria-expanded**
```html
<!-- ✅ 良好：表示展开状态 -->
<button
  aria-expanded={isExpanded}
  aria-controls="menu-content"
  onClick={toggleMenu}
>
  菜单
</button>

<div id="menu-content" hidden={!isExpanded}>
  <!-- 菜单内容 -->
</div>
```

**aria-live**
```html
<!-- ✅ 良好：动态内容通知 -->
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

<!-- 通知类型 -->
<!-- "polite"：等待空闲时通知 -->
<!-- "assertive"：立即通知（慎重使用） -->
```

### 2.3 避免滥用 ARIA

```html
<!-- ❌ 不良：使用 div 代替原生语义标签 -->
<div role="button">按钮</div>

<!-- ✅ 良好：使用原生按钮 -->
<button>按钮</button>

<!-- ❌ 不良：不必要的 ARIA -->
<h2 role="heading" aria-level="2">标题</h2>

<!-- ✅ 良好：直接使用 h2 -->
<h2>标题</h2>

<!-- ❌ 不良：掩盖可访问性问题 -->
<div aria-hidden="true">
  <button>这个按钮无法访问</button>
</div>
```

---

## 三、键盘导航

### 3.1 Tab 顺序

**逻辑顺序**
```html
<!-- ✅ 良好：Tab 顺序符合视觉和功能逻辑 -->
<form>
  <label for="name">姓名</label>
  <input type="text" id="name" />  <!-- Tab 1 -->

  <label for="email">邮箱</label>
  <input type="email" id="email" />  <!-- Tab 2 -->

  <label for="phone">电话</label>
  <input type="tel" id="phone" />  <!-- Tab 3 -->

  <button type="submit">提交</button>  <!-- Tab 4 -->
</form>

<!-- ❌ 不良：混乱的 Tab 顺序 -->
<form>
  <label for="phone">电话</label>
  <input type="tel" id="phone" />  <!-- Tab 3 -->

  <label for="name">姓名</label>
  <input type="text" id="name" />  <!-- Tab 1 -->
</form>
```

**tabindex 管理**
```html
<!-- ✅ 良好：只对需要键盘访问的元素使用 tabindex -->
<!-- 自然可聚焦元素不需要 tabindex -->
<a href="/page">链接</a>
<button>按钮</button>
<input />

<!-- ✅ 良好：自定义可聚焦元素 -->
<div
  role="button"
  tabindex="0"
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  自定义按钮
</div>

<!-- ✅ 良好：移除焦点顺序 -->
<div tabindex="-1">
  这个元素可以通过脚本聚焦，但跳过 Tab 顺序
</div>

<!-- ❌ 不良：正数 tabindex（除0外） -->
<div tabindex="5">不应该存在</div>
```

### 3.2 焦点管理

**模态框焦点管理**
```typescript
// ✅ 良好：模态框焦点管理
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement>();

  useEffect(() => {
    if (isOpen) {
      // 保存之前焦点
      previousFocusRef.current = document.activeElement as HTMLElement;

      // 聚焦到模态框
      modalRef.current?.focus();

      // 锁定背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复之前焦点
      previousFocusRef.current?.focus();

      // 恢复背景滚动
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <button onClick={onClose} aria-label="关闭">×</button>
      {children}
    </div>
  );
}
```

### 3.3 快捷键

**添加快捷键支持**
```typescript
// ✅ 良好：键盘快捷键
function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + S：搜索
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }

      // Escape：关闭模态框
      if (e.key === 'Escape') {
        closeModal();
      }

      // ?：显示帮助
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        showHelp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <button
      aria-label="搜索（快捷键：Alt + S）"
      aria-keyshortcuts="Alt S"
    >
      搜索
    </button>
  );
}
```

---

## 四、屏幕阅读器支持

### 4.1 图片 alt 文本

**alt 文本原则**
```html
<!-- ✅ 良好：描述性 alt 文本 -->
<img src="/product.jpg" alt="红色运动鞋，侧面视图" />

<!-- ✅ 良好：功能链接的 alt -->
<a href="/home">
  <img src="/logo.svg" alt="公司名称 - 返回首页" />
</a>

<!-- ✅ 良好：装饰性图片使用空 alt -->
<img src="/decoration.svg" alt="" aria-hidden="true" />

<!-- ✅ 良好：复杂图片使用详细描述 -->
<img
  src="/chart.png"
  alt="销售趋势图表"
  aria-describedby="chart-description"
/>
<p id="chart-description">
  2024年1月至12月销售趋势图。1月：100万，2月：120万...
</p>

<!-- ❌ 不良：含糊的 alt -->
<img src="/product.jpg" alt="产品图片" />

<!-- ❌ 不良：alt 包含文件名 -->
<img src="/product-red-shoes-001.jpg" alt="product-red-shoes-001.jpg" />
```

### 4.2 表单通知

**错误提示**
```typescript
// ✅ 良好：表单错误通知
function FormField({ label, error, hint }) {
  const fieldId = useId();

  return (
    <div>
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
      />

      {hint && !error && (
        <p id={`${fieldId}-hint`}>{hint}</p>
      )}

      {error && (
        <p id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

**成功通知**
```typescript
// ✅ 良好：成功状态通知
function SuccessMessage({ message }) {
  return (
    <div role="status" aria-live="polite">
      {message}
    </div>
  );
}

// ✅ 良好：加载状态
function LoadingSpinner() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">加载中...</span>
      <Spinner />
    </div>
  );
}
```

### 4.3 表格可访问性

**数据表格**
```html
<!-- ✅ 良好：有表头的数据表 -->
<table>
  <thead>
    <tr>
      <th scope="col">姓名</th>
      <th scope="col">邮箱</th>
      <th scope="col">部门</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>zhang@example.com</td>
      <td>技术部</td>
    </tr>
  </tbody>
</table>

<!-- ✅ 良好：带行表头 -->
<table>
  <thead>
    <tr>
      <th></th>
      <th scope="col">第一季度</th>
      <th scope="col">第二季度</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">产品A</th>
      <td>100万</td>
      <td>120万</td>
    </tr>
  </tbody>
</table>
```

---

## 五、视觉设计

### 5.1 颜色对比度

**WCAG AA 标准**
```css
/* ✅ 良好：满足对比度要求 */
/* 正常文本：4.5:1 */
/* 大文本（18px+ 或 14px bold）：3:1 */
/* UI 组件和图形：3:1 */

.text-normal {
  color: #333333; /* 深灰 */
  background-color: #ffffff; /* 白 */
  /* 对比度：12.6:1 ✅ */
}

.text-large {
  color: #555555; /* 中灰 */
  background-color: #ffffff;
  /* 对比度：7:1 ✅ */
}

.button-bg {
  color: #ffffff; /* 白 */
  background-color: #0066cc; /* 蓝色 */
  /* 对比度：4.7:1 ✅ */
}
```

**检查工具**
```typescript
// ✅ 良好：使用在线工具检查
// WebAIM Contrast Checker
// 链接：https://webaim.org/resources/contrastchecker/

// ✅ 良好：使用代码检测
function checkContrast(color1: string, color2: string): boolean {
  const ratio = getContrastRatio(color1, color2);
  return ratio >= 4.5; // WCAG AA
}
```

### 5.2 焦点指示器

**可见焦点样式**
```css
/* ✅ 良好：清晰的焦点样式 */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* ✅ 良好：自定义焦点样式 */
.button:focus-visible {
  background-color: #0066cc;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.3);
}

/* ✅ 良好：移除默认焦点但不提供替代 */
.button:focus:not(:focus-visible) {
  outline: none;
}
```

### 5.3 动画控制

**尊重用户偏好**
```css
/* ✅ 良好：减少动画（系统偏好） */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// ✅ 良好：检查用户偏好
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

function AnimatedComponent() {
  const [shouldAnimate, setShouldAnimate] = useState(!prefersReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setShouldAnimate(!e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return <div className={shouldAnimate ? 'animate' : 'static'} />;
}
```

---

## 六、测试工具

### 6.1 自动化测试

**axe-core 集成**
```typescript
// ✅ 良好：集成 axe-core
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('按钮组件无可访问性违规', async () => {
  const { container } = render(<Button>点击我</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 6.2 浏览器插件

**常用工具**
- axe DevTools（Chrome/Firefox）
- WAVE Evaluation Tool
- Accessibility Insights for Web

### 6.3 测试清单

- [ ] 所有图片有 alt 文本
- [ ] 表单有正确的标签关联
- [ ] 颜色对比度符合 WCAG AA
- [ ] 键盘可以访问所有功能
- [ ] 焦点样式清晰可见
- [ ] 动态内容有 ARIA live 通知
- [ ] 标题层级正确
- [ ] 无 ARIA 滥用
- [ ] 动画可被禁用

---

**创建时间**：2026-05-21
**版本**：1.0
**参考标准**：WCAG 2.1、ARIA 规范
