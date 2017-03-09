export class OnmsRequisitionCategory {

    public name: string;

    static importCategories(rawCategories: Object[]) : OnmsRequisitionCategory[] {
        return rawCategories.map(c => OnmsRequisitionCategory.importCategory(c));
    }

    static importCategory(rawCategory: Object) : OnmsRequisitionCategory {
        return Object.assign(new OnmsRequisitionCategory(), rawCategory);
    }

    generateModel() : Object {
        return {
            name: this.name
        };
    }

}