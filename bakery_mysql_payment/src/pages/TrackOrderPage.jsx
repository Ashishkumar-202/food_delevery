import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");

  const onTrack = async (e) => {
    e.preventDefault();
    setError("");
    setOrderData(null);

    if (!orderId.trim()) {
      setError("Please enter your order ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId.trim()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch order");
      }
      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm">
            <h2 className="mb-2">Track Your Order</h2>
            <p className="text-muted">Enter the order ID you received after checkout.</p>
            <form onSubmit={onTrack} className="d-flex gap-2 mb-3">
              <input
                type="number"
                className="form-control"
                placeholder="Enter Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
              <button type="submit" className="btn btn-danger" disabled={loading}>
                {loading ? "Checking..." : "Track"}
              </button>
            </form>

            {error && <p className="text-danger mb-2">{error}</p>}

            {orderData && (
              <div className="track-result">
                <h5>Order #{orderData.order.id}</h5>
                <p className="mb-1"><strong>Customer:</strong> {orderData.order.customer_name}</p>
                <p className="mb-1"><strong>Payment:</strong> {orderData.order.payment_method}</p>
                <p className="mb-1"><strong>Status:</strong> {orderData.order.payment_status}</p>
                <p className="mb-3"><strong>Total:</strong> Rs {orderData.order.total_amount}</p>

                <h6>Items</h6>
                <ul className="mb-0">
                  {orderData.items.map((item, index) => (
                    <li key={`${item.product_id}-${index}`}>
                      {item.product_name} x {item.quantity} (Rs {item.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
