import React from "react";
import About from "../component/About";

const AboutPage = () => {
  return (
    <div className="py-4">
      <About />
      <div className="container mt-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card p-3 h-100 feature-card">
              <h5>Fresh Everyday</h5>
              <p className="mb-0">All bakery items are prepared fresh daily for better taste and quality.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100 feature-card">
              <h5>Fast Delivery</h5>
              <p className="mb-0">Quick order processing and timely delivery with live order tracking support.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100 feature-card">
              <h5>Secure Payments</h5>
              <p className="mb-0">Supports Cash on Delivery and Razorpay online payment for flexible checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
