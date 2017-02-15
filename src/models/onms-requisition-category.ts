export class OnmsRequisitionCategory {

    public name: string;

    static importCategories(rawCategories: Object[]) : OnmsRequisitionCategory[] {
        let categories: OnmsRequisitionCategory[] = [];
        rawCategories.forEach(c => categories.push(OnmsRequisitionCategory.importCategory(c)));
        return categories;
    }

    static importCategory(rawCategory: Object) : OnmsRequisitionCategory {
        return Object.assign(new OnmsRequisitionCategory(), rawCategory);;
    }

    generateModel() : Object {
        let rawCategory: Object = {
            name: this.name
        };
        return rawCategory;
    }

}