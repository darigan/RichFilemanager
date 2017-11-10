import { richFilemanagerPlugin } from './filemanager';
import { NodeItem } from './Types';
import { getExtension } from './Utils';
import { FmModel } from './FmModel';
import { TreeNodeObject } from './TreeModel';
import { config } from './Config';

export class FilterModel {
  public name: KnockoutObservable<string | null>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.name = ko.observable(null);
  }

  setName(filterName: string) {
    if(filterName && config.filter && Array.isArray(config.filter[ filterName ])) {
      this.name(filterName);
    }
  }

  // return extensions which are match a filter name
  getExtensions(): string[] {
    if(this.name())
      return config.filter[ <string>this.name() ];

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

  filter(filterName: string) {
    let model: FmModel = this.rfp.fmModel;

    model.searchModel.reset();
    this.setName(<string>filterName); // todo: could be null

    $.each(model.itemsModel.objects(), (_i, itemObject) => {
      this.filterItem(itemObject);
    });

    model.treeModel.mapNodes((node: TreeNodeObject) => {
      this.filterItem(node);
    });

    if(model.itemsModel.lazyLoad)
      model.itemsModel.lazyLoad.update();

  }

  reset() {
    this.name(null);
    this.filter(null);
  }
}
