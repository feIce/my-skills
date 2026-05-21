/**
 * TypeScript 模式示例
 * 本文件展示 TypeScript 开发的最佳实践模式
 */

/**
 * 类型定义
 */

// ✅ 良好：接口定义
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ 良好：类型别名
type UserRole = 'admin' | 'editor' | 'viewer';
type Status = 'pending' | 'active' | 'inactive';

// ✅ 良好：联合类型
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ✅ 良好：交叉类型
type AdminUser = User & {
  role: 'admin';
  permissions: string[];
};

/**
 * Props 类型定义
 */

// ✅ 良好：组件 Props
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

// ✅ 良好：表单 Props
interface FormInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
}

/**
 * 类型守卫
 */

/**
 * 类型守卫函数
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 用户类型守卫
 */
function isUser(value: unknown): value is User {
  return (
    isObject(value) &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.email)
  );
}

/**
 * Zod 验证
 */

import { z } from 'zod';

/**
 * Zod schema 定义
 */
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['admin', 'editor', 'viewer']),
});

type User = z.infer<typeof UserSchema>;

/**
 * 验证函数
 */
function validateUser(data: unknown): User {
  const result = UserSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    throw new Error(`验证失败: ${errors.join(', ')}`);
  }

  return result.data;
}

/**
 * 泛型约束
 */

/**
 * 获取对象属性
 */
function getProperty<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

/**
 * 键值对转换为对象
 */
function toObject<K extends string | number, V>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * 函数类型
 */

// ✅ 良好：函数类型定义
type Callback<T> = (error: Error | null, result?: T) => void;

type PromiseCallback<T> = () => Promise<T>;

type EventHandler<T = unknown> = (event: T) => void;

// ✅ 良好：React 事件类型
type FormEventHandler = React.FormEvent<HTMLFormElement>;
type InputChangeHandler = React.ChangeEvent<HTMLInputElement>;
type ClickHandler = React.MouseEvent<HTMLButtonElement>;

/**
 * 工具类型
 */

// ✅ 良好：Partial 和 Required
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;

// ✅ 良好：Pick 和 Omit
type UserPreview = Pick<User, 'id' | 'name' | 'avatar'>;
type PublicUser = Omit<User, 'createdAt' | 'updatedAt'>;

// ✅ 良好：Record
type UserMap = Record<string, User>;
type StatusMap = Record<Status, string>;

// ✅ 良好：自定义工具类型
type Nullable<T> = T | null;
type Maybe<T> = T | undefined;
type AsyncResult<T> = Promise<ApiResponse<T>>;

/**
 * 枚举类型
 */

// ✅ 良好：const enum
const enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
}

// ✅ 良好：as const enum
const enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

/**
 * 类型断言
 */

// ✅ 良好：类型断言（谨慎使用）
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('值不是字符串类型');
  }
}

// ✅ 良好：非空断言
function getUserName(user: User | null): string {
  return user!.name;
}

// ✅ 良好：类型守卫优于断言
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript 知道 value 是 string
    return value.toUpperCase();
  } else {
    // TypeScript 知道 value 是 number
    return value.toFixed(2);
  }
}

/**
 * 模块类型
 */

// ✅ 良好：命名空间
namespace Validation {
  export function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  export function validatePassword(password: string): boolean {
    return password.length >= 8;
  }
}

// ✅ 良好：类型导出
export type { User, UserRole, ApiResponse };
