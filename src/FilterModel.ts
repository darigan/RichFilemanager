import { richFilemanagerPlugin } from './filemanager';
import { NodeItem } from './Types';
import { getExtension } from './Utils';
import { TreeNodeObject } from './TreeModel';
import { config } from './Config';
import { ItemObject } from './ItemModel';

export class FilterModel {
  public name: KnockoutObservable<string>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.name = ko.observable(null);
  }

  setName(filterName: string): void {
    if(filterName && config.filter && Array.isArray(config.filter[ filterName ])) {
      this.name(filterName);
    }
  }

  // return extensions which are match a filter name
  getExtensions(): string[] {
    if(this.name())
      return config.filter[ this.name() ];

    return null;
  }

  // check whether file item should be filtered out of the output based on it's extension
  filterItem(itemObject: NodeItem): void {
    if(itemObject.rdo.type === 'parent')
      return;

    let extensions: string[] = this.getExtensions();
    let visibility: boolean = !itemObject.cdo.hiddenBySearch;

    if(itemObject.rdo.type === 'file' && Array.isArray(extensions)) {
      let ext: string = getExtension(<string>itemObject.id);
      let matchByType: boolean = extensions.indexOf(ext) !== -1;

      visibility = visibility && matchByType;
      itemObject.cdo.hiddenByType = !matchByType;
    }
    itemObject.visible(visibility);
  }

  filter(filterName: string): void {
    this.rfp.fmModel.searchModel.reset();
    this.setName(<string>filterName); // todo: could be null

    $.each(this.rfp.fmModel.itemsModel.objects(), (_i: number, itemObject: ItemObject): void => {
      this.filterItem(itemObject);
    });

    this.rfp.fmModel.treeModel.mapNodes((node: TreeNodeObject): void => {
      this.filterItem(node);
    });

    if(this.rfp.fmModel.itemsModel.lazyLoad)
      this.rfp.fmModel.itemsModel.lazyLoad.update();

  }

  reset(): void {
    this.name(null);
    this.filter(null);
  }
}
