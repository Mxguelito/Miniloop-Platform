const API_URL = "http://127.0.0.1:8000";

function obtenerMensajeError(
  data: unknown,
  mensajePorDefecto: string
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    const detail = (data as { detail?: unknown }).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }

          return "Error de validación";
        })
        .join(". ");
    }
  }

  return mensajePorDefecto;
}

// =========================
// USUARIOS
// =========================

export interface UsuarioCreate {  nombre: string;  email: string;  password: string;}

export interface Usuario {  id: number;  nombre: string;  email: string;  estado: string;}

export async function crearUsuario(  data: UsuarioCreate): Promise<Usuario> {
  const response = await fetch(`${API_URL}/usuarios`,
     {
    method: "POST",
    headers: 
     {
      "Content-Type": "application/json",
     },
    body: JSON.stringify(data),
    });

  if (!response.ok) 
    {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al crear usuario"
    );
   }

  return response.json();
}

// =========================
// OBTENER MI PERFIL
// =========================

export async function obtenerMiPerfil(): Promise<Usuario> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/usuarios/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al cargar tu perfil"
    );
  }

  return response.json();
}

export interface UsuarioUpdate {
  nombre: string;
  email: string;
}

// =========================
// ACTUALIZAR MI PERFIL
// =========================

export async function actualizarMiPerfil(
  data: UsuarioUpdate
): Promise<Usuario> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/usuarios/me`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al actualizar tu perfil"
    );
  }

  return response.json();
}

// =========================
// AUTH
// =========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export async function loginUsuario(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al iniciar sesión"
    );
  }

  return response.json();
}

// =========================
// COMERCIOS
// =========================

export interface Comercio {
  id: number;
  nombre: string;
  categoria: string;
  direccion: string;
  zona_id: number | null;
  estado: string;
  disponibilidad_pedidos: string;
}

export interface ComercioCreate {
  nombre: string;
  categoria: string;
  direccion: string;
  zona_id: number;
}

export async function listarComercios(): Promise<Comercio[]> {
  const response = await fetch(`${API_URL}/comercios`);

  if (!response.ok) {
    throw new Error("Error al obtener los comercios");
  }

  return response.json();
}

export async function listarMisComercios(): Promise<Comercio[]> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(`${API_URL}/comercios/mios`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al obtener tus comercios"
    );
  }

  return response.json();
}

export async function obtenerComercio(
  id: number
): Promise<Comercio> {
  const response = await fetch(`${API_URL}/comercios/${id}`);

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al obtener el comercio"
    );
  }

  return response.json();
}

export async function crearComercio(
  data: ComercioCreate
): Promise<Comercio> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(`${API_URL}/comercios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al crear el comercio"
    );
  }

  return response.json();
}

export interface Producto {
  id: number;
  comercio_id: number;
  nombre: string;
  precio: number;
  stock: number;
  estado: string;
}

export async function listarProductos(
  comercioId: number
): Promise<Producto[]> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/productos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al obtener los productos"
    );
  }

  return response.json();
}
export interface ProductoCreate {
  nombre: string;
  precio: number;
  stock: number;
}

export async function crearProducto(
  comercioId: number,
  data: ProductoCreate
): Promise<Producto> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/productos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al crear el producto"
    );
  }

  return response.json();
}

export interface ProductoUpdate {
  nombre: string;
  precio: number;
  stock: number;
}

export async function actualizarProducto(
  comercioId: number,
  productoId: number,
  data: ProductoUpdate
): Promise<Producto> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/productos/${productoId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al actualizar el producto"
    );
  }

  return response.json();
}

export async function desactivarProducto(
  comercioId: number,
  productoId: number
): Promise<Producto> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/productos/${productoId}/desactivar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al desactivar el producto"
    );
  }

  return response.json();
}

// =========================
// PEDIDOS
// =========================

export interface PedidoItemCreate {
  producto_id: number;
  cantidad: number;
}

export interface PedidoCreate {
  items: PedidoItemCreate[];
  tipo_entrega: "RETIRO" | "DELIVERY";
destino: string | null;
}


// =========================
// DATOS RELACIONADOS
// =========================

export interface UsuarioPedido {
  id: number;
  nombre: string;
}

export interface ComercioPedido {
  id: number;
  nombre: string;
}

export interface ProductoPedido {
  id: number;
  nombre: string;
}


// =========================
// ITEM DEL PEDIDO
// =========================

export interface PedidoItem {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: ProductoPedido;
}


// =========================
// PEDIDO
// =========================

export interface Pedido {
  id: number;

  usuario_id: number;
  comercio_id: number;

  usuario: UsuarioPedido;
  comercio: ComercioPedido;

  estado: string;
  tipo_entrega: string;
  entrega_id: number | null;
  total: number;
  fecha_creacion: string;
}


// =========================
// DETALLE DEL PEDIDO
// =========================

export interface PedidoDetalle extends Pedido {
  items: PedidoItem[];
}


export interface PedidoEstadoUpdate {
  estado: string;
}


// =========================
// CREAR PEDIDO
// =========================

export async function crearPedido(
  comercioId: number,
  data: PedidoCreate
): Promise<Pedido> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/pedidos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al crear el pedido"
    );
  }

  return response.json();
}


// =========================
// CLIENTE - MIS PEDIDOS
// =========================

export async function listarMisPedidos(): Promise<Pedido[]> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/pedidos/mios`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al obtener tus pedidos"
    );
  }

  return response.json();
}


// =========================
// COMERCIO - PEDIDOS RECIBIDOS
// =========================

export async function listarPedidosComercio(
  comercioId: number
): Promise<Pedido[]> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/pedidos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al obtener los pedidos"
    );
  }

  return response.json();
}


// =========================
// COMERCIO - CAMBIAR ESTADO
// =========================

export async function cambiarEstadoPedido(
  pedidoId: number,
  estado: string
): Promise<Pedido> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/pedidos/${pedidoId}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estado,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Error al cambiar el estado del pedido"
    );
  }

  return response.json();
}


// =========================
// CLIENTE - CANCELAR PEDIDO
// =========================

export async function cancelarPedido(
  pedidoId: number
): Promise<Pedido> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/pedidos/${pedidoId}/cancelar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al cancelar el pedido"
    );
  }

  return response.json();
}


// =========================
// CLIENTE - DETALLE PEDIDO
// =========================

export async function obtenerPedido(
  pedidoId: number
): Promise<PedidoDetalle> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/pedidos/${pedidoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al obtener el pedido"
    );
  }

  return response.json();
}


// =========================
// COMERCIO - DETALLE PEDIDO
// =========================

export async function obtenerPedidoComercio(
  comercioId: number,
  pedidoId: number
): Promise<PedidoDetalle> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/pedidos/${pedidoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al obtener el pedido"
    );
  }

  return response.json();
}
// =========================
// CONSORCIOS
// =========================

export interface Consorcio {
  id: number;
  nombre: string;
  direccion: string;
  estado: string;
  rol?: string | null;
}

export interface ConsorcioCreate {
  nombre: string;
  direccion: string;
}


// =========================
// CREAR CONSORCIO
// =========================

export async function crearConsorcio(
  data: ConsorcioCreate
): Promise<Consorcio> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al crear el consorcio"
    );
  }

  return response.json();
}

// =========================
// LISTAR MIS CONSORCIOS
// =========================

export async function listarMisConsorcios(): Promise<Consorcio[]> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios/mios`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al cargar tus consorcios"
    );
  }

  return response.json();
}

// =========================
// OBTENER CONSORCIO
// =========================

export async function obtenerConsorcio(
  id: number
): Promise<Consorcio> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al cargar el consorcio"
    );
  }

  return response.json();
}

// =========================
// INVITACIONES CONSORCIO
// =========================

export interface InvitacionConsorcio {
  id: number;
  consorcio_id: number;
  creada_por: number;
  codigo: string;
  estado: string;
  fecha_creacion: string;
}


// =========================
// GENERAR INVITACIÓN
// =========================

export async function generarInvitacionConsorcio(
  consorcioId: number
): Promise<InvitacionConsorcio> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/invitaciones`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al generar la invitación"
    );
  }

  return response.json();
}

// =========================
// UNIRSE A CONSORCIO
// =========================

export async function unirseAConsorcio(
  codigo: string
): Promise<Consorcio> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios/unirse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No se pudo usar la invitación"
    );
  }

  return response.json();
}

// =========================
// MIEMBROS CONSORCIO
// =========================

export interface MiembroConsorcio {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}



 // =========================
// MIEMBROS CONSORCIO
// =========================

export interface MiembroConsorcio {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  unidad_id: number | null;
}


// =========================
// LISTAR MIEMBROS
// =========================

export async function listarMiembrosConsorcio(
  consorcioId: number
): Promise<MiembroConsorcio[]> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/miembros`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Error al cargar los miembros"
    );
  }

  return response.json();
}


// =========================
// ASIGNAR UNIDAD A MIEMBRO
// =========================

export async function asignarUnidadMiembro(
  consorcioId: number,
  usuarioId: number,
  unidadId: number
) {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/miembros/${usuarioId}/unidad?unidad_id=${unidadId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos asignar la unidad"
    );
  }

  return response.json();
}


// A PARTIR DE ACÁ SIGUE LO QUE YA TENÉS

export interface Comunicado {
  id: number;
  consorcio_id: number;
  autor_id: number;
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
}



export interface Comunicado {
  id: number;
  consorcio_id: number;
  autor_id: number;
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
}

export interface ComunicadoCreate {
  titulo: string;
  mensaje: string;
}

// =========================
// LISTAR COMUNICADOS
// =========================

export async function listarComunicados(
  consorcioId: number
): Promise<Comunicado[]> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/comunicados`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al cargar los comunicados"
    );
  }

  return response.json();
}


// =========================
// PUBLICAR COMUNICADO
// =========================

export async function crearComunicado(
  consorcioId: number,
  data: ComunicadoCreate
): Promise<Comunicado> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/comunicados`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al publicar el comunicado"
    );
  }

  return response.json();
}

// =========================
// GASTOS CONSORCIO
// =========================

export interface Gasto {
  id: number;
  consorcio_id: number;
  concepto: string;
  monto: number;
  fecha: string;
}

export interface GastoCreate {
  concepto: string;
  monto: number;
  fecha: string;
}


// =========================
// REGISTRAR GASTO
// =========================

export async function crearGasto(
  consorcioId: number,
  data: GastoCreate
): Promise<Gasto> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/gastos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Error al registrar el gasto"
    );
  }

  return response.json();
}

export interface Gasto {
  id: number;
  consorcio_id: number;
  concepto: string;
  monto: number;
  fecha: string;
}

// =========================
// GASTOS
// =========================

export async function listarGastos(
  consorcioId: number
): Promise<Gasto[]> {

  const token = localStorage.getItem(
    "access_token"
  );

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/gastos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener los gastos"
    );
  }

  return response.json();
}

// =========================
// INGRESOS CONSORCIO
// =========================

export interface Ingreso {
  id: number;
  consorcio_id: number;
  concepto: string;
  monto: number;
  fecha: string;
}

export interface IngresoCreate {
  concepto: string;
  monto: number;
  fecha: string;
}


// =========================
// REGISTRAR INGRESO
// =========================

export async function crearIngreso(
  consorcioId: number,
  data: IngresoCreate
): Promise<Ingreso> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/ingresos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "Error al registrar el ingreso"
    );
  }

  return response.json();
}


// =========================
// LISTAR INGRESOS
// =========================

export async function listarIngresos(
  consorcioId: number
): Promise<Ingreso[]> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/ingresos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener los ingresos"
    );
  }

  return response.json();
}

// =========================
// RESUMEN ECONÓMICO
// =========================

export interface ResumenEconomico {
  total_ingresos: number;
  total_gastos: number;
  saldo: number;
}


export async function obtenerResumenEconomico(
  consorcioId: number
): Promise<ResumenEconomico> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/resumen-economico`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener el resumen económico"
    );
  }

  return response.json();
}

// =========================
// UNIDADES
// =========================

export interface Unidad {
  id: number;
  consorcio_id: number;
  identificador: string;
  metros_cuadrados: number | null;
}

export interface UnidadCreate {
  identificador: string;
  metros_cuadrados: number | null;
}


// =========================
// CREAR UNIDAD
// =========================

export async function crearUnidad(
  consorcioId: number,
  data: UnidadCreate
): Promise<Unidad> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/unidades`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos crear la unidad"
    );
  }

  return response.json();
}



// =========================
// LISTAR UNIDADES
// =========================

export async function listarUnidades(
  consorcioId: number
): Promise<Unidad[]> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/unidades`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener las unidades"
    );
  }

  return response.json();
}

// =========================
// LIQUIDACIONES
// =========================

export interface Liquidacion {
  id: number;
  consorcio_id: number;
  mes: number;
  anio: number;
  total_gastos: number;
  fecha_generacion: string;
  estado: string;
}

export interface LiquidacionCreate {
  mes: number;
  anio: number;
}


// =========================
// GENERAR LIQUIDACIÓN
// =========================

export async function generarLiquidacion(
  consorcioId: number,
  data: LiquidacionCreate
): Promise<Liquidacion> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/liquidaciones`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos generar la liquidación"
    );
  }

  return response.json();
}

// =========================
// LISTAR LIQUIDACIONES
// =========================

export async function listarLiquidaciones(
  consorcioId: number
): Promise<Liquidacion[]> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/liquidaciones`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener las liquidaciones"
    );
  }

  return response.json();
}

// =========================
// EXPENSAS
// =========================

export interface Expensa {
  id: number;

  liquidacion_id: number | null;

  unidad_id: number;
  unidad_identificador: string;

 

  mes: number | null;
  anio: number | null;

  monto: number;
  estado: string;

  fecha_pago: string | null;
}


// =========================
// COMPROBANTE DE PAGO
// =========================

export interface ComprobantePago {
  comprobante_id: string;

  expensa_id: number;

  consorcio_id: number;
  consorcio_nombre: string;

  unidad_id: number;
  unidad_identificador: string;

  mes: number;
  anio: number;

  monto: number;

  fecha_pago: string;

  estado: string;
}

// =========================
// CREAR EXPENSA
// =========================

export interface ExpensaCreate {
  unidad_id: number;
  mes: number;
  anio: number;
  monto: number;
}


export async function crearExpensa(
  consorcioId: number,
  data: ExpensaCreate
): Promise<Expensa> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/expensas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos crear la expensa"
    );
  }

  return response.json();
}

// =========================
// LISTAR MIS EXPENSAS
// =========================

export async function listarMisExpensas(
  consorcioId: number
): Promise<Expensa[]> {

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/expensas/mias`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          "access_token"
        )}`,
      },
    }
  );

  if (!response.ok) {

    const error = await response.json();

    throw new Error(
      error.detail ||
      "No se pudieron cargar tus expensas"
    );
  }

  return response.json();
}

// =========================
// LISTAR EXPENSAS POR PERÍODO
// =========================

export async function listarExpensas(
  consorcioId: number,
  mes: number,
  anio: number
): Promise<Expensa[]> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/expensas?mes=${mes}&anio=${anio}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener las expensas"
    );
  }

  return response.json();
}
// =========================
// REGISTRAR PAGO DE EXPENSA
// =========================

export async function pagarExpensa(
  consorcioId: number,
  expensaId: number
): Promise<Expensa> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/expensas/${expensaId}/pagar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos registrar el pago"
    );
  }

  return response.json();
}

// =========================
// OBTENER COMPROBANTE DE PAGO
// =========================

export async function obtenerComprobantePago(
  consorcioId: number,
  expensaId: number
): Promise<ComprobantePago> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/expensas/${expensaId}/comprobante`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener el comprobante"
    );
  }

  return response.json();
}

// =========================
// DESCARGAR COMPROBANTE PDF
// =========================

export async function descargarComprobantePagoPdf(
  consorcioId: number,
  expensaId: number
): Promise<void> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/expensas/${expensaId}/comprobante/pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {

    let mensaje =
      "No pudimos descargar el comprobante";

    try {
      const error = await response.json();

      mensaje =
        error.detail || mensaje;

    } catch {
      // La respuesta no era JSON
    }

    throw new Error(mensaje);
  }

  const blob = await response.blob();

  const url =
    window.URL.createObjectURL(blob);

  const enlace =
    document.createElement("a");

  enlace.href = url;

  enlace.download =
    `comprobante-expensa-${expensaId}.pdf`;

  document.body.appendChild(enlace);

  enlace.click();

  enlace.remove();

  window.URL.revokeObjectURL(url);
}

export interface LiquidacionDetalle {
  id: number;
  consorcio_id: number;
  mes: number;
  anio: number;
  total_gastos: number;
  fecha_generacion: string;
  estado: string;
  expensas: Expensa[];
}


// =========================
// OBTENER DETALLE LIQUIDACIÓN
// =========================

export async function obtenerDetalleLiquidacion(
  consorcioId: number,
  liquidacionId: number
): Promise<LiquidacionDetalle> {

  const token = localStorage.getItem(
    "access_token"
  );

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión"
    );
  }

  const response = await fetch(
    `${API_URL}/consorcios/${consorcioId}/liquidaciones/${liquidacionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
      "No pudimos obtener la liquidación"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - REPARTIDOR
// =========================

export interface Repartidor {
  id: number;
  usuario_id: number;
  zona_id: number;
  transporte: string;
  disponibilidad: string;
  estado: string;
}

// =========================
// ESTADÍSTICAS REPARTIDOR
// =========================

export interface EstadisticasRepartidor {
  entregas_completadas: number;
  ganancia_total: number;
  calificacion_promedio: number | null;
  cantidad_calificaciones: number;
  bono_pendiente: number;
}

// =========================
// GANANCIA REPARTIDOR
// =========================

export interface GananciaRepartidor {
  id: number;
  entrega_id: number;
  repartidor_id: number;
  monto: number;
  fecha_creacion: string;
}

// =========================
// INCIDENCIA DELIVERY ADMIN
// =========================

export interface IncidenciaEntrega {
  id: number;
  entrega_id: number;
  usuario_id: number;
  tipo: string;
  descripcion: string | null;
  estado: string;
  resolucion: string | null;
  fecha_creacion: string;
  fecha_resolucion: string | null;
}


// =========================
// CALIFICACIÓN REPARTIDOR
// =========================

export interface CalificacionRepartidorCreate {
  puntuacion: number;
  comentario?: string | null;
}

export interface CalificacionRepartidor {
  id: number;
  entrega_id: number;
  repartidor_id: number;
  usuario_id: number;
  puntuacion: number;
  comentario: string | null;
  fecha_creacion: string;
}


// =========================
// OBTENER MI PERFIL DELIVERY
// =========================

export async function obtenerMiPerfilRepartidor(): Promise<Repartidor | null> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/repartidores/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // El usuario todavía no activó Delivery
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
  const data = await response.json();

  throw new Error(
    obtenerMensajeError(
      data,
      "No pudimos cargar tu perfil Delivery"
    )
  );
}

  return response.json();
}

// =========================
// DELIVERY - ZONAS
// =========================

export interface Zona {
  id: number;
  nombre: string;
  estado: string;
}

export interface EntregaDisponible {
  id: number;
  pedido_id: number;
  zona_id: number;
  estado: string;
  costo_delivery: number;
  ganancia_repartidor: number;
  cantidad_liberaciones: number;
  fecha_creacion: string;
}

export interface EntregaActiva {
  id: number;
  pedido_id: number;
  repartidor_id: number | null;
  zona_id: number;
  estado: string;
  destino: string;
  costo_delivery: number;
  ganancia_repartidor: number;
  cantidad_liberaciones: number;
  fecha_creacion: string;
}


// =========================
// LISTAR ZONAS ACTIVAS
// =========================

export async function listarZonas(): Promise<Zona[]> {
  const response = await fetch(`${API_URL}/zonas`);

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No pudimos cargar las zonas"
    );
  }

  return response.json();
}


// =========================
// ACTIVAR PERFIL REPARTIDOR
// =========================

export interface ActivarRepartidorData {
  zona_id: number;
  transporte: string;
}


export async function activarRepartidor(
  data: ActivarRepartidorData
): Promise<Repartidor> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/repartidores/activar`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No pudimos activar Delivery"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - INICIAR JORNADA
// =========================

export async function iniciarJornadaDelivery(): Promise<Repartidor> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/repartidores/jornada/iniciar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No pudimos iniciar la jornada"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - TERMINAR JORNADA
// =========================

export async function terminarJornadaDelivery(): Promise<Repartidor> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/repartidores/jornada/terminar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No pudimos terminar la jornada"
    );
  }

  return response.json();
}

export async function listarEntregasDisponibles():
  Promise<EntregaDisponible[]> {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/entregas/disponibles`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos cargar las entregas disponibles"
    );
  }

  return response.json();
}

export async function aceptarEntrega(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/aceptar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos aceptar la entrega"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - ENTREGA ACTIVA
// =========================

export async function obtenerEntregaActiva():
  Promise<EntregaActiva | null> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/activa`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos cargar tu entrega activa"
    );
  }

  return response.json();
}

export async function obtenerEntregaPorId(
  entregaId: number
): Promise<EntregaActiva> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos obtener la entrega"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - LLEGAR AL COMERCIO
// =========================

export async function llegarAlComercio(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/llegar-comercio`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos registrar la llegada al comercio"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - CÓDIGO DE LLEGADA
// =========================

export interface CodigoLlegadaResponse {
  entrega_id: number;
  codigo_llegada: string;
}

export async function obtenerCodigoLlegada(
  entregaId: number
): Promise<CodigoLlegadaResponse> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/codigo-llegada`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos obtener el código de llegada"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - COMERCIO CONFIRMAR LLEGADA
// =========================

export async function confirmarLlegadaComercio(
  entregaId: number,
  codigo: string
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/confirmar-llegada`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos confirmar la llegada del repartidor"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - CÓDIGO DE RETIRO
// =========================

export interface CodigoRetiroResponse {
  entrega_id: number;
  codigo_retiro: string;
}

export async function obtenerCodigoRetiro(
  entregaId: number
): Promise<CodigoRetiroResponse> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/codigo-retiro`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos obtener el código de retiro"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - COMERCIO CONFIRMAR RETIRO
// =========================

export async function confirmarRetiroComercio(
  entregaId: number,
  codigo: string
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/confirmar-retiro`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos confirmar el retiro del pedido"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - INICIAR CAMINO
// =========================

export async function iniciarCaminoEntrega(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/iniciar-camino`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos iniciar el camino al cliente"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - LLEGAR AL CLIENTE
// =========================

export async function llegarAlCliente(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/llegar-cliente`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos registrar la llegada al cliente"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - CÓDIGO FINAL
// =========================

export interface CodigoFinalResponse {
  entrega_id: number;
  codigo_final: string;
}

export async function obtenerCodigoFinal(
  entregaId: number
): Promise<CodigoFinalResponse> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/codigo-final`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos obtener el código final"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - CONFIRMAR CÓDIGO FINAL
// =========================

export async function confirmarCodigoFinal(
  entregaId: number,
  codigo: string
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/confirmar-final`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos confirmar el código final"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - LIBERAR ENTREGA
// =========================

export async function liberarEntrega(
  entregaId: number,
  motivo: string
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/liberar`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        motivo,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos liberar la entrega"
    );
  }

  return response.json();
}

// =========================
// DELIVERY - EXTENDER LLEGADA
// =========================

export async function extenderLlegadaEntrega(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/extender-llegada`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos extender el tiempo de llegada"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - CREAR INCIDENCIA
// =========================

export async function crearIncidenciaEntrega(
  entregaId: number,
  tipo: string,
  descripcion: string
) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/incidencias`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo,
        descripcion,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos registrar la incidencia"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - INICIAR DEVOLUCIÓN
// =========================

export async function iniciarDevolucionEntrega(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/iniciar-devolucion`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos iniciar la devolución"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - LLEGAR DEVOLUCIÓN AL COMERCIO
// =========================

export async function llegarDevolucionComercio(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/llegar-devolucion-comercio`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos registrar la llegada al comercio"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - CÓDIGO DE DEVOLUCIÓN
// =========================

export async function obtenerCodigoDevolucion(
  entregaId: number
): Promise<{ codigo_devolucion: string }> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/codigo-devolucion`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos obtener el código de devolución"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - CONFIRMAR DEVOLUCIÓN
// =========================

export async function confirmarDevolucionComercio(
  entregaId: number,
  codigo: string
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/confirmar-devolucion`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos confirmar la devolución"
    );
  }

  return response.json();
}


// =========================
// DELIVERY - INSPECCIONAR DEVOLUCIÓN
// =========================

export async function inspeccionarDevolucionComercio(
  entregaId: number,
  resultado: "OK" | "PROBLEMA"
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/${entregaId}/inspeccionar-devolucion`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resultado,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos inspeccionar la devolución"
    );
  }

  return response.json();
}



// =========================
// DELIVERY - ESTADÍSTICAS REPARTIDOR
// =========================

export async function obtenerEstadisticasRepartidor():
  Promise<EstadisticasRepartidor> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/repartidores/me/estadisticas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
if (!response.ok) {
  const data = await response.json();

  throw new Error(
    obtenerMensajeError(
      data,
      "No pudimos obtener tus estadísticas"
    )
  );
}

  return response.json();
}



// =========================
// DELIVERY - MIS GANANCIAS
// =========================

export async function obtenerMisGanancias():
  Promise<GananciaRepartidor[]> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/mis-ganancias`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos obtener tus ganancias"
    );
  }

  return response.json();
}

// =========================
// CLIENTE - CALIFICAR REPARTIDOR
// =========================

export async function calificarRepartidor(
  entregaId: number,
  data: CalificacionRepartidorCreate
): Promise<CalificacionRepartidor> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/calificaciones-repartidores/entregas/${entregaId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ??
        "No pudimos registrar la calificación"
    );
  }

  return response.json();
}


// =========================
// COMERCIO - DISPONIBILIDAD PEDIDOS
// =========================

export async function actualizarDisponibilidadPedidos(
  comercioId: number,
  disponibilidadPedidos:
    | "RECIBIENDO_PEDIDOS"
    | "PAUSADO"
): Promise<Comercio> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/comercios/${comercioId}/disponibilidad-pedidos`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        disponibilidad_pedidos:
          disponibilidadPedidos,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos actualizar la disponibilidad"
    );
  }

  return response.json();
}

// =========================
// ADMIN - INCIDENCIAS DELIVERY
// =========================

export async function listarIncidenciasDelivery():
  Promise<IncidenciaEntrega[]> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/admin/incidencias`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos obtener las incidencias"
    );
  }

  return response.json();
}


// =========================
// ADMIN - RESOLVER INCIDENCIA
// =========================

export async function resolverIncidenciaDelivery(
  incidenciaId: number,
  resolucion: string
): Promise<IncidenciaEntrega> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/admin/incidencias/${incidenciaId}/resolver`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resolucion,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos resolver la incidencia"
    );
  }

  return response.json();
}


// =========================
// ADMIN - REGENERAR CÓDIGO DELIVERY
// =========================

export async function regenerarCodigoEntregaAdmin(
  entregaId: number
): Promise<EntregaActiva> {

  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión");
  }

  const response = await fetch(
    `${API_URL}/entregas/admin/entregas/${entregaId}/regenerar-codigo`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail ??
        "No pudimos regenerar el código"
    );
  }

  return response.json();
}


