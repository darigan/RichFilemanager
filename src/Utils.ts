import {ConfigOptions} from "./Types";
import {getLang, translate} from "./LangModel";
import {$fileinfo, config} from "./filemanager";
import {TreeNodeObject} from "./TreeModel";

export function file_exists(url: string): JQuery.jqXHR {
    return $.ajax({
        type: 'HEAD',
        url: url
    });
}

export function expandNode(node: TreeNodeObject): boolean {
    if (node.isExpanded() === false && node.isLoaded() === true) {
        node.isSliding(true);
        return true;
    }
    return false;
}

export function collapseNode(node: TreeNodeObject): boolean {
    if (node.isExpanded() === true) {
        node.isSliding(true);
        return true;
    }
    return false;
}

// Test if path is dir
export function isFile(path: string) {
    return path.charAt(path.length - 1) !== '/';
}

// Replace all leading or trailing chars with an empty string
export function trim(string: string, char: string): string {
    let regExp = new RegExp(`^${char}+|${char}+$`, 'g');

    return string.replace(regExp, '');
}

// Replace all leading chars with an empty string
export function ltrim(string: string, char: string): string {
    let regExp = new RegExp(`^${char}+`, 'g');

    return string.replace(regExp, '');
}

// Replace all trailing chars with an empty string
export function rtrim(string: string, char: string): string {
    let regExp = new RegExp(`${char}+$`, 'g');

    return string.replace(regExp, '');
}

export function startsWith(string: string, searchString: string, position?: number): boolean {
    position = position || 0;
    return string.substr(position, searchString.length) === searchString;
}

// invert backslashes and remove duplicated ones
export function normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}

// return filename extension
export function getExtension(filename: string): string {

    if (filename.split('.').length === 1)
        return '';

    return (<string>filename.split('.').pop()).toLowerCase();
}

// return filename without extension
export function getFilename(filename: string): string {
    if (filename.lastIndexOf('.') !== -1)
        return filename.substring(0, filename.lastIndexOf('.'));
    else
        return filename;

}

// return path without filename
// "/dir/to/" 		  --> "/dir/to/"
// "/dir/to/file.txt" --> "/dir/to/"
export function getDirname(path: string): string {
    if (path.lastIndexOf('/') !== path.length - 1)
        return path.substr(0, path.lastIndexOf('/') + 1);
    else
        return path;

}

// return parent folder for path, if folder is passed it should ends with '/'
// "/dir/to/"          -->  "/dir/"
// "/dir/to/file.txt"  -->  "/dir/"
export function getParentDirname(path: string): string {
    return path.split('/').reverse().slice(2).reverse().join('/') + '/';
}

// return closest node for path
// "/dir/to/"          -->  "/dir/"
// "/dir/to/file.txt"  -->  "/dir/to/"
export function getClosestNode(path: string): string {
    return path.substring(0, path.slice(0, -1).lastIndexOf('/')) + '/';
}

// Clears browser window selection
export function clearSelection() {
    if ((<any>document).selection && (<any>document).selection.empty)
        (<any>document).selection.empty();
    else if (window.getSelection) {
        let sel = window.getSelection();

        sel.removeAllRanges();
    }
}

export function write(message: string, obj?: AlertifyOptions): IAlertify {
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

export function error(message: string, options?: AlertifyOptions) {
    return write(message, $.extend({}, {
        type: 'error',
        delay: 10000
    }, options));
}

export function warning(message: string, options?: AlertifyOptions) {
    return write(message, $.extend({}, {
        type: 'warning',
        delay: 10000
    }, options));
}

export function success(message: string, options?: AlertifyOptions) {
    return write(message, $.extend({}, {
        type: 'success',
        delay: 6000
    }, options));
}

export function alert(message: string) {
    alertify
        .reset()
        .dialogContainerClass('fm-popup')
        .alert(message);
}

export function confirm(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width)
        .dialogPersistent(<boolean>obj.persistent)
        .dialogContainerClass('fm-popup')
        .confirm(<string>obj.message, obj.okBtn, obj.cancelBtn);
}

export function prompt(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width) // dialogWidth
        .dialogPersistent(<boolean>obj.persistent) // dialogPersistent
        .dialogContainerClass('fm-popup')
        .theme(<AlertifyTemplates>obj.template)
        .prompt(<string>obj.message, obj.value || '', obj.okBtn, obj.cancelBtn);
}

export function dialog(obj: Message) {
    alertify
        .reset()
        .dialogWidth(obj.width)
        .dialogPersistent(<boolean>obj.persistent)
        .dialogContainerClass('fm-popup')
        .dialog(<string>obj.message, obj.buttons);
}

// Wrapper for translate method
export function lg(key: string): string {
    return translate(key);
}
// Converts bytes to KB, MB, or GB as needed for display
export function formatBytes(bytes: number | string, round?: boolean): string {
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

export function log(..._args: any[]): void {
    if((<ConfigOptions>config.options).logger && arguments) {
        [].unshift.call(arguments, new Date().getTime());
        console.log.apply(console, arguments);
    }
}

// Format server-side response single error object
export function formatServerError(errorObject: any): string {
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
export function handleAjaxError(response: JQuery.jqXHR): void {

    log(response.responseText || response);
    error(lg('ERROR_SERVER'));
    error(response.responseText);
}

// Handle ajax json response error.
export function handleAjaxResponseErrors(response: any) { // todo: no errors in JQuery.jqXHR
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
export function isAuthorizedFile(filename: string): boolean {
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

export function encodePath(path: string): string {
    let parts: string[] = [];
    $.each(path.split('/'), (_i, part) => {
        parts.push(encodeURIComponent(part));
    });
    return parts.join('/');
}

// Test if is editable file
export function isEditableFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.editor.extensions) !== -1);
}

// Test if is image file
export function isImageFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.image.extensions) !== -1);
}

// Test if file is supported web video file
export function isVideoFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.video.extensions) !== -1);
}

// Test if file is supported web audio file
export function isAudioFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.audio.extensions) !== -1);
}

// Test if file is openable in iframe
export function isIFrameFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.iframe.extensions) !== -1);
}

// Test if file is opendoc file
// Supported file types: http://viewerjs.org/examples/
export function isOpenDocFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.opendoc.extensions) !== -1);
}

// Test if file is supported by Google Docs viewer
// Supported file types: http://stackoverflow.com/q/24325363/1789808
export function isGoogleDocsFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.google.extensions) !== -1);
}

// Test if file is supported by CodeMirror renderer
export function isCodeMirrorFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.codeMirrorRenderer.extensions) !== -1);
}

// Test if file is supported by Markdown-it renderer, which renders .md files to HTML
export function isMarkdownFile(filename: string): boolean {
    return ($.inArray(getExtension(filename), config.viewer.markdownRenderer.extensions) !== -1);
}

export function inArrayInsensitive(elem: any, arr: any[], i?: number): number {
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
