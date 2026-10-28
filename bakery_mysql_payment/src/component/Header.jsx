import React from "react";
import { Link } from "react-router-dom";
import { RiArrowRightLine, RiStarFill } from "react-icons/ri";
import { Assets } from "../assets/Assets";

const Header = () => (
  <header className="home-hero">
    <div className="home-hero-inner">
      <div className="home-hero-copy">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" /> Fresh from the oven, every day
        </div>
        <h1>
          A little joy in <span>every bite.</span>
        </h1>
        <p className="home-hero-description">
          Small-batch bakes, buttery pastries, and warm treats made fresh each morning.
          Find a new favorite and let us make your day a little sweeter.
        </p>
        <div className="home-hero-actions">
          <Link className="hero-primary-button" to="/menu">
            Order fresh bakes <RiArrowRightLine aria-hidden="true" />
          </Link>
          <Link className="hero-secondary-link" to="/about">Meet our bakery</Link>
        </div>
        <div className="hero-social-proof">
          <span className="hero-stars" aria-label="5 star bakery">
            <RiStarFill /><RiStarFill /><RiStarFill /><RiStarFill /><RiStarFill />
          </span>
          <span>Made fresh · Packed with care · Shared with love</span>
        </div>
      </div>

      <div className="home-hero-visual">
        <img src={Assets.img1} alt="Fresh pastries displayed at the bakery" />
        <div className="hero-photo-label">
          <span>Freshly baked</span>
          <strong>Every single morning</strong>
        </div>
        <div className="hero-floating-note" aria-hidden="true">
          <span>✦</span>
          <div><strong>Made by hand</strong><small>with the good stuff</small></div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
