# AquaCheck - Guía de Docker

## Requisitos Previos

- Docker instalado en tu sistema
- Docker Compose instalado

## Instrucciones de Uso

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd AquaCheck
```

### 2. Ejecutar la aplicación con Docker Compose
```bash
docker-compose up -d
```

### 3. Verificar que los servicios estén funcionando
```bash
docker-compose ps
```

### 4. Acceder a la aplicación
- **Aplicación web**: http://localhost:3000
- **Base de datos**: localhost:5433

### 5. Ver logs de la aplicación
```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de la aplicación específicamente
docker-compose logs app

# Ver logs en tiempo real
docker-compose logs -f app
```

### 6. Detener la aplicación
```bash
docker-compose down
```

### 7. Detener y eliminar volúmenes (elimina datos de la BD)
```bash
docker-compose down -v
```

## Cómo Finalizar la Ejecución

### Detener temporalmente (mantiene datos)
```bash
docker-compose down
```
Esto detiene los contenedores pero mantiene los datos de la base de datos.

### Detener completamente (elimina datos)
```bash
docker-compose down -v
```
Esto detiene los contenedores y elimina todos los datos de la base de datos.

### Verificar que se detuvieron
```bash
docker-compose ps
```
Debería mostrar que no hay contenedores corriendo.

## Cómo Volver a Ejecutar

### Primera vez o después de cambios en el código
```bash
docker-compose up -d --build
```
Esto reconstruye la imagen y ejecuta la aplicación.

### Ejecutar sin cambios en el código
```bash
docker-compose up -d
```
Esto ejecuta la aplicación usando la imagen existente.

### Verificar el estado
```bash
docker-compose ps
```
Debería mostrar ambos contenedores (app y postgres) como "Up".

## Configuración de la Base de Datos

La base de datos se configura automáticamente con:
- **Base de datos**: aquacheck
- **Usuario**: aquacheck_user
- **Contraseña**: aquacheck_password
- **Puerto**: 5433 (externo) / 5432 (interno)

El archivo `aquacheck_docker.sql` se ejecuta automáticamente al iniciar la base de datos por primera vez.

## Credenciales de Prueba

- **Administrador**: admin / (consultar al desarrollador)
- **Técnico**: tecnic / (consultar al desarrollador)
- **Usuario**: user / (consultar al desarrollador)
- **Test**: test / (consultar al desarrollador)

## Solución de Problemas

### Si la aplicación no se conecta a la base de datos:
1. Verifica que PostgreSQL esté ejecutándose:
   ```bash
   docker-compose ps postgres
   ```

2. Revisa los logs de PostgreSQL:
   ```bash
   docker-compose logs postgres
   ```

### Si necesitas reiniciar solo un servicio:
```bash
docker-compose restart app
```

### Para reconstruir la imagen de la aplicación:
```bash
docker-compose build app
docker-compose up -d
```

### Si hay problemas de puertos:
Si el puerto 3000 o 5433 están ocupados, puedes cambiarlos en el `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Cambiar 3000 por 3001
```

## Variables de Entorno

Las variables de entorno están configuradas en el `docker-compose.yml`:
- `NODE_ENV`: production
- `PORT`: 3000
- `DB_HOST`: postgres
- `DB_PORT`: 5432
- `DB_USER`: aquacheck_user
- `DB_PASSWORD`: aquacheck_password
- `DB_NAME`: aquacheck

## Estructura de Archivos Docker

- `Dockerfile`: Configuración de la imagen de la aplicación
- `docker-compose.yml`: Orquestación de servicios
- `.dockerignore`: Archivos excluidos del contexto de Docker
- `aquacheck_docker.sql`: Script de inicialización de la base de datos 
