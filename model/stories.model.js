const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    titles:{
        type:Array,
        required:true
    },
    descriptions:{
        type:Array,
        required:true
    },
    imageUrls:{
      type:Array,
      required:true
    },
    category:{
     type: String,
     required: true
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User"

    },
  },
  {
    timestamps:true
  }
)

const Story = mongoose.model("Story",storySchema);
module.exports = Story