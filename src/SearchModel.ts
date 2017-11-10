import { richFilemanagerPlugin } from './filemanager';
import { FmModel } from './FmModel';
import { delayCallback } from './Utils';

export class SearchModel {
  // let search_model = this;
  value: KnockoutObservable<string>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.value = ko.observable('');
  }

  // noinspection JSUnusedLocalSymbols
  findAll(_data: any, event: any) { // todo: event type?
    let delay = 200;
    let insensitive = true;
    let model: FmModel = this.rfp.fmModel;

    this.value(event.target.value);

    delayCallback(() => {
      let searchString = insensitive ? this.value().toLowerCase() : this.value();

      $.each(model.itemsModel.objects(), (_i, itemObject) => {
        if(itemObject.rdo.type === 'parent' || itemObject.cdo.hiddenByType)
          return;

        let itemName = itemObject.rdo.attributes.name;

        if(insensitive)
          itemName = itemName.toLowerCase();

        let visibility = (itemName.indexOf(searchString) === 0);

        itemObject.cdo.hiddenBySearch = !visibility;
        itemObject.visible(visibility);
      });
    }, delay);
  }

  reset(/*data?, event?*/) {
    let model: FmModel = this.rfp.fmModel;

    this.value('');
    $.each(model.itemsModel.objects(), (_i, itemObject) => {
      if(itemObject.rdo.type === 'parent')
        return;

      itemObject.cdo.hiddenBySearch = false;
      itemObject.visible(!itemObject.cdo.hiddenByType);
    });
  }
}
