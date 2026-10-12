import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  listarMisPedidos,
  listarMisComercios,
  listarPedidosComercio,
  type Pedido,
} from "../services/api";

import PageContainer from "../components/ui/PageContainer";
import GameMenuCard from "../components/dashboard/GameMenuCard";
import comprar3d from "../assets/dashboard/comprar-3d.png";
import pedidos3d from "../assets/dashboard/pedidos-3d.png";
import consorcio3d from "../assets/dashboard/consorcio-3d.png";
import delivery3d from "../assets/dashboard/delivery-3d.png";

function DashboardPage() {
  const navigate = useNavigate();

  const [pedidosActivos, setPedidosActivos] =
  useState<Pedido[]>([]);

  const [pedidosComercioActivos, setPedidosComercioActivos] =
  useState(0);



  useEffect(() => {
  const cargarPedidosActivos = async () => {
    try {
      const pedidos = await listarMisPedidos();

      const activos = pedidos.filter(
        (pedido) =>
          pedido.estado !== "ENTREGADO" &&
          pedido.estado !== "CANCELADO"
      );

      setPedidosActivos(activos);
    } catch {
      setPedidosActivos([]);
    }
  };

  cargarPedidosActivos();
}, []);

useEffect(() => {
  let activo = true;

  const cargarPedidosComercios = async () => {
    try {
      const comercios = await listarMisComercios();

      const resultados = await Promise.all(
        comercios.map((comercio) =>
          listarPedidosComercio(comercio.id)
        )
      );

      const cantidad = resultados
        .flat()
        .filter(
          (pedido) =>
            pedido.estado === "PENDIENTE" ||
            pedido.estado === "PREPARANDO"
        ).length;

      if (activo) {
        setPedidosComercioActivos(cantidad);
      }
    } catch (error) {
      console.error("Error al cargar pedidos de comercios:", error);
    }
  };

  cargarPedidosComercios();

  const intervalo = window.setInterval(
    cargarPedidosComercios,
    15000
  );

  return () => {
    activo = false;
    window.clearInterval(intervalo);
  };
}, []);

  const cerrarSesion = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");

    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <PageContainer>
        {/* =========================
            MARCA
        ========================= */}
        <header className="dashboard-header">
          <div>
            <span className="dashboard-brand">
              MINILOOP
            </span>

            <h1 className="dashboard-title">
              Tu barrio, más cerca.
            </h1>

            <p className="dashboard-description">
              Comprá, pedí y conectate con los
              servicios de tu comunidad.
            </p>
          </div>
        </header>

        {/* =========================
            ACCIONES PRINCIPALES
        ========================= */}
        <section className="dashboard-section">
          <h2>¿Qué necesitás hoy?</h2>

          <div className="dashboard-grid">
            <GameMenuCard
  title="COMPRAR"
  description="Encontrá productos y comercios cerca"
  badge={pedidosComercioActivos}
  icon={
    <img
      src={comprar3d}
      alt=""
      className="game-menu-card__image"
    />
  }
  variant="blue"
  onClick={() => navigate("/comercios")}
/>

            <GameMenuCard
  title="MIS PEDIDOS"
  description="Revisá y seguí tus compras"
  badge={pedidosActivos.length}
  icon={
    <img
      src={pedidos3d}
      alt=""
      className="game-menu-card__image"
    />
  }
  variant="orange"
  onClick={() => navigate("/mis-pedidos")}
/>

           <GameMenuCard
  title="CONSORCIO"
  description="Información y servicios de tu comunidad"
  icon={
    <img
      src={consorcio3d}
      alt=""
      className="game-menu-card__image"
    />
  }
  variant="green"
  onClick={() => navigate("/consorcios")}
/>

         {/* DELIVERY */}
<GameMenuCard
  title="DELIVERY"
  description="Repartí pedidos y generá ganancias"
  icon={
    <img
      src={delivery3d}
      alt=""
      className="game-menu-card__image"
    />
  }
  variant="purple"
  onClick={() => navigate("/delivery")}
/>
          </div>
        </section>

        {/* =========================
            ACCIONES DE CUENTA
        ========================= */}
        <footer className="dashboard-footer">
          <button
  className="ui-button ui-button--secondary dashboard-account-button"
  onClick={() => navigate("/perfil")}
>
  <span className="dashboard-account-button__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5" />
    </svg>
  </span>

  <span>Mi perfil</span>
</button>

          <button
  className="ui-button ui-button--secondary dashboard-account-button dashboard-account-button--logout"
  onClick={cerrarSesion}
>
  <span className="dashboard-account-button__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24">
      <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  </span>

  <span>Cerrar sesión</span>
</button>
        </footer>
      </PageContainer>
    </div>
  );
}

export default DashboardPage;