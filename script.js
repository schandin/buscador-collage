// Archivo: script.js (¡VERSIÓN FINAL CON FAVORITOS!)
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');
    const loadMoreButton = document.getElementById('load-more-btn');

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
    let nextStartIndex = 1;
    let savedArticles = []; // Array para los artículos guardados

    // Cargar artículos guardados desde LocalStorage al iniciar
    function loadSavedArticles() {
        const saved = localStorage.getItem('collageFinderSaved');
        if (saved) {
            savedArticles = JSON.parse(saved);
        }
    }

    // Guardar artículos en LocalStorage
    function saveArticlesToStorage() {
        localStorage.setItem('collageFinderSaved', JSON.stringify(savedArticles));
    }

    // Función para buscar en nuestro backend
    async function performSearch(filter, isLoadMore = false) {
        if (filter === 'guardados') {
            loader.classList.add('hidden');
            loadMoreButton.classList.add('hidden');
            resultsContainer.innerHTML = '';
            displayResults(savedArticles); // Muestra los artículos guardados
            return;
        }

        if (!isLoadMore) {
            nextStartIndex = 1;
            resultsContainer.innerHTML = '';
        }
        
        loader.classList.remove('hidden');
        loadMoreButton.classList.add('hidden');
        const query = searchTerms[filter];

        try {
            const response = await fetch('/.netlify/functions/search', {
                method: 'POST',
                body: JSON.stringify({ query: query, start: nextStartIndex })
            });
            if (!response.ok) { throw new Error((await response.json()).error || 'Error'); }
            
            const results = await response.json();
            displayResults(results);

            if (results.length === 10) {
                nextStartIndex += 10;
                loadMoreButton.classList.remove('hidden');
            }
        } catch (error) {
            resultsContainer.innerHTML += `<p>Error: ${error.message}</p>`;
        } finally {
            loader.classList.add('hidden');
        }
    }

    // Función para mostrar los resultados
    function displayResults(results) {
        if (results.length === 0 && (!savedArticles.length || currentFilter !== 'guardados')) {
            resultsContainer.innerHTML = '<p>No se encontraron resultados para esta categoría.</p>';
            return;
        }

        results.forEach(item => {
            const isSaved = savedArticles.some(saved => saved.link === item.link);
            const savedClass = isSaved ? 'saved' : '';
            const iconClass = isSaved ? 'fa-solid' : 'fa-regular';

            const card = `
                <div class="event-card" data-link="${item.link}">
                    <i class="save-btn ${savedClass} ${iconClass} fa-bookmark"></i>
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

    // Manejar clic en "Cargar más"
    loadMoreButton.addEventListener('click', () => {
        performSearch(currentFilter, true);
    });

    // Manejar clics en los botones de guardar (usando delegación de eventos)
    resultsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('save-btn')) {
            const button = event.target;
            const card = button.closest('.event-card');
            const link = card.dataset.link;
            
            const articleData = {
                link: link,
                title: card.querySelector('h3').textContent,
                snippet: card.querySelector('p').textContent,
                image: card.querySelector('img').src,
            };

            const articleIndex = savedArticles.findIndex(saved => saved.link === link);

            if (articleIndex > -1) { // Si ya está guardado, lo quitamos
                savedArticles.splice(articleIndex, 1);
                button.classList.remove('saved', 'fa-solid');
                button.classList.add('fa-regular');
            } else { // Si no, lo añadimos
                savedArticles.push(articleData);
                button.classList.add('saved', 'fa-solid');
                button.classList.remove('fa-regular');
            }
            saveArticlesToStorage(); // Guardamos los cambios en LocalStorage
            
            // Si estamos en la vista de "Guardados", actualizamos la vista al quitar un elemento
            if (currentFilter === 'guardados') {
                performSearch('guardados');
            }
        }
    });

    // Carga inicial
    loadSavedArticles();
    // Iniciamos en la vista de "Guardados" si hay algo, si no, en "Todos"
    currentFilter = savedArticles.length > 0 ? 'guardados' : 'todos';
    document.querySelector(`.filter-btn[data-filter="${currentFilter}"]`).classList.add('active');
    document.querySelector(`.filter-btn[data-filter="todos"]`).classList.remove('active');
    performSearch(currentFilter);
});
