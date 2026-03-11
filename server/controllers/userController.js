


import imagekit from "../configs/imagekit.js";
import Connection from "../models/connection.js";
import User from "../models/user.js";
import fs from 'fs'

//get user data using userId
export const getUserData=async (req,res)=>{
  try {
    const {userId}=await req.auth();
    const user=await User.findById(userId);
    if(!user){
      return res.json({success:false,message:"User not found"});
    }
    res.json({success:true,user})
  } catch (error) {
    console.log(error);
    return res.json({success:false,message:error.message});

    
  }
}

//update userData

export const updateUserData=async (req,res)=>{
  try {
    const {userId}=await req.auth();
    let {username,bio,location,full_name}=req.body;
    const tempUser=await User.findById(userId);

    !username && (username=tempUser.username);
    if(tempUser.username!==username){
      const user=await User.findOne({username});
      if(user){
        //we will not change username if it is already taken
        username=tempUser.username;
      }
    }

  
   const updatedData={
    username,bio,location,full_name
   }
   const profile=req.files.profile && req.files.profile[0];
  const cover=req.files.cover && req.files.cover[0];
  if(profile){
    const buffer=fs.readFileSync(profile.path);
    const response=await imagekit.upload({
      file:buffer,
      fileName: profile.originalname,

    })

    const url=imagekit.url({
      path:response.filePath,
      transformation:[
        {quality:'auto'},
        {format:'webp'},
        {width:'512'}
      ]
    })
    updatedData.profile_picture=url;


  }
   if(cover){
    const buffer=fs.readFileSync(cover.path);
    const response=await imagekit.upload({
      file:buffer,
      fileName:cover.originalname,

    })

    const url=imagekit.url({
      path:response.filePath,
      transformation:[
        {quality:'auto'},
        {format:'webp'},
        {width:'1280'}
      ]
    })
    updatedData.cover_photo=url;
    

  }
  const user=await User.findByIdAndUpdate(userId,updatedData,{new:true});

  res.json({success:true,user,message:'profile updated successfully'})

  } catch (error) {
    console.log(error);
    return res.json({success:false,message:error.message});

    
  }
}

//Find the users using username,email,location,name
export const discoverUsers=async (req,res)=>{
  try {
    const {userId}= req.auth();
    const {input}=req.body;
    const allUsers=await User.find({
      $or:[
        {username:new RegExp(input,'i')},
        {email:new RegExp(input,'i')},
        {full_name:new RegExp(input,'i')},
        {location:new RegExp(input,'i')},

      ]
    })

    const filteredUsers=allUsers.filter(user=>user._id!==userId);
    res.json({success:true,users:filteredUsers});
    
   
    
  } catch (error) {
    console.log(error);
    return res.json({success:false,message:error.message});

    
  }
}

//follow user
export const followUser=async (req,res)=>{
  try {
    const {userId}=await req.auth();
    const {id}=req.body;
    const user=await User.findById(userId);
    if(user.following.includes(id)){
      return res.json({success:false,message:"You are already following this user"})
    }
    user.following.push(id);
    await user.save();
    const toUser=await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();
    res.json({success:true,message:"Now you are following this user"})

    

    
   
    
  } catch (error) {
    console.log(error);
    return res.json({success:false,message:error.message});

    
  }
}

//unfollow User

export const unFollowUser=async (req,res)=>{
  try {
    const {userId}=await req.auth();
    const {id}=req.body;
    const user=await User.findById(userId);

    user.following=user.following.filter(user=>user!==id);
    await user.save();
    const toUser=await User.findById(id);
    toUser.followers=toUser.followers.filter(user=>user!==userId);
    await toUser.save();


    
    res.json({success:true,message:"you are no longer following this user"})

    

    
   
    
  } catch (error) {
    console.log(error);
    return res.json({success:false,message:error.message});

    
  }
}


//send connection Request

export const sendConnectionRequest = async (req,res)=>{
  try {

    const {userId} = req.auth();
    const {id} = req.body;

    // check if user sent more than 20 requests in 24 hours
    const last24 = new Date(Date.now() - 24*60*60*1000);

    const connectionRequest = await Connection.countDocuments({
      from_user_id:userId,
      createdAt:{$gt:last24}
    });

    if(connectionRequest >= 20){
      return res.json({
        success:false,
        message:"You have sent more than 20 connection requests in the last 24 hours"
      })
    }

    // check if connection already exists
    const connection = await Connection.findOne({
      $or:[
        {from_user_id:userId,to_user_id:id},
        {from_user_id:id,to_user_id:userId}
      ]
    })

    if(!connection){

      await Connection.create({
        from_user_id:userId,
        to_user_id:id
      })

      return res.json({
        success:true,
        message:'Connection request sent successfully'
      })

    }

    else if(connection.status === 'accepted'){
      return res.json({
        success:false,
        message:'You are already connected with this user'
      })
    }

    return res.json({
      success:false,
      message:'Connection request already pending'
    })

  }

  catch(error){
    console.log(error)
    res.json({
      success:false,
      message:error.message
    })
  }
}
//get User Connection
export const getConnectionRequest = async (req,res)=>{
  try {

    const {userId} = req.auth();
    const user=await User.findById(userId).populate('connections followers following');

    const connections=user.connections
    const followers=user.followers;
    const following=user.following;
    const pendingConnections=((await Connection.find({to_user_id:userId,status:'pending'}).populate('from_user_id')).map(connection=>connection.from_user_id))
    res.json({success:true,connections,followers,following,pendingConnections})


    
  }
  catch(error){
    console.log(error)
    res.json({
      success:false,
      message:error.message
    })
  }
}

// accepted connection request
export const acceptedConnectionRequest = async (req,res)=>{
  try {

    const {userId} = req.auth();
    const {id} = req.body;

    const connection = await Connection.findOne({
      from_user_id:id,
      to_user_id:userId
    });

    if(!connection){
      return res.json({
        success:false,
        message:'Connection request not found'
      })
    }

    if(connection.status === 'accepted'){
      return res.json({
        success:false,
        message:'Connection already accepted'
      })
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if(!user.connections.includes(id)){
      user.connections.push(id)
    }

    if(!toUser.connections.includes(userId)){
      toUser.connections.push(userId)
    }

    connection.status = 'accepted';

    await Promise.all([
      user.save(),
      toUser.save(),
      connection.save()
    ])

    res.json({
      success:true,
      message:'Connection accepted successfully'
    })

  }
  catch(error){
    console.log(error)
    res.json({
      success:false,
      message:error.message
    })
  }
}
