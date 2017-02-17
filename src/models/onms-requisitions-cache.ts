import { OnmsRequisition } from './onms-requisition';
import { OnmsRequisitionNode } from './onms-requisition-node';

export class OnmsRequisitionsCache {

  requisitions: OnmsRequisition[];

  getCachedRequisitions() : OnmsRequisition[] {
    return this.requisitions;
  }

  setCachedRequisitions(requisitions: OnmsRequisition[]) {
    this.requisitions = requisitions;
  }

  setCachedRequisition(requisition: OnmsRequisition) {
    const pos = this.requisitions.findIndex(r => r.foreignSource == requisition.foreignSource);
    if (pos == -1) {
        this.requisitions.push(requisition);
    } else {
        this.requisitions[pos] = requisition;
    }
  }

  getCachedRequisition(foreignSource: string) : OnmsRequisition {
    return this.requisitions.find(r => r.foreignSource == foreignSource);
  }

  getCachedNode(foreignSource: string, foreignId: string) : OnmsRequisitionNode {
    const requisition = this.getCachedRequisition(foreignSource);
    if (requisition) {
      return requisition.getNode(foreignId);
    }
  }

}