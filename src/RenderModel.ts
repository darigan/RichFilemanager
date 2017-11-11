import { ReadableObject } from './Types';
import { richFilemanagerPlugin } from './filemanager';
import {
  buildConnectorUrl, extendRequestParams, getDirname, getExtension, getItemInfo, isMarkdownFile, ltrim,
  startsWith
} from './Utils';
import { EditorModel } from './EditorModel';

export class RenderModel {
  $containerElement: JQuery;

  rdo: KnockoutObservable<ReadableObject>;
  content: KnockoutObservable<any>;
  renderer: KnockoutObservable<MarkdownRenderer | CodeMirrorRenderer>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.rdo = ko.observable(<ReadableObject>{});
    this.content = ko.observable(null);
    this.renderer = ko.observable(null);
  }

  render(data: any): void {
    if(this.renderer())
      (<MarkdownRenderer | CodeMirrorRenderer>this.renderer()).processContent(data);

  }

  setRenderer(resourceObject: ReadableObject): void {
    this.rdo(resourceObject);

    if(isMarkdownFile(resourceObject.attributes.name))
    // markdown renderer
      this.renderer(new MarkdownRenderer(this.rfp, this));
    else
    // CodeMirror renderer
      this.renderer(new CodeMirrorRenderer(this.rfp, this));

  }

  setContainer(templateElements: Element[]): void {
    $.each(templateElements, (_i: number, element: Element): boolean => {
      if($(element).hasClass('fm-renderer-container')) {
        this.$containerElement = <any>$(element);
        return false;
      }
      return undefined;
    });

    this.renderer().processDomElements(this.$containerElement);
  }
}

export class CodeMirrorRenderer {
  name: string = 'codeMirror';
  interactive: boolean = false;
  instance: EditorModel;

  constructor(rfp: richFilemanagerPlugin, private render_model: RenderModel) {
    this.instance = new EditorModel(rfp);
  }

  processContent(data: any): void {
    this.instance.render(data);
    this.render_model.content(data);
  }

  processDomElements($container: JQuery): void {
    if(!this.instance.instance) {
      let textarea: HTMLTextAreaElement = <HTMLTextAreaElement>$container.find('.fm-cm-renderer-content')[ 0 ];
      let extension: string = getExtension(this.render_model.rdo().id);

      this.instance.createInstance(extension, textarea, {
        readOnly: 'nocursor',
        styleActiveLine: false,
        lineNumbers: false
      });
    }
  }
}

export class MarkdownRenderer {
  name: string = 'markdown';
  interactive: boolean = true;
  instance: any; // markdownit

  constructor(private rfp: richFilemanagerPlugin, private render_model: RenderModel) {
    this.instance = (<any>window).markdownit({
      // Basic options:
      html: true,
      linkify: true,
      typographer: true,

      // Custom highlight function to apply CSS class `highlight`:
      highlight: (str: string, lang: string): string => {
        if(lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="highlight"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
          } catch(__) {
          }
        }
        return `<pre class="highlight"><code>${this.instance.utils.escapeHtml(str)}</code></pre>`;
      },

      // custom link function to enable <img ...> and file d/ls:
      replaceLink: (link: string): string => {

        // do not change if link as http:// or ftp:// or mailto: etc.
        if(link.search('://') != -1 || startsWith(link, 'mailto:'))
          return link;

        // define path depending on absolute / relative link type
        let basePath: string = (startsWith(link, '/')) ? rfp.fileRoot : getDirname(render_model.rdo().id);
        let path: string = basePath + ltrim(link, '/');

        if(isMarkdownFile(path))
        // to open file in preview mode upon click
          return path;
        else {
          let queryParams = extendRequestParams('GET', {
            mode: 'readfile',
            path: path
          });
          return buildConnectorUrl(queryParams);
        }
      }
    }).use((<any>window).markdownitReplaceLink);
  }

  processContent(data: any): void {
    let result: any = this.instance.render(data);

    this.render_model.content(result);
    this.setLinksBehavior();
  }

  // noinspection JSUnusedLocalSymbols
  processDomElements(_container: JQuery): void {
    // todo: why is this empty?
  }

  setLinksBehavior(): void {
    // add onClick events to local .md file links (to perform AJAX previews)
    this.render_model.$containerElement.find('a').each((_i: number, element: HTMLElement): void => {
      let href: string = $(element).attr('href');

      if(this.rfp.fmModel.previewModel.editor.enabled() && this.rfp.fmModel.previewModel.editor.isInteractive()) {
        // prevent user from losing unsaved changes in preview mode
        // in case of clicking on a link that jumps off the page
        $(element).off('click');
        $(element).on('click', (): boolean => false); // prevent onClick event
      } else {
        if(href.search('://') != -1 || startsWith(href, 'mailto:'))
          return; // do nothing

        if(isMarkdownFile(href)) {
          // open file in preview mode for clicked link
          $(element).on('click', (): boolean => {
            getItemInfo(href).then((response: any): void => {
              if(response.data)
                this.rfp.getDetailView(response.data);

            });

            return false; // prevent onClick event
          });
        }
      }
    });
  }
}