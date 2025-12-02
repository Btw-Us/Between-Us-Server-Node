import express from "express";
import { searchUsers } from "./search/user.search.controller.js";
import { getAllReceivedFriendRequests, getAllSentFriendRequests, sendFriendRequest, updateFriendRequestStatus } from "./friends/user.friends.controllert.js";

const UserRouter = express.Router();


UserRouter.get('/search', searchUsers);
UserRouter.post('/friends/request', sendFriendRequest);
UserRouter.get('/friends/requests/sent/:userId', getAllSentFriendRequests);
UserRouter.get('/friends/requests/received/:userId', getAllReceivedFriendRequests);
UserRouter.patch('/friends/requests/:requestId/status', updateFriendRequestStatus);


export default UserRouter;