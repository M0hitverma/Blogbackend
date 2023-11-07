const express = require('express');
const router = express.Router();
const User = require('../Models/UserSchema');
const errorHandler = require('../Middlewares/errorMiddleware');
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt= require('jsonwebtoken');
const bcrypt= require('bcrypt');
const nodemailer= require('nodemailer');
const { create } = require('../Models/BlogSchema');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
     user: 'mohit41verma@gmail.com',
     pass :'pesswuubpekmiupg',
    }
 })


router.get('/',async(req,res)=>{
    res.json({
    message: 'user api is working'
    })
})

function createResponse(ok,message,data){
  return {
    ok,
    message,
    data
  };
}

router.post('/sendotp',async(req,res)=>{
    const {email}=req.body;
    const otp= Math.floor(100000 + Math.random()*900000);
    try{
     const mailOptions ={
         from: process.env.COMPANY_EMAIL,
         to:email,
         subject: 'OTP for verification of blogTogether',
         text: `Your OTP for verification is ${otp}`
     }
     transporter.sendMail(mailOptions,async(err,info)=>{
       if(err){
         console.log(err);
         res.status(500).json(createResponse(false,err.message));
       }else{
          res.json(createResponse(true,"OTP sent successfully",{otp}));
          
       }
     });

    }catch(err){
     next(err);
    }
})


router.post('/register',async(req,res,next)=>{
    try{
      
        const {name,email,password}= req.body;
        const existingUser = await User.findOne({email:email});

        if(existingUser){
         return res.status(409).json(createResponse(false,'Email already exists'));
        }
        const newUser = new User({
         name,
         password,
         email,

        });
        await newUser.save();
        res.status(201).json(createResponse(true,"User successfully register"));

    }catch(err){
       next(err);
    }
})

router.post('/login',async(req,res,next)=>{
    try{
      const {email,password} =req.body;
      const user = await User.findOne({email : email});
 
     if(!user){
        return res.status(400).json(createResponse(false,"Invalid email or password"));
     }
       
      const isMatch = await bcrypt.compare(password,user.password);
 
      if(!isMatch){
         res.status(400).json(createResponse(false,"Invalid Credentials"));
      }
     
      const authToken = jwt.sign({userId: user._id},process.env.JMT_SECRET_KEY,{expiresIn:'20m'});
 
      const refreshToken = jwt.sign({userId: user._id },process.env.JMT_REFRESH_SECRET_KEY,{expiresIn:'40m'} );
 
     res.cookie('authToken', authToken,{httpOnly: true});
     res.cookie('refreshToken', refreshToken, {httpOnly: true});
     res.status(200).json(createResponse(true,"LoginSuccessful",{authToken,refreshToken}));
 
   }catch(err){
     next(err);
   }
 }) 



router.use(errorHandler);


router.get('/checklogin',authTokenHandler, async(req,res)=>{
   res.json({
    ok: true,
    message: "User authenticated Successfully"
   })
})

module.exports = router;