# Sanos-Salvos-Front
Aplicación SPA desarrollada en React para el reporte, rastreo y geolocalización comunitaria de mascotas perdidas y encontradas en tiempo real.

---

# Características Principales

- Autenticación simulada para usuarios y organizaciones
- Mapas interactivos con OpenStreetMap y Leaflet
- Captura de coordenadas desde el mapa
- Sistema de coincidencias geográficas
- Comentarios y reportes comunitarios
- Dashboard interactivo de alertas

---

# Stack Tecnológico

- React 18+
- React Hooks
- React Leaflet
- Leaflet
- CSS3 Responsive
- Font Awesome

---

# Estructura del Proyecto

```plaintext
sanos-y-salvos-front/
├── public/
│   ├── index.html
│   ├── logo.png
│   └── mascotas/
│       ├── image1.jpg
│       ├── image2.jpg
│       └── image3.jpg
├── src/
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

---

# Instalación

## Ingresar al proyecto

```bash
cd sanos-y-salvos-front
```

## Instalar dependencias

```bash
npm install
```

---

# Ejecución

## Iniciar servidor de desarrollo

```bash
npm start
```

La aplicación quedará disponible en:

```bash
http://localhost:3000
```

---

# Cuentas de Prueba

| Perfil | Correo | Contraseña | Organización |
|---|---|---|---|
| Usuario común | user@sanos.com | 123 | ❌ |
| Fundación / Organización | fundacion@sanos.com | 123 | ✅ |

---

# Funcionalidades

## Login Simulado

Permite iniciar sesión como:

- Usuario común
- Organización/Fundación

---

## Mapa Interactivo

- Visualización de alertas
- Marcadores dinámicos
- Captura de coordenadas

---

## Registro de Mascotas

Permite registrar:

- Mascotas perdidas
- Mascotas encontradas
- Ubicación geográfica
- Observaciones

---

## Sistema de Coincidencias

Detecta coincidencias según:

- Características del animal
- Proximidad geográfica

---


## Compatibilidad Leaflet

El proyecto incluye configuración para evitar errores de iconos en Leaflet utilizando CDN compatible.

---

# Requisitos

- Node.js 18+
- NPM
- Navegador moderno

---

# Arquitectura

```text
Frontend React (:3000)
        ↓
API Gateway (:8080)
        ↓
BFF (:8083)
        ↓
Microservicios internos
```

Tecnologías utilizadas:

- React
- JavaScript
- Leaflet
- OpenStreetMap
- CSS3
- JWT
- REST API
