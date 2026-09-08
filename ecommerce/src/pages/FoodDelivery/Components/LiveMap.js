import React, { useState, useEffect } from "react";
import { FaStore, FaHome, FaMotorcycle, FaPlus, FaMinus, FaLayerGroup } from "react-icons/fa";

/**
 * High-performance Interactive Vector Mapping Component
 * Supports:
 * - Single Order Tracking (Customer / Driver / Restaurant)
 * - Fleet Overview (Admin with multiple drivers, restaurants & orders)
 */
export default function LiveMap({
  order,
  allDrivers = [],
  allRestaurants = [],
  mode = "ORDER_TRACK", // "ORDER_TRACK" | "FLEET_OVERVIEW"
  height = "100%",
  onSelectDriver = null
}) {
  const [zoom, setZoom] = useState(1);
  const [activeLayer, setActiveLayer] = useState("streets"); // "streets" | "satellite"
  const [selectedPin, setSelectedPin] = useState(null);
  const [simulatedProgress, setSimulatedProgress] = useState(35);

  // Animate driver marker along route when order is active
  useEffect(() => {
    if (mode === "ORDER_TRACK" && order && (order.orderStatus === "PICKED_UP" || order.orderStatus === "ON_THE_WAY")) {
      const interval = setInterval(() => {
        setSimulatedProgress((prev) => (prev >= 92 ? 20 : prev + 1.2));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [mode, order]);

  // Coordinate projection mapping for Mumbai demo region
  const getNormalizedPoint = (lat, lng) => {
    const minLat = 18.98;
    const maxLat = 19.20;
    const minLng = 72.80;
    const maxLng = 72.93;

    const x = Math.max(8, Math.min(92, ((lng - minLng) / (maxLng - minLng)) * 100));
    const y = Math.max(8, Math.min(92, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  const restPt = order
    ? getNormalizedPoint(order.restaurantLat || 19.0596, order.restaurantLng || 72.8295)
    : { x: 35, y: 45 };

  const custPt = order
    ? getNormalizedPoint(order.customerLat || 19.0689, order.customerLng || 72.8210)
    : { x: 65, y: 70 };

  // Calculate interpolated driver location along curved bezier route
  const t = simulatedProgress / 100;
  const cx = (restPt.x + custPt.x) / 2 + 15;
  const cy = (restPt.y + custPt.y) / 2 - 10;
  const driverX = (1 - t) * (1 - t) * restPt.x + 2 * (1 - t) * t * cx + t * t * custPt.x;
  const driverY = (1 - t) * (1 - t) * restPt.y + 2 * (1 - t) * t * cy + t * t * custPt.y;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        minHeight: "360px",
        background: activeLayer === "streets" ? "#0f172a" : "#090d16",
        borderRadius: "inherit",
        overflow: "hidden",
        userSelect: "none"
      }}
    >
      {/* SVG Map Canvas */}
      <svg
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
          transition: "transform 0.3s ease"
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5200" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* City Grid & Roads */}
        <g stroke="#1e293b" strokeWidth="0.4">
          <line x1="0" y1="20" x2="100" y2="20" />
          <line x1="0" y1="40" x2="100" y2="40" />
          <line x1="0" y1="60" x2="100" y2="60" />
          <line x1="0" y1="80" x2="100" y2="80" />
          <line x1="20" y1="0" x2="20" y2="100" />
          <line x1="40" y1="0" x2="40" y2="100" />
          <line x1="60" y1="0" x2="60" y2="100" />
          <line x1="80" y1="0" x2="80" y2="100" />
        </g>

        {/* Arterial Highways */}
        <g stroke="#334155" strokeWidth="1.2" strokeLinecap="round">
          <path d="M 0,25 Q 40,35 70,80 T 100,95" fill="none" />
          <path d="M 25,0 Q 30,50 60,60 T 90,100" fill="none" />
          <path d="M 10,85 Q 50,45 85,25 T 100,10" fill="none" />
        </g>

        {/* Coastal / Sea Feature */}
        <path
          d="M 0,0 L 15,0 Q 18,50 10,100 L 0,100 Z"
          fill="#0c4a6e"
          opacity="0.3"
        />

        {/* Single Order Route Polyline */}
        {mode === "ORDER_TRACK" && (
          <>
            <path
              d={`M ${restPt.x},${restPt.y} Q ${cx},${cy} ${custPt.x},${custPt.y}`}
              fill="none"
              stroke="#000"
              strokeWidth="2.8"
              opacity="0.4"
            />
            <path
              d={`M ${restPt.x},${restPt.y} Q ${cx},${cy} ${custPt.x},${custPt.y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="2"
              strokeDasharray="3,1.5"
              filter="url(#glow)"
            />
          </>
        )}
      </svg>

      {/* Mode 1: Single Order Interactive Pin Layer */}
      {mode === "ORDER_TRACK" && (
        <>
          {/* Restaurant Marker */}
          <div
            style={{
              position: "absolute",
              left: `${restPt.x}%`,
              top: `${restPt.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              cursor: "pointer"
            }}
            onClick={() => setSelectedPin({ title: order?.restaurantName || "Restaurant", type: "Store" })}
          >
            <div
              style={{
                background: "#ff5200",
                color: "#fff",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(255, 82, 0, 0.6)",
                border: "2px solid #fff"
              }}
            >
              <FaStore size={16} />
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                marginTop: "4px"
              }}
            >
              {order?.restaurantName || "Restaurant"}
            </div>
          </div>

          {/* Customer Drop Location Marker */}
          <div
            style={{
              position: "absolute",
              left: `${custPt.x}%`,
              top: `${custPt.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              cursor: "pointer"
            }}
            onClick={() => setSelectedPin({ title: order?.customerName || "Customer Drop", type: "Customer" })}
          >
            <div
              style={{
                background: "#3b82f6",
                color: "#fff",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.6)",
                border: "2px solid #fff"
              }}
            >
              <FaHome size={16} />
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                marginTop: "4px"
              }}
            >
              {order?.customerName || "Customer"}
            </div>
          </div>

          {/* Live Delivery Partner Animated Marker */}
          {order?.deliveryPartnerId && (
            <div
              style={{
                position: "absolute",
                left: `${driverX}%`,
                top: `${driverY}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 15,
                transition: "left 0.8s ease, top 0.8s ease",
                cursor: "pointer"
              }}
              onClick={() => setSelectedPin({ title: order.driverName, type: "Driver", info: order.driverVehicle })}
            >
              <div
                style={{
                  position: "relative",
                  background: "#10b981",
                  color: "#fff",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.8)",
                  border: "2.5px solid #fff"
                }}
              >
                <FaMotorcycle size={18} />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#10b981",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  marginTop: "4px"
                }}
              >
                🛵 {order.driverName}
              </div>
            </div>
          )}
        </>
      )}

      {/* Mode 2: Admin Fleet Overview Layer */}
      {mode === "FLEET_OVERVIEW" && (
        <>
          {allRestaurants.map((r) => {
            const pt = getNormalizedPoint(r.lat, r.lng);
            return (
              <div
                key={r.id}
                style={{
                  position: "absolute",
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 8,
                  cursor: "pointer"
                }}
                onClick={() => setSelectedPin({ title: r.name, type: "Restaurant", info: r.address })}
              >
                <div
                  style={{
                    background: "#ff5200",
                    color: "#fff",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                  }}
                >
                  <FaStore size={12} />
                </div>
              </div>
            );
          })}

          {allDrivers.map((d) => {
            const pt = getNormalizedPoint(d.lat, d.lng);
            const isOnline = d.status === "ONLINE";
            const isBusy = d.status === "BUSY" || d.status === "ON_DELIVERY";
            const color = isBusy ? "#ef4444" : isOnline ? "#10b981" : "#64748b";

            return (
              <div
                key={d.id}
                style={{
                  position: "absolute",
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 12,
                  cursor: "pointer"
                }}
                onClick={() => {
                  setSelectedPin({
                    title: d.name,
                    type: `Driver (${d.status})`,
                    info: `${d.vehicleType} • Rating: ${d.rating} ⭐ • ₹${d.todayEarnings} today`
                  });
                  if (onSelectDriver) onSelectDriver(d);
                }}
              >
                <div
                  style={{
                    background: color,
                    color: "#fff",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 12px ${color}`,
                    border: "2px solid #fff"
                  }}
                >
                  <FaMotorcycle size={14} />
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Interactive HUD Overlay for Order Tracking */}
      {mode === "ORDER_TRACK" && order && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            right: "16px",
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "12px 18px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
              Live Telemetry
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#10b981" }}>
              {order.orderStatus === "DELIVERED"
                ? "Delivered"
                : order.orderStatus === "PICKED_UP" || order.orderStatus === "ON_THE_WAY"
                ? "En Route (~14 mins remaining)"
                : order.orderStatus === "DRIVER_AT_RESTAURANT"
                ? "Driver at Restaurant"
                : "Awaiting Driver Dispatch"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Distance</div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{order.distanceKm || 3.2} km</div>
          </div>
        </div>
      )}

      {/* Selected Pin Popup Card */}
      {selectedPin && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--food-primary)",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#fff",
            maxWidth: "260px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 20
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--food-primary)", fontWeight: 800, textTransform: "uppercase" }}>
              {selectedPin.type}
            </span>
            <button
              onClick={() => setSelectedPin(null)}
              style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>
          <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px" }}>{selectedPin.title}</h4>
          {selectedPin.info && <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>{selectedPin.info}</p>}
        </div>
      )}

      {/* Map Control Buttons */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 20
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.2))}
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#fff",
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Zoom In"
        >
          <FaPlus size={12} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#fff",
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Zoom Out"
        >
          <FaMinus size={12} />
        </button>
        <button
          onClick={() => setActiveLayer((l) => (l === "streets" ? "satellite" : "streets"))}
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#fff",
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Toggle Layer"
        >
          <FaLayerGroup size={12} />
        </button>
      </div>
    </div>
  );
}
