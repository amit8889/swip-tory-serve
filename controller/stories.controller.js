const Story = require("../model/stories.model")
const mongoose = require('mongoose')
const UserPreference = require("../model/userPreference.model")
const createStory = async(req,res)=>{
    try {        
        const {titles,descriptions,imageUrls,category} = req.body         
        if(!titles.length || !descriptions.length || !imageUrls.length || !category ){
              return res.status(400).json({
                success:false,
                message:"Story details are not correct!"
              })
        }

        const story = await Story.create({...req.body,userId:req.user._id});
        res.status(201).json({
            success:true,
            story:story,
            messages:"New story created!"
         })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const updateStory = async(req,res)=>{
    try {              
        const {storyId} = req.params;        
        const story = await Story.findOneAndUpdate({_id:new mongoose.Types.ObjectId(storyId)},{...req.body,userId:req.user._id},{
            new:true,
            upsert:true
        });
        if(!story)
          return res.status(400).json({
            success:false,            
            messages:"Something went wrong!"
         })

        res.status(201).json({
            success:true,
            story:story,
            messages:"Story updated successfully!"
         });
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const getAllStories = async(req,res)=>{
    try {               
                      
          const stories = await Story.aggregate([            
            {
              $group: {
                _id: "$category",
                totalDocuments: { $sum: 1 },
                stories: { $push: "$$ROOT" }
              }
            },            
            {
              $project: {
                category: "$_id",
                totalDocuments: 1,
                stories: { $slice: ["$stories", 4] }
              }
            },          
            {
              $unwind: "$stories"
            },            
            {
              $lookup: {
                from: "userpreferences", 
                localField: "stories._id",
                foreignField: "storyId",
                as: "storyPreferences"
              }
            },            
            {
              $project: {
                _id: "$stories._id",
                titles: "$stories.titles",
                descriptions: "$stories.descriptions",
                imageUrls: "$stories.imageUrls",
                category: "$_id",
                userId: "$stories.userId",                            
                isLiked: {
                  $in: ["$stories._id", "$storyPreferences.storyId"]
                },
                isBookmarked: {
                  $cond: {
                    if: { $gt: [{ $size: "$storyPreferences" }, 0] },
                    then: { $arrayElemAt: ["$storyPreferences.isBookmarked", 0] },
                    else: false
                  }
                }
              }
            },             
             {
               $group: {
                 _id: "$_id",                            
                 stories: { $push: "$$ROOT" }
               }
             },
             {
                $unwind:"$stories"
             },
             {
                $replaceRoot:{newRoot:"$stories"}
             }
          
          ]);

          const totalPages=await Story.aggregate([
            {
              $group: {
                _id: "$category",
                totalDocuments:{$sum:1}                
              }
            },
        {
            $project:{
                _id:1,                
                totalPage:{$ceil:{$divide:["$totalDocuments",4]}}
            }
        }]);
      
          if(!stories)
            return;
            res.status(201).json({
                success:true,
                stories:stories,
                totalPages:totalPages,                             
                messages:"Get all stories!"
             })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const getStoryById = async(req,res)=>{
    try {                
        const story=await Story.aggregate([	
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.storyId) }
              }, 					 
             
              {
                $lookup: {
                  from: "userpreferences",
                  localField: "_id",
                  foreignField: "storyId",
                  as: "storyPreferences"
                }
              },          
              {
                $project: {
                  _id: "$_id",
                  titles: "$titles",
                  descriptions: "$descriptions",
                  imageUrls: "$imageUrls",
                  category: "$category",
                  userId: "$stories.userId",               
                  isLiked: {
                    $in: ["$stories._id", "$storyPreferences.storyId"]
                  },
                  isBookmarked: {
                    $cond: {
                      if: { $gt: [{ $size: "$storyPreferences" }, 0] },
                      then: { $arrayElemAt: ["$storyPreferences.isBookmarked", 0] },
                      else: false
                    }
                  }
                }
              }       
              ]);
            if(!story){
              return res.status(400).json({
                success:false,                
                messages:"Story not found!"
             })
            } 
        res.status(201).json({
            success:true,
            story:story,
            messages:"Get your story!"
         })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const getStoryByCategory = async(req,res)=>{
    try {               
        const category=req.params.category;
        const page=req.body.page||1;
        const perPage=4;
        
        const stories=await Story.aggregate([	
        {
            $match: { category: category }
          }, 					 
         
          {
            $lookup: {
              from: "userpreferences",
              localField: "_id",
              foreignField: "storyId",
              as: "storyPreferences"
            }
          },          
          {
            $project: {
              _id: "$_id",
              titles: "$titles",
              descriptions: "$descriptions",
              imageUrls: "$imageUrls",
              category: "$category",
              userId: "$stories.userId",               
              isLiked: {
                $in: ["$stories._id", "$storyPreferences.storyId"]
              },
              isBookmarked: {
                $cond: {
                  if: { $gt: [{ $size: "$storyPreferences" }, 0] },
                  then: { $arrayElemAt: ["$storyPreferences.isBookmarked", 0] },
                  else: false
                }
              }
            }
          },           
            {
            $skip:(page)*perPage
          },
                       {
            $limit: perPage
          },
                       
          ]);
          const totalCount=(await Story.find({category:category})).length;
          
        if(!stories)
            return res.status(400).json({
                success:false,
                message:"something went wrong!"
        });

        res.status(201).json({
            success:true,
            story:stories, 
            totalPages:Math.ceil(totalCount/perPage),
            messages:"Get your stories by categories!"
         })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const getStoryByUserId = async(req,res)=>{
    try {
               
        const stories = await Story.find({userId:new mongoose.Types.ObjectId(req.params.userId+"")}).sort({createdAt:-1});
        if(!stories)
            return res.status(400).json({
            success:false,
            message:"Stories not found!"
    });
        res.status(201).json({
            success:true,
            stories:stories,
            messages:"Get your stories!"
         })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}



const getBookmarkedStories = async(req,res)=>{
    try {        
        const stories = await UserPreference.aggregate([{
            $match: {
              userId:new mongoose.Types.ObjectId(req.user._id),
              isBookmarked: true
            }
          },
          {
            $lookup: {
              from: "stories", 
              localField: "storyId",
              foreignField: "_id",
              as: "bookmarkedStories"
            }
          },
          {
            $unwind: "$bookmarkedStories"
          },  
          {
            $project: {
              _id: "$bookmarkedStories._id",
              titles: "$bookmarkedStories.titles",
              descriptions: "$bookmarkedStories.descriptions",
              imageUrls: "$bookmarkedStories.imageUrls",
              category: "$bookmarkedStories.category",
              userId: "$bookmarkedStories.userId",
              isBookmarked:"$isBookmarked",
              isLiked:"$isLiked"
            }
          }]);
          if(!stories){
            return res.status(400).json({
              success:false,              
              messages:"Bookmarked stories not found!"
           })
          }
        res.status(201).json({
            success:true,
            stories:stories,
            messages:"Get your bookmarked stories!"
         })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const userPreference = async(req,res)=>{
    try {               
        const userPreference = await UserPreference.findOneAndUpdate({userId:new mongoose.Types.ObjectId(req.user._id),storyId:new mongoose.Types.ObjectId(req.params.storyId)},{
            ...req.body
        },{
            new:true,
            upsert:true
        })
        const userStory=await UserPreference.aggregate([{
            $match: {
              storyId: new mongoose.Types.ObjectId(userPreference.storyId),
              }
          },
          {
            $lookup: {
              from: "stories", 
              localField: "storyId",
              foreignField: "_id",
              as: "bookmarkedStories"
            }
          },
          {
            $unwind: "$bookmarkedStories"
          },  
          {
            $project: {
              _id: "$bookmarkedStories._id",
              titles: "$bookmarkedStories.titles",
              descriptions: "$bookmarkedStories.descriptions",
              imageUrls: "$bookmarkedStories.imageUrls",
              category: "$bookmarkedStories.category",
              userId: "$bookmarkedStories.userId",
              isBookmarked:"$isBookmarked",
              isLiked:"$isLiked"
            }
          }])
        if(!userStory){
          return res.status(400).json({
            success:false,           
            messages:"Something went wrong!"
         })
        }
        res.status(201).json({
            success:true,            
            userPreference:userStory,
            messages:"UserPreference updated  !!!"
         })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getLikedCount=async(req,res)=>{
  try {
    const storyId=req.params.storyId;
    const userId=req.user._id;
    const count = await UserPreference.countDocuments({ storyId: storyId, isLiked: true });
    
    res.status(201).json({
        success:true,            
        likedCount:count,
        messages:"Get liked count!"
     })
  } catch (error) {
    res.status(500).json({
      success:false, 
      messages:error.message
   })
  }
}
module.exports={
  createStory,
  updateStory,
  getAllStories,
  getStoryById,
  getStoryByCategory,
  getBookmarkedStories,
  getStoryByUserId,
  getStoryById,
  userPreference,
  getLikedCount};