/**
 * 安全模式示例
 * 本文件展示前端安全的最佳实践
 */

/**
 * XSS 防护
 */

/**
 * HTML 转义
 * @param text - 原始文本
 * @returns 转义后的文本
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * 输入验证
 */

/**
 * 邮箱格式验证
 * @param email - 邮箱地址
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 密码强度验证
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密码长度至少8位');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含数字');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 数据脱敏
 */

/**
 * 邮箱脱敏
 * @param email - 邮箱地址
 * @returns 脱敏后的邮箱
 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name[0]}***@${domain}`;
}

/**
 * 手机号脱敏
 * @param phone - 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 身份证脱敏
 * @param idCard - 身份证号
 * @returns 脱敏后的身份证号
 */
export function maskIdCard(idCard: string): string {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}

/**
 * 银行卡脱敏
 * @param cardNumber - 银行卡号
 * @returns 脱敏后的银行卡号
 */
export function maskBankCard(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2');
}

/**
 * CSRF 防护
 */

/**
 * 获取 CSRF Token
 * @returns CSRF Token
 */
export function getCsrfToken(): string {
  const name = 'csrfToken';
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return '';
}

/**
 * 安全请求封装
 * @param url - 请求 URL
 * @param options - 请求选项
 * @returns Promise<Response>
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCsrfToken();

  const defaultOptions: RequestInit = {
    credentials: 'include', // 包含 Cookie
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...options.headers,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
}

/**
 * API 请求类
 */
export class SecureApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 安全的 GET 请求
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await secureFetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }

  /**
   * 安全的 POST 请求
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await secureFetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }

  /**
   * 安全的 PUT 请求
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await secureFetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }

  /**
   * 安全的 DELETE 请求
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await secureFetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: Record<string, unknown>
  ) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
  }
}

/**
 * 速率限制器
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * 检查是否允许请求
   * @param clientId - 客户端标识
   * @returns 是否允许
   */
  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(clientId) || [];

    // 清理过期的时间戳
    const recentRequests = timestamps.filter(
      (time) => now - time < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    return true;
  }

  /**
   * 获取剩余请求次数
   */
  getRemainingRequests(clientId: string): number {
    const timestamps = this.requests.get(clientId) || [];
    const now = Date.now();
    const recentRequests = timestamps.filter(
      (time) => now - time < this.windowMs
    );

    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

/**
 * 日志脱敏
 */

/**
 * 日志级别
 */
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * 敏感字段列表
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'creditCard',
  'ssn',
  'phone',
  'email',
  'name',
  'address',
];

/**
 * 脱敏日志数据
 * @param data - 原始数据
 * @returns 脱敏后的数据
 */
export function sanitizeForLog(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data } as Record<string, unknown>;

  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * 安全日志记录
 */
export function safeLog(
  level: LogLevel,
  message: string,
  context?: unknown
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: LogLevel[level],
    message,
    context: context ? sanitizeForLog(context) : undefined,
  };

  console.log(JSON.stringify(logEntry));
}

/**
 * 存储安全
 */

/**
 * 安全存储接口
 */
interface SecureStorageOptions {
  secretKey: string;
}

/**
 * 安全存储类
 */
export class SecureStorage {
  private secretKey: string;

  constructor({ secretKey }: SecureStorageOptions) {
    this.secretKey = secretKey;
  }

  /**
   * 设置值
   */
  set(key: string, value: unknown): void {
    const encrypted = btoa(
      JSON.stringify(value)
    );
    localStorage.setItem(key, encrypted);
  }

  /**
   * 获取值
   */
  get<T>(key: string): T | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      return JSON.parse(atob(encrypted)) as T;
    } catch {
      return null;
    }
  }

  /**
   * 移除值
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * 清空所有值
   */
  clear(): void {
    localStorage.clear();
  }
}

/**
 * 安全 URL 验证
 */

/**
 * 验证 URL 是否安全
 * @param url - 待验证的 URL
 * @returns 是否安全
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // 禁止 javascript: 协议
    if (parsed.protocol === 'javascript:') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 验证重定向 URL
 * @param redirectUrl - 重定向 URL
 * @param allowedDomains - 允许的域名列表
 * @returns 验证结果
 */
export function validateRedirectUrl(
  redirectUrl: string,
  allowedDomains: string[]
): boolean {
  try {
    const parsed = new URL(redirectUrl);

    // 检查协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // 检查域名
    return allowedDomains.some((domain) => {
      const allowed = new URL(domain);
      return parsed.hostname === allowed.hostname;
    });
  } catch {
    return false;
  }
}

// 类型定义

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}
