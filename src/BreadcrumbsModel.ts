import {richFilemanagerPlugin} from "./filemanager";
import {FmModel} from "./FmModel";

export class BreadcrumbsModel {
    // let bc_model = this;
    items: KnockoutObservableArray<BcItem>;

    constructor(private rfp: richFilemanagerPlugin) {
        this.items = ko.observableArray([]);
    }

    add(path: string, label: string): void {
        let bc_model = this;
        // noinspection UnnecessaryLocalVariableJS
        let rfp = this.rfp;

        bc_model.items.push(<BcItem>new BcItem(rfp, path, label));
    }

    splitCurrent(): void {
        let model: FmModel = this.rfp.fmModel;
        let rfp = this.rfp;

        let path: string = rfp.fileRoot;
        let cPath: string = model.currentPath();
        let chunks: string[] = cPath.replace(new RegExp(`^${rfp.fileRoot}`), '').split('/');

        // reset breadcrumbs
        this.items([]);
        // push root node
        this.add(rfp.fileRoot, '');

        while (chunks.length > 0) {
            let chunk = chunks.shift();

            if (chunk) {
                path += chunk + '/';
                this.add(path, chunk);
            }
        }
    }
}

export class BcItem {
    // let bc_item = this;
    isRoot: boolean;
    active: boolean;

    constructor(private rfp: richFilemanagerPlugin, public path: string, public label: string) {
        this.isRoot = (path === rfp.fileRoot);
        this.active = (path === rfp.fmModel.currentPath());
    }

    itemClass(): string {
        let cssClass: string[] = ['nav-item'];

        if (this.isRoot)
            cssClass.push('root');

        if (this.active)
            cssClass.push('active');

        return cssClass.join(' ');
    }

    goto(item: BcItem/*, e*/): void {
        let model: FmModel = this.rfp.fmModel;

        if (!item.active)
            model.itemsModel.loadList(item.path);
    }
}
