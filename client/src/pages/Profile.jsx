import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets';
import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo';


const Profile = () => {
  const {profileId}=useParams();
  const [user,setUser]=useState(null);
  const [posts,setPosts]=useState(null);
  const [activeTab,setActiveTab]=useState('posts');
  const [showEdit,setShowEdit]=useState(false);

  const fetchUser=async ()=>{
    setUser(dummyUserData);
    setPosts(dummyPostsData)
  }

  useEffect(()=>{
    fetchUser()
  },[])

  return user ? (
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-white rounded-2xl shadow overflow-hidden'>
          <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo && <img className='w-full h-full object-cover' src={user.cover_photo}/>}
          </div>
          {/* user info */}
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit}/>


        </div>
        {/* Tabs */}
        <div className='mt-6'>
          <div className='bg-white rounded-xl shadow  p-1 flex max-w-md mx-auto'>
            {["posts","media","likes"].map((tab)=>(
              <button onClick={()=>setActiveTab(tab)} key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab===tab?"bg-indigo-600 text-white":"text-gray-600 hover:text-gray-900"}`}>
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
              
            ))}

          </div>

        </div>

      </div>

    </div>
  ) :(<Loading/>)
}

export default Profile