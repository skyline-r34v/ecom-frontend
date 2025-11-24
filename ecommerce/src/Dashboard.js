import React from "react";

const Dashboard = () => {
  const name = localStorage.getItem("userName");

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome, {name} 👋</h1>
      <p>You have successfully logged in.</p>
    </div>
  );
};

export default Dashboard;
