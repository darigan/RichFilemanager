import {ReadableObject} from "./Types";
import {richFilemanagerPlugin} from "./filemanager";
import {getDirname, getExtension, isMarkdownFile, ltrim, startsWith} from "./Utils";
import {EditorModel} from "./EditorModel";
import {PreviewModel} from "./PreviewModel";

export class RenderModel {
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
        if (this.renderer())
            (<MarkdownRenderer | CodeMirrorRenderer>this.renderer()).processContent(data);

    }

    setRenderer(resourceObject: ReadableObject) {
        let rfp = this.rfp;

        this.rdo(resourceObject);

        if (isMarkdownFile(resourceObject.attributes.name))
        // markdown renderer
            this.renderer(<MarkdownRenderer>new MarkdownRenderer(rfp, this));
        else
        // CodeMirror renderer
            this.renderer(<CodeMirrorRenderer>new CodeMirrorRenderer(rfp, this));

    }

    setContainer(templateElements: Element[]) {
        let _this = this;
        $.each(templateElements, function (): any {
            if ($(this).hasClass('fm-renderer-container')) {
                _this.$containerElement = <any>$(this);
                return false;
            }
        });

        (<MarkdownRenderer | CodeMirrorRenderer>this.renderer()).processDomElements(this.$containerElement);
    }
}

export class CodeMirrorRenderer {
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

        if (!this.instance.instance) {
            let textarea: HTMLTextAreaElement = <HTMLTextAreaElement>$container.find('.fm-cm-renderer-content')[0];
            let extension = getExtension(render_model.rdo().id);

            this.instance.createInstance(extension, textarea, {
                readOnly: 'nocursor',
                styleActiveLine: false,
                lineNumbers: false
            });
        }
    }
}

export class MarkdownRenderer {
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
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return `<pre class="highlight"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
                    } catch (__) {
                    }
                }
                return `<pre class="highlight"><code>${instance.utils.escapeHtml(str)}</code></pre>`;
            },

            // custom link function to enable <img ...> and file d/ls:
            replaceLink: (link: string/*, env*/) => {

                // do not change if link as http:// or ftp:// or mailto: etc.
                if (link.search('://') != -1 || startsWith(link, 'mailto:'))
                    return link;

                // define path depending on absolute / relative link type
                let basePath = (startsWith(link, '/')) ? rfp.fileRoot : getDirname(render_model.rdo().id);
                let path = basePath + ltrim(link, '/');

                if (isMarkdownFile(path))
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

            if (editor.enabled() && editor.isInteractive()) {
                // prevent user from losing unsaved changes in preview mode
                // in case of clicking on a link that jumps off the page
                $(this).off('click');
                $(this).on('click', () => false); // prevent onClick event
            } else {
                if (href.search('://') != -1 || startsWith(href, 'mailto:'))
                    return; // do nothing

                if (isMarkdownFile(href)) {
                    // open file in preview mode for clicked link
                    $(this).on('click', (/*e*/) => {
                        getItemInfo(href).then(response => {
                            if (response.data)
                                getDetailView(response.data);

                        });

                        return false; // prevent onClick event
                    });
                }
            }
        });
    }
}