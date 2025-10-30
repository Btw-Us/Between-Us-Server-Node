const { UserModel } = require('../../user/user.model');


class UserSearchService {
    async checkUserNameExists(userName: string): Promise<boolean> {
        const user = await UserModel.findOne({ userName: userName }).exec();
        return user !== null;
    }
}


export = { UserSearchService };