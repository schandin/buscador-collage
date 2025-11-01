// Archivo: script.js
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');

    const searchTerms = {
        todos: 'collage art',
        concursos: 'convocatoria collage OR "collage contest" OR "open call collage"',
        exposiciones: 'exposición collage OR "collage exhibition"',
        charlas: 'charla collage OR "collage artist talk"',
        cursos: 'curso collage OR taller collage OR "collage workshop"',
        historia: 'historia del collage OR "history of collage"',
        articulos: 'blog collage OR "collage artist feature"'
    };

    let currentFilter = 'todos';

    // Función para buscar en nuestro backend
    async function performSearch(filter) {
        loader.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        const query = searchTerms[filter];

        try {
            const response = await fetch('/.netlify/functions/search', {
                method: 'POST',
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error en la búsqueda');
            }
            
            const results = await response.json();
            displayResults(results);

        } catch (error) {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        } finally {
            loader.classList.add('hidden');
        }
    }

    // Función para mostrar los resultados
    function displayResults(results) {
        if (results.length === 0) {
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
            resultsContainer.innerHTML += card;
        });
    }

    // Manejar clics en los botones de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            performSearch(currentFilter);
        });
    });

    // Carga inicial de "Todos"
    performSearch('todos');
});