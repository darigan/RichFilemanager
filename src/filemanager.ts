import * as purl from 'purl';

import { buildLangFileUrl, getLang, getTranslations, init, setLang, setTranslations } from './LangModel';
import {
  Config, NodeItem, Params, ReadableObject, Settings
} from './Types';
import { defaults } from './Config';
import {
  clearSelection,
  dialog, encodePath, error,
  file_exists,
  formatBytes, formatServerError, getExtension, getFilename, handleAjaxError,
  handleAjaxResponseErrors, isAuthorizedFile, isFile, isImageFile,
  lg, normalizePath, rtrim, success, trim, write
} from './Utils';
import { FmModel } from './FmModel';
import { PreviewModel } from './PreviewModel';

/// <reference types="alertify"/>
/// <reference types="jquery"/>
/// <reference types="jqueryui"/>
/// <reference types="types.d.ts"/>

export let config: Config;
export let $fileinfo: JQuery; // Temporary Workaround

export class richFilemanagerPlugin {
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
    }).done((response: any) => {
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
              setTimeout(function() {
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
        }).done(function(jsonTrans) {
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
          $obstacle.stop().animate({ scrollTop: scrollOffset }, 100, 'linear', function() {
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
        };
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
    $('#newfile').change(function() {
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
          onScrollStart: function(this: mCustomScrollbar) {
            if(!fmModel.itemsModel.continiousSelection()) {
              this.yStartPosition = this.mcs.top;
              this.yStartTime = (new Date()).getTime();
            }
            fmModel.ddModel.isScrolling = true;
          },
          onScroll: function() {
            fmModel.ddModel.isScrolling = false;
            fmModel.ddModel.isScrolled = true;
          },
          whileScrolling: function(this: mCustomScrollbar) {
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
    $loading.fadeOut(800, function() {
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
    let configParams: { [key: string]: any; } = config.api.requestParams;

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
        let queryParams: Params = { path: resourceObject.id, mode: undefined, thumbnail: undefined };

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

          this.extractItem(resourceObject, targetPath);
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
      select: { name: lg('action_select'), className: 'select' },
      download: { name: lg('action_download'), className: 'download' },
      rename: { name: lg('action_rename'), className: 'rename' },
      move: { name: lg('action_move'), className: 'move' },
      separator1: '-----',
      copy: { name: lg('clipboard_copy'), className: 'copy' },
      cut: { name: lg('clipboard_cut'), className: 'cut' },
      delete: { name: lg('action_delete'), className: 'delete' },
      extract: { name: lg('action_extract'), className: 'extract' },
      copyUrl: { name: lg('copy_to_clipboard'), className: 'copy-url' }
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

    return contextMenuItems;
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

        $dropzoneWrapper.on('click', function(e) {
          if(e.target === this || $(e.target).parent()[ 0 ] === this || e.target === $dropzone[ 0 ] || $(e.target).parent().hasClass('default-message'))
            $('#fileupload', $uploadContainer).trigger('click');

        });

        /**
         * Start uploading process.
         */
        $dropzone.on('click', '.button-start', function(/*e*/) {
          let $target = $(this);
          let $buttons = $target.parent().parent();
          let data = $buttons.data();

          data.submit();
          $target.remove();
        });

        /**
         * Abort uploading process.
         */
        $dropzone.on('click', '.button-abort', function(/*e*/) {
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

            this.getItemInfo(targetPath).then(function(response) {
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

        $dropzone.on('click', '.button-info', function(/*e*/) {
          let $target = $(this);
          let $node = $target.closest('.upload-item');

          if($node.hasClass('error')) {
            let $message = $node.find('.error-message');

            error($message.text());
          }
        });

        let updateDropzoneView = function() {
          if($dropzone.children('.upload-item').length > 0)
            $dropzone.addClass('started');
          else
            $dropzone.removeClass('started');
        };

        let shownExtensions = fmModel.filterModel.getExtensions();

        if(shownExtensions) {
          $('#fileupload').attr('accept', shownExtensions.map(function(el) {
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
