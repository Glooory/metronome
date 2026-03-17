# 🌌 The Metronome Project: AI-Native Developer Guidelines

## ✨ 创意解析 (Creative Rationale)

> "为了让这个多主题节拍器（Metronome）让人眼前一亮且拥有极致性能，我引入了基于『物理直觉』的交互响应模型（Motion is Emotion），并搭配高度解耦的 CSS 变量驱动多主题系统（Theme Tokens Matrix）。"

- **视觉层面 (Aesthetics)**: 全局拥抱 `OKLCH` 色彩空间（见 `core.css`），赋予颜色极其自然的感知过渡。抛弃杂乱的颜色定义，转向基于 3-Layer Progressive Theming 的架构。UI 组件具备明确的物理隐喻（如：哑光黑、磨砂玻璃、复古CRT、实体机械键等），通过 `semantic.css` 驱动全局视觉骨架。
- **动效层面 (Motion)**: **60fps is Non-negotiable.** 所有的交互反馈（Hover、Active）必须严格剥离可能引发重排（Reflow）的属性（如 `width`, `height`, `margin`）。状态切换完全交由底层 GPU 处理（仅限 `transform` 和 `opacity`）。动效应当具备物理叙事感，坚持使用符合真实弹簧阻尼的 `cubic-bezier` 曲线，赋予产品生命力。

## 💻 核心代码解析 (React + CSS Architecture)

这个项目由一套精密的 **三层渐进式 CSS Token 架构 (3-Layer Progressive Theming)** 与 **React 无头组件/复合架构** 撑起。

### 1. 3-Layer Progressive Theming (渐进式多主题架构)

彻底解耦物理值与业务组件，所有的样式主题系统严格遵循以下三层分离结构：

1. **Core Tokens (`core.css`)**: 物理客观现实。定义基础 `oklch` 色板、圆角标尺与阴影级数（如 `--gray-900`, `--radius-md`）。无设计意图。
2. **Semantic Tokens (`semantic.css`)**: 主题设计主干。将 Core Tokens 赋予特定语义（如 `--bg-surface`, `--text-primary`, `--border-subtle`）。**常规的 80% 主题换肤只需修改这一层。**
3. **Component Fallbacks (组件内部)**: 组件保持“零硬编码”，代码必须使用 `var(--特定组件插槽槽位, var(--全局语义默认值))` 模式。普通主题无感继承全局语义，仅极端主题（如需要特殊发光的复古科幻风格）才会被允许穿透覆写组件插槽（如直接操作 `--btn-filled-bg`）。
4. **API Dictionary (`components-api.css`)**: **可发现性层**。一个纯粹但不参与渲染的 CSS 字典，用于记录和暴露所有组件预留的插槽名称（如 `--bpm-wheel-bg`）。专为代码补全、IDE Intellisense 系统和主题开发者提供宏观全局查询。

### 2. The Interaction Primitive (交互物理学)

严格贯彻基于物理和 60fps 的极致交互，微交互（Micro-interactions）只允许触发 GPU 加速属性（如 `opacity` 和 `transform`）。绝不能改变盒模型尺寸。

```css
/* --- 交互内核级优化示例 --- */
.interactive {
  transition: var(--transition-base); /* 统一的主题缓动函数基调 */
  will-change: transform, opacity; /* 在关键元素上谨慎开启 GPU 提升 */
}

/* 所有的交互反馈仅能在此约束下进行，确保 60fps */
.interactive:active {
  opacity: var(--opacity-btn-active, 0.7); /* 材质反馈 */
}
```

### 3. High-Performance React Components (以 `Button.tsx` 为例)

将 CSS Modules 与无头交互逻辑完美隔离，组件在纯净的情况下依靠全局 Token 和 CLSX 缝合业务与样式：

```tsx
import clsx from "clsx";
import styles from "./styles.module.css";

// 完美继承原生属性的 Headless 风格 Wrapper 组件
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", isActive, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        styles.button, // 内部本身挂载了高性能的 State Layer 隔离逻辑
        styles[`variant-${variant}`],
        isActive && styles.active,
        className
      )}
      {...props}
    />
  )
);
```

### 4. Visualizer (视效核心瞬发渲染)

在节拍可视化器 `Visualizer/index.tsx` 组件中，我们完全放弃传统的 CSS 平滑 duration，改用 `framer-motion` 强绑定的物理瞬发 `duration: 0` 保证听觉播放引擎与肉眼视效的 0 延迟绝对对齐：

```tsx
<motion.div
  initial={false}
  animate={{
    backgroundColor:
      isActive && isAccent ? "var(--theme-visualizer-accent)" : "var(--theme-visualizer-empty)",
  }}
  transition={{ duration: 0 }} /* 👈 关键抉择：牺牲性能柔和度换取极致苛刻的节拍卡点精准度 */
  className={styles["visualizer__block"]}
/>
```

## ⚖️ 性能与妥协说明 (Trade-offs)

- **舍弃了什么**:
  1. 为了跑满最高前端渲染帧率并在十几种主题中做到秒切，直接舍弃了诸如 styled-components 等 React Runtime 的 CSS-in-JS 库解析损耗。
  2. 舍弃了真实计算的高斯模糊 CSS Filter Blur 动效，以免拖垮低端机型的全局响应速度。
  3. Visualizer 等时间敏感控件放弃了平滑补间 (`spring` 等)，强制使用 0 秒瞬发切换，完全换取了底层的 Web AudioContext 的视听统一。
- **保全了什么**:
  1. HTML DOM 结构高度纯净最简化，用伪元素 `::after` 在 GPU 层独立图层完成 Alpha 混合层叠颜色交互。
  2. 非常规范的 OKLCH （Base Token）统一色板。后续迭代只许更新/覆写 `var(--theme-*)` 即可不改动一层业务代码从而生成几十种涵盖工业、暗黑、复古的主题（如 Swiss, E-ink, Wood）。

---

## 🤖 LLM 规范文档 (AI Context Doc & Instructions)

> _⚠️ (请将以下规范整体粘贴或保存为 `.cursorrules` 或 System Prompts 以训化代码助手)_

```markdown
# @Description: Glooory Metronome Project - Core Development & Aesthetic Guidelines

## 🎨 @DesignTokens & Theming:

- **Color Space**: EXCLUSIVELY use `oklch()` for foundational raw color pallets (Core Tokens) to ensure mathematically uniform perceived lightness and chroma tracking.
- **3-Layer Progressive Theming**: Strictly enforce the 3-Layer architecture (Core -> Semantic -> Component Fallback). Do NOT hardcode colors like `#FFF` or `rgba()`. Components MUST seamlessly consume Semantic Tokens as their pure fallback defaults (e.g., `background: var(--btn-filled-bg, var(--fill-subtle))`) and expose targeted Component Tokens solely for potential extreme theme overrides.
- **Prevent Variable Cascade Leaks (Architectural Discipline)**: NEVER fix visual bugs by hardcoding removal/overrides of CSS properties (like `backdrop-filter` or `box-shadow`) directly inside a component's localized `styles.module.css`. This breaks the token contract. Instead, keep the component "dumb" (e.g., wire it strictly to `var(--blur-token, default)`). To alter visuals consistently across the project, update the values in `components-api.css` (Component API Layer), and if theme-specific, override in the respective theme file (e.g., `themes/amoled.css`).
- **Component API Dictionary Rule (No Runtime Impact)**: If you introduce a new visual slot in a component (e.g. `--new-comp-layer-opacity`), YOU MUST correspondingly record it along with its semantic default in `src/styles/tokens/components-api.css` WITHOUT trailing comments. This file serves **PURELY as a non-runtime structural dictionary/reference** for IDE Intellisense and AI context. It is NEVER actually imported or loaded into the app's execution pipeline.
- **Typography Philosophy**: Maintain strict reliance on `var(--font-sans)` (`Inter`, system-ui). Tightly track specific layout properties such as letter-spacing (`-0.02em` for numeric metrics) to preserve a razor-sharp, 'Swiss Design' feeling. Do NOT bloat component files with custom inline font manipulations.

## 🚀 @MotionPhysics & Interaction limits:

- **60fps Non-Negotiable**: NEVER EVER animate properties that trigger layout reflows (e.g., `width`, `height`, `left`, `top`, `margin`, or `padding`) during micro-interactions.
- **GPU-Accelerated Compositor Only**: Restrict all `:hover` and `:active` visual state transitions strictly to `opacity` and `transform` (e.g., `translateZ(0)`, `scale(0.98)`).
- **Physics-based Metaphors**: Micro-interactions must feel physical. Avoid flat `ease-in-out`. Use `cubic-bezier` to simulate spring/damping physics. Button active states must use `var(--opacity-btn-active)`.
- **Will-Change Responsibility**: Use `will-change` with extreme caution. Only apply it to crucial interactive elements to avoid memory explosion.

## ⚛️ @ImplementationRules (React Architecture):

1. **Component Purity (Headless Paradigm)**: Build React components as structural "Headless" definitions when possible. Decouple visual presentation logic entirely utilizing strict CSS Modules (`styles.module.css`).
2. **Prop Drilling vs Context Tokens**: Do NOT pass sprawling inline-style definitions or heavy visual configurations via React props. Instead, rely on scoping CSS custom properties via Parent nodes for dynamic downstream injection.
3. **Hyper-Strict Audio-Visual Synchronization**: For all rhythmic and dynamic Visualizer elements, CSS transitions and animation intervals MUST be forced down to zero (`duration: 0` inside frame-motion objects) to absolutely prevent visual drift from the underlying Web Audio API's strict timing clocks.
4. **Code Structure & Cleanup**: No empty, verbose, or redundant CSS block comments allowed (e.g., `/* --- styles --- */`). Explain non-obvious architecture hacks or visual illusions, but strictly maintain stark code minimalism.
```
