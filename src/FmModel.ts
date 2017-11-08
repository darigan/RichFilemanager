import {Config, NodeItem, ReadableObject} from "./Types";
import {PreviewModel} from "./PreviewModel";
import {TreeModel, TreeNodeObject} from "./TreeModel";
import {ItemObject, ItemsModel} from "./ItemModel";
import {TableViewModel} from "./TableViewModel";
import {HeaderModel} from "./HeaderModel";
import {SummaryModel} from "./SummaryModel";
import {FilterModel} from "./FilterModel";
import {SearchModel} from "./SearchModel";
import {ClipboardModel} from "./ClipboardModel";
import {BreadcrumbsModel} from "./BreadcrumbsModel";
import {DragAndDropModel} from "./DragAndDropModel";
import {SelectionModel} from "./SelectionModel";
import {richFilemanagerPlugin} from "./filemanager";

export class FmModel {
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
            if (!enabled) {
                // close editor upon disabling preview
                previewModel.closeEditor();

                // update content of descriptive panel
                if (model.itemsModel.descriptivePanel.rdo().id === previewModel.rdo().id)
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

        if (targetNode) {
            let newNode: TreeNodeObject = fmModel.treeModel.createNode(resourceObject);

            fmModel.treeModel.addNodes(targetNode, newNode);
        }

        // handle view objects
        if (fmModel.currentPath() === targetPath)
            fmModel.itemsModel.addNew(resourceObject);

    }

    removeItem(resourceObject: ReadableObject | NodeItem) {
        let fmModel = this;

        // handle tree nodes
        let treeNode: TreeNodeObject = fmModel.treeModel.findByParam('id', resourceObject.id);

        if (treeNode)
            treeNode.remove();

        // handle view objects
        let viewItem: ItemObject = fmModel.itemsModel.findByParam('id', resourceObject.id);

        if (viewItem)
            viewItem.remove();

    }

    // fetch selected view items OR tree nodes
    fetchSelectedItems(instanceName?: NodeItem): NodeItem[] {
        let fmModel = this;
        let selectedNodes: TreeNodeObject[];
        let selectedItems: ItemObject[];

        if (instanceName === (<any>ItemObject).name)
            return fmModel.itemsModel.getSelected();

        if (instanceName === (<any>TreeNodeObject).name)
            return fmModel.treeModel.getSelected();

        if (!instanceName) {
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
        if (this.config.manager.selection.enabled && this.config.manager.selection.useCtrlKey && event.ctrlKey === true)
            return false;

        // single clicked while expected dblclick
        return !(this.config.manager.dblClickOpen && event.type === 'click');

    }
}
