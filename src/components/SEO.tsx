import { Helmet } from "react-helmet-async";
import type { Language } from "../i18n";
import { translations } from "../i18n";

interface SEOProps {
  language: Language;
}

export const SEO = ({ language }: SEOProps) => {
  // Constants
  const SITE_URL = "https://glooory.github.io/metronome/";
  const BASE_TITLE = "Vibe Metronome";
  
  // Localized Strings
  const titles: Record<Language, string> = {
    en: "Vibe Metronome | Professional Online Metronome with Training Tools",
    zh: "Vibe Metronome | 随变节拍器 - 专业在线节拍与节奏训练工具",
    ja: "Vibe Metronome | プロフェッショナルなオンラインメトロノーム＆リズムトレーニング",
    ko: "Vibe Metronome | 전문 온라인 메트로놈 & 리듬 트레이너",
    de: "Vibe Metronome | Professionelles Online-Metronom mit Trainingstools",
    fr: "Vibe Metronome | Métronome en ligne professionnel et outils de rythme",
    es: "Vibe Metronome | Metrónomo online profesional y entrenamiento de ritmo",
    ru: "Vibe Metronome | Профессиональный онлайн-метроном и ритм-тренер",
    pt: "Vibe Metronome | Metrônomo online profissional e treino de ritmo",
  };

  const descriptions: Record<Language, string> = {
    en: "Free online metronome with speed trainer, interval trainer, and preset management. Features adjustable BPM, time signatures, subdivisions, and multiple sound presets. Perfect for musicians.",
    zh: "免费专业在线节拍器，内置速度渐变训练、间隔缺省训练及预设管理功能。支持多种拍号、细分节奏及高品质音色，专为音乐人打造的节奏练习工具。",
    ja: "無料のオンラインメトロノーム。速度トレーナー、間隔トレーナー、プリセット管理機能を搭載。BPM、拍子、サブディビジョン、サウンドプリセットを調整可能。ミュージシャンに最適です。",
    ko: "속도 트레이너, 간격 트레이너 및 프리셋 관리 기능을 갖춘 무료 온라인 메트로놈. BPM, 박자, 세분화 및 다양한 사운드 프리셋 조절 가능. 음악가에게 최적화된 도구입니다.",
    de: "Kostenloses Online-Metronom mit Tempotrainer, Intervalltrainer und Preset-Verwaltung. Anpassbare BPM, Taktarten, Unterteilungen und Sound-Presets. Perfekt für Musiker.",
    fr: "Métronome en ligne gratuit avec entraîneur de vitesse, entraîneur d'intervalles et gestion des préréglages. BPM, signatures rythmiques, subdivisions et sons ajustables. Parfait pour les musiciens.",
    es: "Metrónomo online gratuito con entrenador de velocidad, intervalos y gestión de preajustes. BPM ajustable, compases, subdivisiones y múltiples sonidos. Perfecto para músicos.",
    ru: "Бесплатный онлайн-метроном с тренировкой темпа и интервалов. Настраиваемый BPM, размеры, деления и звуковые пресеты. Идеально для музыкантов.",
    pt: "Metrônomo online gratuito com treinador de velocidade, intervalos e gestão de predefinições. BPM ajustável, fórmulas de compasso, subdivisões e vários sons. Perfeito para músicos.",
  };

  const keywords: Record<Language, string> = {
    en: "metronome, online metronome, speed trainer, interval trainer, BPM, rhythm trainer, music practice, free metronome",
    zh: "节拍器, 在线节拍器, 随变节拍器, 速度训练, 节奏训练, 缺省练习, 音乐练习, 乐器练习, 钢琴, 吉他, 架子鼓",
    ja: "メトロノーム, オンラインメトロノーム, 速度トレーナー, リズムトレーニング, BPM, 音楽練習, 無料メトロノーム",
    ko: "메트로놈, 온라인 메트로놈, 박자기, 속도 트레이너, 리듬 트레이너, BPM, 음악 연습, 무료 메트로놈",
    de: "Metronom, Online-Metronom, Tempotrainer, Rhythmustrainer, BPM, Musik üben, kostenloses Metronom",
    fr: "métronome, métronome en ligne, entraîneur de vitesse, rythme, BPM, pratique musicale, gratuit",
    es: "metrónomo, metrónomo online, entrenador de velocidad, ritmo, BPM, práctica musical, gratis",
    ru: "метроном, онлайн метроном, тренировка темпа, ритм, BPM, музыкальная практика, бесплатно",
    pt: "metrônomo, metrônomo online, treino de velocidade, ritmo, BPM, prática musical, grátis",
  };

  const title = titles[language];
  const description = descriptions[language];
  const keywordStr = keywords[language];
  const currentUrl = language === "en" ? SITE_URL : `${SITE_URL}?lang=${language}`;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": language === "zh" ? "随变节拍器" : "Vibe Metronome",
    "url": currentUrl,
    "description": description,
    "inLanguage": [language],
    "applicationCategory": "MusicApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      translations.speedTrainer.title[language],
      translations.intervalTrainer.title[language],
      translations.trainer.presets[language],
      translations.dock.soundPreset[language],
    ],
    "author": {
      "@type": "Organization",
      "name": "Glooory",
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={language} />
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordStr} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={getLocale(language)} />
      <meta property="og:site_name" content={BASE_TITLE} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={currentUrl} />

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

function getLocale(lang: Language): string {
  switch (lang) {
    case "zh": return "zh_CN";
    case "ja": return "ja_JP";
    case "ko": return "ko_KR";
    case "de": return "de_DE";
    case "fr": return "fr_FR";
    case "es": return "es_ES";
    case "ru": return "ru_RU";
    case "pt": return "pt_BR";
    default: return "en_US";
  }
}
