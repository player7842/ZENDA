/*
  Sección "Mi proyecto" del panel de aprendiz.
  Muestra el README del proyecto (descripción, problema, objetivo, alcance,
  tecnologías) y la tabla de integrantes con su rol Scrum.
  Recibe el proyecto ya cargado por props desde aprendiz.jsx — no hace
  fetch propio, para no repetir la consulta cada vez que se cambia de pestaña.
*/

function MiProyecto({ datos }) {
  const { proyecto, grupo, integrantes } = datos;

  return (
    <>
      <h2>{proyecto.nombre_proyecto}</h2>
      <p className="admin-count">Código del grupo: {grupo.codigo_grupo}</p>

      <p className="admin-count instructor-evidencias-title">Descripción</p>
      <p>{proyecto.descripcion}</p>

      <p className="admin-count instructor-evidencias-title">Problema</p>
      <p>{proyecto.problema}</p>

      <p className="admin-count instructor-evidencias-title">Objetivo</p>
      <p>{proyecto.objetivo}</p>

      <p className="admin-count instructor-evidencias-title">Alcance</p>
      <p>{proyecto.alcance}</p>

      {proyecto.tecnologias && (
        <>
          <p className="admin-count instructor-evidencias-title">Tecnologías</p>
          <p>{proyecto.tecnologias}</p>
        </>
      )}

      <p className="admin-count instructor-evidencias-title">Integrantes</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol Scrum</th>
            </tr>
          </thead>
          <tbody>
            {integrantes.map((i, idx) => (
              <tr key={idx}>
                <td>{i.nombre} {i.apellido}</td>
                <td>{i.correo}</td>
                <td>{i.rol_scrum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default MiProyecto;