import { NodeItem } from './Types';
import { richFilemanagerPlugin } from './filemanager';
import { getClosestNode, getExtension, startsWith } from './Utils';
import { ItemObject } from './ItemModel';

export class DragAndDropModel {
  restrictedCssClass: string = 'drop-restricted';
  $dragHelperTemplate: JQuery;

  items: NodeItem[] = [];
  hoveredItem: NodeItem = null;
  dragHelper: JQuery = null;
  isScrolling: boolean = false;
  isScrolled: boolean = false;
  hoveredCssClass: string = 'drop-hover';

  constructor(private rfp: richFilemanagerPlugin) {
    this.$dragHelperTemplate = $('#drag-helper-template');
  }

  makeDraggable(item: NodeItem, element: Element): void {
    if(item.rdo.type === 'file' || item.rdo.type === 'folder') {
      $(element).draggable(<any>{
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

          if(this.rfp.fmModel.fetchSelectedItems((<any>item.constructor).name).length > 1)
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
          this.items = this.rfp.fmModel.fetchSelectedItems((<any>item.constructor).name);
        },
        drag: (e: Event) => {
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

  makeDroppable(targetItem: NodeItem, element: Element): void {
    if(targetItem.rdo.type === 'folder' || targetItem.rdo.type === 'parent') {
      $(element).droppable(<any>{
        tolerance: 'pointer',
        enableExtendedEvents: targetItem instanceof ItemObject, // todo: this isn't in jqueryui.d.ts
        accept: ($draggable: JQuery) => {
          let dragItem: NodeItem = ko.dataFor($draggable[ 0 ]);
          let type: string = dragItem ? dragItem.rdo.type : null;

          return (type === 'file' || type === 'folder');
        },
        over: (_event: JQueryUI.DroppableEvent, ui: JQueryUI.DroppableEventUIParam) => {
          // prevent "over" event fire before "out" event
          // http://stackoverflow.com/a/28457286/7095038
          setTimeout(() => {
            this.markHovered(null);
            this.markRestricted(ui.helper, false);

            if(!this.isDropAllowed(targetItem))
              this.markRestricted(ui.helper, true);

            this.markHovered(targetItem);
          }, 0);
        },
        out: (_event: JQueryUI.DroppableEvent, ui: JQueryUI.DroppableEventUIParam) => {
          this.markHovered(null);
          this.markRestricted(ui.helper, false);
        },
        drop: (): any => {
          this.markHovered(null);

          if(!this.isDropAllowed(targetItem))
            return false;

          this.rfp.processMultipleActions(this.items, (_i, itemObject) => this.rfp.moveItem(itemObject.rdo, <string>targetItem.id));
        }
      });
    }
  }

  // check whether draggable items can be accepted by target item
  isDropAllowed(targetItem: NodeItem): boolean {
    // noinspection JSMismatchedCollectionQueryUpdate
    let matches: NodeItem[] = $.grep(this.items, (itemObject: NodeItem): boolean => {
      if(targetItem.rdo.type === 'folder' || targetItem.rdo.type === 'parent') {
        // drop folder inside descending folders (filetree)
        if(startsWith(targetItem.rdo.id, itemObject.rdo.id))
          return true;

        // drop items inside the same folder (filetree)
        if(targetItem.rdo.id === getClosestNode(itemObject.rdo.id))
          return true;

      }
      // drop item to itself
      return (itemObject.id === targetItem.id);
    });

    // prevent on moving (to) protect folder or to the one of selected items
    return (targetItem.rdo.attributes.writable && matches.length === 0);
  }

  // mark item as hovered if it accepts draggable item
  markHovered(item: NodeItem): void {
    if(this.hoveredItem !== null)
      this.hoveredItem.dragHovered(false);

    this.hoveredItem = item;
    if(item)
      item.dragHovered(true);

  }

  // mark helper as restricted if target item doesn't accept draggable item
  markRestricted($helper: JQuery, flag: boolean): void {
    $helper.toggleClass(this.restrictedCssClass, flag);
  }
}
