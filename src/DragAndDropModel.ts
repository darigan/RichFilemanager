import {NodeItem} from "./Types";
import {richFilemanagerPlugin} from "./filemanager";
import {getClosestNode, getExtension, startsWith} from "./Utils";
import {ItemObject} from "./ItemModel";

export class DragAndDropModel {
    restrictedCssClass: string;
    $dragHelperTemplate: JQuery;

    items: NodeItem[];
    hoveredItem: NodeItem;
    dragHelper: JQuery;
    isScrolling: boolean;
    isScrolled: boolean;
    hoveredCssClass: string;

    constructor(private rfp: richFilemanagerPlugin) {
        this.restrictedCssClass = 'drop-restricted';
        this.$dragHelperTemplate = $('#drag-helper-template');
        this.items = [];
        this.hoveredItem = null;
        this.dragHelper = null;
        this.isScrolling = false;
        this.isScrolled = false;
        this.hoveredCssClass = 'drop-hover';
    }

    makeDraggable(item: NodeItem, element: Element) {
        let fetchSelectedItems = this.rfp.fmModel.fetchSelectedItems;

        if (item.rdo.type === 'file' || item.rdo.type === 'folder') {
            $(element).draggable({
                distance: 3,
                cursor: 'pointer',
                cursorAt: {
                    left: Math.floor(this.$dragHelperTemplate.width() / 2),
                    bottom: 15
                },
                scroll: false,
                appendTo: this.rfp.$wrapper,
                containment: this.rfp.$container,
                refreshPositions: false,
                helper: (): JQuery => {
                    let $cloned: JQuery;
                    let iconClass: string;

                    if (fetchSelectedItems((<any>item.constructor).name).length > 1)
                        iconClass = 'ico_multiple';
                    else
                        iconClass = (item.rdo.type === 'folder')
                            ? 'ico_folder'
                            : 'ico_file ico_ext_' + getExtension(item.rdo.id);

                    $cloned = this.$dragHelperTemplate.children('.drag-helper').clone();
                    $cloned.find('.clip').addClass(iconClass);

                    this.dragHelper = $cloned;
                    return $cloned;
                },
                start: () => {
                    this.items = fetchSelectedItems((<any>item.constructor).name);
                },
                drag: (e: JQueryEventObject) => {
                    $(e.target).draggable('option', 'refreshPositions', this.isScrolling || this.isScrolled);
                    this.isScrolled = false;
                },
                stop: () => {
                    this.items = [];
                    this.dragHelper = null;
                }
            });
        }
    }

    makeDroppable(targetItem: NodeItem, element: Element) {
        let rfp = this.rfp;

        if (targetItem.rdo.type === 'folder' || targetItem.rdo.type === 'parent') {
            $(element).droppable(<any>{
                tolerance: 'pointer',
                enableExtendedEvents: targetItem instanceof ItemObject, // todo: this isn't in jqueryui.d.ts
                accept: ($draggable: JQuery) => {
                    let dragItem = ko.dataFor($draggable[0]);
                    let type = dragItem ? dragItem.rdo.type : null;

                    return (type === 'file' || type === 'folder');
                },
                over: (_event: JQueryEventObject, ui: JQueryUI.DroppableEventUIParam) => {
                    // prevent "over" event fire before "out" event
                    // http://stackoverflow.com/a/28457286/7095038
                    setTimeout(() => {
                        this.markHovered(null);
                        this.markRestricted(ui.helper, false);

                        if (!this.isDropAllowed(targetItem))
                            this.markRestricted(ui.helper, true);

                        this.markHovered(targetItem);
                    }, 0);
                },
                out: (_event: JQueryEventObject, ui: JQueryUI.DroppableEventUIParam) => {
                    this.markHovered(null);
                    this.markRestricted(ui.helper, false);
                },
                drop: (/*event, ui*/): any => {
                    this.markHovered(null);

                    if (!this.isDropAllowed(targetItem))
                        return false;

                    rfp.processMultipleActions(this.items, (_i, itemObject) => rfp.moveItem(itemObject.rdo, <string>targetItem.id));
                }
            });
        }
    }

    // check whether draggable items can be accepted by target item
    isDropAllowed(targetItem: NodeItem) {
        let matches = $.grep(this.items, (itemObject/*, i*/) => {
            if (targetItem.rdo.type === 'folder' || targetItem.rdo.type === 'parent') {
                // drop folder inside descending folders (filetree)
                if (startsWith(targetItem.rdo.id, itemObject.rdo.id))
                    return true;

                // drop items inside the same folder (filetree)
                if (targetItem.rdo.id === getClosestNode(itemObject.rdo.id))
                    return true;

            }
            // drop item to itself
            return (itemObject.id === targetItem.id);
        });

        // prevent on moving (to) protect folder or to the one of selected items
        return (targetItem.rdo.attributes.writable && matches.length === 0);
    }

    // mark item as hovered if it accepts draggable item
    markHovered(item: NodeItem) {
        if (this.hoveredItem !== null)
            this.hoveredItem.dragHovered(false);

        this.hoveredItem = item;
        if (item)
            item.dragHovered(true);

    }

    // mark helper as restricted if target item doesn't accept draggable item
    markRestricted($helper: JQuery, flag: boolean) {
        let drag_model = this;

        if (flag)
            $helper.addClass(drag_model.restrictedCssClass);
        else
            $helper.removeClass(drag_model.restrictedCssClass);

    }
}
