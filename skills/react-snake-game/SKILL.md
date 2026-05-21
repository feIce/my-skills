---
name: "react-snake-game"
description: "提供基于 react-pixi-snake-game 的 React 贪吃蛇游戏学习资源和示例代码。当用户想要学习 React 游戏开发或创建贪吃蛇游戏时调用。"
---

# React 贪吃蛇游戏技能

本技能提供基于 [react-pixi-snake-game](https://github.com/Jasonsd19/react-pixi-snake-game) 项目的学习资源和示例代码，帮助您学习使用 React 和 PixiJS 开发贪吃蛇游戏。

## 功能特性

- 🎮 完整的贪吃蛇游戏实现
- 🚀 高性能 PixiJS 渲染
- 📚 TypeScript 类型安全
- 🎯 面向学习的代码结构

## 前置要求

使用本技能前，请确保您具备：
- Node.js (v16+)
- pnpm 或 yarn
- 基础 React 知识

## 快速开始

### 1. 克隆参考项目

```bash
git clone https://github.com/Jasonsd19/react-pixi-snake-game.git
cd react-pixi-snake-game
pnpm install
```

### 2. 运行游戏

```bash
pnpm start
```

## 核心组件

### 游戏循环
游戏使用 React hooks 实现游戏循环：

```typescript
useEffect(() => {
  const animationId = requestAnimationFrame(gameLoop);
  return () => cancelAnimationFrame(animationId);
}, [gameState]);
```

### 蛇的移动
蛇的移动通过状态更新处理：

```typescript
const moveSnake = (direction: Direction) => {
  // 根据方向更新蛇的位置
};
```

### 碰撞检测
检测蛇撞墙或撞到自己：

```typescript
const checkCollision = (head: Position, body: Position[]): boolean => {
  // 检查墙碰撞和自身碰撞
};
```

## 学习路径

### 第一阶段：基础理解
- 研究项目结构
- 理解游戏循环机制
- 学习 PixiJS 如何与 React 集成

### 第二阶段：核心实现
- 实现蛇的移动逻辑
- 添加食物生成机制
- 创建碰撞检测

### 第三阶段：进阶功能
- 添加分数追踪
- 实现难度等级
- 添加音效
- 创建 UI 组件

## 自定义指南

### 修改颜色
修改 `colors.ts` 文件来自定义游戏外观：

```typescript
export const COLORS = {
  snake: 0x4CAF50,
  food: 0xF44336,
  background: 0x1a1a1a,
};
```

### 调整速度
在 `gameConfig.ts` 中修改游戏速度：

```typescript
export const GAME_CONFIG = {
  gridSize: 20,
  speed: 150, // 每次移动的毫秒数
};
```

## 项目结构

```
src/
├── components/      # React 组件
│   ├── Game.tsx     # 主游戏组件
│   └── UI.tsx       # UI 元素
├── hooks/           # 自定义 hooks
│   └── useGameLoop.ts
├── utils/           # 工具函数
│   ├── gameLogic.ts
│   └── colors.ts
├── types/           # TypeScript 类型定义
│   └── index.ts
└── App.tsx
```

## 核心技术栈

- **React 18+** - UI 框架
- **TypeScript** - 类型安全
- **PixiJS** - 高性能 2D 渲染
- **Vite** - 构建工具

## 参考资源

- [PixiJS 文档](https://pixijs.com/)
- [React 文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/)

## 贡献

欢迎为参考项目贡献代码：
[react-pixi-snake-game](https://github.com/Jasonsd19/react-pixi-snake-game)

## 许可证

MIT 许可证 - 与参考项目相同