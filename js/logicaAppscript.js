const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmiiJADFeIRONliRFKi0uVwPDW7xhPBmW2ezMX3zLxjS7-_JvavKTKcBwgy3z4-ewJmA/exec";

// Función para formatear precio en formato argentino
function formatearPrecio(precio) {
  const num = parseFloat(precio);
  if (isNaN(num)) return '$0';
  
  const partes = num.toFixed(2).split('.');
  const entero = partes[0];
  const decimales = partes[1];
  
  const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (decimales && decimales !== '00') {
    return '$' + enteroFormateado + ',' + decimales;
  }

  return '$' + enteroFormateado;
}

// Función genérica para cargar cualquier sección
async function cargarSeccion(sheetName, containerSelector, plantillaFn) {
  const container = document.querySelector(containerSelector + " .swiper-wrapper");
  container.innerHTML = "";

  try {
    const res = await fetch(`${SCRIPT_URL}?sheet=${sheetName}`);
    const productos = await res.json();

    productos.forEach((prod, index) => {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      slide.innerHTML = plantillaFn(prod, index);
      container.appendChild(slide);
    });

    inicializarSwiper(containerSelector);

  } catch (err) {
    console.error("Error al cargar productos de " + sheetName, err);
  }
}

function inicializarSwiper(containerSelector) {
  const swiperEl = document.querySelector(containerSelector + " .swiper");
  if (!swiperEl) return;

  new Swiper(swiperEl, {
    slidesPerView: 4,
    spaceBetween: 20,
    pagination: { el: containerSelector + " .swiper-pagination", clickable: true },
    navigation: {
      nextEl: containerSelector + " .icon-arrow-right",
      prevEl: containerSelector + " .icon-arrow-left"
    },
    breakpoints: {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 4 }
    }
  });
}

let cartCount = 0;
let productosCarrito = JSON.parse(localStorage.getItem('productosCarrito')) || [];

// Funciones del carrito
function actualizarCarrito() {
  const contenedorCarrito = document.getElementById('cart-items');
  if (contenedorCarrito) {
    contenedorCarrito.innerHTML = '';
    let total = 0;

    productosCarrito.forEach((producto, index) => {
      const elementoProducto = document.createElement('div');
      elementoProducto.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      elementoProducto.innerHTML = `
        <div class="d-flex align-items-center flex-grow-1">
          <img src="${producto.imagen}" alt="${producto.titulo}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
          <div class="flex-grow-1">
            <h6 class="my-0">${producto.titulo}</h6>
            <small class="text-muted">${formatearPrecio(producto.precio)}</small>
          </div>
          <div class="d-flex align-items-center" style="gap: 10px;">
            <div class="input-group input-group-sm" style="width: 100px;">
              <button class="btn btn-outline-secondary" type="button" onclick="actualizarCantidad(${index}, -1)">-</button>
              <input type="number" class="form-control text-center" value="${producto.cantidad || 1}" min="1" 
                     onchange="actualizarCantidadDirecta(${index}, this.value)" style="width: 40px;">
              <button class="btn btn-outline-secondary" type="button" onclick="actualizarCantidad(${index}, 1)">+</button>
            </div>
            <button onclick="eliminarDelCarrito(${index})" class="btn btn-danger btn-sm">×</button>
          </div>
        </div>
      `;
      contenedorCarrito.appendChild(elementoProducto);
      total += parseFloat(producto.precio) * (producto.cantidad || 1);
    });

    const subtotalEl = document.getElementById('subtotal-offcanvas');
    if (subtotalEl) {
      subtotalEl.textContent = formatearPrecio(total);
    }
  }

  cartCount = productosCarrito.reduce((sum, producto) => sum + (producto.cantidad || 1), 0);
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = `(${cartCount})`;
  });

  localStorage.setItem('productosCarrito', JSON.stringify(productosCarrito));
  localStorage.setItem('cartCount', cartCount.toString());

  if (typeof actualizarTotalesEnCarrito === 'function') actualizarTotalesEnCarrito();
}

function actualizarCantidad(index, cambio) {
  if (productosCarrito[index]) {
    const nuevaCantidad = (productosCarrito[index].cantidad || 1) + cambio;
    if (nuevaCantidad > 0) {
      productosCarrito[index].cantidad = nuevaCantidad;
      actualizarCarrito();
    }
  }
}

function actualizarCantidadDirecta(index, nuevaCantidad) {
  nuevaCantidad = parseInt(nuevaCantidad);
  if (productosCarrito[index] && nuevaCantidad > 0) {
    productosCarrito[index].cantidad = nuevaCantidad;
    actualizarCarrito();
  }
}

function actualizarTotalesEnCarrito() {
  const subtotal = productosCarrito.reduce((sum, p) => sum + (parseFloat(p.precio) || 0) * (p.cantidad || 1), 0);
  const shippingEl = document.getElementById('shipping-offcanvas');
  const totalEl = document.getElementById('total-offcanvas');

  const shippingCost = 0;

  if (shippingEl) shippingEl.textContent = formatearPrecio(shippingCost);
  if (totalEl) totalEl.textContent = formatearPrecio(subtotal + shippingCost);
}

function agregarAlCarrito(producto) {
  const productoExistente = productosCarrito.find(p => 
    p.titulo === producto.titulo && 
    p.precio === producto.precio && 
    p.imagen === producto.imagen
  );
  
  if (productoExistente) {
    productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
  } else {
    producto.cantidad = 1;
    productosCarrito.push(producto);
  }
  actualizarCarrito();
}

function eliminarDelCarrito(index) {
  productosCarrito.splice(index, 1);
  actualizarCarrito();
}

function vaciarCarrito() {
  productosCarrito = [];
  actualizarCarrito();
}

function actualizarContadorCarrito() {
  cartCount++;
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = `(${cartCount})`;
  });
  localStorage.setItem('cartCount', cartCount.toString());
}

// Plantilla de producto
function plantillaProductos(prod, index) {
  const precio = prod.Precio ? parseFloat(prod.Precio).toFixed(2) : '0.00';
  const precioFormateado = formatearPrecio(precio);
  const id = prod.ID || prod.Id || prod.id || index;
  return `
    <div class="product-item image-zoom-effect link-effect">
      <div class="image-holder position-relative">
        <a href="#" class="open-product-modal"
           data-id="${id}"
           data-titulo="${escapeHtml(prod.Titulo)}"
           data-precio="${precio}"
           data-imagen="${escapeHtml(prod.ImagenURL)}"
           data-enlace="${escapeHtml(prod.Enlace)}">
          <img src="${prod.ImagenURL}" alt="${prod.Titulo}" class="product-image img-fluid">
        </a>
        <div class="product-content">
          <h5 class="text-uppercase fs-5 mt-3">
            <a href="#" class="open-product-modal small-link"
               data-id="${id}"
               data-titulo="${escapeHtml(prod.Titulo)}"
               data-precio="${precio}"
               data-imagen="${escapeHtml(prod.ImagenURL)}"
               data-enlace="${escapeHtml(prod.Enlace)}">
              ${prod.Titulo}
            </a>
          </h5>
          <div class="d-flex flex-column align-items-start mt-2">
            <span class="mb-2">${precioFormateado}</span>
            <button type="button" class="btn btn-sm btn-outline-dark add-from-card"
              data-id="${id}"
              data-titulo="${escapeHtml(prod.Titulo)}"
              data-precio="${precio}"
              data-imagen="${escapeHtml(prod.ImagenURL)}"
              onclick="agregarDesdeCard(this)">
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Plantilla colección
function plantillaColeccion(prod, index) {
  const precio = prod.Precio ? parseFloat(prod.Precio).toFixed(2) : '0.00';
  const precioFormateado = formatearPrecio(precio);
  const id = prod.ID || prod.Id || prod.id || ('colec-' + index);
  return `
    <div class="banner-item image-zoom-effect">
      <div class="image-holder">
        <a href="#" class="open-product-modal"
           data-id="${id}"
           data-titulo="${escapeHtml(prod.Titulo)}"
           data-precio="${precio}"
           data-imagen="${escapeHtml(prod.ImagenURL)}"
           data-enlace="${escapeHtml(prod.Enlace)}">
          <img src="${prod.ImagenURL}" alt="${prod.Titulo}" class="img-fluid">
        </a>
      </div>
      <div class="banner-content py-4">
        <h5 class="element-title text-uppercase">
          <a href="#" class="open-product-modal small-link"
             data-id="${id}"
             data-titulo="${escapeHtml(prod.Titulo)}"
             data-precio="${precio}"
             data-imagen="${escapeHtml(prod.ImagenURL)}"
             data-enlace="${escapeHtml(prod.Enlace)}">
            ${prod.Titulo}
          </a>
        </h5>
        <div class="d-flex flex-column align-items-start mt-2">
          <span class="mb-2">${precioFormateado}</span>
          <button type="button" class="btn btn-outline-dark add-from-card"
            data-id="${id}"
            data-titulo="${escapeHtml(prod.Titulo)}"
            data-precio="${precio}"
            data-imagen="${escapeHtml(prod.ImagenURL)}"
            onclick="agregarDesdeCard(this)">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.addEventListener('click', function(e) {
  const target = e.target.closest('.open-product-modal');
  if (!target) return;
  e.preventDefault();
  openProductModalFromDataset(target.dataset);
});

function openProductModalFromDataset(dataset) {
  const title = dataset.titulo || '';
  const price = dataset.precio || '0.00';
  const image = dataset.imagen || '';

  document.getElementById('productModalTitle').textContent = title;
  document.getElementById('productModalPrice').textContent = formatearPrecio(price);
  document.getElementById('productModalImage').src = image;

  const modalEl = document.getElementById('productModal');
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalInstance.show();
}

function agregarDesdeCard(el) {
  const id = el.dataset.id || Date.now();
  const producto = {
    id: id,
    titulo: el.dataset.titulo || 'Producto',
    precio: parseFloat(el.dataset.precio || 0).toFixed(2),
    imagen: el.dataset.imagen || '',
    cantidad: 1
  };
  agregarAlCarrito(producto);
}

document.addEventListener("DOMContentLoaded", () => {
  cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
  
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = `(${cartCount})`;
  });

  if (productosCarrito && productosCarrito.length) {
    actualizarCarrito();
  }

  if (typeof actualizarTotalesEnCarrito === 'function') actualizarTotalesEnCarrito();

  cargarSeccion("Productos", "#new-arrival", plantillaProductos);
  cargarSeccion("ColeccionDeportiva", "#billboard", plantillaColeccion);
  cargarSeccion("ProductosRelacionados", "#related-products", plantillaProductos);
  cargarSeccion("MasVendidos", "#best-sellers", plantillaProductos);
});

document.getElementById('checkoutForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  if (!this.checkValidity()) {
    event.stopPropagation();
    this.classList.add('was-validated');
    return;
  }

  const datosFormulario = {
    nombreCompleto: document.getElementById('nombreCompleto').value,
    domicilio: document.getElementById('domicilio').value,
    codigoPostal: document.getElementById('codigoPostal').value,
    telefono: document.getElementById('telefono').value,
    email: document.getElementById('email').value
  };

  const enviado = await enviarPedidoASheet(datosFormulario);

  var checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
  checkoutModal.hide();

  var confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
  confirmationModal.show();

  if (enviado) {
    vaciarCarrito();
  }

  this.reset();
  this.classList.remove('was-validated');
});

async function enviarPedidoASheet(datosFormulario) {
  const subtotal = productosCarrito.reduce((sum, p) => sum + (parseFloat(p.precio) || 0) * (p.cantidad || 1), 0);

  const shippingCost = 0;
  const total = subtotal;
  
  const pedido = {
    nombreCompleto: datosFormulario.nombreCompleto,
    domicilio: datosFormulario.domicilio,
    codigoPostal: datosFormulario.codigoPostal,
    telefono: datosFormulario.telefono,
    email: datosFormulario.email,
    productos: JSON.stringify(productosCarrito),
    subtotal: subtotal.toFixed(2),
    envio: shippingCost.toFixed(2),
    total: total.toFixed(2)
  };
  
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedido)
    });
    
    console.log('Pedido enviado correctamente');
    return true;
  } catch (error) {
    console.error('Error al enviar pedido:', error);
    return false;
  }
}
