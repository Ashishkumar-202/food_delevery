import React, { useState } from "react";
import Menu from "../component/Menu";
import Food from "../component/Food";

const MenuPage = () => {
  const [category, setCategory] = useState("All");

  return (
    <div className="py-4">
      <div className="container text-center mb-3">
        <h2>Our Full Menu</h2>
        <p className="text-muted mb-0">Explore categories and add your favorite items to cart.</p>
      </div>
      <Menu category={category} setCategory={setCategory} />
      <Food category={category} />
    </div>
  );
};

export default MenuPage;
