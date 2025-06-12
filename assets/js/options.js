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

function navegarA(destino) {
    const mainContent = document.querySelector('.main-content');
    
    switch(destino) {
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
                            <label for="renovated_water">Agua Renovada (L):</label>
                            <input type="number" id="renovated_water" name="renovated_water" min="0" max="999999" required>
                        </div>

                        <div class="form-group">
                            <label for="recirculated_water">Agua Recirculada (L):</label>
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