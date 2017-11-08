import {ComputedDataObject, ReadableObject} from "./Types";
import {config, richFilemanagerPlugin} from "./filemanager";
import {collapseNode, error, expandNode, getExtension, handleAjaxError, handleAjaxResponseErrors, lg} from "./Utils";
import {FmModel} from "./FmModel";

export class TreeModel {
    selectedNode: KnockoutObservable<TreeNodeObject>;
    treeData: TreeNodeObject;
    fullexpandedFolder: any; // todo: find where this came from

    constructor(private rfp: richFilemanagerPlugin) {
        let fileRoot = rfp.fileRoot;

        this.selectedNode = ko.observable(null);

        this.treeData = <TreeNodeObject>{
            id: fileRoot,
            level: ko.observable(-1),
            children: ko.observableArray([])
        };

        this.treeData.children.subscribe((/*value*/) => {
            this.arrangeNode(<TreeNodeObject>this.treeData);
        });
    }

    expandFolderDefault(parentNode: TreeNodeObject) {
        if(this.fullexpandedFolder !== null) {
            if(!parentNode)
                parentNode = <TreeNodeObject>this.treeData;

            // looking for node that starts with specified path
            let node = this.findByFilter((node: TreeNodeObject) => (this.fullexpandedFolder.indexOf(node.id) === 0), parentNode);

            if(node) {
                config.filetree.expandSpeed = 10;
                this.loadNodes(node, false);
            } else {
                this.fullexpandedFolder = null;
                config.filetree.expandSpeed = 200;
            }
        }
    }

    mapNodes(filter: Function, contextNode?: TreeNodeObject): any {
        if(!contextNode)
            contextNode = <TreeNodeObject>this.treeData;

        // don't apply callback function to the treeData root node
        if(contextNode.id !== this.treeData.id)
            filter.call(this, contextNode);

        let nodes = contextNode.children();

        if(!nodes || nodes.length === 0)
            return null;

        for(let i = 0, l = nodes.length; i < l; i++) {
            filter.call(this, nodes[ i ]);
            this.findByFilter(filter, nodes[ i ]);
        }
    }

    findByParam(key: string, value: any, contextNode?: TreeNodeObject): TreeNodeObject {
        if(!contextNode) {
            contextNode = <TreeNodeObject>this.treeData;
            if((<any>contextNode)[ key ] === value)
                return contextNode;
        }
        let nodes: TreeNodeObject[] = contextNode.children();

        if(!nodes || nodes.length === 0)
            return null;

        for(let i = 0, l = nodes.length; i < l; i++) {
            if((<any>nodes[ i ])[ key ] === value)
                return nodes[ i ];

            let result = this.findByParam(key, value, nodes[ i ]);

            if(result)
                return result;
        }
        return null;
    }

    findByFilter(filter: Function, contextNode: TreeNodeObject): TreeNodeObject {
        if(!contextNode) {
            contextNode = <TreeNodeObject>this.treeData;
            if(filter(contextNode))
                return contextNode;

        }
        let nodes: TreeNodeObject[] = contextNode.children();

        if(!nodes || nodes.length === 0)
            return null;

        for(let i = 0, l = nodes.length; i < l; i++) {
            if(filter(nodes[ i ]))
                return nodes[ i ];

            let result: TreeNodeObject = this.findByFilter(filter, nodes[ i ]);

            if(result)
                return result;
        }
        return null;
    }

    getSelected(): TreeNodeObject[] {
        let selectedItems: TreeNodeObject[] = [];

        if(this.selectedNode())
            selectedItems.push(<TreeNodeObject>this.selectedNode());

        return selectedItems;
    }

    loadNodes(targetNode: TreeNodeObject, refresh: boolean) {
        let path: string = <string>(targetNode ? targetNode.id : this.treeData.id);
        let buildAjaxRequest = this.rfp.buildAjaxRequest;
        let expandFolderDefault = this.expandFolderDefault;

        if(targetNode)
            targetNode.isLoaded(false);

        let queryParams = {
            mode: 'getfolder',
            path: path
        };

        buildAjaxRequest('GET', queryParams).done(response => {
            if(response.data) {
                let nodes: TreeNodeObject[] = [];
                $.each(response.data, (_i, resourceObject) => {
                    let nodeObject: TreeNodeObject = this.createNode(resourceObject);

                    nodes.push(nodeObject);
                });
                if(refresh)
                    targetNode.children([]);

                this.addNodes(targetNode, nodes);
                // not root
                if(targetNode) {
                    targetNode.isLoaded(true);
                    expandNode(targetNode);
                }
                expandFolderDefault(targetNode);
            }
            handleAjaxResponseErrors(response);
        }).fail(handleAjaxError);
    }

    createNode(resourceObject: ReadableObject): TreeNodeObject {
        let node: TreeNodeObject = new TreeNodeObject(this.rfp, resourceObject);
        let fmModel: FmModel = this.rfp.fmModel;

        fmModel.filterModel.filterItem(node);
        return node;
    }

    addNodes(targetNode: TreeNodeObject, newNodes: TreeNodeObject[] | TreeNodeObject): void {
        let sortItems = this.rfp.sortItems;

        if(!Array.isArray(newNodes))
            newNodes = [ newNodes ];

        if(!targetNode)
            targetNode = <TreeNodeObject>this.treeData;

        // list only folders in tree
        if(config.filetree.foldersOnly)
            newNodes = $.grep(newNodes, (node: TreeNodeObject) => (node.cdo.isFolder)); // todo: ??

        $.each(newNodes, (_i, node: TreeNodeObject) => {
            node.parentNode(targetNode);
        });
        let allNodes: TreeNodeObject[] = targetNode.children().concat(newNodes);

        targetNode.children(<TreeNodeObject[]>sortItems(allNodes));
    }

    toggleNode(node: TreeNodeObject): void {
        if(!collapseNode(node))
            expandNode(node);
    }

    arrangeNode(node: TreeNodeObject): void {
        let childrenLength = node.children().length;

        $.each(node.children(), (index, cNode: TreeNodeObject) => {
            cNode.level(node.level() + 1);
            cNode.isFirstNode(index === 0);
            cNode.isLastNode(index === (childrenLength - 1));
        });
    }

    nodeRendered(elements: Element[], node: TreeNodeObject): void {
        let getContextMenuItems = this.rfp.getContextMenuItems;
        let performAction = this.rfp.performAction;
        let model: FmModel = this.rfp.fmModel;

        // attach context menu
        $(elements[ 1 ]).contextMenu({
            selector: '.file, .directory',
            zIndex: 100,
            // wrap options with "build" allows to get item element
            build: (/*$triggerElement, e*/) => {
                node.selected(true);

                return {
                    appendTo: '.fm-container',
                    items: getContextMenuItems(node.rdo),
                    callback: (itemKey: string, options: any) => {
                        performAction(itemKey, options, node.rdo, model.fetchSelectedObjects(node));
                    }
                }
            }
        });
    }

    actualizeNodeObject(node: TreeNodeObject, oldFolder: string, newFolder: string): void {
        let search: RegExp = new RegExp(`^${oldFolder}`);
        let oldPath: string = node.rdo.id;
        let newPath: string = oldPath.replace(search, newFolder);

        node.id = newPath;
        node.rdo.id = newPath;
        node.rdo.attributes.path = node.rdo.attributes.path.replace(new RegExp(`${oldPath}$`), newPath);

        node.children().forEach((cNode: TreeNodeObject) => {
            this.actualizeNodeObject(cNode, oldFolder, newFolder);
        });
    }
}

export class TreeNodeObject {
    id: string | number;
    rdo: ReadableObject;
    cdo: ComputedDataObject;
    visible: KnockoutObservable<boolean>;
    nodeTitle: KnockoutObservable<string>;
    children: KnockoutObservableArray<TreeNodeObject>;
    parentNode: KnockoutObservable<TreeNodeObject>;
    isSliding: KnockoutObservable<boolean>;
    isLoading: KnockoutObservable<boolean>;
    isLoaded: KnockoutObservable<boolean>;
    isExpanded: KnockoutObservable<boolean>;
    selected: KnockoutObservable<boolean>;
    dragHovered: KnockoutObservable<boolean>;
    level: KnockoutObservable<number>;
    isFirstNode: KnockoutObservable<boolean>;
    isLastNode: KnockoutObservable<boolean>;
    title: KnockoutComputed<string>;
    itemClass: KnockoutComputed<string>;
    iconClass: KnockoutComputed<string>;
    switcherClass: KnockoutComputed<string>;
    clusterClass: KnockoutComputed<string>;

    constructor(private rfp: richFilemanagerPlugin, resourceObject: ReadableObject) {
        let model: FmModel = rfp.fmModel;

        this.id = resourceObject.id;
        this.rdo = resourceObject;
        this.cdo = { // computed data object
            isFolder: (resourceObject.type === 'folder'),
            extension: (resourceObject.type === 'file') ? getExtension(resourceObject.id) : null,
            dimensions: resourceObject.attributes.width ? resourceObject.attributes.width + 'x' + resourceObject.attributes.height : null,
            cssItemClass: (resourceObject.type === 'folder') ? 'directory' : 'file',
            hiddenByType: false,
            hiddenBySearch: false
        };

        this.visible = ko.observable(true);
        this.nodeTitle = ko.observable(resourceObject.attributes.name);
        this.children = ko.observableArray([]);
        this.parentNode = ko.observable(null);
        this.isSliding = ko.observable(false);
        this.isLoading = ko.observable(false);
        this.isLoaded = ko.observable(false);
        this.isExpanded = ko.observable(false);
        this.selected = ko.observable(false);
        this.dragHovered = ko.observable(false);
        // arrangable properties
        this.level = ko.observable(0);
        this.isFirstNode = ko.observable(false);
        this.isLastNode = ko.observable(false);

        this.nodeTitle.subscribe((value: string) => {
            this.rdo.attributes.name = value;
        });

        this.children.subscribe((/*value*/) => {
            model.treeModel.arrangeNode(this);
        });

        this.isLoaded.subscribe((value: boolean) => {
            this.isLoading(!value);
        });

        this.selected.subscribe(value => {
            if(value) {
                if(model.treeModel.selectedNode() !== null)
                    (<TreeNodeObject>model.treeModel.selectedNode()).selected(false);

                model.treeModel.selectedNode(this);
                model.itemsModel.unselectItems();
            } else
                model.treeModel.selectedNode(null);

        });
        this.title = ko.pureComputed(() => {
            return (config.options.showTitleAttr) ? this.rdo.id : null;
        });

        this.itemClass = ko.pureComputed(() => {
            let cssClass = [];

            if(this.selected() && config.manager.selection.enabled)
                cssClass.push('ui-selected');

            if(this.dragHovered())
                cssClass.push(model.ddModel.hoveredCssClass);

            return cssClass.join(' ');
        });

        this.iconClass = ko.pureComputed(() => {
            let cssClass;
            let extraClass = [ 'ico' ];

            if(this.cdo.isFolder === true) {
                cssClass = 'ico_folder';
                if(this.isLoading() === true)
                    extraClass.push('loading');
                else {
                    extraClass.push('folder');
                    if(!this.rdo.attributes.readable)
                        extraClass.push('lock');
                    else if(this.isExpanded() || !this.isExpanded() && this.isSliding())
                        extraClass.push('open');
                }
            } else {
                cssClass = 'ico_file';
                if(this.rdo.attributes.readable)
                    extraClass.push('ext', <string>this.cdo.extension);
                else
                    extraClass.push('file', 'lock');

            }
            return `${cssClass} ${extraClass.join('_')}`;
        });

        this.switcherClass = ko.pureComputed(() => {
            let cssClass = [];

            if(config.filetree.showLine) {
                if(this.level() === 0 && this.isFirstNode() && this.isLastNode())
                    cssClass.push('root');
                else if(this.level() === 0 && this.isFirstNode())
                    cssClass.push('roots');
                else if(this.isLastNode())
                    cssClass.push('bottom');
                else
                    cssClass.push('center');

            } else
                cssClass.push('noline');

            if(this.cdo.isFolder) {
                let isOpen = (this.isExpanded() || !this.isExpanded() && this.isSliding());

                cssClass.push(isOpen ? 'open' : 'close');
            } else
                cssClass.push('docu');

            return cssClass.join('_');
        });

        this.clusterClass = ko.pureComputed(() => (config.filetree.showLine && !this.isLastNode()) ? 'line' : '');
    }


    switchNode(node: TreeNodeObject): any { // todo: check this
        let model: FmModel = this.rfp.fmModel;

        if(!node.cdo.isFolder)
            return false;

        if(!node.rdo.attributes.readable) {
            error(lg('NOT_ALLOWED_SYSTEM'));
            return false;
        }
        if(!node.isLoaded())
            this.openNode(node);
        else
            model.treeModel.toggleNode(node);

    }

    // noinspection JSMethodCanBeStatic
    mouseDown(node: TreeNodeObject/*, e*/): void {
        node.selected(true);
    }

    nodeClick(node: TreeNodeObject/*, e*/): void {
        if(!config.manager.dblClickOpen)
            this.openNode(node);

    }

    nodeDblClick(node: TreeNodeObject/*, e*/): void {
        if(config.manager.dblClickOpen)
            this.openNode(node);

    }

    openNode(node: TreeNodeObject/*, e?*/): void {
        let model: FmModel = this.rfp.fmModel;
        let fmModel = this.rfp.fmModel;
        let getDetailView = this.rfp.getDetailView;

        if(node.rdo.type === 'file')
            getDetailView(node.rdo);

        if(node.rdo.type === 'folder') {
            if(!node.isLoaded() || (node.isExpanded() && config.filetree.reloadOnClick)) {
                model.treeModel.loadNodes(node, true);
                getDetailView(node.rdo);
            } else {
                model.treeModel.toggleNode(node);

                fmModel.currentPath(<string>node.id);
                fmModel.breadcrumbsModel.splitCurrent();

                let dataObjects: ReadableObject[] = [];

                $.each(node.children(), (_i, cnode: TreeNodeObject) => {
                    dataObjects.push(cnode.rdo);
                });
                model.itemsModel.setList(dataObjects);
            }
        }
    }

    remove() {
        (<TreeNodeObject>this.parentNode()).children.remove(this);
    }

    isRoot() {
        let model: FmModel = this.rfp.fmModel;

        return this.level() === model.treeModel.treeData.id;
    }

}
