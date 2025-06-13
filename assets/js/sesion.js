function cerrarSesion() {
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
}

export { cerrarSesion }; 