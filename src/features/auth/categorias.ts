import type { CategoryInfo } from "../../types";
import { supabase } from "../../lib/supabase";

export const CATEGORIAS: CategoryInfo[] = [
  {
    id: "MX1",
    nome: "MX1",
    tipoMoto: "Importada",
    motor: "250cc 2T ou 450cc 4T",
    idadeMinima: 18,
    idadeMaxima: null,
    exigeCNH: true,
    exigeCBM: false,
  },
  {
    id: "MX2",
    nome: "MX2",
    tipoMoto: "Importada",
    motor: "125cc 2T ou 250cc 4T",
    idadeMinima: 16,
    idadeMaxima: 23,
    exigeCNH: false,
    exigeCBM: false,
  },
  {
    id: "MX3",
    nome: "MX3",
    tipoMoto: "Nacional",
    motor: "250cc 2T ou 450cc 4T",
    idadeMinima: 18,
    idadeMaxima: null,
    exigeCNH: true,
    exigeCBM: false,
  },
  {
    id: "MXF",
    nome: "MX Feminino",
    tipoMoto: "Livre",
    motor: "Livre",
    idadeMinima: 16,
    idadeMaxima: null,
    exigeCNH: true,
    exigeCBM: false,
  },
  {
    id: "MX_VET",
    nome: "MX Veterano",
    tipoMoto: "Livre",
    motor: "Livre",
    idadeMinima: 35,
    idadeMaxima: null,
    exigeCNH: true,
    exigeCBM: false,
  },
  {
    id: "MX_JR",
    nome: "MX Junior",
    tipoMoto: "Nacional",
    motor: "85cc 2T ou 150cc 4T",
    idadeMinima: 13,
    idadeMaxima: 16,
    exigeCNH: false,
    exigeCBM: true,
  },
  {
    id: "MX_MINI",
    nome: "MX Mini",
    tipoMoto: "Nacional",
    motor: "65cc 2T ou 110cc 4T",
    idadeMinima: 8,
    idadeMaxima: 12,
    exigeCNH: false,
    exigeCBM: true,
  },
  {
    id: "ENDURO",
    nome: "Enduro",
    tipoMoto: "Livre",
    motor: "Livre",
    idadeMinima: 18,
    idadeMaxima: null,
    exigeCNH: true,
    exigeCBM: false,
  },
  {
    id: "TRAIL",
    nome: "Trilha",
    tipoMoto: "Nacional",
    motor: "250cc 4T",
    idadeMinima: 18,
    idadeMaxima: null,
    exigeCNH: true,
    exigeCBM: false,
  },
];

export const CATEGORY_OPTIONS = CATEGORIAS.map((cat) => ({
  value: cat.id,
  label: cat.nome,
}));

export async function fetchCategorias(): Promise<CategoryInfo[]> {
  const { data, error } = await supabase
    .from("race_categories")
    .select("*")
    .order("idade_minima");

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    return CATEGORIAS;
  }

  return (data || []).map((row) => ({
    id: row.name,
    nome: row.display_name,
    tipoMoto: row.tipo_moto,
    motor: row.motor,
    idadeMinima: row.idade_minima,
    idadeMaxima: row.idade_maxima,
    exigeCNH: row.exige_cnh,
    exigeCBM: row.exige_cbm,
  }));
}
