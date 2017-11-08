export type LangKV = { [key: string]: string };

/**
 * Language model
 * @constructor
 */
export let currentLang: string = null;
export let translationsHash: LangKV = {};
export let translationsPath: string;

export function init(baseUrl: string) {
  translationsPath = `${baseUrl}/languages/`;
}

export function buildLangFileUrl(code: string): string {
  return `${translationsPath + code}.json`;
}

export function setLang(code: string) {
  currentLang = code;
}

export function getLang(): string {
  return <string>currentLang;
}

export function setTranslations(json: LangKV) {
  translationsHash = json;
}

export function getTranslations() {
  return translationsHash;
}

export function translate(key: string): string {
  return translationsHash[ key ];
}
