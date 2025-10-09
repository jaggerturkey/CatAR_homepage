import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Homepage from './pages/Homepage'
import About from './pages/About'
import Services from './pages/Services'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
      </Route>
    </Routes>
  )
}

export default App
