import express from "express";
import { searchUsers } from "./search/user.search.controller.js";


const UserRouter = express.Router();


UserRouter.get('/search', searchUsers);


export default UserRouter;