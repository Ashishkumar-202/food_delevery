import React, { useContext } from "react";
import { StoreContext } from "../contaxt/StoreContext";
import Fooditem from "./Fooditem";

const Food = ({category}) => {
  const {food_list} = useContext(StoreContext);
  
  return (
    <div className="food-display container" id="food-display">
      <h2>Top dishes <span>near you</span></h2>
      <div>
       
      </div>
      <div className="food-display-list">
        {
            food_list.map((item,index) =>{
               if (category==item.category || category=="All"){
                return (
                  <div key={index}>
                <Fooditem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.Image} />
                </div>
                )

               }
            })
        }
      </div>
    </div>
  );
};
export default Food
