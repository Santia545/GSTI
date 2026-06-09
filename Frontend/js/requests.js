import { removeJWT } from "./auth.js";

const serverUrl = 'http://localhost:3000';

async function fetchData(urlPath, method, body = null) {
    let url = `${serverUrl}${urlPath}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const token = sessionStorage.getItem('jwt');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (method === 'GET' && body) {
        const queryParams = new URLSearchParams(body).toString();
        url += `?${queryParams}`;
    } else if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 401) {
                if (window.location.pathname !== '/login.html')
                    window.location.href = 'login.html';
                removeJWT();
            }
            let json = { error: '' };
            try {
                json = await response.json();
            } catch (error) {
                throw new Error(`{"status": ${response.status}`);
            }
            throw new Error(`{"status": ${response.status}, "message": "${json.error}"}`);

        }
        return await response.json();
    } catch (error) {
        //TODO REMOVE THIS LINE WHEN NOT DEBUGGING
        console.error('Error fetching data:', error);
        throw error;
    }
}

export { fetchData };