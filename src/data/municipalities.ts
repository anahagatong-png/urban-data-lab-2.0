/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MunicipalityPreset } from "../types";

// Raw mapping of all 308 Portuguese municipalities by District / Region
export const DISTRICTS_DATA: { [district: string]: string[] } = {
  "Aveiro": [
    "Águeda", "Albergaria-a-Velha", "Anadia", "Arouca", "Aveiro", "Castelo de Paiva", 
    "Espinho", "Estarreja", "Ílhavo", "Mealhada", "Murtosa", "Oliveira de Azeméis", 
    "Oliveira do Bairro", "Ovar", "Santa Maria da Feira", "São João da Madeira", 
    "Sever do Vouga", "Vagos", "Vale de Cambra"
  ],
  "Beja": [
    "Aljustrel", "Almodôvar", "Alvito", "Barrancos", "Beja", "Castro Verde", 
    "Cuba", "Ferreira do Alentejo", "Mértola", "Moura", "Odemira", "Ourique", 
    "Serpa", "Vidigueira"
  ],
  "Braga": [
    "Amares", "Barcelos", "Braga", "Cabeceiras de Basto", "Celorico de Basto", 
    "Esposende", "Fafe", "Guimarães", "Póvoa de Lanhoso", "Terras de Bouro", 
    "Vieira do Minho", "Vila Nova de Famalicão", "Vila Verde", "Vizela"
  ],
  "Bragança": [
    "Alfândega da Fé", "Bragança", "Carrazeda de Ansiães", "Freixo de Espada à Cinta", 
    "Macedo de Cavaleiros", "Miranda do Douro", "Mirandela", "Mogadouro", 
    "Torre de Moncorvo", "Vila Flor", "Vimioso", "Vinhais"
  ],
  "Castelo Branco": [
    "Belmonte", "Castelo Branco", "Covilhã", "Fundão", "Idanha-a-Nova", 
    "Oleiros", "Penamacor", "Proença-a-Nova", "Sertã", "Vila de Rei", "Vila Velha de Ródão"
  ],
  "Coimbra": [
    "Arganil", "Cantanhede", "Coimbra", "Condeixa-a-Nova", "Figueira da Foz", 
    "Góis", "Lousã", "Mira", "Miranda do Corvo", "Montemor-o-Velho", 
    "Oliveira do Hospital", "Pampilhosa da Serra", "Penacova", "Penela", 
    "Soure", "Tábua", "Vila Nova de Poiares"
  ],
  "Évora": [
    "Alandroal", "Arraiolos", "Borba", "Estremoz", "Évora", "Montemor-o-Novo", 
    "Mora", "Mourão", "Portel", "Redondo", "Reguengos de Monsaraz", 
    "Vendas Novas", "Viana do Alentejo", "Vila Viçosa"
  ],
  "Faro": [
    "Albufeira", "Alcoutim", "Aljezur", "Castro Marim", "Faro", "Lagoa", 
    "Lagos", "Loulé", "Monchique", "Olhão", "Portimão", "São Brás de Alportel", 
    "Silves", "Tavira", "Vila do Bispo", "Vila Real de Santo António"
  ],
  "Guarda": [
    "Aguiar da Beira", "Almeida", "Celorico da Beira", "Figueira de Castelo Rodrigo", 
    "Fornos de Algodres", "Gouveia", "Guarda", "Manteigas", "Mêda", 
    "Pinhel", "Sabugal", "Seia", "Trancoso", "Vila Nova de Foz Côa"
  ],
  "Leiria": [
    "Alcobaça", "Alvaiázere", "Ansião", "Batalha", "Bombarral", "Caldas da Rainha", 
    "Castanheira de Pera", "Figueiró dos Vinhos", "Leiria", "Marinha Grande", 
    "Nazaré", "Óbidos", "Pedrógão Grande", "Peniche", "Pombal", "Porto de Mós"
  ],
  "Lisboa": [
    "Alenquer", "Amadora", "Arruda dos Vinhos", "Azambuja", "Cadaval", 
    "Cascais", "Lisboa", "Loures", "Lourinhã", "Mafra", "Odivelas", 
    "Oeiras", "Sintra", "Sobral de Monte Agraço", "Torres Vedras", "Vila Franca de Xira"
  ],
  "Portalegre": [
    "Alter do Chão", "Arronches", "Avis", "Campo Maior", "Castelo de Vide", 
    "Crato", "Elvas", "Fronteira", "Gavião", "Marvão", "Monforte", 
    "Nisa", "Ponte de Sor", "Portalegre", "Sousel"
  ],
  "Porto": [
    "Amarante", "Baião", "Felgueiras", "Gondomar", "Lousada", "Maia", 
    "Marco de Canaveses", "Matosinhos", "Paços de Ferreira", "Paredes", 
    "Penafiel", "Porto", "Póvoa de Varzim", "Santo Tirso", "Trofa", 
    "Valongo", "Vila do Conde", "Vila Nova de Gaia"
  ],
  "Santarém": [
    "Abrantes", "Alcanena", "Almeirim", "Alpiarça", "Benavente", "Cartaxo", 
    "Chamusca", "Constância", "Coruche", "Entroncamento", "Ferreira do Zêzere", 
    "Golegã", "Mação", "Ourém", "Rio Maior", "Salvaterra de Magos", 
    "Santarém", "Sardoal", "Tomar", "Torres Novas", "Vila Nova da Barquinha"
  ],
  "Setúbal": [
    "Alcácer do Sal", "Alcochete", "Almada", "Barreiro", "Grândola", 
    "Moita", "Montijo", "Palmela", "Santiago do Cacém", "Seixal", 
    "Sesimbra", "Setúbal", "Sines"
  ],
  "Viana do Castelo": [
    "Arcos de Valdevez", "Caminha", "Melgaço", "Monção", "Paredes de Coura", 
    "Ponte da Barca", "Ponte de Lima", "Valença", "Viana do Castelo", "Vila Nova de Cerveira"
  ],
  "Vila Real": [
    "Alijó", "Boticas", "Chaves", "Mesão Frio", "Mondim de Basto", 
    "Montalegre", "Murça", "Peso da Régua", "Ribeira de Pena", "Sabrosa", 
    "Santa Marta de Penaguião", "Valpaços", "Vila Pouca de Aguiar", "Vila Real"
  ],
  "Viseu": [
    "Armamar", "Carregal do Sal", "Castro Daire", "Cinfães", "Lamego", 
    "Mangualde", "Moimenta da Beira", "Mortágua", "Nelas", "Oliveira de Frades", 
    "Penalva do Castelo", "Penedono", "Resende", "Santa Comba Dão", "São João da Pesqueira", 
    "São Pedro do Sul", "Sátão", "Sernancelhe", "Tabuaço", "Tarouca", 
    "Tondela", "Vila Nova de Paiva", "Viseu", "Vouzela"
  ],
  "Açores": [
    "Angra do Heroísmo", "Calheta (Açores)", "Corvo", "Horta", "Lagoa (Açores)", 
    "Lajes das Flores", "Lajes do Pico", "Madalena", "Nordeste", "Ponta Delgada", 
    "Povoação", "Praia da Vitória", "Ribeira Grande", "Santa Cruz da Graciosa", 
    "Santa Cruz das Flores", "São Roque do Pico", "Velas", "Vila do Porto", 
    "Vila Franca do Campo"
  ],
  "Madeira": [
    "Calheta (Madeira)", "Câmara de Lobos", "Funchal", "Machico", "Ponta do Sol", 
    "Porto Moniz", "Porto Santo", "Ribeira Brava", "Santa Cruz", "Santana", "São Vicente"
  ]
};

// Map each municipality with realistic default urban and cost settings
export function buildPreset(name: string, district: string): MunicipalityPreset {
  const nameLower = name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[ ()]/g, "_")
    .replace(/_+/g, "_");
    
  const id = `${nameLower}_${district.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", "_")}`;

  const nameLowerRaw = name.toLowerCase();
  const distLowerRaw = district.toLowerCase();

  // Baseline values helper
  let typicalCOS = 1.0;
  let typicalCES = 0.45;
  let typicalPermeability = 0.35;
  let avgBuildCost = 1300;
  let avgSalesPrice = 2000;
  let typicalMaxFloors = 4;
  let parkingRequirement = "1.5 lugares por habitação";

  // Detailed Classification for highly customized regional metrics
  if (nameLowerRaw.includes("lisboa")) {
    typicalCOS = 1.8;
    typicalCES = 0.6;
    typicalPermeability = 0.3;
    avgBuildCost = 1950;
    avgSalesPrice = 5500;
    parkingRequirement = "1.5 lugares por fogo > T1, 1 lugar por fogo T0/T1";
    typicalMaxFloors = 6;
  } else if (nameLowerRaw.includes("porto")) {
    typicalCOS = 1.4;
    typicalCES = 0.5;
    typicalPermeability = 0.35;
    avgBuildCost = 1850;
    avgSalesPrice = 4800;
    parkingRequirement = "1 a 2 lugares por fogo dependendo da tipologia";
    typicalMaxFloors = 5;
  } else if (nameLowerRaw === "cascais" || nameLowerRaw === "oeiras") {
    typicalCOS = 1.5;
    typicalCES = 0.5;
    typicalPermeability = 0.35;
    avgBuildCost = 1850;
    avgSalesPrice = 5100;
    parkingRequirement = "1.5 à 2 lugares por fogo";
    typicalMaxFloors = 5;
  } else if (nameLowerRaw === "grandola") {
    typicalCOS = 0.7;
    typicalCES = 0.3;
    typicalPermeability = 0.5;
    avgBuildCost = 1750;
    avgSalesPrice = 4900; // Comporta premium influence
    parkingRequirement = "2 lugares por fogo";
    typicalMaxFloors = 2;
  } else if (nameLowerRaw === "funchal" || nameLowerRaw === "ponta delgada") {
    typicalCOS = 1.3;
    typicalCES = 0.5;
    typicalPermeability = 0.3;
    avgBuildCost = 1500;
    avgSalesPrice = 2800;
    parkingRequirement = "1.2 lugares por fração";
    typicalMaxFloors = 4;
  } else if (nameLowerRaw === "sintra" || nameLowerRaw === "mafra" || nameLowerRaw === "loures" || nameLowerRaw === "odivelas" || nameLowerRaw === "amadora" || nameLowerRaw === "vila franca de xira") {
    typicalCOS = 1.3;
    typicalCES = 0.5;
    typicalPermeability = 0.35;
    avgBuildCost = 1550;
    avgSalesPrice = 2650;
    typicalMaxFloors = 5;
    parkingRequirement = "1.2 lugares por habitação";
  } else if (nameLowerRaw === "matosinhos" || nameLowerRaw === "vila nova de gaia" || nameLowerRaw === "maia" || nameLowerRaw === "gondomar") {
    typicalCOS = 1.25;
    typicalCES = 0.48;
    typicalPermeability = 0.38;
    avgBuildCost = 1500;
    avgSalesPrice = 2950;
    typicalMaxFloors = 4;
    parkingRequirement = "1.2 lugares por fogo";
  } else if (nameLowerRaw === "almada" || nameLowerRaw === "seixal" || nameLowerRaw === "barreiro" || nameLowerRaw === "montijo" || nameLowerRaw === "alcochete" || nameLowerRaw === "sesimbra") {
    typicalCOS = 1.3;
    typicalCES = 0.5;
    typicalPermeability = 0.35;
    avgBuildCost = 1500;
    avgSalesPrice = 2850;
    typicalMaxFloors = 4;
    parkingRequirement = "1.2 lugares por habitação";
  } else if (nameLowerRaw === "braga" || nameLowerRaw === "guimaraes") {
    typicalCOS = 1.2;
    typicalCES = 0.45;
    typicalPermeability = 0.4;
    avgBuildCost = 1300;
    avgSalesPrice = 2400;
    typicalMaxFloors = 6;
    parkingRequirement = "1 lugar por fogo (mínimo)";
  } else if (nameLowerRaw === "coimbra" || nameLowerRaw === "aveiro" || nameLowerRaw === "leiria") {
    typicalCOS = 1.15;
    typicalCES = 0.42;
    typicalPermeability = 0.42;
    avgBuildCost = 1350;
    avgSalesPrice = 2450;
    typicalMaxFloors = 5;
    parkingRequirement = "1.2 lugares por fogo";
  } else if (distLowerRaw === "lisboa") {
    typicalCOS = 1.0;
    typicalCES = 0.45;
    typicalPermeability = 0.4;
    avgBuildCost = 1400;
    avgSalesPrice = 2100;
    typicalMaxFloors = 3;
  } else if (distLowerRaw === "porto") {
    typicalCOS = 0.95;
    typicalCES = 0.42;
    typicalPermeability = 0.4;
    avgBuildCost = 1300;
    avgSalesPrice = 1750;
    typicalMaxFloors = 3;
  } else if (distLowerRaw === "faro") {
    // Coastal algarve general
    const isCoastal = ["albufeira", "loulé", "lagos", "portimão", "tavira", "vila do bispo"].includes(nameLowerRaw);
    typicalCOS = isCoastal ? 1.05 : 0.8;
    typicalCES = isCoastal ? 0.42 : 0.38;
    typicalPermeability = isCoastal ? 0.42 : 0.45;
    avgBuildCost = isCoastal ? 1550 : 1300;
    avgSalesPrice = isCoastal ? 3400 : 1850;
    typicalMaxFloors = isCoastal ? 3 : 2;
  } else if (["braga", "aveiro", "coimbra", "leiria", "viana do castelo", "setubal"].includes(distLowerRaw)) {
    typicalCOS = 0.95;
    typicalCES = 0.4;
    typicalPermeability = 0.45;
    avgBuildCost = 1250;
    avgSalesPrice = 1700;
    typicalMaxFloors = 3;
  } else if (["santarem", "evora", "beja", "portalegre", "castelo branco", "guarda", "braganca", "vila real", "viseu"].includes(distLowerRaw)) {
    // Typical Interior municipalities
    const isCapital = nameLowerRaw === distLowerRaw || nameLowerRaw === "chaves" || nameLowerRaw === "covilha";
    typicalCOS = isCapital ? 1.0 : 0.75;
    typicalCES = isCapital ? 0.42 : 0.38;
    typicalPermeability = isCapital ? 0.45 : 0.5;
    avgBuildCost = isCapital ? 1200 : 1100;
    avgSalesPrice = isCapital ? 1650 : 1000;
    typicalMaxFloors = isCapital ? 4 : 2;
  } else {
    // Default fallback
    typicalCOS = 0.9;
    typicalCES = 0.4;
    typicalPermeability = 0.45;
    avgBuildCost = 1250;
    avgSalesPrice = 1500;
    typicalMaxFloors = 3;
  }

  return {
    id,
    name,
    district,
    typicalCOS,
    typicalCES,
    typicalPermeability,
    avgBuildCost,
    avgSalesPrice,
    parkingRequirement,
    typicalMaxFloors,
  };
}

// Generate the list of all 308 concelhos
const generatedMunicipalities: MunicipalityPreset[] = [];

Object.entries(DISTRICTS_DATA).forEach(([district, muns]) => {
  muns.forEach((mun) => {
    generatedMunicipalities.push(buildPreset(mun, district));
  });
});

// Manual highly-detailed sub-zone overrides to preserve historical compatibility
const historicalOverrides: MunicipalityPreset[] = [
  {
    id: "lisboa",
    name: "Lisboa (Parque das Nações / Alvalade)",
    district: "Lisboa",
    typicalCOS: 1.8,
    typicalCES: 0.6,
    typicalPermeability: 0.3,
    avgBuildCost: 1950,
    avgSalesPrice: 5500,
    parkingRequirement: "1.5 lugares por fogo > T1, 1 lugar por fogo T0/T1",
    typicalMaxFloors: 6,
  },
  {
    id: "lisboa_historico",
    name: "Lisboa (Centro Histórico / Alfama)",
    district: "Lisboa",
    typicalCOS: 2.2,
    typicalCES: 0.85,
    typicalPermeability: 0.15,
    avgBuildCost: 2200,
    avgSalesPrice: 6500,
    parkingRequirement: "Isento ou pago em taxa de compensação municipal",
    typicalMaxFloors: 4,
  },
  {
    id: "porto",
    name: "Porto (Foz do Douro / Boavista)",
    district: "Porto",
    typicalCOS: 1.4,
    typicalCES: 0.5,
    typicalPermeability: 0.35,
    avgBuildCost: 1850,
    avgSalesPrice: 4800,
    parkingRequirement: "1 a 2 lugares por fogo dependendo da tipologia",
    typicalMaxFloors: 5,
  },
  {
    id: "porto_cedofeita",
    name: "Porto (Centro / Cedofeita)",
    district: "Porto",
    typicalCOS: 1.8,
    typicalCES: 0.7,
    typicalPermeability: 0.2,
    avgBuildCost: 1750,
    avgSalesPrice: 3900,
    parkingRequirement: "1 lugar por cada 120m2 de área bruta privada",
    typicalMaxFloors: 4,
  },
];

// Combine generated list, filtering out base "Lisboa" and "Porto" to prevent simple duplicates in visual lookup,
// because they are replaced by our beautiful detailed sub-zone presets!
const baseFiltered = generatedMunicipalities.filter(
  (m) => m.id !== "lisboa_lisboa" && m.id !== "porto_porto"
);

// Sorted final list of presets
export const PORTUGAL_MUNICIPALITIES: MunicipalityPreset[] = [
  ...historicalOverrides,
  ...baseFiltered
].sort((a, b) => {
  // Sort by name or district for easier lookup
  if (a.district !== b.district) {
    return a.district.localeCompare(b.district, "pt-PT");
  }
  return a.name.localeCompare(b.name, "pt-PT");
});
