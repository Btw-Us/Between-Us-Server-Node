const version = 'v1';
const basePath = `/api/${version}`;
const wsBasePath = `/ws/${version}`;

const BetweenUsRoutes = {
    HealthCheck: `${basePath}/health`,
    Users: {
        LogIn: `${basePath}/auth/user/login`,
        User:`${basePath}/user`
    },
};


const BetweenUsRoutesWs = {
    Users: {
        GetAllChats: `${wsBasePath}/user/chats`,
        ChatMessages: `${wsBasePath}/chat/messages`,
    }
}

const ServerApiRoutes = {
    Token:{
        GenerateServerToken:`${basePath}/server/token`,
    }
};

export { BetweenUsRoutes, version, ServerApiRoutes, BetweenUsRoutesWs };