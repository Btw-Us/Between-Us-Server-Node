export enum GeneratedFrom {
    SERVER = "SERVER",
    CLIENT = "CLIENT",
    ADMIN_PANEL = "ADMIN_PANEL"
}

export interface ServerToken {
    id?: string;
    generated_from: GeneratedFrom;
    token: string;
    created_at?: string;
    created_by_user_id?: string | undefined;
    expires_at?: string | undefined;
}
