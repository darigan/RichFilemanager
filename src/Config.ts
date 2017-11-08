import { Config, ReadableObject, Settings } from './Types';

/**
 * Plugin's default options
 */

export let defaults: Settings = {
  baseUrl: '.',	// relative path to the FM plugin folder
  config: <Config>{},		// configuration options
  callbacks: {
    beforeCreateImageUrl: (_resourceObject: ReadableObject, url: string): string => url,
    beforeCreatePreviewUrl: (_resourceObject: ReadableObject, url: string): string => url,
    beforeSelectItem: (_resourceObject: ReadableObject, url: string): string => url,
    afterSelectItem: (/*resourceObject, url, contextWindow*/) => {
    }
  }
};