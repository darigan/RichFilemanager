import { richFilemanagerPlugin } from './filemanager';
import {
  buildAjaxRequest, error, getDirname, getParentDirname, handleAjaxError, handleAjaxResponseErrors, lg, log, success
} from './Utils';
import { getLang } from './LangModel';
import { _url_, config } from './Config';

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
    this.rfp.fmModel.previewFile(false);
    this.rfp.fmModel.itemsModel.loadList(this.rfp.fileRoot);
  }

  navLevelUp(): void {
    let parentFolder: string = this.rfp.fmModel.previewFile()
      ? getDirname(this.rfp.fmModel.previewModel.rdo().id)
      : getParentDirname(this.rfp.fmModel.currentPath());

    if(this.rfp.fmModel.previewFile())
      this.rfp.fmModel.previewFile(false);

    if(parentFolder !== this.rfp.fmModel.currentPath())
      this.rfp.fmModel.itemsModel.loadList(parentFolder);

  }

  navRefresh(): void {
    if(this.rfp.fmModel.previewFile()) {
      this.rfp.fmModel.previewFile(false);  // todo: is this intentional?
      this.rfp.fmModel.previewFile(true);
    } else
      this.rfp.fmModel.itemsModel.loadList(this.rfp.fmModel.currentPath());
  }

  displayGrid(): void {
    this.rfp.fmModel.viewMode('grid');
    this.rfp.fmModel.previewFile(false);

    if(this.rfp.fmModel.itemsModel.lazyLoad)
      this.rfp.fmModel.itemsModel.lazyLoad.update();
  }

  displayList(): void {
    this.rfp.fmModel.viewMode('list');
    this.rfp.fmModel.previewFile(false);
  }

  switchLang(e: any) {
    let langNew: string = e.target.value; // todo: check this
    let langCurrent: string = getLang();

    if(langNew && langNew.toLowerCase() !== langCurrent.toLowerCase()) {
      let newUrl: string;
      let url: string = window.location.toString();
      let regExp: RegExp = new RegExp(`(langCode=)${langCurrent}`);

      if(regExp.test(url))
        newUrl = url.replace(regExp, `$1${langNew}`);
      else
        newUrl = `${url}${$.isEmptyObject(_url_.param()) ? '?' : '#'}langCode=${langNew}`;

      window.location.href = newUrl;
    }
  }

  createFolder() {
    prompt(<any>{
      message: lg('prompt_foldername'),
      value: lg('default_foldername'),
      okBtn: <AlertifyBtn>{
        label: lg('create_folder'),
        autoClose: false,
        click: (_e: Event, ui: AleritfyDialogUI) => {
          let folderName: string = ui.getInputValue();

          if(!folderName) {
            error(lg('no_foldername'));
            return;
          }

          buildAjaxRequest('GET', {
            mode: 'addfolder',
            path: this.rfp.fmModel.currentPath(),
            name: folderName
          }).done(response => {
            if(response.data) {
              this.rfp.fmModel.addItem(response.data, this.rfp.fmModel.currentPath());

              ui.closeDialog();
              if(config.options.showConfirmation)
                success(lg('successful_added_folder'));

            }
            handleAjaxResponseErrors(response);
          }).fail(handleAjaxError);
        }
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
    this.column = ko.observable(name);
    this.order = ko.observable(rfp.fmModel.itemsModel.listSortOrder());

    this.sortClass = ko.pureComputed((): string => {
      let cssClass: string;

      if(rfp.fmModel.itemsModel.listSortField() === this.column())
        cssClass = `sorted sorted-${this.order()}`;

      return cssClass;
    });
  }

  sort(): void {
    let isAscending: boolean = this.order() === 'asc';
    let isSameColumn: boolean = this.rfp.fmModel.itemsModel.listSortField() === this.column();

    this.order(isSameColumn ? (isAscending ? 'desc' : 'asc') : this.rfp.fmModel.itemsModel.listSortOrder());
    this.rfp.fmModel.itemsModel.listSortField(this.column());
    this.rfp.fmModel.itemsModel.listSortOrder(this.order());
    this.rfp.fmModel.itemsModel.sortObjects();
  }
}

