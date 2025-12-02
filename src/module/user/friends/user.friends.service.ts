import { pb } from "../../../lib/pocketbase.js";
import { CollectionName, FriendRequestStatus } from "../../../utils/collectionName.js";


export class UserFriendsService {

    async sendFriendRequest(fromUserId: string, toUserId: string) : Promise<any> {
        var senderuid = fromUserId;
        var receiveruid = toUserId;
        // check if a friend request already exists
        const existingRequests = await pb.collection(CollectionName.FriendRequest)
            .getList(1, 1, {
                filter: `senderuid = "${senderuid}" && recieveruid = "${receiveruid}"`
            });
        if (existingRequests.totalItems > 0) {
            throw new FriendRequestAlreadyExistsError("A friend request already exists between these users.");
        }

        // create a new friend request
        const newRequest = await pb.collection(CollectionName.FriendRequest).create({
            senderuid: senderuid,
            recieveruid: receiveruid,
            state: FriendRequestStatus.Pending
        });
        // add references to users' friend request lists
       
        try {
            const senderUser = await pb.collection(CollectionName.Users).getFirstListItem(`uid = "${senderuid}"`);
            const receiverUser = await pb.collection(CollectionName.Users).getFirstListItem(`uid = "${receiveruid}"`);
            // check user exists
            if (!senderUser || !receiverUser) {
                await this.deleteFriendRequest(newRequest.id);
                throw new Error("One or both users do not exist.");
            }
            await pb.collection(CollectionName.Users).update(senderUser.id,
                { friendsrequestlist: [...(senderUser.friendrequestsents || []), newRequest.id] }
            );
            await pb.collection(CollectionName.Users).update(receiverUser.id,
                { friendsrequestlist: [...(receiverUser.friendrequestsreceived || []), newRequest.id] }
            );
        }
        catch (error) {
            // rollback friend request creation
            await this.deleteFriendRequest(newRequest.id);
            throw new Error("Failed to update users with new friend request.");
        }
        return newRequest;
    }

    async getAllSentFriendRequests(userId: string) : Promise<any[]> {
        const requests = await pb.collection(CollectionName.FriendRequest).getFullList({
            filter: `senderuid = "${userId}"`
        });
        if (requests.length === 0) {
            return [];
        }
        
        // get the send user info
        const detailedRequests = await Promise.all(requests.map(async (request) => {
            const receiverUser = await pb.collection(CollectionName.Users).getFirstListItem(`uid = "${request.recieveruid}"`);
            return {
                ...request,
                receiverUser: receiverUser
            };
        }));
        return detailedRequests;
    }

    async getAllReceivedFriendRequests(userId: string) : Promise<any[]> {
        const requests = await pb.collection(CollectionName.FriendRequest).getFullList({
            filter: `recieveruid = "${userId}"`
        });

        if (requests.length === 0) {
            return [];
        }

        // get the sender user info
        const detailedRequests = await Promise.all(requests.map(async (request) => {
            const senderUser = await pb.collection(CollectionName.Users).getFirstListItem(`uid = "${request.senderuid}"`);
            return {
                ...request,
                senderUser: senderUser
            };
        }));
        return detailedRequests;
    }

    async deleteFriendRequest(requestId: string) : Promise<void> {
        await pb.collection(CollectionName.FriendRequest).delete(requestId);
    }

}

export class FriendRequestAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FriendRequestAlreadyExistsError";
    }
}