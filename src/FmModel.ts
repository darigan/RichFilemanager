import { Config, NodeItem, ReadableObject } from './Types';
import { PreviewModel } from './PreviewModel';
import { TreeModel, TreeNodeObject } from './TreeModel';
import { ItemObject, ItemsModel } from './ItemModel';
import { TableViewModel } from './TableViewModel';
import { HeaderModel } from './HeaderModel';
import { SummaryModel } from './SummaryModel';
import { FilterModel } from './FilterModel';
import { SearchModel } from './SearchModel';
import { ClipboardModel } from './ClipboardModel';
import { BreadcrumbsModel } from './BreadcrumbsModel';
import { DragAndDropModel } from './DragAndDropModel';
import { SelectionModel } from './SelectionModel';
import { richFilemanagerPlugin } from './filemanager';

export class FmModel {
  // let model: any = this;

  config: KnockoutObservable<Config>; // todo: this is not being set
  loadingView: KnockoutObservable<boolean>;
  previewFile: KnockoutObservable<boolean>;
  viewMode: KnockoutObservable<string>;
  currentPath: KnockoutObservable<string>;
  browseOnly: KnockoutObservable<boolean>;
  previewModel: PreviewModel;
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

    this.loadingView = ko.observable(true);
    this.previewFile = ko.observable(false);
    this.viewMode = ko.observable(this.config.manager.defaultViewMode);
    this.currentPath = ko.observable(rfp.fileRoot);
    this.browseOnly = ko.observable(this.config.options.browseOnly);
    // todo: check this
    // this.previewModel = ko.observable(null);

    this.previewFile.subscribe((enabled: boolean): void => {
      if(!enabled) {
        // close editor upon disabling preview
        this.previewModel.closeEditor();

        // update content of descriptive panel
        if(this.itemsModel.descriptivePanel.rdo().id === this.previewModel.rdo().id)
          this.itemsModel.descriptivePanel.render(this.previewModel.viewer.content());

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
    // handle tree nodes
    let targetNode: TreeNodeObject = this.treeModel.findByParam('id', targetPath);

    if(targetNode) {
      let newNode: TreeNodeObject = this.treeModel.createNode(resourceObject);

      this.treeModel.addNodes(targetNode, newNode);
    }

    // handle view objects
    if(this.currentPath() === targetPath)
      this.itemsModel.addNew(resourceObject);

  }

  removeItem(resourceObject: ReadableObject): void {
    // handle tree nodes
    let treeNode: TreeNodeObject = this.treeModel.findByParam('id', resourceObject.id);

    if(treeNode)
      treeNode.remove();

    // handle view objects
    let viewItem: ItemObject = this.itemsModel.findByParam('id', resourceObject.id);

    if(viewItem)
      viewItem.remove();

  }

  // fetch selected view items OR tree nodes
  fetchSelectedItems(instanceName?: NodeItem): NodeItem[] {
    let selectedNodes: TreeNodeObject[];
    let selectedItems: ItemObject[];

    if(instanceName === (<any>ItemObject).name)
      return this.itemsModel.getSelected();

    if(instanceName === (<any>TreeNodeObject).name)
      return this.treeModel.getSelected();

    if(!instanceName) {
      selectedNodes = this.treeModel.getSelected();
      selectedItems = this.itemsModel.getSelected();

      return (selectedItems.length > 0) ? selectedItems : selectedNodes;
    }
    throw new Error('Unknown item type.');
  }

  // fetch resource objects out of the selected items
  fetchSelectedObjects(item: NodeItem): ReadableObject[] {
    let objects: ReadableObject[] = [];

    $.each(this.fetchSelectedItems((<any>item.constructor).name), (_i: number, itemObject: NodeItem): void => {
      objects.push(itemObject.rdo);
    });
    return objects;
  }

  // check whether view item can be opened based on the event and configuration options
  isItemOpenable(event: JQuery.Event): boolean {
    // selecting with Ctrl key
    if(this.config.manager.selection.enabled && this.config.manager.selection.useCtrlKey && event.ctrlKey === true)
      return false;

    // single clicked while expected dblclick
    return !(this.config.manager.dblClickOpen && event.type === 'click');

  }
}
