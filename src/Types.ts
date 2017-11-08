import { ItemObject } from './ItemModel';
import { TreeNodeObject } from './TreeModel';
import { CodeMirrorRenderer, MarkdownRenderer } from './RenderModel';

export type ConfigOptions = {
  allowChangeExtensions: boolean;
  allowFolderDownload: boolean;
  browseOnly: boolean;
  capabilities: string[]
  fileSorting: string;
  folderPosition: string;
  logger: boolean;
  quickSelect: boolean;
  searchBox: boolean;
  showConfirmation: boolean;
  showTitleAttr: boolean;
  theme: string;
}

export interface Config {
  api: {
    connectorUrl: boolean | string;
    lang: string;
    requestParams: {
      GET: any,
      POST: any,
      MIXED: any
    };
  };
  clipboard: {
    encodeCopyUrl: boolean;
    enabled: boolean;
  };
  customScrollbar: {
    button: boolean;
    enabled: boolean;
    theme: string;
  };
  editor: {
    codeHighlight: boolean;
    enabled: boolean;
    extensions: string[];
    lineNumbers: boolean;
    lineWrapping: boolean;
    matchBrackets: boolean;
    theme: string;
  };
  extras: {
    extra_js: any[];
    extra_js_async: boolean;
  };
  filetree: {
    enabled: boolean;
    expandSpeed: number;
    foldersOnly: boolean;
    minWidth: number;
    reloadOnClick: boolean;
    showLine: boolean;
    width: number;
  };
  filter: {
    [name: string]: string[];
  };
  language: {
    available: string[];
    // noinspection ReservedWordAsName
    default: string;
  };
  manager: {
    dblClickOpen: boolean;
    defaultViewMode: string;
    renderer: {
      indexFile: string;
      position: boolean;
    };
    selection: {
      enabled: boolean;
      useCtrlKey: boolean;
    };
  };
  options: ConfigOptions;
  security: {
    extensions: {
      ignoreCase: boolean;
      policy: any;
      restrictions: any;
    }
    readOnly: boolean;
  };
  upload: {
    chunkSize: boolean;
    fileSizeLimit: number;
    maxNumberOfFiles: number;
    multiple: boolean;
  };
  viewer: {
    absolutePath: boolean;
    audio: {
      enabled: boolean;
      extensions: string[];
    };
    codeMirrorRenderer: {
      enabled: boolean;
      extensions: string[];
    };
    google: {
      enabled: boolean;
      extensions: string[];
      readerHeight: number;
      readerWidth: number;
    };
    iframe: {
      enabled: boolean;
      extensions: string[];
      readerHeight: number;
      readerWidth: number;
    };
    image: {
      enabled: boolean;
      extensions: string[];
      lazyLoad: boolean;
      showThumbs: boolean;
      thumbMaxWidth: number;
    };
    markdownRenderer: {
      enabled: boolean;
      extensions: string[];
    };
    opendoc: {
      enabled: boolean;
      extensions: string[];
      readerHeight: number;
      readerWidth: number;
    };
    previewUrl: boolean;
    video: {
      enabled: boolean;
      extensions: string[];
      playerHeight: number;
      playerWidth: number;
    };
  };
}

export interface ReadableObject {
  id: string;
  type: string
  attributes: {
    size: number;
    name: string;
    path: string;
    readable: boolean;
    writable: boolean;
    width: string | number;
    height: string | number;
    capabilities: any;
    timestamp: any;
  }
}

export interface ComputedDataObject {
  isFolder: boolean;
  sizeFormatted?: string;
  extension: string;
  dimensions: string;
  cssItemClass: string;
  imageUrl?: string;
  previewWidth?: number;
  hiddenByType: boolean;
  hiddenBySearch: boolean;
}

export interface Settings {
  baseUrl: string;
  config: Config;
  callbacks: any;
}

export interface Editor {
  interactive: boolean;
}

export interface Viewer {
  type: string;
  isEditable: boolean;
  url: string;
  pureUrl: any;
  options: {
    width?: number;
    height?: number;
    is_writable?: boolean;
  };
  content: any;
  codeMirror: any;
}

export type Params = {
  mode?: string;
  path: string;
  type?: string;
  thumbnail?: any;
};

export type NodeItem = TreeNodeObject | ItemObject;

export type Renderer = MarkdownRenderer | CodeMirrorRenderer;