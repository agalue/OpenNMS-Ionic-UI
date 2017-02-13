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

    equalTo(other: OnmsServer) : boolean {
        return this.name == other.name
            && this.url == other.url
            && this.username == other.username
            && this.password == other.password;
    }
}