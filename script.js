// Archivo: netlify/functions/search.js (¡SOLUCIÓN FINAL!)
exports.handler = async function(event) {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX_ID = process.env.GOOGLE_CX_ID;

    const requestBody = JSON.parse(event.body);
    const query = requestBody.query;
    const startIndex = requestBody.start || 1;

    // ¡¡¡CAMBIO CLAVE!!! Añadimos el parámetro "excludeTerms=college"
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(query)}&sort=date&start=${startIndex}&excludeTerms=college`;

    try {
        // ...el resto del código es exactamente el mismo que antes...
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
        return { statusCode: 200, body: JSON.stringify(results) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Hubo un error al conectar con la API de Google.' }) };
    }
};
