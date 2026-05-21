---
name: "frontend-modification-security"
description: "前端修改安全约束。当用户修改 Vue/React 组件、调整页面布局、创建覆盖层/蒙版组件时激活。提供数据绑定保护、布局一致性规范、覆盖层定位规范。"
---

# 前端修改安全约束

## 概述

本技能提供前端组件修改时的安全约束规范，确保在修改 Vue/React 组件、调整页面布局、创建覆盖层/蒙版组件时的代码安全性和一致性。适用于组件开发、布局调整、交互组件创建等场景。

修改 Vue/React 文件时，必须遵守以下规则，防止破坏已有功能。

## 绝对禁止修改（除非明确要求重构逻辑）

| 类型 | 说明 | 示例 |
|------|------|------|
| 数据绑定 | v-model / v-bind 的字段名 | `v-model="form.username"`或者`{{ form.username }}` |
| Props | props 定义和传递的属性名 | `:user-id="userId"`或者`{{ props.userId }}` |
| 事件 | emit 事件名和 @ 绑定 | `@click="handleSubmit"`或者`click="handleSubmit"` |
| 响应式变量 | ref / reactive 变量名 | `const loading = ref(false)`或者`const loading = useRef(false)` |
| API 调用 | 接口路径、参数、响应处理 | `api.getUser(id)` |
| 类型定义 | TypeScript interface/type | `interface User { ... }` |
| 函数名 | 已有的方法和函数名 | `function handleSubmit()` |

## 允许修改

| 类型 | 说明 | 示例 |
|------|------|------|
| 布局结构 | div / el-row / el-col 层级 | 减少嵌套层级 |
| 布局组件 | Element Plus/antd-design 布局相关属性 | `span` / `gutter` / `justify` |
| CSS 样式 | style 中的样式代码 | `padding` / `margin` / `flex` |
| 样式类名 | 纯样式用途的 class | `class="container"` |
| 包裹元素 | 不影响逻辑的外层容器 | 添加/移除布局用的 div |

---

## 三大核心领域

### 一、数据绑定保护

#### 1. Vue 数据绑定保护

##### 响应式数据安全
```vue
<template>
  <div>
    <!-- ✅ 安全：使用计算属性保护原始数据 -->
    <input v-model="safeEmail" />
    
    <!-- ❌ 危险：直接绑定用户输入 -->
    <!-- <input v-model="userInput" /> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 原始数据（私有）
      _email: '',
      
      // 计算属性提供安全访问
      computed: {
        safeEmail: {
          get() {
            return this._email
          },
          set(value) {
            // 数据验证
            if (this.validateEmail(value)) {
              this._email = this.sanitize(value)
            }
          }
        }
      }
    }
  },
  
  methods: {
    validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    },
    
    sanitize(input) {
      // HTML转义
      return input.replace(/[<>]/g, '')
    }
  }
}
</script>
```

##### Props 传递安全
```vue
<!-- Parent.vue -->
<template>
  <!-- ✅ 安全：传递副本而非直接引用 -->
  <ChildComponent :data="cloneDeep(originalData)" />
  
  <!-- ❌ 危险：传递对象引用 -->
  <!-- <ChildComponent :data="originalData" /> -->
</template>

<script>
import { cloneDeep } from 'lodash-es'

export default {
  data() {
    return {
      originalData: { name: 'test', items: [1, 2, 3] }
    }
  },
  
  methods: {
    cloneDeep
  }
}
</script>
```

##### 双向绑定防护
```vue
<!-- ✅ 安全：使用自定义事件 -->
<template>
  <CustomInput 
    :value="inputValue" 
    @update="handleUpdate" 
  />
</template>

<!-- ❌ 危险：直接修改 prop -->
<!-- 子组件中：this.$emit('input', newValue) -->
```

#### 2. React 数据绑定保护

##### State 安全管理
```tsx
// ✅ 安全：使用不可变更新
const [items, setItems] = useState<Item[]>([])

const addItem = (newItem: Item) => {
  setItems(prev => [...prev, { ...newItem, id: Date.now() }])
}

// ❌ 危险：直接修改 state
// items.push(newItem) ❌

// ❌ 危险：浅拷贝修改
// setItems([...items]) // 如果 items 内部有对象引用
```

##### Props 传递安全
```tsx
// ✅ 安全：使用 React.memo 和浅比较
const ChildComponent = React.memo(({ data }: Props) => {
  return <div>{data.name}</div>
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return prevProps.data.id === nextProps.data.id
})

// ✅ 安全：使用 Immutable.js
import { Map } from 'immutable'
const [state, setState] = useState(Map({ items: [] }))
```

##### 状态提升安全
```tsx
// ✅ 安全：状态提升时使用回调
const Parent = () => {
  const [data, setData] = useState<Data | null>(null)
  
  const handleDataChange = useCallback((newData: Data) => {
    setData(prev => ({
      ...prev,
      ...newData,
      lastModified: Date.now()
    }))
  }, [])
  
  return <Child onDataChange={handleDataChange} />
}

// ❌ 危险：直接传递 setState
// <Child setData={setData} /> // 暴露了修改权限
```

#### 3. 数据验证与类型安全

##### TypeScript 类型保护
```typescript
// ✅ 安全：使用类型守卫
interface User {
  id: number
  name: string
  email: string
}

function isValidUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj && typeof obj.id === 'number' &&
    'name' in obj && typeof obj.name === 'string' &&
    'email' in obj && typeof obj.email === 'string'
  )
}

// ✅ 安全：使用 Zod 进行运行时验证
import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  email: z.string().email()
})

type User = z.infer<typeof UserSchema>
```

##### 数据脱敏
```typescript
// ✅ 安全：敏感数据脱敏
function maskSensitiveData(data: User): DisplayUser {
  return {
    id: data.id,
    name: data.name,
    email: maskEmail(data.email), // 脱敏邮箱
    phone: maskPhone(data.phone)  // 脱敏手机号
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  return `${name[0]}***@${domain}`
}
```

### 二、布局一致性规范

#### 1. 响应式布局规范

##### 断点管理
```css
/* ✅ 安全：使用语义化断点 */
:root {
  /* 移动端优先断点 */
  --breakpoint-sm: 640px;   /* 大手机 */
  --breakpoint-md: 768px;   /* 平板 */
  --breakpoint-lg: 1024px;  /* 小屏电脑 */
  --breakpoint-xl: 1280px;  /* 大屏电脑 */
}

/* ✅ 安全：CSS 容器查询 */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 300px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

##### 布局组件规范
```vue
<!-- ✅ 安全：使用布局组件 -->
<template>
  <div class="layout">
    <Header />
    <main class="layout-main">
      <Sidebar />
      <Content />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-main {
  display: flex;
  flex: 1;
  /* ✅ 安全：内容区自适应 */
  min-height: 0;
}
</style>
```

#### 2. Flexbox 安全实践

##### 常见陷阱规避
```css
/* ✅ 安全：Flex 项目溢出处理 */
.flex-container {
  display: flex;
  overflow: hidden; /* 防止布局溢出 */
}

.flex-item {
  flex: 1 1 0;
  min-width: 0; /* ✅ 关键：防止文字溢出 */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ 安全：多行 Flex 布局 */
.flex-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.flex-item {
  flex: 1 1 300px; /* 最小宽度 300px */
  max-width: 100%;
}
```

##### Flex 布局模式
```css
/* ✅ 安全：Space-between 一致性 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 24px;
}

.nav-item {
  flex-shrink: 0; /* ✅ 防止导航项被压缩 */
}
```

#### 3. Grid 布局安全实践

##### 网格安全配置
```css
/* ✅ 安全：响应式 Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

/* ✅ 安全：防止网格溢出 */
.grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  overflow: hidden;
}

/* ✅ 安全：Grid 区域命名 */
.grid-container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

#### 4. 布局一致性检查清单

- [ ] 所有断点定义在 CSS 变量中
- [ ] 移动端优先设计
- [ ] Flex/Grid 子元素设置 `min-width: 0` 防止溢出
- [ ] 使用 `gap` 而非 `margin` 控制间距
- [ ] 内容容器设置最大宽度和内边距
- [ ] 关键布局组件独立封装
- [ ] 使用 CSS 变量统一管理间距和尺寸

### 三、覆盖层定位规范

#### 1. Modal/对话框规范

##### 基础结构
```vue
<!-- ✅ 安全：标准 Modal 结构 -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible"
        class="modal-overlay"
        @click.self="handleOverlayClick"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-container">
          <header class="modal-header">
            <slot name="header">
              <h2>标题</h2>
            </slot>
            <button 
              @click="handleClose"
              aria-label="关闭"
            >×</button>
          </header>
          
          <main class="modal-body">
            <slot></slot>
          </main>
          
          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

##### Modal 样式规范
```css
.modal-overlay {
  position: fixed;
  inset: 0; /* ✅ 全屏覆盖 */
  z-index: 1000; /* ✅ 定义层级 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px); /* ✅ 背景模糊 */
}

.modal-container {
  position: relative;
  z-index: 1001; /* ✅ Modal 内容层级高于背景 */
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

#### 2. 下拉菜单/弹出层规范

##### 定位策略
```vue
<template>
  <div class="dropdown-wrapper" ref="wrapperRef">
    <button @click="toggleDropdown">
      触发器
    </button>
    
    <Transition name="dropdown">
      <div 
        v-if="isOpen"
        class="dropdown-menu"
        :style="dropdownStyle"
      >
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const wrapperRef = ref<HTMLElement>()
const isOpen = ref(false)
const position = ref({ top: 0, left: 0 })

const dropdownStyle = computed(() => ({
  position: 'absolute' as const,
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  zIndex: 1100
}))

const updatePosition = () => {
  if (!wrapperRef.value) return
  
  const rect = wrapperRef.value.getBoundingClientRect()
  const scrollTop = window.scrollY
  
  // ✅ 安全：智能定位（防止溢出）
  position.value = {
    top: rect.bottom + scrollTop + 8,
    left: rect.left
  }
}
</script>
```

##### 智能定位
```typescript
// ✅ 安全：视口溢出检测
interface Position {
  top: number
  left: number
  placement: 'bottom' | 'top' | 'left' | 'right'
}

function calculatePosition(
  triggerRect: DOMRect,
  menuRect: DOMRect,
  viewportHeight: number,
  viewportWidth: number
): Position {
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const spaceRight = viewportWidth - triggerRect.right
  
  // 优先下方
  if (spaceBelow >= menuRect.height || spaceBelow >= spaceAbove) {
    return {
      top: triggerRect.bottom,
      left: triggerRect.left,
      placement: 'bottom'
    }
  }
  
  // 切换到上方
  return {
    top: triggerRect.top - menuRect.height,
    left: triggerRect.left,
    placement: 'top'
  }
}
```

#### 3. z-index 层级管理

##### 层级规范
```css
/* ✅ 安全：定义清晰的 z-index 层级 */
:root {
  /* 内容层 */
  --z-dropdown: 100;
  --z-sticky: 200;
  
  /* 覆盖层 */
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  
  /* 最高层 */
  --z-tooltip: 700;
  --z-toast: 800;
  --z-notification: 900;
}

/* ✅ 安全：使用组件作用域 z-index */
.modal-overlay {
  z-index: var(--z-modal-backdrop);
}

.modal-content {
  z-index: calc(var(--z-modal) + 1);
}
```

##### 常见错误
```css
/* ❌ 危险：使用魔法数字 */
/* .modal { z-index: 9999; } */

/* ❌ 危险：层级冲突 */
/* .dropdown { z-index: 1000; } */
/* .modal { z-index: 1000; } // 会冲突 */

/* ✅ 安全：使用明确的层级定义 */
.modal-overlay {
  z-index: 1000;
}

.dropdown {
  z-index: 900; /* 低于 modal */
}
```

#### 4. 滚动锁定规范

##### 安全滚动锁定
```typescript
// ✅ 安全：滚动锁定管理
class ScrollLockManager {
  private count = 0
  
  lock() {
    this.count++
    if (this.count === 1) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${this.getScrollbarWidth()}px`
    }
  }
  
  unlock() {
    this.count = Math.max(0, this.count - 1)
    if (this.count === 0) {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }
  
  private getScrollbarWidth(): number {
    return window.innerWidth - document.documentElement.clientWidth
  }
}

// ✅ 安全：在 Vue 中使用
const scrollLock = new ScrollLockManager()

watch(() => props.visible, (newVal) => {
  if (newVal) {
    scrollLock.lock()
  } else {
    scrollLock.unlock()
  }
})

onUnmounted(() => {
  scrollLock.unlock() // ✅ 确保组件卸载时释放
})
```

#### 5. Backdrop/Mask 规范

##### 蒙版规范
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  
  /* ✅ 安全：使用半透明背景 */
  background: rgba(0, 0, 0, 0.5);
  
  /* ✅ 安全：添加模糊效果 */
  backdrop-filter: blur(4px);
  
  /* ✅ 安全：允许点击穿透（可选） */
  pointer-events: none; /* 模态框自己处理点击 */
}

.modal-backdrop.clickable {
  pointer-events: auto; /* 需要关闭模态框时 */
}

/* ✅ 安全：动画过渡 */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
```

#### 6. 覆盖层安全检查清单

##### Modal/对话框
- [ ] 使用 `<Teleport to="body">` 渲染
- [ ] 设置 `aria-modal="true"`
- [ ] 焦点管理（打开时聚焦，关闭时返回）
- [ ] ESC 键关闭支持
- [ ] 点击背景关闭（可选）
- [ ] 滚动锁定
- [ ] z-index 层级正确

##### 下拉菜单/弹出层
- [ ] 智能定位（防止视口溢出）
- [ ] 点击外部关闭
- [ ] 键盘导航支持
- [ ] 滚动区域处理
- [ ] 嵌套层级正确

##### z-index 管理
- [ ] 定义全局 z-index 变量
- [ ] 按层级分组定义
- [ ] 避免魔法数字
- [ ] 使用 calc() 处理相对层级

##### 滚动锁定
- [ ] Modal 打开时锁定
- [ ] 关闭时解锁
- [ ] 组件卸载时确保解锁
- [ ] 处理滚动条宽度变化

## 综合安全规范

### 组件修改安全流程

```markdown
## 修改前检查
1. 确认数据流向（单向/双向）
2. 识别数据依赖关系
3. 检查现有单元测试

## 修改中规范
1. 使用不可变更新模式
2. 添加数据验证
3. 保持 Props 只读
4. 记录状态变更

## 修改后验证
1. 运行单元测试
2. 检查 TypeScript 类型
3. 验证响应式更新
4. 测试边界情况
```

### 代码审查要点

- [ ] 数据修改是否安全（不可变更新）
- [ ] Props 是否被直接修改
- [ ] 状态提升是否合理
- [ ] 布局是否响应式
- [ ] 覆盖层层级是否正确
- [ ] 滚动锁定是否正确管理
- [ ] 是否有 XSS 风险（用户输入绑定）

## 触发场景

本技能在以下情况下自动激活：

1. **修改 Vue/React 组件时**
   - 添加新的数据绑定
   - 修改现有组件的 props
   - 调整组件状态管理

2. **调整页面布局时**
   - 修改 Flex/Grid 布局
   - 调整响应式断点
   - 重构布局组件结构

3. **创建覆盖层/蒙版组件时**
   - Modal/Dialog 组件
   - 下拉菜单/Dropdown
   - 弹出层/Popover
   - 工具提示/Tooltip
   - Toast/通知组件

## 快速命令

- 输入 `/check-data` - 检查数据绑定安全性
- 输入 `/check-layout` - 检查布局一致性
- 输入 `/check-overlay` - 检查覆盖层规范
- 输入 `/security-review` - 完整安全审查