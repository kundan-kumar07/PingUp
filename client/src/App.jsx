import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import { useUser } from '@clerk/clerk-react'
import Layout from './pages/Layout'


const App = () => {
  const {user}=useUser();
  return (
    <>
    <Routes>
      <Route path='/' element={ !user? <Login/>: <Layout/> }>
      <Route index element={<Feed/>}/>
      <Route path='messages' element={<Messages/>}/>
      <Route path='messages/:userId' element={<Chat/>}/>
      <Route path='connetions' element={<Connections/>}/>
      <Route path='discover' element={<Discover/>}/>
      <Route path='profile' element={<Profile/>}/>
      <Route path='profile/:profileId' element={<Profile/>}/>
      <Route path='create-post' element={<CreatePost/>}/>
      </Route>
      
    </Routes>

    </>
  )
}

export default App