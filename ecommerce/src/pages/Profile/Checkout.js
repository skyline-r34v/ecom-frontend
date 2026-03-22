import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import "../../styles/checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");
  const mobile = localStorage.getItem("mobile");

  /* ===================== HANDLE BOTH FLOWS ===================== */

  const savedData = JSON.parse(localStorage.getItem("checkoutData"));

  const {
    cartItems = [],
    total = 0,
    buyNow = savedData?.buyNow || false,
    product = savedData?.product || null,
    quantity = savedData?.quantity || 1
  } = location.state || {};

  /* ===================== FINAL ITEMS ===================== */

  let finalItems = [];

  if (buyNow && product) {
    finalItems = [
      {
        product,
        quantity
      }
    ];
  } else {
    finalItems = cartItems;
  }

  const finalTotal = finalItems.reduce(
    (sum, item) =>
      sum +
      (item.product?.discountPrice ?? item.product?.price) *
      item.quantity,
    0
  );

  /* ===================== STATE ===================== */

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "",
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false
  });

  const [payment, setPayment] = useState({ method: "COD" });
  const [loadingPayment, setLoadingPayment] = useState(false);

  /* ===================== FETCH ADDRESSES ===================== */

  useEffect(() => {
    if (!userId) return;

    api
      .post("/users/profile", { userId })
      .then((res) => {
        const user = res.data?.data;
        const userAddresses = Array.isArray(user?.addresses)
          ? user.addresses
          : [];

        setAddresses(userAddresses);

        const defaultAddress =
          userAddresses.find((a) => a?.isDefault) || userAddresses[0];

        if (defaultAddress?._id) {
          setSelectedAddressId(defaultAddress._id);
        }
      })
      .catch(console.error);
  }, [userId]);

  /* ===================== HANDLERS ===================== */

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
  };

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNewAddress({
      ...newAddress,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const addNewAddress = async () => {
    try {
      if (!newAddress.label || !newAddress.street || !newAddress.city) {
        return alert("Please fill required fields");
      }

      const updatedAddresses = [...addresses, newAddress];

      const res = await api.post("/users/profile", {
        userId,
        addresses: updatedAddresses
      });

      if (res.data?.success) {
        const updated = res.data.data.addresses;

        setAddresses(updated);

        const addedAddress = updated[updated.length - 1];

        setSelectedAddressId(addedAddress._id);

        setAddingNew(false);

        setNewAddress({
          label: "",
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          isDefault: false
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add address");
    }
  };

  /* ===================== RAZORPAY ===================== */

  const handleRazorpayPayment = async () => {
    try {
      if (!finalItems.length) {
        return alert("No items to checkout");
      }

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Please refresh.");
        return;
      }

      setLoadingPayment(true);

      const selectedAddr = addresses.find(
        (a) => a?._id === selectedAddressId
      );

      if (!selectedAddr) {
        return alert("Please select an address");
      }

      const shippingAddress = {
        ...selectedAddr,
        fullName: userName || selectedAddr.fullName,
        phone: mobile || selectedAddr.phone
      };

      const pickingAddress =
        finalItems?.[0]?.productDetail?.pickUpaddresses ||
        finalItems?.[0]?.product?.detail?.pickUpaddresses ||
        finalItems?.[0]?.pickingAddress ||
        null;

      if (!pickingAddress) {
        return alert("Pickup address missing");
      }

      const { data } = await api.post("/payments/create-order", {
        amount: finalTotal
      });

      const order = data.order;

      const options = {
        key: "rzp_live_SUNPDgjWZkSH6U", // ✅ put your test key
        amount: order.amount,
        currency: "INR",
        name: "OneKart",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/verify-payment", {
              ...response,
              orderData: {
                userId,
                items: finalItems,
                shippingAddress,
                pickingAddress
              }
            });

            if (verifyRes.data.success) {
              alert("Payment successful 🎉");
              localStorage.removeItem("checkoutData");
              navigate("/my-orders");
            } else {
              alert("Payment verification failed");
            }

          } catch (err) {
            console.error(err);
            alert("Verification error");
          }
        },

        prefill: {
          name: userName,
          contact: mobile
        },

        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error(response.error);
        alert("Payment failed ❌");
      });

      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    } finally {
      setLoadingPayment(false);
    }
  };

  /* ===================== PLACE ORDER ===================== */

  const placeOrder = async () => {
    try {
      const selectedAddr = addresses.find(
        (a) => a?._id === selectedAddressId
      );

      if (!selectedAddr) {
        return alert("Please select an address");
      }

      const shippingAddress = {
        ...selectedAddr,
        fullName: userName || selectedAddr.fullName,
        phone: mobile || selectedAddr.phone
      };

      const pickingAddress =
        finalItems?.[0]?.productDetail?.pickUpaddresses ||
        finalItems?.[0]?.product?.detail?.pickUpaddresses ||
        finalItems?.[0]?.pickingAddress ||
        null;

      if (!pickingAddress) {
        return alert("Pickup address missing");
      }

      const res = await api.post("/orders/create", {
        items: finalItems,
        shippingAddress,
        pickingAddress,
        payment
      });

      if (res.data?.success) {
        localStorage.removeItem("checkoutData");
        navigate("/my-orders");
      }
    } catch (error) {
      console.error(error);
      alert("Order failed");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-layout">

        {/* ================= ORDER SUMMARY ================= */}

        <div className="checkout-summary">
          <h3>Order Summary</h3>

          {finalItems.map((item, index) => (
            <div key={item.product?._id || index} className="summary-item">
              <img
                src={item.product?.thumbnail}
                alt={item.product?.title}
              />

              <div className="summary-info">
                <h4>{item.product?.title}</h4>

                <p>₹ {item.product?.discountPrice ?? item.product?.price}</p>
                <p>Qty: {item.quantity}</p>

                <p className="subtotal">
                  ₹
                  {(item.product?.discountPrice ??
                    item.product?.price) * item.quantity}
                </p>
              </div>
            </div>
          ))}

          <div className="summary-total">
            <span>Total</span>
            <span>₹ {finalTotal}</span>
          </div>
        </div>

        {/* ================= ADDRESS + PAYMENT ================= */}

        <div className="checkout-form">

          <h3>Shipping Address</h3>

          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`address-card ${selectedAddressId === addr._id ? "selected" : ""
                }`}
              onClick={() => handleSelectAddress(addr._id)}
            >
              <p><b>{addr.label}</b> | {addr.fullName}</p>
              <p>{addr.street}</p>
              <p>{addr.city}</p>
            </div>
          ))}

          <button
            className="checkout-btn"
            onClick={() => setAddingNew(true)}
          >
            + Add Address
          </button>

          <select
            value={payment.method}
            onChange={(e) =>
              setPayment({ method: e.target.value })
            }
          >
            <option value="COD">COD</option>
            <option value="RAZORPAY">Pay Online</option>
          </select>

          <button
            className="checkout-btn"
            disabled={loadingPayment}
            onClick={() => {
              if (payment.method === "COD") {
                placeOrder();
              } else {
                handleRazorpayPayment();
              }
            }}
          >
            {loadingPayment ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}