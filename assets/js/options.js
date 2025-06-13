import { API_BASE_URL, cargarUsuario } from './usuarios.js';
import { cerrarSesion } from './sesion.js';
import { mostrarNotificacion, navegarA } from './mantenimiento.js';
import {
    handleFormSubmit,
    mostrarTodosAnalisis,
    mostrarAnalisisPorPiscina,
    mostrarAnalisisPorAnalista,
    evaluarEstado
} from './analisis.js';
import {
    mostrarInformesPorPiscina,
    mostrarInformesPorAnalista,
    mostrarInformesPorFechas,
    mostrarInformesPersonalizados,
    generarPDFPorPiscina,
    generarPDFPorAnalista,
    generarPDFPorFechas,
    generarPDFPersonalizado
} from './informes.js';

// Obtener la información del usuario del localStorage
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log('Datos del usuario en localStorage:', userData);
    
    if (userData) {
        // Usar directamente los datos del localStorage
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userRole').textContent = userData.role;

        // Mostrar/ocultar menús según el rol
        const informesMenu = document.getElementById('informesMenu');
        const usuariosMenu = document.getElementById('usuariosMenu');
        
        if (userData.role === 'administrador' || userData.role === 'tecnico') {
            informesMenu.style.display = 'block';
        }
        if (userData.role === 'administrador') {
            usuariosMenu.style.display = 'block';
        }
    } else {
        console.log('No hay datos de usuario en localStorage');
        // Si no hay datos del usuario, redirigir al login
        window.location.href = '/login.html';
    }
});

// Exportar las funciones necesarias para el uso global
window.cerrarSesion = cerrarSesion;
window.navegarA = navegarA;
window.mostrarNotificacion = mostrarNotificacion;
window.handleFormSubmit = handleFormSubmit;
window.mostrarTodosAnalisis = mostrarTodosAnalisis;
window.mostrarAnalisisPorPiscina = mostrarAnalisisPorPiscina;
window.mostrarAnalisisPorAnalista = mostrarAnalisisPorAnalista;
window.evaluarEstado = evaluarEstado;
window.mostrarInformesPorPiscina = mostrarInformesPorPiscina;
window.mostrarInformesPorAnalista = mostrarInformesPorAnalista;
window.mostrarInformesPorFechas = mostrarInformesPorFechas;
window.mostrarInformesPersonalizados = mostrarInformesPersonalizados;
window.generarPDFPorPiscina = generarPDFPorPiscina;
window.generarPDFPorAnalista = generarPDFPorAnalista;
window.generarPDFPorFechas = generarPDFPorFechas;
window.generarPDFPersonalizado = generarPDFPersonalizado; 