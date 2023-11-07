const express= require('express');
const router= express.Router();
const Blog =require('../Models/BlogSchema');
function createResponse(ok,message,data) {
    return {
     ok,
      message,
      data
    };
}
router.route('/text').get((req,res)=>{
    res.json({
      message: "Auth api is working fine",
    })
 })

 router.get('/:name',async(req,res)=>{
    try{
       

      const search =req.params.name || '';

      const searchQuery = new RegExp(search,'i');

      const blogs= await Blog.find({title: searchQuery});
 
      res.status(200).json(createResponse(true,"Blogs fetched successfully",{blogs}));
 
    }
    catch(err){
     res.status(500).json(createResponse(false,err.message));
    }
 })

 module.exports= router;