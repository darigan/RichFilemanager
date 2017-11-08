import * as CodeMirror from "codemirror";

import {config, richFilemanagerPlugin} from "./filemanager";

export class EditorModel {
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
            if (mode) {
                (<CodeMirror.EditorFromTextArea>this.instance).setOption('mode', mode);
                if (this.delayedContent) {
                    this.drawContent(this.delayedContent);
                    this.delayedContent = null;
                }
            }
        });
    }

    render(content: any) {
        if (this.mode())
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
                    if (cm.getOption('fullScreen'))
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
        if (config.editor.codeHighlight) {
            let cm: string = '/scripts/CodeMirror/';

            if (extension === 'js') {
                assets.push(`${cm}mode/javascript/javascript.js`);
                currentMode = 'javascript';
            }
            if (extension === 'css') {
                assets.push(`${cm}mode/css/css.js`);
                currentMode = 'css';
            }
            if (extension === 'html') {
                assets.push(`${cm}mode/xml/xml.js`);
                currentMode = 'text/html';
            }
            if (extension === 'xml') {
                assets.push(`${cm}mode/xml/xml.js`);
                currentMode = 'application/xml';
            }
            if (extension === 'php') {
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
            if (extension === 'java') {
                assets.push(`${cm}mode/clike/clike.js`);
                currentMode = 'text/x-java';
            }
            if (extension === 'sql') {
                assets.push(`${cm}mode/sql/sql.js`);
                currentMode = 'text/x-mysql';
            }
            if (extension === 'md') {
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
            if (extension === 'sh') {
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

        if (assets.length) {
            assets.push(() => {
                // after all required assets are loaded
                this.mode(currentMode);
            });
            loadAssets(assets);
        } else
            this.mode(currentMode);

    }
}
