const express = require('express');
const router= express.Router();
const { registerUser,
    myprofile, loginUser, logoutUser,getNewAccessToken } = require('../controller/user.controller');
const { isAuth } = require('../middleware/auth.middleware');

// user reegistration
router.post("/registerUser",registerUser);
router.get("/my_profile",isAuth, myprofile);
router.post("/loginUser",loginUser);
router.post("/userLogout/:userId",isAuth, logoutUser);
router.post("/getNewAccessToken",getNewAccessToken);





module.exports = router