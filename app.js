const express = require('express');
const cors = require('cors');
const bodyParser=require("body-parser");
const app = express();
const userRouter = require('./router/user.router')
const storyRouter = require('./router/stories.router')
app.use((err,req,res,next)=>{
    err.statusCode=err.statusCode;    
     err.message=err.message||"Internal Server Error"
     res.status(err.statusCode).json({
        success:false,
        message:err.message
    })}
)
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
  const corsOptions = {
    origin: "*",
    credentials: true, 
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

//router setup
app.use('/user',userRouter);
app.use('/story',storyRouter);

app.get("/",async(req,res)=>{
    console.log("Server is working fine!")
});



module.exports = app;