import React, { useState } from 'react'
import Header from '../component/Header'
import About from '../component/About'
import Menu from '../component/Menu'
import Food from '../component/Food'

const Home = () => {
  const [category,setCategory] = useState("All")
  return (
    <div>
   <Header/>
      <About/>
      <Menu category={category} setCategory={setCategory}/>
      <Food category={category}/>  
    </div>
  )
}

export default Home