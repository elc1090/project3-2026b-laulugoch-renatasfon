import type { DIMENSOES } from "./diagnostico.js";

export type DimensaoChave = (typeof DIMENSOES)[number];

export const CATALOGO: Record<
  DimensaoChave,
  { titulo: string; descricao: string; indicador: string; ods: number[] }
> = {
  AMBIENTAL: {
    titulo: "Estandarización de gramajes y reducción de merma orgánica",
    descricao:
      "Implementar registro de pesaje en recetas para evitar desperdicio de materia prima.",
    indicador: "% de merma mensual (Kg merma / Kg materia prima comprada)",
    ods: [12],
  },
  SOCIAL: {
    titulo: "Integración de cadena de proveedores locales",
    descricao:
      "Cotizar insumos base con productores regionales para reducir la huella de transporte y fomentar la economía local.",
    indicador: "% Gasto local de compras al mes",
    ods: [8],
  },
  ECONOMICA: {
    titulo: "Digitalización y Trazabilidad de Inventario",
    descricao:
      "Implementar control de inventario en Excel con fórmulas dinámicas para medir márgenes y controlar el gramaje exacto por lote.",
    indicador: "% de Exactitud de Inventario",
    ods: [9],
  },
};

export const REFORCO = {
  titulo: "¡Buen trabajo en esta dimensión!",
  descricao:
    "Tus prácticas actuales son sólidas. Te sugerimos mantener estos estándares operativos para seguir fortaleciendo la sostenibilidad, eficiencia y rentabilidad de tu empresa a largo plazo.",
};