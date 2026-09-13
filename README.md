# API - Sistema de Contratos de Arrendamiento y Venta de Equipos

## Instalación

1. Instala las dependencias:
   ```
   npm install
   ```

2. Copia `.env.example` a `.env`:
   ```
   cp .env.example .env
   ```

3. Abre `.env` y coloca tus datos reales de Supabase:
   - `SUPABASE_URL`: la encuentras en Supabase > Project Settings > API > Project URL
   - `SUPABASE_KEY`: usa la "service_role" key (para desarrollo local) o la "anon" key
     si vas a exponer esto públicamente más adelante con Row Level Security configurado.

4. Corre el servidor:
   ```
   npm run dev
   ```

5. Prueba que funciona entrando a: `http://localhost:3000/health`
   Deberías ver: `{"status":"ok"}`

## Endpoints disponibles (módulo clientes)

| Método | Ruta            | Qué hace                       |
|--------|-----------------|--------------------------------|
| GET    | /clientes       | Lista todos los clientes       |
| GET    | /clientes/:id   | Obtiene un cliente específico  |
| POST   | /clientes       | Crea un cliente nuevo          |
| PUT    | /clientes/:id   | Actualiza un cliente existente |
| DELETE | /clientes/:id   | Elimina un cliente             |

### Ejemplo para crear un cliente (con curl)

```
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","documento":"12345678","contacto":"555-1234","direccion":"Calle 1"}'
```

## Estructura del proyecto

```
src/
  db/
    supabaseClient.js      -> conexión única a Supabase, usada por todos los controladores
  controllers/
    clientes.controller.js -> lógica de cada operación (crear, leer, actualizar, borrar)
  routes/
    clientes.routes.js     -> conecta cada URL con su función del controlador
  app.js                    -> configuración de Express y registro de módulos
  server.js                 -> arranca el servidor
```

## Cómo agregar el siguiente módulo (ej. "equipos")

Este patrón se repite igual para cada tabla:

1. Crea `src/controllers/equipos.controller.js` (copia la estructura de `clientes.controller.js`, cambiando el nombre de la tabla y los campos).
2. Crea `src/routes/equipos.routes.js` (copia `clientes.routes.js`, cambiando el nombre del controlador).
3. En `src/app.js`, agrega dos líneas:
   ```js
   const equiposRoutes = require('./routes/equipos.routes');
   app.use('/equipos', equiposRoutes);
   ```

Como cada módulo vive en su propio archivo, pedirle este cambio a la IA nunca debería tocar el código de "clientes" que ya tienes funcionando — solo agrega archivos nuevos y dos líneas en `app.js`.
