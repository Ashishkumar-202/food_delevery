import React, { useContext } from 'react'
import { Assets } from '../assets/Assets'
import { StoreContext } from '../contaxt/StoreContext'


const Fooditem = ({id,name,price,description,image}) => {
  const { cartItems,addToCart,removeFromCart}=useContext(StoreContext)
  
  return (
    <div className="food-card-wrap">
      <div className="food-items">
        <div className="food-items-list">
          <div className="food-items-image">
            <img src={image} alt="" className='food-item-image img-fluid' />
            {
              !cartItems[id]
              ?
              <button className="food-add-control" type="button" onClick={()=>addToCart(id)} aria-label={`Add ${name} to cart`}>
                <img src={Assets.plus} alt="" />
              </button>
              :<div className='food-cart' aria-label={`Quantity ${cartItems[id]} for ${name}`}>
                <button type="button" onClick={()=>removeFromCart(id)} aria-label={`Remove one ${name}`}>
                  <img src={Assets.remove} alt="" />
                </button>
                <span aria-live="polite">{cartItems[id]}</span>
                <button type="button" onClick={()=>addToCart(id)} aria-label={`Add one ${name}`}>
                  <img src={Assets.add} alt="" />
                </button>
                </div>
            }
            </div>
            
            <div className="food-item-info">
            <p>{name}</p>
            <p className="food-item-desc">{description}</p>
            <p className="food-item-price">Price: ₹{price}</p>
            </div>
            <div>
            
            
            </div> 
        </div>  
      </div>
    </div>
  )
}

export default Fooditem
