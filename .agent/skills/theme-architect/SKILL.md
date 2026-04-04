---
name: Metronome Theme Architect
description: Metronome 主题设计与 CSS Token 架构主规范。用于新增或修改主题、调整 semantic tokens、设计组件 slot 覆写、处理视觉风格与交互质感问题；不用于定位 UI 入口或一般界面结构查询。
---

# Metronome Theme Architect

## Use This When

- 任务重点是主题气质、色彩系统、semantic token、组件视觉覆写、动效与质感。
- 需要新增主题或系统性重构现有主题。
- 需要判断视觉问题应改 `semantic.css`、`themes/*.css` 还是 `components-api.css`。

## Do Not Use This When

- 任务重点是定位按钮、弹窗、组件入口或界面区域。
  这类任务优先参考 `.agent/skills/ui-map/SKILL.md`。
- 只是改界面文案、翻译或提示文本。
  这类任务优先看 `src/i18n.ts`。

## Source Of Truth

- 运行时真实样式链路是:
  `src/styles/tokens/core.css` -> `src/styles/tokens/semantic.css` -> `src/styles/tokens/recipes.css` -> `src/styles/tokens/app-base.css` -> `src/styles/themes/*.css` -> `src/components/**/styles.module.css`
- `src/styles/tokens/components-api.css` 是非运行时的 slot 字典，只负责暴露组件 slot 名称。
- 如果文档描述和运行时代码冲突，以运行时代码为准。

## Edit Routing

- 改所有主题共享的默认视觉语义:
  `src/styles/tokens/semantic.css`
- 改跨多个组件家族共享的交互/读数/仪表配方:
  `src/styles/tokens/recipes.css`
- 只改单个主题:
  `src/styles/themes/*.css`
- 组件需要一个新的可覆写 slot:
  组件样式文件 + `src/styles/tokens/components-api.css`
- 只是让某个组件“更好看”:
  先判断这是语义问题还是单主题问题，不要先改 `components-api.css`

## Primitive First

- 浮层、dock、panel、modal 先复用 `--surface-panel-*` / `--surface-floating-*`。
- 按钮、切换器、可选中控件先复用 `--control-*`。
- 输入框、滑块轨道、表单容器先复用 `--field-*`。
- 当多个组件共享同一种表现形态时，优先沉到 `recipes.css`，不要直接扩张多个组件 slot。
- 字体、字重、字距优先走 `--type-*` 和 `--ui-chrome-*`，不要在组件里重新发明排版体系。
- 像 `SpeedTrainerModal`、`IntervalTrainerModal` 这类表单型面板，通常只需要局部布局类，不需要新建一套 modal 专属 token 家族。

## Aesthetic & Performance Lens

- 视觉舒适优先于刺激感；避免纯黑和纯白的生硬对撞，优先使用带色相倾向的深色文本和低刺激背景。
- 文字与背景组合至少应达到 WCAG AA 对比度；如果没有实际测量，不要臆测或汇报具体分值。
- 主题配色必须用 `rgba()` 建立明度、层级和强调色关系；强调色必须克制，只用于引导注意力。
- 排版先检查字重、字距、行高和留白节奏，再决定是否需要新增视觉装饰；可读性优先于“风格感”。
- **Typography Baseline**: 16px (1rem) 是项目文字的标准基准（General size），除极少数经过架构评审的辅助性文本（如极小的元数据）外，原则上严禁在主要界面和控件中使用 14px (0.875rem) 及以下字号。
- 视觉特效必须服务于材质、景深、层级或交互反馈，不要为了“更炫”而堆叠 blur、glow、gradient 或复杂阴影。
- 动效默认只动 `transform` 和 `opacity`；避免动画化会触发 layout 或大面积 paint 的属性。
- `will-change` 只能用于明确的高频交互元素，且应保持克制，避免常驻滥用导致额外内存成本。
- 选择器保持扁平；不要靠深层嵌套或高耦合结构去实现主题差异。
- 如果“局部更惊艳”和“全局更一致”冲突，优先维护 token 体系、组件收敛性和长期可维护性。

## Components API Rule

- `src/styles/tokens/components-api.css` 是组件 slot 契约表，不是日常主题调色板。
- 只有在新增、删除、重命名 slot，或统一 fallback 契约时，才修改它。
- 该文件只保留 slot 名称，不承担运行时默认值。
- 不要在这里重复定义 `--surface-*`、`--field-*`、`--control-*` 这类共享语义；它们只属于 `semantic.css`。
- 只有当多个主题都明确需要某个组件级差异，并且共享语义层表达不了，才新增组件 slot。

## Convergence First

- 优先改共享语义，不要先散改组件 slot。
- 当问题已经超出纯语义层、但又明显跨多个组件时，先看 `recipes.css`。
- 面板 / modal / dropdown 这类浮层，先看 `--surface-panel-*`、`--surface-floating-*`。
- 按钮 / checkbox / visualizer controls / select 选中态，先看 `--control-*`。
- 输入框 / range track / 历史条这类字段容器，先看 `--field-*`。
- 只有当共享语义层和 `recipes.css` 都表达不了时，才覆盖组件级 slot，比如 `--select-*` 或 `--modal-shell-*`。

## Workflow

1. 先用 3 到 5 个短点定义主题概念:
   情绪、材质、光源、层级、对比度目标。
2. 先定全局语义层:
   背景、文字、强调色、圆角、阴影、交互 token。
3. 再定共享 recipe 层:
   action / switch / range / readout / meter 这类跨组件模式。
4. 再写单主题覆写:
   把大部分视觉差异放到对应的 `themes/*.css`。
5. 最后才做英雄组件特化:
   只在 semantic token 不足时使用组件 slot 覆写。
6. 如果缺少 slot:
   同步更新组件实现和 `components-api.css`。
7. 完成后必须校验:
   `node .agent/skills/theme-architect/verify_css.mjs`

## Non-Negotiables

- 优先使用现有 token 体系；新增基础色值时优先考虑 `oklch()`，但 theme 文件里为了阴影、透明度、渐变效果使用 `rgba()` / hex 是允许的。
- 交互动画优先使用 `opacity` 和 `transform`，不要在 `:hover` 中制造重排。
- 不要在组件局部样式里用硬编码去绕过 token 契约。
- 不要引入第三方 web font；优先使用系统有的字体和项目排版 token。
- 如果是全局默认值问题，改 `semantic.css`。
- 如果是单主题偏好，改对应主题文件。
- 如果一个视觉决定会同时影响多个组件，先把它抽到共享 surface / control / field 语义层。
- 不要为了一个局部视觉问题就扩张 slot 面。
- 不要打开浏览器做检查；用户会自行查看。

## Reference Files

- 全局语义层:
  `src/styles/tokens/semantic.css`
- 共享 recipe 层:
  `src/styles/tokens/recipes.css`
- 组件契约层:
  `src/styles/tokens/components-api.css`
- 单主题审查 companion skill:
  `.agent/skills/theme-reviewer/SKILL.md`
- 参考主题:
  `src/styles/themes/terminal.css`
- 校验脚本:
  `.agent/skills/theme-architect/verify_css.mjs`
- 界面定位:
  `.agent/skills/ui-map/SKILL.md`

## Essential Token Checklist

在设计或重构主题时，至少核对以下类别是否完整覆盖:

- Backgrounds:
  `--bg-primary`, `--bg-surface`, `--bg-elevated`, `--bg-overlay`
- Shared Surfaces:
  `--surface-panel-*`, `--surface-floating-*`
- Fills:
  `--fill-subtle`, `--fill-muted`, `--fill-active`
- Borders:
  `--border-subtle`, `--border-base`, `--border-active`
- Radii:
  `--radius-panel`, `--radius-modal`, `--radius-control`, `--radius-pill`
- Shared Controls:
  `--control-*`, `--field-*`
- Text:
  `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
- Accents:
  `--accent-primary`, `--accent-primary-muted`, `--accent-warning`, `--accent-danger`, `--accent-success`
- Shadows and Effects:
  `--shadow-sm`, `--shadow-panel`, `--shadow-modal`, `--shadow-active-item`, `--shadow-glow`, `--shadow-glow-elevated`, `--overlay-blur`, `--overlay-sheen`
- Interaction:
  `--opacity-btn-active`, `--transition-base`, `--transition-fast`

## Output Expectations

- 说明改动属于哪一层:
  `semantic.css` / `themes/*.css` / `components-api.css`
- 如果改了 token 或主题，汇报是否已运行:
  `node .agent/skills/theme-architect/verify_css.mjs`
