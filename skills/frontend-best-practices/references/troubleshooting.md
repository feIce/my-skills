# 常见问题与解决方案

## 概述

本文档收集前端开发中的常见问题及其解决方案，涵盖 React、TypeScript、性能和安全等领域。

---

## 一、React 相关问题

### 1.1 状态更新时机

**问题**：状态更新后立即读取是旧值

```typescript
// ❌ 不良：立即读取状态
function BadExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // 仍然打印旧值
  };

  return <button onClick={handleClick}>{count}</button>;
}

// ✅ 良好：使用 useEffect 监听变化
function GoodExample() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Count updated:', count);
  }, [count]);

  const handleClick = () => {
    setCount(prev => prev + 1);
  };

  return <button onClick={handleClick}>{count}</button>;
}

// ✅ 良好：使用回调形式获取最新值
function CallbackExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => {
      console.log('New count:', prev + 1);
      return prev + 1;
    });
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

### 1.2 闭包陷阱

**问题**：useEffect 或事件处理中的闭包捕获旧值

```typescript
// ❌ 不良：闭包陷阱
function BadComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Count:', count); // 永远是 0
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []); // 依赖数组为空，捕获初始值

  return <div>{count}</div>;
}

// ✅ 良好：使用函数形式更新状态
function GoodComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{count}</div>;
}

// ✅ 良好：使用 ref 访问最新值
function RefComponent() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Count:', countRef.current);
      setCount(countRef.current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{count}</div>;
}
```

### 1.3 条件渲染问题

**问题**：条件渲染导致状态丢失

```typescript
// ❌ 不良：条件渲染导致组件重新挂载
function BadExample({ showModal }) {
  return (
    <div>
      {showModal && <Modal />}
      <Content />
    </div>
  );
}

// ✅ 良好：使用 CSS 控制显示
function GoodExample({ showModal }) {
  return (
    <div>
      <Modal style={{ display: showModal ? 'block' : 'none' }} />
      <Content />
    </div>
  );
}

// ✅ 良好：使用 CSS opacity
function ModalExample({ showModal }) {
  return (
    <div className={showModal ? 'modal-open' : 'modal-closed'}>
      <Modal />
    </div>
  );
}
```

### 1.4 Props 传递问题

**问题**：对象 props 导致子组件不必要的重渲染

```typescript
// ❌ 不良：每次渲染创建新对象
function BadParent() {
  const [user, setUser] = useState({ name: '张三', age: 25 });

  const handleClick = () => {
    setUser(prev => ({ ...prev, name: '李四' }));
  };

  // user 每次渲染都是新引用
  return <Child user={user} />;
}

// ✅ 良好：拆分 props
function GoodParent() {
  const [user, setUser] = useState({ name: '张三', age: 25 });

  return (
    <Child
      name={user.name}
      age={user.age}
    />
  );
}

// ✅ 良好：使用 React.memo
const Child = React.memo(({ user }) => {
  return <div>{user.name}</div>;
});
```

---

## 二、TypeScript 相关问题

### 2.1 类型推断问题

**问题**：类型推断不符合预期

```typescript
// ❌ 不良：类型过于宽泛
const mixedArray = [1, 'a', true]; // (string | number | boolean)[]

// ✅ 良好：明确类型
const typedArray: (string | number | boolean)[] = [1, 'a', true];

// ✅ 良好：使用 const assertion
const constantArray = [1, 'a', true] as const;
// type: readonly [1, 'a', true]
```

### 2.2 第三方库类型

**问题**：缺少类型定义

```typescript
// ✅ 良好：安装类型定义
npm install --save-dev @types/lodash

// ✅ 良好：使用 declare module
declare module 'custom-library' {
  export function customFunction(input: string): number;
}

// ✅ 良好：使用 any 作为临时方案
import customLib from 'custom-library';
(customLib as any).customFunction('test');
```

### 2.3 泛型困惑

**问题**：泛型使用不当

```typescript
// ✅ 良好：约束泛型类型
function identity<T extends object>(value: T): T {
  return value;
}

// ✅ 良好：多泛型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// ✅ 良好：默认泛型类型
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}
```

---

## 三、性能相关问题

### 3.1 重渲染问题

**问题**：组件频繁重渲染

```typescript
// ✅ 诊断：使用 React DevTools Profiler
// 找出不必要的重渲染

// ✅ 解决方案：使用 React.memo
const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});

// ✅ 解决方案：使用 useMemo 缓存计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ 解决方案：使用 useCallback 缓存回调
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### 3.2 内存泄漏

**问题**：未清理的订阅和定时器

```typescript
// ❌ 不良：内存泄漏
function LeakingComponent() {
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
    }, 1000);

    // 没有清理
  }, []);

  return <div>Memory leak!</div>;
}

// ✅ 良好：正确清理
function GoodComponent() {
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>No leak!</div>;
}

// ✅ 良好：清理订阅
function SubscriptionComponent() {
  useEffect(() => {
    const subscription = eventEmitter.subscribe(event => {
      handleEvent(event);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <div>Subscription</div>;
}
```

### 3.3 首屏加载慢

**问题**：首屏加载时间过长

```typescript
// ✅ 解决方案：代码分割
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ 解决方案：预加载关键资源
<link rel="preload" href="/critical-chunk.js" as="script" />

// ✅ 解决方案：优化图片
<Image
  src="/hero.webp"
  priority
  placeholder="blur"
  alt="Hero image"
/>
```

---

## 四、安全相关问题

### 4.1 XSS 注入风险

**问题**：用户输入未转义直接渲染

```typescript
// ❌ 不良：XSS 风险
function BadComponent({ userInput }) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
}

// ✅ 良好：转义后再渲染
function GoodComponent({ userInput }) {
  return <div>{escapeHtml(userInput)}</div>;
}

// ✅ 良好：使用 DOMPurify
import DOMPurify from 'dompurify';

function SanitizedComponent({ html }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### 4.2 敏感信息暴露

**问题**：敏感数据在客户端暴露

```typescript
// ❌ 不良：在 localStorage 中存储敏感信息
localStorage.setItem('token', 'actual-token');
localStorage.setItem('password', 'actual-password');

// ✅ 良好：使用 httpOnly Cookie
// 服务端设置
res.cookie('token', 'token', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// ✅ 良好：加密存储
import CryptoJS from 'crypto-js';

function secureStorage(key: string, value: any) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(value),
    SECRET_KEY
  );
  localStorage.setItem(key, encrypted.toString());
}
```

### 4.3 API 安全问题

**问题**：API 请求缺少安全措施

```typescript
// ✅ 良好：添加 CSRF Token
async function secureRequest(url: string, data: any) {
  const csrfToken = getCsrfToken();
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
}

// ✅ 良好：添加速率限制
class RateLimitedClient {
  private requests: number[] = [];
  private readonly maxRequests = 100;
  private readonly windowMs = 60000;

  async request(url: string) {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    this.requests.push(now);
    return fetch(url);
  }
}
```

---

## 五、开发工具问题

### 5.1 构建失败

**常见原因和解决方案**

```bash
# 依赖冲突
rm -rf node_modules package-lock.json
npm install

# 缓存问题
npm cache clean --force
rm -rf .next .nuxt dist
npm run build

# TypeScript 配置错误
npx tsc --noEmit --watch
# 修复显示的类型错误
```

### 5.2 热更新失效

```typescript
// 解决方案：检查 webpack 配置
module.exports = {
  // 确保 devServer 有 hot 配置
  devServer: {
    hot: true,
  },

  // 确保使用 HMR plugin
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
};
```

---

## 六、调试技巧

### 6.1 React DevTools

```typescript
// 在组件中显示名称
function MyComponent() {
  return <div>...</div>;
}
MyComponent.displayName = 'MyComponent';
```

### 6.2 性能调试

```typescript
// 使用 React Profiler API
<Profiler
  id="ComponentTree"
  onRender={(id, phase, actualDuration) => {
    if (actualDuration > 100) {
      console.warn(`Slow render: ${id} took ${actualDuration}ms`);
    }
  }}
>
  <App />
</Profiler>
```

### 6.3 网络调试

```typescript
// 拦截 API 请求
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [url, options] = args;
  console.log('API Request:', url, options);

  const response = await originalFetch(...args);

  console.log('API Response:', url, response);
  return response;
};
```

---

## 七、最佳实践总结

### 7.1 问题解决流程

1. **识别问题**：理解错误信息，确定问题类型
2. **定位原因**：使用 DevTools、console.log、调试器
3. **查找方案**：查看文档、社区、类似问题
4. **实施修复**：按照最佳实践实现
5. **验证修复**：测试修复是否有效

### 7.2 预防措施

- 使用 TypeScript 严格模式
- 编写单元测试
- 代码审查
- 定期更新依赖
- 性能监控

---

**创建时间**：2026-05-21
**版本**：1.0
