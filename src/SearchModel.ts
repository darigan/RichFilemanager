import {richFilemanagerPlugin} from "./filemanager";
import {FmModel} from "./FmModel";

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
        let search_model = this;
        let model: FmModel = this.rfp.fmModel;
        let rfp = this.rfp;

        search_model.value(event.target.value);

        rfp.delayCallback(() => {
            let searchString = insensitive ? search_model.value().toLowerCase() : search_model.value();

            $.each(model.itemsModel.objects(), (_i, itemObject) => {
                if (itemObject.rdo.type === 'parent' || itemObject.cdo.hiddenByType)
                    return;

                let itemName = itemObject.rdo.attributes.name;

                if (insensitive)
                    itemName = itemName.toLowerCase();

                let visibility = (itemName.indexOf(searchString) === 0);

                itemObject.cdo.hiddenBySearch = !visibility;
                itemObject.visible(visibility);
            });
        }, delay);
    }

    reset(/*data?, event?*/) {
        let search_model = this;
        let model: FmModel = this.rfp.fmModel;

        search_model.value('');
        $.each(model.itemsModel.objects(), (_i, itemObject) => {
            if (itemObject.rdo.type === 'parent')
                return;

            itemObject.cdo.hiddenBySearch = false;
            itemObject.visible(!itemObject.cdo.hiddenByType);
        });
    }
}
