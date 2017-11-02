interface Config {
	api?: {
		connectorUrl: boolean | string;
		lang: string;
		requestParams: {
            GET: any,
            POST: any,
            MIXED: any
        };
	};
	clipboard?: {
		encodeCopyUrl: boolean;
		enabled: boolean;
	};
	customScrollbar?: {
		button: boolean;
		enabled: boolean;
		theme: string;
	};
	editor?: {
		codeHighlight: boolean;
		enabled: boolean;
		extensions: string[];
		lineNumbers: boolean;
		lineWrapping: boolean;
		matchBrackets: boolean;
		theme: string;
	};
	extras?: {
		extra_js: any[];
		extra_js_async: boolean;
	};
	filetree?: {
		enabled: boolean;
		expandSpeed: number;
		foldersOnly: boolean;
		minWidth: number;
		reloadOnClick: boolean;
		showLine: boolean;
		width: number;
	};
	filter?: {
		[name: string]: string[];
	};
	language?: {
		available: string[];
        // noinspection ReservedWordAsName
        default: string;
	};
	manager?: {
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
	options ?: {
        allowChangeExtensions: false;
        allowFolderDownload: true;
        browseOnly: false;
        capabilities: string[]
        fileSorting: string;
        folderPosition: string;
        logger: false;
        quickSelect: false;
        searchBox: true;
        showConfirmation: true;
        showTitleAttr: false;
        theme: string;
	};
	security?: {
		extensions: {
			ignoreCase: boolean;
			policy: any;
			restrictions: any;
		}
		readOnly: boolean;
	};
	upload?: {
		chunkSize: boolean;
		fileSizeLimit: number;
		maxNumberOfFiles: number;
		multiple: boolean;
	};
	viewer?: {
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

interface ReadableObject {
    id?: string;
    type?: string
    attributes?: {
    	size?: number;
        name?: string;
        path?: string;
        readable?: boolean;
        writable?: boolean;
        width?: string | null;
        height?: string | null;
        capabilities?: any;
    }
}

interface ComputedDataObject {
    isFolder?: boolean;
    extension?: string | null;
    dimensions?: string | null;
    cssItemClass?: string;
    hiddenByType?: boolean;
    hiddenBySearch?: boolean;
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
    mouseWheel:{
        enable:true,
        scrollAmount: string,
        axis: string,
        deltaFactor: string,
        disableOver: string[]
    };
    scrollButtons:{
        scrollType: string,
        scrollAmount: string
    };
    keyboard:{
        enable:true,
        scrollType: string,
        scrollAmount: string
    };
    contentTouchScroll: number;
    documentTouchScroll: boolean;
    advanced:{
        autoScrollOnFocus: string,
        updateOnContentResize: boolean,
        updateOnImageLoad: string,
        autoUpdateTimeout: number
    };
    theme: string;
    callbacks:{
        onScrollStart: (this: mCustomScrollbar) => { };
        onScroll: (this: mCustomScrollbar) => { };
        whileScrolling: (this: mCustomScrollbar) => { };
        onTotalScrollOffset: number,
        onTotalScrollBackOffset: number,
        alwaysTriggerOffsets: boolean
    };
}

interface mCustomScrollbar {
    defaults: mCustomScrollbarOptions;
    totalInstances: number;
    liveTimers: any;
    oldIE: boolean;
    touchActive: boolean;
    touchable: any;
    classes: string[];
    yStartPosition: number;
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

interface JQuery {
	mCustomScrollbar: mCustomScrollbar;
	mCustomScrollbar: (method: 'update', el: any, cb?: any) => {};
    mCustomScrollbar: (method: 'scrollTo', options?: mCustomScrollbarOptions) => {};
    mCustomScrollbar: (method: 'stop') => {};
    mCustomScrollbar: (method: 'disable', r?: boolean) => {};
    mCustomScrollbar: (method: 'destroy') => {};

	fileupload: {
		(opts: any): JQuery;
	};

	inArrayInsensitive<T>(value: T, array: T[], fromIndex?: number): number;

	fileDownload(a: any): any;

	blueimp: any;

    splitter: any;
}

interface LazyLoad {
	(instanceSettings);
    handleScroll();
    update();
    destroy();
}

interface Alertify {
    parent(elem);
    reset();
    dialog(message, buttons);
    alert(message, okButton);
    confirm(message, okButton, cancelButton);
    prompt(message, defaultValue, okButton, cancelButton);
    log(message, click);
    success(message, click);
    warning(message, click);
    error(message, click);
    dialogWidth(width);
    dialogPersistent(bool);
    dialogContainerClass(str);
    logDelay(time);
    logMaxItems(num);
    logPosition(str);
    logContainerClass(str);
    logMessageTemplate(templateMethod);
    theme(theme);
    clearDialogs();
    clearLogs();
}

interface AlertifyBtn {
    type?: string;
    label?: string;
    autoClose?: boolean;
    closeOnClick?: boolean;
    template?: string;
    click?: (e, ui: AleritfyDialogUI) => {};
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
	persistent?: boolean;
	template?: AlertifyTemplates;
	message?: string;
	value?: string;
	okBtn?: AlertifyBtn;
	cancelBtn?: AlertifyBtn;
	buttons?: AlertifyBtn[];
}

interface Settings {
    baseUrl: string;
    config: Config;
    callbacks: any;
}

interface Editor {
    interactive: boolean;
}

interface Viewer {
    type?: string;
    isEditable?: boolean;
    url?: string | null;
    pureUrl?: any;
    options?: {
    	width?: number;
    	height?: number;
        is_writable?: boolean;
	};
    content?: any;
    codeMirror?: any;
}

interface KnockoutObservableViewer {
    type?: KnockoutObservable;
    isEditable?: KnockoutObservable;
    url?: KnockoutObservable;
    pureUrl?: KnockoutObservable;
    options?: KnockoutObservable;
    content?: KnockoutObservable;
    codeMirror?: KnockoutObservable;
}

interface TreeData {
    id: any;
    level: KnockoutObservable<number>;
    children: KnockoutObservableArray;
}

declare class Clipboard {
    constructor(elm, opts?);

    destroy();

    on: (a, b) => Clipboard;
}

declare function tmpl(t: string, data: any): string;

declare function toast();

declare const hljs: any;
declare const tinyMCEPopup: any;
declare const alertify: Alertify;
declare const $: JQueryStatic;

////////////////////////

// Test if a given url exists
function file_exists(url) {
    return $.ajax({
        type: 'HEAD',
        url: url
    });
}

function expandNode(node): boolean {
    if (node.isExpanded() === false && node.isLoaded() === true) {
        node.isSliding(true);
        return true;
    }
    return false;
}

function collapseNode(node): boolean {
    if (node.isExpanded() === true) {
        node.isSliding(true);
        return true;
    }
    return false;
}

// Test if path is dir
function isFile(path) {
    return path.charAt(path.length - 1) !== '/';
}

// Replace all leading or trailing chars with an empty string
function trim(string, char) {
    let regExp = new RegExp(`^${char}+|${char}+$`, 'g');

    return string.replace(regExp, '');
}

// Replace all leading chars with an empty string
function ltrim(string, char) {
    let regExp = new RegExp(`^${char}+`, 'g');

    return string.replace(regExp, '');
}

// Replace all trailing chars with an empty string
function rtrim(string, char) {
    let regExp = new RegExp(`${char}+$`, 'g');

    return string.replace(regExp, '');
}

function startsWith(string: String, searchString, position?) {
    position = position || 0;
    return string.substr(position, searchString.length) === searchString;
}

// invert backslashes and remove duplicated ones
function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}

// return filename extension
function getExtension(filename) {
    if (filename.split('.').length === 1)
        return '';

    return filename.split('.').pop().toLowerCase();
}

// return filename without extension
function getFilename(filename) {
    if (filename.lastIndexOf('.') !== -1)
        return filename.substring(0, filename.lastIndexOf('.'));
    else
        return filename;

}

// return path without filename
// "/dir/to/" 		  --> "/dir/to/"
// "/dir/to/file.txt" --> "/dir/to/"
function getDirname(path) {
    if (path.lastIndexOf('/') !== path.length - 1)
        return path.substr(0, path.lastIndexOf('/') + 1);
    else
        return path;

}

// return parent folder for path, if folder is passed it should ends with '/'
// "/dir/to/"          -->  "/dir/"
// "/dir/to/file.txt"  -->  "/dir/"
function getParentDirname(path) {
    return path.split('/').reverse().slice(2).reverse().join('/') + '/';
}

// return closest node for path
// "/dir/to/"          -->  "/dir/"
// "/dir/to/file.txt"  -->  "/dir/to/"
function getClosestNode(path) {
    return path.substring(0, path.slice(0, -1).lastIndexOf('/')) + '/';
}

// Clears browser window selection
function clearSelection() {
    if ((<any>document).selection && (<any>document).selection.empty)
        (<any>document).selection.empty();
    else if (window.getSelection) {
        let sel = window.getSelection();

        sel.removeAllRanges();
    }
}

function write(message, obj?) {
    let log = alertify;
    let options: any = $.extend({}, {
        reset: true,
        delay: 5000,
        logMaxItems: 5,
        logPosition: 'bottom right',
        logContainerClass: 'fm-log',
        parent: $('.fm-popup').is(':visible') ? document.body : this.$fileinfo[0],
        onClick: undefined,
        unique: false,
        type: 'log'
    }, obj);

    // display only one log for the specified 'logClass'
    if (options.logClass && options.unique && $('.fm-log').children('.' + options.logClass).length > 0)
        return log;

    if (options.reset)
        log.reset();

    if (options.parent)
        log.parent(options.parent);

    log.logDelay(options.delay);
    log.logMaxItems(options.logMaxItems);
    log.logPosition(options.logPosition);
    log.logContainerClass(options.logContainerClass);
    log[options.type](message, options.onClick);

    return log;
}

function error(message, options?) {
    return write(message, $.extend({}, {
        type: 'error',
        delay: 10000
    }, options));
}

function warning(message, options?) {
    return write(message, $.extend({}, {
        type: 'warning',
        delay: 10000
    }, options));
}

function success(message, options?) {
    return write(message, $.extend({}, {
        type: 'success',
        delay: 6000
    }, options));
}

function alert(message) {
    alertify
        .reset()
        .dialogContainerClass('fm-popup')
        .alert(message);
}

function confirm(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width)
        .dialogPersistent(obj.persistent)
        .dialogContainerClass('fm-popup')
        .confirm(obj.message, obj.okBtn, obj.cancelBtn);
}

function prompt(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width) // dialogWidth
        .dialogPersistent(obj.persistent) // dialogPersistent
        .dialogContainerClass('fm-popup')
        .theme(obj.template)
        .prompt(obj.message, obj.value || '', obj.okBtn, obj.cancelBtn);
}

function dialog(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width)
        .dialogPersistent(obj.persistent)
        .dialogContainerClass('fm-popup')
        .dialog(obj.message, obj.buttons);
}

// Wrapper for translate method
function lg(key: string): string {
    return LangModel.translate(key);
}
// Converts bytes to KB, MB, or GB as needed for display
function formatBytes(bytes: number | string, round?): string {
    if(!bytes) return '';
    round = round || false;
    let n = parseFloat(<string>bytes);
    let d = parseFloat(<string>(round ? 1000 : 1024));
    let c = 0;
    let u = [ lg('unit_bytes'), lg('unit_kb'), lg('unit_mb'), lg('unit_gb') ];

    while(true) {
        if(n < d) {
            n = Math.round(n * 100) / 100;
            return n + ' ' + u[ c ];
        } else {
            n /= d;
            c += 1;
        }
    }
}

function log() {
    if(config.options.logger && arguments) {
        [].unshift.call(arguments, new Date().getTime());
        console.log.apply(this, arguments);
    }
}


// Format server-side response single error object
function formatServerError(errorObject: any) {
    let message;
    // look for message in case an error CODE is provided
    if(LangModel.getLang() && lg(errorObject.message)) {
        message = lg(errorObject.message);
        $.each(errorObject.arguments, (i, argument) => {
            message = message.replace('%s', argument);
        });
    } else
        message = errorObject.message;

    return message;
}

// Handle ajax request error.
function handleAjaxError(response) {

    log(response.responseText || response);
    error(lg('ERROR_SERVER'));
    error(response.responseText);
}

// Handle ajax json response error.
function handleAjaxResponseErrors(response) {
    if(response.errors) {
        log(response.errors);
        $.each(response.errors, (i, errorObject) => {
            error(this.formatServerError(errorObject));

            if(errorObject.arguments.redirect)
                window.location.href = errorObject.arguments.redirect;

        });
    }
}

// Test if file is authorized, based on extension only
function isAuthorizedFile(filename) {
    let ext = getExtension(filename);

    if(config.security.extensions.ignoreCase) {
        if(config.security.extensions.policy == 'ALLOW_LIST')
            if((<JQuery>$).inArrayInsensitive(ext, config.security.extensions.restrictions) !== -1) return true;

        if(config.security.extensions.policy == 'DISALLOW_LIST')
            if((<JQuery>$).inArrayInsensitive(ext, config.security.extensions.restrictions) === -1) return true;

    } else {
        if(config.security.extensions.policy == 'ALLOW_LIST')
            if($.inArray(ext, config.security.extensions.restrictions) !== -1) return true;

        if(config.security.extensions.policy == 'DISALLOW_LIST')
            if($.inArray(ext, config.security.extensions.restrictions) === -1) return true;

    }

    return false;
}

function encodePath(path) {
    let parts = [];
    $.each(path.split('/'), (i, part) => {
        parts.push(encodeURIComponent(part));
    });
    return parts.join('/');
}

// Test if is editable file
function isEditableFile(filename) {
    return ($.inArray(getExtension(filename), config.editor.extensions) !== -1);
}

// Test if is image file
function isImageFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.image.extensions) !== -1);
}

// Test if file is supported web video file
function isVideoFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.video.extensions) !== -1);
}

// Test if file is supported web audio file
function isAudioFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.audio.extensions) !== -1);
}

// Test if file is openable in iframe
function isIFrameFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.iframe.extensions) !== -1);
}

// Test if file is opendoc file
// Supported file types: http://viewerjs.org/examples/
function isOpenDocFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.opendoc.extensions) !== -1);
}

// Test if file is supported by Google Docs viewer
// Supported file types: http://stackoverflow.com/q/24325363/1789808
function isGoogleDocsFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.google.extensions) !== -1);
}

// Test if file is supported by CodeMirror renderer
function isCodeMirrorFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.codeMirrorRenderer.extensions) !== -1);
}

// Test if file is supported by Markdown-it renderer, which renders .md files to HTML
function isMarkdownFile(filename) {
    return ($.inArray(getExtension(filename), config.viewer.markdownRenderer.extensions) !== -1);
}

///////////////////////

/**
 * Plugin's default options
 */
const defaults: Settings = {
	baseUrl: '.',	// relative path to the FM plugin folder
	config: {},		// configuration options
	callbacks: {
		beforeCreateImageUrl: (resourceObject, url) => url,
		beforeCreatePreviewUrl: (resourceObject, url) => url,
		beforeSelectItem: (resourceObject, url) => url,
		afterSelectItem: (/*resourceObject, url, contextWindow*/) => { }
	}
};

/**
 * Language model
 * @constructor
 */
namespace LangModel {
	export let currentLang: string = null;
	export let translationsHash = {};
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
		return currentLang;
	}

	export function setTranslations(json) {
		translationsHash = json;
	}

	export function getTranslations() {
		return translationsHash;
	}

	export function translate(key: string): string {
		return translationsHash[ key ];
	}
}

let config: Config;

class PreviewModel {
	// let preview_model: PreviewModel = this;
	// let clipboard: Clipboard = null;

	rdo: KnockoutObservable<ReadableObject>;
	cdo: KnockoutObservable<ComputedDataObject>;
	viewer: KnockoutObservableViewer;
	renderer: RenderModel;
	editor: EditorModel;
	previewIconClass: KnockoutComputed;

	constructor(private rfp: richFilemanagerPlugin) {
		this.rdo = ko.observable({});
		// computed resource data object
		this.cdo = ko.observable({});

		this.viewer = {
			type: ko.observable('default'),
			isEditable: ko.observable(false),
			url: ko.observable(null),
			pureUrl: ko.observable(null),
			options: ko.observable({}),
			content: ko.observable(null),
			codeMirror: ko.observable(null)
		};

		this.renderer = new RenderModel(rfp);
		this.editor = new EditorModel(rfp);

		this.rdo.subscribe(resourceObject => {
            this.cdo({
				isFolder: (resourceObject.type === 'folder'),
				sizeFormatted: formatBytes(resourceObject.attributes.size),
				extension: (resourceObject.type === 'file') ? getExtension(resourceObject.id) : null,
				dimensions: resourceObject.attributes.width ? resourceObject.attributes.width + 'x' + resourceObject.attributes.height : null
			});
		});

		this.editor.content.subscribe(content => {
			// instantly render changes of editor content
			if(this.editor.isInteractive())
				this.renderer.render(content);
		});

		this.previewIconClass = ko.pureComputed((): string => {
			let cssClass: string[] = [];
			let extraClass: string[] = [ 'ico' ];

			if(this.viewer.type() === 'default' || !this.viewer.url()) {
				cssClass.push('grid-icon');

				if(this.cdo().isFolder === true) {
					cssClass.push('ico_folder');
					extraClass.push('folder');

					if(!this.rdo().attributes.readable)
						extraClass.push('lock');
				} else {
					cssClass.push('ico_file');

					if(this.rdo().attributes.readable)
						extraClass.push('ext', this.cdo().extension);
					else
						extraClass.push('file', 'lock');
				}

				cssClass.push(extraClass.join('_'));
			}

			return cssClass.join(' ');
		});
	}


	applyObject(resourceObject: ReadableObject) {
		let preview_model = this;
		let settings = this.rfp.settings;
        let createCopyUrl = this.rfp.createCopyUrl;
        let createImageUrl = this.rfp.createImageUrl;
        let createPreviewUrl = this.rfp.createPreviewUrl;
        let previewItem = this.rfp.previewItem;
        let previewFile = this.rfp.fmModel.previewFile;

		if(clipboard)
			clipboard.destroy();

		previewFile(false);

		let filename: string = resourceObject.attributes.name;
		let editorObject: Editor = {
			interactive: false
		};
		let viewerObject: Viewer = {
			type: 'default',
			url: null,
			options: {}
		};

		preview_model.rdo(resourceObject);

		if(isImageFile(filename)) {
			viewerObject.type = 'image';
			viewerObject.url = createImageUrl(resourceObject, false, true);
		}

		if(isAudioFile(filename) && config.viewer.audio.enabled === true) {
			viewerObject.type = 'audio';
			viewerObject.url = createPreviewUrl(resourceObject, true);
		}

		if(isVideoFile(filename) && config.viewer.video.enabled === true) {
			viewerObject.type = 'video';
			viewerObject.url = createPreviewUrl(resourceObject, true);
			viewerObject.options = {
				width: config.viewer.video.playerWidth,
				height: config.viewer.video.playerHeight
			};
		}

		if(isOpenDocFile(filename) && config.viewer.opendoc.enabled === true) {
			viewerObject.type = 'opendoc';
			viewerObject.url = `${settings.baseUrl}/scripts/ViewerJS/index.html#${createPreviewUrl(resourceObject, true)}`;
			viewerObject.options = {
				width: config.viewer.opendoc.readerWidth,
				height: config.viewer.opendoc.readerHeight
			};
		}

		if(isGoogleDocsFile(filename) && config.viewer.google.enabled === true) {
			viewerObject.type = 'google';
			viewerObject.url = `https://docs.google.com/viewer?url=${encodeURIComponent(createPreviewUrl(resourceObject, false))}&embedded=true`;
			viewerObject.options = {
				width: config.viewer.google.readerWidth,
				height: config.viewer.google.readerHeight
			};
		}

		if(isIFrameFile(filename) && config.viewer.iframe.enabled === true) {
			viewerObject.type = 'iframe';
			viewerObject.url = createPreviewUrl(resourceObject, true);
			viewerObject.options = {
				width: config.viewer.iframe.readerWidth,
				height: config.viewer.iframe.readerHeight
			};
		}

		if((isCodeMirrorFile(filename) && config.viewer.codeMirrorRenderer.enabled === true) ||
			(isMarkdownFile(filename) && config.viewer.markdownRenderer.enabled === true)
		) {
			viewerObject.type = 'renderer';
			viewerObject.options = {
				is_writable: resourceObject.attributes.writable
			};
			preview_model.renderer.setRenderer(resourceObject);
			editorObject.interactive = preview_model.renderer.renderer().interactive;
		}

		preview_model.viewer.type(viewerObject.type);
		preview_model.viewer.url(viewerObject.url);
		preview_model.viewer.options(viewerObject.options);
		preview_model.viewer.pureUrl(createCopyUrl(resourceObject));
		preview_model.viewer.isEditable(isEditableFile(filename) && config.editor.enabled === true);
		preview_model.editor.isInteractive(editorObject.interactive);

		if(viewerObject.type === 'renderer' || preview_model.viewer.isEditable()) {
			previewItem(resourceObject).then(function (response) {
				if(response.data) {
					let content = response.data.attributes.content;

					preview_model.viewer.content(content);
					previewFile(true);
				}
			});
		} else
			previewFile(true);

	};

	afterRender() {
		let preview_model = this;
		let $previewWrapper = this.rfp.$previewWrapper;

		preview_model.renderer.render(preview_model.viewer.content());

		let copyBtnEl = $previewWrapper.find('.btn-copy-url')[ 0 ];

		clipboard = new Clipboard(copyBtnEl);

		clipboard.on('success', (/*e*/) => {
			success(lg('copied'));
		});
	}

	initiateEditor(/*elements*/) {
		let preview_model = this;
        let $previewWrapper = this.rfp.$previewWrapper;

		let textarea = $previewWrapper.find('.fm-cm-editor-content')[ 0 ];

		preview_model.editor.createInstance(preview_model.cdo().extension, textarea, {
			readOnly: false,
			styleActiveLine: true
		});
	}

	// fires specific action by clicking toolbar buttons in detail view
	bindToolbar(action) {
		let preview_model = this;
        let has_capability = this.rfp.has_capability;
        let performAction = this.rfp.performAction;

		if(has_capability(preview_model.rdo(), action)) {
			performAction(action, {}, preview_model.rdo());
		}
	}

	editFile() {
		let preview_model = this;
		let content = preview_model.viewer.content();

		preview_model.renderer.render(content);
		preview_model.editor.render(content);
	}

	saveFile() {
		let preview_model = this;
        let saveItem = this.rfp.saveItem;

		saveItem(preview_model.rdo());
	}

	closeEditor() {
		let preview_model = this;
		preview_model.editor.enabled(false);
		// re-render viewer content
		preview_model.renderer.render(preview_model.viewer.content());
	}

	buttonVisibility(action) {
		let preview_model = this;
        let has_capability = this.rfp.has_capability;
        let hasContext = this.rfp.hasContext;

		switch(action) {
			case 'select':
				return (has_capability(preview_model.rdo(), action) && hasContext());
			case 'move':
			case 'rename':
			case 'delete':
			case 'download':
				return (has_capability(preview_model.rdo(), action));
		}
	}
}
///
class TreeModel {
	// let tree_model: TreeModel = this;

    selectedNode;
    treeData;
    fullexpandedFolder; // todo: find where this came from

	constructor(private rfp: richFilemanagerPlugin) {
		let fileRoot = rfp.fileRoot;
        let tree_model: TreeModel = this;

        this.selectedNode = ko.observable(null);

        this.treeData = {
            id: fileRoot,
            level: ko.observable(-1),
            children: ko.observableArray([])
        };

        this.treeData.children.subscribe((/*value*/) => {
            tree_model.arrangeNode(tree_model.treeData);
        });
	}

	expandFolderDefault(parentNode) {
        let tree_model: TreeModel = this;

		if(this.fullexpandedFolder !== null) {
			if(!parentNode)
				parentNode = tree_model.treeData;

			// looking for node that starts with specified path
			let node = tree_model.findByFilter(node => (this.fullexpandedFolder.indexOf(node.id) === 0), parentNode);

			if(node) {
				config.filetree.expandSpeed = 10;
				tree_model.loadNodes(node, false);
			} else {
				this.fullexpandedFolder = null;
				config.filetree.expandSpeed = 200;
			}
		}
	}

	mapNodes(filter, contextNode?) {
        let tree_model: TreeModel = this;

		if(!contextNode)
			contextNode = tree_model.treeData;

		// don't apply callback function to the treeData root node
		if(contextNode.id !== tree_model.treeData.id)
			filter.call(this, contextNode);

		let nodes = contextNode.children();

		if(!nodes || nodes.length === 0)
			return null;

		for(let i = 0, l = nodes.length; i < l; i++) {
			filter.call(this, nodes[ i ]);
			tree_model.findByFilter(filter, nodes[ i ]);
		}
	}

	findByParam(key, value, contextNode?) {
        let tree_model: TreeModel = this;

		if(!contextNode) {
			contextNode = tree_model.treeData;
			if(contextNode[ key ] === value)
				return contextNode;

		}
		let nodes = contextNode.children();

		if(!nodes || nodes.length === 0)
			return null;

		for(let i = 0, l = nodes.length; i < l; i++) {
			if(nodes[ i ][ key ] === value)
				return nodes[ i ];

			let result = tree_model.findByParam(key, value, nodes[ i ]);

			if(result)
				return result;
		}
		return null;
	}

	findByFilter(filter, contextNode) {
        let tree_model: TreeModel = this;

		if(!contextNode) {
			contextNode = tree_model.treeData;
			if(filter(contextNode))
				return contextNode;

		}
		let nodes = contextNode.children();

		if(!nodes || nodes.length === 0)
			return null;

		for(let i = 0, l = nodes.length; i < l; i++) {
			if(filter(nodes[ i ]))
				return nodes[ i ];

			let result = tree_model.findByFilter(filter, nodes[ i ]);

			if(result)
				return result;
		}
		return null;
	}

	getSelected() {
        let tree_model: TreeModel = this;

		let selectedItems = [];

		if(tree_model.selectedNode())
			selectedItems.push(tree_model.selectedNode());

		return selectedItems;
	}

	loadNodes(targetNode, refresh) {
        let tree_model: TreeModel = this;
		let path = targetNode ? targetNode.id : tree_model.treeData.id;
		let buildAjaxRequest = this.rfp.buildAjaxRequest;
		let expandFolderDefault = this.expandFolderDefault;

		if(targetNode)
			targetNode.isLoaded(false);

		let queryParams = {
			mode: 'getfolder',
			path: path
		};

		buildAjaxRequest('GET', queryParams).done(response => {
			if(response.data) {
				let nodes = [];
				$.each(response.data, (i, resourceObject) => {
					let nodeObject = tree_model.createNode(resourceObject);

					nodes.push(nodeObject);
				});
				if(refresh)
					targetNode.children([]);

				tree_model.addNodes(targetNode, nodes);
				// not root
				if(targetNode) {
					targetNode.isLoaded(true);
					expandNode(targetNode);
				}
				expandFolderDefault(targetNode);
			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	createNode(resourceObject) {
		let node: TreeNodeModel = new TreeNodeModel(this.rfp, resourceObject);
        let fmModel = this.rfp.fmModel;

		fmModel.filterModel.filterItem(node);
		return node;
	}

	addNodes(targetNode: TreeData, newNodes) {
        let tree_model: TreeModel = this;
        let sortItems = this.rfp.sortItems;

		if(!Array.isArray(newNodes))
			newNodes = [ newNodes ];

		if(!targetNode)
			targetNode = tree_model.treeData;

		// list only folders in tree
		if(config.filetree.foldersOnly)
			newNodes = $.grep(newNodes, node => (node.cdo.isFolder));

		$.each(newNodes, (i, node) => {
			node.parentNode(targetNode);
		});
		let allNodes = targetNode.children().concat(newNodes);

		targetNode.children(sortItems(allNodes));
	}

	toggleNode(node): void {
		if(!collapseNode(node))
			expandNode(node);
	}

	arrangeNode(node): void {
		let childrenLength = node.children().length;

		$.each(node.children(), (index, cNode) => {
			cNode.level(node.level() + 1);
			cNode.isFirstNode(index === 0);
			cNode.isLastNode(index === (childrenLength - 1));
		});
	}

	nodeRendered(elements, node): void {
		let getContextMenuItems = this.rfp.getContextMenuItems;
		let performAction = this.rfp.performAction;
		let model = this.rfp.fmModel;

		// attach context menu
		$(elements[ 1 ]).contextMenu({
			selector: '.file, .directory',
			zIndex: 100,
			// wrap options with "build" allows to get item element
			build: (/*$triggerElement, e*/) => {
				node.selected(true);

				return {
					appendTo: '.fm-container',
					items: getContextMenuItems(node.rdo),
					callback: (itemKey, options) => {
						performAction(itemKey, options, node.rdo, model.fetchSelectedObjects(node));
					}
				}
			}
		});
	}

	actualizeNodeObject(node, oldFolder, newFolder) {
        let tree_model: TreeModel = this;
		let search = new RegExp('^' + oldFolder);
		let oldPath = node.rdo.id;
		let newPath = oldPath.replace(search, newFolder);

		node.id = newPath;
		node.rdo.id = newPath;
		node.rdo.attributes.path = node.rdo.attributes.path.replace(new RegExp(oldPath + '$'), newPath);

		if(node.children().length) {
			$.each(node.children(), function (index, cNode) {
				tree_model.actualizeNodeObject(cNode, oldFolder, newFolder);
			});
		}
	}
}

class TreeNodeModel {
	// let tree_node = this;

    id: string;
    rdo: ReadableObject;
    cdo: ComputedDataObject;
    visible: KnockoutObservable<boolean>;
    nodeTitle: KnockoutObservable<string>;
    children: KnockoutObservableArray<any[]>;
    parentNode;
    isSliding: KnockoutObservable<boolean>;
    isLoading: KnockoutObservable<boolean>;
    isLoaded: KnockoutObservable<boolean>;
    isExpanded: KnockoutObservable<boolean>;
    selected: KnockoutObservable<boolean>;
    dragHovered: KnockoutObservable<boolean>;
    level: KnockoutObservable<number>;
    isFirstNode: KnockoutObservable<boolean>;
    isLastNode: KnockoutObservable<boolean>;
    title;
    itemClass;
    iconClass;
    switcherClass;
    clusterClass;

	constructor(private rfp: richFilemanagerPlugin, resourceObject) {
		let model = rfp.fmModel;
        let tree_node = this;

        this.id = resourceObject.id;
        this.rdo = resourceObject;
        this.cdo = { // computed data object
            isFolder: (resourceObject.type === 'folder'),
            extension: (resourceObject.type === 'file') ? getExtension(resourceObject.id) : null,
            dimensions: resourceObject.attributes.width ? resourceObject.attributes.width + 'x' + resourceObject.attributes.height : null,
            cssItemClass: (resourceObject.type === 'folder') ? 'directory' : 'file',
            hiddenByType: false,
            hiddenBySearch: false
        };

        this.visible = ko.observable(true);
        this.nodeTitle = ko.observable(resourceObject.attributes.name);
        this.children = ko.observableArray([]);
        this.parentNode = ko.observable(null);
        this.isSliding = ko.observable(false);
        this.isLoading = ko.observable(false);
        this.isLoaded = ko.observable(false);
        this.isExpanded = ko.observable(false);
        this.selected = ko.observable(false);
        this.dragHovered = ko.observable(false);
        // arrangable properties
        this.level = ko.observable(0);
        this.isFirstNode = ko.observable(false);
        this.isLastNode = ko.observable(false);

        this.nodeTitle.subscribe((value: string) => {
            tree_node.rdo.attributes.name = value;
        });

        this.children.subscribe((/*value*/) => {
            model.treeModel.arrangeNode(tree_node);
        });

        this.isLoaded.subscribe((value: boolean) => {
            tree_node.isLoading(!value);
        });

        this.selected.subscribe(value => {
            if(value) {
                if(model.treeModel.selectedNode() !== null)
                    model.treeModel.selectedNode().selected(false);

                model.treeModel.selectedNode(tree_node);
                model.itemsModel.unselectItems();
            } else
                model.treeModel.selectedNode(null);

        });
        this.title = ko.pureComputed(() => {
            return (config.options.showTitleAttr) ? this.rdo.id : null;
        });

        this.itemClass = ko.pureComputed(() => {
            let cssClass = [];

            if(this.selected() && config.manager.selection.enabled)
                cssClass.push('ui-selected');

            if(this.dragHovered())
                cssClass.push(model.ddModel.hoveredCssClass);

            return cssClass.join(' ');
        });

        this.iconClass = ko.pureComputed(() => {
            let cssClass;
            let extraClass = [ 'ico' ];

            if(this.cdo.isFolder === true) {
                cssClass = 'ico_folder';
                if(this.isLoading() === true)
                    extraClass.push('loading');
                else {
                    extraClass.push('folder');
                    if(!this.rdo.attributes.readable)
                        extraClass.push('lock');
                    else if(this.isExpanded() || !this.isExpanded() && this.isSliding())
                        extraClass.push('open');
                }
            } else {
                cssClass = 'ico_file';
                if(this.rdo.attributes.readable)
                    extraClass.push('ext', this.cdo.extension);
                else
                    extraClass.push('file', 'lock');

            }
            return `${cssClass} ${extraClass.join('_')}`;
        });

        this.switcherClass = ko.pureComputed(() => {
            let cssClass = [];

            if(config.filetree.showLine) {
                if(this.level() === 0 && this.isFirstNode() && this.isLastNode())
                    cssClass.push('root');
                else if(this.level() === 0 && this.isFirstNode())
                    cssClass.push('roots');
                else if(this.isLastNode())
                    cssClass.push('bottom');
                else
                    cssClass.push('center');

            } else
                cssClass.push('noline');

            if(this.cdo.isFolder) {
                let isOpen = (this.isExpanded() || !this.isExpanded() && this.isSliding());

                cssClass.push(isOpen ? 'open' : 'close');
            } else
                cssClass.push('docu');

            return cssClass.join('_');
        });

        this.clusterClass = <KnockoutObservable>ko.pureComputed(() => (config.filetree.showLine && !this.isLastNode()) ? 'line' : '');
	}


	switchNode(node) {
        let tree_node = this;
        let model = this.rfp.fmModel;

		if(!node.cdo.isFolder)
			return false;

		if(!node.rdo.attributes.readable) {
			error(lg('NOT_ALLOWED_SYSTEM'));
			return false;
		}
		if(!node.isLoaded())
			tree_node.openNode(node);
		else
			model.treeModel.toggleNode(node);

	}

    // noinspection JSMethodCanBeStatic
	mouseDown(node/*, e*/) {
		node.selected(true);
	}

	nodeClick(node/*, e*/) {
        let tree_node = this;

		if(!config.manager.dblClickOpen)
			tree_node.openNode(node);

	}

	nodeDblClick(node/*, e*/) {
        let tree_node = this;

		if(config.manager.dblClickOpen)
			tree_node.openNode(node);

	}

	openNode(node/*, e?*/) {
        let model = this.rfp.fmModel;
        let fmModel = this.rfp.fmModel;
        let getDetailView = this.rfp.getDetailView;

		if(node.rdo.type === 'file')
			getDetailView(node.rdo);

		if(node.rdo.type === 'folder') {
			if(!node.isLoaded() || (node.isExpanded() && config.filetree.reloadOnClick)) {
				model.treeModel.loadNodes(node, true);
				getDetailView(node.rdo);
			} else {
				model.treeModel.toggleNode(node);

				fmModel.currentPath(node.id);
				fmModel.breadcrumbsModel.splitCurrent();
				let dataObjects = [];
				$.each(node.children(), (i, cnode) => {
					dataObjects.push(cnode.rdo);
				});
				model.itemsModel.setList(dataObjects);
			}
		}
	}

	remove() {
        let tree_node = this;

		tree_node.parentNode().children.remove(tree_node);
	}

	isRoot() {
        let tree_node = this;
        let model = this.rfp.fmModel;

		return tree_node.level() === model.treeModel.treeData.id;
	}

}

class ItemsModel {
	// let items_model: ItemsModel = this;
    objects;
    objectsSize;
    objectsNumber;
    selectedNumber;
    listSortField;
    listSortOrder;
    isSelecting;
    continiousSelection;
    descriptivePanel;
    lazyLoad: LazyLoad;

	constructor(private rfp: richFilemanagerPlugin) {
        let items_model: ItemsModel = this;
        let model = rfp.fmModel;
        let configSortField = rfp.configSortField;
        let configSortOrder = rfp.configSortOrder;

        this.objects = <KnockoutObservable>ko.observableArray([]);
        this.objectsSize = <KnockoutObservable>ko.observable(0);
        this.objectsNumber = <KnockoutObservable>ko.observable(0);
        this.selectedNumber = <KnockoutObservable>ko.observable(0);
        this.listSortField = <KnockoutObservable>ko.observable(configSortField);
        this.listSortOrder = <KnockoutObservable>ko.observable(configSortOrder);
        this.isSelecting = <KnockoutObservable>ko.observable(false);
        this.continiousSelection = <KnockoutObservable>ko.observable(false);
        this.descriptivePanel = <RenderModel>new RenderModel(rfp);
        this.lazyLoad = null;

        this.isSelecting.subscribe(state => {
            if(!state) {
                // means selection lasso has been dropped
                items_model.continiousSelection(false);
            }
        });
        this.objects.subscribe(items => {
            let totalNumber = 0;
            let totalSize = 0;

            $.each(items, (i, item) => {
                if(item.rdo.type !== 'parent')
                    totalNumber++;

                if(item.rdo.type === 'file')
                    totalSize += Number(item.rdo.attributes.size);

            });
            // updates folder summary info
            items_model.objectsNumber(totalNumber);
            items_model.objectsSize(formatBytes(totalSize));

            // update
            if(items_model.lazyLoad) {
                setTimeout(() => {
                    items_model.lazyLoad.update();
                }, 50);
            }

            // context menu
            rfp.$viewItems.contextMenu({
                selector: '.file, .directory',
                zIndex: 100,
                // wrap options with "build" allows to get item element
                build: ($triggerElement/*, e*/) => {
                    let koItem = ko.dataFor($triggerElement[ 0 ]);

                    if(!koItem.selected()) {
                        model.itemsModel.unselectItems(false);
                        koItem.selected(true);
                    }

                    return {
                        appendTo: '.fm-container',
                        items: rfp.getContextMenuItems(koItem.rdo),
                        callback: (itemKey, options) => {
                            rfp.performAction(itemKey, options, koItem.rdo, model.fetchSelectedObjects(koItem));
                        }
                    }
                }
            });
        });

    }

	createObject(resourceObject) {
		let fmModel = this.rfp.fmModel;

		let item: ItemObject = new ItemObject(this.rfp, resourceObject);

		fmModel.filterModel.filterItem(item);
		return item;
	}

	addNew(dataObjects) {
        let model = this.rfp.fmModel;
        let rfp = this.rfp;
        let items_model: ItemsModel = this;

		// use underlying array for better performance
		// http://www.knockmeout.net/2012/04/knockoutjs-performance-gotcha.html
		let items = model.itemsModel.objects();

		if(!Array.isArray(dataObjects))
			dataObjects = [ dataObjects ];

		$.each(dataObjects, (i, resourceObject) => {
			items.push(items_model.createObject(resourceObject));
		});

		items = rfp.sortItems(items);
		model.itemsModel.objects.valueHasMutated();
	}

	loadList(path) {
        let model = this.rfp.fmModel;
        let rfp = this.rfp;
        let _url_ = this.rfp._url_;

		model.loadingView(true);

		let queryParams = {
			mode: 'getfolder',
			path: path,
			type: undefined
		};
		if(_url_.param('type'))
			queryParams.type = _url_.param('type');

		rfp.buildAjaxRequest('GET', queryParams).done(response => {
			if(response.data) {
				model.currentPath(path);
				model.breadcrumbsModel.splitCurrent();
				model.itemsModel.setList(response.data);

				if(model.itemsModel.lazyLoad)
					model.itemsModel.lazyLoad.update();

			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	setList(dataObjects) {
        let model = this.rfp.fmModel;
        let rfp = this.rfp;
        let items_model: ItemsModel = this;
		let objects = [];

		// add parent folder object
		if(!isFile(model.currentPath()) && model.currentPath() !== rfp.fileRoot) {
			let parentPath = getParentDirname(model.currentPath());
			let parentItem = {
				id: parentPath,
				rdo: {
					id: parentPath,
					type: 'parent',
					attributes: {
						readable: true,
						writable: true
					}
				},
				dragHovered: ko.observable(false),
				open: undefined,
				itemClass: undefined
			};

			parentItem.open = (item, e) => {
				if(model.isItemOpenable(e))
					items_model.loadList(parentItem.id);

			};

			parentItem.itemClass = ko.pureComputed(() => {
				let cssClass = [];

				if(parentItem.dragHovered())
					cssClass.push(model.ddModel.hoveredCssClass);

				return cssClass.join(' ');
			});

			objects.push(parentItem);
		}

		// clear previously rendered content
		items_model.descriptivePanel.content(null);

		$.each(dataObjects, (i, resourceObject) => {
			if(config.manager.renderer.position && typeof config.manager.renderer.indexFile === 'string' &&
				resourceObject.attributes.name.toLowerCase() === config.manager.renderer.indexFile.toLowerCase()
			) {
				items_model.descriptivePanel.setRenderer(resourceObject);

				// load and render index file content
				rfp.previewItem(items_model.descriptivePanel.rdo()).then(response => {
					if(response.data)
						items_model.descriptivePanel.render(response.data.attributes.content);
				});
			}
			objects.push(items_model.createObject(resourceObject));
		});

		model.itemsModel.objects(rfp.sortItems(objects));
		model.loadingView(false);
	}

	findByParam(key, value) {
        let model = this.rfp.fmModel;
		return ko.utils.arrayFirst(model.itemsModel.objects(), object => object[ key ] === value);
	}

	findByFilter(filter, allMatches) {
        let items_model: ItemsModel = this;
		let firstMatch = !(allMatches || false);
		let resultItems = [];
		let items = items_model.objects();

		if(!items || items.length === 0)
			return null;

		for(let i = 0, l = items.length; i < l; i++) {
			if(filter(items[ i ])) {
				if(firstMatch)
					return items[ i ];

				resultItems.push(items[ i ]);
			}
		}
		return firstMatch ? null : resultItems;
	}

	sortObjects() {
        let items_model: ItemsModel = this;
        let sortItems = this.rfp.sortItems;
		let sortedList = sortItems(items_model.objects());

		items_model.objects(sortedList);
	}

	getSelected() {
        let items_model: ItemsModel = this;
		let selectedItems = items_model.findByFilter(item => item.rdo.type !== 'parent' && item.selected(), true);

		items_model.selectedNumber(selectedItems.length);
		return selectedItems;
	}

	unselectItems(ctrlKey?) {
        let items_model: ItemsModel = this;
        let appendSelection = (config.manager.selection.enabled && config.manager.selection.useCtrlKey && ctrlKey === true);

		if(!appendSelection) {
			// drop selection from selected items
			$.each(items_model.getSelected(), (i, itemObject) => {
				itemObject.selected(false);
			});
		}
	}

	initiateLazyLoad() {
        let items_model: ItemsModel = this;
        let rfp = this.rfp;

		// not configured or already initiated
		if(config.viewer.image.lazyLoad !== true || items_model.lazyLoad)
			return;

		items_model.lazyLoad = new LazyLoad({
			container: <any>rfp.$fileinfo[ 0 ], // work only for default scrollbar
			callback_load: element => {
				log('LOADED', element.getAttribute('data-original'));
			},
			callback_set: element => {
				log('SET', element.getAttribute('data-original'));
			},
			callback_processed: elementsLeft => {
				log('PROCESSED', elementsLeft + ' images left');
			}
		});
	}

}

class ItemObject {
	// let item_object = this;
    previewWidth;
    id;
    rdo;
    cdo;
    visible;
    selected;
    dragHovered;
    lazyPreview;
    title;
    itemClass;
    listIconClass;
    gridIconClass;

	constructor(private rfp: richFilemanagerPlugin, private resourceObject) {
		let model = rfp.fmModel;

        this.previewWidth = config.viewer.image.thumbMaxWidth;
        if(resourceObject.attributes.width && resourceObject.attributes.width < this.previewWidth)
            this.previewWidth = resourceObject.attributes.width;

        this.id = resourceObject.id; // for search purpose
        this.rdo = resourceObject; // original resource data object
        this.cdo = { // computed data object
            isFolder: (resourceObject.type === 'folder'),
            sizeFormatted: formatBytes(resourceObject.attributes.size),
            extension: (resourceObject.type === 'file') ? getExtension(resourceObject.id) : null,
            dimensions: resourceObject.attributes.width ? resourceObject.attributes.width + 'x' + resourceObject.attributes.height : null,
            cssItemClass: (resourceObject.type === 'folder') ? 'directory' : 'file',
            imageUrl: rfp.createImageUrl(resourceObject, true, true),
            previewWidth: this.previewWidth,
            hiddenByType: false,
            hiddenBySearch: false
        };
        this.visible = ko.observable(true);
        this.selected = ko.observable(false);
        this.dragHovered = ko.observable(false);
        this.lazyPreview = (config.viewer.image.lazyLoad && this.cdo.imageUrl);

        this.selected.subscribe(value => {
            if(value && model.treeModel.selectedNode() !== null)
                model.treeModel.selectedNode().selected(false);

        });

        this.title = ko.pureComputed(() => {
            return (config.options.showTitleAttr) ? this.rdo.id : null;
        });

        this.itemClass = ko.pureComputed(() => {
            let cssClass = [];

            if(this.selected() && config.manager.selection.enabled)
                cssClass.push('ui-selected');

            if(this.dragHovered())
                cssClass.push(model.ddModel.hoveredCssClass);

            return `${this.cdo.cssItemClass} ${cssClass.join(' ')}`;
        });

        this.listIconClass = ko.pureComputed(() => {
            let cssClass;
            let extraClass = [ 'ico' ];

            if(this.cdo.isFolder === true) {
                cssClass = 'ico_folder';
                extraClass.push('folder');
                if(!this.rdo.attributes.readable)
                    extraClass.push('lock');

            } else {
                cssClass = 'ico_file';
                if(this.rdo.attributes.readable)
                    extraClass.push('ext', this.cdo.extension);
                else
                    extraClass.push('file', 'lock');

            }
            return cssClass + ' ' + extraClass.join('_');
        });

        this.gridIconClass = ko.pureComputed(() => {
            let cssClass = [];
            let extraClass = [ 'ico' ];

            if(!this.cdo.imageUrl) {
                cssClass.push('grid-icon');
                if(this.cdo.isFolder === true) {
                    cssClass.push('ico_folder');
                    extraClass.push('folder');
                    if(!this.rdo.attributes.readable)
                        extraClass.push('lock');

                } else {
                    cssClass.push('ico_file');
                    if(this.rdo.attributes.readable)
                        extraClass.push('ext', this.cdo.extension);
                    else
                        extraClass.push('file', 'lock');

                }
                cssClass.push(extraClass.join('_'));
            }
            return cssClass.join(' ');
        });

    }

	mouseDown(item, e) {
		let model = this.rfp.fmModel;

		// case: previously selected items are dragged instead of a newly one
		// unselect if currently clicked item is not the one of selected items
		if(!item.selected())
			model.itemsModel.unselectItems(e.ctrlKey);

		model.selectionModel.unselect = item.selected();
		item.selected(true);
	};

	open(item, e) {
        let rfp = this.rfp;
        let model = this.rfp.fmModel;

		if(model.selectionModel.unselect) {
			// case: click + ctrlKey on selected item
			if(e.ctrlKey)
				item.selected(false);

			// drop selection
			if(!e.ctrlKey && config.manager.dblClickOpen) {
				model.itemsModel.unselectItems(e.ctrlKey);
				item.selected(true);
			}
		}

		if(model.isItemOpenable(e)) {
			if(config.options.quickSelect && item.rdo.type === 'file' && rfp.has_capability(item.rdo, 'select'))
				rfp.selectItem(item.rdo);
			else
				rfp.getDetailView(item.rdo);

		}
	};

	remove() {
        let model = this.rfp.fmModel;
		model.itemsModel.objects.remove(this);
	};
}

class TableViewModel {
    thName: SortableHeader;
    thType: SortableHeader;
    thSize: SortableHeader;
    thDimensions: SortableHeader;
    thModified: SortableHeader;

	constructor(private rfp: richFilemanagerPlugin) {
        this.thName = new SortableHeader(rfp, 'name');
        this.thType = new SortableHeader(rfp, 'type');
        this.thSize = new SortableHeader(rfp, 'size');
        this.thDimensions = new SortableHeader(rfp, 'dimensions');
        this.thModified = new SortableHeader(rfp, 'modified');
	}
}

class SortableHeader {
    column;
    order;
    sortClass;

    constructor(private rfp: richFilemanagerPlugin, name) {
        let thead = this;
        let model = rfp.fmModel;

        this.column = ko.observable(name);
        this.order = ko.observable(model.itemsModel.listSortOrder());

        this.sortClass = ko.pureComputed(() => {
            let cssClass;

            if(model.itemsModel.listSortField() === thead.column()) {
                cssClass = `sorted sorted-${this.order()}`;
            }
            return cssClass;
        });
	}

    sort() {
        let thead = this;
        let model = this.rfp.fmModel;

        let isAscending = thead.order() === 'asc';
        let isSameColumn = model.itemsModel.listSortField() === thead.column();

        thead.order(isSameColumn ? (isAscending ? 'desc' : 'asc') : model.itemsModel.listSortOrder());
        model.itemsModel.listSortField(thead.column());
        model.itemsModel.listSortOrder(thead.order());
        model.itemsModel.sortObjects();
    }
}

class HeaderModel {
	// let header_model = this;

    closeButton;
    langSwitcher;

	constructor(private rfp) {
        this.closeButton = ko.observable(false);
        this.langSwitcher = Array.isArray(config.language.available) && config.language.available.length > 0;
	}

	closeButtonOnClick() {
		let log = this.rfp.log;

		log('CLOSE button is clicked');
	}

	navHome(){
        let model = this.rfp.fmModel;
        let fileRoot = this.rfp.fileRoot;

		model.previewFile(false);
		model.itemsModel.loadList(fileRoot);
	}

	navLevelUp() {
        let model = this.rfp.fmModel;
        let rfp = this.rfp;

		let parentFolder = model.previewFile()
			? rfp.getDirname(model.previewModel.rdo().id)
			: rfp.getParentDirname(model.currentPath());

		if(model.previewFile())
			model.previewFile(false);

		if(parentFolder !== model.currentPath())
			model.itemsModel.loadList(parentFolder);

	}

	navRefresh(){
        let model = this.rfp.fmModel;

		if(model.previewFile()) {
			model.previewFile(false);
			model.previewFile(true);
		} else
			model.itemsModel.loadList(model.currentPath());
	}

	displayGrid(){
        let model = this.rfp.fmModel;

		model.viewMode('grid');
		model.previewFile(false);

		if(model.itemsModel.lazyLoad)
			model.itemsModel.lazyLoad.update();
	}

	displayList(){
        let model = this.rfp.fmModel;

		model.viewMode('list');
		model.previewFile(false);
	}

	switchLang(e) {
		let langNew = e.target.value;
		let langCurrent = LangModel.getLang();
        let _url_ = this.rfp._url_;

		if(langNew && langNew.toLowerCase() !== langCurrent.toLowerCase()) {
			let newUrl;
			let url = window.location.toString();
			let regExp = new RegExp('(langCode=)' + langCurrent);

			if(regExp.test(url))
				newUrl = url.replace(regExp, '$1' + langNew);
			else
				newUrl = url + ($.isEmptyObject(_url_.param()) ? '?' : '#') + 'langCode=' + langNew;

			window.location.href = newUrl;
		}
	}

	createFolder(){
	    let rfp = this.rfp;
        let fmModel = this.rfp.fmModel;
        let error = this.rfp.error;
        let success = this.rfp.success;
        let lg = this.rfp.lg;
        let buildAjaxRequest = this.rfp.buildAjaxRequest;
        let handleAjaxResponseErrors = this.rfp.handleAjaxResponseErrors;
        let handleAjaxError = this.rfp.handleAjaxError;

		let makeFolder = function (e, ui: AleritfyDialogUI) {
			let folderName = ui.getInputValue();

			if(!folderName) {
				error(lg('no_foldername'));
				return;
			}

			buildAjaxRequest('GET', {
				mode: 'addfolder',
				path: fmModel.currentPath(),
				name: folderName
			}).done(response => {
				if(response.data) {
					fmModel.addItem(response.data, fmModel.currentPath());

					ui.closeDialog();
					if(config.options.showConfirmation)
						success(lg('successful_added_folder'));

				}
				handleAjaxResponseErrors(response);
			}).fail(handleAjaxError.bind(rfp));
		};

		prompt({
			message: lg('prompt_foldername'),
			value: lg('default_foldername'),
			okBtn: {
				label: lg('create_folder'),
				autoClose: false,
				click: makeFolder
			},
			cancelBtn: {
				label: lg('cancel')
			}
		});
	}
}

class SummaryModel {
    public files: KnockoutObservable;
    public folders: KnockoutObservable;
    public size: KnockoutObservable;
    public enabled: KnockoutObservable;

	constructor(private rfp: richFilemanagerPlugin) {
        this.files = ko.observable(null);
        this.folders = ko.observable(null);
        this.size = ko.observable(null);
        this.enabled = ko.observable(false);
	}

	doSummarize(): void {
	    let summarizeItems = this.rfp.summarizeItems;

        summarizeItems();
	}
}

class FilterModel {
    public name: KnockoutObservable;

	constructor(private rfp: richFilemanagerPlugin) {
		this.name = ko.observable(null);
	}

	setName(filterName) {
        let filter_model = this;

		if(filterName && config.filter && Array.isArray(config.filter[ filterName ])) {
			filter_model.name(filterName);
		}
	}

	// return extensions which are match a filter name
	getExtensions() {
        let filter_model = this;

		if(filter_model.name())
			return config.filter[ filter_model.name() ];

		return null;
	}

	// check whether file item should be filtered out of the output based on it's extension
	filterItem(itemObject) {
        let filter_model = this;

		if(itemObject.rdo.type === 'parent')
			return;

		let extensions = filter_model.getExtensions();
		let visibility = !itemObject.cdo.hiddenBySearch;

		if(itemObject.rdo.type === 'file' && Array.isArray(extensions)) {
			let ext = getExtension(itemObject.id);
			let matchByType = extensions.indexOf(ext) !== -1;

			visibility = visibility && matchByType;
			itemObject.cdo.hiddenByType = !matchByType;
		}
		itemObject.visible(visibility);
	}

	filter(filterName) {
        let filter_model = this;
        let model = this.rfp.fmModel;

		model.searchModel.reset();
		filter_model.setName(filterName);

		$.each(model.itemsModel.objects(), (i, itemObject) => {
			filter_model.filterItem(itemObject);
		});

		model.treeModel.mapNodes(node => {
			filter_model.filterItem(node);
		});

		if(model.itemsModel.lazyLoad)
			model.itemsModel.lazyLoad.update();

	}

	reset() {
        let filter_model = this;

		filter_model.name(null);
		filter_model.filter(null);
	}
}

class SearchModel {
	// let search_model = this;
	value;

	constructor(private rfp: richFilemanagerPlugin) {
		this.value = ko.observable('');
	}

	// noinspection JSUnusedLocalSymbols
    findAll(data, event) {
		let delay = 200;
		let insensitive = true;
        let search_model = this;
        let model = this.rfp.fmModel;
        let rfp = this.rfp;

		search_model.value(event.target.value);

        rfp.delayCallback(() => {
			let searchString = insensitive ? search_model.value().toLowerCase() : search_model.value();

			$.each(model.itemsModel.objects(), (i, itemObject) => {
				if(itemObject.rdo.type === 'parent' || itemObject.cdo.hiddenByType)
					return;

				let itemName = itemObject.rdo.attributes.name;

				if(insensitive)
					itemName = itemName.toLowerCase();

				let visibility = (itemName.indexOf(searchString) === 0);

				itemObject.cdo.hiddenBySearch = !visibility;
				itemObject.visible(visibility);
			});
		}, delay);
	}

	reset(/*data?, event?*/) {
        let search_model = this;
        let model = this.rfp.fmModel;

		search_model.value('');
		$.each(model.itemsModel.objects(), (i, itemObject) => {
			if(itemObject.rdo.type === 'parent')
				return;

			itemObject.cdo.hiddenBySearch = false;
			itemObject.visible(!itemObject.cdo.hiddenByType);
		});
	}
}
///
class ClipboardModel {
	// let clipboard_model = this;
    cbMode;
    cbObjects;
    active;
    itemsNum;
    enabled;

	constructor(private rfp: richFilemanagerPlugin) {
        this.cbMode = null;
        this.cbObjects = [];
        let active = this.active = rfp.capabilities.indexOf('copy') > -1 || rfp.capabilities.indexOf('move') > -1;
        let model = rfp.fmModel;

        this.itemsNum = ko.observable(0);
        this.enabled = ko.observable(model.config().clipboard.enabled && active);
	}

	copy() {
        let clipboard_model = this;
        let model = this.rfp.fmModel;

		if(!clipboard_model.hasCapability('copy'))
			return;

		this.cbMode = 'copy';
		this.cbObjects = model.fetchSelectedItems();
		clipboard_model.itemsNum(this.cbObjects.length);
	}

	cut() {
        let clipboard_model = this;
        let model = this.rfp.fmModel;

		if(!clipboard_model.hasCapability('cut'))
			return;

		this.cbMode = 'cut';
		this.cbObjects = model.fetchSelectedItems();
		clipboard_model.itemsNum(this.cbObjects.length);
	}

	paste() {
        let clipboard_model = this;
        let model = this.rfp.fmModel;
        let processMultipleActions = this.rfp.processMultipleActions;
        let moveItem = this.rfp.moveItem;
        let copyItem = this.rfp.copyItem;

		if(!clipboard_model.hasCapability('paste') || clipboard_model.isEmpty())
			return;

		if(this.cbMode === null || this.cbObjects.length === 0) {
			warning(lg('clipboard_empty'));
			return;
		}

		let targetPath = model.currentPath();

		processMultipleActions(this.cbObjects, (i, itemObject) => {
			if(this.cbMode === 'cut')
				return moveItem(itemObject, targetPath);

			if(this.cbMode === 'copy')
				return copyItem(itemObject, targetPath);

		}, this.clearClipboard.bind(this));
	}

	clear() {
        let clipboard_model = this;

		if(!clipboard_model.hasCapability('clear') || clipboard_model.isEmpty())
			return;

		this.clearClipboard();
		success(lg('clipboard_cleared'));
	}

	isEmpty() {
		return this.cbObjects.length === 0;
	}

	hasCapability(capability) {
        let clipboard_model = this;
        let rfp = this.rfp;

        if(!clipboard_model.enabled)
			return false;

		switch(capability) {
			case 'copy':
				return rfp.capabilities.indexOf('copy') > -1;
			case 'cut':
				return rfp.capabilities.indexOf('move') > -1;
			default:
				return true;
		}
	}

	clearClipboard() {
		let clipboard_model = this;

		this.cbObjects = [];
		this.cbMode = null;
		clipboard_model.itemsNum(0);
	}
}

class BreadcrumbsModel {
	// let bc_model = this;
    items;

	constructor(private rfp) {
        this.items = ko.observableArray([]);
	}

	add(path, label) {
        let bc_model = this;
        // noinspection UnnecessaryLocalVariableJS
        let rfp = this.rfp;

		bc_model.items.push(<BcItem>new BcItem(rfp, path, label));
	}

	splitCurrent() {
        let bc_model = this;
        let model = this.rfp.fmModel;
        let rfp = this.rfp;

		let path = rfp.fileRoot;
		let cPath = model.currentPath();
		let chunks = cPath.replace(new RegExp('^' + rfp.fileRoot), '').split('/');

		// reset breadcrumbs
		bc_model.items([]);
		// push root node
		bc_model.add(rfp.fileRoot, '');

		while(chunks.length > 0) {
			let chunk = chunks.shift();

			if(chunk) {
				path += chunk + '/';
				bc_model.add(path, chunk);
			}
		}
	}
}

class BcItem {
    // let bc_item = this;
    isRoot;
    active;

    constructor(private rfp: richFilemanagerPlugin, public path, public label) {
        this.isRoot = (path === rfp.fileRoot);
        this.active = (path === rfp.fmModel.currentPath());
	}

    itemClass() {
        let bc_item = this;
        let cssClass = [ 'nav-item' ];

        if(bc_item.isRoot)
            cssClass.push('root');

        if(bc_item.active)
            cssClass.push('active');

        return cssClass.join(' ');
    }

    goto(item/*, e*/) {
    	let model = this.rfp.fmModel;

        if(!item.active)
            model.itemsModel.loadList(item.path);

    }
}

class RenderModel {
	// let render_model = this;
	$containerElement;

	rdo;
	content;
	renderer;

	constructor(private rfp: richFilemanagerPlugin) {
        this.rdo = ko.observable({});
        this.content = ko.observable(null);
        this.renderer = ko.observable(null);
	}

	render(data) {
        let render_model = this;

        if(render_model.renderer())
			render_model.renderer().processContent(data);

	}

	setRenderer(resourceObject) {
        let render_model = this;
        let rfp = this.rfp;

        render_model.rdo(resourceObject);

		if(isMarkdownFile(resourceObject.attributes.name))
		// markdown renderer
			render_model.renderer(<MarkdownRenderer>new MarkdownRenderer(rfp, render_model));
		else
		// CodeMirror renderer
			render_model.renderer(<CodeMirrorRenderer>new CodeMirrorRenderer(rfp, render_model));

	}

	setContainer(templateElements) {
        let render_model = this;
        let rfp = this;

		$.each(templateElements, function () {
			if($(this).hasClass('fm-renderer-container')) {
				rfp.$containerElement = $(this);
				return false;
			}
		});

		render_model.renderer().processDomElements(rfp.$containerElement);
	}
}

class CodeMirrorRenderer {
    name;
    interactive;
    instance: EditorModel;

    constructor(private rfp: richFilemanagerPlugin, private render_model: RenderModel) {
        this.name = 'codeMirror';
        this.interactive = false;
        this.instance = new EditorModel(rfp);
	}

    processContent(data) {
    	let render_model = this.render_model;

        this.instance.render(data);
        render_model.content(data);
    }

    processDomElements($container) {
        let render_model = this.render_model;

        if(!this.instance.instance) {
            let textarea = $container.find('.fm-cm-renderer-content')[ 0 ];
            let extension = getExtension(render_model.rdo().id);

            this.instance.createInstance(extension, textarea, {
                readOnly: 'nocursor',
                styleActiveLine: false,
                lineNumbers: false
            });
        }
    }
}

class MarkdownRenderer {
    name;
    interactive;
    instance;

	constructor(private rfp: richFilemanagerPlugin, private render_model: RenderModel) {
		let rfp = this.rfp;
		let render_model = this.render_model;

        this.name = 'markdown';
        this.interactive = true;

        let instance = this.instance = (<any>window).markdownit({
            // Basic options:
            html: true,
            linkify: true,
            typographer: true,

            // Custom highlight function to apply CSS class `highlight`:
            highlight: (str, lang) => {
                if(lang && hljs.getLanguage(lang)) {
                    try {
                        return `<pre class="highlight"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
                    } catch(__) {
                    }
                }
                return `<pre class="highlight"><code>${instance.utils.escapeHtml(str)}</code></pre>`;
            },

            // custom link function to enable <img ...> and file d/ls:
            replaceLink: (link/*, env*/) => {

                // do not change if link as http:// or ftp:// or mailto: etc.
                if(link.search('://') != -1 || startsWith(link, 'mailto:'))
                    return link;

                // define path depending on absolute / relative link type
                let basePath = (startsWith(link, '/')) ? rfp.fileRoot : getDirname(render_model.rdo().id);
                let path = basePath + ltrim(link, '/');

                if(isMarkdownFile(path))
                // to open file in preview mode upon click
                    return path;
                else {
                    let queryParams = rfp.extendRequestParams('GET', {
                        mode: 'readfile',
                        path: path
                    });
                    return rfp.buildConnectorUrl(queryParams);
                }
            }
        }).use((<any>window).markdownitReplaceLink);
	}

    processContent(data) {
		let instance = this.instance;
		let render_model = this.render_model;
        let result = instance.render(data);

        render_model.content(result);
        this.setLinksBehavior();
    }

    processDomElements(/*$container*/) {
	    // todo: why is this empty?
    }

    setLinksBehavior() {
		let render_model = this.render_model;
		let rfp = this.rfp;
		let fmModel = this.rfp.fmModel;
        // add onClick events to local .md file links (to perform AJAX previews)
        render_model.$containerElement.find('a').each(function () {
            let href = <string>$(this).attr('href');
            let editor = fmModel.previewModel.editor;

            if(editor.enabled() && editor.isInteractive()) {
                // prevent user from losing unsaved changes in preview mode
                // in case of clicking on a link that jumps off the page
                $(this).off('click');
                $(this).on('click', () => false); // prevent onClick event
            } else {
                if(href.search('://') != -1 || startsWith(href, 'mailto:'))
                    return; // do nothing

                if(isMarkdownFile(href)) {
                    // open file in preview mode for clicked link
                    $(this).on('click', (/*e*/) => {
                        rfp.getItemInfo(href).then(response => {
                            if(response.data)
                                rfp.getDetailView(response.data);

                        });

                        return false; // prevent onClick event
                    });
                }
            }
        });
    }
}

class EditorModel {
	// let editor_model = this;
	delayedContent = null;
    instance;
    enabled;
    content;
    mode;
    isInteractive;

	constructor(private rfp: richFilemanagerPlugin) {
		let editor_model = this;

        this.instance = null;
        this.enabled = ko.observable(false);
        this.content = ko.observable(null);
        this.mode = ko.observable(null);
        this.isInteractive = ko.observable(false);

        this.mode.subscribe(mode => {
            if(mode) {
                editor_model.instance.setOption('mode', mode);
                if(this.delayedContent) {
                    this.drawContent(this.delayedContent);
                    this.delayedContent = null;
                }
            }
        });
	}

	render(content) {
        let editor_model = this;

		if(editor_model.mode())
			this.drawContent(content);
		else
			this.delayedContent = content;

	}

	createInstance(extension, element, options) {
        let editor_model = this;
		let cm;
		let defaults = {
			readOnly: 'nocursor',
			styleActiveLine: false,
			viewportMargin: Infinity,
			lineNumbers: config.editor.lineNumbers,
			lineWrapping: config.editor.lineWrapping,
			theme: config.editor.theme,
			matchBrackets: config.editor.matchBrackets,
			extraKeys: {
				'F11': cm => {
					cm.setOption('fullScreen', !cm.getOption('fullScreen'));
				},
				'Esc': cm => {
					if(cm.getOption('fullScreen'))
						cm.setOption('fullScreen', false);
				}
			}
		};

		cm = CodeMirror.fromTextArea(element, $.extend({}, defaults, options));

		cm.on('changes', (cm/*, change*/) => {
			editor_model.content(cm.getValue());
		});

		editor_model.instance = cm;

		this.includeAssets(extension);
	}

	drawContent(content) {
        let editor_model = this;

		editor_model.enabled(true);
		editor_model.instance.setValue(content);
		// to make sure DOM is ready to render content
		setTimeout(() => {
			editor_model.instance.refresh();
		}, 0);
	}

	includeAssets(extension) {
		let assets = [];
		let currentMode = 'default';
        let editor_model = this;
        let rfp = this.rfp;

		// highlight code according to extension file
		if(config.editor.codeHighlight) {
			let cm = '/scripts/CodeMirror/';

			if(extension === 'js') {
				assets.push(cm + 'mode/javascript/javascript.js');
				currentMode = 'javascript';
			}
			if(extension === 'css') {
				assets.push(cm + 'mode/css/css.js');
				currentMode = 'css';
			}
			if(extension === 'html') {
				assets.push(cm + 'mode/xml/xml.js');
				currentMode = 'text/html';
			}
			if(extension === 'xml') {
				assets.push(cm + 'mode/xml/xml.js');
				currentMode = 'application/xml';
			}
			if(extension === 'php') {
				assets.push(...[
					cm + 'mode/htmlmixed/htmlmixed.js',
					cm + 'mode/xml/xml.js',
					cm + 'mode/javascript/javascript.js',
					cm + 'mode/css/css.js',
					cm + 'mode/clike/clike.js',
					cm + 'mode/php/php.js'
				]);
				currentMode = 'application/x-httpd-php';
			}
			if(extension === 'java') {
				assets.push(cm + 'mode/clike/clike.js');
				currentMode = 'text/x-java';
			}
			if(extension === 'sql') {
				assets.push(cm + 'mode/sql/sql.js');
				currentMode = 'text/x-mysql';
			}
			if(extension === 'md') {
				assets.push(...[
					cm + 'addon/mode/overlay.js',
					cm + 'mode/xml/xml.js',
					cm + 'mode/markdown/markdown.js',
					cm + 'mode/gfm/gfm.js',
					cm + 'mode/javascript/javascript.js',
					cm + 'mode/css/css.js',
					cm + 'mode/htmlmixed/htmlmixed.js',
					cm + 'mode/clike/clike.js',
					cm + 'mode/shell/shell.js',
					cm + 'mode/meta.js'
				]);
				currentMode = 'gfm';
			}
			if(extension === 'sh') {
				assets.push(...[
					cm + 'addon/mode/overlay.js',
					cm + 'mode/markdown/markdown.js',
					cm + 'mode/gfm/gfm.js',
					cm + 'mode/javascript/javascript.js',
					cm + 'mode/css/css.js',
					cm + 'mode/htmlmixed/htmlmixed.js',
					cm + 'mode/clike/clike.js',
					cm + 'mode/meta.js',
					cm + 'mode/shell/shell.js'
				]);
				currentMode = 'shell';
			}
		}

		if(assets.length) {
			assets.push(() => {
				// after all required assets are loaded
				editor_model.mode(currentMode);
			});
			rfp.loadAssets(assets);
		} else
			editor_model.mode(currentMode);

	}
}

class DragAndDropModel {
	// let drag_model = this;
	restrictedCssClass;
	$dragHelperTemplate;

    items;
    hoveredItem;
    dragHelper;
    isScrolling;
    isScrolled;
    hoveredCssClass;

	constructor(private rfp: richFilemanagerPlugin) {
        this.restrictedCssClass = 'drop-restricted';
        this.$dragHelperTemplate = $('#drag-helper-template');
        this.items = [];
        this.hoveredItem = null;
        this.dragHelper = null;
        this.isScrolling = false;
        this.isScrolled = false;
        this.hoveredCssClass = 'drop-hover';
	}

	makeDraggable(item, element) {
        let drag_model = this;
        let fetchSelectedItems = this.rfp.fmModel.fetchSelectedItems;

        if(item.rdo.type === 'file' || item.rdo.type === 'folder') {
			$(element).draggable({
				distance: 3,
				cursor: 'pointer',
				cursorAt: {
					left: Math.floor(this.$dragHelperTemplate.width() / 2),
					bottom: 15
				},
				scroll: false,
				appendTo: this.rfp.$wrapper,
				containment: this.rfp.$container,
				refreshPositions: false,
				helper: () => {
					let $cloned;
					let iconClass;

					if(fetchSelectedItems(item.constructor.name).length > 1)
						iconClass = 'ico_multiple';
					else
						iconClass = (item.rdo.type === 'folder')
							? 'ico_folder'
							: 'ico_file ico_ext_' + getExtension(item.rdo.id);

					$cloned = drag_model.$dragHelperTemplate.children('.drag-helper').clone();
					$cloned.find('.clip').addClass(iconClass);

					drag_model.dragHelper = $cloned;
					return $cloned;
				},
				start: (/*event, ui*/) => {
					drag_model.items = fetchSelectedItems(item.constructor.name);
				},
				drag: function (/*event, ui*/) {
					$(this).draggable('option', 'refreshPositions', drag_model.isScrolling || drag_model.isScrolled);
					drag_model.isScrolled = false;
				},
				stop: (/*event, ui*/) => {
					drag_model.items = [];
					drag_model.dragHelper = null;
				}
			});
		}
	}

	makeDroppable(targetItem, element) {
        let drag_model = this;
        let rfp = this.rfp;

		if(targetItem.rdo.type === 'folder' || targetItem.rdo.type === 'parent') {
			$(element).droppable({
				tolerance: 'pointer',
				enableExtendedEvents: targetItem instanceof ItemObject,
				accept: $draggable => {
					let dragItem = ko.dataFor($draggable[ 0 ]);
					let type = dragItem ? dragItem.rdo.type : null;

					return (type === 'file' || type === 'folder');
				},
				over: (event, ui) => {
					// prevent "over" event fire before "out" event
					// http://stackoverflow.com/a/28457286/7095038
					setTimeout(() => {
						drag_model.markHovered(null);
						drag_model.markRestricted(ui.helper, false);

						if(!drag_model.isDropAllowed(targetItem))
							drag_model.markRestricted(ui.helper, true);

						drag_model.markHovered(targetItem);
					}, 0);
				},
				out: (event, ui) => {
					drag_model.markHovered(null);
					drag_model.markRestricted(ui.helper, false);
				},
				drop: (/*event, ui*/) => {
					drag_model.markHovered(null);

					if(!drag_model.isDropAllowed(targetItem))
						return false;

					rfp.processMultipleActions(drag_model.items, (i, itemObject) => rfp.moveItem(itemObject.rdo, targetItem.id));
				}
			});
		}
	}

	// check whether draggable items can be accepted by target item
	isDropAllowed(targetItem) {
        let drag_model = this;

		let matches = $.grep(drag_model.items, (itemObject/*, i*/) => {
			if(targetItem.rdo.type === 'folder' || targetItem.rdo.type === 'parent') {
				// drop folder inside descending folders (filetree)
				if(startsWith(targetItem.rdo.id, itemObject.rdo.id))
					return true;

				// drop items inside the same folder (filetree)
				if(targetItem.rdo.id === getClosestNode(itemObject.rdo.id))
					return true;

			}
			// drop item to itself
			return (itemObject.id === targetItem.id);
		});
		// prevent on moving (to) protect folder or to the one of selected items
		return (targetItem.rdo.attributes.writable && matches.length === 0);
	}

	// mark item as hovered if it accepts draggable item
	markHovered(item) {
        let drag_model = this;

		if(drag_model.hoveredItem !== null)
			drag_model.hoveredItem.dragHovered(false);

		drag_model.hoveredItem = item;
		if(item)
			item.dragHovered(true);

	}

	// mark helper as restricted if target item doesn't accept draggable item
	markRestricted($helper, flag) {
        let drag_model = this;

		if(flag)
			$helper.addClass(drag_model.restrictedCssClass);
		else
			$helper.removeClass(drag_model.restrictedCssClass);

	}
}

class SelectionModel {
	public unselect = false;
}

/**
 * Knockout general model
 * @constructor
 */
class FmModel {
	// let model: any = this;

    config: KnockoutObservable<Config>;
	loadingView: KnockoutObservable<boolean>;
	previewFile: KnockoutObservable<boolean>;
	viewMode: KnockoutObservable;
	currentPath: KnockoutObservable<string>;
	browseOnly: KnockoutObservable;
	previewModel: KnockoutObservable;
	lg;
	treeModel: TreeModel;
	itemsModel: ItemsModel;
	tableViewModel: TableViewModel;
	previewModel: PreviewModel;
	headerModel: HeaderModel;
	summaryModel: SummaryModel;
	filterModel: FilterModel;
	searchModel: SearchModel;
	clipboardModel: ClipboardModel;
	breadcrumbsModel: BreadcrumbsModel;
	ddModel: DragAndDropModel;
	selectionModel: SelectionModel;

	constructor(private rfp: richFilemanagerPlugin) {
		let model = this;
		let fileRoot = rfp.fileRoot;

		this.loadingView = ko.observable(true);
		this.previewFile = ko.observable(false);
		this.viewMode = ko.observable(this.config.manager.defaultViewMode);
		this.currentPath = ko.observable(fileRoot);
		this.browseOnly = ko.observable(this.config.options.browseOnly);
		this.previewModel = ko.observable(null);

		(<any>this).previewFile.subscribe(enabled => {
			if(!enabled) {
				// close editor upon disabling preview
				model.previewModel.closeEditor();

				// update content of descriptive panel
				if(model.itemsModel.descriptivePanel.rdo().id === model.previewModel.rdo().id)
					model.itemsModel.descriptivePanel.render(model.previewModel.viewer.content());

			}
		});

		this.treeModel = <TreeModel>new TreeModel(rfp);
		this.itemsModel = <ItemsModel>new ItemsModel(rfp);
		this.tableViewModel = <TableViewModel>new TableViewModel(rfp);
		this.previewModel = <PreviewModel>new PreviewModel(rfp);
		this.headerModel = <HeaderModel>new HeaderModel(rfp);
		this.summaryModel = <SummaryModel>new SummaryModel(rfp);
		this.filterModel = <FilterModel>new FilterModel(rfp);
		this.searchModel = <SearchModel>new SearchModel(rfp);
		this.clipboardModel = <ClipboardModel>new ClipboardModel(rfp);
		this.breadcrumbsModel = <BreadcrumbsModel>new BreadcrumbsModel(rfp);
		this.ddModel = <DragAndDropModel>new DragAndDropModel(rfp);
		this.selectionModel = <SelectionModel>new SelectionModel();
	}

	addItem(resourceObject, targetPath) {
		let fmModel = this;
		// handle tree nodes
		let targetNode = fmModel.treeModel.findByParam('id', targetPath);

		if(targetNode) {
			let newNode = fmModel.treeModel.createNode(resourceObject);

			fmModel.treeModel.addNodes(targetNode, newNode);
		}

		// handle view objects
		if(fmModel.currentPath() === targetPath)
			fmModel.itemsModel.addNew(resourceObject);

	}

	removeItem(resourceObject) {
		let fmModel = this;

		// handle tree nodes
		let treeNode = fmModel.treeModel.findByParam('id', resourceObject.id);

		if(treeNode)
			treeNode.remove();

		// handle view objects
		let viewItem = fmModel.itemsModel.findByParam('id', resourceObject.id);

		if(viewItem)
			viewItem.remove();

	}

	// fetch selected view items OR tree nodes
	fetchSelectedItems(instanceName?) {
		let fmModel = this;
		let selectedNodes;
		let selectedItems;

		if(instanceName === (<any>ItemObject).name)
			return fmModel.itemsModel.getSelected();

		if(instanceName === (<any>TreeNodeModel).name)
			return fmModel.treeModel.getSelected();

		if(!instanceName) {
			selectedNodes = fmModel.treeModel.getSelected();
			selectedItems = fmModel.itemsModel.getSelected();

			return (selectedItems.length > 0) ? selectedItems : selectedNodes;
		}
		throw new Error('Unknown item type.');
	}

	// fetch resource objects out of the selected items
	fetchSelectedObjects(item) {
		let fmModel = this;
		let objects = [];

		$.each(fmModel.fetchSelectedItems(item.constructor.name), function (i, itemObject) {
			objects.push(itemObject.rdo);
		});
		return objects;
	}

	// check whether view item can be opened based on the event and configuration options
	isItemOpenable(event) {
		// selecting with Ctrl key
		if(this.config.manager.selection.enabled && this.config.manager.selection.useCtrlKey && event.ctrlKey === true)
			return false;

		// single clicked while expected dblclick
		return !(this.config.manager.dblClickOpen && event.type === 'click');

	}
}

class richFilemanagerPlugin {
	public settings: Settings;

	public $container: JQuery;
	public $wrapper: JQuery;
	public $header: JQuery;
	public $uploader: JQuery;
	public $splitter: JQuery;
	public $footer: JQuery;
	public $fileinfo: JQuery;
	public $filetree: JQuery;
	public $viewItemsWrapper: JQuery;
	public $previewWrapper: JQuery;
	public $viewItems: JQuery;
	public $uploadButton: JQuery;

	public fileRoot: any = '/';				// relative files root, may be changed with some query params
	public apiConnector: string = null;		// API connector URL to perform requests to server
	public capabilities: any = [];			// allowed actions to perform in FM
	public configSortField: any = null;		// items sort field name
	public configSortOrder: any = null;		// items sort order 'asc'/'desc'
	public fmModel: FmModel = null;				// filemanager knockoutJS model
	public _url_ = purl();
	public timeStart = new Date().getTime();

    delayCallback: Function;

	fullexpandedFolder: string;

	/**
	 * The "constructor" method that gets called when the object is created
	 */
	constructor(element: any, pluginOptions) {
		/** variables to keep request options data **/
		this.fullexpandedFolder = null;	// path to be automatically expanded by filetree plugin

		/**
		 * Private properties accessible only from inside the plugin
		 */
		let $container: JQuery = this.$container = <JQuery>$(element);	// reference to the jQuery version of DOM element the plugin is attached to
		let $wrapper: JQuery = this.$wrapper = $container.children('.fm-wrapper');
		let $header: JQuery = this.$header = $wrapper.find('.fm-header');
		let $uploader: JQuery = this.$uploader = $header.find('.fm-uploader');
		let $splitter: JQuery = this.$splitter = $wrapper.children('.fm-splitter');
		this.$footer = $wrapper.children('.fm-footer');
		let $fileinfo: JQuery = this.$fileinfo = $splitter.children('.fm-fileinfo');
		this.$filetree = $splitter.children('.fm-filetree');
		let $viewItemsWrapper: JQuery = this.$viewItemsWrapper = $fileinfo.find('.view-items-wrapper');
		this.$previewWrapper = $fileinfo.find('.fm-preview-wrapper');
		this.$viewItems = $viewItemsWrapper.find('.view-items');
		this.$uploadButton = $uploader.children('.fm-upload');

		/** service variables **/
		this._url_ = purl();
		this.timeStart = new Date().getTime();

		/**
		 * This holds the merged default and user-provided options.
		 * Plugin's properties will be available through this object like:
		 * - fm.propertyName from inside the plugin
		 * - element.data('richFilemanager').propertyName from outside the plugin, where "element" is the element the plugin is attached to;
		 * @type {{}}
		 */

		// The plugin's final settings, contains the merged default and user-provided options (if any)
		this.settings = $.extend(true, defaults, pluginOptions);

		/*---------------------------------------------------------
	 	  Helper functions
	 	  ---------------------------------------------------------*/

		// http://stackoverflow.com/questions/3390930/any-way-to-make-jquery-inarray-case-insensitive
		(function ($) {
			$.extend($, {
				// Case insensative $.inArray (http://api.jquery.com/jquery.inarray/)
				// $.inArrayInsensitive(value, array [, fromIndex])
				//  value (type: String)
				//    The value to search for
				//  array (type: Array)
				//    An array through which to search.
				//  fromIndex (type: Number)
				//    The index of the array at which to begin the search.
				//    The default is 0, which will search the whole array.
				inArrayInsensitive: function (elem, arr, i) {
					// not looking for a string anyways, use default method
					if(typeof elem !== 'string')
						return $.inArray.apply(this, arguments);

					// confirm array is populated
					if(arr) {
						let len = arr.length;

						i = i ? (i < 0 ? Math.max(0, len + i) : i) : 0;
						elem = elem.toLowerCase();
						for(; i < len; i++) {
							if(i in arr && arr[ i ].toLowerCase() == elem)
								return i;

						}
					}
					// stick with inArray/indexOf and return -1 on no match
					return -1;
				}
			});
		})(jQuery);

		// Delays execution of function that is passed as argument
		this.delayCallback = (() => {
			let timer = 0;

			return (callback, ms) => {
				clearTimeout(timer);
				timer = setTimeout(callback, ms);
			};
		})();

		// call the "constructor" method
		let deferred = $.Deferred();
        let configure = this.configure;
        let localize = this.localize;
        let performInitialRequest = this.performInitialRequest;
        let includeTemplates = this.includeTemplates;
        let includeAssets = this.includeAssets;
        let initialize = this.initialize;

		deferred
			.then(() => configure())
			.then(() => localize())
			.then((/*conf_d, conf_u*/) => performInitialRequest())
			.then(() => includeTemplates())
			.then(() => {
				includeAssets(() => {
					initialize();
				});
			});

		deferred.resolve();

		$((<any>window)).resize(this.setDimensions.bind(this));
	}

	public configure() {
		let loadConfigFile = this.loadConfigFile;

        return $.when(loadConfigFile('default'), loadConfigFile('user'))
			.done((confd, confu) => {
				let config_default = confd[ 0 ];
				let config_user = confu[ 0 ];

				// remove version from user config file
				if(config_user !== undefined && config_user !== null)
					delete config_user.version;

				// merge default config and user config file
                config = $.extend({}, config_default, config_user);

				// setup apiConnector
				if(config.api.connectorUrl)
					this.apiConnector = <string>config.api.connectorUrl;
				else {
					let connectorUrl = location.origin + location.pathname;
					let langConnector = `connectors/${config.api.lang}/filemanager.${config.api.lang}`;

					// for url like http://site.com/index.html
					if(getExtension(connectorUrl).length > 0)
						connectorUrl = connectorUrl.substring(0, connectorUrl.lastIndexOf('/') + 1);

					this.apiConnector = connectorUrl + langConnector;
				}
			});
	}

	// performs initial request to server to retrieve initial params
	public performInitialRequest() {
		return this.buildAjaxRequest('GET', {
			mode: 'initiate'
		}).done((response) => {
			if(response.data) {
				let serverConfig = response.data.attributes.config;

				// configuration options retrieved from the server
				$.each(serverConfig, (section, options) => {
					$.each(options, (param, value) => {
						if(config[ section ] === undefined)
							config[ section ] = [];

						config[ section ][ param ] = value;
					});
				});

				// If the server is in read only mode, set the GUI to browseOnly:
				if(config.security.readOnly)
					config.options.browseOnly = true;

			}
			handleAjaxResponseErrors(response);
		}).fail(() => {
			error('Unable to perform initial request to server.');
		}).then(response => {
			// noinspection TypeScriptUnresolvedVariable
			if(response.errors) { // todo: errors does not exist in the jquery type definition
				return $.Deferred().reject();
			}
		});
	}

	// localize messages based on configuration or URL value
	public localize() {
		let _url_ = this._url_;

		LangModel.init(this.settings.baseUrl);

		return $.ajax()
			.then(() => {
				let urlLangCode = _url_.param('langCode');

				if(urlLangCode) {
					// try to load lang file based on langCode in query params
					return file_exists(LangModel.buildLangFileUrl(urlLangCode))
						.done(() => {
							LangModel.setLang(urlLangCode);
						})
						.fail(() => {
							setTimeout(function () {
								error(`Given language file (${LangModel.buildLangFileUrl(urlLangCode)}) does not exist!`);
							}, 500);
						});
				} else
					LangModel.setLang(config.language.default);
			})
			.then(() => {
				return $.ajax({
					type: 'GET',
					url: LangModel.buildLangFileUrl(LangModel.getLang()),
					dataType: 'json'
				}).done(function (jsonTrans) {
					LangModel.setTranslations(jsonTrans);
				});
			});
	}

	public includeTemplates() {
		return $.when(this.loadTemplate('upload-container'), this.loadTemplate('upload-item')).done(function (uc, ui) {
			let tmpl_upload_container = uc[ 0 ];
			let tmpl_upload_item = ui[ 0 ];

			this.$wrapper
				.append(tmpl_upload_container)
				.append(tmpl_upload_item);
		});
	}

	public includeAssets(callback) {
		let primary = [];
		let secondary = [];

		// theme defined in configuration file
		primary.push(`/themes/${config.options.theme}/styles/theme.css`);

		if(config.viewer.image.lazyLoad)
			primary.push('/scripts/lazyload/dist/lazyload.min.js');

		if(config.customScrollbar.enabled) {
			let p = '/scripts/custom-scrollbar-plugin/';

			primary.push(...[
				`${p}jquery.mCustomScrollbar.min.css`,
				`${p}jquery.mCustomScrollbar.concat.min.js`
			]);
		}

		// add callback on loaded assets and inject primary ones
		primary.push(callback);
		this.loadAssets(primary);

		// Loading CodeMirror if enabled for online edition
		if(config.editor.enabled) {
			let editorTheme = config.editor.theme;
			let p = '/scripts/CodeMirror/';

			if(editorTheme && editorTheme !== 'default') {
				secondary.push(`${p}theme/${editorTheme}.css`);
			}
			secondary.push(...[
				`${p}lib/codemirror.css`,
				`${p}lib/codemirror.js`,
				`${p}addon/selection/active-line.js`,
				`${p}addon/display/fullscreen.css`,
				`${p}addon/display/fullscreen.js`
			]);
		}

		// Load Markdown-it, if enabled. For .md to HTML rendering:
		if(config.viewer.markdownRenderer.enabled) {
			let p = '/scripts/markdown-it/';

			secondary.push(...[
				'/styles/fm-markdown.css',
				`${p}markdown-it.min.js`,
				`${p}default.min.css`,
				`${p}highlight.min.js`,
				`${p}markdown-it-footnote.min.js`,
				`${p}markdown-it-replace-link.min.js`
			]);
		}

		if(!config.options.browseOnly) {
			// Loading jquery file upload library
			let p = '/scripts/jQuery-File-Upload/';

			secondary.push(...[
				`${p}js/vendor/jquery.ui.widget.js`,
				`${p}js/canvas-to-blob.min.js`,
				`${p}js/load-image.all.min.js`,
				`${p}js/jquery.iframe-transport.js`,
				`${p}js/jquery.fileupload.js`,
				`${p}js/jquery.fileupload-process.js`,
				`${p}js/jquery.fileupload-image.js`,
				`${p}js/jquery.fileupload-validate.js`
			]);

			if(config.upload.multiple) {
				secondary.push(`${p}/css/dropzone.css`);
			}
		}

		if(secondary.length)
			this.loadAssets(secondary);

	}

	public initialize() {
		let _url_ = this._url_;
        let setDimensions = this.setDimensions;

		// reads capabilities from config files if exists else apply default settings
		this.capabilities = config.options.capabilities || [ 'upload', 'select', 'download', 'rename', 'copy', 'move', 'delete', 'extract' ];

		// defines sort params
		let chunks = [];

		if(config.options.fileSorting)
			chunks = config.options.fileSorting.toLowerCase().split('_');

		this.configSortField = chunks[ 0 ] || 'name';
		this.configSortOrder = chunks[ 1 ] || 'asc';

		// changes files root to restrict the view to a given folder
		let exclusiveFolder = _url_.param('exclusiveFolder');

		if(exclusiveFolder) {
			this.fileRoot = `/${exclusiveFolder}/`;
			this.fileRoot = normalizePath(this.fileRoot);
		}

		// get folder that should be expanded after filemanager is loaded
		let expandedFolder = _url_.param('expandedFolder');

		if(expandedFolder) {
			this.fullexpandedFolder = this.fileRoot + expandedFolder + '/';
			this.fullexpandedFolder = normalizePath(this.fullexpandedFolder);
		}

		// Activates knockout.js
		let fmModel = this.fmModel = new FmModel(this);
		ko.applyBindings(fmModel);

		fmModel.itemsModel.initiateLazyLoad();
		fmModel.filterModel.setName(_url_.param('filter'));

		ko.bindingHandlers.toggleNodeVisibility = {
			init: (element, valueAccessor) => {
				let node = valueAccessor();
				$(element).toggle(node.isExpanded());
			},
			update: (element, valueAccessor) => {
				let node = valueAccessor();

				if(node.isSliding() === false)
					return false;

				if(node.isExpanded() === false) {
					$(element).slideDown(config.filetree.expandSpeed, () => {
						node.isSliding(false);
						node.isExpanded(true);
					});
				}
				if(node.isExpanded() === true) {
					$(element).slideUp(config.filetree.expandSpeed, () => {
						node.isSliding(false);
						node.isExpanded(false);
					});
				}
			}
		};

		ko.bindingHandlers.draggableView = {
			init: (element, valueAccessor/*, allBindingsAccessor*/) => {
				fmModel.ddModel.makeDraggable(valueAccessor(), element);
			}
		};

		ko.bindingHandlers.droppableView = {
			init: (element, valueAccessor/*, allBindingsAccessor*/) => {
				fmModel.ddModel.makeDroppable(valueAccessor(), element);
			}
		};

		ko.bindingHandlers.draggableTree = {
			init: (element, valueAccessor/*, allBindingsAccessor*/) => {
				fmModel.ddModel.makeDraggable(valueAccessor(), element);
			}
		};

		ko.bindingHandlers.droppableTree = {
			init: (element, valueAccessor/*, allBindingsAccessor*/) => {
				fmModel.ddModel.makeDroppable(valueAccessor(), element);
			}
		};

		this.$wrapper.mousewheel(function (e) {
			if(!fmModel.ddModel.dragHelper)
				return true;

			let $panes;
			let $obstacle: JQuery = null;

			if(config.customScrollbar.enabled)
				$panes = $([ this.$viewItemsWrapper[ 0 ], this.$filetree[ 0 ] ]);
			else
				$panes = this.$splitter.children('.splitter-pane');

			$panes.each(function (/*i*/) {
				let $pane: JQuery = (<JQuery>$)(this);
				let top = $pane.offset().top;
				let left = $pane.offset().left;

				if((e.offsetY >= top && e.offsetY <= top + $pane.height()) &&
					(e.offsetX >= left && e.offsetX <= left + $pane.width())) {
					$obstacle = $pane;
					return false;
				}
			});

			// no one appropriate obstacle is overlapped
			if($obstacle === null)
				return false;

			if(config.customScrollbar.enabled) {
				let $scrollBar = $obstacle.find('.mCSB_scrollTools_vertical');
				let directionSign = (e.deltaY === 1) ? '+' : '-';

				if($scrollBar.is(':visible')) {
					$obstacle.mCustomScrollbar('scrollTo', [ directionSign + '=250', 0 ], {
						scrollInertia: 500,
						scrollEasing: 'easeOut',
						callbacks: true
					});
				}
			} else {
				if((<HTMLElement>$obstacle[ 0 ]).scrollHeight > (<HTMLElement>$obstacle[ 0 ]).clientHeight) {
					let scrollPosition = $obstacle.scrollTop();
					let scrollOffset = scrollPosition - (200 * e.deltaY);

					fmModel.ddModel.isScrolling = true;
					scrollOffset = (scrollOffset < 0) ? 0 : scrollOffset;
					$obstacle.stop().animate({scrollTop: scrollOffset}, 100, 'linear', function () {
						fmModel.ddModel.isScrolling = false;
						fmModel.ddModel.isScrolled = true;
					});
				}
			}
		});

		this.$viewItems.selectable({
			filter: 'li:not(.directory-parent), tbody > tr:not(.directory-parent)',
			cancel: '.directory-parent, thead',
			disabled: !config.manager.selection.enabled,
			appendTo: this.$viewItems,

			start: (/*event, ui*/) => {
				clearSelection();
				fmModel.itemsModel.isSelecting(true);
			},

			stop: (/*event, ui*/) => {
				fmModel.itemsModel.isSelecting(false);
			},

			selected: (event, ui) => {
				let koItem = ko.dataFor(ui.selected);

				koItem.selected(true);
			},

			unselected: (event, ui) => {
				let koItem = ko.dataFor(ui.unselected);

				koItem.selected(false);
			}
		});

		this.$fileinfo.contextMenu({
			selector: '.view-items',
			zIndex: 10,
			// wrap options with "build" allows to get item element
			build: (/*$triggerElement, e*/) => {
				let contextMenuItems = {
					createFolder: {
						name: lg('create_folder'),
						className: 'create-folder'
					},
					paste: {
						name: lg('clipboard_paste'),
						className: 'paste',
						disabled: (key, options) => fmModel.clipboardModel.isEmpty()
					}
				};

				if(!fmModel.clipboardModel.enabled() || config.options.browseOnly === true)
					delete contextMenuItems.paste;

				return {
					appendTo: '.fm-container',
					items: contextMenuItems,
					reposition: false,
					callback: (itemKey/*, options*/) => {
						switch(itemKey) {
							case 'createFolder':
								fmModel.headerModel.createFolder();
								break;

							case 'paste':
								fmModel.clipboardModel.paste();
								break;
						}
					}
				}
			}
		});

		if(config.extras.extra_js) {
			for(let i = 0; i < config.extras.extra_js.length; i++) {
				$.ajax({
					type: 'GET',
					url: config.extras.extra_js[ i ],
					dataType: 'script',
					async: config.extras.extra_js_async
				});
			}
		}

		// adding a close button triggering callback function if CKEditorCleanUpFuncNum passed
		if(_url_.param('CKEditorCleanUpFuncNum')) {
			fmModel.headerModel.closeButton(true);
			fmModel.headerModel.closeButtonOnClick = () => {
				(<any>parent).CKEDITOR.tools.callFunction(_url_.param('CKEditorCleanUpFuncNum'));
			};
		}

		// input file replacement
		$('#newfile').change(function () {
			$('#filepath').val((<string>$(this).val()).replace(/.+[\\\/]/, ''));
		});

		this.prepareFileTree();
		this.prepareFileView();
		this.setupUploader();

		// Loading CustomScrollbar if enabled
		if(config.customScrollbar.enabled) {
			this.$filetree.mCustomScrollbar({
				theme: config.customScrollbar.theme,
				scrollButtons: {
					enable: config.customScrollbar.button
				},
				advanced: {
					autoExpandHorizontalScroll: true,
					updateOnContentResize: true
				},
				callbacks: {
					onScrollStart: () => {
						fmModel.ddModel.isScrolling = true;
					},
					onScroll: () => {
						fmModel.ddModel.isScrolling = false;
					}
				},
				axis: 'yx'
			});

			this.$previewWrapper.mCustomScrollbar({
				theme: config.customScrollbar.theme,
				scrollButtons: {
					enable: config.customScrollbar.button
				},
				advanced: {
					autoExpandHorizontalScroll: true,
					updateOnContentResize: true,
					updateOnSelectorChange: '.fm-preview-viewer'
				}
			});

			this.$viewItemsWrapper.mCustomScrollbar({
				theme: config.customScrollbar.theme,
				scrollButtons: {
					enable: config.customScrollbar.button
				},
				advanced: {
					autoExpandHorizontalScroll: true,
					updateOnContentResize: true,
					updateOnSelectorChange: '.grid, .list'
				},
				callbacks: {
					onScrollStart: function () {
						if(!fmModel.itemsModel.continiousSelection()) {
							this.yStartPosition = this.mcs.top;
							this.yStartTime = (new Date()).getTime();
						}
						fmModel.ddModel.isScrolling = true;
					},
					onScroll: function () {
						fmModel.ddModel.isScrolling = false;
						fmModel.ddModel.isScrolled = true;
					},
					whileScrolling: function () {
						if(config.manager.selection.enabled) {
							// would prefer to get scroll position from [onScrollStart],
							// but the [onScroll] should fire first, which happens with a big lag
							let timeDiff = (new Date()).getTime() - this.yStartTime;

							// check if selection lasso has not been dropped while scrolling
							if(!fmModel.itemsModel.continiousSelection() && timeDiff > 400)
								this.yStartPosition = this.mcs.top;

							// set flag if selection lasso is active
							if(fmModel.itemsModel.isSelecting())
								fmModel.itemsModel.continiousSelection(true);
							let yIncrement = Math.abs(this.mcs.top) - Math.abs(this.yStartPosition);
							this.$viewItems.selectable('repositionCssHelper', yIncrement, 0);
						}

						if(fmModel.itemsModel.lazyLoad)
							fmModel.itemsModel.lazyLoad.handleScroll(); // use throttle

					}
				},
				axis: 'y',
				alwaysShowScrollbar: 0
			});
		}

		// add useragent string to html element for IE 10/11 detection
		let doc = document.documentElement;

		doc.setAttribute('data-useragent', navigator.userAgent);

		if(config.options.logger) {
			let timeEnd = new Date().getTime();
			let time = timeEnd - this.timeStart;

			console.log(`Total execution time : ${time} ms`);
		}

		let $loading = this.$container.find('.fm-loading-wrap');
		// remove loading screen div
		$loading.fadeOut(800, function () {
			setDimensions();
		});
		setDimensions();
	}

	public sortItems(items) {
		let fmModel = this.fmModel;
		let parentItem;
		let sortOrder = (fmModel.viewMode() === 'list') ? fmModel.itemsModel.listSortOrder() : this.configSortOrder;
		let sortParams = {
			natural: true,
			order: sortOrder === 'asc' ? 1 : -1,
			cases: false
		};

		// shift parent item to unshift it back after sorting
		if(items.length > 0 && items[ 0 ].rdo.type === 'parent')
			parentItem = items.shift();

		items.sort((a, b) => {
			let sortReturnNumber;
			let aa = getSortSubject(a);
			let bb = getSortSubject(b);

			if(aa === bb)
				sortReturnNumber = 0;
			else {
				if(aa === undefined || bb === undefined)
					sortReturnNumber = 0;
				else {
					if(!sortParams.natural || (!isNaN(aa) && !isNaN(bb)))
						sortReturnNumber = aa < bb ? -1 : (aa > bb ? 1 : 0);
					else
						sortReturnNumber = naturalCompare(aa, bb);

				}
			}
			// lastly assign asc/desc
			sortReturnNumber *= sortParams.order;
			return sortReturnNumber;
		});

		/**
		 * Get the string/number to be sorted by checking the array value with the criterium.
		 * @item KO or treeNode object
		 */
		function getSortSubject(item) {
			let sortBy;
			let sortField = this.configSortField;

			if(fmModel.viewMode() === 'list')
				sortField = fmModel.itemsModel.listSortField();

			switch(sortField) {
				case 'type':
					sortBy = item.cdo.extension || '';
					break;
				case 'size':
					sortBy = item.rdo.attributes.size;
					break;
				case 'modified':
					sortBy = item.rdo.attributes.timestamp;
					break;
				case 'dimensions':
					sortBy = item.cdo.dimensions || '';
					break;
				default:
					sortBy = item.rdo.attributes.name;
			}

			// strings should be ordered in lowercase (unless specified)
			if(typeof sortBy === 'string') {
				if(!sortParams.cases)
					sortBy = sortBy.toLowerCase();

				// spaces/newlines
				sortBy = sortBy.replace(/\s+/g, ' ');
			}
			return sortBy;
		}

		/**
		 * Compare strings using natural sort order
		 * http://web.archive.org/web/20130826203933/http://my.opera.com/GreyWyvern/blog/show.dml/1671288
		 */
		function naturalCompare(a, b) {
			let aa = chunkify(a.toString());
			let bb = chunkify(b.toString());

			for(let x = 0; aa[ x ] && bb[ x ]; x++) {
				if(aa[ x ] !== bb[ x ]) {
					let c = Number(aa[ x ]);
					let d = Number(bb[ x ]);

					if(c == aa[ x ] && d == bb[ x ])
						return c - d;
					else
						return aa[ x ] > bb[ x ] ? 1 : -1;

				}
			}
			return aa.length - bb.length;
		}

		/**
		 * Split a string into an array by type: numeral or string
		 */
		function chunkify(t) {
			let tz = [];
			let x = 0;
			let y = -1;
			let n = 0;
			let i;
			let j;

			while(i = (j = t.charAt(x++)).charCodeAt(0)) {
				let m = (i == 46 || (i >= 48 && i <= 57));

				if(m !== n) {
					tz[ ++y ] = '';
					n = m;
				}
				tz[ y ] += j;
			}
			return tz;
		}

		// handle folders position
		let folderItems = [];
		let i = items.length;

		while(i--) {
			if(items[ i ].rdo.type === 'folder') {
				folderItems.push(items[ i ]);
				items.splice(i, 1);
			}
		}
		if(config.options.folderPosition !== 'top')
			folderItems.reverse();

		for(let k = 0, fl = folderItems.length; k < fl; k++) {
			if(config.options.folderPosition === 'top')
				items.unshift(folderItems[ k ]);
			else
				items.push(folderItems[ k ]);

		}

		if(parentItem)
			items.unshift(parentItem);

		return items;
	}


	// Retrieves config settings from config files
	public loadConfigFile(type: string) {
		let url = null;
		let settings = this.settings;

		type = (typeof type === 'undefined') ? 'user' : type;

		if(type === 'user') {
			if(this._url_.param('config'))
				url = `${settings.baseUrl}/config/${this._url_.param('config')}`;
			else
				url = `${settings.baseUrl}/config/filemanager.config.json`;

		} else
			url = `${settings.baseUrl}/config/filemanager.config.default.json`;

		return $.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			cache: false,
			error: (/*response*/) => {
				error(`Given config file (${url}) does not exist!`);
			}
		});
	}

	// Loads a given js/css files dynamically into header
	public loadAssets(assets) {
		let settings = this.settings;

		for(let i = 0, l = assets.length; i < l; i++) {
			if(typeof assets[ i ] === 'string')
				assets[ i ] = settings.baseUrl + assets[ i ];
		}

		toast.apply(this, assets);
	}

	// Loads a given js template file into header if not already included
	public loadTemplate(id/*, data*/) {
        let settings = this.settings;

		return $.ajax({
			type: 'GET',
			url: `${settings.baseUrl}/scripts/templates/${id}.html`,
			error: handleAjaxError
		});
	}

	public extendRequestParams(method, parameters) {
		let methodParams;
		let configParams = config.api.requestParams;

		method = method.toUpperCase();

		if($.isPlainObject(configParams)) {
			methodParams = configParams[ method ];

			if($.isPlainObject(methodParams) && !$.isEmptyObject(methodParams)) {
				let extendParams = $.extend({}, configParams[ 'MIXED' ] || {}, methodParams);

				// append params to serialized form
				if(method === 'POST' && Array.isArray(parameters)) {
					$.each(extendParams, (key, value) => {
						parameters.push({
							name: key,
							value: value
						});
					});
				} else
					parameters = $.extend({}, parameters, extendParams);

			}
		}
		return parameters;
	}

	public buildAjaxRequest(method, parameters): JQuery.PromiseBase {
		return $.ajax({
			type: method,
			cache: false,
			url: this.buildConnectorUrl(),
			dataType: 'json',
			data: this.extendRequestParams(method, parameters)
		});
	}

	// noinspection JSUnusedGlobalSymbols
    public getFilteredFileExtensions() {
		let shownExtensions;
		let _url_ = this._url_;

		if(_url_.param('filter')) {
			if(config.filter[ _url_.param('filter') ] !== undefined)
				shownExtensions = config.filter[ _url_.param('filter') ];

		}
		return shownExtensions;
	}

	public buildConnectorUrl(params?) {
		let defaults = {
			time: new Date().getTime()
		};
		let queryParams = $.extend({}, params || {}, defaults);

		return this.apiConnector + '?' + $.param(queryParams);
	}

	// Build url to preview files
	public createPreviewUrl(resourceObject: ReadableObject, encode) {
	    let settings = this.settings;
		let previewUrl;
		let objectPath = resourceObject.attributes.path;

		if(config.viewer.absolutePath && objectPath) {
			if(encode)
				objectPath = encodePath(objectPath);

			previewUrl = this.buildAbsolutePath(objectPath, false);
		} else {
			let queryParams = this.extendRequestParams('GET', {
				mode: 'readfile',
				path: resourceObject.id
			});
			previewUrl = this.buildConnectorUrl(queryParams);
		}

		previewUrl = settings.callbacks.beforeCreatePreviewUrl(resourceObject, previewUrl);
		return previewUrl;
	}

	// Build url to display image or its thumbnail
	public createImageUrl(resourceObject: ReadableObject, thumbnail, disableCache) {
		let imageUrl;
		let settings = this.settings;

		if(isImageFile(resourceObject.id) &&
			resourceObject.attributes.readable && (
				(thumbnail && config.viewer.image.showThumbs) ||
				(!thumbnail && config.viewer.image.enabled === true)
			)) {
			if(config.viewer.absolutePath && !thumbnail && resourceObject.attributes.path)
				imageUrl = this.buildAbsolutePath(encodePath(resourceObject.attributes.path), disableCache);
			else {
				let queryParams = {path: resourceObject.id, mode: undefined, thumbnail: undefined};

				if(getExtension(resourceObject.id) === 'svg')
					queryParams.mode = 'readfile';
				else {
					queryParams.mode = 'getimage';
					if(thumbnail)
						queryParams.thumbnail = 'true';

				}
				queryParams = this.extendRequestParams('GET', queryParams);
				imageUrl = this.buildConnectorUrl(queryParams);
			}
			imageUrl = settings.callbacks.beforeCreateImageUrl(resourceObject, imageUrl);
		}
		return imageUrl;
	}

	public buildAbsolutePath(path, disableCache) {
		let url = (typeof config.viewer.previewUrl === 'string') ? config.viewer.previewUrl : location.origin;

		url = trim(url, '/') + path;
		// add timestamp-based query parameter to disable browser caching
		if(disableCache)
			url += '?time=' + (new Date().getTime());

		return url;
	}

	public createCopyUrl(resourceObject: ReadableObject) {
		function encodeCopyUrl(path) {
			return (config.clipboard.encodeCopyUrl) ? this.encodePath(path) : path;
		}

		if(config.viewer.absolutePath && resourceObject.attributes.path) {
			let path = encodeCopyUrl(resourceObject.attributes.path);

			return this.buildAbsolutePath(path, false);
		} else {
			let path = encodeCopyUrl(resourceObject.id);
			let mode = (resourceObject.type === 'folder') ? 'getfolder' : 'readfile';

			return `${this.apiConnector}?path=${path}&mode=${mode}`;
		}
	}

	// Returns container for filetree or fileinfo section based on scrollbar plugin state
	// noinspection JSUnusedGlobalSymbols
    public getSectionContainer($section) {
		// if scrollbar plugin is enabled
		if(config.customScrollbar.enabled)
			return $section.find('.mCSB_container');
		else
			return $section;

	}

	// Handle multiple actions in loop with deferred object
	public processMultipleActions(items, callbackFunction: (a: any, b: any) => JQuery.PromiseBase<any>, finishCallback?) {
		let successCounter = 0;
		let totalCounter = items.length;
		let deferred: JQuery.Deferred<any> | JQuery.PromiseBase<any> = $.Deferred().resolve();
		let lg = lg;

		$.each(items, (i, item) => {
			deferred = (<JQuery.Deferred>deferred)
				.then(() => callbackFunction(i, item))
				.then((result: any) => {
					if(result && result.data)
						successCounter++;

				});
		});

		if(totalCounter > 1) {
			(<JQuery.Deferred>deferred).then(() => {
				write(lg('successful_processed').replace('%s', <string>successCounter).replace('%s', <string>totalCounter));
			});
		}

		(<JQuery.Deferred>deferred).then(() => {
			if(typeof finishCallback === 'function')
				finishCallback();

		});
	}

	// Build FileTree and bind events
	public prepareFileTree() {
		let fmModel = this.fmModel;

		if(!config.filetree.enabled)
			return;

		this.$filetree.show();

		// Provides support for adjustible columns.
		this.$splitter.splitter({
			sizeLeft: config.filetree.width,
			minLeft: config.filetree.minWidth,
			minRight: 200
		});

		fmModel.treeModel.loadNodes(null, false);
	}

	// Build FileTree and bind events
	public prepareFileView() {
		let fmModel = this.fmModel;
		fmModel.itemsModel.loadList(this.fileRoot);
	}

	// Check if plugin instance created inside some context
	public hasContext() {
		let _url_ = this._url_;

		return window.opener // window.open()
			|| (window.parent && window.self !== window.parent) // <iframe>
			|| (<any>window).tinyMCEPopup // tinyMCE >= 3.0
			|| _url_.param('field_name') // tinymce 4 or colorbox
			|| _url_.param('CKEditor') // CKEditor 3.0 + integration method
			|| _url_.param('ImperaviElementId'); // Imperavi Redactor I >= 10.x.x
	}

	/*---------------------------------------------------------
 Item Actions
 ---------------------------------------------------------*/

	// Triggered by clicking the "Select" button in detail views
	// or choosing the "Select" contextual menu option in list views.
	// NOTE: closes the window when finished.
	public selectItem(resourceObject: ReadableObject) {
		let contextWindow: any = null;
		let previewUrl = this.createPreviewUrl(resourceObject, true);
		let _url_ = this._url_;
		let settings = this.settings;

		previewUrl = settings.callbacks.beforeSelectItem(resourceObject, previewUrl);

		// tinyMCE > 3.0 integration method
		if((<any>window).tinyMCEPopup) {
			let win = tinyMCEPopup.getWindowArg('window');

			win.document.getElementById(tinyMCEPopup.getWindowArg('input')).value = previewUrl;
			if(typeof(win.ImageDialog) != 'undefined') {
				// Update image dimensions
				if(win.ImageDialog.getImageData)
					win.ImageDialog.getImageData();

				// Preview if necessary
				if(win.ImageDialog.showPreviewImage)
					win.ImageDialog.showPreviewImage(previewUrl);
			}
			tinyMCEPopup.close();
			return;
		}

		// tinymce 4 and colorbox
		if(_url_.param('field_name')) {
			(<HTMLInputElement>parent.document.getElementById(_url_.param('field_name'))).value = previewUrl;

			if(typeof (<any>parent).tinyMCE !== 'undefined')
				(<any>parent).tinyMCE.activeEditor.windowManager.close();
			if(typeof (<any>parent).$.fn.colorbox !== 'undefined')
				(<any>parent).$.fn.colorbox.close();
		}

		if(_url_.param('ImperaviElementId')) {
			// use Imperavi Redactor I, tested on v.10.x.x
			if((<any>window).opener) {
				// Popup
			} else {
				// Modal (in iframe)
				let elementId = _url_.param('ImperaviElementId');
				let instance = (<any>parent).$('#' + elementId).redactor('core.getObject');

				if(instance) {
					instance.modal.close();
					instance.buffer.set(); // for undo action

					if(isImageFile(resourceObject.attributes.name))
						instance.insert.html('<img src="' + previewUrl + '">');
					else
						instance.insert.html('<a href="' + previewUrl + '">' + resourceObject.attributes.name + '</a>');
				}
			}
		}

		// CKEditor 3.0 + integration method
		if(_url_.param('CKEditor')) {
			if((<any>window).opener) {
				// Popup
				(<any>window).opener.CKEDITOR.tools.callFunction(_url_.param('CKEditorFuncNum'), previewUrl);
			} else {
				// Modal (in iframe)
				(<any>parent).CKEDITOR.tools.callFunction(_url_.param('CKEditorFuncNum'), previewUrl);
				(<any>parent).CKEDITOR.tools.callFunction(_url_.param('CKEditorCleanUpFuncNum'));
			}
		}

		// FCKEditor 2.0 integration method
		// todo: https://docs.cksource.com/FCKeditor_2.x/Developers_Guide/JavaScript_API
		if((<any>window).opener && typeof (<any>window).opener.SetUrl === 'function') {
			if(resourceObject.attributes.width) {
				let p = previewUrl;
				let w = resourceObject.attributes.width;
				let h = resourceObject.attributes.height;
				(<any>window).opener.SetUrl(p, w, h);
			} else
				(<any>window).opener.SetUrl(previewUrl);

		}

		// define context window if any
		if((<any>window).opener)
			contextWindow = (<any>window).opener;

		if((<any>window).parent && (<any>window).self !== (<any>window).parent)
			contextWindow = (<any>window).parent;

		// sending post message to the context window
		if(contextWindow) {
			contextWindow.postMessage(
				{
					source: 'richfilemanager',
					preview_url: previewUrl
				}, '*'
			);
		}

		settings.callbacks.afterSelectItem(resourceObject, previewUrl, contextWindow);
	}

	// Renames the current item and returns the new name.
	// Called by clicking the "Rename" button in detail views
	// or choosing the "Rename" contextual menu option in list views.
	public renameItem(resourceObject: ReadableObject) {
		let fmModel = this.fmModel;
		let lg = lg;

        let doRename = function (e, ui: AleritfyDialogUI) {
			let oldPath = resourceObject.id;
			let givenName = ui.getInputValue();

			if(!givenName) {
				// TODO: file/folder message depending on file type
				error(lg('new_filename'));
				return;
			}

			if(!config.options.allowChangeExtensions) {
				let suffix = this.getExtension(resourceObject.attributes.name);

				if(suffix.length > 0)
					givenName = givenName + '.' + suffix;

			}

			// File only - Check if file extension is allowed
			if(this.isFile(oldPath) && !this.isAuthorizedFile(givenName)) {
				let str = '<p>' + lg('INVALID_FILE_TYPE') + '</p>';

				if(config.security.extensions.policy == 'ALLOW_LIST')
					str += '<p>' + lg('ALLOWED_FILE_TYPE').replace('%s', config.security.extensions.restrictions.join(', ')) + '.</p>';

				if(config.security.extensions.policy == 'DISALLOW_LIST')
					str += '<p>' + lg('DISALLOWED_FILE_TYPE').replace('%s', config.security.extensions.restrictions.join(', ')) + '.</p>';

				$('#filepath').val('');
				error(str);
				return;
			}

			// noinspection ReservedWordAsName
            this.buildAjaxRequest('GET', {
				mode: 'rename',
				old: oldPath,
				new: givenName
			}).done(response => {
				if(response.data) {
					let newItem = response.data;

					// handle tree nodes
					let sourceNode = fmModel.treeModel.findByParam('id', oldPath);

					if(sourceNode) {
						if(sourceNode.rdo.type === 'folder') {
							sourceNode.nodeTitle(newItem.attributes.name);
							// update object data for the current and all child nodes
							fmModel.treeModel.actualizeNodeObject(sourceNode, oldPath, newItem.id);
						}
						if(sourceNode.rdo.type === 'file') {
							let parentNode = sourceNode.parentNode();
							let newNode = fmModel.treeModel.createNode(newItem);

							sourceNode.remove();

							if(parentNode)
								fmModel.treeModel.addNodes(parentNode, newNode);

						}
					}

					// handle view objects
					let sourceItem = fmModel.itemsModel.findByParam('id', oldPath);

					if(sourceItem) {
						if(sourceItem.rdo.type === 'parent')
							sourceItem.id = newItem.id;
						else {
							sourceItem.remove();
							fmModel.itemsModel.addNew(newItem);
						}
					}
					// ON rename currently open folder
					if(fmModel.currentPath() === oldPath)
						fmModel.itemsModel.loadList(newItem.id);

					// ON rename currently previewed file
					if(fmModel.previewFile() && fmModel.previewModel.rdo().id === oldPath)
						fmModel.previewModel.applyObject(newItem);

					ui.closeDialog();
					if(config.options.showConfirmation)
						success(lg('successful_rename'));

				}
				handleAjaxResponseErrors(response);
			}).fail(this.handleAjaxError.bind(this));
		};

		prompt({
			message: lg('new_filename'),
			value: config.options.allowChangeExtensions ? resourceObject.attributes.name : getFilename(resourceObject.attributes.name),
			okBtn: {
				label: lg('action_rename'),
				autoClose: false,
				click: doRename
			},
			cancelBtn: {
				label: lg('cancel')
			}
		});
	}

	// Move the current item to specified dir and returns the new name.
	// Called by clicking the "Move" button in de tail views
	// or choosing the "Move" contextual menu option in list views.
	public moveItemPrompt(objects, successCallback) {
		let fmModel = this.fmModel;
		let objectsTotal = objects.length;
		let message = (objectsTotal > 1) ? lg('prompt_move_multiple').replace('%s', objectsTotal) : lg('prompt_move');

		prompt({
			message: message,
			value: fmModel.currentPath(),
			okBtn: {
				label: lg('action_move'),
				autoClose: false,
				click: (e, ui: AleritfyDialogUI) => {
                    let targetPath = ui.getInputValue();

                    if(!targetPath) {
                        error(lg('prompt_foldername'));
                        return;
                    }
                    targetPath = rtrim(targetPath, '/') + '/';
                    successCallback(targetPath);
                }
			},
			cancelBtn: {
				label: lg('cancel')
			},
			template: {
				dialogInput: `<input data-alertify-input type="text" value="" /><div class="prompt-info">${lg('help_move')}</div>`
			}
		});
	}

	// Copy the current item to specified dir and returns the new name.
	// Called upon paste copied items via clipboard.
	public copyItem(resourceObject: ReadableObject, targetPath) {
		let fmModel = this.fmModel;

		return this.buildAjaxRequest('GET', {
			mode: 'copy',
			source: resourceObject.id,
			target: targetPath
		}).done(response => {
			if(response.data) {
				let newItem = response.data;

				fmModel.addItem(newItem, targetPath);

				alertify.clearDialogs();
				if(config.options.showConfirmation)
					success(lg('successful_copied'));

			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Move the current item to specified dir and returns the new name.
	// Called by clicking the "Move" button in detail views
	// or choosing the "Move" contextual menu option in list views.
	public moveItem(resourceObject: ReadableObject, targetPath) {
		let fmModel = this.fmModel;

		// noinspection ReservedWordAsName
        return this.buildAjaxRequest('GET', {
			mode: 'move',
			old: resourceObject.id,
			new: targetPath
		}).done(response => {
			if(response.data) {
				let newItem = response.data;

				fmModel.removeItem(resourceObject);
				fmModel.addItem(newItem, targetPath);

				// ON move currently open folder to another folder
				if(fmModel.currentPath() === resourceObject.id)
					fmModel.itemsModel.loadList(newItem.id);

				// ON move currently previewed file
				if(fmModel.previewFile() && fmModel.previewModel.rdo().id === resourceObject.id)
					fmModel.previewFile(false);

				alertify.clearDialogs();
				if(config.options.showConfirmation)
					success(lg('successful_moved'));

			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Prompts for confirmation, then deletes the current item.
	public deleteItemPrompt(objects, successCallback) {
		let objectsTotal = objects.length;
		let message = (objectsTotal > 1) ? lg('confirm_delete_multiple').replace('%s', objectsTotal) : lg('confirm_delete');

		confirm({
			message: message,
			okBtn: {
				label: lg('yes'),
				click: (/*e, ui: AleritfyDialogUI*/) => {
					successCallback();
				}
			},
			cancelBtn: {
				label: lg('no')
			}
		});
	}

	// Delete item by path
	public deleteItem(path) {
		let fmModel = this.fmModel;

		return this.buildAjaxRequest('GET', {
			mode: 'delete',
			path: path
		}).done(response => {
			if(response.data) {
				let targetItem = response.data;

				fmModel.removeItem(targetItem);

				// ON delete currently previewed file
				if(fmModel.previewFile() && fmModel.previewModel.rdo().id === targetItem.id)
					fmModel.previewFile(false);

				if(config.options.showConfirmation)
					success(lg('successful_delete'));

			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Starts file download process.
	// Called by clicking the "Download" button in detail views
	// or choosing the "Download" contextual menu item in list views.
	public downloadItem(resourceObject: ReadableObject) {
		let queryParams = {
			mode: 'download',
			path: resourceObject.id
		};

		return this.buildAjaxRequest('GET', queryParams).done(response => {
			if(response.data) {
				//window.location = buildConnectorUrl(queryParams);
				(<JQuery>$).fileDownload(this.buildConnectorUrl(queryParams));
			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Creates CodeMirror instance to let user change the content of the file
	public previewItem(resourceObject: ReadableObject) {
		return this.buildAjaxRequest('GET', {
			mode: 'editfile',
			path: resourceObject.id
		}).done(response => {
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Save CodeMirror editor content to file
    // noinspection JSUnusedLocalSymbols
    public saveItem(resourceObject: ReadableObject) {
		let fmModel = this.fmModel;
		let formParams = $('#fm-js-editor-form').serializeArray();

		this.buildAjaxRequest('POST', formParams).done(response => {
			if(response.data) {
				let dataObject = response.data;
				let preview_model = fmModel.previewModel;
				let content = preview_model.editor.content();

				// update preview object data
				preview_model.rdo(dataObject);

				// assign new content to the viewer and close editor
				preview_model.viewer.content(content);
				preview_model.closeEditor();

				// replace original item with a new one to adjust observable items
				let newItem = fmModel.itemsModel.createObject(dataObject);
				let originalItem = fmModel.itemsModel.findByParam('id', dataObject.id);

				fmModel.itemsModel.objects.replace(originalItem, newItem);

				success(lg('successful_edit'));
			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	public getItemInfo(targetPath) {
		return this.buildAjaxRequest('GET', {
			mode: 'getfile',
			path: targetPath
		}).done(response => {
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Display storage summary info
	public summarizeItems() {
		let fmModel = this.fmModel;

		return this.buildAjaxRequest('GET', {
			mode: 'summarize'
		}).done(response => {
			if(response.data) {
				let data = response.data.attributes;
				let size = formatBytes(data.size, true);

				if(data.sizeLimit > 0) {
					let sizeTotal = formatBytes(data.sizeLimit, true);
					let ratio = data.size * 100 / data.sizeLimit;
					let percentage = Math.round(ratio * 100) / 100;

					size += ' (' + percentage + '%) ' + lg('of') + ' ' + sizeTotal;
				}

				fmModel.summaryModel.files(data.files);
				fmModel.summaryModel.folders(data.folders);
				fmModel.summaryModel.size(size);

				fmModel.summaryModel.enabled(true);
				let $summary = $('#summary-popup').clone().show();

				fmModel.summaryModel.enabled(false);

				alert((<HTMLElement>$summary[ 0 ]).outerHTML);
			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Prompts for confirmation, then extracts the current archive.
	public extractItemPrompt(resourceObject: ReadableObject) {
		let fmModel = this.fmModel;

		prompt({
			message: lg('prompt_extract'),
			value: fmModel.currentPath(),
			okBtn: {
				label: lg('action_extract'),
				autoClose: false,
				click: (e, ui: AleritfyDialogUI) => {
					let targetPath = ui.getInputValue();

					if(!targetPath) {
						error(lg('prompt_foldername'));
						return;
					}
					targetPath = rtrim(targetPath, '/') + '/';

					this.extractItem(resourceObject, targetPath)
				}
			},
			cancelBtn: {
				label: lg('cancel')
			}
		});
	}

	// Extract files and folders from archive.
	// Called by choosing the "Extract" contextual menu option in list views.
	public extractItem(resourceObject: ReadableObject, targetPath) {
		let fmModel = this.fmModel;

		this.buildAjaxRequest('POST', {
			mode: 'extract',
			source: resourceObject.id,
			target: targetPath
		}).done(response => {
			if(response.data) {
				// TODO: implement "addItems", add in batches
				$.each(response.data, (i, resourceObject) => {
					fmModel.addItem(resourceObject, targetPath);
				});

				alertify.clearDialogs();
				if(config.options.showConfirmation)
					success(lg('successful_extracted'));

			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	/*---------------------------------------------------------
 Functions to Retrieve File and Folder Details
 ---------------------------------------------------------*/

	// Retrieves file or folder info based on the path provided.
	public getDetailView(resourceObject: ReadableObject) {
		let fmModel = this.fmModel;

		if(!resourceObject.attributes.readable) {
			error(lg('NOT_ALLOWED_SYSTEM'));
			return false;
		}
		if(resourceObject.type === 'file')
			fmModel.previewModel.applyObject(resourceObject);

		if(resourceObject.type === 'folder' || resourceObject.type === 'parent') {
			fmModel.previewFile(false);
			fmModel.itemsModel.loadList(resourceObject.id);
		}
	}

	// Options for context menu plugin
	public getContextMenuItems(resourceObject: ReadableObject) {
		let fmModel = this.fmModel;
		let clipboardDisabled = !fmModel.clipboardModel.enabled();
		// noinspection ReservedWordAsName
        let contextMenuItems = {
			select: {name: lg('action_select'), className: 'select'},
			download: {name: lg('action_download'), className: 'download'},
			rename: {name: lg('action_rename'), className: 'rename'},
			move: {name: lg('action_move'), className: 'move'},
			separator1: '-----',
			copy: {name: lg('clipboard_copy'), className: 'copy'},
			cut: {name: lg('clipboard_cut'), className: 'cut'},
			delete: {name: lg('action_delete'), className: 'delete'},
			extract: {name: lg('action_extract'), className: 'extract'},
			copyUrl: {name: lg('copy_to_clipboard'), className: 'copy-url'}
		};

		if(!this.has_capability(resourceObject, 'download')) delete contextMenuItems.download;
		if(!this.has_capability(resourceObject, 'select') || !this.hasContext()) delete contextMenuItems.select;
		if(!this.has_capability(resourceObject, 'rename') || config.options.browseOnly === true) delete contextMenuItems.rename;
		if(!this.has_capability(resourceObject, 'delete') || config.options.browseOnly === true) delete contextMenuItems.delete;
		if(!this.has_capability(resourceObject, 'extract') || config.options.browseOnly === true) delete contextMenuItems.extract;
		if(!this.has_capability(resourceObject, 'copy') || config.options.browseOnly === true || clipboardDisabled) delete contextMenuItems.copy;
		if(!this.has_capability(resourceObject, 'move') || config.options.browseOnly === true || clipboardDisabled) {
			delete contextMenuItems.cut;
			delete contextMenuItems.move;
		}

		return contextMenuItems
	}

	// Binds contextual menu to items in list and grid views.
	public performAction(action, options, targetObject: ReadableObject, selectedObjects?) {
		let fmModel = this.fmModel;
		// suppose that target object is part of selected objects while multiple selection
		let objects = selectedObjects ? selectedObjects : [ targetObject ];

		switch(action) {
			case 'select':
				this.selectItem(targetObject);
				break;

			case 'download':
				$.each(objects, (i, itemObject) => {
					this.downloadItem(itemObject);
				});
				break;

			case 'rename':
				this.renameItem(targetObject);
				break;

			case 'move':
				this.moveItemPrompt(objects, targetPath => {
					this.processMultipleActions(objects, (i, itemObject) => this.moveItem(itemObject, targetPath));
				});
				break;

			case 'delete':
				this.deleteItemPrompt(objects, () => {
					this.processMultipleActions(objects, (i, itemObject) => this.deleteItem(itemObject.id));
				});
				break;

			case 'extract':
				this.extractItemPrompt(targetObject);
				break;

            case 'copy':
				fmModel.clipboardModel.copy(/*objects*/); // todo: this doesn't take an argument
				break;

			case 'cut':
				fmModel.clipboardModel.cut(/*objects*/); // todo: this doesn't take an argument
				break;

			case 'copyUrl':
				let clipboard = new Clipboard(options.$selected[ 0 ], {
					text: trigger => this.createCopyUrl(targetObject)
				});

				clipboard.on('success', (/*e*/) => {
					success(lg('copied'));
					clipboard.destroy();
				});
				break;
		}
	}

	// Handling file uploads
	public setupUploader() {
		let fmModel = this.fmModel;
		let lg = lg;
		let settings = this.settings;

		if(config.options.browseOnly)
			return false;

		// Multiple Uploads
		if(config.upload.multiple) {
			// remove simple file upload element
			$('#file-input-container').remove();

			this.$uploadButton.unbind().click(() => {
				if(this.capabilities.indexOf('upload') === -1) {
					error(lg('NOT_ALLOWED'));
					return false;
				}

				let allowedFileTypes = null;
				let currentPath = fmModel.currentPath();
				let templateContainer = tmpl('tmpl-fileupload-container', {
					folder: lg('current_folder') + currentPath,
					info: lg('upload_files_number_limit').replace('%s', <string>config.upload.maxNumberOfFiles) + ' ' + lg('upload_file_size_limit').replace('%s', formatBytes(config.upload.fileSizeLimit, true)),
					lang: LangModel.getTranslations()
				});

				if(config.security.extensions.policy == 'ALLOW_LIST')
					allowedFileTypes = new RegExp('(\\.|\\/)(' + config.security.extensions.restrictions.join('|') + ')$', 'i');

				dialog({
					message: templateContainer,
					width: 'auto',
					buttons: [ {
						type: 'ok',
						label: lg('action_upload'),
						autoClose: false,
						click: (/*e, ui: AleritfyDialogUI*/) => {
							if($dropzone.children('.upload-item').length > 0)
								$dropzone.find('.button-start').trigger('click');
							else
								error(lg('upload_choose_file'));
						}
					}, {
						label: lg('action_select'),
						closeOnClick: false,
						click: (/*e, ui: AleritfyDialogUI*/) => {
							$('#fileupload', $uploadContainer).trigger('click');
						}
					}, {
						type: 'cancel',
						label: lg('close')
					} ]
				});

				let $uploadContainer = $('.fm-fileupload-container');
				let $dropzone = $('.dropzone', $uploadContainer);
				let $dropzoneWrapper = $('.dropzone-wrapper', $uploadContainer);
				let $totalProgressBar = $('#total-progress', $uploadContainer).children();

				if(config.customScrollbar.enabled) {
					$dropzoneWrapper.mCustomScrollbar({
						theme: config.customScrollbar.theme,
						scrollButtons: {
							enable: config.customScrollbar.button
						},
						advanced: {
							autoExpandHorizontalScroll: true,
							updateOnContentResize: true
						},
						callbacks: {
							onOverflowY: () => {
								$dropzoneWrapper.find('.mCSB_container').css({
									'margin-right': $dropzoneWrapper.find('.mCSB_scrollTools').width()
								});
							},
							onOverflowYNone: () => {
								$dropzoneWrapper.find('.mCSB_container').css({
									'margin-right': 'auto'
								});
							}
						},
						axis: 'y'
					});
				}

				$dropzoneWrapper.on('click', function (e) {
					if(e.target === this || $(e.target).parent()[ 0 ] === this || e.target === $dropzone[ 0 ] || $(e.target).parent().hasClass('default-message'))
						$('#fileupload', $uploadContainer).trigger('click');

				});

				/**
				 * Start uploading process.
				 */
				$dropzone.on('click', '.button-start', function (/*e*/) {
					let $target = $(this);
					let $buttons = $target.parent().parent();
					let data = $buttons.data();

					data.submit();
					$target.remove();
				});

				/**
				 * Abort uploading process.
				 */
				$dropzone.on('click', '.button-abort', function (/*e*/) {
					let $target = $(this);
					let $buttons = $target.parent().parent();
					let data = $buttons.data();
					let $node = data.files[ 0 ].context;

					data.abort();
					$node.find('.error-message').text(lg('upload_aborted'));
					$node.addClass('aborted');
				});

				/**
				 * Resume uploading if at least one chunk was uploaded.
				 * Otherwise start upload from the very beginning of file.
				 */
				$dropzone.on('click', '.button-resume', function (e) {
					let $target = $(this);
					let $buttons = $target.parent().parent();
					let data = $buttons.data();
					let file: any = data.files[ 0 ];

					function resumeUpload(data) {
						(<JQuery>$).blueimp.fileupload.prototype.options.add.call($('#fileupload')[ 0 ], e, data);
						data.submit();
					}

					if(file.chunkUploaded) {
						let targetPath = currentPath + file.serverName;

						this.getItemInfo(targetPath).then(function (response) {
							if(response.data) {
								data.uploadedBytes = Number(response.data.attributes.size);
								if(!data.uploadedBytes)
									file.chunkUploaded = undefined;

								resumeUpload(data);
							}
						});
					} else
						resumeUpload(data);

				});

				/**
				 * Remove file from upload query.
				 * Also remove uploaded file chunks if were uploaded.
				 */
				$dropzone.on('click', '.button-remove', function (/*e*/) {
					let $target = $(this);
					let $buttons = $target.parent().parent();
					let data = $buttons.data();
					let file = data.files[ 0 ];

					if(file.chunkUploaded)
						this.deleteItem(currentPath + file.serverName);

					$target.closest('.upload-item').remove();
					updateDropzoneView();
				});

				$dropzone.on('click', '.button-info', function (/*e*/) {
					let $target = $(this);
					let $node = $target.closest('.upload-item');

					if($node.hasClass('error')) {
						let $message = $node.find('.error-message');

						error($message.text());
					}
				});

				let updateDropzoneView = function () {
					if($dropzone.children('.upload-item').length > 0)
						$dropzone.addClass('started');
					else
						$dropzone.removeClass('started');
				};

				let shownExtensions = fmModel.filterModel.getExtensions();

				if(shownExtensions) {
					$('#fileupload').attr('accept', shownExtensions.map(function (el) {
						return '.' + el;
					}).join());
				}

				$('#fileupload', $uploadContainer)
					.fileupload({
						autoUpload: false,
						sequentialUploads: true,
						dataType: 'json',
						dropZone: $dropzone,
						maxChunkSize: config.upload.chunkSize,
						url: this.buildConnectorUrl(),
						paramName: 'files',
						singleFileUploads: true,
						formData: this.extendRequestParams('POST', {
							mode: 'upload',
							path: currentPath
						}),
						// validation
						// maxNumberOfFiles works only for single "add" call when "singleFileUploads" is set to "false"
						maxNumberOfFiles: config.upload.maxNumberOfFiles,
						acceptFileTypes: allowedFileTypes,
						maxFileSize: config.upload.fileSizeLimit,
						messages: {
							maxNumberOfFiles: lg('upload_files_number_limit').replace('%s', <string>config.upload.maxNumberOfFiles),
							acceptFileTypes: lg('upload_file_type_invalid'),
							maxFileSize: `${lg('upload_file_too_big')} ${lg('upload_file_size_limit').replace('%s', formatBytes(config.upload.fileSizeLimit, true))}`
						},
						// image preview options
						previewMaxHeight: 120,
						previewMaxWidth: 120,
						previewCrop: true
					})

					.on('fileuploadadd', (e, data) => {
						let $items = $dropzone.children('.upload-item');
						$.each(data.files, (index, file) => {
							// skip selected files if total files number exceed "maxNumberOfFiles"
							if($items.length >= config.upload.maxNumberOfFiles) {
								error(lg('upload_files_number_limit').replace('%s', <string>config.upload.maxNumberOfFiles), {
									logClass: 'fileuploadadd',
									unique: true
								});
								return false;
							}
							// to display in item template
							file.formattedSize = formatBytes(file.size);
							let $template = $(tmpl('tmpl-upload-item', {
								file: file,
								lang: LangModel.getTranslations(),
								imagesPath: `${settings.baseUrl}/scripts/jQuery-File-Upload/img`
							}));
							file.context = $template;
							$template.find('.buttons').data(data);
							$template.appendTo(<HTMLElement>$dropzone);
						});
						updateDropzoneView();
					})

					.on('fileuploadsend', (e, data) => {
						$.each(data.files, (index, file) => {
							let $node = file.context;
							$node.removeClass('added aborted error').addClass('process');

							// workaround to handle a case while chunk uploading when you may press abort button after
							// uploading is done, but right before "fileuploaddone" event is fired, and try to resume upload
							if(file.chunkUploaded && (data.total === data.uploadedBytes))
								$node.remove();

						});
					})

					.on('fileuploadfail', (e, data) => {
						$.each(data.files, (index, file) => {
							file.error = lg('upload_failed');
							let $node = file.context;
							$node.removeClass('added process').addClass('error');
						});
					})

					.on('fileuploaddone', (e, data) => {
						let response = data.result;
						$.each(data.files, (index, file) => {
							let $node = file.context;
							// handle server-side errors
							if(response && response.errors) {
								$node.removeClass('added process').addClass('error');
								$node.find('.error-message').text(formatServerError(response.errors[ 0 ]));
								$node.find('.button-start').remove();
							} else
							// remove file preview item on success upload
								$node.remove();

						});
					})

					.on('fileuploadalways', (e, data) => {
						let response = data.result;
						$.each(data.files, (index/*, file*/) => {
							if(response && response.data && response.data[ index ]) {
								let resourceObject = response.data[ index ];

								fmModel.removeItem(resourceObject);
								fmModel.addItem(resourceObject, fmModel.currentPath());
							}
						});

						let $items = $dropzone.children('.upload-item');
						// all files in queue are processed
						if($items.filter('.added').length === 0 && $items.filter('.process').length === 0) {
							// all files were successfully uploaded
							if($items.length === 0) {
								alertify.clearDialogs();

								if(config.options.showConfirmation)
									success(lg('upload_successful_files'));

							}
							// errors occurred
							if($items.filter('.error').length)
								error(lg('upload_partially') + '<br>' + lg('upload_failed_details'));

						}
						updateDropzoneView();
					})

					.on('fileuploadchunkdone', (e, data) => {
						let response = data.result;
						$.each(data.files, (index, file) => {
							if(response.data && response.data[ index ]) {
								let resourceObject = response.data[ index ];

								fmModel.removeItem(resourceObject);
								fmModel.addItem(resourceObject, fmModel.currentPath());

								// get filename from server, it may differ from original
								file.serverName = resourceObject.attributes.name;
								// mark that file has uploaded chunk(s)
								file.chunkUploaded = 1;
							}
						});
					})

					.on('fileuploadprocessalways', (e, data) => {
						$.each(data.files, (index, file) => {
							let $node = file.context;
							// file wasn't added to queue (due to config.upload.maxNumberOfFiles limit e.g.)
							if(typeof $node === 'undefined')
								return;

							// show preview for image file
							if(file.preview) {
								$node.find('.image').append(file.preview);
								$node.find('.preview').removeClass('file-preview').addClass('image-preview');
							}
							// handle client-side error
							if(file.error) {
								$node.removeClass('added process').addClass('error');
								$node.find('.error-message').text(file.error);
								$node.find('.button-start').remove();
							}
						});
					})

					.on('fileuploadprogress', (e, data) => {
						$.each(data.files, (index, file) => {
							// fill progress bar for single item
							let $node = file.context;
							let progress = parseInt(data.loaded / data.total * 100, 10);

							$node.find('.progress-bar').css('width', progress + '%');
						});
					})

					.on('fileuploadprogressall', (e, data) => {
						// fill total progress bar
						let progress = parseInt(data.loaded / data.total * 100, 10);

						$totalProgressBar.css('width', progress + '%');
					});
			});

			// Simple Upload
		} else {

			this.$uploadButton.click(function () {
				if(this.capabilities.indexOf('upload') === -1) {
					error(lg('NOT_ALLOWED'));
					return false;
				}

				let data = $(this).data();

				if($.isEmptyObject(data))
					error(lg('upload_choose_file'));
				else
					data.submit();

			});

			this.$uploader
				.fileupload({
					autoUpload: false,
					dataType: 'json',
					url: this.buildConnectorUrl(),
					paramName: 'files',
					maxChunkSize: config.upload.chunkSize
				})

				.on('fileuploadadd', (e: JQueryEventObject, data: JQueryFileInputOptions) => {
					this.$uploadButton.data(data);
				})

				.on('fileuploadsubmit', (e: JQueryEventObject, data: JQueryFileInputOptions) => {
					data.formData = this.extendRequestParams('POST', {
						mode: 'upload',
						path: fmModel.currentPath()
					});
					this.$uploadButton.addClass('loading').prop('disabled', true);
					this.$uploadButton.children('span').text(lg('loading_data'));
				})

				.on('fileuploadalways', (e: JQueryEventObject, data: JQueryFileUploadXhr) => {
					$('#filepath').val('');
					this.$uploadButton.removeData().removeClass('loading').prop('disabled', false);
					this.$uploadButton.children('span').text(lg('action_upload'));
					let response = data.result;

					// handle server-side errors
					if(response && response.errors)
						error(lg('upload_failed') + '<br>' + formatServerError(response.errors[ 0 ]));

					if(response && response.data) {
						let resourceObject = response.data[ 0 ];

						fmModel.removeItem(resourceObject);
						fmModel.addItem(resourceObject, fmModel.currentPath());

						if(config.options.showConfirmation)
							success(lg('upload_successful_file'));

					}
				})

				.on('fileuploadchunkdone', (e, data) => {
					let response = data.result;

					if(response.data && response.data[ 0 ]) {
						let resourceObject = response.data[ 0 ];

						fmModel.removeItem(resourceObject);
						fmModel.addItem(resourceObject, fmModel.currentPath());
					}
				})

				.on('fileuploadfail', (/*e, data*/) => {
					// server error 500, etc.
					error(lg('upload_failed'));
				});
		}
	}

	// Test if item has the 'cap' capability
	// 'cap' is one of 'select', 'rename', 'delete', 'download', 'copy', 'move'
	public has_capability(resourceObject: ReadableObject, cap) {
		if(this.capabilities.indexOf(cap) === -1) return false;
		if(cap === 'select' && resourceObject.type === 'folder') return false;
		if(cap === 'extract') {
			let extension = getExtension(resourceObject.attributes.name);

			return (resourceObject.type === 'file' && extension === 'zip');
		}
		if(cap === 'download' && resourceObject.type === 'folder')
			return (config.options.allowFolderDownload === true);

		if(typeof(resourceObject.attributes.capabilities) !== 'undefined')
			return $.inArray(cap, resourceObject.attributes.capabilities) > -1;

		return true;
	}

	// Forces columns to fill the layout vertically.
	// Called on initial page load and on resize.
	public setDimensions() {
		let padding = this.$wrapper.outerHeight(true) - this.$wrapper.height();
		let newH = $(window).height() - this.$header.height() - this.$footer.height() - padding;
		let newW = this.$splitter.width() - this.$splitter.children('.splitter-bar-vertical').outerWidth() - this.$filetree.outerWidth();

		this.$splitter.height(newH);
		this.$fileinfo.width(newW);
	}

}
