import {
  buildAjaxRequest, formatBytes, getExtension, getParentDirname, handleAjaxError, handleAjaxResponseErrors, isFile, log
} from './Utils';
import { ComputedDataObject, QueryParams, ReadableObject } from './Types';
import { RenderModel } from './RenderModel';
import { richFilemanagerPlugin } from './filemanager';
import { _url_, config } from './Config';

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
  lazyLoad: ILazyLoad = null;

  constructor(private rfp: richFilemanagerPlugin) {
    this.objects = ko.observableArray([]);
    this.objectsSize = ko.observable(0);
    this.objectsNumber = ko.observable(0);
    this.selectedNumber = ko.observable(0);
    this.listSortField = ko.observable(rfp.configSortField);
    this.listSortOrder = ko.observable(rfp.configSortOrder);
    this.isSelecting = ko.observable(false);
    this.continiousSelection = ko.observable(false);
    this.descriptivePanel = new RenderModel(rfp);

    this.isSelecting.subscribe((state: boolean): void => {
      if(!state) {
        // means selection lasso has been dropped
        this.continiousSelection(false);
      }
    });
    this.objects.subscribe((items: ItemObject[]) => {
      let totalNumber: number = 0;
      let totalSize: number = 0;

      items.forEach((item: ItemObject): void => {
        if(item.rdo.type !== 'parent')
          totalNumber++;

        if(item.rdo.type === 'file')
          totalSize += Number(item.rdo.attributes.size);

      });
      // updates folder summary info
      this.objectsNumber(totalNumber);
      this.objectsSize(formatBytes(totalSize));

      // update
      if(this.lazyLoad) {
        setTimeout((): void => {
          this.lazyLoad.update();
        }, 50);
      }

      // context menu
      rfp.$viewItems.contextMenu({
        selector: '.file, .directory',
        zIndex: 100,
        // wrap options with "build" allows to get item element
        build: ($triggerElement: JQuery): any => {
          let koItem: ItemObject = ko.dataFor($triggerElement[ 0 ]);

          if(!koItem.selected()) {
            rfp.fmModel.itemsModel.unselectItems(false);
            koItem.selected(true);
          }

          return {
            appendTo: '.fm-container',
            items: rfp.getContextMenuItems(koItem.rdo),
            callback: (itemKey: string, options: any): void => {
              rfp.performAction(itemKey, options, koItem.rdo, rfp.fmModel.fetchSelectedObjects(koItem));
            }
          };
        }
      });
    });

  }

  createObject(resourceObject: ReadableObject): ItemObject {
    let item: ItemObject = new ItemObject(this.rfp, resourceObject);

    this.rfp.fmModel.filterModel.filterItem(item);

    return item;
  }

  addNew(dataObjects: ReadableObject | ReadableObject[]): void {
    // use underlying array for better performance
    // http://www.knockmeout.net/2012/04/knockoutjs-performance-gotcha.html
    let items: ItemObject[] = this.rfp.fmModel.itemsModel.objects();

    if(!Array.isArray(dataObjects))
      dataObjects = [ dataObjects ];

    $.each(dataObjects, (_i, resourceObject: ReadableObject): void => {
      items.push(this.createObject(resourceObject));
    });

    items = <ItemObject[]>this.rfp.sortItems(items);
    this.rfp.fmModel.itemsModel.objects.valueHasMutated();
  }

  loadList(path: string): void {
    this.rfp.fmModel.loadingView(true);

    let queryParams: QueryParams = {
      mode: 'getfolder',
      path: path,
      type: undefined
    };
    if(_url_.param('type'))
      queryParams.type = _url_.param('type');

    buildAjaxRequest('GET', queryParams).done(response => {
      if(response.data) {
        this.rfp.fmModel.currentPath(path);
        this.rfp.fmModel.breadcrumbsModel.splitCurrent();
        this.rfp.fmModel.itemsModel.setList(response.data);

        if(this.rfp.fmModel.itemsModel.lazyLoad) // todo: necessary? seems it point to itself
          this.rfp.fmModel.itemsModel.lazyLoad.update();

      }
      handleAjaxResponseErrors(response);
    }).fail(handleAjaxError);
  }

  setList(dataObjects: ReadableObject[]) {
    let objects: ItemObject[] = [];

    // add parent folder object
    if(!isFile(this.rfp.fmModel.currentPath()) && this.rfp.fmModel.currentPath() !== this.rfp.fileRoot) {
      let parentPath: string = getParentDirname(this.rfp.fmModel.currentPath());

      let parentItem: ItemObject = <ItemObject>new ParentItemObject(this.rfp, parentPath);

      objects.push(parentItem);
    }

    // clear previously rendered content
    this.descriptivePanel.content(null);

    $.each(dataObjects, (_i: number, resourceObject: ReadableObject) => {
      if(config.manager.renderer.position && typeof config.manager.renderer.indexFile === 'string' &&
        resourceObject.attributes.name.toLowerCase() === config.manager.renderer.indexFile.toLowerCase()
      ) {
        this.descriptivePanel.setRenderer(resourceObject);

        // load and render index file content
        this.rfp.previewItem(this.descriptivePanel.rdo()).then(response => {
          if(response.data)
            this.descriptivePanel.render(response.data.attributes.content);
        });
      }
      objects.push(this.createObject(resourceObject));
    });

    this.rfp.fmModel.itemsModel.objects(<ItemObject[]>this.rfp.sortItems(objects));
    this.rfp.fmModel.loadingView(false);
  }

  findByParam(key: string, value: any): ItemObject {
    return ko.utils.arrayFirst(this.rfp.fmModel.itemsModel.objects(),
      (object: ItemObject): boolean => (<any>object)[ key ] === value);
  }

  findByFilter(filter: Function, allMatches: boolean): ItemObject[] {
    let firstMatch: boolean = !(allMatches || false);
    let resultItems: ItemObject[] = [];
    let items: ItemObject[] = this.objects();

    if(!items || items.length === 0)
      return null;

    for(let i: number = 0, l = items.length; i < l; i++) {
      if(filter(items[ i ])) {
        if(firstMatch)
          return [items[ i ]];
          // return items[ i ]; // This looked to be in error

        resultItems.push(items[ i ]);
      }
    }
    return firstMatch ? null : resultItems;
  }

  sortObjects(): void {
    let sortedList: ItemObject[] = <ItemObject[]>this.rfp.sortItems(this.objects());

    this.objects(sortedList);
  }

  getSelected(): ItemObject[] {
    let selectedItems: ItemObject | ItemObject[] = this.findByFilter((item: ItemObject): boolean => item.rdo.type !== 'parent' && item.selected(), true);

    this.selectedNumber(selectedItems.length);
    return selectedItems;
  }

  unselectItems(ctrlKey?: boolean): void {
    let appendSelection: boolean = (config.manager.selection.enabled && config.manager.selection.useCtrlKey && ctrlKey === true);

    if(!appendSelection) {
      // drop selection from selected items
      $.each(this.getSelected(), (_i: number, itemObject: ItemObject): void => {
        itemObject.selected(false);
      });
    }
  }

  initiateLazyLoad(): void {
    // not configured or already initiated
    if(config.viewer.image.lazyLoad !== true || this.lazyLoad)
      return;

    this.lazyLoad = new LazyLoad(<any>{
      container: <any>this.rfp.$fileinfo[ 0 ], // work only for default scrollbar
      callback_load: (element: Element): void => {
        log('LOADED', element.getAttribute('data-original'));
      },
      callback_set: (element: Element): void => {
        log('SET', element.getAttribute('data-original'));
      },
      callback_processed: (elementsLeft: number): void => {
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

  constructor(protected rfp: richFilemanagerPlugin, resourceObject: ReadableObject, isParent: boolean = false) {
    this.id = resourceObject.id; // for search purpose
    this.rdo = resourceObject; // original resource data object

    if(isParent)
      return;

    this.previewWidth = config.viewer.image.thumbMaxWidth;
    if(resourceObject.attributes.width && resourceObject.attributes.width < this.previewWidth)
      this.previewWidth = <number>resourceObject.attributes.width;

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

    this.selected.subscribe((value: boolean): void => {
      if(value && rfp.fmModel.treeModel.selectedNode() !== null)
        (rfp.fmModel.treeModel.selectedNode()).selected(false);

    });

    this.title = ko.pureComputed((): string => {
      return config.options.showTitleAttr ? this.rdo.id : null;
    });

    this.itemClass = ko.pureComputed((): string => {
      let cssClass: string[] = [];

      if(this.selected() && config.manager.selection.enabled)
        cssClass.push('ui-selected');

      if(this.dragHovered())
        cssClass.push(rfp.fmModel.ddModel.hoveredCssClass);

      return `${this.cdo.cssItemClass} ${cssClass.join(' ')}`;
    });

    this.listIconClass = ko.pureComputed((): string => {
      let cssClass: string;
      let extraClass: string[] = [ 'ico' ];

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
      return `${cssClass} ${extraClass.join('_')}`;
    });

    this.gridIconClass = ko.pureComputed((): string => {
        let cssClass: string[] = [];
        let extraClass: string[] = [ 'ico' ];

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

  mouseDown(item: ItemObject, e: JQuery.Event): void {
    // case: previously selected items are dragged instead of a newly one
    // unselect if currently clicked item is not the one of selected items
    if(!item.selected())
      this.rfp.fmModel.itemsModel.unselectItems(e.ctrlKey);

    this.rfp.fmModel.selectionModel.unselect = item.selected();
    item.selected(true);
  };

  open(item: ItemObject, e: JQuery.Event) {
    if(this.rfp.fmModel.selectionModel.unselect) {
      // case: click + ctrlKey on selected item
      if(e.ctrlKey)
        item.selected(false);

      // drop selection
      if(!e.ctrlKey && config.manager.dblClickOpen) {
        this.rfp.fmModel.itemsModel.unselectItems(e.ctrlKey);
        item.selected(true);
      }
    }

    if(this.rfp.fmModel.isItemOpenable(e)) {
      if(config.options.quickSelect && item.rdo.type === 'file' && this.rfp.has_capability(item.rdo, 'select'))
        this.rfp.selectItem(item.rdo);
      else
        this.rfp.getDetailView(item.rdo);

    }
  };

  remove(): void {
    this.rfp.fmModel.itemsModel.objects.remove(this);
  };
}

export class ParentItemObject extends ItemObject {
  constructor(rfp: richFilemanagerPlugin, parentPath: string) {
    super(rfp, {
      id: parentPath,
      type: 'parent',
      attributes: {
        readable: true,
        writable: true,
        size: undefined,
        name: undefined,
        path: undefined,
        width: undefined,
        height: undefined,
        capabilities: undefined,
        timestamp: undefined
      }
    }, true);

    this.itemClass = ko.pureComputed((): string => {
      let cssClass: string[] = [];

      if(this.dragHovered())
        cssClass.push(this.rfp.fmModel.ddModel.hoveredCssClass);

      return cssClass.join(' ');
    });
  }

  private loadList(path: string): void {
    this.rfp.fmModel.loadingView(true);

    let queryParams: QueryParams = {
      mode: 'getfolder',
      path: path,
      type: undefined
    };
    if(_url_.param('type'))
      queryParams.type = _url_.param('type');

    buildAjaxRequest('GET', queryParams).done(response => {
      if(response.data) {
        this.rfp.fmModel.currentPath(path);
        this.rfp.fmModel.breadcrumbsModel.splitCurrent();
        this.rfp.fmModel.itemsModel.setList(response.data);

        if(this.rfp.fmModel.itemsModel.lazyLoad) // todo: necessary? seems it point to itself
          this.rfp.fmModel.itemsModel.lazyLoad.update();

      }
      handleAjaxResponseErrors(response);
    }).fail(handleAjaxError);
  }

  open(_item: any, e: JQuery.Event) {
    if(this.rfp.fmModel.isItemOpenable(<any>e)) // todo: currently looks for keyboard or mouse event
      this.loadList(this.id);
  }
}
