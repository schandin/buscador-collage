// Archivo: script.js (¡SOLUCIÓN FINAL!)
document.addEventListener('DOMContentLoaded', () => {
    // ...
    const searchTerms = {
        // ¡¡¡CAMBIO CLAVE!!! Volvemos a las búsquedas limpias, sin "-college"
        todos: 'arte collage',
        concursos: 'convocatoria collage OR "collage contest" OR "open call collage"',
        exposiciones: 'exposición collage OR "collage exhibition"',
        charlas: 'charla collage OR "collage artist talk"',
        cursos: 'curso collage OR taller collage OR "collage workshop"',
        historia: 'historia del collage OR "history of collage"',
        articulos: 'blog de collage OR "collage artist feature"'
    };
    // ...el resto del código es exactamente el mismo que antes...
    // ... (no necesitas copiarlo todo, solo la sección de `searchTerms`) ...
    let currentFilter = 'todos';
    let nextStartIndex = 1;
    async function performSearch(filter, isLoadMore = false) { if (!isLoadMore) { nextStartIndex = 1; resultsContainer.innerHTML = ''; } loader.classList.remove('hidden'); loadMoreButton.classList.add('hidden'); const query = searchTerms[filter]; try { const response = await fetch('/.netlify/functions/search', { method: 'POST', body: JSON.stringify({ query: query, start: nextStartIndex }) }); if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Error en la búsqueda'); } const results = await response.json(); displayResults(results); if (results.length === 10) { nextStartIndex += 10; loadMoreButton.classList.remove('hidden'); } else { loadMoreButton.classList.add('hidden'); } } catch (error) { resultsContainer.innerHTML += `<p>Error: ${error.message}</p>`; } finally { loader.classList.add('hidden'); } }
    function displayResults(results) { if (nextStartIndex === 1 && results.length === 0) { resultsContainer.innerHTML = '<p>No se encontraron resultados para esta categoría.</p>'; return; } results.forEach(item => { const card = ` <div class="event-card"> <img src="${item.image || 'https://via.placeholder.com/300x150.png?text=Collage'}" alt=""> <div class="event-card-content"> <h3>${item.title}</h3> <p>${item.snippet}</p> <a href="${item.link}" target="_blank">Ver más</a> </div> </div> `; resultsContainer.innerHTML += card; }); if (results.length < 10 && nextStartIndex > 1) { resultsContainer.innerHTML += '<p>No hay más resultados que mostrar.</p>'; } }
    filterButtons.forEach(button => { button.addEventListener('click', () => { filterButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); currentFilter = button.dataset.filter; performSearch(currentFilter); }); });
    loadMoreButton.addEventListener('click', () => { performSearch(currentFilter, true); });
    performSearch('todos');
});
