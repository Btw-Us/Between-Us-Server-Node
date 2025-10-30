const {UserSearchService} = require('./user.search.service');
const {createErrorMessage} = require('../../../utils/errorResponse');

const checkUserNameExists = async (req: any, res: any) => {
    try {
        const { userName } = req.params;
        if (!userName) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'The userName parameter is required.'
                )
            );
            return;
        }
        const userSearchService = new UserSearchService();
        const exists = await userSearchService.checkUserNameExists(userName);
        if(!exists){
            res.status(409).json(
                createErrorMessage(
                    'Conflict',
                    409,
                    `The userName '${userName}' does not exist.`
                )
            );
            return;
        }
        res.status(200).json({ exists });
    }
    catch (error) {
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred while checking if the userName exists: ${error}`
            )
        );
    }
}

export = { checkUserNameExists };