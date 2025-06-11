// Obtener la información del usuario del localStorage
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.token) {
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userRole').textContent = userData.role;
    } else {
        // Si no hay datos del usuario o no hay token, redirigir al login
        window.location.href = '/login.html';
    }
});

function navegarA(ruta) {
    // Aquí puedes implementar la navegación a las diferentes secciones
    console.log('Navegando a:', ruta);
}

function cerrarSesion() {
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
} 