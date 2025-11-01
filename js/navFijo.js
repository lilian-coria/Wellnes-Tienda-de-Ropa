
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
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    });