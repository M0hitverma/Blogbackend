const express= require('express');
const router= express.Router(); 
const Blog =require('../Models/BlogSchema');
const User= require('../Models/UserSchema');
const jwt= require('jsonwebtoken');
const authTokenHandler= require('../Middlewares/checkAuthToken');
const { create } = require('../Models/BlogSchema');

function createResponse(ok,message,data){
  return {
    ok,
    message,
    data
  };
}


const checkBlogOwnerShip = async(req,res,next)=>{

    try{
     const blog = await Blog.findById(req.params.id);
    if(!blog){
    return res.status(404).json(createResponse(false,"Blog post not found"));
    }
    if(blog.owner.toString() !== req.userId){
      return res.status(403).json(createResponse(false,"Permission denied : You do not own this blog"));
    }
    req.blog= blog;
     next();
   }catch(err){
      res.status(500).json(createResponse(false,err.message));
   }
 }
 


router.get('/text',authTokenHandler,async(req,res)=>{
    res.json(createResponse(true,"Blog api is working fine"));
});

router.post('/',authTokenHandler,async(req,res)=>{
    try{
      const {title, description, imageUrl, paragraphs,category}=req.body;
      console.log(title,description,imageUrl,paragraphs,category);
      const newblog = new Blog({
          title,
          description,
          imageUrl,
          paragraphs,
         owner: req.userId,
         category
      });

    await newblog.save();

    const user = await User.findById(req.userId);
    if(!user){
        res.status(404).json(createResponse(false,"User not Found",
        ));
    }

    user.blogs.push(newblog._id);
     await user.save();
     res.status(201).json(createResponse(true,"Blog Successfully creater",
     {newblog}));
    }catch(err){
      res.status(500).json(createResponse(false, err.message));
    }
});

router.get('/:id',async(req,res)=>{

    try{ 
     const blog= await Blog.findById(req.params.id);
     if(!blog){
         return res.status(404).json(createResponse(false,"Blog post not found"
         ));
     }
     res.status(200).json(createResponse(true,"Blog fetched successfully",{blog}));
     }
     catch(err){
     res.status(500).json(createResponse(false, err.message));
     }
 });

router.put('/:id',authTokenHandler, checkBlogOwnerShip , async(req,res)=>{
  
    try{
 
     const {title, description, imageUrl, paragraphs,category} = req.body;
     
     const updatedblog = await Blog.findByIdAndUpdate(
       req.params.id,
       {title,description,imageUrl,paragraphs,category},
       {new: true}
     )
 
     if(!updatedblog){
       return res.status(404).json(createResponse(false,"Blog not found"));
     }
 
     res.status(200).json(createResponse(true,"Blog post updated Successfully", {updatedblog}));
 
    }
    catch(err){
      res.status(500).json(createResponse(false,err.message));
    }
 
 });

router.delete('/:id',authTokenHandler, checkBlogOwnerShip, async(req,res)=>{
    try{
      const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
      if(!deletedBlog){
        return res.status(404).json(createResponse(false,"Blog post not Found"));
      }
      const user = await User.findById(req.userId);
 
      if(!user){
       return res.status(404).json(createResponse(false,"User not found"));
      }
      const blogIndex = user.blogs.indexOf(req.params.id);
      if(blogIndex!=-1){
        user.blogs.splice(blogIndex,1);
        await user.save();
      }
     
      res.status(200).json(createResponse(true,"Blog post deleted Successfully", {deletedBlog}));
    }
    catch(err){
      res.status(500).json(createResponse(false,err.message));
    }
 })

router.get('/',async(req,res)=>{
    try{
       
      const page = parseInt(req.body.page) || 1;
      const search =req.body.search || '';
      const perpage=5;
      const searchQuery = new RegExp(search,'i');
      const totalBlogs = await Blog.countDocuments({title : searchQuery});
      const totalpages = Math.ceil(totalBlogs/perpage);
      if(page<1 || page>totalpages){
       return res.status(400).json(createResponse(false,"Invalid page no"));
      }
      const skipblog= (page-1)*perpage;
      const blogs= await Blog.find({title: searchQuery})
      .sort({createdAt: -1})
      .skip(skipblog)
      .limit(perpage);
 
      res.status(200).json(createResponse(true,"Blogs Fetched Successfully" ,{blogs, totalpages, currentPage: page}));
 
    }
    catch(err){
     res.status(500).json(createResponse(false, err.message));
    }
 })

router.get('/category/:cname',async(req,res)=>{

  try{
    const categoryName = req.params.cname;
    const blogs  = await Blog.find({category: categoryName});
    if(!blogs){
      return res.status(404).json({
          ok: false,
          message: "Blog post not found"
      })
  }
  res.status(200).json({
    ok:true,
    message:"Blogs fetched successfully",
    data: {blogs}});

  }
  catch(error){
    req.json(500).json({
      ok:false,
      message: error.message
    })
  }

})


module.exports = router;