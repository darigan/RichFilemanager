import { NodeItem } from './Types';
import { richFilemanagerPlugin } from './filemanager';
import { FmModel } from './FmModel';
import { lg, success, warning } from './Utils';

export class ClipboardModel {
  // let clipboard_model = this;
  cbMode: string;
  cbObjects: NodeItem[];
  active: boolean;
  itemsNum: KnockoutObservable<number>;
  enabled: KnockoutObservable<boolean>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.cbMode = null;
    this.cbObjects = [];
    let active = this.active = rfp.capabilities.indexOf('copy') > -1 || rfp.capabilities.indexOf('move') > -1;
    let model: FmModel = rfp.fmModel;

    this.itemsNum = ko.observable(0);
    this.enabled = ko.observable(model.config().clipboard.enabled && active);
  }

  copy() {
    let model = this.rfp.fmModel;

    if(!this.hasCapability('copy'))
      return;

    this.cbMode = 'copy';
    this.cbObjects = model.fetchSelectedItems();
    this.itemsNum(this.cbObjects.length);
  }

  cut() {
    let model = this.rfp.fmModel;

    if(!this.hasCapability('cut'))
      return;

    this.cbMode = 'cut';
    this.cbObjects = model.fetchSelectedItems();
    this.itemsNum(this.cbObjects.length);
  }

  paste() {
    let model = this.rfp.fmModel;
    let processMultipleActions = this.rfp.processMultipleActions;
    let moveItem = this.rfp.moveItem;
    let copyItem = this.rfp.copyItem;

    if(!this.hasCapability('paste') || this.isEmpty())
      return;

    if(this.cbMode === null || this.cbObjects.length === 0) {
      warning(lg('clipboard_empty'));
      return;
    }

    let targetPath = model.currentPath();

    processMultipleActions(this.cbObjects, (_i, itemObject: NodeItem): any => {
      if(this.cbMode === 'cut')
        return moveItem(itemObject, targetPath);

      if(this.cbMode === 'copy')
        return copyItem(itemObject, targetPath);

    }, this.clearClipboard.bind(this)); // todo:
  }

  clear(): void {
    if(!this.hasCapability('clear') || this.isEmpty())
      return;

    this.clearClipboard();
    success(lg('clipboard_cleared'));
  }

  isEmpty(): boolean {
    return this.cbObjects.length === 0;
  }

  hasCapability(capability: string): boolean {
    let rfp = this.rfp;

    if(!this.enabled)
      return false;

    switch(capability) {
      case 'copy':
        return rfp.capabilities.indexOf('copy') > -1;
      case 'cut':
        return rfp.capabilities.indexOf('move') > -1;
      default:
        return true;
    }
  }

  clearClipboard(): void {
    this.cbObjects = [];
    this.cbMode = null;
    this.itemsNum(0);
  }
}
