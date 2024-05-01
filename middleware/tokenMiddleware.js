const jwt = require('jsonwebtoken')
const User = require('../model/user.model')

const getRefereshToken=async(id)=>{
    const refereshToken = jwt.sign(
        {_id:id},
        process.env.JWT_REFRESH_TOKEN_KEY,
        {expiresIn:process.env.JWT_REFRESH_TOKEN_EXIPREAT}
    )   
    return refereshToken;
}

const getAccessToken=async(id)=>{
    const accessToken = jwt.sign(
        {_id:id},
        process.env.JWT_ACCESS_TOKEN_KEY,
        {expiresIn:process.env.JWT_ACCESS_TOKEN_EXIPREAT}
    )
    return accessToken
 }

 module.exports={getRefereshToken,getAccessToken};