import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/frensh.json";
import en from "./locales/english.json";
import ar from "./locales/arabe.json";

export async function setupI18n(defaultLang: string = "fr") {
  const savedLang = localStorage.getItem("language");
  const initialLang = savedLang || defaultLang;

  const resources = {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
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
