import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ComerciosPage from "./pages/comercio/ComerciosPage";
import ComercioDetallePage from "./pages/comercio/ComercioDetallePage";
import MiComercioPage from "./pages/comercio/MiComercioPage";
import ProductosComercioPage from "./pages/comercio/ProductosComercioPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PedidosComercioPage from "./pages/comercio/PedidosComercioPage";
import MisPedidosPage from "./pages/cliente/MisPedidosPage";
import PedidoDetallePage from "./pages/cliente/PedidoDetallePage";
import PedidoComercioDetallePage from "./pages/comercio/PedidoComercioDetallePage";
import CrearConsorcioPage from "./pages/consorcios/CrearConsorcioPage";
import ConsorciosPage from "./pages/consorcios/ConsorciosPage";
import ConsorcioDetallePage from "./pages/consorcios/ConsorcioDetallePage";
import InvitacionesConsorcioPage from "./pages/consorcios/InvitacionesConsorcioPage";
import UnirseConsorcioPage from "./pages/consorcios/UnirseConsorcioPage";
import MiembrosConsorcioPage from "./pages/consorcios/MiembrosConsorcioPage";
import ComunicadosConsorcioPage from "./pages/consorcios/ComunicadosConsorcioPage";
import PerfilPage from "./pages/usuario/PerfilPage";
import EditarPerfilPage from "./pages/usuario/EditarPerfilPage";
import RegistrarGastoPage from "./pages/consorcios/RegistrarGastoPage";
import GastosPage from "./pages/consorcios/GastosPage";
import RegistrarIngresoPage from "./pages/consorcios/RegistrarIngresoPage";
import IngresosPage from "./pages/consorcios/IngresosPage";
import ResumenEconomicoPage from "./pages/consorcios/ResumenEconomicoPage";
import UnidadesPage from "./pages/consorcios/UnidadesPage";
import GenerarLiquidacionPage from "./pages/consorcios/GenerarLiquidacionPage";
import LiquidacionesPage from "./pages/consorcios/LiquidacionesPage";
import LiquidacionDetallePage from "./pages/consorcios/LiquidacionDetallePage";
import ExpensasPage from "./pages/consorcios/ExpensasPage";
import MisExpensasPage from "./pages/consorcios/MisExpensasPage";
import DeliveryPage from "./pages/delivery/DeliveryPage";
import ActivarDeliveryPage from "./pages/delivery/ActivarDeliveryPage";
import DeliveryAdminPage from "./pages/admin/DeliveryAdminPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/registro" element={<RegisterPage />} />

        {/* Privadas */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comercios"
          element={
            <ProtectedRoute>
              <ComerciosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comercios/:id"
          element={
            <ProtectedRoute>
              <ComercioDetallePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-comercios/:id"
          element={
            <ProtectedRoute>
              <MiComercioPage />
            </ProtectedRoute>
          }
        />


        <Route
  path="/mis-comercios/:id/productos"
  element={
    <ProtectedRoute>
      <ProductosComercioPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/mis-comercios/:id/pedidos"
  element={
    <ProtectedRoute>
      <PedidosComercioPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/mis-pedidos"
  element={
    <ProtectedRoute>
      <MisPedidosPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/mis-pedidos/:id"
  element={
    <ProtectedRoute>
      <PedidoDetallePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/mis-comercios/:id/pedidos/:pedidoId"
  element={
    <ProtectedRoute>
      <PedidoComercioDetallePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios/nuevo"
  element={
    <ProtectedRoute>
      <CrearConsorcioPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios"
  element={
    <ProtectedRoute>
      <ConsorciosPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id"
  element={
    <ProtectedRoute>
      <ConsorcioDetallePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/invitaciones"
  element={
    <ProtectedRoute>
      <InvitacionesConsorcioPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/unirse"
  element={
    <ProtectedRoute>
      <UnirseConsorcioPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios/:id/miembros"
  element={
    <ProtectedRoute>
      <MiembrosConsorcioPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/comunicados"
  element={
    <ProtectedRoute>
      <ComunicadosConsorcioPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/perfil"
  element={
    <ProtectedRoute>
      <PerfilPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/perfil/editar"
  element={
    <ProtectedRoute>
      <EditarPerfilPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/gastos/nuevo"
  element={
    <ProtectedRoute>
      <RegistrarGastoPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios/:id/gastos"
  element={
    <ProtectedRoute>
      <GastosPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios/:id/ingresos/nuevo"
  element={
    <ProtectedRoute>
      <RegistrarIngresoPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/ingresos"
  element={
    <ProtectedRoute>
      <IngresosPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios/:id/resumen-economico"
  element={
    <ProtectedRoute>
      <ResumenEconomicoPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/unidades"
  element={
    <ProtectedRoute>
      <UnidadesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios/:id/liquidaciones/nueva"
  element={
    <ProtectedRoute>
      <GenerarLiquidacionPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/liquidaciones"
  element={
    <ProtectedRoute>
      <LiquidacionesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/consorcios/:id/liquidaciones/:liquidacionId"
  element={
    <ProtectedRoute>
      <LiquidacionDetallePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/expensas"
  element={
    <ProtectedRoute>
      <ExpensasPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/consorcios/:id/mis-expensas"
  element={
    <ProtectedRoute>
      <MisExpensasPage />
    </ProtectedRoute>
  }
/>

{/* =========================
    DELIVERY
========================= */}

<Route
  path="/delivery"
  element={
    <ProtectedRoute>
      <DeliveryPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/delivery/activar"
  element={
    <ProtectedRoute>
      <ActivarDeliveryPage />
    </ProtectedRoute>
  }
/>

{/* =========================
    ADMIN DELIVERY
========================= */}

<Route
  path="/admin/delivery"
  element={
    <ProtectedRoute>
      <DeliveryAdminPage />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;