import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../contaxt/StoreContext";
import { API_BASE_URL, QR_CODE_IMAGE_URL, UPI_ID, UPI_NAME } from "../config/api";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phone: "",
};

const Order = () => {
  const { getTotalAmount, cartItems, food_list, setCartItems } =
    useContext(StoreContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [showQrPayment, setShowQrPayment] = useState(false);

  const totalAmount = useMemo(() => getTotalAmount(), [cartItems, getTotalAmount]);
  const cartSummary = useMemo(
    () =>
      food_list
        .filter((item) => (cartItems[item._id] || 0) > 0)
        .map((item) => ({
          id: item._id,
          name: item.name,
          quantity: cartItems[item._id],
          price: item.price,
        })),
    [cartItems, food_list]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () =>
    Object.values(formData).every((value) => String(value).trim().length > 0);

  const buildOrderPayload = () => ({
    customer: formData,
    items: cartSummary,
    totalAmount,
  });

  const clearCartAndRedirect = () => {
    setCartItems({});
    navigate("/");
  };

  const placeCodOrder = async () => {
    if (!isFormValid()) {
      alert("Please fill all delivery fields.");
      return;
    }
    if (cartSummary.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/cod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderPayload()),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "COD order failed");
      }

      alert(`Order placed successfully. Order ID: ${data.orderId}`);
      clearCartAndRedirect();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const placeQrOrder = async () => {
    if (!isFormValid()) {
      alert("Please fill all delivery fields.");
      return;
    }
    if (cartSummary.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderPayload()),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "QR order failed");
      }

      alert(
        `Order placed with QR payment request. Order ID: ${data.orderId}. Payment status is pending until confirmed.`
      );
      setShowQrPayment(false);
      clearCartAndRedirect();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const placeOnlineOrder = async () => {
    if (!isFormValid()) {
      alert("Please fill all delivery fields.");
      return;
    }
    if (cartSummary.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay checkout.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderPayload()),
      });
      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.message || "Could not initiate online payment");
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Yummy Bakery",
        description: "Bakery Order Payment",
        order_id: orderData.razorpayOrderId,
        handler: async (paymentResponse) => {
          const verifyResponse = await fetch(
            `${API_BASE_URL}/api/orders/razorpay/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentResponse,
                localOrderId: orderData.localOrderId,
              }),
            }
          );

          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok) {
            alert(verifyData.message || "Payment verification failed.");
            return;
          }

          alert(`Payment successful. Order ID: ${verifyData.orderId}`);
          clearCartAndRedirect();
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#b53737",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col-lg-7">
          <h3 className="text-center mb-3">Delivery Information</h3>
          <form>
            <div className="row">
              <div className="col-md-6 my-2">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="form-control"
                  value={formData.firstName}
                  onChange={onChange}
                />
              </div>
              <div className="col-md-6 my-2">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="form-control"
                  value={formData.lastName}
                  onChange={onChange}
                />
              </div>
            </div>
            <div className="my-2">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="form-control"
                value={formData.email}
                onChange={onChange}
              />
            </div>
            <div className="my-2">
              <input
                type="text"
                name="street"
                placeholder="Street"
                className="form-control"
                value={formData.street}
                onChange={onChange}
              />
            </div>
            <div className="row">
              <div className="col-md-4 my-2">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="form-control"
                  value={formData.city}
                  onChange={onChange}
                />
              </div>
              <div className="col-md-4 my-2">
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  className="form-control"
                  value={formData.state}
                  onChange={onChange}
                />
              </div>
              <div className="col-md-4 my-2">
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  className="form-control"
                  value={formData.zipCode}
                  onChange={onChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 my-2">
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  className="form-control"
                  value={formData.country}
                  onChange={onChange}
                />
              </div>
              <div className="col-md-6 my-2">
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={onChange}
                />
              </div>
            </div>
          </form>
        </div>
        <div className="col-lg-5">
          <div className="card p-3 mt-4">
            <h4>Payment Summary</h4>
            <p className="mb-1">Items: {cartSummary.length}</p>
            <p className="mb-3 fw-bold">Total: Rs {totalAmount}</p>
            <button
              type="button"
              className="btn btn-danger mb-2"
              onClick={placeOnlineOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "PAY ONLINE"}
            </button>
            <button
              type="button"
              className="btn btn-warning mb-2 text-dark fw-bold"
              onClick={() => setShowQrPayment((prev) => !prev)}
              disabled={loading}
            >
              {showQrPayment ? "HIDE QR PAYMENT" : "PAY VIA QR CODE"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={placeCodOrder}
              disabled={loading}
            >
              PLACE ORDER (COD)
            </button>

            {showQrPayment && (
              <div className="qr-payment-card mt-3">
                <h6 className="mb-2">Scan and Pay</h6>
                <img
                  src={QR_CODE_IMAGE_URL}
                  alt="UPI QR Code"
                  className="qr-payment-image mb-2"
                />
                <p className="mb-1">
                  <strong>UPI ID:</strong> {UPI_ID}
                </p>
                <p className="mb-3">
                  <strong>Name:</strong> {UPI_NAME}
                </p>
                <a
                  href={`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
                    UPI_NAME
                  )}&am=${encodeURIComponent(totalAmount)}&cu=INR`}
                  className="btn btn-sm btn-outline-danger mb-2"
                >
                  Open UPI App
                </a>
                <button
                  type="button"
                  className="btn btn-danger w-100"
                  onClick={placeQrOrder}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "I HAVE PAID, PLACE ORDER"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
