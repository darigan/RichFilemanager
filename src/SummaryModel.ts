import {richFilemanagerPlugin} from "./filemanager";

export class SummaryModel {
    public files: KnockoutObservable<any>;
    public folders: KnockoutObservable<any>;
    public size: KnockoutObservable<any>;
    public enabled: KnockoutObservable<boolean>;

    constructor(private rfp: richFilemanagerPlugin) {
        this.files = ko.observable(null);
        this.folders = ko.observable(null);
        this.size = ko.observable(null);
        this.enabled = ko.observable(false);
    }

    doSummarize(): void {
        this.rfp.summarizeItems();
    }
}
