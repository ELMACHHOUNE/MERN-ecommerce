import i18n from "i18next";
import { initReactI18next } from "react-i18next";

async function loadLocale(path: string) {
  // Add timestamp to prevent caching of translation files
  const res = await fetch(`${path}?t=${Date.now()}`);
  return res.json();
}

export async function setupI18n(defaultLang: string = "fr") {
  const savedLang = localStorage.getItem("language");
  const initialLang = savedLang || defaultLang;

  const resources: Record<string, { translation: any }> = {
    fr: { translation: await loadLocale("/locales/frensh.json") },
    en: { translation: await loadLocale("/locales/english.json") },
    ar: { translation: await loadLocale("/locales/arabe.json") },
  };

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: defaultLang,
      interpolation: { escapeValue: false },
    });

  i18n.on("languageChanged", (lng) => {
    localStorage.setItem("language", lng);
  });

  return i18n;
}
