/**
 * Creates a standardized error message object.
 * @param message
 * @param code
 * @param details
 * @returns An object containing the error code, message, and details.
 */
function createErrorMessage(
    message: string,
    code: number,
    details: String
) : {
    errorCode : number,
    errorMessage : string,
    details : String} {
    return {
        errorCode : code,
        errorMessage : message,
        details : details
    }
}

export =  createErrorMessage ;