import { mostrarNotificacion } from './mantenimiento.js';

const API_BASE_URL = 'http://localhost:3000';

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
        mostrarNotificacion('Análisis guardado exitosamente', 'success');
        document.getElementById('nuevoAnalisisForm').reset();
        
        setTimeout(() => {
            navegarA('ver-analisis');
        }, 2000);

    } catch (error) {
        console.error('Error completo:', error);
        mostrarNotificacion('Error al guardar el análisis: ' + error.message, 'error');
    }
}

async function mostrarTodosAnalisis(contenedor) {
    try {
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
            throw new Error('Error al obtener los análisis');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];

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

async function mostrarAnalisisPorPiscina(contenedor) {
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
            throw new Error('Error al obtener los analistas');
        }

        const data = await response.json();
        const analisis = data.success && data.data ? data.data : [];
        const analistas = [...new Set(analisis.map(a => a.analyst))].sort();

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

export {
    handleFormSubmit,
    mostrarTodosAnalisis,
    mostrarAnalisisPorPiscina,
    mostrarAnalisisPorAnalista,
    evaluarEstado
}; 