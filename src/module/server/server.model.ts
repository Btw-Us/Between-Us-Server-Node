export enum GeneratedFrom {
    SERVER = "SERVER",
    CLIENT = "CLIENT",
    ADMIN_PANEL = "ADMIN_PANEL"
}

export interface ServerToken {
    generated_from: GeneratedFrom;
    token: string;
    expires_at?: string | undefined;
}


export enum ClientType {
    WEB = "WEB",
    MOBILE = "MOBILE",
    DESKTOP = "DESKTOP",
    API = "API"
}
export const ServerTokenCollectionSchema = [
    { name:'generated_from' , type:'select', required:true, options:{ values: [ 'SERVER', 'CLIENT', 'ADMIN_PANEL' ] } },
    { name:'token' , type:'text', required:true, unique:true },
    { name:'expires_at' , type:'date', required:false }
]