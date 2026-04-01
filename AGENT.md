# AGENT.md

## 项目概览

- 这是一个运行在浏览器中的音乐节拍器与节奏训练应用，技术栈为 React、TypeScript、Vite、CSS Modules 和 Web Audio API。
- 项目是单页前端应用，没有后端服务。
- 面向用户的核心功能包括：
  - BPM 调节与 Tap Tempo 点按测速
  - 拍号与细分节奏
  - 逐步编辑拍点状态：普通、次重音、重音、静音
  - 基于 Web Audio API 的实时音色合成
  - 速度训练、间隔训练、Swing、Shift、预设
  - 多套视觉主题
  - 多语言界面

## 开发命令

- 安装依赖：`npm install`
- 启动开发服务器：`npm run dev`
- 构建生产包：`npm run build`
- 运行 lint：`npm run lint`
- 格式化代码：`npm run format`
- 预览生产构建：`npm run preview`

## 仓库结构

- `src/App.tsx`
  - 应用顶层状态与主编排入口。
  - 几乎所有持久化设置都在这里从 `localStorage` 读取和写回。
  - 串联播放、预设、训练器、主题选择、语言选择和各类弹窗状态。
- `src/hooks/useMetronome.ts`
  - 核心播放引擎。
  - 负责 Web Audio 上下文创建、音符调度、Swing 时间偏移、Shift 索引映射、间隔静音逻辑、小节计数和可视化节拍更新。
- `src/constants.ts`
  - 共用常量、存储键、音色 ID、节拍状态 ID，以及训练器和预设相关类型定义。
- `src/i18n.ts`
  - 翻译表和语言类型定义。
  - 新增界面文案时，必须同步更新所有支持语言，而不是只改一种语言。
- `src/theme-registry.ts`
  - 主题注册表与主题类型定义。
  - 新主题必须先在这里导入并注册。
- `src/components/*`
  - UI 按组件目录拆分。
  - 当前项目约定是每个组件目录包含 `index.tsx` 与 `styles.module.css`。
- `src/styles/tokens/*`
  - 全局设计 token 与语义变量。
- `src/styles/themes/*`
  - 各主题的覆盖样式文件。
- `public/`
  - 静态资源、manifest、favicon、SEO 文件。
- `.agent/rules/code-style-guide.md`
  - 本地代码风格说明，覆盖组件组织、CSS 命名和 TypeScript 习惯。

## 架构说明

### 状态模型

- `App.tsx` 是几乎所有 UI 状态和功能状态的单一事实来源。
- 应用通过 `localStorage` 持久化用户设置；`getStorageItem` 和 `setStorageItem` 这两个辅助函数定义在 `App.tsx` 中。
- `stepStates` 的长度由 `beatsPerMeasure * subdivision` 推导而来。任一项变化时，`App.tsx` 都会重新生成对应的节拍结构。
- 预设加载是有状态且对顺序敏感的。`handleLoadPreset` 会先更新结构性状态，再通过 `setTimeout(..., 0)` 延后设置 `stepStates`，以确保步进数组长度与新的拍号和细分保持一致。

### 音频引擎

- `useMetronome` 使用 `setTimeout` 驱动的 scheduler 循环，并结合 lookahead 窗口进行调度。
- 当前关键时间常量：
  - `LOOKAHEAD = 25ms`
  - `SCHEDULE_AHEAD_TIME = 0.1s`
- 音频全部由代码实时合成，没有采样音频资源文件。
- 不同音色的实现分别在 `playSine`、`playWoodblock`、`playDrum` 和 `playMech` 中。
- `ensureAudioContext()` 是浏览器音频解锁入口。任何期望立即发声的交互，通常都应先调用它。
- 该 hook 会把运行时值镜像到多个 ref 中，例如 `bpmRef`、`soundPresetRef`、`stepStatesRef` 等，从而让调度器在不中断播放的情况下读取最新状态。

### 可视化时序

- 可视化器不是直接由控件改动触发高亮，而是跟随 `useMetronome` 内部的已调度音符队列推进。
- Shift 同时影响发声索引和高亮索引。如果修改 Shift 逻辑，必须同步检查这两条路径。

### 主题系统

- 主题由 CSS 驱动，并在 `src/theme-registry.ts` 中注册。
- 当前激活主题会通过 `getThemeClassName(theme)` 生成的 class 挂到应用根节点上。
- `App.tsx` 在主题切换时还会同步更新 favicon，因此新增主题时通常还需要补齐对应 favicon 资源和映射表项。
- 当前默认主题 `DEFAULT_THEME` 是 `oled`。

### 国际化

- 语言选择优先读取 URL 查询参数，其次回退到本地存储。
- `App.tsx` 会把当前语言同步回 `?lang=` URL 参数中。
- 支持的语言定义在 `src/i18n.ts`。
- 如果新增翻译键，必须保持所有语言对象的字段结构一致。

## 常见修改路径

### 新增一个主题

1. 在 `src/styles/themes/` 下创建新的主题文件。
2. 在 `src/theme-registry.ts` 中导入该文件。
3. 将新主题加入 `THEME_REGISTRY`。
4. 在 `translations.options.themes` 中补充主题名称翻译。
5. 如果希望保持完整的主题专属 favicon 体验，在 `public/favicons/` 下增加对应资源。
6. 更新 `src/App.tsx` 中的 favicon 映射表。

### 新增一个音色预设

1. 在 `src/constants.ts` 中新增音色 ID。
2. 在 `src/i18n.ts` 中增加对应的多语言标签。
3. 在 `src/App.tsx` 的 `soundOptions` 中注册该选项。
4. 在 `src/hooks/useMetronome.ts` 中实现对应的音色合成逻辑。
5. 扩展 `playSound` 中的分发逻辑。

### 新增或修改训练器功能

1. 在 `src/constants.ts` 中新增或扩展配置类型。
2. 在 `App.tsx` 中接入配置的存储与恢复逻辑。
3. 在 `src/components/` 下新增或更新对应的弹窗或 UI 组件。
4. 如果该功能影响播放时序或静音逻辑，需要在 `src/hooks/useMetronome.ts` 中实现。
5. 验证时要覆盖播放中的行为，而不是只测试停止状态。

### 新增界面文案或一个新控件

1. 在 `src/i18n.ts` 中新增翻译键。
2. 如有需要，把 `language` props 继续向下传递到对应组件。
3. 保持与现有组件目录组织方式一致。
4. 如果控件会改变持久化状态，需要在 `App.tsx` 中补齐对应存储处理。

## 项目特有注意事项

- 当前项目没有自动化测试套件。主要验证手段是 `npm run lint`、`npm run build` 和浏览器手动交互测试。
- `vite.config.ts` 中使用了 `base: "/metronome/"` 来适配 GitHub Pages，处理资源路径时不要默认它部署在站点根路径。
- `src/main.tsx` 中启用了 React Strict Mode。
- 部分行为依赖浏览器音频策略，没有用户手势时不能假设音频一定已初始化。
- `stepStates` 必须始终与 `beatsPerMeasure * subdivision` 对齐，很多 UI 和播放逻辑都依赖这一前提。
- 间隔训练器的静音逻辑只会抑制声音输出，可视化节拍仍会继续推进，这是当前设计的一部分。
- 速度训练器会在小节完成时递增 BPM，并且必须遵守 `targetBpm` 和 `MAX_BPM` 上限。
- 项目的代码风格偏好包括：
  - 组件目录包含 `index.tsx` 和 `styles.module.css`
  - CSS 类名使用 BEM 风格
  - 主题值尽量通过 CSS 变量表达
  - CSS 和 TypeScript 中尽量避免无意义注释

## 后续 Agent 的工作方式建议

- 优先做小而聚焦的修改，尽量保持当前组件组织方式不变。
- 修改播放行为前，先完整阅读 `src/hooks/useMetronome.ts`，因为时序相关逻辑在这里耦合较紧。
- 修改持久化逻辑前，先检查 `src/App.tsx` 中负责同步 `localStorage` 的整段 `useEffect`。
- 新增主题、音色或翻译项时，尽量一次完成完整链路；这个仓库里最容易遗漏的就是“只注册了一半”。
- 保持当前已有的交互预期不被破坏：
  - 键盘快捷键控制播放和 BPM
  - Tap Tempo
  - 主题循环切换
  - 训练器状态持久化
  - 预设的保存和加载行为

## 建议验证方式

- 运行 `npm run lint`
- 运行 `npm run build`
- 如果改动涉及 UI 或播放逻辑，建议在浏览器中手动验证：
  - 播放和暂停
  - BPM 调整
  - 细分切换
  - 节拍状态切换
  - 音色切换
  - 主题切换
  - 语言切换
  - 相关训练器流程
