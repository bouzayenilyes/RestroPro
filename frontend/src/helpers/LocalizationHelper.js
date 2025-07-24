const LANGUAGE_KEY = "RESTRO__LANG";

export function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY);
}

export function setLanguage(lang) {
    localStorage.setItem(LANGUAGE_KEY, lang);
}