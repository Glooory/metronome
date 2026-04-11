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
    en: "Vibe Metronome | Free Online Metronome with Practice Tools",
    zh: "Vibe Metronome | 随变节拍器 - 免费在线节拍器与节奏练习工具",
    ja: "Vibe Metronome | 練習ツール付きの無料オンラインメトロノーム",
    ko: "Vibe Metronome | 연습 도구를 갖춘 무료 온라인 메트로놈",
    de: "Vibe Metronome | Kostenloses Online-Metronom mit Übungsfunktionen",
    fr: "Vibe Metronome | Métronome en ligne gratuit avec outils d'entraînement",
    es: "Vibe Metronome | Metrónomo online gratuito con herramientas de práctica",
    ru: "Vibe Metronome | Бесплатный онлайн-метроном с инструментами для занятий",
    pt: "Vibe Metronome | Metrônomo online gratuito com ferramentas de estudo",
  };

  const descriptions: Record<Language, string> = {
    en: "Free online metronome with speed training, interval training, presets, adjustable BPM, time signatures, subdivisions, and multiple click sounds. Built for daily practice.",
    zh: "免费在线节拍器，支持速度训练、间隔训练、预设、可调 BPM、拍号、节拍细分和多种节拍音色，适合日常节奏练习。",
    ja: "無料のオンラインメトロノーム。速度トレーニング、インターバルトレーニング、プリセット、BPM調整、拍子、細分化、複数のクリック音に対応。毎日の練習に使えます。",
    ko: "무료 온라인 메트로놈입니다. 속도 훈련, 간격 훈련, 프리셋, BPM 조절, 박자표, 세분화, 다양한 클릭 사운드를 지원해 매일의 연습에 잘 맞습니다.",
    de: "Kostenloses Online-Metronom mit Tempotraining, Intervalltraining, Presets, anpassbarem BPM, Taktarten, Unterteilungen und mehreren Klick-Sounds. Ideal für das tägliche Üben.",
    fr: "Métronome en ligne gratuit avec entraînement de vitesse, entraînement par intervalles, préréglages, BPM réglable, signatures rythmiques, subdivisions et plusieurs sons de clic. Idéal pour la pratique quotidienne.",
    es: "Metrónomo online gratuito con entrenamiento de velocidad, entrenamiento por intervalos, preajustes, BPM ajustable, compases, subdivisiones y varios sonidos de clic. Ideal para la práctica diaria.",
    ru: "Бесплатный онлайн-метроном с тренировкой темпа, интервальной тренировкой, пресетами, настраиваемым BPM, размерами, делениями и несколькими звуками клика. Подходит для ежедневных занятий.",
    pt: "Metrônomo online gratuito com treino de velocidade, treino de intervalos, predefinições, BPM ajustável, fórmulas de compasso, subdivisões e vários sons de clique. Ideal para a prática diária.",
  };

  const keywords: Record<Language, string> = {
    en: "metronome, online metronome, free metronome, speed trainer, interval trainer, presets, BPM, time signature, subdivisions, rhythm practice",
    zh: "节拍器,在线节拍器,免费节拍器,速度训练,间隔训练,预设,BPM,拍号,节拍细分,节奏练习",
    ja: "メトロノーム,オンラインメトロノーム,無料メトロノーム,速度トレーナー,間隔トレーナー,プリセット,BPM,拍子,サブディビジョン,リズム練習",
    ko: "메트로놈,온라인 메트로놈,무료 메트로놈,속도 훈련,간격 훈련,프리셋,BPM,박자표,세분화,리듬 연습",
    de: "Metronom,Online-Metronom,kostenloses Metronom,Tempotrainer,Intervalltrainer,Presets,BPM,Taktart,Unterteilungen,Rhythmusübung",
    fr: "métronome,métronome en ligne,métronome gratuit,entraîneur de vitesse,entraîneur d'intervalles,préréglages,BPM,signature rythmique,subdivisions,travail du rythme",
    es: "metrónomo,metrónomo online,metrónomo gratuito,entrenador de velocidad,entrenador de intervalos,preajustes,BPM,compás,subdivisiones,práctica rítmica",
    ru: "метроном,онлайн-метроном,бесплатный метроном,тренировка темпа,интервальная тренировка,пресеты,BPM,размер,деления,ритмическая практика",
    pt: "metrônomo,metrônomo online,metrônomo gratuito,treino de velocidade,treino de intervalos,predefinições,BPM,fórmula de compasso,subdivisões,prática de ritmo",
  };

  const title = titles[language];
  const description = descriptions[language];
  const keywordStr = keywords[language];
  const currentUrl = language === "en" ? SITE_URL : `${SITE_URL}?lang=${language}`;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: language === "zh" ? "随变节拍器" : "Vibe Metronome",
    url: currentUrl,
    description: description,
    inLanguage: [language],
    applicationCategory: "MusicApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      translations.speedTrainer.title[language],
      translations.intervalTrainer.title[language],
      translations.trainer.presets[language],
      translations.dock.soundPreset[language],
    ],
    author: {
      "@type": "Organization",
      name: "Glooory",
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
    case "zh":
      return "zh_CN";
    case "ja":
      return "ja_JP";
    case "ko":
      return "ko_KR";
    case "de":
      return "de_DE";
    case "fr":
      return "fr_FR";
    case "es":
      return "es_ES";
    case "ru":
      return "ru_RU";
    case "pt":
      return "pt_BR";
    default:
      return "en_US";
  }
}
