import { OnmsSlmCategory } from './onms-slm-category';

export class OnmsSlmSection {

    constructor(
        public name: string,
        public categories: OnmsSlmCategory[] = []
    ) {}

    static import(rawSections: Object[]): OnmsSlmSection[] {
        let sections: OnmsSlmSection[] = [];
        rawSections.forEach(s => {
            let section = new OnmsSlmSection(s['name']);
            s['categories']['category'].forEach(c => section.categories.push(OnmsSlmCategory.import(c)));
            sections.push(section);
        });
        return sections;
    }

}