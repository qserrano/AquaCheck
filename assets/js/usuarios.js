// Configuración del API
export const API_BASE_URL = 'http://localhost:3000';

export async function cargarUsuario() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log('Datos del usuario en localStorage:', userData);

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
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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

// Exportar la función para uso global
window.mostrarCrearUsuario = mostrarCrearUsuario;

// Cargar usuario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarUsuario); 