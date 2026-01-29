/**
 * Dark Mode
 */
function setTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);
    document.getElementById('themeToggle').checked = isDark;
}

fetch('/partials/theme-toggle.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('theme').innerHTML = html;

        document.getElementById('themeToggle').addEventListener('change', (e) => {
            setTheme(e.target.checked);
        });

        setTheme(localStorage.getItem('darkMode') === 'true');
    });

// Inject hamburger nav into any page that has <div id="nav"></div>
fetch('/partials/nav.html')
    .then(res => res.text())
    .then(html => {
        const slot = document.getElementById('nav');
        if (!slot) return;
        slot.innerHTML = html;
    })
    .catch(() => {});

/**
 * Request Helpers
 * 
 * Sends the jwt token in the Authorization header for authenticated requests.
 * Takes a path, method, and optional body.
 * Returns the response data or throws an error if the request fails.
 * methods default to GET if not specified.
 * 
 * @param {string} path - The API endpoint path.
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, etc.).
 * @param {Object} [body=null] - The request body, if applicable (for POST, PUT, etc.).
 * @returns {Promise<Object>} - The response data from the API.
 */
function apiRequest(path, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    const options = { method, headers };

    if (body) {
        options.body = JSON.stringify(body);
    }

    return fetch(path, options)
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Request failed');
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                return;
            }

            return response.json();
        });
}

/**
 * Toast Notifications
 * 
 * Displays a toast notification with the given message and type.
 * 
 * @param {string} message - The message to display in the toast.
 * @param {string} [type='info'] - The type of toast ('info', 'success', 'error').
 * @returns {void}
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn('Toast container not found. Please add a div with id="toast-container" to your HTML.');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Automatically remove the toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300); // Match the duration of the fade-out animation
    }, 3000);

    toastContainer.appendChild(toast);

}
