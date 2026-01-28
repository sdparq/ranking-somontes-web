# Ranking Tenis Somontes

Aplicacion web para gestionar el ranking de tenis del club Somontes.

## Estructura del Proyecto

```
ranking-somontes-web/
├── index.html          # Pagina principal con ranking ATP
├── series.html         # Pagina de series y grupos
├── directorio.html     # Directorio de jugadores
├── admin.html          # Panel de administracion
├── css/
│   └── styles.css      # Estilos de la aplicacion
└── js/
    ├── supabase-config.js  # Configuracion y funciones de Supabase
    ├── utils.js            # Utilidades compartidas
    ├── index.js            # Logica de la pagina principal
    ├── series.js           # Logica de la pagina de series
    ├── directorio.js       # Logica del directorio
    └── admin.js            # Logica del panel de administracion
```

## Caracteristicas

- **Ranking ATP**: Tabla de ranking con busqueda y animaciones
- **Series y Grupos**: Navegacion entre series y grupos con clasificaciones
- **Directorio**: Lista de todos los jugadores activos
- **Panel Admin**: Gestion completa de jugadores, series, grupos y partidos
- **Autenticacion**: Sistema de login con Supabase Auth
- **Responsive**: Diseno adaptado a movil y escritorio

## Despliegue

### Opcion 1: Hosting estatico (Netlify, Vercel, GitHub Pages)

1. Sube la carpeta `ranking-somontes-web` a tu servicio de hosting
2. No requiere configuracion adicional - es HTML/CSS/JS puro

**Netlify:**
- Arrastra la carpeta a [netlify.com/drop](https://app.netlify.com/drop)
- O conecta tu repositorio de GitHub

**Vercel:**
- Instala Vercel CLI: `npm i -g vercel`
- Ejecuta `vercel` en la carpeta del proyecto

**GitHub Pages:**
- Sube a un repositorio de GitHub
- Ve a Settings > Pages > Source: Deploy from branch

### Opcion 2: Servidor tradicional

1. Sube los archivos a tu servidor web (Apache, Nginx, etc.)
2. No requiere backend adicional - usa Supabase

### Configuracion de dominio personalizado

1. En tu proveedor de hosting, configura el dominio
2. Apunta los DNS al servidor de hosting
3. Configura SSL (la mayoria de hostings lo hace automaticamente)

## Tecnologias

- HTML5, CSS3, JavaScript (ES6+)
- Supabase (Backend as a Service)
- Google Fonts (Inter, Playfair Display)

## Base de Datos

La aplicacion se conecta a la base de datos de Supabase existente con las siguientes tablas:

- `players` - Jugadores
- `players_public` - Vista publica de jugadores (sin datos sensibles)
- `series` - Series del torneo
- `groups` - Grupos dentro de cada serie
- `group_players` - Relacion jugadores-grupos con estadisticas
- `matches` - Partidos jugados

## Credenciales de Admin

Para acceder al panel de administracion, necesitas una cuenta con rol de administrador en Supabase.

---

Desarrollado para CPV Total Tenis - ranking@cpvtotaltenis.com
