
const version = 'v1';
const basePath = `/api/${version}`;

const RouterPaths = {
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

export = { RouterPaths, version };
