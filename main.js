let skip = 0;
const limit = 10;
let totalProductos = 0;
let productoEditando = null;
let filtroActual = {};

// Cargar categorías al inicio
fetch("https://dummyjson.com/products/category-list")
  .then((res) => res.json())
  .then((categorias) => {
    const select = document.getElementById("selectCategoria");
    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  });

function cargarProductos() {
  let url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;

  if (filtroActual.busqueda) {
    url = `https://dummyjson.com/products/search?q=${filtroActual.busqueda}&limit=${limit}&skip=${skip}`;
  } else if (filtroActual.categoria) {
    url = `https://dummyjson.com/products/category/${filtroActual.categoria}?limit=${limit}&skip=${skip}`;
  }

  if (filtroActual.ordenar) {
    const [campo, orden] = filtroActual.ordenar.split("-");
    url += `&sortBy=${campo}&order=${orden}`;
  }

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      totalProductos = data.total;
      mostrarProductos(data.products);
      actualizarPaginacion();
    });
}

function mostrarProductos(productos) {
  const contenedor = document.getElementById("contenedorTabla");

  if (productos.length === 0) {
    contenedor.innerHTML =
      '<div class="loading">No se encontraron productos</div>';
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Título</th>
                    <th>Precio</th>
                    <th>Categoría</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

  productos.forEach((p) => {
    html += `
            <tr id="fila-${p.id}">
                <td>${p.id}</td>
                <td><img src="${p.thumbnail}" alt="${p.title}"></td>
                <td>${p.title}</td>
                <td>$${p.price}</td>
                <td>${p.category}</td>
                <td>
                    <div class="acciones">
                        <button class="btn-editar" onclick="editarProducto(${p.id}, '${p.title.replace(/'/g, "\\'")}', ${p.price})">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarProducto(${p.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
  });

  html += "</tbody></table>";
  contenedor.innerHTML = html;
}

function actualizarPaginacion() {
  const paginaActual = Math.floor(skip / limit) + 1;
  const totalPaginas = Math.ceil(totalProductos / limit);

  document.getElementById("infoPagina").textContent =
    `Página ${paginaActual} de ${totalPaginas}`;
  document.getElementById("btnAnterior").disabled = skip === 0;
  document.getElementById("btnSiguiente").disabled =
    skip + limit >= totalProductos;
}

function paginaAnterior() {
  if (skip > 0) {
    skip -= limit;
    cargarProductos();
  }
}

function paginaSiguiente() {
  if (skip + limit < totalProductos) {
    skip += limit;
    cargarProductos();
  }
}

function buscarProductos() {
  const busqueda = document.getElementById("inputBusqueda").value.trim();
  skip = 0;
  filtroActual = { busqueda };
  document.getElementById("selectCategoria").value = "";
  cargarProductos();
}

function filtrarPorCategoria() {
  const categoria = document.getElementById("selectCategoria").value;
  skip = 0;
  filtroActual = categoria ? { categoria } : {};
  document.getElementById("inputBusqueda").value = "";
  cargarProductos();
}

function ordenarProductos() {
  const ordenar = document.getElementById("selectOrdenar").value;
  if (ordenar) {
    filtroActual.ordenar = ordenar;
  } else {
    delete filtroActual.ordenar;
  }
  skip = 0;
  cargarProductos();
}

function abrirModalNuevo() {
  productoEditando = null;
  document.getElementById("tituloModal").textContent = "Nuevo Producto";
  document.getElementById("inputTitulo").value = "";
  document.getElementById("inputPrecio").value = "";
  document.getElementById("modal").style.display = "flex";
}

function editarProducto(id, titulo, precio) {
  productoEditando = id;
  document.getElementById("tituloModal").textContent = "Editar Producto";
  document.getElementById("inputTitulo").value = titulo;
  document.getElementById("inputPrecio").value = precio;
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return;

  fetch(`https://dummyjson.com/products/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then(() => {
      const fila = document.getElementById(`fila-${id}`);
      if (fila) fila.remove();
      alert("Producto eliminado correctamente");
    });
}

document
  .getElementById("formProducto")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const titulo = document.getElementById("inputTitulo").value;
    const precio = document.getElementById("inputPrecio").value;

    if (productoEditando) {
      fetch(`https://dummyjson.com/products/${productoEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titulo, price: parseFloat(precio) }),
      })
        .then((res) => res.json())
        .then(() => {
          alert("Producto actualizado correctamente");
          cerrarModal();
          cargarProductos();
        });
    } else {
      fetch("https://dummyjson.com/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titulo, price: parseFloat(precio) }),
      })
        .then((res) => res.json())
        .then(() => {
          alert("Producto creado correctamente");
          cerrarModal();
          cargarProductos();
        });
    }
  });

document
  .getElementById("inputBusqueda")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") buscarProductos();
  });

cargarProductos();
