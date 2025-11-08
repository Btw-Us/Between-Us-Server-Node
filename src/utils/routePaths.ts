
const version = 'v1';
const basePath = `/api/${version}`;

const BetweenUsRoutes = {
    HealthCheck: `${basePath}/health`,
    Users: {
        LogIn: `${basePath}/auth/user/login`,
        User:`${basePath}/user`,
    },
};

const ServerApiRoutes = {
    Token:{
        ServerToken:`${basePath}/server/token`,
    }
};

export = { BetweenUsRoutes, version, ServerApiRoutes };
