import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/Assets";

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({})

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({
                ...prev, [itemId]: 1
            }))
        }
        else {
            setCartItems((prev) => ({
                ...prev, [itemId]:prev[itemId] + 1
            }))
        }
    }
    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
        }))
    }
    useEffect(() => {
        console.log(cartItems)
    }, [cartItems])

    const getTotalAmount=()=>{
        let totolAmount=0
        for(const item in cartItems)
        {
            if(cartItems[item]>0)
            {
                let itemInfo=food_list.find((product)=>product._id===item)
                if (!itemInfo) {
                    continue
                }
                totolAmount=totolAmount+itemInfo.price*cartItems[item]
            }
        }
    
    return totolAmount
    }

    const contaxtValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalAmount
    }

    return (
        <StoreContext.Provider value={contaxtValue}>
            {props.children}
        </StoreContext.Provider>
    )
}
export default StoreContextProvider
