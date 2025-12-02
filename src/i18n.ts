import i18n from "i18next";
import { initReactI18next } from "react-i18next";

async function loadLocale(path: string) {
  const res = await fetch(path);
  return res.json();
}

export async function setupI18n(defaultLang: string = "fr") {
  const resources: Record<string, { translation: any }> = {
    fr: { translation: await loadLocale("/locales/frensh.json") },
    en: { translation: await loadLocale("/locales/english.json") },
    ar: { translation: await loadLocale("/locales/arabe.json") },
  };

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLang,
      fallbackLng: defaultLang,
      interpolation: { escapeValue: false },
    });

  return i18n;
}
