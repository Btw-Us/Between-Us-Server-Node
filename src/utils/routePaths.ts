
const version = 'v1';
const basePath = `/api/${version}`;

const BetweenUsRoutes = {
    HealthCheck: `${basePath}/health`,
    Users: {
        LogIn: `${basePath}/auth/users/login`,
        UserDetails:{
            GetUserDetails: `${basePath}/users/details`,
        }
    },
};

const ServerApiRoutes = {
    Token:{
        ServerToken:`${basePath}/server/tokken`,
    }
};

export = { BetweenUsRoutes, version, ServerApiRoutes };
