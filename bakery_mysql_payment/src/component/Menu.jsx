import React from 'react'
import {menu_list} from '../assets/Assets'

const Menu = ({category,setCategory}) => {
  return (
    <div className=' container menu' id='explore-menu'>
        <h1>Explore <span>our menu</span></h1>

        <div className='explore-menu-list'>
            {
            menu_list.map ((item,index) =>{
                return (
                    <div onClick={()=>setCategory(item.menu_name)} key={index} 
                    className='explore-menu-list-item'>
                        
                        <img src={item.menu_image} alt="" className={category===item.menu_name ? "active" :""} />
                        <p>{item.menu_name}</p>
                    </div>
                    
                )
            })}
            
        </div>
        <button type='submit' onClick={()=> setCategory('All')} className='btn btn-danger my-3'>Food list</button>
        <hr/>
    </div>
  )
}

export default Menu