const { getAccessToken, getRefereshToken } = require('../middleware/tokenMiddleware');
const User = require('../model/user.model')
const jwt = require('jsonwebtoken')
const registerUser = async (req, res) => {
    try {
        const { userName, password } = req.body;
        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password!"
            })
        }

        const users=await User.find({userName:userName});
        if(users.length){
            return res.status(400).json({
                success: false,
                message: "User already exist!"
            })
        }
        const newUser = new User(req.body);
        newUser.isLoggedIn = false;
        const user = await newUser.save();

        const accessToken = await getAccessToken(user._id);
        const refreshToken = await getRefereshToken(user._id);
        let ussrr = await User.findOneAndUpdate(
            { _id: user._id.toString() },
            {
                refreshToken: refreshToken,
                isLoggedIn: true,
            },
            { new: true }
        );          
        res.status(201).json({
            success: true,
            user: ussrr,
            accessToken
        });
    } catch (error) {        
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const myprofile = async (req, res) => {
    try {
        const _id = req.user._id
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found !!!!"
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {        
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {

        const { userName, password } = req.body;               
        if (!userName || !password) {
            return res.status(404).json({
                success: false,
                message: "All field required!!!!"
            })
        }
        // create a entry in data base
        const user = await User.findOne({ userName: userName }).select("+password"); 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid username or password"
            })
        }   
        // validate password
        if (!user.isValidPassword(password)) {
            return res.status(404).json({
                success: false,
                message: "Invalid username or password"
            })
        }
        // generate access and refres token
        const accessToken = await getAccessToken(user._id);
        const refreshToken = await getRefereshToken(user._id);
        let ussrr = await User.findOneAndUpdate(
            { _id: user._id.toString() },
            {
                refreshToken: refreshToken,
                isLoggedIn: true,
            },
            { new: true }
        ); 
        res.status(201).json({
            success: true,
            user: ussrr,
            accessToken
        })
    } catch (error) {       
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}
const logoutUser = async (req, res) => {
    try {
        const _id = req.params.userId;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found !!!!"
            })
        }
        user.refreshToken = null;
        user.isLoggedIn=false;
        await user.save()
        res.status(200).json({
            success: true,
            message:"User logout successfully!"
        })
    } catch (error) {     
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const getNewAccessToken=async(req,res)=>{
    try{        
        const refreshToken=req.body.refreshToken;
        let accessToken=null;        
        const {_id} = jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN_KEY);           
        if(_id){
          const user = await User.findById(_id);          
          if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found!"
            })
          }
          accessToken = await getAccessToken(user._id);          
          return res.status(200).json({
            success:true,
            message:"Get new access token!",
            accessToken
          });
        }else{
            return res.status(400).json({
                success:false,
                message:"Invalid refresh token!"
            })
         }
    }catch(error){        
        return res.status(400).json({
            success:false,
            message:"Something went wrong!",
          });
    }
}
module.exports = { 
    registerUser, 
    myprofile, 
    loginUser, 
    logoutUser,
    getNewAccessToken,
 }

