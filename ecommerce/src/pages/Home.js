import React from "react";
import Navbar from "../components/Navbar";
import useAppStore from "../store/appStore";
import "../styles/home.css";
import ShopHome from "./HomeComponents/ShopHome";
import FoodHome from "./HomeComponents/FoodHome";

export default function Home() {
  const appMode = useAppStore((state) => state.appMode);

  return (
    <div className={`d2c-home ${appMode === "FOOD" ? "mode-food" : "mode-shop"}`}>
      <Navbar />
      <div className="mode-transition-wrapper">
        {appMode === "SHOP" ? <ShopHome /> : <FoodHome />}
      </div>
    </div>
  );
}
