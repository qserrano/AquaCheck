# AquaCheck - API de Gestión de Piscinas

## Descripción
AquaCheck es una aplicación web para la gestión y análisis de calidad del agua en piscinas. Permite a técnicos, socorristas y administradores registrar y consultar análisis de agua con diferentes parámetros como cloro libre, cloro total, acidez, turbidez, etc.

## Tecnologías Utilizadas
- **Backend**: Node.js con Express y TypeScript
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Frontend**: HTML, CSS, JavaScript vanilla

## Requisitos Previos
- Node.js (versión 16 o superior)
- npm o yarn
- PostgreSQL (versión 15 o superior)
- Git

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd AquaCheck
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar la Base de Datos

#### Opción A: Instalación Manual de PostgreSQL
1. Instalar PostgreSQL en tu sistema
2. Crear una base de datos:
   ```sql
   CREATE DATABASE aquacheck;
   ```
3. Crear un usuario (opcional, puedes usar el usuario por defecto):
   ```sql
   CREATE USER tu_usuario WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE aquacheck TO tu_usuario;
   ```
4. Restaurar el dump de la base de datos:
   ```bash
   psql -U tu_usuario -d aquacheck -f aquacheck.sql
   ```

### 4. Configurar Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Configuración de la base de datos (usar tus propias credenciales)
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_password_postgres
DB_NAME=tu_nombre_bd

# Puerto del servidor
PORT=3000

# Configuración de JWT (IMPORTANTE: usar el valor exacto proporcionado)
JWT_SECRET= "solicitar al desarrollador junto con la contraseña de los usuarios de prueba"
JWT_EXPIRES_IN=1h
```

**Nota**: Reemplaza `tu_usuario_postgres`, `tu_password_postgres` y `tu_nombre_bd` con tus propias credenciales de PostgreSQL. Las introducidas en el punto 3.

### 5. Compilar el Proyecto
```bash
npm run build
```

### 6. Ejecutar la Aplicación

#### Modo Desarrollo
```bash
npm run dev
```

#### Modo Producción
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## Usuarios de Prueba

La base de datos incluye los siguientes usuarios para pruebas:

| Email | Usuario | Rol | Contraseña |
|-------|---------|-----|------------|
| admin@admin.es | admin | Administrador | (hasheada en BD) |
| tecnico@tecnico.mail | tecnic | Técnico | (hasheada en BD) |
| user@user.mail | user | Usuario | (hasheada en BD) |

**Nota**: Las contraseñas están hasheadas en la base de datos. Contacta al desarrollador para obtener las contraseñas en texto plano para las pruebas.
(Ver sección contacto)

## Estructura del Proyecto

```
AquaCheck/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── db/             # Configuración de base de datos
│   ├── middlewares/    # Middlewares de autenticación y validación
│   ├── models/         # Modelos de datos
│   ├── routes/         # Rutas de la API
│   ├── utils/          # Utilidades (autenticación JWT)
│   └── validations/    # Validaciones con Zod
├── assets/             # Archivos estáticos (CSS, JS, imágenes)
├── docs/               # Documentación
├── aquacheck.sql       # Dump de la base de datos
└── docker-compose.yml  # Configuración de Docker
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Análisis
- `GET /api/analysis` - Obtener todos los análisis
- `GET /api/analysis/:id` - Obtener análisis por ID
- `POST /api/analysis` - Crear nuevo análisis
- `PUT /api/analysis/:id` - Actualizar análisis
- `DELETE /api/analysis/:id` - Eliminar análisis

## Funcionalidades Principales

- **Gestión de Usuarios**: Registro, login y gestión de roles (administrador, técnico, socorrista)
- **Análisis de Agua**: Registro de parámetros como cloro libre, cloro total, acidez, turbidez, etc.
- **Reportes**: Generación de informes de análisis
- **Interfaz Web**: Panel de administración y formularios de entrada de datos

## Solución de Problemas

### Error de Conexión a la Base de Datos
- Verificar que PostgreSQL esté ejecutándose
- Comprobar las credenciales en el archivo `.env`
- Asegurar que la base de datos existe y el usuario tiene permisos

### Error de Autenticación JWT
- Verificar que el `JWT_SECRET` en el archivo `.env` sea exactamente: `!78183W344qh9Gq5qooq`
- Comprobar que el token no haya expirado

### Error de Compilación TypeScript
- Verificar que todas las dependencias estén instaladas: `npm install`
- Limpiar la carpeta `dist/` y recompilar: `npm run build`

## Contacto

Para cualquier duda o problema durante la instalación, contacta al desarrollador del proyecto:

- **Telegram**: [@qserrano](https://t.me/qserrano)

**Información adicional disponible por contacto:**
- JWT_SECRET para configuración
- Contraseñas en texto plano de los usuarios de prueba

## Licencia

Este proyecto está licenciado bajo Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License (CC BY-NC-ND 4.0).

Para más información, consulta el archivo [LICENSE](LICENSE) o visita: https://creativecommons.org/licenses/by-nc-nd/4.0/ 