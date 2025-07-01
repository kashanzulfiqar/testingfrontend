// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  : 'pk_test_your_test_key_here'; // Replace with your test key

export { STRIPE_PUBLISHABLE_KEY }; 