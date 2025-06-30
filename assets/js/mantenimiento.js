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

// Variables globales para la gestión de análisis
let allAnalisis = [];
let currentPageAnalisis = 1;
const analisisPerPage = 10;

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
            // Crear un contenedor temporal para el formulario sin reemplazar todo el contenido
            const tempContainer = document.createElement('div');
            tempContainer.id = 'nuevo-analisis-container';
            tempContainer.className = 'content-section';
            tempContainer.style.display = 'block';
            tempContainer.innerHTML = `
                <div class="form-container">
                    <h2>Nuevo Análisis de Agua</h2>
                    <form id="nuevoAnalisisForm" class="analisis-form">
                        <div class="form-group">
                            <label for="pool">Piscina:</label>
                            <input type="text" id="pool" name="pool" required>
                        </div>

                        <div class="form-group">
                            <label for="data">Fecha:</label>
                            <input type="date" id="data" name="data" required readonly>
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

            // Remover el contenedor temporal anterior si existe
            const existingContainer = document.getElementById('nuevo-analisis-container');
            if (existingContainer) {
                existingContainer.remove();
            }

            // Agregar el nuevo contenedor al mainContent
            mainContent.appendChild(tempContainer);

            // Agregar el event listener para el formulario
            const form = document.getElementById('nuevoAnalisisForm');
            form.addEventListener('submit', handleFormSubmit);
            
            // Establecer la fecha actual en el campo de fecha
            const fechaInput = document.getElementById('data');
            const today = new Date().toISOString().split('T')[0];
            fechaInput.value = today;
            break;
        case 'crear-analisis':
            // Crear un contenedor temporal para el formulario de crear análisis
            const crearAnalisisContainer = document.createElement('div');
            crearAnalisisContainer.id = 'crear-analisis-container';
            crearAnalisisContainer.className = 'content-section';
            crearAnalisisContainer.style.display = 'block';
            crearAnalisisContainer.innerHTML = `
                <div class="form-container">
                    <h2>Crear Análisis de Agua</h2>
                    <form id="crearAnalisisForm" class="analisis-form">
                        <div class="form-group">
                            <label for="crear-pool">Piscina:</label>
                            <input type="text" id="crear-pool" name="pool" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-data">Fecha:</label>
                            <input type="date" id="crear-data" name="data" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-time">Hora:</label>
                            <input type="time" id="crear-time" name="time" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-free_chlorine">Cloro Libre (ppm):</label>
                            <input type="number" id="crear-free_chlorine" name="free_chlorine" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-total_chlorine">Cloro Total (ppm):</label>
                            <input type="number" id="crear-total_chlorine" name="total_chlorine" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-cyanuric">Ácido Cianúrico (ppm):</label>
                            <input type="number" id="crear-cyanuric" name="cyanuric" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-acidity">Acidez (pH):</label>
                            <input type="number" id="crear-acidity" name="acidity" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-turbidity">Turbidez (NTU):</label>
                            <input type="number" id="crear-turbidity" name="turbidity" step="0.01" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-renovated_water">Agua Renovada (m3):</label>
                            <input type="number" id="crear-renovated_water" name="renovated_water" min="0" max="999999" required>
                        </div>

                        <div class="form-group">
                            <label for="crear-recirculated_water">Agua Recirculada (m3):</label>
                            <input type="number" id="crear-recirculated_water" name="recirculated_water" min="0" max="999999" required>
                        </div>

                        <div class="form-buttons">
                            <button type="submit" class="btn-primary">Guardar Análisis</button>
                            <button type="reset" class="btn-secondary">Limpiar Formulario</button>
                        </div>
                    </form>
                </div>
            `;

            // Remover el contenedor temporal anterior si existe
            const existingCrearContainer = document.getElementById('crear-analisis-container');
            if (existingCrearContainer) {
                existingCrearContainer.remove();
            }

            // Agregar el nuevo contenedor al mainContent
            mainContent.appendChild(crearAnalisisContainer);

            // Agregar el event listener para el formulario
            const crearForm = document.getElementById('crearAnalisisForm');
            crearForm.addEventListener('submit', handleCrearAnalisisSubmit);
            
            // Establecer la fecha actual como valor por defecto (pero editable)
            const crearFechaInput = document.getElementById('crear-data');
            const todayCrear = new Date().toISOString().split('T')[0];
            crearFechaInput.value = todayCrear;
            break;
        case 'editar-analisis':
            // Crear un contenedor temporal para la tabla de análisis
            const editarAnalisisContainer = document.createElement('div');
            editarAnalisisContainer.id = 'editar-analisis-container';
            editarAnalisisContainer.className = 'content-section';
            editarAnalisisContainer.style.display = 'block';
            editarAnalisisContainer.innerHTML = `
                <h2>Gestión de Análisis</h2>
                <div class="analisis-controls">
                    <div class="search-box">
                        <input type="text" id="searchAnalisis" placeholder="Buscar análisis...">
                        <select id="filterPool">
                            <option value="todos">Todas las piscinas</option>
                        </select>
                    </div>
                </div>
                <div class="analisis-table-container">
                    <table class="analisis-table">
                        <thead>
                            <tr>
                                <th>Piscina</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Cloro Libre</th>
                                <th>Cloro Total</th>
                                <th>CyA</th>
                                <th>pH</th>
                                <th>Turbidez</th>
                                <th>Agua Renov.</th>
                                <th>Agua Recirc.</th>
                                <th>Analista</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="analisisTableBody">
                            <!-- Los análisis se cargarán dinámicamente aquí -->
                        </tbody>
                    </table>
                </div>
                <div class="pagination">
                    <button id="prevPageAnalisis" class="pagination-button">Anterior</button>
                    <span id="currentPageAnalisis">Página 1</span>
                    <button id="nextPageAnalisis" class="pagination-button">Siguiente</button>
                </div>
            `;

            // Remover el contenedor temporal anterior si existe
            const existingEditarContainer = document.getElementById('editar-analisis-container');
            if (existingEditarContainer) {
                existingEditarContainer.remove();
            }

            // Agregar el nuevo contenedor al mainContent
            mainContent.appendChild(editarAnalisisContainer);

            // Cargar la lista de análisis
            cargarListaAnalisisParaEdicion();
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

// Función para cargar la lista de análisis para edición
async function cargarListaAnalisisParaEdicion() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/api/analysis`, {
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
            throw new Error('Error al obtener los análisis');
        }

        const data = await response.json();
        allAnalisis = data.success && data.data ? data.data : [];

        // Cargar opciones de piscinas en el filtro
        cargarOpcionesPiscinas();
        
        // Mostrar análisis
        mostrarAnalisisParaEdicion();
        
        // Configurar event listeners
        configurarEventListenersAnalisis();

    } catch (error) {
        console.error('Error al cargar lista de análisis:', error);
        mostrarNotificacion('Error al cargar la lista de análisis: ' + error.message, 'error');
    }
}

// Función para cargar opciones de piscinas en el filtro
function cargarOpcionesPiscinas() {
    const filterPool = document.getElementById('filterPool');
    if (!filterPool) return;

    // Obtener piscinas únicas
    const piscinas = [...new Set(allAnalisis.map(analisis => analisis.pool))];
    
    // Limpiar opciones existentes excepto la primera
    filterPool.innerHTML = '<option value="todos">Todas las piscinas</option>';
    
    // Agregar opciones para cada piscina
    piscinas.forEach(piscina => {
        const option = document.createElement('option');
        option.value = piscina;
        option.textContent = piscina;
        filterPool.appendChild(option);
    });
}

// Función para mostrar análisis con paginación
function mostrarAnalisisParaEdicion() {
    const tbody = document.getElementById('analisisTableBody');
    const searchTerm = document.getElementById('searchAnalisis')?.value.toLowerCase() || '';
    const poolFilter = document.getElementById('filterPool')?.value || 'todos';

    if (!tbody) return;

    // Filtrar análisis
    let filteredAnalisis = allAnalisis.filter(analisis => {
        const matchesSearch =
            analisis.pool.toLowerCase().includes(searchTerm) ||
            analisis.analyst.toLowerCase().includes(searchTerm) ||
            analisis.id_analysis.toString().includes(searchTerm);

        const matchesPool = poolFilter === 'todos' || analisis.pool === poolFilter;

        return matchesSearch && matchesPool;
    });

    // Calcular paginación
    const totalPages = Math.ceil(filteredAnalisis.length / analisisPerPage);
    const start = (currentPageAnalisis - 1) * analisisPerPage;
    const end = start + analisisPerPage;
    const paginatedAnalisis = filteredAnalisis.slice(start, end);

    // Actualizar tabla
    tbody.innerHTML = '';
    if (paginatedAnalisis.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align: center;">No se encontraron análisis</td>
            </tr>
        `;
    } else {
        paginatedAnalisis.forEach(analisis => {
            const fecha = new Date(analisis.data).toLocaleDateString();
            const hora = analisis.time ? analisis.time.substring(0, 5) : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${analisis.pool || ''}</td>
                <td>${fecha}</td>
                <td>${hora}</td>
                <td>${analisis.free_chlorine || ''}</td>
                <td>${analisis.total_chlorine || ''}</td>
                <td>${analisis.cyanuric || ''}</td>
                <td>${analisis.acidity || ''}</td>
                <td>${analisis.turbidity || ''}</td>
                <td>${analisis.renovated_water || ''}</td>
                <td>${analisis.recirculated_water || ''}</td>
                <td>${analisis.analyst || ''}</td>
                <td class="action-buttons">
                    <button class="action-button edit-button" onclick="editarAnalisis(${analisis.id_analysis})">Editar</button>
                    <button class="action-button delete-button" onclick="eliminarAnalisis(${analisis.id_analysis})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Actualizar controles de paginación
    const currentPageElement = document.getElementById('currentPageAnalisis');
    const prevButton = document.getElementById('prevPageAnalisis');
    const nextButton = document.getElementById('nextPageAnalisis');
    
    if (currentPageElement) currentPageElement.textContent = `Página ${currentPageAnalisis} de ${totalPages}`;
    if (prevButton) prevButton.disabled = currentPageAnalisis === 1;
    if (nextButton) nextButton.disabled = currentPageAnalisis === totalPages || totalPages === 0;
}

// Función para configurar event listeners de análisis
function configurarEventListenersAnalisis() {
    // Event listeners para la paginación
    const prevButton = document.getElementById('prevPageAnalisis');
    const nextButton = document.getElementById('nextPageAnalisis');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPageAnalisis > 1) {
                currentPageAnalisis--;
                mostrarAnalisisParaEdicion();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const totalPages = Math.ceil(allAnalisis.length / analisisPerPage);
            if (currentPageAnalisis < totalPages) {
                currentPageAnalisis++;
                mostrarAnalisisParaEdicion();
            }
        });
    }

    // Event listener para el filtro de piscina
    const filterPool = document.getElementById('filterPool');
    if (filterPool) {
        filterPool.addEventListener('change', () => {
            currentPageAnalisis = 1;
            mostrarAnalisisParaEdicion();
        });
    }

    // Event listener para la búsqueda
    const searchAnalisis = document.getElementById('searchAnalisis');
    if (searchAnalisis) {
        searchAnalisis.addEventListener('input', () => {
            currentPageAnalisis = 1;
            mostrarAnalisisParaEdicion();
        });
    }
}

// Función para editar análisis
function editarAnalisis(analisisId) {
    // Crear un modal o formulario para editar
    mostrarFormularioEdicionAnalisis(analisisId);
}

// Función para eliminar análisis
async function eliminarAnalisis(analisisId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este análisis?')) {
        return;
    }

    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/api/analysis/${analisisId}`, {
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
            throw new Error('Error al eliminar el análisis');
        }

        mostrarNotificacion('Análisis eliminado correctamente', 'success');
        cargarListaAnalisisParaEdicion();
    } catch (error) {
        console.error('Error al eliminar análisis:', error);
        mostrarNotificacion('Error al eliminar el análisis: ' + error.message, 'error');
    }
}

// Función para mostrar formulario de edición de análisis
async function mostrarFormularioEdicionAnalisis(analisisId) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/api/analysis/${analisisId}`, {
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
            throw new Error('Error al obtener los datos del análisis');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : null;

        if (!analisis) {
            throw new Error('No se encontró el análisis');
        }

        // Crear modal con formulario de edición
        crearModalEdicionAnalisis(analisis);

    } catch (error) {
        console.error('Error al cargar datos del análisis:', error);
        mostrarNotificacion('Error al cargar los datos del análisis: ' + error.message, 'error');
    }
}

// Función para crear modal de edición
function crearModalEdicionAnalisis(analisis) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Editar Análisis - ID: ${analisis.id_analysis}</h3>
                <span class="close" onclick="cerrarModal()">&times;</span>
            </div>
            <form id="modalEditarAnalisisForm" class="analisis-form">
                <input type="hidden" id="modal-editar-id" value="${analisis.id_analysis}">
                
                <div class="form-group">
                    <label for="modal-editar-pool">Piscina:</label>
                    <input type="text" id="modal-editar-pool" value="${analisis.pool || ''}" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-data">Fecha:</label>
                    <input type="date" id="modal-editar-data" value="${analisis.data || ''}" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-time">Hora:</label>
                    <input type="time" id="modal-editar-time" value="${analisis.time ? analisis.time.substring(0, 5) : ''}" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-free_chlorine">Cloro Libre (ppm):</label>
                    <input type="number" id="modal-editar-free_chlorine" value="${analisis.free_chlorine || ''}" step="0.01" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-total_chlorine">Cloro Total (ppm):</label>
                    <input type="number" id="modal-editar-total_chlorine" value="${analisis.total_chlorine || ''}" step="0.01" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-cyanuric">Ácido Cianúrico (ppm):</label>
                    <input type="number" id="modal-editar-cyanuric" value="${analisis.cyanuric || ''}" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-acidity">Acidez (pH):</label>
                    <input type="number" id="modal-editar-acidity" value="${analisis.acidity || ''}" step="0.01" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-turbidity">Turbidez (NTU):</label>
                    <input type="number" id="modal-editar-turbidity" value="${analisis.turbidity || ''}" step="0.01" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-renovated_water">Agua Renovada (m3):</label>
                    <input type="number" id="modal-editar-renovated_water" value="${analisis.renovated_water || ''}" min="0" max="999999" required>
                </div>

                <div class="form-group">
                    <label for="modal-editar-recirculated_water">Agua Recirculada (m3):</label>
                    <input type="number" id="modal-editar-recirculated_water" value="${analisis.recirculated_water || ''}" min="0" max="999999" required>
                </div>

                <div class="form-buttons">
                    <button type="submit" class="btn-primary">Guardar Cambios</button>
                    <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Agregar event listener para el formulario
    const form = document.getElementById('modalEditarAnalisisForm');
    form.addEventListener('submit', handleModalEditarAnalisisSubmit);
}

// Función para cerrar modal
function cerrarModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Función para manejar el envío del formulario del modal
async function handleModalEditarAnalisisSubmit(event) {
    event.preventDefault();
    
    const analisisId = document.getElementById('modal-editar-id').value;
    
    // Obtener y formatear la fecha y hora
    const fechaInput = document.getElementById('modal-editar-data').value;
    const hora = document.getElementById('modal-editar-time').value;
    
    // Validar que la fecha no esté vacía
    if (!fechaInput) {
        mostrarNotificacion('Error: La fecha es requerida', 'error');
        return;
    }
    
    // Asegurar que la fecha esté en formato YYYY-MM-DD
    const fecha = new Date(fechaInput).toISOString().split('T')[0];
    
    // Obtener valores de agua en litros
    const renovatedWater = parseInt(document.getElementById('modal-editar-renovated_water').value);
    const recirculatedWater = parseInt(document.getElementById('modal-editar-recirculated_water').value);

    // Validar que los valores estén dentro del rango permitido
    if (renovatedWater < 0 || renovatedWater > 999999) {
        mostrarNotificacion('Error: El agua renovada debe estar entre 0 y 999999 litros', 'error');
        return;
    }

    if (recirculatedWater < 0 || recirculatedWater > 999999) {
        mostrarNotificacion('Error: El agua recirculada debe estar entre 0 y 999999 litros', 'error');
        return;
    }

    const formData = {
        pool: document.getElementById('modal-editar-pool').value,
        data: fecha,
        time: hora + ':00', // Agregar segundos
        free_chlorine: parseFloat(document.getElementById('modal-editar-free_chlorine').value),
        total_chlorine: parseFloat(document.getElementById('modal-editar-total_chlorine').value),
        cyanuric: parseInt(document.getElementById('modal-editar-cyanuric').value),
        acidity: parseFloat(document.getElementById('modal-editar-acidity').value),
        turbidity: parseFloat(document.getElementById('modal-editar-turbidity').value),
        renovated_water: renovatedWater,
        recirculated_water: recirculatedWater,
        analyst: document.getElementById('userName').textContent
    };

    // Obtener el token del localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.token) {
        mostrarNotificacion('Error: No hay sesión activa. Por favor, inicie sesión nuevamente.', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/analysis/${analisisId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${userData.token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            
            if (response.status === 401) {
                localStorage.removeItem('userData');
                mostrarNotificacion('La sesión ha expirado. Por favor, inicie sesión nuevamente.', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }
            
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                const errorMessages = errorData.errors.map(error => {
                    if (typeof error === 'object') {
                        return `${error.param || 'Campo'}: ${error.msg || JSON.stringify(error)}`;
                    }
                    return error;
                }).join('\n');
                throw new Error(errorMessages);
            }
            
            throw new Error(errorData?.message || `Error del servidor: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        mostrarNotificacion('Análisis actualizado exitosamente', 'success');
        
        // Cerrar modal
        cerrarModal();
        
        // Recargar la lista de análisis
        cargarListaAnalisisParaEdicion();

    } catch (error) {
        console.error('Error completo:', error);
        mostrarNotificacion('Error al actualizar el análisis: ' + error.message, 'error');
    }
}

// Función para manejar el envío del formulario de crear análisis
async function handleCrearAnalisisSubmit(event) {
    event.preventDefault();
    
    // Obtener y formatear la fecha y hora
    const fechaInput = document.getElementById('crear-data').value;
    const hora = document.getElementById('crear-time').value;
    
    // Validar que la fecha no esté vacía
    if (!fechaInput) {
        mostrarNotificacion('Error: La fecha es requerida', 'error');
        return;
    }
    
    // Asegurar que la fecha esté en formato YYYY-MM-DD
    const fecha = new Date(fechaInput).toISOString().split('T')[0];
    
    // Obtener valores de agua en litros
    const renovatedWater = parseInt(document.getElementById('crear-renovated_water').value);
    const recirculatedWater = parseInt(document.getElementById('crear-recirculated_water').value);

    // Validar que los valores estén dentro del rango permitido
    if (renovatedWater < 0 || renovatedWater > 999999) {
        mostrarNotificacion('Error: El agua renovada debe estar entre 0 y 999999 litros', 'error');
        return;
    }

    if (recirculatedWater < 0 || recirculatedWater > 999999) {
        mostrarNotificacion('Error: El agua recirculada debe estar entre 0 y 999999 litros', 'error');
        return;
    }

    const formData = {
        pool: document.getElementById('crear-pool').value,
        data: fecha,
        time: hora + ':00', // Agregar segundos
        free_chlorine: parseFloat(document.getElementById('crear-free_chlorine').value),
        total_chlorine: parseFloat(document.getElementById('crear-total_chlorine').value),
        cyanuric: parseInt(document.getElementById('crear-cyanuric').value),
        acidity: parseFloat(document.getElementById('crear-acidity').value),
        turbidity: parseFloat(document.getElementById('crear-turbidity').value),
        renovated_water: renovatedWater,
        recirculated_water: recirculatedWater,
        analyst: document.getElementById('userName').textContent
    };

    // Obtener el token del localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.token) {
        mostrarNotificacion('Error: No hay sesión activa. Por favor, inicie sesión nuevamente.', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${userData.token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            
            if (response.status === 401) {
                localStorage.removeItem('userData');
                mostrarNotificacion('La sesión ha expirado. Por favor, inicie sesión nuevamente.', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }
            
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                const errorMessages = errorData.errors.map(error => {
                    if (typeof error === 'object') {
                        return `${error.param || 'Campo'}: ${error.msg || JSON.stringify(error)}`;
                    }
                    return error;
                }).join('\n');
                throw new Error(errorMessages);
            }
            
            throw new Error(errorData?.message || `Error del servidor: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        mostrarNotificacion('Análisis creado exitosamente', 'success');
        document.getElementById('crearAnalisisForm').reset();
        
        // Establecer la fecha actual nuevamente después del reset
        const crearFechaInput = document.getElementById('crear-data');
        const todayCrear = new Date().toISOString().split('T')[0];
        crearFechaInput.value = todayCrear;

    } catch (error) {
        console.error('Error completo:', error);
        mostrarNotificacion('Error al crear el análisis: ' + error.message, 'error');
    }
}

export { mostrarNotificacion, navegarA };

// Hacer las funciones globales para que puedan ser llamadas desde el HTML
window.editarAnalisis = editarAnalisis;
window.eliminarAnalisis = eliminarAnalisis;
window.cerrarModal = cerrarModal; 