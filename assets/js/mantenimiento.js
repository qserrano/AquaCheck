import { API_BASE_URL } from './usuarios.js';
import {
    handleFormSubmit,
    mostrarTodosAnalisis,
    mostrarAnalisisPorPiscina,
    mostrarAnalisisPorAnalista
} from './analisis.js';

import {
    mostrarInformesPorPiscina,
    mostrarInformesPorAnalista,
    mostrarInformesPorFechas,
    mostrarInformesPersonalizados
} from './informes.js';

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;

    document.body.appendChild(notificacion);

    // Animar la entrada
    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateY(0)';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

function navegarA(ruta, params = {}) {
    const mainContent = document.querySelector('.main-content');
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Validar acceso a informes
    if (ruta.startsWith('informes-')) {
        if (!userData || !userData.role || (userData.role !== 'administrador' && userData.role !== 'tecnico')) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <h3>Acceso Restringido</h3>
                    <p>No tienes permisos para acceder a esta sección. Solo administradores y técnicos pueden generar informes.</p>
                </div>
            `;
            return;
        }
    }

    // Ocultar todas las secciones primero
    const sections = mainContent.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    switch (ruta) {
        case 'ver-todos':
            mostrarTodosAnalisis(mainContent);
            break;
        case 'por-piscina':
            mostrarAnalisisPorPiscina(mainContent);
            break;
        case 'por-analista':
            mostrarAnalisisPorAnalista(mainContent);
            break;
        case 'informes-por-piscina':
            mostrarInformesPorPiscina(mainContent);
            break;
        case 'informes-por-analista':
            mostrarInformesPorAnalista(mainContent);
            break;
        case 'informes-por-fechas':
            mostrarInformesPorFechas(mainContent);
            break;
        case 'informes-personalizados':
            mostrarInformesPersonalizados(mainContent);
            break;
        case 'crear-usuario':
            mostrarCrearUsuario();
            break;
        case 'listar-usuarios':
            const listarUsuariosSection = document.getElementById('listar-usuarios');
            if (listarUsuariosSection) {
                listarUsuariosSection.style.display = 'block';
                cargarUsuarios();
            }
            break;
        case 'nuevo-analisis':
            mainContent.innerHTML = `
                <div class="form-container">
                    <h2>Nuevo Análisis de Agua</h2>
                    <form id="nuevoAnalisisForm" class="analisis-form">
                        <div class="form-group">
                            <label for="pool">Piscina:</label>
                            <input type="text" id="pool" name="pool" required>
                        </div>

                        <div class="form-group">
                            <label for="data">Fecha:</label>
                            <input type="date" id="data" name="data" required>
                        </div>

                        <div class="form-group">
                            <label for="time">Hora:</label>
                            <input type="time" id="time" name="time" required>
                        </div>

                        <div class="form-group">
                            <label for="free_chlorine">Cloro Libre (ppm):</label>
                            <input type="number" id="free_chlorine" name="free_chlorine" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="total_chlorine">Cloro Total (ppm):</label>
                            <input type="number" id="total_chlorine" name="total_chlorine" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="cyanuric">Ácido Cianúrico (ppm):</label>
                            <input type="number" id="cyanuric" name="cyanuric" required>
                        </div>

                        <div class="form-group">
                            <label for="acidity">Acidez (pH):</label>
                            <input type="number" id="acidity" name="acidity" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="turbidity">Turbidez (NTU):</label>
                            <input type="number" id="turbidity" name="turbidity" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="renovated_water">Agua Renovada (m3):</label>
                            <input type="number" id="renovated_water" name="renovated_water" min="0" max="999999" required>
                        </div>

                        <div class="form-group">
                            <label for="recirculated_water">Agua Recirculada (m3):</label>
                            <input type="number" id="recirculated_water" name="recirculated_water" min="0" max="999999" required>
                        </div>

                        <div class="form-buttons">
                            <button type="submit" class="btn-primary">Guardar Análisis</button>
                            <button type="reset" class="btn-secondary">Limpiar Formulario</button>
                        </div>
                    </form>
                </div>
            `;

            // Agregar el event listener para el formulario
            const form = document.getElementById('nuevoAnalisisForm');
            form.addEventListener('submit', handleFormSubmit);
            break;
        case 'editar-usuario':
            const editarUsuarioSection = document.getElementById('editar-usuario');
            if (editarUsuarioSection) {
                editarUsuarioSection.style.display = 'block';
                if (params.userId) {
                    cargarDatosUsuario(params.userId);
                }
            }
            break;
    }
}

// Función para cargar los datos del usuario en el formulario de edición
async function cargarDatosUsuario(userId) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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
            throw new Error('Error al cargar los datos del usuario');
        }

        const data = await response.json();
        console.log('Datos del usuario cargados:', data);

        // Guardar los datos originales del usuario
        localStorage.setItem('currentUserData', JSON.stringify(data));

        // Llenar el formulario con los datos del usuario
        document.getElementById('editUserId').value = data.id;
        document.getElementById('editUsername').value = data.user_username;
        document.getElementById('editName').value = data.user_name;
        document.getElementById('editSurname').value = data.user_surname;
        document.getElementById('editDni').value = data.user_dni;
        document.getElementById('editEmail').value = data.user_email;

        // Configurar el rol y guardar el valor original
        const roleSelect = document.getElementById('editRole');
        roleSelect.value = data.user_role;
        roleSelect.setAttribute('data-original-role', data.user_role);

        // Limpiar los campos de contraseña
        document.getElementById('editPassword').value = '';
        document.getElementById('editConfirmPassword').value = '';

    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        mostrarNotificacion('Error al cargar los datos del usuario: ' + error.message, 'error');
    }
}

export { mostrarNotificacion, navegarA }; 