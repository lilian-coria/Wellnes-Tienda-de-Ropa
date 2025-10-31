const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYUYj9Y7ocgydiafd_TVHmHIUiQxh368yzWXY9xq7cAzGg8T9C46RFoZa8XoUHvMMS_w/exec";

// Función genérica para cargar cualquier sección
async function cargarSeccion(sheetName, containerSelector, plantillaFn) {
  const container = document.querySelector(containerSelector + " .swiper-wrapper");
  container.innerHTML = "";

  try {
    const res = await fetch(`${SCRIPT_URL}?sheet=${sheetName}`);
    const productos = await res.json();

    productos.forEach(prod => {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      slide.innerHTML = plantillaFn(prod);
      container.appendChild(slide);
    });

    // Inicializa Swiper para esta sección
    inicializarSwiper(containerSelector);

  } catch (err) {
    console.error("Error al cargar productos de " + sheetName, err);
  }
}

// Función para inicializar Swiper por sección
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

// Variables para el carrito
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
              <small class="text-muted">$${producto.precio}</small>
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

    // Actualizar subtotal en el offcanvas (el total final incluye envío)
    const subtotalEl = document.getElementById('subtotal-offcanvas');
    if (subtotalEl) {
      subtotalEl.textContent = '$' + total.toFixed(2);
    }
  }

  // Actualizar contador (suma de cantidades)
  cartCount = productosCarrito.reduce((sum, producto) => sum + (producto.cantidad || 1), 0);
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = `(${cartCount})`;
  });
  
  // Guardar en localStorage
  localStorage.setItem('productosCarrito', JSON.stringify(productosCarrito));
  localStorage.setItem('cartCount', cartCount.toString());
  // Actualizar totales (envío + subtotal) en el offcanvas
  if (typeof actualizarTotalesEnCarrito === 'function') actualizarTotalesEnCarrito();
}

  // Función para actualizar la cantidad de un producto
  function actualizarCantidad(index, cambio) {
    if (productosCarrito[index]) {
      const nuevaCantidad = (productosCarrito[index].cantidad || 1) + cambio;
      if (nuevaCantidad > 0) {
        productosCarrito[index].cantidad = nuevaCantidad;
        actualizarCarrito();
      }
    }
  }

  // Función para actualizar la cantidad directamente
  function actualizarCantidadDirecta(index, nuevaCantidad) {
    nuevaCantidad = parseInt(nuevaCantidad);
    if (productosCarrito[index] && nuevaCantidad > 0) {
      productosCarrito[index].cantidad = nuevaCantidad;
      actualizarCarrito();
    }
  }

  // Actualiza subtotal/envío/total dentro del offcanvas (Tu carrito)
  function actualizarTotalesEnCarrito() {
    const subtotal = productosCarrito.reduce((sum, p) => sum + (parseFloat(p.precio) || 0) * (p.cantidad || 1), 0);

    // Leer opción de envío seleccionada en el carrito
    const selected = document.querySelector('input[name="shippingOptionCart"]:checked');
    let shippingCost = 0;
    if (selected && selected.dataset && selected.dataset.cost) {
      shippingCost = parseFloat(selected.dataset.cost) || 0;
    }

    const shippingEl = document.getElementById('shipping-cost-offcanvas');
    const totalEl = document.getElementById('total-offcanvas');

    if (shippingEl) shippingEl.textContent = '$' + shippingCost.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + (subtotal + shippingCost).toFixed(2);
  }
function agregarAlCarrito(producto) {
  // Buscar si el producto ya existe en el carrito
  const productoExistente = productosCarrito.find(p => 
    p.titulo === producto.titulo && 
    p.precio === producto.precio && 
    p.imagen === producto.imagen
  );
  
  if (productoExistente) {
    // Si existe, aumentar la cantidad
    productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
  } else {
    // Si no existe, agregarlo con cantidad 1
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
  // Guardar el contador en localStorage
  localStorage.setItem('cartCount', cartCount.toString());
}

// Plantillas HTML
function plantillaProductos(prod) {
  const precio = prod.Precio ? parseFloat(prod.Precio).toFixed(2) : '0.00';
  return `
    <div class="product-item image-zoom-effect link-effect">
      <div class="image-holder position-relative">
        <a href="${prod.Enlace}">
          <img src="${prod.ImagenURL}" alt="${prod.Titulo}" class="product-image img-fluid">
        </a>
        <div class="product-content">
          <h5 class="text-uppercase fs-5 mt-3"><a href="${prod.Enlace}">${prod.Titulo}</a></h5>
          <div class="d-flex justify-content-between align-items-center">
            <span>$${precio}</span>
            <button onclick="agregarAlCarrito({
              titulo: '${prod.Titulo.replace(/'/g, "\\'")}',
              precio: ${precio},
              imagen: '${prod.ImagenURL}',
              enlace: '${prod.Enlace}'
            })" class="btn btn-sm btn-outline-dark">Agregar al carrito</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function plantillaColeccion(prod) {
  const precio = prod.Precio ? parseFloat(prod.Precio).toFixed(2) : '0.00';
  return `
    <div class="banner-item image-zoom-effect">
      <div class="image-holder">
        <a href="${prod.Enlace}">
          <img src="${prod.ImagenURL}" alt="${prod.Titulo}" class="img-fluid">
        </a>
      </div>
      <div class="banner-content py-4">
        <h5 class="element-title text-uppercase"><a href="${prod.Enlace}" class="item-anchor">${prod.Titulo}</a></h5>
        <div class="d-flex justify-content-between align-items-center">
          <span>$${precio}</span>
        </div>
        <div class="btn-left mt-3">
          <button onclick="agregarAlCarrito({
            titulo: '${prod.Titulo.replace(/'/g, "\\'")}',
            precio: ${precio},
            imagen: '${prod.ImagenURL}',
            enlace: '${prod.Enlace}'
          })" class="btn btn-outline-dark">Agregar al carrito</button>
        </div>
      </div>
    </div>
  `;
}

// Cargar todas las secciones al inicio
document.addEventListener("DOMContentLoaded", () => {
  // Recuperar el contador del carrito guardado
  cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
  
  // Actualizar el contador en la interfaz
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = `(${cartCount})`;
  });

  // Renderizar carrito desde localStorage si hay items
  if (productosCarrito && productosCarrito.length) {
    actualizarCarrito();
  }

  // Registrar listeners para opciones de envío en el offcanvas
  document.querySelectorAll('input[name="shippingOptionCart"]').forEach(radio => {
    radio.addEventListener('change', actualizarTotalesEnCarrito);
  });

  // Inicializar totales en el offcanvas
  if (typeof actualizarTotalesEnCarrito === 'function') actualizarTotalesEnCarrito();

  // Cargar las secciones
  cargarSeccion("Productos", "#new-arrival", plantillaProductos);
  cargarSeccion("ColeccionDeportiva", "#billboard", plantillaColeccion);
  cargarSeccion("ProductosRelacionados", "#related-products", plantillaProductos);
  cargarSeccion("MasVendidos", "#best-sellers", plantillaProductos);
});
