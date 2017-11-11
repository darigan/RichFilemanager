interface AlertifyOptions {
  reset: boolean;
  delay: number;
  logMaxItems: number;
  logPosition: string;
  logContainerClass: string;
  logClass: any; // todo: boolean or string?
  parent: HTMLElement;
  onClick: Function; // todo: function
  unique: boolean;
  type: 'dialog' | 'alert' | 'confirm' | 'prompt' | 'log' | 'success' | 'warning' | 'error'
}

interface AlertifyBtn {
  type?: string;
  label?: string;
  autoClose?: boolean;
  closeOnClick?: boolean;
  template?: string;
  click?: (e: Event, ui: AleritfyDialogUI) => {};
}

interface AleritfyDialogUI {
  dom: any;

  closeDialog(): void;

  centerDialog(): void;

  setMessage(message: string): void;

  setContent(content: string): void;

  getInputValue(): string | undefined;
}

interface AlertifyTemplates {
  dialogButtonsHolder?: string;
  dialogMessage?: string;
  dialogInput?: string;
  logMessage?: string;
}

interface Message {
  message?: string;
  width?: any;
  persistent?: Boolean | boolean;
  template?: AlertifyTemplates;
  value?: string;
  okBtn?: AlertifyBtn;
  cancelBtn?: AlertifyBtn;
  buttons?: AlertifyBtn[];
}

interface mCustomScrollbarOptions {
  setTop: number;
  setLeft: number;
  axis: string;
  scrollbarPosition: string;
  scrollInertia: number;
  autoDraggerLength: boolean;
  alwaysShowScrollbar: number;
  snapOffset: number;
  mouseWheel: {
    enable: true,
    scrollAmount: string,
    axis: string,
    deltaFactor: string,
    disableOver: string[]
  };
  scrollButtons: {
    scrollType: string,
    scrollAmount: string
  };
  keyboard: {
    enable: true,
    scrollType: string,
    scrollAmount: string
  };
  contentTouchScroll: number;
  documentTouchScroll: boolean;
  advanced: {
    autoScrollOnFocus: string,
    updateOnContentResize: boolean,
    updateOnImageLoad: string,
    autoUpdateTimeout: number
  };
  theme: string;
  callbacks: {
    onScrollStart: (this: mCustomScrollbar) => {};
    onScroll: (this: mCustomScrollbar) => {};
    whileScrolling: (this: mCustomScrollbar) => {};
    onTotalScrollOffset: number,
    onTotalScrollBackOffset: number,
    alwaysTriggerOffsets: boolean
  };
}

interface mCustomScrollbar extends JQuery {
  defaults: mCustomScrollbarOptions;
  totalInstances: number;
  liveTimers: any;
  oldIE: boolean;
  touchActive: boolean;
  touchable: any;
  classes: string[];
  yStartPosition: number;
  yStartTime: number;
  mcs: {
    content: any;
    top: number;
    left: number;
    draggerTop: number;
    draggerLeft: number;
    topPct: number;
    leftPct: number;
    direction: string;
  };

  (options: mCustomScrollbarOptions): JQuery;
}

interface KnockoutObservableViewer {
  type: KnockoutObservable<string>;
  isEditable: KnockoutObservable<boolean>;
  url: KnockoutObservable<string | null>;
  pureUrl: KnockoutObservable<any | null>;
  options: KnockoutObservable<any>;
  content: KnockoutObservable<any | null>;
  codeMirror: KnockoutObservable<any | null>;
}

declare class EventEmitter {
  on(event: string, callback: Function, ctx?: any): EventEmitter;

  once(event: string, callback: Function, ctx?: any): EventEmitter;

  emit(event: string, ...args: any[]): EventEmitter;

  off(event: string, callback?: Function): EventEmitter;
}

type ClipboardTrigger = String | string | HTMLElement | HTMLCollection | NodeList;

interface ClipboardOptions {
  action: any;
  target: any;
  text: any;
  container: any;
}

declare class Clipboard extends EventEmitter {
  constructor(trigger: ClipboardTrigger, options: ClipboardOptions);

  resolveOptions(options: ClipboardOptions): void;

  listenClick(trigger: ClipboardTrigger): void;

  onClick(e: Event): void;

  defaultAction(trigger: Element): string;

  defaultTarget(trigger: Element): Element;

  isSupported(action: string[]): boolean;

  defaultText(trigger: Element): string;

  destroy(): void;
}

declare class tinyMCEPopupClass {
  alert(t: string, cb: Function, s: any): void;

  close(): void;

  confirm(t: string, cb: Function, s: any): void;

  execCommand(cmd: string, ui: Boolean, val: any, a: any): void;

  executeOnLoad(s: string): void;

  getLang(n: string, dv: string): string;

  getParam(n: string, dv: string): string;

  getWin(): Window;

  getWindowArg(n: string, dv?: string): string;

  init(): void;

  openBrowser(element_id: string, type: string, option: string): void;

  pickColor(e: Event, element_id: string): void;

  requireLangPack(): void

  resizeToInnerSize(): void;

  restoreSelection(): void;

  storeSelection(): void;
}

declare const tinyMCEPopup: tinyMCEPopupClass;

declare function toast(...args: any[]): void;

declare function tmpl(str: string, data?: any): string;

interface tmpl {
  cache: { [key: string]: string };

  load(id: string): string;

  regexp: RegExp;

  func(s: string, p1?: string, p2?: string, p3?: string, p4?: string, p5?: string): string;

  encReg: RegExp;
  encMap: { [key: string]: string };

  encode(s: string): string;

  arg: string;
  helper: string;
}