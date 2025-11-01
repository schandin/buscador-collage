// Archivo: script.js (¡VERSIÓN FINAL CORREGIDA!)
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');
    const loadMoreButton = document.getElementById('load-more-btn');

    // ¡¡¡LÓGICA DE BÚSQUEDA CORREGIDA CON PARÉNTESIS!!!
    const searchTerms = {
        todos: '("arte collage") -college',
        concursos: '("convocatoria collage" OR "collage contest" OR "open call collage") -college',
        exposiciones: '("exposición collage" OR "collage exhibition") -college',
        charlas: '("charla collage" OR "collage artist talk") -college',
        cursos: '("curso collage" OR "taller collage" OR "collage workshop") -college',
        historia: '("historia del collage" OR "history of collage") -college',
        articulos: '("blog de collage" OR "collage artist feature") -college'
    };

    let currentFilter = 'todos';
    let nextStartIndex = 1; // Para rastrear la paginación

    // Función para buscar en nuestro backend
    async function performSearch(filter, isLoadMore = false) {
        if (!isLoadMore) {
            nextStartIndex = 1; // Reseteamos si es una búsqueda nueva
            resultsContainer.innerHTML = '';
        }
        
        loader.classList.remove('hidden');
        loadMoreButton.classList.add('hidden');
        const query = searchTerms[filter];

        try {
            const response = await fetch('/.netlify/functions/search', {
                method: 'POST',
                body: JSON.stringify({ 
                    query: query,
                    start: nextStartIndex // Enviamos el índice de inicio
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error en la búsqueda');
            }
            
            const results = await response.json();
            displayResults(results);

            // Preparamos el índice para la próxima carga
            if (results.length === 10) { // Si vinieron 10, es probable que haya más
                nextStartIndex += 10;
                loadMoreButton.classList.remove('hidden');
            } else {
                // Si vinieron menos de 10, significa que no hay más páginas
                loadMoreButton.classList.add('hidden');
            }

        } catch (error) {
            resultsContainer.innerHTML += `<p>Error: ${error.message}</p>`;
        } finally {
            loader.classList.add('hidden');
        }
    }

    // Función para mostrar los resultados
    function displayResults(results) {
        if (nextStartIndex === 1 && results.length === 0) {
            resultsContainer.innerHTML = '<p>No se encontraron resultados para esta categoría.</p>';
            return;
        }

        results.forEach(item => {
            const card = `
                <div class="event-card">
                    <img src="${item.image || 'https://via.placeholder.com/300x150.png?text=Collage'}" alt="">
                    <div class="event-card-content">
                        <h3>${item.title}</h3>
                        <p>${item.snippet}</p>
                        <a href="${item.link}" target="_blank">Ver más</a>
                    </div>
                </div>
            `;
            // Usamos += para añadir resultados en lugar de reemplazar
            resultsContainer.innerHTML += card;
        });
        
        // Mensaje final si ya no hay más resultados
        if (results.length < 10 && nextStartIndex > 1) {
             resultsContainer.innerHTML += '<p>No hay más resultados que mostrar.</p>';
        }
    }

    // Manejar clics en los botones de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            performSearch(currentFilter); // Es una búsqueda nueva
        });
    });

    // Manejar clic en "Cargar más"
    loadMoreButton.addEventListener('click', () => {
        performSearch(currentFilter, true); // Es una carga de más resultados
    });

    // Carga inicial de "Todos"
    performSearch('todos');
});```

### **Qué hacer ahora:**

1.  **Actualiza el `script.js` en GitHub** con este nuevo código corregido.
2.  Espera un minuto a que Netlify se actualice automáticamente.
3.  **Refresca la página del buscador** y prueba de nuevo.

Ahora la búsqueda debería volver a funcionar, trayendo los resultados correctos y excluyendo la palabra "college" de forma mucho más fiable. Lamento sinceramente el paso en falso.
