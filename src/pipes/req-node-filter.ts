import { Pipe, PipeTransform } from '@angular/core';

import { OnmsRequisitionNode } from '../models/onms-requisition-node';

@Pipe({name: 'reqNodeFilter'})
export class RequisitionNodeFilterPipe implements PipeTransform {

  transform(requisitions: OnmsRequisitionNode[], keyword: string): OnmsRequisitionNode[] {
    if (keyword == undefined || keyword == '') return requisitions;
    return requisitions.filter(r =>
      r.nodeLabel.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    );
  }

}