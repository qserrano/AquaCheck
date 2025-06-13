// Configuración del API
const API_BASE_URL = 'http://localhost:3000';

function cargarUsuario() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log('Datos del usuario en localStorage:', userData);
    
    if (userData) {
        // Usar directamente los datos del localStorage
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userRole').textContent = userData.role;
        return userData;
    } else {
        console.log('No hay datos de usuario en localStorage');
        // Si no hay datos del usuario, redirigir al login
        window.location.href = '/login.html';
        return null;
    }
}

// Cargar usuario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarUsuario);

export { API_BASE_URL, cargarUsuario }; 