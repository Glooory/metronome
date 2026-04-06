---
name: Metronome Theme Reviewer
description: Metronome 单主题审查与视觉查漏补缺指南。用于审查现有主题是否符合其立意、把局部违和感追溯到真实 token 来源、定位仍在沿用默认 recipe 的区域；不用于新增主题或全局 token 架构设计。
---

# Metronome Theme Reviewer

## Use This When

- 审查单个现有主题。
- 用户要求“仔细评估”“逐个 token 看看对不对”“逐行检查”。
- 需要把局部违和感追溯到 `theme file` / `recipes.css` / `semantic.css` / 组件局部样式。
- 需要定位哪些区域仍在吃默认 recipe。

## Do Not Use This When

- 新建主题或重构全局 token 架构。
  先看 `.agent/skills/theme-architect/SKILL.md`
- 定位按钮、弹窗、界面区域。
  先看 `.agent/skills/ui-map/SKILL.md`

## Inputs

- 主题文件:
  `src/styles/themes/<theme>.css`
- 共享层:
  `src/styles/tokens/semantic.css`, `src/styles/tokens/recipes.css`
- UI 映射:
  `.agent/skills/ui-map/ui-registry.json`

## Source Of Truth

- 运行时链路:
  `src/styles/tokens/core.css` -> `src/styles/tokens/semantic.css` -> `src/styles/tokens/recipes.css` -> `src/styles/tokens/app-base.css` -> `src/styles/themes/*.css` -> `src/components/**/styles.module.css`
- 冲突时以运行时代码为准。

## Workflow

1. 用 3 到 5 个短点定义主题概念:
   情绪 / 材质 / 光源 / 层级 / 对比度目标
2. 读主题文件。
3. 读 `semantic.css` 和 `recipes.css`。
4. 若用户提到具体 UI 区块，用 `ui-registry.json` 映射到组件。
5. 按固定顺序审查。
6. 每个问题标记真实来源:
   `theme file` / `recipes.css` / `semantic.css` / `component local style`
7. 如有改动，运行:
   `node .agent/skills/theme-architect/verify_css.mjs`
8. 结束前做一次 30 秒复盘:
   这次是否出现了可复用的新排查路径 / 高频漏点 / 更好的 token 回溯方法
9. 如果答案是“有”，直接更新:
   `SKILL.md` 或 `references/theme-audit-playbook.md`
   不要等用户额外提醒

## Review Order

- Background / Fill / Border / Text / Accent / Shadow / Blur / Sheen
- `--surface-panel-*` / `--surface-floating-*`
- `--control-*` / `--field-*`
- `--action-*`
- `--readout-*`
- `--meter-*`
- `--switch-*`
- `--range-*`
- `--select-*`
- 最后看局部 slot / 组件样式

## High-Risk Checks

- 先分辨问题来自 hue 还是材质语言。
- 不要只查 `--text-*`；很多违和文字来自 `--action-*` / `--readout-*` / `--meter-*` / `--select-*`。
- 字体审查不要只看 `--font-display` / `--font-app-sans`；要把 `--type-title-*` / `--type-body-*` / `--type-caption-*` / `--type-control-*` / `--type-readout-*` / `--type-metric-*` 一起过一遍，再回看 `Select` / `Input(font="metric")` / `BpmHistory` / `Visualizer` 是否还在吃默认 fallback。
- 选中态同时检查底色、文字、边框、阴影。
- 渐变前先确认该 token 是否被当成 `background-color` 使用。
- 检查所有文本是否满足 16px (1rem) 的标准基准。若发现 14px (0.875rem)，应审视其是否属于受控的极小元数据，否则应收敛至 16px。
- 不要假设常态 token 会自动覆盖状态 token；聚焦态、选中态、编辑态常常走的是另一组 token。
- 主色轴要稳定；辅色不要争主导。
- glow 不能降低可读性。
- 如果只在某个主题里出现“右侧 / 底部被裁掉”“只有某个组件边框断掉”这类现象，先查该主题是否直接覆写了组件类名并加了 `transform`, `translateZ(0)`, `backface-visibility`, `width: calc(...)`, `overflow` 之类的渲染补丁；这类问题往往来自 theme-local override，而不是 token 本身
- Modal backdrop 不要只看 `--bg-overlay`；要一起检查 `--modal-shell-overlay-blur` 是否真的接进 `ModalShell`，以及局部 modal / confirm overlay 有没有把 blur 覆盖回 `0px` 或 `none`
- Readout wheel 不要只看 `line` 颜色；要一起检查 wheel 底材质、边框、tick 对比、active shadow，确认它读起来像该主题里的“标尺 / 滚轮 / 刻度件”，而不是普通深色控件或 HUD 发光条。
- Visualizer / Meter block 先确认产品语义:
  “播放态”应该强调已有颜色的块（重音 / 次重音 / 普通音），不要默认给空块接 `empty-active`；先回到组件运行时分支确认 active 是否只落在 filled block 上
- Switch / Checkbox 不要只看 `--control-*` 或 `--control-handle-*`；要显式检查 `--switch-track-*` 与 `--switch-thumb-*`，尤其是未选中轨道、选中轨道、未选中 knob、选中 knob 四组。
- Input / Field 不要只看 `--field-border`；聚焦态要单独检查 `--field-focus-border` 与 `--field-focus-bg`
- 数字输入若使用共享 `Input` 组件，不要把 `font="metric"` 当成视觉语义入口；默认仍应先回到 `--field-*`，只有在产品里确实存在第二套稳定的输入语义时，才考虑新增 variant / token 路由
- Select Option 不要只看 `--select-option-radius` 或 `--select-*`；先确认它是否复用了 `Button` / `Action` recipe。像 `src/components/Select/styles.module.css` 这种包装层，radius fallback 应保持 `--select-option-radius` -> `--action-radius` -> `--control-radius`；如果主题希望 Select Option 跟按钮同半径，优先在主题文件里写 `--select-option-radius: var(--action-radius)`，不要在同一个元素里用 `--control-radius` 重写 `--action-radius`，否则主题里单独定义的按钮圆角会在 Select 里失效。
- Slider / Range knob 不要只看 `--range-thumb-radius`；先回溯它是否来自 `--control-handle-radius`。如果主题想让 knob / thumb 比普通 control 更圆，优先在 handle 这一层表达，再让 `--range-*` / `--switch-*` 继承，不要每个组件各自写一份 radius。
- 如果某个控件在主题立意里很敏感，但当前只是靠共享 `--control-*` 或 `--control-handle-*` 间接继承，优先考虑在主题文件里显式补齐该 recipe token，避免浏览器里落地效果偏到默认语义。
- 如果主题立意是硬边 / 工业 / 终端 / 瑞士网格，不要只写基础 `--radius-*`；要顺手检查并尽量显式钉住 `--surface-panel-radius`, `--surface-floating-radius`, `--control-radius`, `--field-radius`, `--action-radius`, `--readout-wheel-radius`, `--switch-*`, `--range-thumb-radius`, `--meter-controls-radius`, `--meter-indicator-radius`, `--select-option-radius`。否则很容易出现“按钮是直角，但 dock / wheel / badge 还像默认控件”的混搭。

## Quick Mappings

- `Main_Trainer_Dock`, `Main_Subdivision_Row`
  先看 `--action-outline-selected-*`, `--control-quiet-selected-*`
- `Main_BPM_History`
  先看 `--control-selected-*`
- `Main_BPM_Display`
  先看 `--readout-*`
- `Main_Visualizer`
  先看 `--meter-*`
- Checkbox
  先看 `--switch-track-*`, `--switch-thumb-*`
- Slider
  先看 `--range-*`
- Modal backdrop
  先看 `--bg-overlay`, `--modal-shell-overlay-blur`，再查 `src/components/ModalShell/styles.module.css` 与局部 overlay 覆盖
- Modal 左上角 icon
  先看 `--app-title-icon-color`

## Output Expectations

- 先给主题概念，再给问题。
- 问题尽量标注到真实来源:
  `themes/*.css` / `recipes.css` / `semantic.css` / `components/**/styles.module.css`
- 如有修改，汇报是否已运行:
  `node .agent/skills/theme-architect/verify_css.mjs`
- 如无修改，说明剩余风险或未核对区域。

## Read More When Needed

- 展开打法与高频漏点:
  `.agent/skills/theme-reviewer/references/theme-audit-playbook.md`
- 总主题规范:
  `.agent/skills/theme-architect/SKILL.md`
- UI 注册表:
  `.agent/skills/ui-map/ui-registry.json`
