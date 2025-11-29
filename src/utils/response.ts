export const createErrorMessage = (title: string, status: number, message: string) => {
    return {
        title,
        status,
        message
    };
};
