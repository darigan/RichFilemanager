export type LangKV = { [key: string]: string };

/**
 * Language model
 * @constructor
 */
export let currentLang: string = null;
export let translationsHash: LangKV = {};
export let translationsPath: string;

export function init(baseUrl: string): void {
  translationsPath = `${baseUrl}/languages/`;
}

export function buildLangFileUrl(code: string): string {
  return `${translationsPath + code}.json`;
}

export function setLang(code: string): void {
  currentLang = code;
}

export function getLang(): string {
  return currentLang;
}

export function setTranslations(json: LangKV) {
  translationsHash = json;
}

export function getTranslations(): LangKV {
  return translationsHash;
}

export function translate(key: string): string {
  return translationsHash[ key ];
}
