// Configuración del API
const API_BASE_URL = 'http://localhost:3000';

// Obtener la información del usuario del localStorage
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log('Datos del usuario en localStorage:', userData);
    
    if (userData) {
        // Usar directamente los datos del localStorage
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userRole').textContent = userData.role;
    } else {
        console.log('No hay datos de usuario en localStorage');
        // Si no hay datos del usuario, redirigir al login
        window.location.href = '/login.html';
    }
});

function navegarA(ruta) {
    const mainContent = document.querySelector('.main-content');
    
    switch(ruta) {
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
        // Aquí se pueden agregar más casos para otras secciones
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Obtener y formatear la fecha y hora
    const fechaInput = document.getElementById('data').value;
    const hora = document.getElementById('time').value;
    
    // Validar que la fecha no esté vacía
    if (!fechaInput) {
        mostrarNotificacion('Error: La fecha es requerida', 'error');
        return;
    }
    
    // Asegurar que la fecha esté en formato YYYY-MM-DD
    const fecha = new Date(fechaInput).toISOString().split('T')[0];
    
    // Obtener valores de agua en litros
    const renovatedWater = parseInt(document.getElementById('renovated_water').value);
    const recirculatedWater = parseInt(document.getElementById('recirculated_water').value);

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
        pool: document.getElementById('pool').value,
        data: fecha,
        time: hora + ':00', // Agregar segundos
        free_chlorine: parseFloat(document.getElementById('free_chlorine').value),
        total_chlorine: parseFloat(document.getElementById('total_chlorine').value),
        cyanuric: parseInt(document.getElementById('cyanuric').value),
        acidity: parseFloat(document.getElementById('acidity').value),
        turbidity: parseFloat(document.getElementById('turbidity').value),
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

    console.log('Datos a enviar:', formData);

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

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Detalles del error:', errorData);
            
            // Si el token ha expirado, redirigir al login
            if (response.status === 401) {
                localStorage.removeItem('userData');
                mostrarNotificacion('La sesión ha expirado. Por favor, inicie sesión nuevamente.', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }
            
            // Mostrar errores específicos del servidor
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
        console.log('Respuesta exitosa:', result);
        
        // Mostrar mensaje de éxito
        mostrarNotificacion('Análisis guardado exitosamente', 'success');
        
        // Limpiar el formulario
        document.getElementById('nuevoAnalisisForm').reset();
        
        // Opcional: Redirigir a la vista de análisis
        setTimeout(() => {
            navegarA('ver-analisis');
        }, 2000);

    } catch (error) {
        console.error('Error completo:', error);
        mostrarNotificacion('Error al guardar el análisis: ' + error.message, 'error');
    }
}

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

function cerrarSesion() {
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
}

async function mostrarTodosAnalisis(contenedor) {
    try {
        // Limpiar el contenedor
        contenedor.innerHTML = `
            <div class="analisis-container">
                <h2>Análisis Registrados</h2>
                <div class="table-container">
                    <table class="analisis-table">
                        <thead>
                            <tr>
                                <th>Piscina</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Cloro Libre (ppm)</th>
                                <th>Cloro Total (ppm)</th>
                                <th>Ácido Cianúrico (ppm)</th>
                                <th>pH</th>
                                <th>Turbidez (NTU)</th>
                                <th>Agua Renovada (m3)</th>
                                <th>Agua Recirculada (m3)</th>
                                <th>Analista</th>
                            </tr>
                        </thead>
                        <tbody id="analisisTableBody">
                            <tr>
                                <td colspan="11" class="loading">Cargando análisis...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Obtener el token del localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        // Realizar la petición al backend
        const response = await fetch('/api/analysis', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        });

        console.log('Status de la respuesta:', response.status);
        console.log('Headers de la respuesta:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al obtener los análisis');
        }

        const data = await response.json();
        console.log('Respuesta completa del servidor:', data);

        // Extraer los datos del análisis de la respuesta
        const analisis = data.success && data.data ? data.data : [];
        console.log('Datos de análisis procesados:', analisis);
        console.log('Número de análisis encontrados:', analisis.length);

        const tbody = document.getElementById('analisisTableBody');
        
        if (analisis.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="no-data">No hay análisis registrados</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = analisis.map(analisis => `
            <tr>
                <td>${analisis.pool || ''}</td>
                <td>${analisis.data ? new Date(analisis.data).toLocaleDateString() : ''}</td>
                <td>${analisis.time || ''}</td>
                <td>${analisis.free_chlorine || ''}</td>
                <td>${analisis.total_chlorine || ''}</td>
                <td>${analisis.cyanuric || ''}</td>
                <td>${analisis.acidity || ''}</td>
                <td>${analisis.turbidity || ''}</td>
                <td>${analisis.renovated_water || ''}</td>
                <td>${analisis.recirculated_water || ''}</td>
                <td>${analisis.analyst || ''}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = `
            <div class="error-container">
                <h3>Error al cargar los análisis</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function determinarEstado(analisis) {
    // Lógica para determinar el estado basado en los valores
    const ph = analisis.acidity;
    const cloro = analisis.free_chlorine;
    const acidoCianurico = analisis.cyanuric;

    if (ph >= 7.2 && ph <= 7.6 && 
        cloro >= 1 && cloro <= 3 && 
        acidoCianurico >= 30 && acidoCianurico <= 50) {
        return 'Óptimo';
    } else if (ph >= 7.0 && ph <= 7.8 && 
               cloro >= 0.5 && cloro <= 4 && 
               acidoCianurico >= 20 && acidoCianurico <= 60) {
        return 'Regular';
    } else {
        return 'Crítico';
    }
}

function verDetalleAnalisis(id) {
    // Implementar la vista detallada del análisis
    console.log('Ver detalle del análisis:', id);
}

function editarAnalisis(id) {
    // Implementar la edición del análisis
    console.log('Editar análisis:', id);
}

async function mostrarAnalisisPorPiscina(contenedor) {
    try {
        // Obtener el token del localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        // Primero obtenemos todas las piscinas únicas
        const response = await fetch('/api/analysis', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al obtener las piscinas');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];
        
        // Obtener piscinas únicas
        const piscinas = [...new Set(analisis.map(a => a.pool))].sort();

        // Mostrar el formulario de selección
        contenedor.innerHTML = `
            <div class="analisis-container">
                <h2>Análisis por Piscina</h2>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="poolSelect">Seleccione una piscina:</label>
                    <select id="poolSelect" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                        <option value="">Seleccione una piscina</option>
                        ${piscinas.map(pool => `<option value="${pool}">${pool}</option>`).join('')}
                    </select>
                </div>
                <div id="tablaAnalisis" style="display: none;">
                    <div class="table-container">
                        <table class="analisis-table">
                            <thead>
                                <tr>
                                    <th>Piscina</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cloro Libre (ppm)</th>
                                    <th>Cloro Total (ppm)</th>
                                    <th>Ácido Cianúrico (ppm)</th>
                                    <th>pH</th>
                                    <th>Turbidez (NTU)</th>
                                    <th>Agua Renovada (m3)</th>
                                    <th>Agua Recirculada (m3)</th>
                                    <th>Analista</th>
                                </tr>
                            </thead>
                            <tbody id="analisisTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Agregar el evento change al select
        const poolSelect = document.getElementById('poolSelect');
        poolSelect.addEventListener('change', async (e) => {
            const selectedPool = e.target.value;
            const tablaAnalisis = document.getElementById('tablaAnalisis');
            const tbody = document.getElementById('analisisTableBody');

            if (!selectedPool) {
                tablaAnalisis.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`/api/analysis/pool/${encodeURIComponent(selectedPool)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los análisis de la piscina');
                }

                const data = await response.json();
                const analisis = data.success && data.data ? data.data : [];

                tablaAnalisis.style.display = 'block';

                if (analisis.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="11" class="no-data">No hay análisis registrados para esta piscina</td>
                        </tr>
                    `;
                    return;
                }

                tbody.innerHTML = analisis.map(analisis => `
                    <tr>
                        <td>${analisis.pool || ''}</td>
                        <td>${analisis.data ? new Date(analisis.data).toLocaleDateString() : ''}</td>
                        <td>${analisis.time || ''}</td>
                        <td>${analisis.free_chlorine || ''}</td>
                        <td>${analisis.total_chlorine || ''}</td>
                        <td>${analisis.cyanuric || ''}</td>
                        <td>${analisis.acidity || ''}</td>
                        <td>${analisis.turbidity || ''}</td>
                        <td>${analisis.renovated_water || ''}</td>
                        <td>${analisis.recirculated_water || ''}</td>
                        <td>${analisis.analyst || ''}</td>
                    </tr>
                `).join('');

            } catch (error) {
                console.error('Error:', error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="11" class="error-container">
                            <h3>Error al cargar los análisis</h3>
                            <p>${error.message}</p>
                        </td>
                    </tr>
                `;
            }
        });

    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = `
            <div class="error-container">
                <h3>Error al cargar los análisis</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function mostrarAnalisisPorAnalista(contenedor) {
    try {
        // Obtener el token del localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        // Primero obtenemos todos los analistas únicos
        const response = await fetch('/api/analysis', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al obtener los analistas');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];
        
        // Obtener analistas únicos
        const analistas = [...new Set(analisis.map(a => a.analyst))].sort();

        // Mostrar el formulario de selección
        contenedor.innerHTML = `
            <div class="analisis-container">
                <h2>Análisis por Analista</h2>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="analystSelect">Seleccione un analista:</label>
                    <select id="analystSelect" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                        <option value="">Seleccione un analista</option>
                        ${analistas.map(analyst => `<option value="${analyst}">${analyst}</option>`).join('')}
                    </select>
                </div>
                <div id="tablaAnalisis" style="display: none;">
                    <div class="table-container">
                        <table class="analisis-table">
                            <thead>
                                <tr>
                                    <th>Piscina</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cloro Libre (ppm)</th>
                                    <th>Cloro Total (ppm)</th>
                                    <th>Ácido Cianúrico (ppm)</th>
                                    <th>pH</th>
                                    <th>Turbidez (NTU)</th>
                                    <th>Agua Renovada (m3)</th>
                                    <th>Agua Recirculada (m3)</th>
                                    <th>Analista</th>
                                </tr>
                            </thead>
                            <tbody id="analisisTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Agregar el evento change al select
        const analystSelect = document.getElementById('analystSelect');
        analystSelect.addEventListener('change', async (e) => {
            const selectedAnalyst = e.target.value;
            const tablaAnalisis = document.getElementById('tablaAnalisis');
            const tbody = document.getElementById('analisisTableBody');

            if (!selectedAnalyst) {
                tablaAnalisis.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`/api/analysis/analyst/${encodeURIComponent(selectedAnalyst)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los análisis del analista');
                }

                const data = await response.json();
                const analisis = data.success && data.data ? data.data : [];

                tablaAnalisis.style.display = 'block';

                if (analisis.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="11" class="no-data">No hay análisis registrados para este analista</td>
                        </tr>
                    `;
                    return;
                }

                tbody.innerHTML = analisis.map(analisis => `
                    <tr>
                        <td>${analisis.pool || ''}</td>
                        <td>${analisis.data ? new Date(analisis.data).toLocaleDateString() : ''}</td>
                        <td>${analisis.time || ''}</td>
                        <td>${analisis.free_chlorine || ''}</td>
                        <td>${analisis.total_chlorine || ''}</td>
                        <td>${analisis.cyanuric || ''}</td>
                        <td>${analisis.acidity || ''}</td>
                        <td>${analisis.turbidity || ''}</td>
                        <td>${analisis.renovated_water || ''}</td>
                        <td>${analisis.recirculated_water || ''}</td>
                        <td>${analisis.analyst || ''}</td>
                    </tr>
                `).join('');

            } catch (error) {
                console.error('Error:', error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="11" class="error-container">
                            <h3>Error al cargar los análisis</h3>
                            <p>${error.message}</p>
                        </td>
                    </tr>
                `;
            }
        });

    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = `
            <div class="error-container">
                <h3>Error al cargar los análisis</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function mostrarInformesPorPiscina(contenedor) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
        }

        const response = await fetch('/api/analysis', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Error al obtener las piscinas');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];
        const piscinas = [...new Set(analisis.map(a => a.pool))].sort();

        contenedor.innerHTML = `
            <div class="analisis-container">
                <h2>Generar Informes por Piscina</h2>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="poolSelectInforme">Seleccione una piscina:</label>
                    <select id="poolSelectInforme" class="form-control" style="width: 200px; padding: 8px; margin-top: 8px;">
                        <option value="">Seleccione una piscina</option>
                        ${piscinas.map(pool => `<option value="${pool}">${pool}</option>`).join('')}
                    </select>
                </div>
                <div id="vistaPrevia" style="display: none;">
                    <h3>Vista Previa del Informe</h3>
                    <div class="table-container">
                        <table class="analisis-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cloro Lib. (ppm)</th>
                                    <th>Cloro Tot. (ppm)</th>
                                    <th>CyA (ppm)</th>
                                    <th>pH</th>
                                    <th>Turb. (NTU)</th>
                                    <th>Agua Renov. (m3)</th>
                                    <th>Agua Recir. (m3)</th>
                                    <th>Analista</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="analisisTableBody">
                            </tbody>
                        </table>
                    </div>
                    <div class="resumen-informe" style="margin: 20px 0;">
                        <h4>Resumen del Informe</h4>
                        <p id="totalAnalisis"></p>
                        <p id="periodoAnalisis"></p>
                    </div>
                    <div class="form-group" style="margin: 20px 0;">
                        <button id="generarPDF" class="btn-primary">Generar PDF</button>
                    </div>
                </div>
            </div>
        `;

        const poolSelect = document.getElementById('poolSelectInforme');
        const vistaPrevia = document.getElementById('vistaPrevia');
        const tbody = document.getElementById('analisisTableBody');
        const totalAnalisis = document.getElementById('totalAnalisis');
        const periodoAnalisis = document.getElementById('periodoAnalisis');
        const generarPDFBtn = document.getElementById('generarPDF');

        let analisisActual = [];

        poolSelect.addEventListener('change', async (e) => {
            const selectedPool = e.target.value;
            if (!selectedPool) {
                vistaPrevia.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`/api/analysis/pool/${encodeURIComponent(selectedPool)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los análisis de la piscina');
                }

                const data = await response.json();
                analisisActual = data.success && data.data ? data.data : [];

                if (analisisActual.length === 0) {
                    alert('No hay análisis registrados para esta piscina');
                    vistaPrevia.style.display = 'none';
                    return;
                }

                vistaPrevia.style.display = 'block';

                tbody.innerHTML = analisisActual.map(analisis => `
                    <tr>
                        <td>${new Date(analisis.data).toLocaleDateString()}</td>
                        <td>${analisis.time}</td>
                        <td>${analisis.free_chlorine}</td>
                        <td>${analisis.total_chlorine}</td>
                        <td>${analisis.cyanuric}</td>
                        <td>${analisis.acidity}</td>
                        <td>${analisis.turbidity}</td>
                        <td>${analisis.renovated_water}</td>
                        <td>${analisis.recirculated_water}</td>
                        <td>${analisis.analyst}</td>
                        <td>${evaluarEstado(analisis)}</td>
                    </tr>
                `).join('');

                totalAnalisis.textContent = `Total de análisis: ${analisisActual.length}`;
                periodoAnalisis.textContent = `Período: ${new Date(analisisActual[0].data).toLocaleDateString()} - ${new Date(analisisActual[analisisActual.length-1].data).toLocaleDateString()}`;

            } catch (error) {
                console.error('Error:', error);
                alert('Error al cargar los análisis: ' + error.message);
                vistaPrevia.style.display = 'none';
            }
        });

        generarPDFBtn.addEventListener('click', () => {
            if (analisisActual.length > 0) {
                generarPDFPorPiscina(poolSelect.value, analisisActual);
            }
        });

    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = `
            <div class="error-container">
                <h3>Error al cargar los informes</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function mostrarInformesPorAnalista(contenedor) {
    contenedor.innerHTML = `
        <div class="analisis-container">
            <h2>Informes por Analista</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
        </div>
    `;
}

async function mostrarInformesPorFechas(contenedor) {
    contenedor.innerHTML = `
        <div class="analisis-container">
            <h2>Informes por Rango de Fechas</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
        </div>
    `;
}

async function mostrarInformesPersonalizados(contenedor) {
    contenedor.innerHTML = `
        <div class="analisis-container">
            <h2>Informes Personalizados</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
        </div>
    `;
}

function generarPDFPorPiscina(poolName, analisis) {
    // Definir el documento
    const docDefinition = {
        pageOrientation: 'landscape',
        pageSize: 'A4',
        header: {
            text: 'AquaCheck - Informe de Análisis',
            alignment: 'center',
            margin: [0, 10, 0, 0]
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            };
        },
        content: [
            {
                text: `Informe de Análisis - Piscina: ${poolName}`,
                style: 'header',
                margin: [0, 0, 0, 20]
            },
            {
                text: `Fecha de generación: ${new Date().toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            'Fecha',
                            'Hora',
                            'Cloro Lib. (ppm)',
                            'Cloro Tot. (ppm)',
                            'CyA (ppm)',
                            'pH',
                            'Turb. (NTU)',
                            'Agua Renov. (m3)',
                            'Agua Recir. (m3)',
                            'Analista',
                            'Estado'
                        ],
                        ...analisis.map(a => [
                            new Date(a.data).toLocaleDateString(),
                            a.time,
                            a.free_chlorine,
                            a.total_chlorine,
                            a.cyanuric,
                            a.acidity,
                            a.turbidity,
                            a.renovated_water,
                            a.recirculated_water,
                            a.analyst,
                            evaluarEstado(a)
                        ])
                    ]
                }
            },
            {
                text: 'Resumen de Análisis',
                style: 'subheader',
                margin: [0, 20, 0, 10]
            },
            {
                text: `Total de análisis: ${analisis.length}`,
                margin: [0, 0, 0, 5]
            },
            {
                text: `Período: ${new Date(analisis[0].data).toLocaleDateString()} - ${new Date(analisis[analisis.length-1].data).toLocaleDateString()}`,
                margin: [0, 0, 0, 20]
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10
        }
    };

    // Generar y descargar el PDF
    pdfMake.createPdf(docDefinition).download(`Informe_${poolName}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function evaluarEstado(analisis) {
    // Función para evaluar el estado de los parámetros
    const evaluarParametro = (valor, min, max) => {
        if (valor < min) return 'Bajo';
        if (valor > max) return 'Alto';
        return 'Óptimo';
    };

    const estados = [
        evaluarParametro(analisis.free_chlorine, 1, 3), // Cloro libre
        evaluarParametro(analisis.total_chlorine, 1, 3), // Cloro total
        evaluarParametro(analisis.cyanuric, 30, 50), // Ácido cianúrico
        evaluarParametro(analisis.acidity, 7.2, 7.6), // pH
        evaluarParametro(analisis.turbidity, 0, 0.5) // Turbidez
    ];

    // Si hay algún parámetro fuera de rango, el estado general es "No óptimo"
    return estados.some(estado => estado !== 'Óptimo') ? 'No óptimo' : 'Óptimo';
} 