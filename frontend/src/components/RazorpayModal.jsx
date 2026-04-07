import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const RazorpayModal = ({ isOpen, onClose, amount, onPaymentSuccess, orderId }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inject Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isOpen && orderId) {
      handlePayment();
    }
  }, [isOpen, orderId]);

  const handlePayment = () => {
    if (!window.Razorpay) {
      toast.error('Financial Gateway Synchronization Failed. Check Network.');
      onClose();
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_campus_identity_vault_sync',
      amount: amount,
      currency: "INR",
      name: "BuddyUp Campus Platform",
      description: "Identity Vault Security Top-up",
      order_id: orderId,
      handler: function (response) {
        onPaymentSuccess(response);
      },
      prefill: {
        name: "Campus User",
        email: "sync@buddyup.edu",
        contact: "9999999999"
      },
      theme: {
        color: "#2371ec"
      },
       modal: {
        ondismiss: function() {
          onClose();
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return null; // The modal is handled by Razorpay's own script
};

export default RazorpayModal;
