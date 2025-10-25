
const version = 'v1';
const basePath = `/api/${version}`;

const BetweenUsRoutes = {
    HealthCheck: `${basePath}/health`,
    Users: {
        LogIn: {
            LogInOrSignUp: `${basePath}/users/login-or-signup`,
        },
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
