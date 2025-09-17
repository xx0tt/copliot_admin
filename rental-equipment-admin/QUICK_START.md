# 🎯 路由动画系统快速使用指南

## 🚀 快速开始

### 1. 查看动画效果
访问 http://localhost:3002，在菜单间切换可以看到流畅的路由过渡动画。

### 2. 开启开发者工具
- 按下 `Ctrl + Shift + D` 快捷键
- 或点击右下角的工具按钮 🛠️

### 3. 测试不同动画
在开发者工具面板中：
1. 选择动画类型（fade、slide-left、slide-right等）
2. 点击"测试动画"按钮
3. 观察动画效果

## 🎨 动画配置

### 全局配置
```typescript
import { useAnimationConfig } from '@/utils/animationConfig'

const { updateConfig } = useAnimationConfig()

// 调整动画速度
updateConfig({ duration: 500 })

// 禁用动画
updateConfig({ enabled: false })
```

### 路由级别配置
```typescript
// 在路由定义中指定动画
{
  path: '/special-page',
  component: SpecialPage,
  meta: {
    transition: 'scale',  // 指定动画类型
    level: 3              // 设置层级
  }
}
```

## 📱 响应式特性

### 自动适配
- **桌面端**：完整动画效果
- **移动端**：优化的快速动画
- **无障碍模式**：自动检测用户偏好并调整

### 手动控制
```css
/* 自定义媒体查询 */
@media (max-width: 768px) {
  :root {
    --animation-duration: 200ms;
  }
}
```

## 🔧 高级功能

### 1. 性能监控
- 开发者工具中查看路由切换耗时
- 自动检测性能问题
- 性能数据持久化

### 2. 自定义动画
```scss
.my-custom-transition-enter-active,
.my-custom-transition-leave-active {
  transition: all var(--animation-duration) var(--animation-easing);
}

.my-custom-transition-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(180deg);
}
```

### 3. 程序化控制
```typescript
import { useRouteLoading } from '@/composables/useRouteLoading'

const { navigateWithLoading, startLoading, stopLoading } = useRouteLoading()

// 带加载指示器的导航
await navigateWithLoading('/target-page', '正在加载...')

// 手动控制加载状态
startLoading('处理中...')
// ... 执行操作
stopLoading()
```

## 🎯 最佳实践

### 1. 动画选择原则
- **同级页面**：使用 fade 或 slide-left/right
- **进入子页面**：使用 slide-up
- **返回父页面**：使用 slide-down
- **详情展示**：使用 scale
- **特殊效果**：使用 rotate

### 2. 性能优化
- 保持动画时长在 200-400ms 之间
- 移动端使用更短的动画时长
- 避免复杂的 transform 组合
- 合理设置路由层级

### 3. 用户体验
- 为重要操作提供加载指示器
- 支持键盘导航
- 考虑用户的动画偏好设置
- 提供禁用动画的选项

## 🐛 常见问题

### Q: 动画不流畅怎么办？
A: 检查开发者工具中的性能统计，如果平均耗时过长，考虑：
- 减少动画时长
- 简化动画效果
- 检查是否有性能问题

### Q: 如何禁用某个页面的动画？
A: 在路由配置中设置：
```typescript
meta: { transition: 'fade' }  // 使用最简单的动画
// 或
meta: { transition: false }   // 完全禁用
```

### Q: 移动端动画卡顿？
A: 系统已自动优化移动端，如仍有问题：
- 检查设备性能
- 考虑进一步减少动画时长
- 使用更简单的动画效果

## 📊 监控指标

### 性能指标
- **平均切换时间**：应小于 500ms
- **最大切换时间**：应小于 1000ms
- **性能问题**：系统会自动检测并提示

### 用户体验指标
- **动画完成率**：99%+
- **用户满意度**：通过动画偏好设置反映
- **设备兼容性**：支持所有现代浏览器

---

🎉 **享受流畅的路由动画体验吧！**
