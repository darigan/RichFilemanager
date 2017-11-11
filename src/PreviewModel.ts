import { ComputedDataObject, ReadableObject, Editor, Viewer, Renderer } from './Types';
import { RenderModel } from './RenderModel';
import { EditorModel } from './EditorModel';
import { richFilemanagerPlugin } from './filemanager';
import {
  formatBytes, getExtension, isAudioFile, isCodeMirrorFile, isEditableFile, isGoogleDocsFile, isIFrameFile,
  isImageFile,
  isMarkdownFile,
  isOpenDocFile,
  isVideoFile, lg, success
} from './Utils';
import { config, settings } from './Config';

export class PreviewModel {
  clipboard: Clipboard;
  rdo: KnockoutObservable<ReadableObject>;
  cdo: KnockoutObservable<ComputedDataObject>;
  viewer: KnockoutObservableViewer; // This is a type
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

    this.rdo.subscribe((resourceObject: ReadableObject): void => {
      this.cdo(<any>{
        isFolder: (resourceObject.type === 'folder'),
        sizeFormatted: formatBytes(resourceObject.attributes.size),
        extension: (resourceObject.type === 'file') ? getExtension(resourceObject.id) : null,
        dimensions: resourceObject.attributes.width ? resourceObject.attributes.width + 'x' + resourceObject.attributes.height : null
      });
    });

    this.editor.content.subscribe((content: any): void => {
      // instantly render changes of editor content
      if(this.editor.isInteractive())
        this.renderer.render(content);
    });

    // todo: this looks familiar (see ItemModel)
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

  applyObject(resourceObject: ReadableObject): void {
    if(this.clipboard)
      this.clipboard.destroy();

    this.rfp.fmModel.previewFile(false);

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
      viewerObject.url = this.rfp.createImageUrl(resourceObject, false, true);
    }

    if(isAudioFile(filename) && config.viewer.audio.enabled === true) {
      viewerObject.type = 'audio';
      viewerObject.url = this.rfp.createPreviewUrl(resourceObject, true);
    }

    if(isVideoFile(filename) && config.viewer.video.enabled === true) {
      viewerObject.type = 'video';
      viewerObject.url = this.rfp.createPreviewUrl(resourceObject, true);
      viewerObject.options = {
        width: config.viewer.video.playerWidth,
        height: config.viewer.video.playerHeight
      };
    }

    if(isOpenDocFile(filename) && config.viewer.opendoc.enabled === true) {
      viewerObject.type = 'opendoc';
      viewerObject.url = `${settings.baseUrl}/scripts/ViewerJS/index.html#${this.rfp.createPreviewUrl(resourceObject, true)}`;
      viewerObject.options = {
        width: config.viewer.opendoc.readerWidth,
        height: config.viewer.opendoc.readerHeight
      };
    }

    if(isGoogleDocsFile(filename) && config.viewer.google.enabled === true) {
      viewerObject.type = 'google';
      viewerObject.url = `https://docs.google.com/viewer?url=${encodeURIComponent(this.rfp.createPreviewUrl(resourceObject, false))}&embedded=true`;
      viewerObject.options = {
        width: config.viewer.google.readerWidth,
        height: config.viewer.google.readerHeight
      };
    }

    if(isIFrameFile(filename) && config.viewer.iframe.enabled === true) {
      viewerObject.type = 'iframe';
      viewerObject.url = this.rfp.createPreviewUrl(resourceObject, true);
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
      editorObject.interactive = (<Renderer>this.renderer.renderer()).interactive;
    }

    this.viewer.type(viewerObject.type);
    this.viewer.url(viewerObject.url);
    this.viewer.options(viewerObject.options);
    this.viewer.pureUrl(this.rfp.createCopyUrl(resourceObject));
    this.viewer.isEditable(isEditableFile(filename) && config.editor.enabled === true);
    this.editor.isInteractive(editorObject.interactive);

    if(viewerObject.type === 'renderer' || this.viewer.isEditable()) {
      this.rfp.previewItem(resourceObject).then((response): void => {
        if(response.data) {
          let content: any = response.data.attributes.content;

          this.viewer.content(content);
          this.rfp.fmModel.previewFile(true);
        }
      });
    } else
      this.rfp.fmModel.previewFile(true);

  };

  afterRender() {
    let $previewWrapper: JQuery = this.rfp.$previewWrapper;

    this.renderer.render(this.viewer.content());

    let copyBtnEl = $previewWrapper.find('.btn-copy-url')[ 0 ];

    this.clipboard = new Clipboard(copyBtnEl, undefined);

    this.clipboard.on('success', (/*e*/) => {
      success(lg('copied'));
    });
  }

  initiateEditor(): void {
    let textarea: HTMLTextAreaElement = <HTMLTextAreaElement>this.rfp.$previewWrapper.find('.fm-cm-editor-content')[ 0 ];

    this.editor.createInstance(this.cdo().extension, textarea, {
      readOnly: false,
      styleActiveLine: true
    });
  }

  // fires specific action by clicking toolbar buttons in detail view
  bindToolbar(action: string): void {

    if(this.rfp.has_capability(this.rdo(), action)) {
      this.rfp.performAction(action, {}, this.rdo());
    }
  }

  editFile(): void {
    let content: any = this.viewer.content();

    this.renderer.render(content);
    this.editor.render(content);
  }

  saveFile(): void {
    this.rfp.saveItem(this.rdo());
  }

  closeEditor(): void {
    this.editor.enabled(false);
    // re-render viewer content
    this.renderer.render(this.viewer.content());
  }

  buttonVisibility(action: string): boolean {

    switch(action) {
      case 'select':
        return (this.rfp.has_capability(this.rdo(), action) && this.rfp.hasContext());
      case 'move':
      case 'rename':
      case 'delete':
      case 'download':
        return (this.rfp.has_capability(this.rdo(), action));
    }
    return undefined;
  }
}
