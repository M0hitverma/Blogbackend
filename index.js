const express = require('express');
const app = express(); 
const bodyParser= require('body-parser');
const cors= require('cors');
const PORT= 8000;
const authRoutes= require('./Routes/Auth');
const blogRoutes =require('./Routes/Blog');
const imageuploadRoutes = require('./Routes/imageUploadRoutes');
const searchRoute = require('./Routes/search')
const contactRouter = require('./Routes/contact');
require('dotenv').config();
require('./db');

const User= require('./Models/UserSchema');
const cookieParser = require('cookie-parser');

app.use(bodyParser.json());
const allowedOrigins = ['http://localhost:3000'];
app.use(
   cors({
      origin: function(origin, callback){
         if(!origin || allowedOrigins.includes(origin)){
            callback(null,true);
         }
         else{
            callback(new Error('Not allowed by CORS'));
         }
      },
      credentials: true,
   }
      
));
app.use(cookieParser());
app.use('/auth',authRoutes);
app.use('/blog',blogRoutes);
app.use('/image',imageuploadRoutes);
app.use('/search',searchRoute);
app.use('/contact/',contactRouter);

app.get('/',(req,res)=>{
     res.json({message: 'The API is working fine'});
})

app.get('/blogcategories',async(req,res)=>{
     const blogcategories =[
        "Technology Trends",
        "Health and Wellness",
        "Travel Destinations",
        "Food and Cooking",
        "Personal Finance",
        "Carred Development",
        "Parenting Tips",
        "Self-Improvement",
        "Home Decor and DIY",
        "Book Reviews",
        "Environmental Sustainability",
        "Fitness and Exercise",
        "Movie and TV Show Reviews",
        "Entrepreneurship",
        "Mental Health",
        "Fashion and Style",
        "Hobby and Style",
        "Pet Care",
        "Education and Learning",
        "Sports and Recreation",
     ];

     res.json({
        message:"Categories fetched Successfully",
        categories: blogcategories
     })
})




app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
})


