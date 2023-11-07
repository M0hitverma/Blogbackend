const express = require('express');
const router = express.Router();
const nodemailer= require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
     user: 'mohit41verma@gmail.com',
     pass :'pesswuubpekmiupg',
    }
 })
 
 router.get('/',(req,res)=>{
    res.json({
        message:"api working fine"
    })
 })

router.post('/',async(req,res)=>{
    const {email, message}=req.body;

    try{
     const mailOptions ={
         from: email,
         to:process.env.COMPANY_EMAIL,
         subject: 'User has a query',
         text: `${message}`
     }
     transporter.sendMail(mailOptions,async(err,info)=>{
       if(err){
         console.log(err);
         res.status(500).json({
            ok: false,
           message: err.message
         })
       }else{
          res.json({
            ok: true,
           message:"Message sent successfully",
         })
          
       }
     })
     

    }catch(err){
     next(err);
    }
})

module.exports = router;