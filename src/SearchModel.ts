import { richFilemanagerPlugin } from './filemanager';
import { delayCallback } from './Utils';
import { ItemObject } from './ItemModel';

export class SearchModel {
  // let search_model = this;
  value: KnockoutObservable<string>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.value = ko.observable('');
  }

  // noinspection JSUnusedLocalSymbols
  findAll(_data: any, event: any): void { // todo: event type?
    let delay: number = 200;
    let insensitive: boolean = true;

    this.value(event.target.value);

    delayCallback((): void => {
      let searchString: string = insensitive ? this.value().toLowerCase() : this.value();

      $.each(this.rfp.fmModel.itemsModel.objects(), (_i: number, itemObject: ItemObject): void => {
        if(itemObject.rdo.type === 'parent' || itemObject.cdo.hiddenByType)
          return;

        let itemName: string = itemObject.rdo.attributes.name;

        if(insensitive)
          itemName = itemName.toLowerCase();

        let visibility: boolean = (itemName.indexOf(searchString) === 0);

        itemObject.cdo.hiddenBySearch = !visibility;
        itemObject.visible(visibility);
      });
    }, delay);
  }

  reset(): void {
    this.value('');
    $.each(this.rfp.fmModel.itemsModel.objects(), (_i: number, itemObject: ItemObject): void => {
      if(itemObject.rdo.type === 'parent')
        return;

      itemObject.cdo.hiddenBySearch = false;
      itemObject.visible(!itemObject.cdo.hiddenByType);
    });
  }
}
