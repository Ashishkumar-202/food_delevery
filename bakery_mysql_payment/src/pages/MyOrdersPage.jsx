import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { StoreContext } from "../contaxt/StoreContext";

const MyOrdersPage = () => {
  const { setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSearch = async (e) => {
    e.preventDefault();
    setError("");
    setOrders([]);

    if (!email.trim() && !phone.trim()) {
      setError("Enter email or phone to find your orders.");
      return;
    }

    const params = new URLSearchParams();
    if (email.trim()) params.append("email", email.trim());
    if (phone.trim()) params.append("phone", phone.trim());

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/my-orders?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "PAID") return "status-chip status-paid";
    if (normalized === "FAILED") return "status-chip status-failed";
    return "status-chip status-pending";
  };

  const handleReorder = (order) => {
    const nextCart = order.items.reduce((acc, item) => {
      acc[String(item.product_id)] = Number(item.quantity);
      return acc;
    }, {});
    setCartItems(nextCart);
    navigate("/cart");
  };

  return (
    <div className="container py-5">
      <div className="card p-4 shadow-sm">
        <h2 className="mb-2">My Orders</h2>
        <p className="text-muted">Search your order history using email or phone number.</p>

        <form onSubmit={onSearch} className="row g-2">
          <div className="col-md-5">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="col-md-2 d-grid">
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? "Searching..." : "Find Orders"}
            </button>
          </div>
        </form>

        {error && <p className="text-danger mt-3 mb-0">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-muted mt-3 mb-0">No orders yet. Search after placing your first order.</p>
        )}

        <div className="mt-4 d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order.id} className="my-order-card">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <h5 className="mb-1">Order #{order.id}</h5>
                  <p className="mb-0 text-muted">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-end">
                  <p className="mb-1">
                    <strong>Status:</strong>{" "}
                    <span className={getStatusClass(order.payment_status)}>
                      {order.payment_status}
                    </span>
                  </p>
                  <p className="mb-1">
                    <strong>Payment:</strong> {order.payment_method}
                  </p>
                  <p className="mb-0">
                    <strong>Total:</strong> Rs {order.total_amount}
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={`${order.id}-${item.product_id}-${index}`}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>Rs {item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleReorder(order)}
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
