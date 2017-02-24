export class OnmsServer {

    public type: string;
    public version: string;

    constructor(
        public name: string,
        public url: string,
        public username: string,
        public password: string,
        public isDefault: boolean = false
    ) {}

}