-- =====================================================================
-- ZENDA — Migración Semana 2
-- =====================================================================
-- Aplica sobre una base creada con una versión anterior de zenda_bd.sql.
-- Es idempotente: puede ejecutarse varias veces sin fallar ni duplicar.
--
--   psql "$DATABASE_URL" -f Database/migrations/2026-10-22-semana2.sql
--
-- Cambios:
--   1. Se eliminan los sub-roles Scrum (usuarios.sub_rol_intencion e
--      integrantes_grupo.rol_scrum): el líder es grupos.lider_id.
--   2. grupos.cupo_maximo (RN-009).
--   3. carpetas.estado_carpeta (RN-018, HU-025).
--   4. Historial de instructor_ficha: fecha_inicio, fecha_fin y estado
--      (H-07, HU-011). Una sola asignación vigente por instructor/ficha.
--   5. Índices de consulta y recálculo de estados existentes.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Sin sub-roles Scrum
-- ---------------------------------------------------------------------
ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "sub_rol_intencion";
ALTER TABLE "integrantes_grupo" DROP COLUMN IF EXISTS "rol_scrum";

-- ---------------------------------------------------------------------
-- 2. Cupo del grupo
-- ---------------------------------------------------------------------
ALTER TABLE "grupos" ADD COLUMN IF NOT EXISTS "cupo_maximo" int;
UPDATE "grupos" SET "cupo_maximo" = 6 WHERE "cupo_maximo" IS NULL;
ALTER TABLE "grupos" ALTER COLUMN "cupo_maximo" SET DEFAULT 6;
ALTER TABLE "grupos" ALTER COLUMN "cupo_maximo" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_grupos_cupo'
  ) THEN
    ALTER TABLE "grupos"
      ADD CONSTRAINT "chk_grupos_cupo" CHECK ("cupo_maximo" BETWEEN 1 AND 50);
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 3. Estado de la carpeta
-- ---------------------------------------------------------------------
ALTER TABLE "carpetas"
  ADD COLUMN IF NOT EXISTS "estado_carpeta" varchar(20) NOT NULL DEFAULT 'Pendiente';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_carpetas_estado'
  ) THEN
    ALTER TABLE "carpetas"
      ADD CONSTRAINT "chk_carpetas_estado"
      CHECK ("estado_carpeta" IN ('Pendiente', 'En revisión', 'Aprobada', 'Desaprobada'));
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 4. Historial de instructor_ficha
-- ---------------------------------------------------------------------
ALTER TABLE "instructor_ficha"
  ADD COLUMN IF NOT EXISTS "fecha_inicio" date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE "instructor_ficha" ADD COLUMN IF NOT EXISTS "fecha_fin" date;
ALTER TABLE "instructor_ficha"
  ADD COLUMN IF NOT EXISTS "estado" varchar(20) NOT NULL DEFAULT 'Activo';

UPDATE "instructor_ficha"
SET "fecha_inicio" = COALESCE("fecha_inicio", CURRENT_DATE),
    "estado" = CASE WHEN "fecha_fin" IS NULL THEN 'Activo' ELSE 'Inactivo' END;

-- La unicidad pasa a ser parcial: solo una asignación vigente por par.
ALTER TABLE "instructor_ficha" DROP CONSTRAINT IF EXISTS "unq_instructor_ficha";
CREATE UNIQUE INDEX IF NOT EXISTS "uq_instructor_ficha_vigente"
  ON "instructor_ficha" ("instructor_id", "ficha_id")
  WHERE "fecha_fin" IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_instructor_ficha_fechas'
  ) THEN
    ALTER TABLE "instructor_ficha"
      ADD CONSTRAINT "chk_instructor_ficha_fechas"
      CHECK ("fecha_fin" IS NULL OR "fecha_fin" >= "fecha_inicio");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_instructor_ficha_estado'
  ) THEN
    ALTER TABLE "instructor_ficha"
      ADD CONSTRAINT "chk_instructor_ficha_estado"
      CHECK (
        ("estado" = 'Activo' AND "fecha_fin" IS NULL)
        OR ("estado" = 'Inactivo' AND "fecha_fin" IS NOT NULL)
      );
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 5. Restricciones e índices de consulta
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_fases_estado'
  ) THEN
    ALTER TABLE "fases"
      ADD CONSTRAINT "chk_fases_estado"
      CHECK ("estado_fase" IN ('Pendiente', 'En revisión', 'Aprobada', 'Desaprobada'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_evaluaciones_resultado'
  ) THEN
    ALTER TABLE "evaluaciones"
      ADD CONSTRAINT "chk_evaluaciones_resultado"
      CHECK ("resultado" IN ('APROBADO', 'REPROBADO'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_fichas_programa" ON "fichas" ("programa_id");
CREATE INDEX IF NOT EXISTS "idx_grupos_ficha" ON "grupos" ("ficha_id");
CREATE INDEX IF NOT EXISTS "idx_integrantes_grupo_usuario" ON "integrantes_grupo" ("usuario_id");
CREATE INDEX IF NOT EXISTS "idx_integrantes_grupo_grupo" ON "integrantes_grupo" ("grupo_id");
CREATE INDEX IF NOT EXISTS "idx_fases_proyecto" ON "fases" ("proyecto_id");
CREATE INDEX IF NOT EXISTS "idx_carpetas_fase" ON "carpetas" ("fase_id");
CREATE INDEX IF NOT EXISTS "idx_evidencias_carpeta" ON "evidencias" ("carpeta_id");
CREATE INDEX IF NOT EXISTS "idx_evaluaciones_evidencia_fecha"
  ON "evaluaciones" ("evidencia_id", "fecha_evaluacion" DESC, "evaluacion_id" DESC);

-- ---------------------------------------------------------------------
-- 6. Recalcular estados con la evaluación vigente
-- ---------------------------------------------------------------------
UPDATE "carpetas" c
SET "estado_carpeta" = calc.estado
FROM (
  SELECT c2."carpeta_id",
         CASE
           WHEN COUNT(ev."evidencia_id") = 0 THEN 'Pendiente'
           WHEN BOOL_OR(ult."resultado" = 'REPROBADO') THEN 'Desaprobada'
           WHEN BOOL_AND(ult."resultado" = 'APROBADO') THEN 'Aprobada'
           ELSE 'En revisión'
         END AS estado
  FROM "carpetas" c2
  LEFT JOIN "evidencias" ev ON ev."carpeta_id" = c2."carpeta_id"
  LEFT JOIN LATERAL (
    SELECT e2."resultado"
    FROM "evaluaciones" e2
    WHERE e2."evidencia_id" = ev."evidencia_id"
    ORDER BY e2."fecha_evaluacion" DESC, e2."evaluacion_id" DESC
    LIMIT 1
  ) ult ON true
  GROUP BY c2."carpeta_id"
) calc
WHERE c."carpeta_id" = calc."carpeta_id";

UPDATE "fases" f
SET "estado_fase" = calc.estado
FROM (
  SELECT f2."fase_id",
         CASE
           WHEN COUNT(ev."evidencia_id") = 0 THEN 'Pendiente'
           WHEN BOOL_OR(ult."resultado" = 'REPROBADO') THEN 'Desaprobada'
           WHEN BOOL_AND(ult."resultado" = 'APROBADO') THEN 'Aprobada'
           ELSE 'En revisión'
         END AS estado
  FROM "fases" f2
  LEFT JOIN "carpetas" c2 ON c2."fase_id" = f2."fase_id"
  LEFT JOIN "evidencias" ev ON ev."carpeta_id" = c2."carpeta_id"
  LEFT JOIN LATERAL (
    SELECT e2."resultado"
    FROM "evaluaciones" e2
    WHERE e2."evidencia_id" = ev."evidencia_id"
    ORDER BY e2."fecha_evaluacion" DESC, e2."evaluacion_id" DESC
    LIMIT 1
  ) ult ON true
  GROUP BY f2."fase_id"
) calc
WHERE f."fase_id" = calc."fase_id";

COMMIT;
