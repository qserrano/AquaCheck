-- AquaCheck Database Schema para Docker
-- Adaptado del dump original

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Crear tipo de rol de usuario
CREATE TYPE public.user_role_type AS ENUM (
    'administrador',
    'tecnico',
    'usuario'
);

-- Crear tabla de análisis
CREATE TABLE public.analysis (
    id_analysis SERIAL PRIMARY KEY,
    pool character varying(255) NOT NULL,
    data date NOT NULL,
    "time" time without time zone NOT NULL,
    free_chlorine numeric(5,2) NOT NULL,
    total_chlorine numeric(5,2) NOT NULL,
    cyanuric numeric(5,0) NOT NULL,
    acidity numeric(5,2) NOT NULL,
    turbidity numeric(5,2) NOT NULL,
    renovated_water numeric(10,0) NOT NULL,
    recirculated_water numeric(10,0) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    analyst character varying(100) NOT NULL
);

-- Crear tabla de migraciones
CREATE TABLE public.migrations (
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    user_username character varying(255) UNIQUE NOT NULL,
    user_email character varying(255) UNIQUE NOT NULL,
    user_password character varying(255) NOT NULL,
    user_role character varying(255) NOT NULL,
    user_name character varying(255) NOT NULL,
    user_surname character varying(255),
    user_dni character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de análisis (del archivo original)
INSERT INTO public.analysis (id_analysis, pool, data, "time", free_chlorine, total_chlorine, cyanuric, acidity, turbidity, renovated_water, recirculated_water, created_at, analyst) VALUES
(2, 'Multiusos', '2024-06-12', '10:00:00', 2.59, 3.10, 76, 7.46, 0.93, 13487, 191910, '2025-06-12 10:00:00+02', 'admin'),
(9, 'Infantil', '2024-06-12', '11:00:00', 1.96, 2.09, 3, 7.01, 0.30, 57, 12573, '2025-06-12 13:19:12.837004+02', 'admin'),
(10, 'Multiusos', '2024-06-17', '10:00:00', 1.69, 1.91, 68, 7.59, 0.00, 13497, 204420, '2025-06-12 22:27:19.924714+02', 'admin'),
(11, 'Multiusos', '2024-06-18', '10:00:00', 1.66, 1.81, 80, 7.56, 0.46, 13533, 207020, '2025-06-15 23:16:08.475403+02', 'admin'),
(12, 'Infantil', '2024-06-18', '11:00:00', 0.25, 0.99, 5, 7.29, 0.00, 5933, 13564, '2025-06-15 23:17:59.594528+02', 'user'),
(13, 'Multiusos', '2024-06-19', '10:00:00', 2.40, 2.60, 101, 7.41, 0.83, 13533, 209590, '2025-06-15 23:25:01.754883+02', 'user'),
(14, 'Infantil', '2024-06-19', '11:00:00', 0.54, 1.08, 9, 7.31, 0.00, 5933, 13721, '2025-06-15 23:26:07.336889+02', 'user'),
(15, 'Multiusos', '2024-06-20', '10:00:00', 2.25, 2.27, 93, 7.54, 0.00, 13533, 212000, '2025-06-15 23:27:51.901267+02', 'tecnic'),
(16, 'Infantil', '2024-06-20', '11:00:00', 0.63, 1.10, 1, 7.15, 0.80, 5933, 13806, '2025-06-15 23:28:50.796086+02', 'tecnic'),
(17, 'Multiusos', '2024-06-21', '10:00:00', 4.42, 4.65, 90, 7.62, 0.74, 13554, 214560, '2025-06-15 23:35:07.730393+02', 'user'),
(18, 'Infantil', '2024-06-21', '11:00:00', 0.32, 0.90, 8, 7.35, 0.88, 5982, 13950, '2025-06-15 23:36:22.977839+02', 'user');

-- Insertar migración
INSERT INTO public.migrations (id, name, executed_at) VALUES
(1, '001_create_analysis_table', '2025-06-12 13:05:33.829306+02');

-- Insertar usuarios (del archivo original)
INSERT INTO public.users (id, user_username, user_email, user_password, user_role, user_name, user_surname, user_dni, created_at) VALUES
(1, 'admin', 'admin@admin.es', '$2b$10$uvpkywrxIhvVMf47RXH8gOTgSGRtP0bgH2pkG3M1yQz7StbNwSIMW', 'administrador', 'admin', 'admin', '12345678P', '2025-06-10 15:35:34.490542+02'),
(8, 'tecnic', 'tecnico@tecnico.mail', '$2b$10$LqEiZsCXjNlJuI9HzfQoeOWFwKELh/LmO418ze/abXXxNNEEU.C16', 'tecnico', 'tecnico', 'tecnico', '12345678P', '2025-06-15 19:04:26.401914+02'),
(9, 'user', 'user@user.mail', '$2b$10$HsYlApfhEHMv.XbBlG7h..cJlRNs3c5W7LGuqORVOFLqjiq2V.gp2', 'usuario', 'usuario', 'usuario', '12345678P', '2025-06-15 19:06:02.774892+02'),
(10, 'test', 'testuser@test.mail', '$2b$10$2jPekUrgTQIUcrIScLPTYutuwctqwLHVw/82KbOme.LkdanyFi4le', 'usuario', 'usertest', 'usertest', '12345678P', '2025-06-15 19:08:10.495642+02');

-- Configurar secuencias
SELECT setval('public.analysis_id_analysis_seq', 18, true);
SELECT setval('public.migrations_id_seq', 1, true);
SELECT setval('public.users_id_seq', 10, true);

-- Otorgar permisos al usuario de la aplicación
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aquacheck_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aquacheck_user;
GRANT USAGE ON SCHEMA public TO aquacheck_user; 