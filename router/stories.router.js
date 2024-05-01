const router = require('express').Router();
const stories = require('../controller/stories.controller');
const { isAuth } = require('../middleware/auth.middleware');

// Stories
router.route("/createStory").post(isAuth,stories.createStory);
router.route("/updateStory/:storyId").post(isAuth,stories.updateStory);
router.route("/getAllStories").get(isAuth,stories.getAllStories);
router.route("/getStoryByCategory/:category").get(isAuth,stories.getStoryByCategory);
router.route("/getStoryById/:storyId").get(stories.getStoryById);
router.route("/getStoryByUserId/:userId").get(isAuth,stories.getStoryByUserId);
router.route("/getBookmarkedStories").get(isAuth,stories.getBookmarkedStories);
router.route("/updateUserPreference/:storyId").post(isAuth,stories.userPreference);
router.route("/getLikedCount/:storyId").get(isAuth, stories.getLikedCount);





module.exports=router