import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_KEY) {
  console.error('Stripe publishable key is missing. Please check your .env file.');
}

const stripePromise = loadStripe(STRIPE_KEY || '');

const StripeWrapper = ({ children }) => {
  const options = {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      },
    ],
  };

  if (!STRIPE_KEY) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: Stripe key not found. Please check your environment configuration.
      </div>
    );
  }

  return <Elements stripe={stripePromise} options={options}>{children}</Elements>;
};

export default StripeWrapper; 