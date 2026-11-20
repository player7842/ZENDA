/* Consultas de protección para eliminaciones administrativas. */

export async function obtenerDependenciasUsuario(db, usuarioId) {
  const { rows } = await db.query(
    `SELECT
       (SELECT count(*)::int FROM grupos WHERE lider_id = $1) AS liderazgos,
       (SELECT count(*)::int FROM integrantes_grupo WHERE usuario_id = $1) AS integrantes,
       (SELECT count(*)::int FROM tareas WHERE responsable_id = $1) AS tareas,
       (SELECT count(*)::int FROM evidencias WHERE usuario_id = $1) AS evidencias,
       (SELECT count(*)::int FROM evaluaciones WHERE instructor_id = $1) AS evaluaciones,
       (SELECT count(*)::int FROM observaciones WHERE instructor_id = $1) AS observaciones,
       (SELECT count(*)::int FROM instructor_ficha WHERE instructor_id = $1) AS asignaciones`,
    [usuarioId],
  );
  return rows[0];
}

export function usuarioTieneHistorial(dependencias) {
  return Object.values(dependencias).some((cantidad) => Number(cantidad) > 0);
}

export async function obtenerDependenciasFicha(db, fichaId) {
  const { rows } = await db.query(
    `SELECT
       (SELECT count(*)::int FROM grupos g
        JOIN integrantes_grupo ig ON ig.grupo_id = g.grupo_id
        WHERE g.ficha_id = $1) AS integrantes,
       (SELECT count(*)::int FROM proyectos p
        JOIN grupos g ON g.grupo_id = p.grupo_id
        WHERE g.ficha_id = $1) AS proyectos,
       (SELECT count(*)::int FROM instructor_ficha WHERE ficha_id = $1) AS asignaciones`,
    [fichaId],
  );
  return rows[0];
}

export function fichaTieneHistorial(dependencias) {
  return Object.values(dependencias).some((cantidad) => Number(cantidad) > 0);
}
