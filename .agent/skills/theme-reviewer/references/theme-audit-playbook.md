# Theme Audit Playbook

## Best-Use Scenario

这份 playbook 适合“已经有一个主题文件，接下来要系统性审查它是不是名副其实”的任务。

## Step 1: Define The Theme Intent

先用短句写清主题概念，不超过 5 点:

- 情绪
- 材质
- 光源
- 层级
- 对比度目标

如果这一步说不清，后面的“对不对味”也很难判断。

## Step 2: Audit In This Order

1. 基础 token:
   `--bg-*`, `--fill-*`, `--border-*`, `--text-*`, `--accent-*`, `--shadow-*`
2. shared surfaces:
   `--surface-panel-*`, `--surface-floating-*`
3. shared controls and fields:
   `--control-*`, `--field-*`
4. recipes:
   `--action-*`, `--readout-*`, `--meter-*`, `--switch-*`, `--range-*`, `--select-*`
5. 局部高权重细节:
   modal title icon, dropdown title, history chip active text, BPM 主读数等

## Step 3: Use UI Areas To Backtrack Tokens

先从用户指出的界面区域出发，再反查 token 来源。常见映射:

- `Main_Trainer_Dock`, `Main_Subdivision_Row`
  重点检查 `--action-outline-selected-*` 与 `--control-quiet-selected-*`
- `Main_BPM_History`
  重点检查 `--control-selected-*`
- `Main_BPM_Display`
  重点检查 `--readout-*`
- `Main_Visualizer`
  重点检查 `--meter-*`，特别是 `--meter-value-*` 与 `--meter-controls-*`
- Checkbox
  重点检查 `--switch-track-*` 与 `--switch-thumb-*`
- Slider
  重点检查 `--range-track-*`, `--range-progress-*`, `--range-thumb-*`
- Modal backdrop
  重点检查 `--bg-overlay`, `--modal-shell-overlay-blur`，以及 `src/components/ModalShell/styles.module.css` / 局部 overlay 是否把 blur 链路截断
- Modal 左上角 icon
  重点检查 `--app-title-icon-color`

## What To Look For

- 主题概念是否主要靠背景撑着，而控件材质还在沿用默认 UI 语言
- 是否存在“白色玻璃边”和“主题材质边”的混用
- 浮层若“颜色已经对了却仍显得像玻璃”，继续检查 `--surface-floating-inner-shadow` 与 `--surface-floating-sheen`，不要只停在 `--surface-floating-bg` / `--surface-floating-border`
- 是否存在多条亮色轴同时争主导
- 文字颜色是否真的进入主题主轴，而不是停留在默认中性色
- 发光是否增强了层次，还是让元素开始发糊
- modal backdrop 是否真的把背景压下去，而不是只盖了一层偏浅的有色膜
- 编辑态输入是否仍然清晰可读，尤其是主读数类组件从展示态切到输入态时
- 小尺寸模块的圆角和阴影是否仍服从整套主题的 radius / depth 逻辑，而不是单点失衡

## Practical Heuristics

- 常态边框:
  应该读成该主题自己的材质边，不应默认像冷白描边
- 状态 token:
  不要假设常态 token 会自动覆盖聚焦态 / 选中态 / 编辑态；很多违和感正是因为组件在状态切换时跳回了另一组共享 token
  如果主题显式改了 `--action-outline-bg`，也要一起显式检查 `--action-outline-selected-bg`
  `recipes.css` 会优先吃 `--action-outline-bg`，不补 selected 态时很容易把选中背景锁死在错误材质上
- Modal backdrop:
  如果弹窗“太透明 / 太逗明 / 背景压不住”，先分辨是主题的 `--bg-overlay` 太浅，还是 overlay blur 没有真正接上
  重点复查 `--modal-shell-overlay-blur` 是否被 `ModalShell` 使用，以及局部 modal / confirm overlay 有没有写死 `0px` 或 `none`
- 零边框主题:
  如果 `--control-border-width` 或 `--control-quiet-border-width` 被设为 `0px`，要显式复查 `--control-selected-border-width`、`--control-quiet-selected-border-width`、`--action-outline-border-width`；只改 border color 往往不会真正落地
- 硬边主题:
  如果主题依赖黑边、零圆角、偏移阴影，不要漏查 `--control-active-transform`、`--control-quiet-*`、`--action-outline-*`；静态图可能已经像主题，但按下态、quiet 按钮、outline 选中态很容易退回默认现代 UI
- 选中态:
  底色、文字、边框、阴影至少要有 2 到 3 项一起进入同一语义
- icon:
  默认应服从层级，只有语义特殊或状态明确时才长时间占据主题主色
- 主读数:
  允许有 glow，但不应因为 blur 让可读性下降
- 深度语言一致性:
  如果主题已经建立了“默认凸起 / 选中凹陷”或相反的体积规则，`--readout-*` 与 `--meter-*` 也要一起复查；主读数、仪表块若继续沿用另一套深度逻辑，会像不同材质的零件拼在一起
  优先复用主题里已经成立的那组主阴影节奏，不要给 readout 或 meter 单独发明另一套“像凹陷”的假阴影
  不要只统一阴影，不统一凹陷面的色轴；同一主题里的 press / inset 面如果分成好几组色温，还是会读成不同零件
- Readout wheel:
  不要只盯 `--readout-wheel-line`；要一起看 `--readout-wheel-bg`, `--readout-wheel-border`, `--readout-wheel-shadow`, `--readout-wheel-active-shadow`, `--readout-wheel-tick`
- Meter block 状态梯子:
  Visualizer 至少要显式区分 `empty / filled / filled-active` 三档；注意它们的播放态、正常太时的颜色对比
- Readout wheel 观感:
  它应该读成主题内的标尺 / 滚轮 / 刻度件；如果底太透、边太弱、tick 太淡，就容易退回普通深色控件；如果中线过亮、active 只靠亮色，也容易滑向 HUD 感
- 编辑态输入:
  如果展示态文字用了 `transparent`、渐变、blur 或特殊 filter，必须单独检查 `--readout-input-color`、`--readout-input-caret-color`、`--readout-input-selection`
- Readout 渐变落地:
  如果主题写了 `--readout-value-gradient` 或显式依赖 `background-clip: text`，要一起检查 `--readout-value-color` 是否为 `transparent`
  只写 gradient、不把 value color 设成透明时，主读数很容易在运行时退回纯色字，主题作者却误以为渐变已经生效
- 圆角:
  先看它在整套 radius ladder 里的位置；小组件通常应低于 control 或接近 control，不要无意中比面板更软或比仪表更硬
- 阴影:
  小组件阴影要服务体积感，不要比 panel / modal 更厚，也不要因为 glow 让边缘发虚
- 软材质主题阴影:
  如果主题立意是 clay / soft / wood 这类哑光材质，亮部阴影不要落成接近纯白的中性高光；高光应该带底材色温，否则会滑向塑料、泡沫或玻璃感
- 鼓起感:
  如果目标是圆润鼓起的体积，不要只加外阴影；还要检查 surface / control 自身背景里是否有顶部或侧上方的柔和亮面，否则会更像悬浮卡片，不像被捏出来的实体
- Switch / Checkbox:
  不要只看 `--control-*` 或 `--control-handle-*`；至少拆开看 `--switch-track-bg`, `--switch-track-selected-bg`, `--switch-thumb-bg`, `--switch-thumb-selected-bg`
- Slider / Range:
  如果 `--range-progress-*` 已经承担主题主色，不要让 thumb 继续沿用中性 `--switch-thumb-*` 或 `--control-handle-selected-*`；progress 和 thumb 分属两套语义时，滑杆会立刻退回默认控件感
- Input / Field:
  不要只看 `--field-border`；至少拆开看 `--field-border`, `--field-focus-border`, `--field-bg`, `--field-focus-bg`
- 微型叠加标记:
  像 chip 角标、删除 badge、状态点这类浮在主结构上的小控件，不一定要严格服从主控件 radius；如果它承担的是“独立标记”而不是“结构延续”，可以允许 theme-specific 的局部圆角例外
- 修正落点:
  如果问题本质是组件局部形状语义，不要优先用 `:global(.theme-xxx)` 之类的主题补丁；先判断它应当落在组件本地样式，还是值得抽成正式 component slot
- 半径语义:
  如果现有 `radius ladder` 里缺了一层稳定语义，优先补共享半径 token，例如 `--radius-badge`，不要先落回 magic number
- 显式覆盖:
  如果某个控件在主题立意里特别关键，而现在只是靠共享 token 间接继承，优先考虑在主题文件里显式补齐对应 recipe token，减少“背景像主题、控件像默认”的落差

## After-Use Maintenance

- 每次用完这个 skill，快速判断这次是否出现了新的可复用经验:
  新的回溯路径、新的高频漏点、某类组件常见的状态 token 陷阱
- 如果有，直接更新 `SKILL.md` 或本 playbook，不要等用户再次要求
- 优先沉淀“以后还会复用”的经验，不要记录只对单次主题成立的偶发结论

## When A Fix Probably Belongs To Recipes

- 多个按钮组选中态都不对
- switch / range / readout / meter 在多个界面共同违和
- 某类文字总是在多个组件里显得像默认值

## When A Fix Probably Belongs To Theme File

- 问题只发生在单个主题
- 主题立意和材质语言没有收住
- 颜色主轴、边框语言、阴影气质需要单主题偏好
- 某个主题的编辑态输入、圆角梯度、局部 glow 强弱需要单主题收敛

## Minimal Report Template

- 主题概念:
  用 3 到 5 个短点描述
- 主要问题:
  按严重度或按区域列出
- 真实来源:
  标明来自 `theme file` / `recipes.css` / `semantic.css` / `component local style`
- 修改摘要:
  只讲高价值变化
- 校验:
  是否运行 `node .agent/skills/theme-architect/verify_css.mjs`
