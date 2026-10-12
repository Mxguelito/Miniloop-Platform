import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

import "./styles/variables.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/utilities.css";
import "./styles/components/button.css";
import "./styles/components/form-field.css";
import "./styles/components/card.css";
import "./styles/components/page-container.css";
import "./styles/components/page-header.css";
import "./styles/components/empty-state.css";
import "./styles/components/loading-state.css";
import "./styles/components/status-badge.css";
import "./styles/components/product.css";
import "./styles/components/cart.css";
import "./styles/components/orders.css";
import "./styles/components/feedback.css";
import "./styles/components/merchant-orders.css";
import "./styles/components/order-detail.css";
import "./styles/components/order-cancel.css";
import "./styles/components/merchant-order-detail.css";
import "./styles/components/auth.css";
import "./styles/components/dashboard.css";
import "./styles/components/game-menu-card.css";
import "./styles/components/commerce.css";
import "./styles/components/merchant-dashboard.css";
import "./styles/components/merchant-products.css";
import "./styles/components/landing.css";
import "./styles/components/consortium.css";
import "./styles/components/delivery.css";



createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <App />
  </StrictMode>
);