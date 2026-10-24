# ZENDA — Pull Request

## ¿Qué cambia este PR?
Describe la funcionalidad, corrección o documentación que se agrega o modifica.

## ¿A qué bloque de la Semana 1–2 pertenece?
- [ ] Configuración / variables de entorno
- [ ] Base de datos (esquema o migración)
- [ ] Backend: autenticación y sesión
- [ ] Backend: correo (mailer)
- [ ] Backend: reglas de negocio
- [ ] Backend: coordinador
- [ ] Pruebas (unitarias o integración)
- [ ] CI / GitHub Actions
- [ ] Frontend: rutas y App
- [ ] Frontend: API y autenticación UI
- [ ] Frontend: páginas legales o Home
- [ ] Documentación

## Checklist antes de pedir revisión
- [ ] `pnpm --dir backend lint` pasa
- [ ] `pnpm --dir backend test` pasa (con PostgreSQL si aplica)
- [ ] `pnpm --dir frontend lint` pasa
- [ ] `pnpm --dir frontend build` pasa
- [ ] Las migraciones SQL son idempotentes y se aplican dos veces sin error
- [ ] Si toca la base de datos, se actualizó la documentación de esquema
- [ ] Si agrega rutas de API, se documentó en `docs/Referencia-Tecnica/api-endpoints.md`
- [ ] Si cambia variables de entorno, se actualizó `.env.example` y `backend/.env.example`
- [ ] Los mensajes de commit siguen *Conventional Commits* en español
- [ ] No se incluyeron credenciales hardcodeadas ni secretos reales

## ¿Rompe algún contrato de API o esquema de BD?
- [ ] No
- [ ] Sí (explicar abajo y crear migración si es necesario)

## Revisor asignado
@nombre-de-revisor