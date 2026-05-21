# 跨浏览器兼容性指南

## 概述

本文档提供跨浏览器兼容性开发指南，确保前端应用在不同浏览器中表现一致。

---

## 一、CSS 兼容性

### 1.1 浏览器前缀

**何时使用**
```css
/* ✅ 良好：使用必要的浏览器前缀 */
.flex-container {
  display: -webkit-box;  /* Chrome < 21, Safari */
  display: -ms-flexbox;   /* IE 10 */
  display: -webkit-flex;  /* Chrome < 21, Safari */
  display: flex;         /* 标准 */
}

.gradient {
  background: -webkit-linear-gradient(red, blue);  /* Chrome < 26, Safari */
  background: -moz-linear-gradient(red, blue);    /* Firefox < 16 */
  background: -o-linear-gradient(red, blue);      /* Opera < 12.1 */
  background: linear-gradient(red, blue);          /* 标准 */
}

/* ✅ 良好：使用 autoprefixer 自动处理 */
/* 安装：npm install -D postcss autoprefixer */
/* 配置：postcss.config.js */
module.exports = {
  plugins: [
    require('autoprefixer'),
  ],
};
```

### 1.2 特性检测

**Modernizr**
```typescript
// ✅ 良好：使用 Modernizr 检测
import Modernizr from 'modernizr';

// 检测 Flexbox
if (Modernizr.flexbox) {
  // 使用 Flexbox
} else {
  // 使用替代方案
}

// 检测 ES6
if (Modernizr.es6arrowfunctions) {
  // 使用箭头函数
} else {
  // 使用 function
}
```

**原生检测**
```typescript
// ✅ 良好：检测浏览器特性
const isFlexboxSupported = () => {
  const flexContainer = document.createElement('div');
  flexContainer.style.display = 'flex';
  return flexContainer.style.display === 'flex';
};

const isIntersectionObserverSupported = () => {
  return 'IntersectionObserver' in window;
};
```

### 1.3 Flexbox 兼容性

```css
/* ✅ 良好：Flexbox 完整写法 */
.flex-container {
  display: -webkit-box;      /* 老语法 */
  display: -webkit-flex;    /* Webkit */
  display: -ms-flexbox;     /* IE 10 */
  display: flex;            /* 标准 */
}

.flex-item {
  -webkit-box-flex: 1;      /* 老语法 */
  -webkit-flex: 1 1 auto;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
}
```

### 1.4 Grid 兼容性

```css
/* ✅ 良好：Grid 兼容性 */
.grid-container {
  display: -ms-grid;        /* IE 10 */
  display: grid;            /* 标准 */

  -ms-grid-columns: 1fr 1fr 1fr;  /* IE */
  grid-template-columns: 1fr 1fr 1fr;
}

/* ✅ 良好：渐进增强 */
.grid-container {
  display: flex;            /* 基础布局 */
  flex-wrap: wrap;
}

@supports (display: grid) {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 二、JavaScript 兼容性

### 2.1 ES6+ 兼容处理

**Promise**
```typescript
// ✅ 良好：Promise 兼容
// 旧浏览器不支持 Promise
import 'promise-polyfill/src/polyfill';

declare global {
  interface Promise<T> {
    finally(onfinally?: (() => void) | undefined): Promise<T>;
  }
}
```

**Fetch API**
```typescript
// ✅ 良好：Fetch 兼容
import 'whatwg-fetch';
// 或使用 node-fetch
```

**Array 方法**
```typescript
// ✅ 良好：Array 方法填充
import 'core-js/stable';

// 或选择性填充
import 'core-js/features/array/includes';
import 'core-js/features/object/entries';
import 'core-js/features/object/values';
```

### 2.2 Polyfill 使用

**配置**
```typescript
// ✅ 良好：按需加载 Polyfill
// polyfill.io
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise,fetch"></script>

// ✅ 良好：Vite 配置
// vite.config.ts
export default {
  build: {
    target: 'es2015',
  },
  optimizeDeps: {
    include: ['core-js/stable'],
  },
};
```

---

## 三、API 差异处理

### 3.1 DOM API

```typescript
// ✅ 良好：跨浏览器事件处理
const addEvent = (element, event, handler) => {
  if (element.addEventListener) {
    element.addEventListener(event, handler, false);
  } else if (element.attachEvent) {
    // IE8
    element.attachEvent(`on${event}`, handler);
  }
};

// ✅ 良好：跨浏览器类操作
const classList = {
  add: (element, className) => {
    if (element.classList) {
      element.classList.add(className);
    } else {
      // IE9
      element.className += ` ${className}`;
    }
  },

  remove: (element, className) => {
    if (element.classList) {
      element.classList.remove(className);
    } else {
      element.className = element.className.replace(
        new RegExp(`(^|\\s)${className}(\\s|$)`, 'g'),
        ' '
      );
    }
  },
};
```

### 3.2 样式访问

```typescript
// ✅ 良好：跨浏览器样式获取
const getStyle = (element, property) => {
  if (window.getComputedStyle) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
  }
  return element.currentStyle[property]; // IE
};
```

---

## 四、测试策略

### 4.1 浏览器测试矩阵

```typescript
// ✅ 良好：定义测试矩阵
const browsers = [
  { name: 'Chrome', versions: ['last 2', '> 90%'] },
  { name: 'Firefox', versions: ['last 2', '> 90%'] },
  { name: 'Safari', versions: ['last 2', '> 90%'] },
  { name: 'Edge', versions: ['last 2'] },
];
```

### 4.2 自动化测试

**Playwright 配置**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### 4.3 渐进增强

```css
/* ✅ 良好：基础功能 + 增强 */
.form-group {
  /* 基础样式，所有浏览器支持 */
  margin-bottom: 16px;
}

@supports (display: grid) {
  .form-group {
    /* 增强布局 */
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}

.form-button {
  /* 基础按钮样式 */
  padding: 8px 16px;
}

@supports (backdrop-filter: blur(10px)) {
  .form-button {
    /* 模糊效果 */
    backdrop-filter: blur(10px);
  }
}
```

---

**创建时间**：2026-05-21
**版本**：1.0
