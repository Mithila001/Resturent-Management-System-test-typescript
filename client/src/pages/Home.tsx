import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext, type User } from "../context/AuthContext";
import "./Home.css";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface PopularDish {
  name: string;
  price: string;
  emoji: string;
}

const Home = () => {
  const { user } = useContext(AuthContext) as { user: User | null };

  const features: Feature[] = [
    {
      icon: "🍕",
      title: "Wide Menu Selection",
      description: "Choose from hundreds of delicious dishes",
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Get your food delivered in 30-45 minutes",
    },
    {
      icon: "⭐",
      title: "Quality Food",
      description: "Fresh ingredients and expert chefs",
    },
    {
      icon: "📱",
      title: "Easy Ordering",
      description: "Order in just a few clicks",
    },
  ];

  const popularDishes: PopularDish[] = [
    { name: "Margherita Pizza", price: "$12.99", emoji: "🍕" },
    { name: "Grilled Chicken", price: "$15.99", emoji: "🍗" },
    { name: "Caesar Salad", price: "$8.99", emoji: "🥗" },
    { name: "Chocolate Cake", price: "$6.99", emoji: "🍰" },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Delicious Food,
              <br />
              <span className="highlight">Delivered To You</span>
            </h1>

            {user ? (
              <div className="user-welcome">
                <p className="welcome-text">
                  Welcome back, <strong>{user.name}</strong>!
                </p>
                <div className="button-group">
                  <Link to="/menu" className="btn btn-primary">
                    Browse Menu
                  </Link>
                  <Link to="/orders" className="btn">
                    My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="btn">
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="guest-cta">
                <p className="hero-subtitle">
                  Order your favorite meals from the best restaurants.
                  <br />
                  Fast delivery. Quality guaranteed.
                </p>
                <div className="button-group">
                  <Link to="/menu" className="btn btn-primary btn-large">
                    Order Now
                  </Link>
                  <Link to="/register" className="btn btn-large">
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section className="popular-section section">
        <div className="container">
          <h2 className="section-title">Popular Dishes</h2>
          <div className="dishes-grid">
            {popularDishes.map((dish, index) => (
              <div key={index} className="dish-card card">
                <div className="dish-emoji">{dish.emoji}</div>
                <h3 className="dish-name">{dish.name}</h3>
                <p className="dish-price">{dish.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/menu" className="btn btn-primary">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Browse Menu</h3>
              <p>Explore our wide selection of delicious dishes</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Add to Cart</h3>
              <p>Select your favorite items and customize</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Checkout</h3>
              <p>Enter delivery address and payment details</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Enjoy!</h3>
              <p>Track your order and enjoy your meal</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="cta-section section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Order?</h2>
              <p>Join thousands of happy customers today!</p>
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
