# 前端性能优化详细指南

## 概述

本文档提供全面的前端性能优化指南，涵盖运行时性能、包体积优化、资源优化、缓存策略等核心领域。基于 Core Web Vitals 指标和实际项目经验，提供可操作的优化方案。

**核心指标目标**：
- LCP（最大内容绘制）：< 2.5s
- FID（首次输入延迟）：< 100ms
- CLS（累积布局偏移）：< 0.1
- TTI（可交互时间）：< 3.8s

---

## 一、运行时性能

### 1.1 渲染优化技巧

**组件渲染优化**
```typescript
// ✅ 良好：使用 React.memo 优化子组件
const MemoizedButton = React.memo(({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
});

// ✅ 良好：使用 Fragment 减少 DOM 节点
// ❌ 不良：多余的 div 包裹
function BadComponent() {
  return (
    <div>
      <div>{header}</div>
      <div>{content}</div>
      <div>{footer}</div>
    </div>
  );
}

// ✅ 良好：使用 Fragment
function GoodComponent() {
  return (
    <>
      <div>{header}</div>
      <div>{content}</div>
      <div>{footer}</div>
    </>
  );
}

// ✅ 良好：列表使用 key 优化
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
```

**避免不必要的重渲染**
```typescript
// ✅ 良好：使用 useMemo 缓存计算结果
function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]);

  return filteredProducts.map(p => <ProductCard key={p.id} product={p} />);
}

// ✅ 良好：使用 useCallback 缓存回调
function ParentComponent() {
  const [count, setCount] = useState(0);

  // 避免每次渲染创建新函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <ChildComponent onClick={handleClick} />;
}

// ✅ 良好：状态提升优化
// 将频繁变化的状态放在子组件内部
function GoodStatePlacement() {
  return (
    <>
      {/* 很少变化的静态内容 */}
      <Header />

      {/* 频繁变化的动态内容 */}
      <DynamicContent />
    </>
  );
}
```

### 1.2 列表渲染优化

**虚拟列表**
```typescript
// ✅ 良好：使用虚拟列表处理大量数据
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ListItem item={items[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}

// ✅ 良好：分页加载
function PaginatedList({ initialItems, loadMore }) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreItems = useCallback(async () => {
    if (hasMore) {
      const newItems = await loadMore(page + 1);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(p => p + 1);
      }
    }
  }, [page, hasMore, loadMore]);

  return (
    <div>
      {items.map(item => <ListItem key={item.id} item={item} />)}
      {hasMore && <LoadMoreButton onClick={loadMoreItems} />}
    </div>
  );
}
```

**列表项优化**
```typescript
// ✅ 良好：列表项组件独立且稳定
const ProductCard = React.memo(({ product }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p>¥{product.price}</p>
    </div>
  );
});

// ❌ 不良：列表项内部使用不稳定的状态
function BadListItem({ item }) {
  const [expanded, setExpanded] = useState(false); // 每个 item 都有自己的状态

  return (
    <div onClick={() => setExpanded(!expanded)}>
      <div>{item.title}</div>
      {expanded && <div>{item.description}</div>}
    </div>
  );
}
```

### 1.3 防抖和节流

**防抖（Debounce）**
```typescript
// ✅ 良好：防抖搜索输入
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // 防抖：停止输入 300ms 后才执行搜索
  const debouncedSearch = useDebouncedCallback(
    async (searchQuery) => {
      if (searchQuery) {
        const data = await searchAPI(searchQuery);
        setResults(data);
      }
    },
    300
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <SearchResults results={results} />
    </div>
  );
}

// ✅ 良好：自定义防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**节流（Throttle）**
```typescript
// ✅ 良好：节流滚动事件
import { useThrottledCallback } from 'use-debounce';

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useThrottledCallback(() => {
    setScrollY(window.scrollY);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return <div>滚动位置: {scrollY}px</div>;
}

// ✅ 良好：节流鼠标移动
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;

    const handleMouseMove = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setPosition({ x: e.clientX, y: e.clientY });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div>
      鼠标位置: {position.x}, {position.y}
    </div>
  );
}
```

---

## 二、包体积优化

### 2.1 Tree Shaking

**配置优化**
```typescript
// ✅ 良好：使用 ES Modules
// 确保 package.json 中设置 "sideEffects": false
{
  "name": "my-library",
  "sideEffects": false,
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js"
}

// ✅ 良好：按需导入
// ❌ 整体导入
import _ from 'lodash';
const result = _.cloneDeep(obj);

// ✅ 按需导入
import cloneDeep from 'lodash/cloneDeep';
const result = cloneDeep(obj);

// ✅ 使用 ES 模块版本
import { cloneDeep } from 'lodash-es';
const result = cloneDeep(obj);
```

**构建配置**
```typescript
// ✅ 良好：Webpack Tree Shaking 配置
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true, // 标记未使用的导出
    sideEffects: true, // 启用 sideEffects 优化
    providedExports: true, // 标记提供的导出
    minimize: true, // 最小化
  },
};

// ✅ 良好：禁止导入整个库
// ❌ 不良
import moment from 'moment';
moment().format('YYYY-MM-DD');

// ✅ 良好：使用日期库替代
import { format } from 'date-fns';
format(new Date(), 'yyyy-MM-dd');
```

### 2.2 代码分割

**动态导入**
```typescript
// ✅ 良好：路由级代码分割（Next.js）
const Dashboard = dynamic(() => import('./pages/Dashboard'));
const Settings = dynamic(() => import('./pages/Settings'));

// ✅ 良好：组件级代码分割
const HeavyChart = dynamic(() => import('./components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // 客户端渲染
});

// ✅ 良好：条件加载
function FeatureGate({ feature, children }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkFeatureFlag(feature).then(setIsEnabled);
  }, [feature]);

  if (!isEnabled) return null;
  return children;
}

// 使用
<FeatureGate feature="new_dashboard">
  <NewDashboard />
</FeatureGate>
```

**React.lazy 和 Suspense**
```typescript
// ✅ 良好：路由懒加载
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 2.3 依赖分析工具

**Bundle 分析**
```bash
# Webpack Bundle 分析器
npm install --save-dev webpack-bundle-analyzer

# Next.js Bundle 分析
ANALYZE=true npm run build

# Vite Bundle 分析
npm install --save-dev rollup-plugin-visualizer
```

**依赖优化策略**
```typescript
// ✅ 良好：替换重型库
// 替换前：moment.js (67KB)
// 替换后：date-fns (3KB) 或 dayjs (2KB)

import dayjs from 'dayjs';

// ✅ 良好：使用 CSS-in-JS 替代 styled-components
// 或者使用静态 CSS

// ✅ 良好：避免运行时依赖
// ❌ 不良
import { camelCase } from 'lodash';
const key = camelCase('hello_world');

// ✅ 良好：使用原生方法
const key = 'hello_world'.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
```

---

## 三、资源优化

### 3.1 图片优化

**Next.js Image 组件**
```typescript
// ✅ 良好：使用 Next.js Image
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div>
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={300}
        placeholder="blur"
        blurDataURL={product.blurDataUrl}
        priority={product.isAboveFold} // 首屏优先加载
      />
    </div>
  );
}

// ✅ 良好：响应式图片
<Image
  src={product.image}
  alt={product.name}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**原生图片优化**
```typescript
// ✅ 良好：使用 WebP 格式
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="描述" loading="lazy" />
</picture>

// ✅ 良好：图片懒加载
<img
  src="/image.jpg"
  alt="描述"
  loading="lazy"
  decoding="async"
/>

// ✅ 良好：图片尺寸明确
// 总是指定 width 和 height，或使用 aspect-ratio
<div style={{ aspectRatio: '16 / 9' }}>
  <img src="/image.jpg" alt="描述" />
</div>
```

### 3.2 字体优化

**字体加载策略**
```typescript
// ✅ 良好：使用 next/font（Next.js）
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 使用 swap 策略
  preload: true,
});

function MyApp({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}

// ✅ 良好：预加载关键字体
<link
  rel="preload"
  href="/fonts/custom-font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

// ✅ 良好：字体子集化
/* 只加载需要的字符 */
@font-face {
  font-family: 'Chinese Font';
  src: url('/fonts/chinese-subset.woff2') format('woff2');
  unicode-range: U+4E00-9FFF; /* 常用汉字范围 */
}
```

### 3.3 CSS 优化

**CSS 优化策略**
```typescript
// ✅ 良好：使用 CSS Modules
// Button.module.css
.button {
  background: var(--primary-color);
  padding: 8px 16px;
}

/* 避免全局样式污染 */

// ✅ 良好：关键 CSS 内联
// 在 HTML 中内联首屏关键 CSS
<style>
  .critical { color: red; }
</style>

// ✅ 良好：异步加载 CSS
<link
  rel="stylesheet"
  href="/styles/non-critical.css"
  media="print"
  onLoad={() => this.media='all'}
/>

// ✅ 良好：避免 @import
// ❌ 不良
@import url('https://fonts.googleapis.com/css2?family=Roboto');

/* ✅ 使用 <link> */
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto" />
```

---

## 四、缓存策略

### 4.1 浏览器缓存

**缓存头配置**
```typescript
// ✅ 良好：静态资源缓存（服务器配置）
// Nginx 配置示例
location /static/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

// ✅ 良好：HTML 缓存策略
// 不缓存或短期缓存
Cache-Control: no-cache, no-store, must-revalidate

// ✅ 良好：API 响应缓存
// 适合缓存的 GET 请求
Cache-Control: public, max-age=300, stale-while-revalidate=600

// ✅ 良好：使用版本化文件名
// style.v1.css, style.v2.css
const stylesheet = `/static/css/${version}/style.css`;
```

### 4.2 Service Worker

**离线缓存策略**
```typescript
// ✅ 良好：Service Worker 注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered:', registration);
  });
}

// ✅ 良好：缓存策略
// sw.js
const CACHE_NAME = 'v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 缓存优先，回退到网络
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 网络优先，回退到缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
```

### 4.3 数据缓存

**客户端数据缓存**
```typescript
// ✅ 良好：缓存 API 响应
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

async function fetchWithCache(url: string): Promise<any> {
  const cached = cache.get(url);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(url);
  const data = await response.json();

  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// ✅ 良好：SWR 模式（Stale-While-Revalidate）
function useSWR<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stale = true;

    const fetchData = async () => {
      try {
        const result = await fetcher();
        if (stale) {
          setData(result);
        }
      } catch (err) {
        if (stale) {
          setError(err as Error);
        }
      } finally {
        if (stale) {
          setIsLoading(false);
        }
      }
    };

    // 先显示缓存数据（stale），然后重新获取
    fetchData();

    // 定期刷新
    const interval = setInterval(fetchData, 30000);

    return () => {
      stale = false;
      clearInterval(interval);
    };
  }, [key, fetcher]);

  return { data, error, isLoading };
}
```

---

## 五、性能监控

### 5.1 Core Web Vitals

**LCP 优化**
```typescript
// ✅ 监控 LCP
new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// ✅ LCP 优化策略
// 1. 优化服务器响应时间
// 2. 使用 CDN
// 3. 优化关键资源（CSS、JS）
// 4. 图片优化（WebP、压缩、懒加载）
// 5. 预加载关键资源
<link rel="preload" href="/hero-image.webp" as="image" />
```

**CLS 优化**
```typescript
// ✅ 避免 CLS
// 1. 为图片和视频指定尺寸
<img src="/image.jpg" width="300" height="200" />

// 2. 使用 aspect-ratio
<div style={{ aspectRatio: '16 / 9' }}>
  <img src="/image.jpg" />
</div>

// 3. 预分配空间
// 加载前显示骨架屏
<div class="skeleton" style={{ minHeight: '200px' }} />

// 4. 避免动态插入内容
// ❌ 不良：在已加载内容上方插入广告
document.body.insertAdjacentHTML('afterbegin', adContent);

// ✅ 良好：使用 placeholder
<div id="ad-slot" style="min-height: 250px">
  <Skeleton />
</div>
```

### 5.2 性能测量工具

**Lighthouse CLI**
```bash
# 安装
npm install -g lighthouse

# 运行审计
lighthouse https://example.com --output html --output-path ./report.html

# 移动端审计
lighthouse https://example.com --preset=perf --form-factor=mobile --throttling.cpuSlowdownMultiplier=4
```

**Web Vitals 库**
```typescript
// ✅ 监控真实用户性能
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
  // 发送到分析服务
  console.log(`${name}: ${delta}`);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

---

## 六、最佳实践总结

### 6.1 性能检查清单

- [ ] 图片使用 WebP/AVIF 格式，指定尺寸
- [ ] 字体使用预加载和 swap 策略
- [ ] CSS 和 JS 代码分割
- [ ] 关键 CSS 内联
- [ ] 使用 HTTP/2 和 CDN
- [ ] 静态资源长期缓存
- [ ] API 响应缓存
- [ ] 列表使用虚拟滚动（大量数据时）
- [ ] 防抖/节流频繁事件
- [ ] 避免不必要的重渲染

### 6.2 性能优化优先级

1. **关键渲染路径优化**（最高优先级）
   - 减少阻塞渲染的资源
   - 优化 CSS 和 JS 加载顺序

2. **网络性能优化**
   - 减少请求数量
   - 减小响应大小
   - 使用 CDN

3. **运行时性能优化**
   - 减少 JavaScript 执行时间
   - 优化渲染性能

4. **资源优化**
   - 图片、字体、视频优化
   - CSS 优化

### 6.3 性能预算

```typescript
// ✅ 性能预算建议
const performanceBudget = {
  // 包体积
  totalJs: '200KB',        // 最大 JS 文件
  totalCss: '50KB',        // 最大 CSS 文件
  totalPage: '500KB',      // 总资源大小

  // 请求数量
  maxRequests: 20,         // 首屏最大请求数
  maxCriticalRequests: 5,   // 关键请求数

  // 时间指标
  LCP: 2500,              // 毫秒
  FID: 100,
  CLS: 0.1,
  TTI: 3800,
};
```

---

**创建时间**：2026-05-21
**版本**：1.0
**参考标准**：Google Web Vitals + Core Web Vitals
