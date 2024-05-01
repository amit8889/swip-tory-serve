const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        require:[true,"User name is required !!!!"],
        minLength:[4,"User name can't be of less than 4 character"],
        maxLength:[20,"User name can't grater than 20 character"],
        unique:true
    },
    password:{
        type:String,
        select:true
    },
    avatar:{
        type:String,
        require:false,
    },
    refreshToken:{
        type:String,
        
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps:true
  }
)


userSchema.pre('save',async function(next){
    //encrypt password
    if (!this.isModified('password')) {
        return next();
    }
    // check of password modified then check its validation
    let passwordMatching = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/
    passwordMatching = new RegExp(passwordMatching)    
    const check = passwordMatching.test(this.password);    
    if(!check){
        throw new Error("Invalid password !!!!")
    }
    // Create a hash object using the 'sha256' algorithm
    const hash = crypto.createHash('sha256');

    // Update the hash object with the password
    hash.update(this.password);

    // Generate the hashed password as a hexadecimal string
    const hashedPassword = hash.digest('hex');
    
    // Replace the plaintext password with the hashed one
    this.password = hashedPassword;
    // Call next to proceed with the save operation
    next();

})

 userSchema.methods.isValidPassword = function(password){
    const hash = crypto.createHash('sha256');
    // Update the hash object with the password
    hash.update(password);
    // Generate the hashed password as a hexadecimal string
    const hashedPassword = hash.digest('hex');
    // Replace the plaintext password with the hashed one
  
    return  this.password == hashedPassword;
 }
 
const User = mongoose.model("User",userSchema);
module.exports = User