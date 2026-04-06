---
name: Metronome Favicon Reviewer
description: Metronome 单主题 favicon 审查与定向改稿指南。用于检查 `public/favicons/favicon-<theme>.svg` 是否真正呼应对应主题的配色、材质、圆角气质、几何一致性与小尺寸识别；也用于在“保持现有布局/轮廓”前提下做风格对齐。默认只聚焦 favicon 本身的设计风格，不扩展到 `theme-color`、`apple-touch-icon`、manifest、PWA 或 SEO 图标链路。
---

# Metronome Favicon Reviewer

## Use This When

- 审查单个现有主题的 favicon。
- 用户要求“看看这个 favicon 像不像对应主题”。
- 用户希望保留当前布局 / 轮廓，只调整配色、质感、描边、渐变、高光。
- 需要逐个主题挨个审 favicon 并做小步修改。

## Do Not Use This When

- 新建一整套 logo 语言或重画图标构图。
- 批量修改 manifest、PWA 图标导出链路、SEO 资源。
- 审查 `theme-color`、浏览器外壳着色、`apple-touch-icon`、manifest、PWA 安装图标是否一致。
- 用户明确要修改、重画 favicon 的几何结构、布局、符号语义。
  这时先单独确认可否改 `path d` / `cx` / `cy` / `r` / `viewBox`

## Inputs

- 主题文件:
  `src/styles/themes/<theme>.css`
- 对应 favicon:
  `public/favicons/favicon-<theme>.svg`
- 主题切换映射:
  `src/App.tsx`
- 对照样本:
  `public/favicons/*.svg`
- 不要试图寻找截图来当做 input，仓库里的截图可能未及时更新，只看对应主题的 CSS 文件即可

## Default Scope

- 默认只判断:
  favicon 的设计风格是否与对应主题一致
- 默认不判断:
  `theme-color`、浏览器地址栏颜色、`apple-touch-icon`、manifest、PWA 安装图标、SEO 图标链路
- 除非用户明确要求，否则不要把 favicon 审查扩展成“整套站点图标与系统壳层一致性审计”

## Source Of Truth

- 主题气质以 `src/styles/themes/<theme>.css` 为准。
- favicon 的构图语言以当前 SVG 为准，除非用户明确允许改轮廓。
- 若主题文件和 favicon 冲突，优先让 favicon 回到主题的配色层级、材质语言和圆角气质。

## Workflow

1. 用 3 到 5 个短点定义主题概念:
   情绪 / 材质 / 光源 / 对比 / 圆角气质
2. 读主题文件，先抓住这些 token:
   `--bg-*`, `--surface-*`, `--border-*`, `--accent-*`, `--shadow-*`, `--readout-*`, `--radius-*`
3. 读对应 favicon SVG，先分离这几层:
   主体底色 / 描边 / 内部高光 / 动势线 / 轴心节点 / 远端端点 / 点缀色
4. 如有需要，读 1 到 3 个相邻 favicon 做系统内对照；
   目的是确认项目共用图形语法，不是照抄别的主题配色
5. 按固定顺序审查。
6. 如果用户要求“保持现状布局和轮廓”，把几何元素视为锁定:
   不改 `viewBox`, `path d`, `cx`, `cy`, `r`, 主要锚点位置
7. 若用户允许局部改几何，但不想重画整体轮廓:
   允许只调整局部节点形状与端点语法，例如 `circle` 改 `rect`、`rx` 从 0 改到小圆角，前提是整体轮廓与构图关系不变
8. 只通过这些手段做风格修正:
   `fill`, `stroke`, `opacity`, `gradient`, `linecap`, `linejoin`, `stroke-width`, 局部 `rect rx`, 局部节点形状
9. 改完后做一次 diff 复核:
   确认是否真的只动了风格层，没有误改构图
10. 如果缺少 SVG 栅格预览工具，明确说明判断依据来自源码和 favicon 小尺寸经验，而非真实 16x16 像素预览
11. 修改 favicon 后默认不需要审查 `theme-color`、`apple-touch-icon`、manifest、PWA 图标；
    只有当用户明确提出这些范围，才额外展开
12. 修改 favicon 后默认不需要跑构建验证；
    只有当这次修改同时涉及文件名、路径、映射表或其他资源链路时，才回查 `src/App.tsx` 或做额外验证

## Review Order

- 先看构图是否需要锁定
- Palette hierarchy:
  深色底 / 主高亮 / 次高亮 / 第三色是否分工清楚
- Material language:
  是玻璃 / 纸张 / 塑料 / 金属 / HUD / 木质，还是落回了通用 neon
- Outline language:
  描边颜色、强度、锐利度是否像该主题
- Highlight language:
  高光是纯白还是带主题色温
- Radius cues:
  即使不改轮廓，`linecap` / `linejoin` / 高光形状是否传递了圆角或硬边气质
- Radius consistency:
  不只看“有没有圆角”，而要看整套几何语法是否一致；
  外轮廓、内部刻度、指针、轴心、端点不要出现“主体硬边但节点圆角”这类混搭
- Motion geometry:
  指针、轴心、远端端点的比例和相互关系是否协调；
  轴心不要莫名太圆，远端端点不要压过指针本体
- Accent distribution:
  辅色有没有抢主色
- Small-size legibility:
  16x16 下是否还能读出主体、摆杆、节点
- ViewBox safety:
  指针末端和远端端点是否靠边过近，是否存在被裁切风险

## CSS To SVG Quick Mapping

- 主体底色:
  优先参考 `--bg-primary`, `--surface-panel-bg`, `--surface-floating-bg`
- 描边:
  优先参考 `--border-base`, `--border-subtle`, `--surface-floating-border`
- 主高亮 / 动势线:
  优先参考 `--accent-primary`, `--range-progress-bg`, `--readout-value-gradient`
- 内部高光:
  优先参考 `--overlay-sheen`, 冷暖倾向跟 `--border-*` / `--text-*` 走
- 节点 / 摆锤头 / 点缀圆:
  优先参考主 accent，第三色只用于收尾，不应抢主体
- 轴心与远端端点:
  先看它们属于结构节点还是装饰节点；
  结构节点优先服务于几何一致性和比例，不要只为了“更显眼”而做大
- 圆角气质:
  优先参考 `--radius-*`，在 SVG 中通常通过 `stroke-linejoin`, `stroke-linecap`, 局部高光语言来转译
- 几何一致性:
  若主题偏硬边，优先统一为直角 / square 端帽 / 方形节点；
  若主题偏柔和，优先统一为 round 端帽 / 圆形节点 / 小圆角矩形；
  不要只改单个节点

## High-Risk Checks

- 不要因为主题里有渐变，就把整块主体都刷成高饱和渐变。
  很多主题的主体其实是深色面板，渐变只该出现在动势线或局部高光
- 不要把 `--readout-value-gradient` 机械照搬成整块机身颜色；
  先分清它是“数字高亮”还是“全局主材质”
- 紫色、粉色等第三色通常只是氛围色；
  除非主题本身如此，否则不要让它在 favicon 里占主导
- 纯白高光常常会把主题做成通用 UI 图标；
  先确认主题高光到底是冷白、暖白、青白还是完全哑光
- “圆角感”不等于必须加新底板；
  在禁止改轮廓时，优先用更柔和的连接、描边和高光处理来传递气质
- 不要把“轻微 UI 圆角”机械翻译成 favicon 每个元素都圆；
  先判断主题更像“全硬边”“全圆角”还是“仅容器轻微软化”
- 不要为了贴主题而损失 favicon 可读性；
  小尺寸下优先保住主体识别和对比
- 不要默认所有主题都该有圆角；
  `terminal`, `brutalism`, `swiss`, `cyberpunk` 一类可能更适合硬边
- 如果决定加圆角，相关元素要成系统地一起加；
  如果决定不加，相关元素也应一起保持硬边
- 如果用户明确要求保留现有构图，不要顺手新增背景板、外轮廓壳、额外装饰件
- 对节拍器摆杆类 favicon:
  轴心节点、指针、远端端点要按一个系统一起看；
  不要出现“硬边主题却保留圆轴心”“远端端点大到压过指针”“端点把指针完全吃掉”的情况
- 指针末端通常可以略微超过远端端点，形成动势；
  但这个超出应是小幅的，且不能触到 viewBox 边缘造成裁切
- 若指针或端点靠边太近，优先先收回或微调终点坐标，再决定是否继续加长；
  不要为了追求动势把末端切掉

## Edit Guardrails

- 若用户要求保留布局 / 轮廓:
  默认不改任何几何坐标
- 若用户允许局部几何微调:
  优先修正“闭合 / 未闭合”“圆角 / 硬边混用”“节点语法不统一”这类一致性问题，而不是扩大到重画整体
- 优先改颜色关系，再改质感，再改线条气质
- 当问题是风格混搭而非配色错误时，优先统一几何语法，再决定是否补颜色微调
- 每次只解决 1 到 3 个主要矛盾:
  例如“机身太亮”“高光太白”“第三色过重”
- 若问题集中在摆杆系统:
  优先按这个顺序微调
  轴心语法 -> 远端端点尺寸 -> 指针长度 -> 与 viewBox 的安全距离
- 若 SVG 和主题已大体一致，不要为了“更设计”而过度加工
- 若修改涉及文件名或新增资源，记得回查 `src/App.tsx` 的 favicon 映射
- 不要因为发现 `theme-color`、`apple-touch-icon`、manifest 或 PWA 图标未同步，就把它们当作本技能的默认问题

## Cross-Theme Endpoint Normalization

- 当用户明确要求“统一各主题指针端点大小”时，优先统一成一套跨主题默认值，再保留各主题自己的节点语法
- 圆形语法默认值:
  轴心节点 `r=3.2`
  远端端点 `r=5.2`
- 方形语法默认值:
  轴心节点 `6x6`
  远端端点 `10x10`
- 保留主题语法而不是强行同形:
  柔和主题继续用 `circle`
  硬边主题继续用 `rect`
  `e-ink` 可保留轻微 `rx`
  `sketch` 可保留旋转和手绘描边
- 若端点带额外描边、手绘辅助线、高光或内部点缀，端点尺寸变化后要一起回调这些附属元素，避免出现“端点变大了但内部笔触还停在旧边界”
- 批量统一后做两步复核:
  先检查源码里端点原语是否真的收敛到目标尺寸
  再对改动过的 SVG 跑一次 `xmllint --noout`

## Output Expectations

- 先给简短结论:
  匹配 / 基本匹配 / 部分匹配 / 不匹配
- 再给按严重度排序的问题。
- 明确区分:
  是构图问题，还是配色 / 材质 / 圆角气质问题
- 若用户要求保留轮廓，明确说明本次是否遵守了该约束
- 若已修改，说明本次主要改了哪些层:
  主体 / 描边 / 高光 / 动势线 / 节点
- 若用户只问 favicon 是否像主题，回复中不要把 `theme-color`、`apple-touch-icon`、manifest、PWA 图标作为审查项
- 若没法做像素级预览，要把限制说清楚

## Handy Prompts

- “帮我 review 一下 `aurora` 主题和对应 favicon，看看是否一致”
- “保持 favicon 布局和轮廓不变，只改成更像主题”
- “逐个审查所有主题 favicon，优先找出配色和圆角气质不一致的”

## Read More When Needed

- 展开打法与高频错位案例:
  `.agent/skills/favicon-reviewer/references/favicon-audit-playbook.md`
