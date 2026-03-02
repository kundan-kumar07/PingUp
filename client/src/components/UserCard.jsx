import React from 'react'
import { dummyUserData } from '../assets/assets'

const UserCard = ({user}) => {
  const currentUser=dummyUserData;
  const handleFollow=async ()=>{

  }
  const handleConnectionRequest=async ()=>{
    
  }
  return (
    <div className='p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-300 rounded-md' key={user._id}>
      <div>
        <img src={user.profile_picture} className='rounded-full w-16 shadow-md mx-auto' alt="" />
        <p className='mt-4 font-semibold'>{user.full_name}</p>

        {user.username && <p className='text-gray-500 font-light'>@{user.username}</p> }

      </div>

    </div>
  )
}

export default UserCard