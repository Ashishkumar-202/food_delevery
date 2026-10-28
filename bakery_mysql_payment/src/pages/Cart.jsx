import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiDeleteBinLine,
  RiShoppingBag3Line,
  RiSubtractLine,
} from "react-icons/ri";
import { StoreContext } from "../contaxt/StoreContext";

const formatPrice = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const Cart = () => {
  const {
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    setCartItems,
    getTotalAmount,
  } = useContext(StoreContext);
  const navigate = useNavigate();

  const items = useMemo(
    () => food_list.filter((item) => Number(cartItems[item._id]) > 0),
    [cartItems, food_list]
  );
  const itemCount = items.reduce(
    (count, item) => count + Number(cartItems[item._id] || 0),
    0
  );
  const subtotal = getTotalAmount();

  const removeItem = (id) => {
    setCartItems((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  return (
    <main className="cart-page">
      <div className="cart-shell">
        <button className="cart-back-link" type="button" onClick={() => navigate("/menu")}>
          <RiArrowLeftLine aria-hidden="true" /> Continue shopping
        </button>

        <div className="cart-heading-row">
          <div>
            <p className="cart-kicker">YOUR BAKERY BAG</p>
            <h1>Shopping cart</h1>
          </div>
          <span className="cart-item-count">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        {items.length === 0 ? (
          <section className="cart-empty-card">
            <div className="cart-empty-icon"><RiShoppingBag3Line aria-hidden="true" /></div>
            <h2>Your cart is waiting for a treat</h2>
            <p>Browse the bakery menu and add something freshly baked.</p>
            <button className="cart-primary-button" type="button" onClick={() => navigate("/menu")}>
              Explore the menu <RiArrowRightLine aria-hidden="true" />
            </button>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-panel" aria-label="Items in your cart">
              <div className="cart-panel-heading">
                <h2>Items in your bag</h2>
                <span>{itemCount} total</span>
              </div>

              <div className="cart-items-list">
                {items.map((item) => {
                  const quantity = Number(cartItems[item._id]);
                  return (
                    <article className="cart-item-row" key={item._id}>
                      <img className="cart-product-image" src={item.Image} alt={item.name} />
                      <div className="cart-product-details">
                        <span className="cart-product-category">{item.category}</span>
                        <h3>{item.name}</h3>
                        <span className="cart-product-unit-price">{formatPrice(item.price)} each</span>
                      </div>
                      <div className="cart-quantity-control" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          aria-label={`Remove one ${item.name}`}
                          onClick={() => removeFromCart(item._id)}
                        >
                          <RiSubtractLine aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{quantity}</span>
                        <button
                          type="button"
                          aria-label={`Add one ${item.name}`}
                          onClick={() => addToCart(item._id)}
                        >
                          <RiAddLine aria-hidden="true" />
                        </button>
                      </div>
                      <div className="cart-line-total">{formatPrice(item.price * quantity)}</div>
                      <button
                        className="cart-remove-button"
                        type="button"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => removeItem(item._id)}
                      >
                        <RiDeleteBinLine aria-hidden="true" />
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="cart-note">
                <span aria-hidden="true">✦</span>
                <p>Every order is prepared fresh at our bakery.</p>
              </div>
            </section>

            <aside className="cart-summary-card" aria-label="Order summary">
              <h2>Order summary</h2>
              <div className="cart-summary-line">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary-line">
                <span>Delivery</span><span className="cart-free-delivery">Free</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span><strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart-tax-note">Taxes and delivery details are confirmed at checkout.</p>
              <button className="cart-primary-button cart-checkout-button" type="button" onClick={() => navigate("/order")}>
                Proceed to checkout <RiArrowRightLine aria-hidden="true" />
              </button>
              <button className="cart-secondary-button" type="button" onClick={() => navigate("/menu")}>
                Add more treats
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
