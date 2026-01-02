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
  const titles = {
    en: "Vibe Metronome | Professional Online Metronome with Training Tools",
    zh: "Vibe Metronome | 随变节拍器 - 专业在线节拍与节奏训练工具",
  };

  const descriptions = {
    en: "Free online metronome with speed trainer, interval trainer, and preset management. Features adjustable BPM, time signatures, subdivisions, and multiple sound presets. Perfect for musicians.",
    zh: "免费专业在线节拍器，内置速度渐变训练、间隔缺省训练及预设管理功能。支持多种拍号、细分节奏及高品质音色，专为音乐人打造的节奏练习工具。",
  };

  const keywords = {
    en: "metronome, online metronome, speed trainer, interval trainer, BPM, rhythm trainer, music practice, free metronome",
    zh: "节拍器, 在线节拍器, 随变节拍器, 速度训练, 节奏训练, 缺省练习, 音乐练习, 乐器练习, 钢琴, 吉他, 架子鼓",
  };

  const title = titles[language];
  const description = descriptions[language];
  const keywordStr = keywords[language];
  const currentUrl = language === "zh" ? `${SITE_URL}?lang=zh` : SITE_URL;

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
      <meta property="og:locale" content={language === "zh" ? "zh_CN" : "en_US"} />
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
