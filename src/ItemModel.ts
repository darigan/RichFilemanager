import {
  formatBytes, getExtension, getParentDirname, handleAjaxError, handleAjaxResponseErrors, isFile,
  log
} from './Utils';
import { ComputedDataObject, Params, ReadableObject } from './Types';
import { TreeNodeObject } from './TreeModel';
import { RenderModel } from './RenderModel';
import { config, richFilemanagerPlugin } from './filemanager';
import { FmModel } from './FmModel';

export class ItemsModel {
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
          };
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
    let rfp = this.rfp;

    // not configured or already initiated
    if(config.viewer.image.lazyLoad !== true || this.lazyLoad)
      return;

    this.lazyLoad = new LazyLoad({
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

export class ItemObject {
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
