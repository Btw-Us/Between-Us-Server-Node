import { ServerService } from './server.service.js';
import { createErrorMessage } from '../../utils/response.js';

const serverService = new ServerService();


const createServerTokenHandler = async (req: any, res: any) => {
    try {
        const { generatedFrom, expiresAt } = req.body;
        if (!generatedFrom) {
            return res.status(400).json(createErrorMessage(
                'Bad Request',
                400,
                'Missing required field: generatedFrom'
            ));
        }
        const record = await serverService.createServerToken(generatedFrom, expiresAt);
        return res.status(201).json(record);
    } catch (error) {
        return res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `Failed to create server token: ${(error as Error).message || error}`
        ));
    }
};

export { createServerTokenHandler }; 

