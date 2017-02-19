import { Pipe, PipeTransform } from '@angular/core';

import { OnmsRequisition } from '../models/onms-requisition';

@Pipe({name: 'reqFilter'})
export class RequisitionFilterPipe implements PipeTransform {

  transform(requisitions: OnmsRequisition[], keyword: string): OnmsRequisition[] {
    if (keyword == undefined || keyword == '') return requisitions;
    return requisitions.filter(r =>
      r.foreignSource.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    );
  }

}