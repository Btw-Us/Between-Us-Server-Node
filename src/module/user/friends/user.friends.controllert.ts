import { UserFriendsService, FriendRequestAlreadyExistsError } from "../../../module/user/friends/user.friends.service.js";

const userFriendsService = new UserFriendsService();


export async function sendFriendRequest(req: any, res: any) {
    const { fromUserId, toUserId } = req.body;
    console.log('Received sendFriendRequest request:', { fromUserId, toUserId });
    if (!fromUserId || !toUserId) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required body parameters: fromUserId and toUserId'
        });
    }
    try {
        const friendRequest = await userFriendsService.sendFriendRequest(fromUserId, toUserId);
        res.status(200).json({
            friendRequest
        });
    } catch (error) {

        console.error('Error sending friend request:', error);
        if (error instanceof FriendRequestAlreadyExistsError) {
            res.status(409).json({
                error: 'Conflict',
                message: error.message
            });
        } else {
            res.status(500).json({
                error: 'Server Error',
                message: `Failed to send friend request: ${(error as Error).message || error}`
            });
        }   
    }
}

export async function getAllSentFriendRequests(req: any, res: any) {
    const { userId } = req.params;
    console.log('Received getAllSentFriendRequests request for userId:', userId);
    if (!userId) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required parameter: userId'
        });
    }
    try {
        const friendRequests = await userFriendsService.getAllSentFriendRequests(userId);
        res.status(200).json({
            friendRequests
        });
    } catch (error) {
        console.error('Error getting all sent friend requests:', error);
        res.status(500).json({
            error: 'Server Error',
            message: `Failed to get all sent friend requests: ${(error as Error).message || error}`
        });
    }
}   


export async function getAllReceivedFriendRequests(req: any, res: any) {
    const { userId } = req.params;
    console.log('Received getAllReceivedFriendRequests request for userId:', userId);
    if (!userId) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required parameter: userId'
        });
    }   
    try {
        const friendRequests = await userFriendsService.getAllReceivedFriendRequests(userId);
        res.status(200).json({
            friendRequests
        });
    } catch (error) {
        console.error('Error getting all received friend requests:', error);
        res.status(500).json({
            error: 'Server Error',
            message: `Failed to get all received friend requests: ${(error as Error).message || error}`
        });
    }
}