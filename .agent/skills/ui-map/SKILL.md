---
name: Metronome UI Map
description: Metronome 项目结构、组件定位、界面区域映射与交互入口总指南。用于定位功能入口、查找 UI 组件、理解弹窗与主界面关系、执行“指哪打哪”的界面改动；不作为主题设计或 CSS Token 调优的主规范。
---

# Vibe Metronome UI Map

## Use This When

- 用户按界面描述提需求，例如“顶部工具栏”“底部控制栏”“帮助弹窗”“BPM 数字右侧滚轮”。
- 需要把用户口语映射到组件、选择器、状态字段或源码路径。
- 需要确认某个弹窗或控件由哪个状态控制。

## Do Not Use This When

- 任务重点是主题设计、CSS Token、视觉风格、交互质感。
  这类任务优先参考 `.agent/skills/theme-architect/SKILL.md`。

## Source Files

- 导航规则和使用边界在本文件。
- 结构化 UI 注册表在 `.agent/skills/ui-map/ui-registry.json`。
- 注册表校验脚本在 `.agent/skills/ui-map/verify_registry.mjs`。
- 如果注册表和运行时代码冲突，以运行时代码为准。

## Working Rules

- 先用用户描述匹配 `ui-registry.json` 里的 `area`。
- 再根据 `path`、`selector`、`logic`、`state_trigger` 跳到对应源码。
- 涉及弹窗开关时，同时检查 `App.tsx` 中的条件渲染。
- 涉及界面文案时，优先检查 `src/i18n.ts`。
- 用户提到底部区域时，先区分 `TrainerDock`（训练/预设入口）和 `ControlDock`（拍号/播放/音色），不要把两个 dock 当成同一个控件组。
- 如果请求开始变成主题或 token 问题，切换到 `.agent/skills/theme-architect/SKILL.md`。
- 默认不要在这里把 `src/styles/tokens/components-api.css` 当作调主题值的入口。
- 只有在 UI 实体真的发生变化时，才更新注册表；不要把它写成冗长叙事文档。

## CSS Token Boundary

- 改所有主题共享的默认值:
  `src/styles/tokens/semantic.css`
- 改单个主题:
  `src/styles/themes/*.css`
- 只有在组件 slot 契约变化时才改:
  `src/styles/tokens/components-api.css`

## Quick Landmarks

- 弹窗状态:
  `showSpeedModal`, `showIntervalModal`, `showSwingModal`, `showPresetsModal`, `isHelpOpen`
- 底部双 dock:
  `TrainerDock` 在上，`ControlDock` 在下，都由 `src/App.tsx` 放进 `styles['dock-section']`
- 基础组件:
  `src/components/Button`, `src/components/Checkbox`, `src/components/Input`, `src/components/Select`, `src/components/Slider`, `src/components/ModalShell`
- 全局布局:
  `src/App.module.css`
- 文案入口:
  `src/i18n.ts`

## Registry Maintenance

- UI 注册表文件:
  `.agent/skills/ui-map/ui-registry.json`
- 修改了区域、入口、弹窗、关键 selector 或 path 后，要同步更新注册表。
- 更新注册表后运行:
  `node .agent/skills/ui-map/verify_registry.mjs`

## Task Reminders

- 用户提到某个“区域”时，先找 `area`，不要先全文盲搜。
- 用户提到“点了某个按钮会发生什么”时，优先找 `logic`、`action` 或 `state_trigger`。
- 用户说“底部 dock”时，先追问或自行判断他指的是训练入口 dock 还是播放主控 dock；如果没有上下文，优先同时检查两者。
- 修改 BPM 滚轮行为时，额外关注 `BpmDisplay` 的交互逻辑。
- 遇到主题或 token 请求时，切换到 `.agent/skills/theme-architect/SKILL.md`。
