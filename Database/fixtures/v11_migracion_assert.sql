-- =====================================================================
-- ZENDA — Assertions de la migración v11 -> Semana 2
-- =====================================================================
-- Se ejecuta después de aplicar 002_semana2.sql (idealmente dos veces)
-- sobre Database/fixtures/v11_migracion.sql.
-- =====================================================================

DO $$
DECLARE
  v_count int;
  v_text text;
BEGIN
  -- 1. Columnas y tablas de la Semana 2
  SELECT count(*) INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'usuarios'
    AND column_name = 'sub_rol_intencion';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'usuarios.sub_rol_intencion no se eliminó';
  END IF;

  SELECT count(*) INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'integrantes_grupo'
    AND column_name = 'rol_scrum';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'integrantes_grupo.rol_scrum no se eliminó';
  END IF;

  SELECT count(*) INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'usuarios'
    AND column_name IN ('token_version', 'acepta_terminos', 'acepta_privacidad',
                        'acepta_cookies', 'acepta_tratamiento_datos',
                        'fecha_aceptacion_legal');
  IF v_count <> 6 THEN
    RAISE EXCEPTION 'Faltan columnas de seguridad/aceptaciones legales: %', v_count;
  END IF;

  SELECT count(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'recuperacion_contrasena';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'No se creó recuperacion_contrasena';
  END IF;

  SELECT count(*) INTO v_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'carpetas'
    AND column_name = 'estado_carpeta';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'No se creó carpetas.estado_carpeta';
  END IF;

  -- 2. El grupo de trabajo legado llamado "General" no fue promovido
  SELECT count(*) INTO v_count
  FROM grupos
  WHERE grupo_id = 2
    AND NOT es_general
    AND nombre_grupo = 'General'
    AND codigo_grupo = 'PRY-LEGACY1';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'El grupo de proyecto llamado General fue alterado por la migración';
  END IF;

  SELECT count(*) INTO v_count
  FROM proyectos p
  JOIN grupos g ON g.grupo_id = p.grupo_id
  WHERE g.grupo_id = 2 AND NOT g.es_general;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'El proyecto del grupo General legado quedó inaccesible';
  END IF;

  -- 3. Exactamente un General por ficha, con código y cupo normalizados
  SELECT count(*) INTO v_count FROM grupos WHERE ficha_id = 1 AND es_general;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'La ficha 1 no tiene exactamente un General: %', v_count;
  END IF;

  SELECT count(*) INTO v_count
  FROM grupos
  WHERE ficha_id = 1 AND es_general
    AND grupo_id = 1
    AND codigo_grupo = 'GEN-2724285'
    AND cupo_maximo = 50;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'El General de la ficha 1 no quedó normalizado';
  END IF;

  SELECT count(*) INTO v_count FROM grupos WHERE ficha_id = 2 AND es_general;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'La ficha 2 no tiene exactamente un General: %', v_count;
  END IF;

  SELECT count(*) INTO v_count
  FROM grupos
  WHERE ficha_id = 2 AND es_general
    AND codigo_grupo = 'GEN-2724310'
    AND lider_id = 5
    AND cupo_maximo = 50;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'El General creado para la ficha 2 es incorrecto';
  END IF;

  -- 4. Ubicaciones heredadas preservadas y CHECK añadido como NOT VALID
  SELECT ubicacion INTO v_text FROM evidencias WHERE evidencia_id = 3;
  IF v_text <> 'documento-local.pdf' THEN
    RAISE EXCEPTION 'Se reescribió una ubicación heredada inválida: %', v_text;
  END IF;

  SELECT count(*) INTO v_count
  FROM evidencias
  WHERE evidencia_id = 4 AND length(ubicacion) > 500;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Se reescribió una ubicación heredada demasiado larga';
  END IF;

  SELECT count(*) INTO v_count
  FROM pg_constraint
  WHERE conname = 'chk_evidencias_ubicacion' AND NOT convalidated;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'chk_evidencias_ubicacion no quedó NOT VALID';
  END IF;

  -- 5. Normalizaciones que sí debe hacer la migración
  SELECT count(*) INTO v_count
  FROM evaluaciones
  WHERE evaluacion_id = 1 AND resultado = 'APROBADO';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'No se normalizó el resultado de evaluación';
  END IF;

  SELECT count(*) INTO v_count
  FROM evidencias
  WHERE evidencia_id = 5 AND tipo_evidencia = 'Enlace';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'No se normalizó el tipo de evidencia heredado';
  END IF;

  -- 6. Cascada con evidencia mixta (una aprobada y una sin evaluar)
  SELECT estado_carpeta INTO v_text FROM carpetas WHERE carpeta_id = 1;
  IF v_text <> 'En revisión' THEN
    RAISE EXCEPTION 'Cascada de carpeta mixta incorrecta: %', v_text;
  END IF;

  SELECT estado_fase INTO v_text FROM fases WHERE fase_id = 1;
  IF v_text <> 'En revisión' THEN
    RAISE EXCEPTION 'Cascada de fase mixta incorrecta: %', v_text;
  END IF;

  -- 7. Historial de instructor y cupo mínimo
  SELECT count(*) INTO v_count
  FROM instructor_ficha
  WHERE fecha_inicio IS NULL OR estado <> 'Activo';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'instructor_ficha no quedó normalizado';
  END IF;

  SELECT count(*) INTO v_count
  FROM grupos g
  WHERE g.cupo_maximo < (
    SELECT count(*)
    FROM integrantes_grupo ig
    WHERE ig.grupo_id = g.grupo_id
      AND ig.estado_integrante = 'Activo'
  );
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'Algún grupo quedó con cupo menor a sus integrantes activos';
  END IF;
END $$;
