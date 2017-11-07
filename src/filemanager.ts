import * as CodeMirror from "codemirror";
import * as purl from "purl";

import {buildLangFileUrl, getLang, getTranslations, init, setLang, setTranslations, translate} from "./LangModel";

/// <reference types="alertify"/>
/// <reference types="jquery"/>
/// <reference types="jqueryui"/>
/// <reference types="types.d.ts"/>

type ConfigOptions = {
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

interface Config {
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
	options : ConfigOptions;
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

interface ReadableObject {
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

interface ComputedDataObject {
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

interface Settings {
    baseUrl: string;
    config: Config;
    callbacks: any;
}

interface Editor {
    interactive: boolean;
}

interface Viewer {
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

type Params = {
  mode?: string;
  path: string;
  type?: string;
  thumbnail?: any;
};

let config: Config;
let $fileinfo: JQuery; // Temporary Workaround

////////////////////////

// Test if a given url exists
function file_exists(url: string): JQuery.jqXHR {
    return $.ajax({
        type: 'HEAD',
        url: url
    });
}

function expandNode(node: TreeNodeObject): boolean {
    if (node.isExpanded() === false && node.isLoaded() === true) {
        node.isSliding(true);
        return true;
    }
    return false;
}

function collapseNode(node: TreeNodeObject): boolean {
    if (node.isExpanded() === true) {
        node.isSliding(true);
        return true;
    }
    return false;
}

// Test if path is dir
function isFile(path: string) {
    return path.charAt(path.length - 1) !== '/';
}

// Replace all leading or trailing chars with an empty string
function trim(string: string, char: string): string {
    let regExp = new RegExp(`^${char}+|${char}+$`, 'g');

    return string.replace(regExp, '');
}

// Replace all leading chars with an empty string
function ltrim(string: string, char: string): string {
    let regExp = new RegExp(`^${char}+`, 'g');

    return string.replace(regExp, '');
}

// Replace all trailing chars with an empty string
function rtrim(string: string, char: string): string {
    let regExp = new RegExp(`${char}+$`, 'g');

    return string.replace(regExp, '');
}

function startsWith(string: string, searchString: string, position?: number): boolean {
    position = position || 0;
    return string.substr(position, searchString.length) === searchString;
}

// invert backslashes and remove duplicated ones
function normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}

// return filename extension
function getExtension(filename: string): string {

    if (filename.split('.').length === 1)
        return '';

    return (<string>filename.split('.').pop()).toLowerCase();
}

// return filename without extension
function getFilename(filename: string): string {
    if (filename.lastIndexOf('.') !== -1)
        return filename.substring(0, filename.lastIndexOf('.'));
    else
        return filename;

}

// return path without filename
// "/dir/to/" 		  --> "/dir/to/"
// "/dir/to/file.txt" --> "/dir/to/"
function getDirname(path: string): string {
    if (path.lastIndexOf('/') !== path.length - 1)
        return path.substr(0, path.lastIndexOf('/') + 1);
    else
        return path;

}

// return parent folder for path, if folder is passed it should ends with '/'
// "/dir/to/"          -->  "/dir/"
// "/dir/to/file.txt"  -->  "/dir/"
function getParentDirname(path: string): string {
    return path.split('/').reverse().slice(2).reverse().join('/') + '/';
}

// return closest node for path
// "/dir/to/"          -->  "/dir/"
// "/dir/to/file.txt"  -->  "/dir/to/"
function getClosestNode(path: string): string {
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

function write(message: string, obj?: AlertifyOptions): IAlertify {
    let options: AlertifyOptions = $.extend({}, {
        reset: true,
        delay: 5000,
        logMaxItems: 5,
        logPosition: 'bottom right',
        logContainerClass: 'fm-log',
        parent: $('.fm-popup').is(':visible') ? document.body : $fileinfo[0],
        onClick: undefined,
        unique: false,
        type: 'log'
    }, obj);

    // display only one log for the specified 'logClass'
    if (options.logClass && options.unique && $('.fm-log').children('.' + options.logClass).length > 0)
        return alertify;

    if (options.reset)
        alertify.reset();

    if (options.parent)
        alertify.parent(options.parent);

    alertify.logDelay(options.delay);
    alertify.logMaxItems(options.logMaxItems);
    alertify.logPosition(options.logPosition);
    alertify.logContainerClass(options.logContainerClass);
    (<any>alertify[options.type])(message, options.onClick);

    return alertify;
}

function error(message: string, options?: AlertifyOptions) {
    return write(message, $.extend({}, {
        type: 'error',
        delay: 10000
    }, options));
}

function warning(message: string, options?: AlertifyOptions) {
    return write(message, $.extend({}, {
        type: 'warning',
        delay: 10000
    }, options));
}

function success(message: string, options?: AlertifyOptions) {
    return write(message, $.extend({}, {
        type: 'success',
        delay: 6000
    }, options));
}

function alert(message: string) {
    alertify
        .reset()
        .dialogContainerClass('fm-popup')
        .alert(message);
}

function confirm(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width)
        .dialogPersistent(<boolean>obj.persistent)
        .dialogContainerClass('fm-popup')
        .confirm(<string>obj.message, obj.okBtn, obj.cancelBtn);
}

function prompt(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width) // dialogWidth
        .dialogPersistent(<boolean>obj.persistent) // dialogPersistent
        .dialogContainerClass('fm-popup')
        .theme(<AlertifyTemplates>obj.template)
        .prompt(<string>obj.message, obj.value || '', obj.okBtn, obj.cancelBtn);
}

function dialog(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width)
        .dialogPersistent(<boolean>obj.persistent)
        .dialogContainerClass('fm-popup')
        .dialog(<string>obj.message, obj.buttons);
}

// Wrapper for translate method
function lg(key: string): string {
    return translate(key);
}
// Converts bytes to KB, MB, or GB as needed for display
function formatBytes(bytes: number | string, round?: boolean): string {
    if(!bytes) return '';
    round = round || false;
    let n = parseFloat(<string>bytes);
    let d = parseFloat(<any>(round ? 1000 : 1024));
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

function log(..._args: any[]): void {
    if((<ConfigOptions>config.options).logger && arguments) {
        [].unshift.call(arguments, new Date().getTime());
        console.log.apply(console, arguments);
    }
}

// Format server-side response single error object
function formatServerError(errorObject: any): string {
    let message: string;
    // look for message in case an error CODE is provided
    if(getLang() && lg(errorObject.message)) {
        message = lg(errorObject.message);
        $.each(errorObject.arguments, (_i, argument) => {
            message = message.replace('%s', argument);
        });
    } else
        message = errorObject.message;

    return message;
}

// Handle ajax request error.
function handleAjaxError(response: JQuery.jqXHR): void {

    log(response.responseText || response);
    error(lg('ERROR_SERVER'));
    error(response.responseText);
}

// Handle ajax json response error.
function handleAjaxResponseErrors(response: any) { // todo: no errors in JQuery.jqXHR
    if(response.errors) {
        log(response.errors);
        $.each(response.errors, (_i, errorObject) => {
            error(formatServerError(errorObject));

            if(errorObject.arguments.redirect)
                window.location.href = errorObject.arguments.redirect;

        });
    }
}

// Test if file is authorized, based on extension only
function isAuthorizedFile(filename: string): boolean {
    let ext: string = getExtension(filename);

    if(config.security.extensions.ignoreCase) {
        if(config.security.extensions.policy == 'ALLOW_LIST')
            if(inArrayInsensitive(ext, config.security.extensions.restrictions) !== -1) return true;

        if(config.security.extensions.policy == 'DISALLOW_LIST')
            if(inArrayInsensitive(ext, config.security.extensions.restrictions) === -1) return true;

    } else {
        if(config.security.extensions.policy == 'ALLOW_LIST')
            if($.inArray(ext, config.security.extensions.restrictions) !== -1) return true;

        if(config.security.extensions.policy == 'DISALLOW_LIST')
            if($.inArray(ext, config.security.extensions.restrictions) === -1) return true;

    }

    return false;
}

function encodePath(path: string): string {
    let parts: string[] = [];
    $.each(path.split('/'), (_i, part) => {
        parts.push(encodeURIComponent(part));
    });
    return parts.join('/');
}

// Test if is editable file
function isEditableFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.editor.extensions) !== -1);
}

// Test if is image file
function isImageFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.image.extensions) !== -1);
}

// Test if file is supported web video file
function isVideoFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.video.extensions) !== -1);
}

// Test if file is supported web audio file
function isAudioFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.audio.extensions) !== -1);
}

// Test if file is openable in iframe
function isIFrameFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.iframe.extensions) !== -1);
}

// Test if file is opendoc file
// Supported file types: http://viewerjs.org/examples/
function isOpenDocFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.opendoc.extensions) !== -1);
}

// Test if file is supported by Google Docs viewer
// Supported file types: http://stackoverflow.com/q/24325363/1789808
function isGoogleDocsFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.google.extensions) !== -1);
}

// Test if file is supported by CodeMirror renderer
function isCodeMirrorFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.codeMirrorRenderer.extensions) !== -1);
}

// Test if file is supported by Markdown-it renderer, which renders .md files to HTML
function isMarkdownFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.markdownRenderer.extensions) !== -1);
}

function inArrayInsensitive(elem: any, arr: any[], i?: number): number {
    if(typeof elem !== 'string')
        return $.inArray.apply(null, arguments);

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
///////////////////////

/**
 * Plugin's default options
 */
let defaults: Settings = {
	baseUrl: '.',	// relative path to the FM plugin folder
	config: <Config>{},		// configuration options
	callbacks: {
		beforeCreateImageUrl: (_resourceObject: ReadableObject, url: string): string => url,
		beforeCreatePreviewUrl: (_resourceObject: ReadableObject, url: string): string => url,
		beforeSelectItem: (_resourceObject: ReadableObject, url: string): string => url,
		afterSelectItem: (/*resourceObject, url, contextWindow*/) => { }
	}
};

class PreviewModel {
	// let preview_model: PreviewModel = this;
	// let clipboard: Clipboard = null;

    clipboard: Clipboard;
	rdo: KnockoutObservable<ReadableObject>;
	cdo: KnockoutObservable<ComputedDataObject>;
	viewer: KnockoutObservableViewer;
	renderer: RenderModel;
	editor: EditorModel;
	previewIconClass: KnockoutComputed<string>;

	constructor(private rfp: richFilemanagerPlugin) {
		this.rdo = ko.observable(<ReadableObject>{});
		// computed resource data object
		this.cdo = ko.observable(<ComputedDataObject>{});

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

		this.rdo.subscribe((resourceObject: ReadableObject) => {
            this.cdo(<ComputedDataObject>{
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
		let settings = this.rfp.settings;
        let createCopyUrl = this.rfp.createCopyUrl;
        let createImageUrl = this.rfp.createImageUrl;
        let createPreviewUrl = this.rfp.createPreviewUrl;
        let previewItem = this.rfp.previewItem;
        let previewFile = this.rfp.fmModel.previewFile;

		if(this.clipboard)
			this.clipboard.destroy();

		previewFile(false);

		let filename: string = resourceObject.attributes.name;
		let editorObject: Editor = {
			interactive: false
		};
		let viewerObject: Viewer = <Viewer> {
			type: 'default',
			url: null,
			options: {}
		};

		this.rdo(resourceObject);

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
			this.renderer.setRenderer(resourceObject);
			editorObject.interactive = (<MarkdownRenderer | CodeMirrorRenderer>this.renderer.renderer()).interactive;
		}

		this.viewer.type(viewerObject.type);
		this.viewer.url(viewerObject.url);
		this.viewer.options(viewerObject.options);
		this.viewer.pureUrl(createCopyUrl(resourceObject));
		this.viewer.isEditable(isEditableFile(filename) && config.editor.enabled === true);
		this.editor.isInteractive(editorObject.interactive);

		if(viewerObject.type === 'renderer' || this.viewer.isEditable()) {
			previewItem(resourceObject).then((response) => {
				if(response.data) {
					let content = response.data.attributes.content;

					this.viewer.content(content);
					previewFile(true);
				}
			});
		} else
			previewFile(true);

	};

	afterRender() {
		let preview_model = this;
		let $previewWrapper: JQuery = this.rfp.$previewWrapper;

		preview_model.renderer.render(preview_model.viewer.content());

		let copyBtnEl = $previewWrapper.find('.btn-copy-url')[ 0 ];

		this.clipboard = new Clipboard(copyBtnEl, undefined);

		this.clipboard.on('success', (/*e*/) => {
			success(lg('copied'));
		});
	}

	initiateEditor(/*elements*/) {
        let $previewWrapper = this.rfp.$previewWrapper;

		let textarea: HTMLTextAreaElement = <HTMLTextAreaElement>$previewWrapper.find('.fm-cm-editor-content')[ 0 ];

		this.editor.createInstance(<string>(<ComputedDataObject>this.cdo()).extension, textarea, {
			readOnly: false,
			styleActiveLine: true
		});
	}

	// fires specific action by clicking toolbar buttons in detail view
	bindToolbar(action: string) {
        let has_capability = this.rfp.has_capability;
        let performAction = this.rfp.performAction;

		if(has_capability(this.rdo(), action)) {
			performAction(action, {}, this.rdo());
		}
	}

	editFile() {
		let content = this.viewer.content();

		this.renderer.render(content);
		this.editor.render(content);
	}

	saveFile() {
        let saveItem = this.rfp.saveItem;

		saveItem(this.rdo());
	}

	closeEditor() {
		this.editor.enabled(false);
		// re-render viewer content
		this.renderer.render(this.viewer.content());
	}

	buttonVisibility(action: string) {
        let has_capability = this.rfp.has_capability;
        let hasContext = this.rfp.hasContext;

		switch(action) {
			case 'select':
				return (has_capability(this.rdo(), action) && hasContext());
			case 'move':
			case 'rename':
			case 'delete':
			case 'download':
				return (has_capability(this.rdo(), action));
		}
	}
}
///

class TreeModel {
    selectedNode: KnockoutObservable<TreeNodeObject>;
    treeData: TreeNodeObject;
    fullexpandedFolder: any; // todo: find where this came from

	constructor(private rfp: richFilemanagerPlugin) {
		let fileRoot = rfp.fileRoot;

        this.selectedNode = ko.observable(null);

        this.treeData = <TreeNodeObject>{
            id: fileRoot,
            level: ko.observable(-1),
            children: ko.observableArray([])
        };

        this.treeData.children.subscribe((/*value*/) => {
            this.arrangeNode(<TreeNodeObject>this.treeData);
        });
	}

	expandFolderDefault(parentNode: TreeNodeObject) {
		if(this.fullexpandedFolder !== null) {
			if(!parentNode)
				parentNode = <TreeNodeObject>this.treeData;

			// looking for node that starts with specified path
			let node = this.findByFilter((node: TreeNodeObject) => (this.fullexpandedFolder.indexOf(node.id) === 0), parentNode);

			if(node) {
				config.filetree.expandSpeed = 10;
				this.loadNodes(node, false);
			} else {
				this.fullexpandedFolder = null;
				config.filetree.expandSpeed = 200;
			}
		}
	}

	mapNodes(filter: Function, contextNode?: TreeNodeObject): any {
		if(!contextNode)
			contextNode = <TreeNodeObject>this.treeData;

		// don't apply callback function to the treeData root node
		if(contextNode.id !== this.treeData.id)
			filter.call(this, contextNode);

		let nodes = contextNode.children();

		if(!nodes || nodes.length === 0)
			return null;

		for(let i = 0, l = nodes.length; i < l; i++) {
			filter.call(this, nodes[ i ]);
			this.findByFilter(filter, nodes[ i ]);
		}
	}

	findByParam(key: string, value: any, contextNode?: TreeNodeObject): TreeNodeObject {
		if(!contextNode) {
			contextNode = <TreeNodeObject>this.treeData;
			if((<any>contextNode)[ key ] === value)
				return contextNode;
		}
		let nodes: TreeNodeObject[] = contextNode.children();

		if(!nodes || nodes.length === 0)
			return null;

		for(let i = 0, l = nodes.length; i < l; i++) {
			if((<any>nodes[ i ])[ key ] === value)
				return nodes[ i ];

			let result = this.findByParam(key, value, nodes[ i ]);

			if(result)
				return result;
		}
		return null;
	}

	findByFilter(filter: Function, contextNode: TreeNodeObject): TreeNodeObject {
		if(!contextNode) {
			contextNode = <TreeNodeObject>this.treeData;
			if(filter(contextNode))
				return contextNode;

		}
		let nodes: TreeNodeObject[] = contextNode.children();

		if(!nodes || nodes.length === 0)
			return null;

		for(let i = 0, l = nodes.length; i < l; i++) {
			if(filter(nodes[ i ]))
				return nodes[ i ];

			let result: TreeNodeObject = this.findByFilter(filter, nodes[ i ]);

			if(result)
				return result;
		}
		return null;
	}

	getSelected(): TreeNodeObject[] {
		let selectedItems: TreeNodeObject[] = [];

		if(this.selectedNode())
			selectedItems.push(<TreeNodeObject>this.selectedNode());

		return selectedItems;
	}

	loadNodes(targetNode: TreeNodeObject, refresh: boolean) {
		let path: string = <string>(targetNode ? targetNode.id : this.treeData.id);
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
				let nodes: TreeNodeObject[] = [];
				$.each(response.data, (_i, resourceObject) => {
					let nodeObject: TreeNodeObject = this.createNode(resourceObject);

					nodes.push(nodeObject);
				});
				if(refresh)
					targetNode.children([]);

				this.addNodes(targetNode, nodes);
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

	createNode(resourceObject: ReadableObject): TreeNodeObject {
		let node: TreeNodeObject = new TreeNodeObject(this.rfp, resourceObject);
        let fmModel: FmModel = this.rfp.fmModel;

		fmModel.filterModel.filterItem(node);
		return node;
	}

	addNodes(targetNode: TreeNodeObject, newNodes: TreeNodeObject[] | TreeNodeObject): void {
        let sortItems = this.rfp.sortItems;

		if(!Array.isArray(newNodes))
			newNodes = [ newNodes ];

		if(!targetNode)
			targetNode = <TreeNodeObject>this.treeData;

		// list only folders in tree
		if(config.filetree.foldersOnly)
			newNodes = $.grep(newNodes, (node: TreeNodeObject) => (node.cdo.isFolder)); // todo: ??

		$.each(newNodes, (_i, node: TreeNodeObject) => {
			node.parentNode(targetNode);
		});
		let allNodes: TreeNodeObject[] = targetNode.children().concat(newNodes);

		targetNode.children(<TreeNodeObject[]>sortItems(allNodes));
	}

	toggleNode(node: TreeNodeObject): void {
		if(!collapseNode(node))
			expandNode(node);
	}

	arrangeNode(node: TreeNodeObject): void {
		let childrenLength = node.children().length;

		$.each(node.children(), (index, cNode: TreeNodeObject) => {
			cNode.level(node.level() + 1);
			cNode.isFirstNode(index === 0);
			cNode.isLastNode(index === (childrenLength - 1));
		});
	}

	nodeRendered(elements: Element[], node: TreeNodeObject): void {
		let getContextMenuItems = this.rfp.getContextMenuItems;
		let performAction = this.rfp.performAction;
		let model: FmModel = this.rfp.fmModel;

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
					callback: (itemKey: string, options: any) => {
						performAction(itemKey, options, node.rdo, model.fetchSelectedObjects(node));
					}
				}
			}
		});
	}

	actualizeNodeObject(node: TreeNodeObject, oldFolder: string, newFolder: string): void {
		let search: RegExp = new RegExp(`^${oldFolder}`);
		let oldPath: string = node.rdo.id;
		let newPath: string = oldPath.replace(search, newFolder);

		node.id = newPath;
		node.rdo.id = newPath;
		node.rdo.attributes.path = node.rdo.attributes.path.replace(new RegExp(`${oldPath}$`), newPath);

        node.children().forEach((cNode: TreeNodeObject) => {
            this.actualizeNodeObject(cNode, oldFolder, newFolder);
        });
	}
}

class TreeNodeObject {
    id: string | number;
    rdo: ReadableObject;
    cdo: ComputedDataObject;
    visible: KnockoutObservable<boolean>;
    nodeTitle: KnockoutObservable<string>;
    children: KnockoutObservableArray<TreeNodeObject>;
    parentNode: KnockoutObservable<TreeNodeObject>;
    isSliding: KnockoutObservable<boolean>;
    isLoading: KnockoutObservable<boolean>;
    isLoaded: KnockoutObservable<boolean>;
    isExpanded: KnockoutObservable<boolean>;
    selected: KnockoutObservable<boolean>;
    dragHovered: KnockoutObservable<boolean>;
    level: KnockoutObservable<number>;
    isFirstNode: KnockoutObservable<boolean>;
    isLastNode: KnockoutObservable<boolean>;
    title: KnockoutComputed<string>;
    itemClass: KnockoutComputed<string>;
    iconClass: KnockoutComputed<string>;
    switcherClass: KnockoutComputed<string>;
    clusterClass: KnockoutComputed<string>;

	constructor(private rfp: richFilemanagerPlugin, resourceObject: ReadableObject) {
		let model: FmModel = rfp.fmModel;

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
            this.rdo.attributes.name = value;
        });

        this.children.subscribe((/*value*/) => {
            model.treeModel.arrangeNode(this);
        });

        this.isLoaded.subscribe((value: boolean) => {
            this.isLoading(!value);
        });

        this.selected.subscribe(value => {
            if(value) {
                if(model.treeModel.selectedNode() !== null)
                    (<TreeNodeObject>model.treeModel.selectedNode()).selected(false);

                model.treeModel.selectedNode(this);
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
                    extraClass.push('ext', <string>this.cdo.extension);
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

        this.clusterClass = ko.pureComputed(() => (config.filetree.showLine && !this.isLastNode()) ? 'line' : '');
	}


	switchNode(node: TreeNodeObject): any { // todo: check this
        let model: FmModel = this.rfp.fmModel;

		if(!node.cdo.isFolder)
			return false;

		if(!node.rdo.attributes.readable) {
			error(lg('NOT_ALLOWED_SYSTEM'));
			return false;
		}
		if(!node.isLoaded())
			this.openNode(node);
		else
			model.treeModel.toggleNode(node);

	}

    // noinspection JSMethodCanBeStatic
	mouseDown(node: TreeNodeObject/*, e*/): void {
		node.selected(true);
	}

	nodeClick(node: TreeNodeObject/*, e*/): void {
		if(!config.manager.dblClickOpen)
			this.openNode(node);

	}

	nodeDblClick(node: TreeNodeObject/*, e*/): void {
		if(config.manager.dblClickOpen)
			this.openNode(node);

	}

	openNode(node: TreeNodeObject/*, e?*/): void {
        let model: FmModel = this.rfp.fmModel;
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

				fmModel.currentPath(<string>node.id);
				fmModel.breadcrumbsModel.splitCurrent();

				let dataObjects: ReadableObject[] = [];

				$.each(node.children(), (_i, cnode: TreeNodeObject) => {
					dataObjects.push(cnode.rdo);
				});
				model.itemsModel.setList(dataObjects);
			}
		}
	}

	remove() {
        (<TreeNodeObject>this.parentNode()).children.remove(this);
	}

	isRoot() {
        let model: FmModel = this.rfp.fmModel;

		return this.level() === model.treeModel.treeData.id;
	}

}

class ItemsModel {
    objects: KnockoutObservableArray<ItemObject>;
    objectsSize: KnockoutObservable<number | string>;
    objectsNumber: KnockoutObservable<number>;
    selectedNumber: KnockoutObservable<number>;
    listSortField: KnockoutObservable<string>;
    listSortOrder: KnockoutObservable<string>;
    isSelecting: KnockoutObservable<boolean>;
    continiousSelection: KnockoutObservable<boolean>;
    descriptivePanel: RenderModel;
    lazyLoad: ILazyLoad;

	constructor(private rfp: richFilemanagerPlugin) {
        let items_model: ItemsModel = this;
        let model: FmModel = rfp.fmModel;
        let configSortField: string = rfp.configSortField;
        let configSortOrder: string = rfp.configSortOrder;

        this.objects = ko.observableArray([]);
        this.objectsSize = ko.observable(0);
        this.objectsNumber = ko.observable(0);
        this.selectedNumber = ko.observable(0);
        this.listSortField = ko.observable(configSortField);
        this.listSortOrder = ko.observable(configSortOrder);
        this.isSelecting = ko.observable(false);
        this.continiousSelection = ko.observable(false);
        this.descriptivePanel = new RenderModel(rfp);
        this.lazyLoad = null;

        this.isSelecting.subscribe((state: boolean) => {
            if(!state) {
                // means selection lasso has been dropped
                items_model.continiousSelection(false);
            }
        });
        this.objects.subscribe((items: ItemObject[]) => {
            let totalNumber: number = 0;
            let totalSize: number = 0;

            items.forEach((item: ItemObject) => {
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
                build: ($triggerElement: JQuery/*, e*/) => {
                    let koItem = ko.dataFor($triggerElement[ 0 ]);

                    if(!koItem.selected()) {
                        model.itemsModel.unselectItems(false);
                        koItem.selected(true);
                    }

                    return {
                        appendTo: '.fm-container',
                        items: rfp.getContextMenuItems(koItem.rdo),
                        callback: (itemKey: string, options: any) => {
                            rfp.performAction(itemKey, options, koItem.rdo, model.fetchSelectedObjects(koItem));
                        }
                    }
                }
            });
        });

    }

	createObject(resourceObject: ReadableObject): ItemObject {
		let fmModel = this.rfp.fmModel;
		let item: ItemObject = new ItemObject(this.rfp, resourceObject);

		fmModel.filterModel.filterItem(item);

		return item;
	}

	addNew(dataObjects: ReadableObject | ReadableObject[]) {
        let model: FmModel = this.rfp.fmModel;
        let sortItems = this.rfp.sortItems;

		// use underlying array for better performance
		// http://www.knockmeout.net/2012/04/knockoutjs-performance-gotcha.html
		let items: ItemObject[] = model.itemsModel.objects();

		if(!Array.isArray(dataObjects))
			dataObjects = [ dataObjects ];

		$.each(dataObjects, (_i, resourceObject: ReadableObject) => {
			items.push(this.createObject(resourceObject));
		});

		items = <ItemObject[]>sortItems(items);
		model.itemsModel.objects.valueHasMutated();
	}

	loadList(path: string) {
        let model: FmModel = this.rfp.fmModel;
        let rfp = this.rfp;
        let _url_: purl.Url = this.rfp._url_;

		model.loadingView(true);

		let queryParams: Params = {
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

	setList(dataObjects: ReadableObject[]) {
        let model: FmModel = this.rfp.fmModel;
        let sortItems = this.rfp.sortItems;
        let fileRoot = this.rfp.fileRoot;
        let previewItem = this.rfp.previewItem;
		let objects: ItemObject[] = [];

		// add parent folder object
		if(!isFile(model.currentPath()) && model.currentPath() !== fileRoot) {
			let parentPath: string = getParentDirname(model.currentPath());
			let parentItem = <ItemObject>{
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
				open: (_item: any, e: JQueryEventObject) => {
                    if(model.isItemOpenable(e))
                        this.loadList(parentItem.id);
                },
				itemClass: ko.pureComputed(() => {
                    let cssClass = [];

                    if(parentItem.dragHovered())
                        cssClass.push(model.ddModel.hoveredCssClass);

                    return cssClass.join(' ');
                })
			};

			objects.push(parentItem);
		}

		// clear previously rendered content
		this.descriptivePanel.content(null);

		$.each(dataObjects, (_i, resourceObject: ReadableObject) => {
			if(config.manager.renderer.position && typeof config.manager.renderer.indexFile === 'string' &&
				resourceObject.attributes.name.toLowerCase() === config.manager.renderer.indexFile.toLowerCase()
			) {
				this.descriptivePanel.setRenderer(resourceObject);

				// load and render index file content
				previewItem(this.descriptivePanel.rdo()).then(response => {
					if(response.data)
						this.descriptivePanel.render(response.data.attributes.content);
				});
			}
			objects.push(this.createObject(resourceObject));
		});

		model.itemsModel.objects(<ItemObject[]>sortItems(objects));
		model.loadingView(false);
	}

	findByParam(key: string, value: any) {
        let model: FmModel = this.rfp.fmModel;
		return ko.utils.arrayFirst(model.itemsModel.objects(), (object: ItemObject): boolean => (<any>object)[ key ] === value);
	}

	findByFilter(filter: Function, allMatches: boolean): ItemObject[] | ItemObject {
		let firstMatch: boolean = !(allMatches || false);
		let resultItems: ItemObject[] = [];
		let items: ItemObject[] = this.objects();

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

	sortObjects(): void {
        let sortItems = this.rfp.sortItems;
		let sortedList: ItemObject[] = <ItemObject[]>sortItems(this.objects());

		this.objects(sortedList);
	}

	getSelected(): ItemObject[] {
		let selectedItems: ItemObject[] = <ItemObject[]>this.findByFilter((item: ItemObject) => item.rdo.type !== 'parent' && item.selected(), true);

		this.selectedNumber(selectedItems.length);
		return selectedItems;
	}

	unselectItems(ctrlKey?: boolean): void {
        let appendSelection = (config.manager.selection.enabled && config.manager.selection.useCtrlKey && ctrlKey === true);

		if(!appendSelection) {
			// drop selection from selected items
			$.each(this.getSelected(), (_i, itemObject) => {
				itemObject.selected(false);
			});
		}
	}

	initiateLazyLoad(): void {
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
    previewWidth: number;
    id: string;
    rdo: ReadableObject;
    cdo: ComputedDataObject;
    visible: KnockoutObservable<boolean>;
    selected: KnockoutObservable<boolean>;
    dragHovered: KnockoutObservable<boolean>;
    lazyPreview: boolean;
    title: KnockoutComputed<string>;
    itemClass: KnockoutComputed<string>;
    listIconClass: KnockoutComputed<string>;
    gridIconClass: KnockoutComputed<string>;

	constructor(private rfp: richFilemanagerPlugin, resourceObject: ReadableObject) {
		let model: FmModel = rfp.fmModel;

        this.previewWidth = config.viewer.image.thumbMaxWidth;
        if(resourceObject.attributes.width && resourceObject.attributes.width < this.previewWidth)
            this.previewWidth = <number>resourceObject.attributes.width;

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
        this.lazyPreview = Boolean(config.viewer.image.lazyLoad && this.cdo.imageUrl);

        this.selected.subscribe(value => {
            if(value && model.treeModel.selectedNode() !== null)
                (<TreeNodeObject>model.treeModel.selectedNode()).selected(false);

        });

        this.title = ko.pureComputed((): string => {
            return <string>(config.options.showTitleAttr ? this.rdo.id : null);
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
                    extraClass.push('ext', <string>this.cdo.extension);
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
                        extraClass.push('ext', <string>this.cdo.extension);
                    else
                        extraClass.push('file', 'lock');

                }
                cssClass.push(extraClass.join('_'));
            }
            return cssClass.join(' ');
        });

    }

	mouseDown(item: ItemObject, e: JQueryEventObject) {
		let model: FmModel = this.rfp.fmModel;

		// case: previously selected items are dragged instead of a newly one
		// unselect if currently clicked item is not the one of selected items
		if(!item.selected())
			model.itemsModel.unselectItems(e.ctrlKey);

		model.selectionModel.unselect = item.selected();
		item.selected(true);
	};

	open(item: ItemObject, e: JQueryEventObject) {
        let rfp = this.rfp;
        let model: FmModel = this.rfp.fmModel;

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
        let model: FmModel = this.rfp.fmModel;
		model.itemsModel.objects.remove(this);
	};
}

type NodeItem = TreeNodeObject | ItemObject;

class TableViewModel {
    thName: SortableHeader;
    thType: SortableHeader;
    thSize: SortableHeader;
    thDimensions: SortableHeader;
    thModified: SortableHeader;

	constructor(rfp: richFilemanagerPlugin) {
        this.thName = new SortableHeader(rfp, 'name');
        this.thType = new SortableHeader(rfp, 'type');
        this.thSize = new SortableHeader(rfp, 'size');
        this.thDimensions = new SortableHeader(rfp, 'dimensions');
        this.thModified = new SortableHeader(rfp, 'modified');
	}
}

class SortableHeader {
    column: KnockoutObservable<string>;
    order: KnockoutObservable<string>;
    sortClass: KnockoutComputed<string>;

    constructor(private rfp: richFilemanagerPlugin, name: string) {
        let model: FmModel = rfp.fmModel;

        this.column = ko.observable(name);
        this.order = ko.observable(model.itemsModel.listSortOrder());

        this.sortClass = ko.pureComputed((): string => {
            let cssClass;

            if(model.itemsModel.listSortField() === this.column()) {
                cssClass = `sorted sorted-${this.order()}`;
            }
            return <string>cssClass;
        });
	}

    sort(): void {
        let model: FmModel = this.rfp.fmModel;

        let isAscending: boolean = this.order() === 'asc';
        let isSameColumn: boolean = model.itemsModel.listSortField() === this.column();

        this.order(isSameColumn ? (isAscending ? 'desc' : 'asc') : model.itemsModel.listSortOrder());
        model.itemsModel.listSortField(this.column());
        model.itemsModel.listSortOrder(this.order());
        model.itemsModel.sortObjects();
    }
}

class HeaderModel {
    closeButton: KnockoutObservable<boolean>;
    langSwitcher: boolean;

	constructor(private rfp: richFilemanagerPlugin) {
        this.closeButton = ko.observable(false);
        this.langSwitcher = Array.isArray(config.language.available) && config.language.available.length > 0;
	}

	closeButtonOnClick(): void {
		log('CLOSE button is clicked');
	}

	navHome(): void {
        let model: FmModel = this.rfp.fmModel;
        let fileRoot: string = this.rfp.fileRoot;

		model.previewFile(false);
		model.itemsModel.loadList(fileRoot);
	}

	navLevelUp(): void {
        let model: FmModel = this.rfp.fmModel;

		let parentFolder: string = model.previewFile()
			? getDirname((<KnockoutObservable<PreviewModel>>model.previewModel).rdo().id)
			: getParentDirname(model.currentPath());

		if(model.previewFile())
			model.previewFile(false);

		if(parentFolder !== model.currentPath())
			model.itemsModel.loadList(parentFolder);

	}

	navRefresh(): void {
        let model: FmModel = this.rfp.fmModel;

		if(model.previewFile()) {
			model.previewFile(false);
			model.previewFile(true);
		} else
			model.itemsModel.loadList(model.currentPath());
	}

	displayGrid(): void {
        let model: FmModel = this.rfp.fmModel;

		model.viewMode('grid');
		model.previewFile(false);

		if(model.itemsModel.lazyLoad)
			model.itemsModel.lazyLoad.update();
	}

	displayList(): void {
        let model: FmModel = this.rfp.fmModel;

		model.viewMode('list');
		model.previewFile(false);
	}

	switchLang(e: Event) {
		let langNew = (<any>e.target).value; // todo: check this
		let langCurrent: string = getLang();
        let _url_ = this.rfp._url_;

		if(langNew && langNew.toLowerCase() !== langCurrent.toLowerCase()) {
			let newUrl;
			let url = window.location.toString();
			let regExp = new RegExp(`(langCode=)${langCurrent}`);

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
        let buildAjaxRequest = this.rfp.buildAjaxRequest;

		let makeFolder = function (_e: Event, ui: AleritfyDialogUI) {
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
			okBtn: <AlertifyBtn>{
				label: lg('create_folder'),
				autoClose: false,
				click: makeFolder
			},
			cancelBtn: <AlertifyBtn>{
				label: lg('cancel')
			}
		});
	}
}

class SummaryModel {
    public files: KnockoutObservable<any>;
    public folders: KnockoutObservable<any>;
    public size: KnockoutObservable<any>;
    public enabled: KnockoutObservable<boolean>;

	constructor(private rfp: richFilemanagerPlugin) {
        this.files = ko.observable(null);
        this.folders = ko.observable(null);
        this.size = ko.observable(null);
        this.enabled = ko.observable(false);
	}

	doSummarize(): void {
	    this.rfp.summarizeItems();
	}
}

class FilterModel {
    public name: KnockoutObservable<string|null>;

	constructor(private rfp: richFilemanagerPlugin) {
		this.name = ko.observable(null);
	}

	setName(filterName: string) {
		if(filterName && config.filter && Array.isArray(config.filter[ filterName ])) {
			this.name(filterName);
		}
	}

	// return extensions which are match a filter name
	getExtensions(): string[] {
		if(this.name())
			return config.filter[ <string>this.name() ];

		return null;
	}

	// check whether file item should be filtered out of the output based on it's extension
	filterItem(itemObject: NodeItem): void {
		if(itemObject.rdo.type === 'parent')
			return;

		let extensions: string[] = this.getExtensions();
		let visibility: boolean = !itemObject.cdo.hiddenBySearch;

		if(itemObject.rdo.type === 'file' && Array.isArray(extensions)) {
			let ext: string = getExtension(<string>itemObject.id);
			let matchByType: boolean = extensions.indexOf(ext) !== -1;

			visibility = visibility && matchByType;
			itemObject.cdo.hiddenByType = !matchByType;
		}
		itemObject.visible(visibility);
	}

	filter(filterName: string) {
        let filter_model = this;
        let model: FmModel = this.rfp.fmModel;

		model.searchModel.reset();
		filter_model.setName(<string>filterName); // todo: could be null

		$.each(model.itemsModel.objects(), (_i, itemObject) => {
			filter_model.filterItem(itemObject);
		});

		model.treeModel.mapNodes((node: TreeNodeObject) => {
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
	value: KnockoutObservable<string>;

	constructor(private rfp: richFilemanagerPlugin) {
		this.value = ko.observable('');
	}

	// noinspection JSUnusedLocalSymbols
    findAll(_data: any, event: any) { // todo: event type?
		let delay = 200;
		let insensitive = true;
        let search_model = this;
        let model: FmModel = this.rfp.fmModel;
        let rfp = this.rfp;

		search_model.value(event.target.value);

        rfp.delayCallback(() => {
			let searchString = insensitive ? search_model.value().toLowerCase() : search_model.value();

			$.each(model.itemsModel.objects(), (_i, itemObject) => {
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
        let model: FmModel = this.rfp.fmModel;

		search_model.value('');
		$.each(model.itemsModel.objects(), (_i, itemObject) => {
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
    cbMode: string;
    cbObjects: NodeItem[];
    active: boolean;
    itemsNum: KnockoutObservable<number>;
    enabled: KnockoutObservable<boolean>;

	constructor(private rfp: richFilemanagerPlugin) {
        this.cbMode = null;
        this.cbObjects = [];
        let active = this.active = rfp.capabilities.indexOf('copy') > -1 || rfp.capabilities.indexOf('move') > -1;
        let model: FmModel = rfp.fmModel;

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
        let model = this.rfp.fmModel;
        let processMultipleActions = this.rfp.processMultipleActions;
        let moveItem = this.rfp.moveItem;
        let copyItem = this.rfp.copyItem;

		if(!this.hasCapability('paste') || this.isEmpty())
			return;

		if(this.cbMode === null || this.cbObjects.length === 0) {
			warning(lg('clipboard_empty'));
			return;
		}

		let targetPath = model.currentPath();

		processMultipleActions(this.cbObjects, (_i, itemObject: NodeItem): any => {
			if(this.cbMode === 'cut')
				return moveItem(itemObject, targetPath);

			if(this.cbMode === 'copy')
				return copyItem(itemObject, targetPath);

		}, this.clearClipboard.bind(this)); // todo:
	}

	clear(): void {
		if(!this.hasCapability('clear') || this.isEmpty())
			return;

		this.clearClipboard();
		success(lg('clipboard_cleared'));
	}

	isEmpty(): boolean {
		return this.cbObjects.length === 0;
	}

	hasCapability(capability: string): boolean {
        let rfp = this.rfp;

        if(!this.enabled)
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

	clearClipboard(): void {
		this.cbObjects = [];
		this.cbMode = null;
		this.itemsNum(0);
	}
}

class BreadcrumbsModel {
	// let bc_model = this;
    items: KnockoutObservableArray<BcItem>;

	constructor(private rfp: richFilemanagerPlugin) {
        this.items = ko.observableArray([]);
	}

	add(path: string, label: string): void {
        let bc_model = this;
        // noinspection UnnecessaryLocalVariableJS
        let rfp = this.rfp;

		bc_model.items.push(<BcItem>new BcItem(rfp, path, label));
	}

	splitCurrent(): void {
        let model: FmModel = this.rfp.fmModel;
        let rfp = this.rfp;

		let path: string = rfp.fileRoot;
		let cPath: string = model.currentPath();
		let chunks: string[] = cPath.replace(new RegExp(`^${rfp.fileRoot}`), '').split('/');

		// reset breadcrumbs
		this.items([]);
		// push root node
		this.add(rfp.fileRoot, '');

		while(chunks.length > 0) {
			let chunk = chunks.shift();

			if(chunk) {
				path += chunk + '/';
				this.add(path, chunk);
			}
		}
	}
}

class BcItem {
    // let bc_item = this;
    isRoot: boolean;
    active: boolean;

    constructor(private rfp: richFilemanagerPlugin, public path: string, public label: string) {
        this.isRoot = (path === rfp.fileRoot);
        this.active = (path === rfp.fmModel.currentPath());
	}

    itemClass(): string {
        let cssClass: string[] = [ 'nav-item' ];

        if(this.isRoot)
            cssClass.push('root');

        if(this.active)
            cssClass.push('active');

        return cssClass.join(' ');
    }

    goto(item: BcItem/*, e*/): void {
    	let model: FmModel = this.rfp.fmModel;

        if(!item.active)
            model.itemsModel.loadList(item.path);
    }
}

class RenderModel {
	// let render_model = this;
	$containerElement: JQuery;

	rdo: KnockoutObservable<ReadableObject>;
	content: KnockoutObservable<any>;
	renderer: KnockoutObservable<MarkdownRenderer | CodeMirrorRenderer>;

	constructor(private rfp: richFilemanagerPlugin) {
        this.rdo = ko.observable(<ReadableObject>{});
        this.content = ko.observable(null);
        this.renderer = ko.observable(null);
	}

	render(data: any) {
        if(this.renderer())
            (<MarkdownRenderer | CodeMirrorRenderer>this.renderer()).processContent(data);

	}

	setRenderer(resourceObject: ReadableObject) {
        let rfp = this.rfp;

        this.rdo(resourceObject);

		if(isMarkdownFile(resourceObject.attributes.name))
		// markdown renderer
			this.renderer(<MarkdownRenderer>new MarkdownRenderer(rfp, this));
		else
		// CodeMirror renderer
			this.renderer(<CodeMirrorRenderer>new CodeMirrorRenderer(rfp, this));

	}

	setContainer(templateElements: Element[]) {
	    let _this = this;
		$.each(templateElements, function (): any {
			if($(this).hasClass('fm-renderer-container')) {
                _this.$containerElement = <any>$(this);
				return false;
			}
		});

        (<MarkdownRenderer | CodeMirrorRenderer>this.renderer()).processDomElements(this.$containerElement);
	}
}

class CodeMirrorRenderer {
    name: string;
    interactive: boolean;
    instance: EditorModel;

    constructor(rfp: richFilemanagerPlugin, private render_model: RenderModel) {
        this.name = 'codeMirror';
        this.interactive = false;
        this.instance = new EditorModel(rfp);
	}

    processContent(data: any) {
        this.instance.render(data);
        this.render_model.content(data);
    }

    processDomElements($container: JQuery) {
        let render_model = this.render_model;

        if(!this.instance.instance) {
            let textarea: HTMLTextAreaElement = <HTMLTextAreaElement>$container.find('.fm-cm-renderer-content')[ 0 ];
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
    name: string;
    interactive: boolean;
    instance: EditorModel;

	constructor(private rfp: richFilemanagerPlugin, private render_model: RenderModel) {
        this.name = 'markdown';
        this.interactive = true;

        let instance = this.instance = (<any>window).markdownit({
            // Basic options:
            html: true,
            linkify: true,
            typographer: true,

            // Custom highlight function to apply CSS class `highlight`:
            highlight: (str: string, lang: string) => {
                if(lang && hljs.getLanguage(lang)) {
                    try {
                        return `<pre class="highlight"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
                    } catch(__) {
                    }
                }
                return `<pre class="highlight"><code>${instance.utils.escapeHtml(str)}</code></pre>`;
            },

            // custom link function to enable <img ...> and file d/ls:
            replaceLink: (link: string/*, env*/) => {

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

    processContent(data: any) {
		let instance = this.instance;
        let result = instance.render(data);

        this.render_model.content(result);
        this.setLinksBehavior();
    }

    processDomElements(_container: JQuery) {
	    // todo: why is this empty?
    }

    setLinksBehavior() {
		let render_model = this.render_model;
		let getItemInfo = this.rfp.getItemInfo;
		let getDetailView = this.rfp.getDetailView;
		let fmModel = this.rfp.fmModel;

        // add onClick events to local .md file links (to perform AJAX previews)
        render_model.$containerElement.find('a').each(function () {
            let href: string = <string>$(this).attr('href');
            let editor: EditorModel = (<PreviewModel>fmModel.previewModel).editor;

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
                        getItemInfo(href).then(response => {
                            if(response.data)
                                getDetailView(response.data);

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
	delayedContent: any = null;
    instance: CodeMirror.EditorFromTextArea = null;
    enabled: KnockoutObservable<boolean>;
    content: KnockoutObservable<null | any>;
    mode: KnockoutObservable<null | any>;
    isInteractive: KnockoutObservable<boolean>;

	constructor(private rfp: richFilemanagerPlugin) {
        this.enabled = ko.observable(false);
        this.content = ko.observable(null);
        this.mode = ko.observable(null);
        this.isInteractive = ko.observable(false);

        this.mode.subscribe(mode => {
            if(mode) {
                (<CodeMirror.EditorFromTextArea>this.instance).setOption('mode', mode);
                if(this.delayedContent) {
                    this.drawContent(this.delayedContent);
                    this.delayedContent = null;
                }
            }
        });
	}

	render(content: any) {
		if(this.mode())
			this.drawContent(content);
		else
			this.delayedContent = content;

	}

	createInstance(extension: string, element: HTMLTextAreaElement, options: any): void { // todo: options
		let cm: CodeMirror.EditorFromTextArea;

		let defaults = {
			readOnly: 'nocursor',
			styleActiveLine: false,
			viewportMargin: Infinity,
			lineNumbers: config.editor.lineNumbers,
			lineWrapping: config.editor.lineWrapping,
			theme: config.editor.theme,
			matchBrackets: config.editor.matchBrackets,
			extraKeys: {
				'F11': (cm: CodeMirror.EditorFromTextArea) => {
					cm.setOption('fullScreen', !cm.getOption('fullScreen'));
				},
				'Esc': (cm: CodeMirror.EditorFromTextArea) => {
					if(cm.getOption('fullScreen'))
						cm.setOption('fullScreen', false);
				}
			}
		};

		cm = CodeMirror.fromTextArea(element, $.extend({}, defaults, options));

		cm.on('changes', (instance: CodeMirror.Editor, _change: CodeMirror.EditorChangeLinkedList[]): void => {
			this.content(instance.getValue());
		});

		this.instance = cm;

		this.includeAssets(extension);
	}

	drawContent(content: any) {
		this.enabled(true);
        (<CodeMirror.EditorFromTextArea>this.instance).setValue(content);
		// to make sure DOM is ready to render content
		setTimeout(() => {
            (<CodeMirror.EditorFromTextArea>this.instance).refresh();
		}, 0);
	}

	includeAssets(extension: string) {
		let assets: any[] = [];
		let currentMode = 'default';
        let loadAssets = this.rfp.loadAssets;

		// highlight code according to extension file
		if(config.editor.codeHighlight) {
			let cm: string = '/scripts/CodeMirror/';

			if(extension === 'js') {
				assets.push(`${cm}mode/javascript/javascript.js`);
				currentMode = 'javascript';
			}
			if(extension === 'css') {
				assets.push(`${cm}mode/css/css.js`);
				currentMode = 'css';
			}
			if(extension === 'html') {
				assets.push(`${cm}mode/xml/xml.js`);
				currentMode = 'text/html';
			}
			if(extension === 'xml') {
				assets.push(`${cm}mode/xml/xml.js`);
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
				assets.push(`${cm}mode/clike/clike.js`);
				currentMode = 'text/x-java';
			}
			if(extension === 'sql') {
				assets.push(`${cm}mode/sql/sql.js`);
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
                this.mode(currentMode);
            });
			loadAssets(assets);
		} else
			this.mode(currentMode);

	}
}

class DragAndDropModel {
	restrictedCssClass: string;
	$dragHelperTemplate: JQuery;

    items: NodeItem[];
    hoveredItem: NodeItem;
    dragHelper: JQuery;
    isScrolling: boolean;
    isScrolled: boolean;
    hoveredCssClass: string;

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

	makeDraggable(item: NodeItem, element: Element) {
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
				helper: (): JQuery => {
					let $cloned: JQuery;
					let iconClass: string;

					if(fetchSelectedItems((<any>item.constructor).name).length > 1)
						iconClass = 'ico_multiple';
					else
						iconClass = (item.rdo.type === 'folder')
							? 'ico_folder'
							: 'ico_file ico_ext_' + getExtension(item.rdo.id);

					$cloned = this.$dragHelperTemplate.children('.drag-helper').clone();
					$cloned.find('.clip').addClass(iconClass);

					this.dragHelper = $cloned;
					return $cloned;
				},
				start: () => {
					this.items = fetchSelectedItems((<any>item.constructor).name);
				},
				drag: (e: JQueryEventObject) => {
					$(e.target).draggable('option', 'refreshPositions', this.isScrolling || this.isScrolled);
                    this.isScrolled = false;
				},
				stop: () => {
					this.items = [];
					this.dragHelper = null;
				}
			});
		}
	}

	makeDroppable(targetItem: NodeItem, element: Element) {
        let rfp = this.rfp;

		if(targetItem.rdo.type === 'folder' || targetItem.rdo.type === 'parent') {
			$(element).droppable(<any>{
				tolerance: 'pointer',
				enableExtendedEvents: targetItem instanceof ItemObject, // todo: this isn't in jqueryui.d.ts
				accept: ($draggable: JQuery) => {
					let dragItem = ko.dataFor($draggable[ 0 ]);
					let type = dragItem ? dragItem.rdo.type : null;

					return (type === 'file' || type === 'folder');
				},
				over: (_event: JQueryEventObject, ui: JQueryUI.DroppableEventUIParam) => {
					// prevent "over" event fire before "out" event
					// http://stackoverflow.com/a/28457286/7095038
					setTimeout(() => {
						this.markHovered(null);
						this.markRestricted(ui.helper, false);

						if(!this.isDropAllowed(targetItem))
							this.markRestricted(ui.helper, true);

						this.markHovered(targetItem);
					}, 0);
				},
				out: (_event: JQueryEventObject, ui: JQueryUI.DroppableEventUIParam) => {
					this.markHovered(null);
					this.markRestricted(ui.helper, false);
				},
				drop: (/*event, ui*/): any => {
					this.markHovered(null);

					if(!this.isDropAllowed(targetItem))
						return false;

					rfp.processMultipleActions(this.items, (_i, itemObject) => rfp.moveItem(itemObject.rdo, <string>targetItem.id));
				}
			});
		}
	}

	// check whether draggable items can be accepted by target item
	isDropAllowed(targetItem: NodeItem) {
		let matches = $.grep(this.items, (itemObject/*, i*/) => {
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
	markHovered(item: NodeItem) {
		if(this.hoveredItem !== null)
			this.hoveredItem.dragHovered(false);

		this.hoveredItem = item;
		if(item)
			item.dragHovered(true);

	}

	// mark helper as restricted if target item doesn't accept draggable item
	markRestricted($helper: JQuery, flag: boolean) {
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
	viewMode: KnockoutObservable<string>;
	currentPath: KnockoutObservable<string>;
	browseOnly: KnockoutObservable<boolean>;
	previewModel: KnockoutObservable<PreviewModel> | PreviewModel;
	treeModel: TreeModel;
	itemsModel: ItemsModel;
	tableViewModel: TableViewModel;
	headerModel: HeaderModel;
	summaryModel: SummaryModel;
	filterModel: FilterModel;
	searchModel: SearchModel;
	clipboardModel: ClipboardModel;
	breadcrumbsModel: BreadcrumbsModel;
	ddModel: DragAndDropModel;
	selectionModel: SelectionModel;

	constructor(rfp: richFilemanagerPlugin) {
		let model: FmModel = this;
		let fileRoot = rfp.fileRoot;
		let previewModel: PreviewModel = (<PreviewModel>model.previewModel);

		this.loadingView = ko.observable(true);
		this.previewFile = ko.observable(false);
		this.viewMode = ko.observable(this.config.manager.defaultViewMode);
		this.currentPath = ko.observable(fileRoot);
		this.browseOnly = ko.observable(this.config.options.browseOnly);
		this.previewModel = ko.observable(null);

        this.previewFile.subscribe((enabled: boolean) => {
			if(!enabled) {
				// close editor upon disabling preview
                previewModel.closeEditor();

				// update content of descriptive panel
				if(model.itemsModel.descriptivePanel.rdo().id === previewModel.rdo().id)
					model.itemsModel.descriptivePanel.render(previewModel.viewer.content());

			}
		});

		this.treeModel = new TreeModel(rfp);
		this.itemsModel = new ItemsModel(rfp);
		this.tableViewModel = new TableViewModel(rfp);
		this.previewModel = new PreviewModel(rfp);
		this.headerModel = new HeaderModel(rfp);
		this.summaryModel = new SummaryModel(rfp);
		this.filterModel = new FilterModel(rfp);
		this.searchModel = new SearchModel(rfp);
		this.clipboardModel = new ClipboardModel(rfp);
		this.breadcrumbsModel = new BreadcrumbsModel(rfp);
		this.ddModel = new DragAndDropModel(rfp);
		this.selectionModel = new SelectionModel();
	}

	addItem(resourceObject: ReadableObject, targetPath: string) {
		let fmModel = this;
		// handle tree nodes
		let targetNode = fmModel.treeModel.findByParam('id', targetPath);

		if(targetNode) {
			let newNode: TreeNodeObject = fmModel.treeModel.createNode(resourceObject);

			fmModel.treeModel.addNodes(targetNode, newNode);
		}

		// handle view objects
		if(fmModel.currentPath() === targetPath)
			fmModel.itemsModel.addNew(resourceObject);

	}

	removeItem(resourceObject: ReadableObject | NodeItem) {
		let fmModel = this;

		// handle tree nodes
		let treeNode: TreeNodeObject = fmModel.treeModel.findByParam('id', resourceObject.id);

		if(treeNode)
			treeNode.remove();

		// handle view objects
		let viewItem: ItemObject = fmModel.itemsModel.findByParam('id', resourceObject.id);

		if(viewItem)
			viewItem.remove();

	}

	// fetch selected view items OR tree nodes
	fetchSelectedItems(instanceName?: NodeItem): NodeItem[] {
		let fmModel = this;
		let selectedNodes: TreeNodeObject[];
		let selectedItems: ItemObject[];

		if(instanceName === (<any>ItemObject).name)
			return fmModel.itemsModel.getSelected();

		if(instanceName === (<any>TreeNodeObject).name)
			return fmModel.treeModel.getSelected();

		if(!instanceName) {
			selectedNodes = fmModel.treeModel.getSelected();
			selectedItems = fmModel.itemsModel.getSelected();

			return (selectedItems.length > 0) ? selectedItems : selectedNodes;
		}
		throw new Error('Unknown item type.');
	}

	// fetch resource objects out of the selected items
	fetchSelectedObjects(item: NodeItem): ReadableObject[] {
		let fmModel = this;
		let objects: ReadableObject[] = [];

		$.each(fmModel.fetchSelectedItems((<any>item.constructor).name), (_i, itemObject: NodeItem) => {
			objects.push(itemObject.rdo);
		});
		return objects;
	}

	// check whether view item can be opened based on the event and configuration options
	isItemOpenable(event: JQueryEventObject) {
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

	public fileRoot: string = '/';				// relative files root, may be changed with some query params
	public apiConnector: string = null;		// API connector URL to perform requests to server
	public capabilities: any = [];			// allowed actions to perform in FM
	public configSortField: string = <any>null;		// items sort field name
	public configSortOrder: string = <any>null;		// items sort order 'asc'/'desc'
	public fmModel: FmModel = <any>null;				// filemanager knockoutJS model
	public _url_: purl.Url = purl();
	public timeStart = new Date().getTime();

    delayCallback: Function;

	fullexpandedFolder: string;

	/**
	 * The "constructor" method that gets called when the object is created
	 */
	constructor(element: any, pluginOptions: any) {
		/** variables to keep request options data **/
		this.fullexpandedFolder = <any>null;	// path to be automatically expanded by filetree plugin

		/**
		 * Private properties accessible only from inside the plugin
		 */
		let $container: JQuery = this.$container = $(element);	// reference to the jQuery version of DOM element the plugin is attached to
		let $wrapper: JQuery = this.$wrapper = $container.children('.fm-wrapper');
		let $header: JQuery = this.$header = $wrapper.find('.fm-header');
		let $uploader: JQuery = this.$uploader = $header.find('.fm-uploader');
		let $splitter: JQuery = this.$splitter = $wrapper.children('.fm-splitter');
		this.$footer = $wrapper.children('.fm-footer');
		$fileinfo = this.$fileinfo = $splitter.children('.fm-fileinfo');
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
		/*(function ($) {
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
		})(jQuery);*/

		// Delays execution of function that is passed as argument
		this.delayCallback = (() => {
			let timer = 0;

			return (callback: Function, ms: number) => {
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
		}).done((response:any) => {
			if(response.data) {
				let serverConfig = response.data.attributes.config;

				// configuration options retrieved from the server
				$.each(serverConfig, (section, options) => {
					$.each(options, (param, value) => {
						if((<any>config)[ section ] === undefined)
							(<any>config)[ section ] = [];

						(<any>config)[ section ][ param ] = value;
					});
				});

				// If the server is in read only mode, set the GUI to browseOnly:
				if(config.security.readOnly)
					config.options.browseOnly = true;

			}
			handleAjaxResponseErrors(response);
		}).fail(() => {
			error('Unable to perform initial request to server.');
		}).then((response: JQuery.jqXHR): any => {
			// noinspection TypeScriptUnresolvedVariable
			if((<any>response).errors) { // todo: errors does not exist in the jquery type definition
				return $.Deferred().reject();
			}
		});
	}

	// localize messages based on configuration or URL value
	public localize() {
		let _url_: purl.Url = this._url_;

		init(this.settings.baseUrl);

		return $.ajax()
			.then((): any => {
				let urlLangCode = _url_.param('langCode');

				if(urlLangCode) {
					// try to load lang file based on langCode in query params
					return file_exists(buildLangFileUrl(urlLangCode))
						.done(() => {
							setLang(urlLangCode);
						})
						.fail(() => {
							setTimeout(function () {
								error(`Given language file (${buildLangFileUrl(urlLangCode)}) does not exist!`);
							}, 500);
						});
				} else
					setLang(config.language.default);
			})
			.then(() => {
				return $.ajax({
					type: 'GET',
					url: buildLangFileUrl(getLang()),
					dataType: 'json'
				}).done(function (jsonTrans) {
					setTranslations(jsonTrans);
				});
			});
	}

	public includeTemplates() {
		return $.when(this.loadTemplate('upload-container'), this.loadTemplate('upload-item')).done((uc, ui) => {
			let tmpl_upload_container = uc[ 0 ];
			let tmpl_upload_item = ui[ 0 ];

			this.$wrapper
				.append(tmpl_upload_container)
				.append(tmpl_upload_item);
		});
	}

	public includeAssets(callback: Function) {
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
		let _url_: purl.Url = this._url_;
        let setDimensions = this.setDimensions;
        let self = this;

		// reads capabilities from config files if exists else apply default settings
		this.capabilities = config.options.capabilities || [ 'upload', 'select', 'download', 'rename', 'copy', 'move', 'delete', 'extract' ];

		// defines sort params
		let chunks: string[] = [];

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
			update: (element: Element, valueAccessor): any => {
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

		this.$wrapper.mousewheel((e: any): any => { // todo: what event?
			if(!fmModel.ddModel.dragHelper)
				return true;

			let $panes;
			let $obstacle: JQuery = <JQuery>null;

			if(config.customScrollbar.enabled)
				$panes = $([ this.$viewItemsWrapper[ 0 ], this.$filetree[ 0 ] ]);
			else
				$panes = this.$splitter.children('.splitter-pane');

			$panes.each((_i, pane: Element): any => {
				let $pane: JQuery = $(pane);
				let top: number = $pane.offset().top;
				let left: number = $pane.offset().left;

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
				let directionSign: string = (e.deltaY === 1) ? '+' : '-';

				if($scrollBar.is(':visible')) {
                    (<any>$obstacle).mCustomScrollbar('scrollTo', [ directionSign + '=250', 0 ], {
						scrollInertia: 500,
						scrollEasing: 'easeOut',
						callbacks: true
					});
				}
			} else {
				if((<HTMLElement>$obstacle[ 0 ]).scrollHeight > (<HTMLElement>$obstacle[ 0 ]).clientHeight) {
					let scrollPosition: number = $obstacle.scrollTop();
					let scrollOffset: number = scrollPosition - (200 * e.deltaY);

					fmModel.ddModel.isScrolling = true;
					scrollOffset = (scrollOffset < 0) ? 0 : scrollOffset;
					$obstacle.stop().animate({scrollTop: scrollOffset}, 100, 'linear', function () {
						fmModel.ddModel.isScrolling = false;
						fmModel.ddModel.isScrolled = true;
					});
				}
			}
		});

		this.$viewItems.selectable(<any>{
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

			selected: (_event: JQueryEventObject, ui: { selected?: Element; }) => {
				let koItem: any = ko.dataFor(ui.selected);

				koItem.selected(true);
			},

			unselected: (_event: JQueryEventObject, ui: { unselected: Element; }) => {
				let koItem: any = ko.dataFor(ui.unselected);

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
						disabled: () => fmModel.clipboardModel.isEmpty()
					}
				};

				if(!fmModel.clipboardModel.enabled() || config.options.browseOnly === true)
					delete contextMenuItems.paste;

				return {
					appendTo: '.fm-container',
					items: contextMenuItems,
					reposition: false,
					callback: (itemKey: string/*, options*/) => {
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
            (<any>this.$filetree).mCustomScrollbar({
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

            (<any>this.$previewWrapper).mCustomScrollbar({
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

            (<any>this.$viewItemsWrapper).mCustomScrollbar({
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
					onScrollStart: function (this: mCustomScrollbar) {
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
					whileScrolling: function (this: mCustomScrollbar) {
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

							let yIncrement: number = Math.abs(this.mcs.top) - Math.abs(this.yStartPosition);

							self.$viewItems.selectable('repositionCssHelper', <any>yIncrement, 0);
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


    /**
     * Get the string/number to be sorted by checking the array value with the criterium.
     * @item KO or treeNode object
     */
    private getSortSubject(item: NodeItem, sortParams: any) {
        let fmModel = this.fmModel;
        let sortBy;
        let sortField: string = this.configSortField;

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
    private naturalCompare(a: any, b: any) {
        let aa = this.chunkify(a.toString());
        let bb = this.chunkify(b.toString());

        for(let x = 0; aa[ x ] && bb[ x ]; x++) {
            if(aa[ x ] !== bb[ x ]) {
                let c: number = Number(aa[ x ]);
                let d: number = Number(bb[ x ]);

                if(c == <any>aa[ x ] && d == <any>bb[ x ])
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
    private chunkify(t: string): string[] {
        let tz: string[] = [];
        let x: number = 0;
        let y: number = -1;
        let n: boolean = false;// = 0;
        let i: number;
        let j: string;

        while(i = (j = t.charAt(x++)).charCodeAt(0)) {
            let m: boolean = (i == 46 || (i >= 48 && i <= 57));

            if(m !== n) {
                tz[ ++y ] = '';
                n = m;
            }
            tz[ y ] += j;
        }
        return tz;
    }

    public sortItems(items: NodeItem[]) {
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

		items.sort((a: any, b: any) => {
			let sortReturnNumber;
			let aa = this.getSortSubject(a, sortParams);
			let bb = this.getSortSubject(b, sortParams);

			if(aa === bb)
				sortReturnNumber = 0;
			else {
				if(aa === undefined || bb === undefined)
					sortReturnNumber = 0;
				else {
					if(!sortParams.natural || (!isNaN(aa) && !isNaN(bb)))
						sortReturnNumber = aa < bb ? -1 : (aa > bb ? 1 : 0);
					else
						sortReturnNumber = this.naturalCompare(aa, bb);

				}
			}
			// lastly assign asc/desc
			sortReturnNumber *= sortParams.order;
			return sortReturnNumber;
		});

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
		let url: string;
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
	public loadAssets(assets: any[]) {
		let settings = this.settings;

		for(let i = 0, l = assets.length; i < l; i++) {
			if(typeof assets[ i ] === 'string')
				assets[ i ] = settings.baseUrl + assets[ i ];
		}

		toast.apply(this, assets);
	}

	// Loads a given js template file into header if not already included
	public loadTemplate(id: string/*, data*/) {
        let settings = this.settings;

		return $.ajax({
			type: 'GET',
			url: `${settings.baseUrl}/scripts/templates/${id}.html`,
			error: handleAjaxError
		});
	}

	public extendRequestParams(method: string, parameters: any) {
		let methodParams: any;
		let configParams: { [key:string]: any; } = config.api.requestParams;

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

	public buildAjaxRequest(method: string, parameters: any): JQuery.jqXHR {
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
		let _url_: purl.Url = this._url_;

		if(_url_.param('filter')) {
			if(config.filter[ _url_.param('filter') ] !== undefined)
				shownExtensions = config.filter[ _url_.param('filter') ];

		}
		return shownExtensions;
	}

	public buildConnectorUrl(params?: any) {
		let defaults = {
			time: new Date().getTime()
		};
		let queryParams = $.extend({}, params || {}, defaults);

		return this.apiConnector + '?' + $.param(queryParams); // todo: move apiConnector to a constant
	}

	// Build url to preview files
	public createPreviewUrl(resourceObject: ReadableObject, encode: boolean) {
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
	public createImageUrl(resourceObject: ReadableObject, thumbnail: boolean, disableCache: boolean): string {
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
				let queryParams: Params = {path: resourceObject.id, mode: undefined, thumbnail: undefined};

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

	public buildAbsolutePath(path: string, disableCache: boolean): string {
		let url = (typeof config.viewer.previewUrl === 'string') ? config.viewer.previewUrl : location.origin;

		url = trim(url, '/') + path;
		// add timestamp-based query parameter to disable browser caching
		if(disableCache)
			url += '?time=' + (new Date().getTime());

		return url;
	}

    private encodeCopyUrl(path: string): string {
        return (config.clipboard.encodeCopyUrl) ? encodePath(path) : path;
    }

	public createCopyUrl(resourceObject: ReadableObject): string {

		if(config.viewer.absolutePath && resourceObject.attributes.path) {
			let path = this.encodeCopyUrl(resourceObject.attributes.path);

			return this.buildAbsolutePath(path, false);
		} else {
			let path = this.encodeCopyUrl(resourceObject.id);
			let mode = (resourceObject.type === 'folder') ? 'getfolder' : 'readfile';

			return `${this.apiConnector}?path=${path}&mode=${mode}`;
		}
	}

	// Returns container for filetree or fileinfo section based on scrollbar plugin state
	// noinspection JSUnusedGlobalSymbols
    public getSectionContainer($section: JQuery): JQuery {
		// if scrollbar plugin is enabled
		if(config.customScrollbar.enabled)
			return $section.find('.mCSB_container');
		else
			return $section;

	}

	// Handle multiple actions in loop with deferred object
	public processMultipleActions(items: NodeItem[], callbackFunction: (a: number, b: NodeItem) => any, finishCallback?: Function) {
		let successCounter: number = 0;
		let totalCounter: number = items.length;
		let deferred: any = $.Deferred().resolve();

		$.each(items, (i: number, item: NodeItem) => {
			deferred = deferred
				.then(() => callbackFunction(i, item))
				.then((result: any) => {
					if(result && result.data)
						successCounter++;
				});
		});

		if(totalCounter > 1) {
			deferred.then(() => {
				write(lg('successful_processed').replace('%s', <any>successCounter).replace('%s', <any>totalCounter));
			});
		}

		deferred.then(() => {
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
        (<any>this.$splitter).splitter({
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
		let _url_: purl.Url = this._url_;

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
		let _url_: purl.Url = this._url_;
		let settings = this.settings;

		previewUrl = settings.callbacks.beforeSelectItem(resourceObject, previewUrl);

		// tinyMCE > 3.0 integration method
		if((<any>window).tinyMCEPopup) {
			let win: any = tinyMCEPopup.getWindowArg('window');

			win.document.getElementById(tinyMCEPopup.getWindowArg('input')).value = previewUrl;
			if(typeof((<any>window).ImageDialog) != 'undefined') {
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
        let doRename = (_e: any, ui: AleritfyDialogUI) => {
			let oldPath = resourceObject.id;
			let givenName = ui.getInputValue();

			if(!givenName) {
				// TODO: file/folder message depending on file type
				error(lg('new_filename'));
				return;
			}

			if(!config.options.allowChangeExtensions) {
				let suffix = getExtension(resourceObject.attributes.name);

				if(suffix.length > 0)
					givenName = givenName + '.' + suffix;

			}

			// File only - Check if file extension is allowed
			if(isFile(oldPath) && !isAuthorizedFile(givenName)) {
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
					if(fmModel.previewFile() && (<PreviewModel>fmModel.previewModel).rdo().id === oldPath)
                        (<PreviewModel>fmModel.previewModel).applyObject(newItem);

					ui.closeDialog();
					if(config.options.showConfirmation)
						success(lg('successful_rename'));

				}
				handleAjaxResponseErrors(response);
			}).fail(handleAjaxError);
		};

		prompt(<any>{
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
	public moveItemPrompt(objects: NodeItem[], successCallback: Function) {
		let fmModel = this.fmModel;
		let objectsTotal: number = objects.length;
		let message: string = (objectsTotal > 1) ? lg('prompt_move_multiple').replace('%s', <any>objectsTotal) : lg('prompt_move');

		prompt(<any>{
			message: message,
			value: fmModel.currentPath(),
			okBtn: {
				label: lg('action_move'),
				autoClose: false,
				click: (_e: any, ui: AleritfyDialogUI) => {
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
	public copyItem(resourceObject: ReadableObject | NodeItem, targetPath: string) {
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
	public moveItem(resourceObject: ReadableObject | NodeItem, targetPath: string) {
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
				if(fmModel.previewFile() && (<PreviewModel>fmModel.previewModel).rdo().id === resourceObject.id)
					fmModel.previewFile(false);

				alertify.clearDialogs();
				if(config.options.showConfirmation)
					success(lg('successful_moved'));

			}
			handleAjaxResponseErrors(response);
		}).fail(handleAjaxError);
	}

	// Prompts for confirmation, then deletes the current item.
	public deleteItemPrompt(objects: NodeItem[], successCallback: Function) {
		let objectsTotal: number = objects.length;
		let message = (objectsTotal > 1) ? lg('confirm_delete_multiple').replace('%s', <any>objectsTotal) : lg('confirm_delete');

		confirm(<any>{
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
	public deleteItem(path: string) {
		let fmModel = this.fmModel;

		return this.buildAjaxRequest('GET', {
			mode: 'delete',
			path: path
		}).done(response => {
			if(response.data) {
				let targetItem = response.data;

				fmModel.removeItem(targetItem);

				// ON delete currently previewed file
				if(fmModel.previewFile() && (<PreviewModel>fmModel.previewModel).rdo().id === targetItem.id)
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
                (<any>$).fileDownload(this.buildConnectorUrl(queryParams)); // todo: type this
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
    public saveItem(_resourceObject: ReadableObject) {
		let fmModel = this.fmModel;
		let formParams = $('#fm-js-editor-form').serializeArray();

		this.buildAjaxRequest('POST', formParams).done(response => {
			if(response.data) {
				let dataObject = response.data;
				let preview_model: PreviewModel = <PreviewModel>fmModel.previewModel;
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

	public getItemInfo(targetPath: string) {
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

		prompt(<any>{
			message: lg('prompt_extract'),
			value: fmModel.currentPath(),
			okBtn: {
				label: lg('action_extract'),
				autoClose: false,
				click: (_e: any, ui: AleritfyDialogUI) => {
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
	public extractItem(resourceObject: ReadableObject, targetPath: string) {
		let fmModel = this.fmModel;

		this.buildAjaxRequest('POST', {
			mode: 'extract',
			source: resourceObject.id,
			target: targetPath
		}).done(response => {
			if(response.data) {
				// TODO: implement "addItems", add in batches
				$.each(response.data, (_i, resourceObject: ReadableObject) => {
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
	public getDetailView(resourceObject: ReadableObject): any {
		let fmModel = this.fmModel;

		if(!resourceObject.attributes.readable) {
			error(lg('NOT_ALLOWED_SYSTEM'));
			return false;
		}
		if(resourceObject.type === 'file')
            (<PreviewModel>fmModel.previewModel).applyObject(resourceObject);

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
	public performAction(action: string, options: any, targetObject: ReadableObject, selectedObjects?: NodeItem[] | ReadableObject[]) {
		let fmModel = this.fmModel;
		// suppose that target object is part of selected objects while multiple selection
		let objects: NodeItem[] | ReadableObject[] = selectedObjects ? selectedObjects : [ targetObject ];

		switch(action) {
			case 'select':
				this.selectItem(targetObject);
				break;

			case 'download':
				$.each(objects, (_i: number, itemObject: ReadableObject | NodeItem) => {
					this.downloadItem(<ReadableObject>itemObject);
				});
				break;

			case 'rename':
				this.renameItem(targetObject);
				break;

            case 'move':
				this.moveItemPrompt(<NodeItem[]>objects, (targetPath: string) => {
					this.processMultipleActions(<NodeItem[]>objects, (_i: number, itemObject: NodeItem) => this.moveItem(itemObject, targetPath));
				});
				break;

			case 'delete':
				this.deleteItemPrompt(<NodeItem[]>objects, () => {
					this.processMultipleActions(<NodeItem[]>objects, (_i: number, itemObject: NodeItem) => this.deleteItem(<string>itemObject.id));
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
				let clipboard = new Clipboard(options.$selected[ 0 ], <any>{
					text: (_trigger: any): string => this.createCopyUrl(targetObject)
				});

				clipboard.on('success', (/*e*/) => {
					success(lg('copied'));
					clipboard.destroy();
				});
				break;
		}
	}

	// Handling file uploads
	public setupUploader(): any {
		let fmModel = this.fmModel;
		let settings = this.settings;

		if(config.options.browseOnly)
			return false;

		// Multiple Uploads
		if(config.upload.multiple) {
			// remove simple file upload element
			$('#file-input-container').remove();

			this.$uploadButton.unbind().click((): any => {
				if(this.capabilities.indexOf('upload') === -1) {
					error(lg('NOT_ALLOWED'));
					return false;
				}

				let allowedFileTypes = null;
				let currentPath = fmModel.currentPath();
				let templateContainer = tmpl('tmpl-fileupload-container', {
					folder: lg('current_folder') + currentPath,
					info: lg('upload_files_number_limit').replace('%s', <any>config.upload.maxNumberOfFiles) + ' ' + lg('upload_file_size_limit').replace('%s', formatBytes(config.upload.fileSizeLimit, true)),
					lang: getTranslations()
				});

				if(config.security.extensions.policy == 'ALLOW_LIST')
					allowedFileTypes = new RegExp('(\\.|\\/)(' + config.security.extensions.restrictions.join('|') + ')$', 'i');

				dialog(<any>{
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
                    (<any>$dropzoneWrapper).mCustomScrollbar({
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
				$dropzone.on('click', '.button-resume', (e: any): any => {
					let $target = $(e.target);
					let $buttons = $target.parent().parent();
					let data = $buttons.data();
					let file: any = data.files[ 0 ];

					function resumeUpload(data: any) {
                        (<any>$).blueimp.fileupload.prototype.options.add.call($('#fileupload')[ 0 ], e, data);
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
				$dropzone.on('click', '.button-remove', (e) => {
					let $target = $(e.target);
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
					.fileupload(<any>{
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
							maxNumberOfFiles: lg('upload_files_number_limit').replace('%s', <any>config.upload.maxNumberOfFiles),
							acceptFileTypes: lg('upload_file_type_invalid'),
							maxFileSize: `${lg('upload_file_too_big')} ${lg('upload_file_size_limit').replace('%s', formatBytes(config.upload.fileSizeLimit, true))}`
						},
						// image preview options
						previewMaxHeight: 120,
						previewMaxWidth: 120,
						previewCrop: true
					})

					.on('fileuploadadd', (_e: any, data: any): void => {
						let $items = $dropzone.children('.upload-item');
						$.each(data.files, (_index: number, file: any): any => {
							// skip selected files if total files number exceed "maxNumberOfFiles"
							if($items.length >= config.upload.maxNumberOfFiles) {
								error(<any>lg('upload_files_number_limit').replace('%s', <any>config.upload.maxNumberOfFiles), <any>{
									logClass: 'fileuploadadd',
									unique: true
								});
								return false;
							}
							// to display in item template
							file.formattedSize = formatBytes(file.size);
							let $template = $(tmpl('tmpl-upload-item', {
								file: file,
								lang: getTranslations(),
								imagesPath: `${settings.baseUrl}/scripts/jQuery-File-Upload/img`
							}));
							file.context = $template;
							$template.find('.buttons').data(data);
							$template.appendTo($dropzone);
						});
						updateDropzoneView();
					})

					.on('fileuploadsend', (_e: any, data: any) => {
						$.each(data.files, (_index: number, file) => {
							let $node = file.context;
							$node.removeClass('added aborted error').addClass('process');

							// workaround to handle a case while chunk uploading when you may press abort button after
							// uploading is done, but right before "fileuploaddone" event is fired, and try to resume upload
							if(file.chunkUploaded && (data.total === data.uploadedBytes))
								$node.remove();

						});
					})

					.on('fileuploadfail', (_e: any, data: any) => {
						$.each(data.files, (_index: number, file) => {
							file.error = lg('upload_failed');
							let $node = file.context;
							$node.removeClass('added process').addClass('error');
						});
					})

					.on('fileuploaddone', (_e: any, data: any) => {
						let response = data.result;
						$.each(data.files, (_index: number, file) => {
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

					.on('fileuploadalways', (_e: any, data: any) => {
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

					.on('fileuploadchunkdone', (_e: any, data: any) => {
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

					.on('fileuploadprocessalways', (_e: any, data: any) => {
						$.each(data.files, (_index: number, file) => {
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

					.on('fileuploadprogress', (_e: any, data: any) => {
						$.each(data.files, (_index: number, file) => {
							// fill progress bar for single item
							let $node = file.context;
							let progress = parseInt(<any>(data.loaded / data.total * 100), 10);

							$node.find('.progress-bar').css('width', progress + '%');
						});
					})

					.on('fileuploadprogressall', (_e: any, data: any) => {
						// fill total progress bar
						let progress = parseInt(<any>(data.loaded / data.total * 100), 10);

						$totalProgressBar.css('width', progress + '%');
					});
			});

			// Simple Upload
		} else {

			this.$uploadButton.click((e): any => {
				if(this.capabilities.indexOf('upload') === -1) {
					error(lg('NOT_ALLOWED'));
					return false;
				}

				let data = $(e.target).data();

				if($.isEmptyObject(data))
					error(lg('upload_choose_file'));
				else
					data.submit();

			});

			this.$uploader
				.fileupload(<any>{
					autoUpload: false,
					dataType: 'json',
					url: this.buildConnectorUrl(),
					paramName: 'files',
					maxChunkSize: config.upload.chunkSize
				})

				.on('fileuploadadd', (_e: any, data: any) => {
					this.$uploadButton.data(data);
				})

				.on('fileuploadsubmit', (_e: any, data: any) => {
					data.formData = this.extendRequestParams('POST', {
						mode: 'upload',
						path: fmModel.currentPath()
					});
					this.$uploadButton.addClass('loading').prop('disabled', true);
					this.$uploadButton.children('span').text(lg('loading_data'));
				})

				.on('fileuploadalways', (_e: any, data: any) => {
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

				.on('fileuploadchunkdone', (_e: any, data: any) => {
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
	public has_capability(resourceObject: ReadableObject, cap: string): boolean {
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
