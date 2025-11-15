
    // Ajustar padding-top del body para evitar que el contenido quede oculto bajo el navbar fijo
    (function(){
      function adjustBodyPadding(){
        var nav = document.querySelector('nav.navbar.fixed-top');
        if(!nav) return;
        // calcular altura real incluyendo bordes/márgenes
        var h = nav.getBoundingClientRect().height;
        document.body.style.paddingTop = h + 'px';
      }
      // ajustar al cargar y al cambiar tamaño
      window.addEventListener('load', adjustBodyPadding);
      window.addEventListener('resize', adjustBodyPadding);
      // también corre una vez inmediatamente
      adjustBodyPadding();
    })();

    // Ajustar el scroll offset para los enlaces del navbar
    document.addEventListener('DOMContentLoaded', function() {
      // Obtener todos los enlaces que apuntan a anchors
      var anchorLinks = document.querySelectorAll('a[href^="#"]');
      
      anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Obtener el elemento target del enlace
          var targetId = this.getAttribute('href').substring(1);
          var targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            // Obtener la altura del navbar
            var navbar = document.querySelector('nav.navbar.fixed-top');
            var navbarHeight = navbar ? navbar.offsetHeight : 0;
            
            // Calcular la posición de scroll
            var targetPosition = targetElement.offsetTop - navbarHeight;
            
            // Hacer el scroll suave
            // If there is an offcanvas shown (mobile hamburger menu), close it
            // Use Bootstrap's Offcanvas API to hide it (getOrCreateInstance ensures instance exists)
            var activeOffcanvas = document.querySelector('.offcanvas.show');
            if (activeOffcanvas && typeof bootstrap !== 'undefined') {
              var offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(activeOffcanvas);
              try { offcanvasInstance.hide(); } catch(e) { /* ignore if fails */ }
            }

            // Smooth scroll to the anchor target
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });

      // Also: if a user clicks any link inside an offcanvas menu, close the offcanvas
      // (works for external links like Instagram, or other nav items)
      var offcanvasLinks = document.querySelectorAll('.offcanvas a');
      offcanvasLinks.forEach(function(link){
        link.addEventListener('click', function(){
          var activeOffcanvas = document.querySelector('.offcanvas.show');
          if (activeOffcanvas && typeof bootstrap !== 'undefined') {
            var offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(activeOffcanvas);
            try { offcanvasInstance.hide(); } catch(e) { /* ignore */ }
          }
        });
      });
    });