import { richFilemanagerPlugin } from './filemanager';

export class BreadcrumbsModel {
  items: KnockoutObservableArray<BcItem>;

  constructor(private rfp: richFilemanagerPlugin) {
    this.items = ko.observableArray([]);
  }

  add(path: string, label: string): void {
    this.items.push(new BcItem(this.rfp, path, label));
  }

  splitCurrent(): void {
    let path: string = this.rfp.fileRoot;
    let cPath: string = this.rfp.fmModel.currentPath();
    let chunks: string[] = cPath.replace(new RegExp(`^${this.rfp.fileRoot}`), '').split('/');

    // reset breadcrumbs
    this.items([]);
    // push root node
    this.add(this.rfp.fileRoot, '');

    while(chunks.length > 0) {
      let chunk: string = chunks.shift();

      if(chunk) {
        path += chunk + '/';
        this.add(path, chunk);
      }
    }
  }
}

export class BcItem {
  isRoot: boolean;
  active: boolean;

  // noinspection JSUnusedGlobalSymbols
  constructor(private rfp: richFilemanagerPlugin, public path: string, public label: string) {
    this.isRoot = (path === rfp.fileRoot);
    this.active = (path === rfp.fmModel.currentPath());
  }

  itemClass(): string {
    let cssClass: string[] = [ 'nav-item' ];

    if(this.isRoot)
      cssClass.push('root');

    if(this.active)
      cssClass.push('active');

    return cssClass.join(' ');
  }

  // noinspection SpellCheckingInspection
  goto(item: BcItem): void {
    if(!item.active)
      this.rfp.fmModel.itemsModel.loadList(item.path);
  }
}
