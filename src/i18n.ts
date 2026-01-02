export type Language = "en" | "zh";

export const STORAGE_KEY_LANGUAGE = "vibe-metronome-language";

export const translations = {
  common: {
    bpm: { en: "BPM", zh: "BPM" },
    measures: { en: "measures", zh: "小节" },
    enable: { en: "Enable", zh: "启用" },
    save: { en: "Save", zh: "保存" },
    load: { en: "Load", zh: "加载" },
    delete: { en: "Delete", zh: "删除" },
    close: { en: "Close", zh: "关闭" },
    reset: { en: "Reset", zh: "重置" },
  },

  header: {
    help: { en: "Help", zh: "帮助" },
    language: { en: "Language", zh: "语言" },
  },

  visualizer: {
    shift: { en: "Shift", zh: "偏移" },
  },

  dock: {
    timeSignature: { en: "Time Signature", zh: "拍号" },
    soundPreset: { en: "Sound", zh: "音色" },
    theme: { en: "Theme", zh: "主题" },
  },

  trainer: {
    speed: { en: "Speed", zh: "速度" },
    interval: { en: "Interval", zh: "间隔" },
    swing: { en: "Swing", zh: "摇摆" },
    presets: { en: "Presets", zh: "预设" },
    speedTooltip: { en: "Speed Trainer", zh: "速度渐变训练" },
    intervalTooltip: { en: "Interval Trainer", zh: "间隔训练" },
    swingTooltip: { en: "Swing Trainer", zh: "摇摆训练" },
    presetsTooltip: { en: "Presets & Setlists", zh: "预设与曲目单" },
  },

  speedTrainer: {
    title: { en: "Speed Trainer", zh: "速度渐变训练" },
    enableTraining: { en: "Enable Training", zh: "启用训练" },
    everyMeasures: { en: "Every (measures)", zh: "每隔 (小节)" },
    incrementBpm: { en: "Increment BPM", zh: "增加 BPM" },
    targetBpm: { en: "Target BPM", zh: "目标 BPM" },
    reachedTarget: { en: "🎉 Reached target", zh: "🎉 已达到目标" },
    measuresUntil: { en: "measures until", zh: "小节后" },
  },

  swingTrainer: {
    title: { en: "Swing Trainer", zh: "摇摆训练" },
    swing: { en: "Swing", zh: "摇摆" },
    swingDesc: { en: "Delay the off-beat notes", zh: "推迟反拍音符" },
    reset: { en: "Reset", zh: "重置" },
  },

  intervalTrainer: {
    title: { en: "Interval Trainer", zh: "间隔训练" },
    enableTraining: { en: "Enable Training", zh: "启用训练" },
    playBars: { en: "Play (measures)", zh: "播放 (小节)" },
    muteBars: { en: "Mute (measures)", zh: "静音 (小节)" },
    playing: { en: "🔊 Playing", zh: "🔊 播放中" },
    muted: { en: "🔇 Muted", zh: "🔇 静音中" },
    untilResume: { en: "measures until resume", zh: "小节恢复播放" },
    untilMute: { en: "measures until mute", zh: "小节进入静音" },
    hint: {
      en: "💡 Visualizer continues during mute to check your internal interval",
      zh: "💡 静音期间可视化效果仍在运行，用来检测你内心的间隔是否稳定",
    },
  },

  presets: {
    title: { en: "Presets & Setlists", zh: "预设与曲目单" },
    inputPlaceholder: { en: "Enter preset name...", zh: "输入预设名称..." },
    saveCurrent: { en: "Save", zh: "保存" },
    confirmDeleteTitle: { en: "Delete Preset", zh: "删除预设" },
    confirmDeleteMessage: {
      en: "Are you sure you want to delete this preset?",
      zh: "确定要删除这个预设吗？",
    },
    cancel: { en: "Cancel", zh: "取消" },
    confirm: { en: "Delete", zh: "删除" },
    emptyTitle: { en: "No presets yet", zh: "暂无预设" },
    emptyHint: {
      en: "Save your current settings for quick access",
      zh: "保存当前配置以便快速切换",
    },
  },

  help: {
    title: { en: "User Guide", zh: "使用说明" },
    bpmControl: { en: "BPM Control", zh: "BPM 速度控制" },
    bpmControlDesc: {
      en: "Drag the slider or click arrows to adjust tempo.",
      zh: "拖动数字旁的滑块，或点击右侧箭头调整。",
    },
    bpmControlKeys: {
      en: "Shortcuts: ↑/↓ (hold Shift for faster)",
      zh: "快捷键: ↑ / ↓ (Shift 加速)",
    },
    bpmMemory: { en: "BPM Memory", zh: "BPM 记忆栏" },
    bpmMemoryDesc: {
      en: "Click ★ to save current tempo. Click a chip to switch.",
      zh: "点击 ★ 保存当前速度，点击胶囊快速切换。",
    },
    beatBars: { en: "Beat Bars", zh: "节拍光柱" },
    beatBarsDesc: {
      en: "Click bars to cycle states. Block count indicates strength:",
      zh: "点击光柱循环切换状态。方块数量代表强弱：",
    },
    beatBarsLegend: {
      en: "3=Accent · 2=Sub-accent · 1=Normal · 0=Mute",
      zh: "3格=重音 · 2格=次重音 · 1格=普通 · 空=静音",
    },
    swingTrainer: { en: "Swing & Shift", zh: "摇摆与偏移" },
    swingTrainerDesc: {
      en: "Swing: Add groove/shuffle feel (works on ♪/16th). Shift: Offset the pattern start time.",
      zh: "摇摆: 添加摇摆律动（需八分音符及以上）。偏移: 整体偏移节奏型的起始点。",
    },
    speedTrainer: { en: "Speed Trainer", zh: "速度渐变训练" },
    speedTrainerDesc: {
      en: "Auto-increment BPM every N measures. Set target BPM to auto-stop.",
      zh: "每隔 N 小节自动加速，适合爬音阶练习。可设置目标 BPM，达到后自动停止。",
    },
    intervalTrainer: { en: "Interval Trainer", zh: "间隔检测训练" },
    intervalTrainerDesc: {
      en: "Play X measures, then mute Y measures. Watch the visualizer to check your internal timing.",
      zh: "播放 X 小节后自动静音 Y 小节。静音期间观察光柱，检测你内心的间隔是否稳定。",
    },
    presetsFeature: { en: "Presets", zh: "预设与曲目单" },
    presetsDesc: {
      en: "Save your favorite configurations (BPM, time signature, sound, beat pattern) for quick access.",
      zh: "保存常用配置（BPM、拍号、音色、节奏型），一键快速切换。",
    },
    bottomDock: { en: "Bottom Controls", zh: "底部控制栏" },
    bottomDockDesc: {
      en: "Click time signature or sound to open options. Press Space to play/pause.",
      zh: '点击"拍号"或"音色"展开选项列表。按空格播放/暂停。',
    },
    footer: { en: "All settings auto-saved", zh: "所有设置自动保存" },
  },

  options: {
    sounds: {
      sine: { en: "SINE", zh: "电子" },
      wood: { en: "WOOD", zh: "木鱼" },
      drum: { en: "DRUM", zh: "鼓组" },
      mech: { en: "MECH", zh: "机械" },
    },
    subdivisions: {
      qtr: { en: "QTR (1/4)", zh: "四分 (1/4)" },
      eighth: { en: "8TH (1/8)", zh: "八分 (1/8)" },
      triplet: { en: "TRIP (1/3)", zh: "三连 (1/3)" },
      sixteenth: { en: "16TH (1/16)", zh: "十六 (1/16)" },
    },
    themes: {
      glass: { en: "Glass", zh: "玻璃" },
      swiss: { en: "Swiss", zh: "瑞士" },
      zen: { en: "Zen", zh: "禅意" },
      "e-ink": { en: "E-Ink", zh: "墨水" },
      cyberpunk: { en: "Cyberpunk", zh: "赛博" },
      kids: { en: "Kids", zh: "童趣" },
      neumorphism: { en: "Soft", zh: "拟物" },
      amoled: { en: "OLED", zh: "极黑" },
      retro: { en: "80s", zh: "复古" },
    },
  },

  bpmHistory: {
    noHistory: { en: "No history", zh: "暂无记录" },
    tap: { en: "TAP", zh: "点按" },
  },
} as const;

export function t(key: string, lang: Language, section?: keyof typeof translations): string {
  const parts = key.split(".");
  let value: any = translations;

  if (section) {
    value = translations[section];
    if (value && value[key]) {
      return value[key][lang] || value[key]["en"] || key;
    }
  }

  for (const part of parts) {
    value = value?.[part];
  }

  if (value && typeof value === "object" && lang in value) {
    return value[lang];
  }

  return key;
}
