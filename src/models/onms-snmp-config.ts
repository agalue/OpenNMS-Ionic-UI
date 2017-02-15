export class OnmsSnmpConfig {

    public port: number;
    public version: string;
    public timeout: number;
    public location: string;
    public retries: number;
    public securityLevel: number;
    public securityName: string;
    public authProtocol: string;
    public authPassPhrase: string;
    public privProtocol: string;
    public privPassPhrase: string;
    public community: string;
    public readCommunity: string;
    public writeCommunity: string;
    public engineId: string;
    public contextEngineId: string;
    public contextName: string;
    public enterpriseId: string;
    public maxRequestSize: number;
    public maxRepetitions: number;
    public maxVarsPerPdu: number;
    public proxyHost: string;

    static importConfig(rawConfig: Object) : OnmsSnmpConfig {
        return Object.assign(new OnmsSnmpConfig(), rawConfig);
    }

}