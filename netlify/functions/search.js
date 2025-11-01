// Archivo: netlify/functions/search.js (¡ACTUALIZADO!)

exports.handler = async function(event) {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX_ID = process.env.GOOGLE_CX_ID;

    const requestBody = JSON.parse(event.body);
    const query = requestBody.query;
    // NUEVO: Aceptamos el índice de inicio para la paginación
    const startIndex = requestBody.start || 1;

    // NUEVO: Añadimos los parámetros "sort=date" y "start"
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(query)}&sort=date&start=${startIndex}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            return { statusCode: response.status, body: JSON.stringify({ error: errorData.error.message }) };
        }
        
        const data = await response.json();
        const items = data.items || [];

        const results = items.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            image: (item.pagemap?.cse_image?.[0]?.src) || null
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Hubo un error al conectar con la API de Google.' }) };
    }
};
