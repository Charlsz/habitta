import { z } from "zod";

export const AssetStatusEnum = z.enum(["active", "maintenance", "inactive"]);

// Tipo de organización (debe coincidir con el campo `type` en la tabla organizations)
export type OrgType =
  | "residential"
  | "real_estate"
  | "construction"
  | "corporate"
  | "multisede"
  | string; // fallback para tipos futuros

export const AssetTypeEnum = z.enum([
  // Residencial
  "apartment",
  "house",
  "parking",
  "common_area",
  "warehouse",
  // Inmobiliaria / comercial
  "office",
  "commercial_unit",
  "land",
  // Construcción
  "construction_front",
  "block",
  "floor",
  "work_area",
  "material_storage",
  // Corporativo / multisede
  "branch",
  "meeting_room",
  "deposit",
  // Genérico
  "other",
]);

export type AssetType = z.infer<typeof AssetTypeEnum>;

// ─── Labels por tipo ───────────────────────────────────────────────────────────
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  apartment:          "Apartamento",
  house:              "Casa",
  parking:            "Parqueadero",
  common_area:        "Zona común",
  warehouse:          "Bodega",
  office:             "Oficina",
  commercial_unit:    "Local comercial",
  land:               "Lote",
  construction_front: "Frente de obra",
  block:              "Bloque",
  floor:              "Piso / Nivel",
  work_area:          "Área de trabajo",
  material_storage:   "Bodega de materiales",
  branch:             "Sede",
  meeting_room:       "Sala de reuniones",
  deposit:            "Depósito",
  other:              "Otro",
};

// ─── Íconos por tipo ───────────────────────────────────────────────────────────
export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  apartment:          "🏠",
  house:              "🏡",
  parking:            "🚗",
  common_area:        "🌿",
  warehouse:          "📦",
  office:             "🏢",
  commercial_unit:    "🏪",
  land:               "🌱",
  construction_front: "🏗️",
  block:              "🧱",
  floor:              "📐",
  work_area:          "⚙️",
  material_storage:   "🗄️",
  branch:             "📍",
  meeting_room:       "🪑",
  deposit:            "🗃️",
  other:              "📌",
};

// ─── Colores por tipo ──────────────────────────────────────────────────────────
export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  apartment:          "bg-blue-100 text-blue-700",
  house:              "bg-green-100 text-green-700",
  parking:            "bg-yellow-100 text-yellow-700",
  common_area:        "bg-purple-100 text-purple-700",
  warehouse:          "bg-orange-100 text-orange-700",
  office:             "bg-indigo-100 text-indigo-700",
  commercial_unit:    "bg-pink-100 text-pink-700",
  land:               "bg-lime-100 text-lime-700",
  construction_front: "bg-amber-100 text-amber-700",
  block:              "bg-stone-100 text-stone-700",
  floor:              "bg-cyan-100 text-cyan-700",
  work_area:          "bg-teal-100 text-teal-700",
  material_storage:   "bg-orange-100 text-orange-700",
  branch:             "bg-violet-100 text-violet-700",
  meeting_room:       "bg-sky-100 text-sky-700",
  deposit:            "bg-gray-100 text-gray-600",
  other:              "bg-gray-100 text-gray-600",
};

// ─── Tipos disponibles según el tipo de organización ──────────────────────────
export const ASSET_TYPES_BY_ORG: Record<string, AssetType[]> = {
  residential: [
    "apartment", "house", "parking", "common_area", "warehouse", "other",
  ],
  real_estate: [
    "apartment", "house", "office", "commercial_unit", "warehouse", "land", "other",
  ],
  construction: [
    "construction_front", "block", "floor", "work_area", "material_storage", "other",
  ],
  corporate: [
    "branch", "office", "meeting_room", "deposit", "other",
  ],
  multisede: [
    "branch", "office", "meeting_room", "deposit", "other",
  ],
  // fallback: todos los tipos
  default: [
    "apartment", "house", "parking", "common_area", "warehouse",
    "office", "commercial_unit", "land",
    "construction_front", "block", "floor", "work_area", "material_storage",
    "branch", "meeting_room", "deposit",
    "other",
  ],
};

/** Devuelve los tipos de espacio disponibles para un tipo de organización dado. */
export function getAssetTypesForOrg(orgType?: string | null): AssetType[] {
  if (!orgType) return ASSET_TYPES_BY_ORG.default;
  return ASSET_TYPES_BY_ORG[orgType] ?? ASSET_TYPES_BY_ORG.default;
}

// ─── Textos contextuales por tipo de organización ─────────────────────────────
export interface OrgAssetContext {
  /** Nombre genérico del elemento (singular) */
  entityLabel: string;
  /** Nombre genérico en plural */
  entityLabelPlural: string;
  /** Placeholder para el campo "nombre" */
  namePlaceholder: string;
  /** Placeholder para código/referencia */
  codePlaceholder: string;
  /** Placeholder para ubicación */
  locationPlaceholder: string;
  /** Tipo por defecto al abrir el formulario */
  defaultType: AssetType;
  /** Emoji decorativo para el encabezado */
  headerEmoji: string;
  /** Texto explicativo del módulo */
  moduleDescription: string;
  /** Texto del botón vacío */
  emptyText: string;
}

export const ORG_ASSET_CONTEXT: Record<string, OrgAssetContext> = {
  residential: {
    entityLabel:        "Espacio",
    entityLabelPlural:  "Espacios",
    namePlaceholder:    "Ej: Apartamento 402, Zona BBQ",
    codePlaceholder:    "Ej: APT-402",
    locationPlaceholder:"Ej: Torre A, Piso 4",
    defaultType:        "apartment",
    headerEmoji:        "🏘️",
    moduleDescription:  "Registra los espacios de tu conjunto: apartamentos, parqueaderos, bodegas y zonas comunes. Asígnalos a residentes y vincúlalos a solicitudes.",
    emptyText:          "Aún no has registrado ningún espacio. Crea el primero para poder asignarlo a un residente.",
  },
  real_estate: {
    entityLabel:        "Inmueble",
    entityLabelPlural:  "Inmuebles",
    namePlaceholder:    "Ej: Local 3, Oficina 201",
    codePlaceholder:    "Ej: LOC-03",
    locationPlaceholder:"Ej: Piso 2, Edificio Centro",
    defaultType:        "apartment",
    headerEmoji:        "🏢",
    moduleDescription:  "Registra los inmuebles que administras: apartamentos, casas, oficinas y locales. Asígnalos a arrendatarios y vincula sus solicitudes de mantenimiento.",
    emptyText:          "Aún no has registrado ningún inmueble. Crea el primero para poder asignarlo a un arrendatario.",
  },
  construction: {
    entityLabel:        "Área",
    entityLabelPlural:  "Áreas",
    namePlaceholder:    "Ej: Frente Norte, Bloque B",
    codePlaceholder:    "Ej: FN-01",
    locationPlaceholder:"Ej: Etapa 2, Nivel 3",
    defaultType:        "construction_front",
    headerEmoji:        "🏗️",
    moduleDescription:  "Registra las áreas de tu proyecto: frentes de obra, bloques, pisos y zonas de trabajo. Vincula novedades y tickets a cada área.",
    emptyText:          "Aún no has registrado ningún área. Crea la primera para poder asignarle novedades.",
  },
  corporate: {
    entityLabel:        "Espacio",
    entityLabelPlural:  "Espacios",
    namePlaceholder:    "Ej: Sala Principal, Oficina 3",
    codePlaceholder:    "Ej: SALA-01",
    locationPlaceholder:"Ej: Piso 2, Ala norte",
    defaultType:        "office",
    headerEmoji:        "🏛️",
    moduleDescription:  "Registra los espacios de tu organización: oficinas, salas de reuniones y depósitos. Asígnalos a equipos y vincula solicitudes de soporte.",
    emptyText:          "Aún no has registrado ningún espacio. Crea el primero para poder asignarlo a un equipo.",
  },
  multisede: {
    entityLabel:        "Sede",
    entityLabelPlural:  "Sedes",
    namePlaceholder:    "Ej: Sede Norte, Oficina Cali",
    codePlaceholder:    "Ej: SEDE-CAL",
    locationPlaceholder:"Ej: Carrera 5 #20-30, Cali",
    defaultType:        "branch",
    headerEmoji:        "📍",
    moduleDescription:  "Registra todas tus sedes y puntos de operación. Supervisa lo que pasa en cada una desde un solo lugar.",
    emptyText:          "Aún no has registrado ninguna sede. Crea la primera para empezar a supervisarla.",
  },
};

/** Devuelve el contexto textual adecuado para un tipo de organización. */
export function getOrgAssetContext(orgType?: string | null): OrgAssetContext {
  if (!orgType) return ORG_ASSET_CONTEXT.residential;
  return ORG_ASSET_CONTEXT[orgType] ?? {
    entityLabel:        "Espacio",
    entityLabelPlural:  "Espacios",
    namePlaceholder:    "Ej: Espacio 1",
    codePlaceholder:    "Ej: ESP-01",
    locationPlaceholder:"Ej: Piso 2, Bloque A",
    defaultType:        "other",
    headerEmoji:        "📌",
    moduleDescription:  "Registra los espacios físicos de tu organización y asígnalos a las personas o solicitudes correspondientes.",
    emptyText:          "Aún no has registrado ningún espacio.",
  };
}

// ─── Schema Zod ───────────────────────────────────────────────────────────────
export const assetSchema = z.object({
  organization_id: z.string().uuid(),
  name:            z.string().min(2, "El nombre del espacio es requerido"),
  asset_type:      AssetTypeEnum.default("other"),
  code:            z.string().optional().nullable(),
  description:     z.string().optional().nullable(),
  location:        z.string().optional().nullable(),
  status:          AssetStatusEnum.default("active"),
  metadata:        z.record(z.string(), z.unknown()).optional().nullable(),
});

export type AssetStatus = z.infer<typeof AssetStatusEnum>;
export type AssetInsert = z.input<typeof assetSchema>;

export interface Asset {
  id:              string;
  organization_id: string;
  name:            string;
  asset_type:      AssetType;
  code:            string | null;
  description:     string | null;
  location:        string | null;
  status:          AssetStatus;
  metadata:        Record<string, unknown> | null;
  created_at:      string;
  updated_at:      string;
}
