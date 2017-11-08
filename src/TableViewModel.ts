import { SortableHeader } from './HeaderModel';
import { richFilemanagerPlugin } from './filemanager';

export class TableViewModel {
  thName: SortableHeader;
  thType: SortableHeader;
  thSize: SortableHeader;
  thDimensions: SortableHeader;
  thModified: SortableHeader;

  constructor(rfp: richFilemanagerPlugin) {
    this.thName = new SortableHeader(rfp, 'name');
    this.thType = new SortableHeader(rfp, 'type');
    this.thSize = new SortableHeader(rfp, 'size');
    this.thDimensions = new SortableHeader(rfp, 'dimensions');
    this.thModified = new SortableHeader(rfp, 'modified');
  }
}
