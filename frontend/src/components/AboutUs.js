import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaLeaf,
  FaSeedling,
  FaComments,
  FaBoxOpen,
  FaTint,
  FaUtensils,
  FaWind,
  FaRecycle,
} from "react-icons/fa";
import farm from "../images/cocofarm.jpg";
import coconut from "../images/pexels-chevanon-1108115.jpg";
import api from "../api";
import { Stars, initials } from "./UI";

const categories = [
  {
    number: "01",
    icon: FaTint,
    name: "Coconut oil",
    text: "An everyday coconut essential.",
    product: "Coconut Oil",
  },
  {
    number: "02",
    icon: FaUtensils,
    name: "Milk & powder",
    text: "Coconut goodness for the kitchen.",
    product: "Coconut Milk Powder",
  },
  {
    number: "03",
    icon: FaWind,
    name: "Coir & fibre",
    text: "Discover the possibilities of husk and rope.",
    product: "Fiber rope",
  },
  {
    number: "04",
    icon: FaRecycle,
    name: "Shell creations",
    text: "Cups, spoons, charcoal, and more.",
    product: "Coconut Shell Cups",
  },
];
const values = [
  {
    icon: FaSeedling,
    title: "Rooted in coconut",
    text: "A dedicated space for coconut and coconut-based products, from kitchen essentials to shell and fibre.",
  },
  {
    icon: FaBoxOpen,
    title: "Connected by purpose",
    text: "Bringing customers, suppliers, sellers, and business processes into a shared digital experience.",
  },
  {
    icon: FaComments,
    title: "Shaped by your voice",
    text: "Product ratings and customer feedback help make every interaction more informed.",
  },
];

export default function AboutUs() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    let active = true;
    api
      .get("/feedback/")
      .then((res) => {
        if (active)
          setReviews(
            [...res.data]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 3),
          );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="hero page-container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> Naturally connected
          </p>
          <h1>
            A world of coconut.
            <br />
            <span>
              A little closer
              <br className="desktop-break" /> to you.
            </span>
          </h1>
          <p>
            From everyday essentials to thoughtful creations, discover the
            possibilities of coconut. Welcome to a community that grows
            together.
          </p>
          <div className="button-row">
            <a href="#products" className="btn btn-primary">
              Explore our products <FaArrowRight />
            </a>
            <Link to="/feedback" className="text-link">
              Hear from our community <FaArrowRight />
            </Link>
          </div>
          <div className="hero-footnote">
            <FaLeaf />
            <span>Coconut products. Meaningful connections.</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-image"
            src={coconut}
            alt="An aerial view of a lush coconut plantation"
            fetchPriority="high"
          />
          <span className="image-label">
            NATURE'S POSSIBILITIES, ALL IN ONE PLACE
          </span>
          <div className="hero-image-card">
            <span className="round-icon">
              <FaSeedling />
            </span>
            <div>
              <strong>From the ground up.</strong>
              <p>Inspired by the versatility of coconut.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="brand-strip">
        <div className="page-container">
          <span>
            <FaLeaf /> Inspired by nature
          </span>
          <span>
            <FaBoxOpen /> Coconut-based products
          </span>
          <span>
            <FaComments /> Community at the heart
          </span>
          <span>
            <FaSeedling /> Room for a better tomorrow
          </span>
        </div>
      </div>
      <section id="products" className="page-container section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Goodness in every form</p>
            <h2>One coconut. So many possibilities.</h2>
          </div>
          <p>
            Get to know the product range.
            <br />
            Explore what our customers are saying.
          </p>
        </div>
        <div className="category-grid">
          {categories.map(({ icon: Icon, ...category }) => (
            <Link
              key={category.name}
              to={`/feedback?product=${encodeURIComponent(category.product)}`}
              className="category-card"
            >
              <div className="category-top">
                <span className="round-icon">
                  <Icon />
                </span>
                <span>{category.number}</span>
              </div>
              <h3>{category.name}</h3>
              <p>{category.text}</p>
              <span className="category-link">
                Explore feedback <FaArrowRight />
              </span>
            </Link>
          ))}
        </div>
        <p className="section-caption">
          Product previews introduce our range. Follow a category to read
          related customer feedback.
        </p>
      </section>
      <section className="mission-section">
        <div className="page-container mission-grid">
          <div className="mission-image">
            <img
              src={farm}
              alt="Sunlight falling through a coconut plantation"
              loading="lazy"
            />
            <span>
              <FaLeaf /> ROOTED IN POSSIBILITY
            </span>
          </div>
          <div className="mission-copy">
            <p className="eyebrow">Our story. Our purpose.</p>
            <h2>
              More than a product.
              <br />A connection that grows.
            </h2>
            <p>
              CocoHub is a coconut and coconut-based products management
              platform. We bring people and business processes together, making
              it easier to connect with the world of coconut.
            </p>
            <p>
              Our mission is to support the industry's digital transformation
              through clearer product information, simpler account management,
              and a place where every customer's voice can be heard.
            </p>
            <div className="mission-note">
              <FaSeedling />
              <p>
                We see potential in every part of the coconut, and in the people
                who bring it to life.
              </p>
            </div>
            <Link to="/signup" className="text-link">
              Become part of CocoHub <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="page-container section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The CocoHub approach</p>
            <h2>Thoughtful by nature.</h2>
          </div>
        </div>
        <div className="values-grid">
          {values.map(({ icon: Icon, title, text }) => (
            <article className="value-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="community-section">
        <div className="page-container section-space">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Real experiences. Shared openly.</p>
              <h2>Our community has a voice.</h2>
            </div>
            <Link className="text-link" to="/feedback">
              View all feedback <FaArrowRight />
            </Link>
          </div>
          {reviews.length ? (
            <div className="preview-grid">
              {reviews.map((review) => (
                <article className="review-preview" key={review._id}>
                  <Stars value={review.rating} />
                  <blockquote>“{review.comment}”</blockquote>
                  <div className="customer-line">
                    <span className="customer-avatar">
                      {initials(review.customerName)}
                    </span>
                    <div>
                      <strong>{review.customerName}</strong>
                      <small>{review.productItem}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="community-invite">
              <FaComments />
              <div>
                <h3>Every experience has something to teach us.</h3>
                <p>
                  Read customer feedback or share your own experience with
                  CocoHub.
                </p>
              </div>
              <Link to="/add" className="btn btn-secondary">
                Write a review <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>
      <section className="page-container closing-wrap">
        <div className="closing-cta">
          <div>
            <p className="eyebrow">Let's grow something good</p>
            <h2>
              Your next connection
              <br />
              starts here.
            </h2>
            <p>Join CocoHub and be part of the conversation.</p>
          </div>
          <Link to="/signup" className="btn btn-cream">
            Create your account <FaArrowRight />
          </Link>
          <FaLeaf className="cta-leaf" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
