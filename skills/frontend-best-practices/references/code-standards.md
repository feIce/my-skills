# 前端代码规范指南

## 概述

本文档提供前端代码规范指南，涵盖 TypeScript 类型安全、命名规范、代码结构、React 组件开发等核心领域。

---

## 一、TypeScript 类型安全

### 1.1 避免 any 类型

| 做法 | 说明 |
|------|------|
| ❌ 使用 `any` | 丧失类型检查优势 |
| ✅ 使用具体类型 | `useState<DataType>(initialValue)` |
| ✅ 使用 `unknown` | 需要类型守卫验证 |

**类型守卫示例**：
```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

### 1.2 接口与类型别名

| 场景 | 推荐方式 |
|------|----------|
| 对象结构 | `interface` |
| 联合/交叉类型 | `type` |
| 需要扩展 | `interface extends` |
| 复杂组合 | `type` |

### 1.3 泛型约束

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

interface ApiResponse<T> {
  data: T;
  status: number;
}
```

### 1.4 运行时验证

使用 Zod 进行数据验证：
```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});
type User = z.infer<typeof UserSchema>;
```

---

## 二、命名规范

### 2.1 变量和函数

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName`, `isLoading` |
| 函数 | camelCase | `getUserById`, `handleSubmit` |
| 布尔值 | 前缀 is/has/can/should | `isActive`, `hasPermission` |

### 2.2 组件和类

| 类型 | 规范 | 示例 |
|------|------|------|
| React 组件 | PascalCase | `UserProfile`, `ProductCard` |
| 类 | PascalCase | `ApiClient`, `DataStore` |
| 接口 | PascalCase | `UserService`, `UserRepository` |

### 2.3 常量

| 类型 | 规范 | 示例 |
|------|------|------|
| 常量值 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 常量对象 | `const` + 对象 | `const HttpStatus = { OK: 200 } as const` |

### 2.4 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.tsx` |
| 工具函数 | kebab-case | `date-utils.ts` |
| 类型定义 | kebab-case | `user-types.ts` |
| Hooks | camelCase + use 前缀 | `useLocalStorage.ts` |

---

## 三、代码结构

### 3.1 函数设计

- **单一职责**：每个函数只做一件事
- **参数限制**：超过 3 个参数使用参数对象
- **返回类型**：显式注解函数返回类型

### 3.2 模块组织

**导入顺序**（从上到下）：
1. React 相关
2. 外部库
3. 内部模块
4. 类型定义
5. 样式和资源
6. 常量

### 3.3 注释规范

使用中文注释，遵循 JSDoc 格式：
```typescript
/**
 * 根据 ID 获取用户信息
 * @param id 用户唯一标识
 * @returns 用户信息
 */
async function getUserById(id: string): Promise<User | null> { }
```

---

## 四、React 组件开发

### 4.1 组件结构

**标准组件结构**（顺序）：
1. 类型定义（Props 接口）
2. 组件定义
3. Hooks
4. 回调函数
5. 样式计算
6. 渲染

### 4.2 Props 设计

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### 4.3 自定义 Hooks

- 命名以 `use` 开头
- 单一职责原则
- 返回状态和操作函数

```typescript
function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // 实现
}
```

### 4.4 状态管理

| 场景 | 推荐方式 |
|------|----------|
| 简单状态 | `useState` |
| 复杂状态 | `useReducer` |
| 跨组件共享 | Context + Hooks |
| 全局状态 | Zustand/Redux |

---

## 五、性能优化

### 5.1 React.memo

用于纯展示组件，避免不必要重渲染：
```typescript
const UserAvatar = React.memo(({ src, alt }: AvatarProps) => {
  return <img src={src} alt={alt} />;
});
```

### 5.2 useMemo 和 useCallback

```typescript
// useMemo 缓存计算结果
const filteredList = useMemo(() => {
  return items.filter(item => item.name.includes(filter));
}, [items, filter]);

// useCallback 缓存回调函数
const handleClick = useCallback((id: string) => {
  onSelect(id);
}, [onSelect]);
```

---

## 六、代码风格配置

### 6.1 ESLint 关键规则

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

### 6.2 Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 七、检查清单

### 开发检查项

- [ ] 无 `any` 类型滥用
- [ ] 函数有返回类型注解
- [ ] Props 有完整接口定义
- [ ] 命名符合规范
- [ ] Hooks 依赖正确
- [ ] 错误处理完善
- [ ] 列表渲染有唯一 key

---

**创建时间**：2026-05-21
**版本**：1.1（精简版）
**参考规范**：TypeScript 官方规范 + Airbnb JavaScript 规范
