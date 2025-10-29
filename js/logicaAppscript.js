document.addEventListener("DOMContentLoaded", async () => {
    const swiperWrapper = document.querySelector("#new-arrival .swiper-wrapper");
    swiperWrapper.innerHTML = ""; // limpiar contenido previo

    // 🔧 Función que transforma automáticamente enlaces de Drive en formato visible
    function convertirDriveLink(url) {
      if (!url) return "";
      const match = url.match(/[-\w]{25,}/);
      return match ? `https://drive.google.com/uc?export=view&id=${match[0]}` : url;
    }

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbwZ5wnrLgYIyQH15U-bJKFXRAOx-AIVfPSt3fB8oW9XwzMkS1TmkOR_ogjzcOW18mqmpQ/exec");
      const productos = await res.json();

      console.log("Productos cargados:", productos);

      productos.forEach(prod => {
        const imgUrl = convertirDriveLink(prod.ImagenURL);
        const slide = document.createElement("div");
        slide.classList.add("swiper-slide");
        slide.innerHTML = `
          <div class="product-item image-zoom-effect link-effect">
            <div class="image-holder position-relative">
              <a href="${prod.Enlace}">
                <img src="${imgUrl}" alt="${prod.Titulo}" class="product-image img-fluid">
              </a>
              <a href="#" class="btn-icon btn-wishlist">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#heart"></use>
                </svg>
              </a>
              <div class="product-content">
                <h5 class="text-uppercase fs-5 mt-3">
                  <a href="${prod.Enlace}">${prod.Titulo}</a>
                </h5>
                <a href="#" class="text-decoration-none" data-after="agregar al carrito">
                  <span>$${prod.Precio}</span>
                </a>
              </div>
            </div>
          </div>`;
        swiperWrapper.appendChild(slide);
      });

      // Inicializa Swiper una vez cargados los productos
      new Swiper('.product-swiper', {
        slidesPerView: 4,
        spaceBetween: 20,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: {
          nextEl: '.icon-arrow-right',
          prevEl: '.icon-arrow-left'
        },
        breakpoints: {
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 }
        }
      });

    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  });