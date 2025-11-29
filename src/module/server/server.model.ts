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