import { NodeItem } from './Types';
import { richFilemanagerPlugin } from './filemanager';
import { lg, success, warning } from './Utils';

export class ClipboardModel {
  cbMode: string = null;
  cbObjects: NodeItem[] = [];
  active: boolean;
  itemsNum: KnockoutObservable<number>;
  enabled: KnockoutObservable<boolean>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.active = rfp.capabilities.indexOf('copy') > -1 || rfp.capabilities.indexOf('move') > -1;
    this.itemsNum = ko.observable(0);
    this.enabled = ko.observable(rfp.fmModel.config().clipboard.enabled && this.active);
  }

  copy(): void {
    if(!this.hasCapability('copy'))
      return;

    this.cbMode = 'copy';
    this.cbObjects = this.rfp.fmModel.fetchSelectedItems();
    this.itemsNum(this.cbObjects.length);
  }

  cut(): void {
    if(!this.hasCapability('cut'))
      return;

    this.cbMode = 'cut';
    this.cbObjects = this.rfp.fmModel.fetchSelectedItems();
    this.itemsNum(this.cbObjects.length);
  }

  paste(): void {
    if(!this.hasCapability('paste') || this.isEmpty())
      return;

    if(this.cbMode === null || this.cbObjects.length === 0) {
      warning(lg('clipboard_empty'));
      return;
    }

    let targetPath = this.rfp.fmModel.currentPath();

    this.rfp.processMultipleActions(this.cbObjects, (_i: number, itemObject: NodeItem): JQuery.jqXHR => {
      if(this.cbMode === 'cut')
        return this.rfp.moveItem(itemObject.rdo, targetPath);

      if(this.cbMode === 'copy')
        return this.rfp.copyItem(itemObject.rdo, targetPath);

      return undefined;

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
    if(!this.enabled)
      return false;

    switch(capability) {
      case 'copy':
        return this.rfp.capabilities.indexOf('copy') > -1;
      case 'cut':
        return this.rfp.capabilities.indexOf('move') > -1;
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
