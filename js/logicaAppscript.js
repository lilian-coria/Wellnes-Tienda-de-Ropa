const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOYkXbyTBBoZBx--K4XGbwnZQDzTyNOJJnV5xPMohe2azOrTlGIhd3JdX7GHqW6uDgtQ/exec";

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

// Plantillas HTML
function plantillaProductos(prod) {
  return `
    <div class="product-item image-zoom-effect link-effect">
      <div class="image-holder position-relative">
        <a href="${prod.Enlace}">
          <img src="${prod.ImagenURL}" alt="${prod.Titulo}" class="product-image img-fluid">
        </a>
        <a href="#" class="btn-icon btn-wishlist">
          <svg width="24" height="24" viewBox="0 0 24 24"><use xlink:href="#heart"></use></svg>
        </a>
        <div class="product-content">
          <h5 class="text-uppercase fs-5 mt-3"><a href="${prod.Enlace}">${prod.Titulo}</a></h5>
          <a href="#" class="text-decoration-none" data-after="agregar al carrito"><span>$${prod.Precio}</span></a>
        </div>
      </div>
    </div>
  `;
}

function plantillaColeccion(prod) {
  return `
    <div class="banner-item image-zoom-effect">
      <div class="image-holder">
        <a href="${prod.Enlace}">
          <img src="${prod.ImagenURL}" alt="${prod.Titulo}" class="img-fluid">
        </a>
      </div>
      <div class="banner-content py-4">
        <h5 class="element-title text-uppercase"><a href="${prod.Enlace}" class="item-anchor">${prod.Titulo}</a></h5>
        <a href="#" class="text-decoration-none" data-after="agregar al carrito"><span>$${prod.Precio}</span></a>
        <div class="btn-left">
          <a href="#" class="btn-link fs-6 text-uppercase item-anchor text-decoration-none">Agregar al carrito</a>
        </div>
      </div>
    </div>
  `;
}

// Cargar todas las secciones al inicio
document.addEventListener("DOMContentLoaded", () => {
  cargarSeccion("Productos", "#new-arrival", plantillaProductos);
  cargarSeccion("ColeccionDeportiva", "#billboard", plantillaColeccion);
  cargarSeccion("ProductosRelacionados", "#related-products", plantillaProductos);
  cargarSeccion("MasVendidos", "#best-sellers", plantillaProductos);
});
