const mongoose = require('mongoose');
const userPreferenceSchema = new mongoose.Schema({
     userId :{
        type : mongoose.Schema.ObjectId,
        ref:"User"
     },
     storyId :{
        type : mongoose.Schema.ObjectId,
        ref:"Story"
     },
     isLiked:{
        type:Boolean,
        default:false
     },
     isBookmarked:{
        type:Boolean,
        deafult :false,
     }
  },
  {
    timestamps:true
  }
)

const UserPreference = mongoose.model("UserPreference",userPreferenceSchema);
module.exports = UserPreference