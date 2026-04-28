import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Reels from './pages/Reels'
import Search from './pages/Search'
import Upload from './pages/Upload'
import PostView from './pages/PostView'
import PostEdit from './pages/PostEdit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/post/:id" element={<PostView />} />
        <Route path="/post/:id/edit" element={<PostEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
