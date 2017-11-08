import {config, richFilemanagerPlugin} from "./filemanager";
import {
    error, getDirname, getParentDirname, handleAjaxError, handleAjaxResponseErrors, lg, log,
    success
} from "./Utils";
import {FmModel} from "./FmModel";
import {PreviewModel} from "./PreviewModel";
import {getLang} from "./LangModel";

export class HeaderModel {
    closeButton: KnockoutObservable<boolean>;
    langSwitcher: boolean;

    constructor(private rfp: richFilemanagerPlugin) {
        this.closeButton = ko.observable(false);
        this.langSwitcher = Array.isArray(config.language.available) && config.language.available.length > 0;
    }

    closeButtonOnClick(): void {
        log('CLOSE button is clicked');
    }

    navHome(): void {
        let model: FmModel = this.rfp.fmModel;
        let fileRoot: string = this.rfp.fileRoot;

        model.previewFile(false);
        model.itemsModel.loadList(fileRoot);
    }

    navLevelUp(): void {
        let model: FmModel = this.rfp.fmModel;

        let parentFolder: string = model.previewFile()
            ? getDirname((<KnockoutObservable<PreviewModel>>model.previewModel).rdo().id)
            : getParentDirname(model.currentPath());

        if (model.previewFile())
            model.previewFile(false);

        if (parentFolder !== model.currentPath())
            model.itemsModel.loadList(parentFolder);

    }

    navRefresh(): void {
        let model: FmModel = this.rfp.fmModel;

        if (model.previewFile()) {
            model.previewFile(false);
            model.previewFile(true);
        } else
            model.itemsModel.loadList(model.currentPath());
    }

    displayGrid(): void {
        let model: FmModel = this.rfp.fmModel;

        model.viewMode('grid');
        model.previewFile(false);

        if (model.itemsModel.lazyLoad)
            model.itemsModel.lazyLoad.update();
    }

    displayList(): void {
        let model: FmModel = this.rfp.fmModel;

        model.viewMode('list');
        model.previewFile(false);
    }

    switchLang(e: Event) {
        let langNew = (<any>e.target).value; // todo: check this
        let langCurrent: string = getLang();
        let _url_ = this.rfp._url_;

        if (langNew && langNew.toLowerCase() !== langCurrent.toLowerCase()) {
            let newUrl;
            let url = window.location.toString();
            let regExp = new RegExp(`(langCode=)${langCurrent}`);

            if (regExp.test(url))
                newUrl = url.replace(regExp, '$1' + langNew);
            else
                newUrl = url + ($.isEmptyObject(_url_.param()) ? '?' : '#') + 'langCode=' + langNew;

            window.location.href = newUrl;
        }
    }

    createFolder() {
        let rfp = this.rfp;
        let fmModel = this.rfp.fmModel;
        let buildAjaxRequest = this.rfp.buildAjaxRequest;

        let makeFolder = function (_e: Event, ui: AleritfyDialogUI) {
            let folderName = ui.getInputValue();

            if (!folderName) {
                error(lg('no_foldername'));
                return;
            }

            buildAjaxRequest('GET', {
                mode: 'addfolder',
                path: fmModel.currentPath(),
                name: folderName
            }).done(response => {
                if (response.data) {
                    fmModel.addItem(response.data, fmModel.currentPath());

                    ui.closeDialog();
                    if (config.options.showConfirmation)
                        success(lg('successful_added_folder'));

                }
                handleAjaxResponseErrors(response);
            }).fail(handleAjaxError.bind(rfp));
        };

        prompt(<any>{
            message: lg('prompt_foldername'),
            value: lg('default_foldername'),
            okBtn: <AlertifyBtn>{
                label: lg('create_folder'),
                autoClose: false,
                click: makeFolder
            },
            cancelBtn: <AlertifyBtn>{
                label: lg('cancel')
            }
        });
    }
}

export class SortableHeader {
    column: KnockoutObservable<string>;
    order: KnockoutObservable<string>;
    sortClass: KnockoutComputed<string>;

    constructor(private rfp: richFilemanagerPlugin, name: string) {
        let model: FmModel = rfp.fmModel;

        this.column = ko.observable(name);
        this.order = ko.observable(model.itemsModel.listSortOrder());

        this.sortClass = ko.pureComputed((): string => {
            let cssClass;

            if (model.itemsModel.listSortField() === this.column()) {
                cssClass = `sorted sorted-${this.order()}`;
            }
            return <string>cssClass;
        });
    }

    sort(): void {
        let model: FmModel = this.rfp.fmModel;

        let isAscending: boolean = this.order() === 'asc';
        let isSameColumn: boolean = model.itemsModel.listSortField() === this.column();

        this.order(isSameColumn ? (isAscending ? 'desc' : 'asc') : model.itemsModel.listSortOrder());
        model.itemsModel.listSortField(this.column());
        model.itemsModel.listSortOrder(this.order());
        model.itemsModel.sortObjects();
    }
}

