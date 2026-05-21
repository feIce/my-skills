/**
 * React 组件模式示例
 * 本文件展示 React 开发的最佳实践模式
 */

/**
 * 基础组件模式
 */

// ✅ 良好：完整的组件结构
interface ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 点击事件处理 */
  onClick?: () => void;
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'danger';
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义样式类 */
  className?: string;
}

/**
 * 按钮组件
 * @param props - 组件属性
 * @returns 按钮元素
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * 表单组件模式
 */

interface FormInputProps {
  /** 输入框名称 */
  name: string;
  /** 输入框标签 */
  label: string;
  /** 输入值 */
  value: string;
  /** 值变化处理 */
  onChange: (value: string) => void;
  /** 错误信息 */
  error?: string;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 表单输入组件
 */
export function FormInput({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
}: FormInputProps) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * 数据获取组件
 */

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProfileProps {
  userId: string;
}

/**
 * 用户资料卡片组件
 */
export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('获取用户信息失败');

        const data = await response.json();
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

/**
 * 列表渲染优化
 */

interface ProductListProps {
  products: Product[];
}

/**
 * 商品列表组件
 */
export function ProductList({ products }: ProductListProps) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

/**
 * 商品卡片组件（使用 memo 优化）
 */
const ProductCard = React.memo(({ product }: { product: Product }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p>¥{product.price}</p>
    </div>
  );
});

/**
 * 自定义 Hook 示例
 */

/**
 * 防抖值 Hook
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 本地存储 Hook
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('读取 localStorage 失败:', error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('写入 localStorage 失败:', error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * Context 使用示例
 */

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) throw new Error('登录失败');

    const data = await response.json();
    setUser(data.user);
  }, []);

  const logout = React.useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}
