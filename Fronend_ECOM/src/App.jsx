import React from 'react'
import Home from './pages/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './pages/Register'

const App = () => {
  return (
      <Routes>
        <Route path='/' element={<Register />} />
      </Routes>
  )
}

export default App