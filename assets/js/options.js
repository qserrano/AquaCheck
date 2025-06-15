import { API_BASE_URL, cargarUsuario, crearUsuario, mostrarCrearUsuario, actualizarUsuario } from './usuarios.js';
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

// Exponer funciones al ámbito global
window.navegarA = navegarA;
window.cerrarSesion = cerrarSesion;
window.cargarUsuarios = cargarUsuarios;
window.editarUsuario = editarUsuario;

// Variables globales
let allUsers = [];
let currentPage = 1;
const usersPerPage = 10;

// Obtener la información del usuario del localStorage
document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('userData'));

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

// Función para cargar usuarios
async function cargarUsuarios() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al cargar usuarios');
        }

        const data = await response.json();

        // Manejar tanto el formato de array directo como el formato con success y data
        if (Array.isArray(data)) {
            allUsers = data;
        } else if (data.success && Array.isArray(data.data)) {
            allUsers = data.data;
        } else {
            allUsers = [];
        }

        mostrarUsuarios();
    } catch (error) {
        console.error('Error completo:', error);
        mostrarError('Error al cargar los usuarios: ' + error.message);
    }
}

// Función para mostrar usuarios con paginación
function mostrarUsuarios() {
    const tbody = document.getElementById('usersTableBody');
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;

    // Filtrar usuarios
    let filteredUsers = allUsers.filter(user => {
        const matchesSearch =
            user.user_username.toLowerCase().includes(searchTerm) ||
            user.user_name.toLowerCase().includes(searchTerm) ||
            user.user_surname.toLowerCase().includes(searchTerm) ||
            user.user_email.toLowerCase().includes(searchTerm);

        const matchesRole = roleFilter === 'todos' || user.user_role === roleFilter;

        return matchesSearch && matchesRole;
    });

    // Calcular paginación
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    const paginatedUsers = filteredUsers.slice(start, end);

    // Actualizar tabla
    tbody.innerHTML = '';
    if (paginatedUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">No se encontraron usuarios</td>
            </tr>
        `;
    } else {
        paginatedUsers.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.user_username}</td>
                <td>${user.user_name}</td>
                <td>${user.user_surname}</td>
                <td>${user.user_dni}</td>
                <td>${user.user_email}</td>
                <td>${user.user_role}</td>
                <td class="action-buttons">
                    <button class="action-button edit-button" onclick="editarUsuario('${user.id}')">Editar</button>
                    <button class="action-button delete-button" onclick="eliminarUsuario('${user.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Actualizar controles de paginación
    document.getElementById('currentPage').textContent = `Página ${currentPage} de ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
}

// Event listeners para la paginación
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        mostrarUsuarios();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(allUsers.length / usersPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        mostrarUsuarios();
    }
});

// Event listener para el filtro de rol
document.getElementById('filterRole').addEventListener('change', () => {
    currentPage = 1;
    mostrarUsuarios();
});

// Event listener para la búsqueda
document.getElementById('searchUser').addEventListener('input', () => {
    currentPage = 1;
    mostrarUsuarios();
});

// Función para editar usuario
function editarUsuario(userId) {
    navegarA('editar-usuario', { userId });
}

// Función para eliminar usuario
async function eliminarUsuario(userId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }

    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userData.token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al eliminar el usuario');
        }

        mostrarMensaje('Usuario eliminado correctamente', 'success');
        cargarUsuarios();
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        mostrarMensaje(error.message, 'error');
    }
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    const mensajeElement = document.getElementById('editSuccessMessage');
    const errorElement = document.getElementById('editErrorMessage');

    if (tipo === 'success') {
        mensajeElement.textContent = mensaje;
        mensajeElement.style.display = 'block';
        errorElement.style.display = 'none';
    } else {
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
        mensajeElement.style.display = 'none';
    }
}

// Cargar usuarios cuando se muestra la sección
document.addEventListener('DOMContentLoaded', () => {
    const listarUsuariosSection = document.getElementById('listar-usuarios');
    if (listarUsuariosSection) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (listarUsuariosSection.style.display !== 'none') {
                        cargarUsuarios();
                    }
                }
            });
        });

        observer.observe(listarUsuariosSection, { attributes: true });
    }
}); 