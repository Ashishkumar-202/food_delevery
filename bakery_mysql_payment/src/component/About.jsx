import React from "react";
import { Assets } from "../assets/Assets";

const About = () => (
  <section className="about-section">
    <div className="about-section-inner">
      <div className="about-visual">
        <img src={Assets.img3} alt="Warm bakery shelves filled with fresh bread" />
        <div className="about-image-caption">
          <span className="about-caption-mark">Y</span>
          <div><strong>A neighborhood favorite</strong><small>Fresh batches, every day</small></div>
        </div>
      </div>
      <div className="about-copy">
        <p className="section-eyebrow">A LITTLE ABOUT US</p>
        <h2>Good things take time.<br />Great bakes take <span>butter.</span></h2>
        <p className="about-description">
          We make the kind of treats that bring everyone to the table: honest ingredients,
          familiar flavors, and a little extra care in every batch. Pick up a favorite or
          discover something new from our menu.
        </p>
        <div className="about-highlights">
          <div><span>01</span><strong>Baked fresh daily</strong><small>Made in small batches</small></div>
          <div><span>02</span><strong>Simple ingredients</strong><small>Good things, no fuss</small></div>
          <div><span>03</span><strong>Made for sharing</strong><small>A treat for every table</small></div>
        </div>
      </div>
    </div>
  </section>
);

export default About;
