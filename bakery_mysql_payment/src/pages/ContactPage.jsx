import React, { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    alert("Thank you. We will contact you shortly.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-5">
          <h2>Contact Us</h2>
          <p className="text-muted">Have questions or custom cake requests? Reach out anytime.</p>
          <div className="contact-info-box">
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Email:</strong> support@yummybakery.com</p>
            <p><strong>Address:</strong> MG Road, Bengaluru, India</p>
            <p className="mb-0"><strong>Hours:</strong> Mon-Sun, 8:00 AM - 10:00 PM</p>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card p-4 shadow-sm">
            <h4 className="mb-3">Send a Message</h4>
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  name="message"
                  rows="5"
                  className="form-control"
                  placeholder="Write your message"
                  value={formData.message}
                  onChange={onChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
