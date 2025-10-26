
const version = 'v1';
const basePath = `/api/${version}`;

const BetweenUsRoutes = {
    HealthCheck: `${basePath}/health`,
    Users: {
        LogIn: `${basePath}/auth/user/login`,
        UserDetails:{
            GetUserDetails: `${basePath}/user/details`,
        }
    },
};

const ServerApiRoutes = {
    Token:{
        ServerToken:`${basePath}/server/tokken`,
    }
};

export = { BetweenUsRoutes, version, ServerApiRoutes };
