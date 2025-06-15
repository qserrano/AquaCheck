// Configuración del API
export const API_BASE_URL = 'http://localhost:3000';

export async function cargarUsuario() {
    const userData = JSON.parse(localStorage.getItem('userData'));

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

export async function crearUsuario(userData) {
    try {
        const sessionData = JSON.parse(localStorage.getItem('userData'));
        if (!sessionData || !sessionData.token) {
            throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear el usuario');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export function mostrarCrearUsuario() {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Mostrar la sección de crear usuario
    const crearUsuarioSection = document.getElementById('crear-usuario');
    if (crearUsuarioSection) {
        crearUsuarioSection.style.display = 'block';
    }

    // Configurar el formulario
    const form = document.getElementById('createUserForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const name = document.getElementById('name').value;
            const surname = document.getElementById('surname').value;
            const dni = document.getElementById('dni').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('role').value;

            // Ocultar mensajes previos
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                document.getElementById('errorMessage').textContent = 'Las contraseñas no coinciden';
                document.getElementById('errorMessage').style.display = 'block';
                return;
            }

            try {
                const userData = {
                    user_username: username,
                    user_password: password,
                    user_role: role,
                    user_name: name,
                    user_surname: surname,
                    user_dni: dni,
                    user_email: email
                };

                await crearUsuario(userData);

                // Mostrar mensaje de éxito
                document.getElementById('successMessage').textContent = 'Usuario creado correctamente';
                document.getElementById('successMessage').style.display = 'block';

                // Limpiar el formulario
                form.reset();

                // Ocultar el mensaje de éxito después de 3 segundos
                setTimeout(() => {
                    document.getElementById('successMessage').style.display = 'none';
                }, 3000);

            } catch (error) {
                document.getElementById('errorMessage').textContent = error.message;
                document.getElementById('errorMessage').style.display = 'block';
            }
        });
    }
}

export async function actualizarUsuario(userId, userDataToUpdate) {
    try {
        const sessionData = JSON.parse(localStorage.getItem('userData'));
        if (!sessionData || !sessionData.token) {
            throw new Error('No hay sesión activa');
        }

        console.log('Token de sesión:', sessionData.token);
        console.log('Actualizando usuario ID:', userId);
        console.log('Datos a actualizar:', JSON.stringify(userDataToUpdate, null, 2));

        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(userDataToUpdate)
        });

        console.log('Status de respuesta:', response.status);
        console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('Datos de respuesta:', JSON.stringify(responseData, null, 2));

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
                return;
            }

            // Manejar el formato específico de error de la API
            if (responseData.errors && Array.isArray(responseData.errors)) {
                const errorMessage = responseData.errors.map(error => {
                    if (typeof error === 'object') {
                        return Object.values(error).join(', ');
                    }
                    return error;
                }).join(', ');
                throw new Error(errorMessage);
            } else if (responseData.message) {
                throw new Error(responseData.message);
            } else {
                throw new Error('Error al actualizar el usuario');
            }
        }

        return responseData;
    } catch (error) {
        console.error('Error en actualizarUsuario:', error);
        throw error;
    }
}

// Función para mostrar mensajes de notificación
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

// Función para manejar el envío del formulario de edición
document.getElementById('editUserForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
        const userId = document.getElementById('editUserId').value;
        const formData = new FormData(this);
        const newPassword = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validar que las contraseñas coincidan si se proporciona una nueva
        if (newPassword && newPassword !== confirmPassword) {
            mostrarMensaje('Las contraseñas no coinciden', 'error');
            return;
        }

        // Crear objeto con los datos del formulario con el prefijo 'user_'
        const userData = {
            user_username: formData.get('username'),
            user_name: formData.get('name'),
            user_surname: formData.get('surname'),
            user_dni: formData.get('dni'),
            user_email: formData.get('email'),
            user_role: formData.get('role')
        };

        // Solo incluir la contraseña si se proporciona una nueva
        if (newPassword) {
            userData.user_password = newPassword;
        }

        console.log('Valores del formulario:', {
            userId,
            username: formData.get('username'),
            name: formData.get('name'),
            surname: formData.get('surname'),
            dni: formData.get('dni'),
            email: formData.get('email'),
            role: formData.get('role'),
            hasNewPassword: !!newPassword
        });

        // Verificar si el rol ha cambiado
        const roleSelect = document.getElementById('editRole');
        const originalRole = roleSelect.getAttribute('data-original-role');
        const newRole = formData.get('role');

        if (originalRole !== newRole) {
            console.log('Rol ha cambiado:', { original: originalRole, nuevo: newRole });
        }

        const updatedUser = await actualizarUsuario(userId, userData);
        console.log('Usuario actualizado:', updatedUser);

        mostrarMensaje('Usuario editado correctamente', 'success');

        // Recargar la lista de usuarios y mostrar la vista de listado
        await cargarUsuarios();
        navegarA('listar-usuarios');
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        mostrarMensaje(error.message, 'error');
    }
});

// Exportar la función para uso global
window.mostrarCrearUsuario = mostrarCrearUsuario;

// Cargar usuario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarUsuario); 