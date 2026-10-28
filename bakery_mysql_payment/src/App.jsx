import React, { useEffect, useState } from 'react'
import {Routes,Route} from 'react-router-dom'
import Navbar from './component/Navbar'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Order from './pages/Order'
import AboutPage from './pages/AboutPage'
import MenuPage from './pages/MenuPage'
import ContactPage from './pages/ContactPage'
import TrackOrderPage from './pages/TrackOrderPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AssistantWidget from './component/AssistantWidget'


const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div>
    <Navbar
      theme={theme}
      onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
    />
    
    <Routes>
      <Route path='/' element={<Home/> }/>
      <Route path='/about' element={<AboutPage/> }/>
      <Route path='/menu' element={<MenuPage/> }/>
      <Route path='/cart' element={<Cart/> }/>
      <Route path='/order' element={<Order/> }/>
      <Route path='/contact' element={<ContactPage/> }/>
      <Route path='/track-order' element={<TrackOrderPage/> }/>
      <Route path='/my-orders' element={<MyOrdersPage/> }/>
    </Routes>
    <AssistantWidget />

    </div>
  )
}

export default App
