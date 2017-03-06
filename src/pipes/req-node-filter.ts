import { Pipe, PipeTransform } from '@angular/core';

import { OnmsRequisitionNode } from '../models/onms-requisition-node';

@Pipe({name: 'reqNodeFilter'})
export class RequisitionNodeFilterPipe implements PipeTransform {

  transform(nodes: OnmsRequisitionNode[], keyword: string): OnmsRequisitionNode[] {
    if (keyword == undefined || keyword == '') return nodes;
    return nodes.filter(n => n.contains(keyword));
  }

}