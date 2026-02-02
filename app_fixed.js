// ========================= CONFIGURACIÓN EMISOR =========================
// Basado en tu CFDI de ejemplo de NOMAD GENETICS (RFC, régimen, CP, etc.)
const EMISOR = {
  nombre: "NOMAD GENETICS",
  rfc: "NIN190116954",
  regimenFiscal: "601",          // General de Ley Personas Morales
  direccion: "LA MORENA No. 811, Col. NARVARTE PONIENTE, CP 03020, CDMX, MÉXICO",
  cp: "03020"
};

// ========================= ESTADO GLOBAL =========================
let satCatalogs = null;

// empresa seleccionada
let empresaActual = "sanare"; // por defecto

// datos actuales en memoria (se usan en toda la app)
let clientes = [];
let productos = [];
let compras = [];
let conceptosFactura = [];
let pagos = [];
let notasCredito = [];
let facturas = [];

// Última factura registrada (para botón "Cancelar última factura")
let ultimaFacturaId = null;
// Factura seleccionada para cancelar en el modal
let facturaEnCancelacionId = null;

function aplicarParchesClientesBase(clientesArr, baseArr) {
  const mapaBase = new Map(
    baseArr.map(c => [ (c.nombre || "").toUpperCase().trim(), c ])
  );
  return clientesArr.map(c => {
    const key = (c.nombre || "").toUpperCase().trim();
    const base = mapaBase.get(key);
    if (!base) return c;
    return {
      ...c,
      rfc: c.rfc && c.rfc.trim() ? c.rfc : (base.rfc || ""),
      regimen: c.regimen && String(c.regimen).trim() ? c.regimen : (base.regimen || ""),
      cp: c.cp && String(c.cp).trim() ? c.cp : (base.cp || ""),
      direccion: c.direccion && c.direccion.trim() ? c.direccion : (base.direccion || "")
    };
  });
}
// claves de almacenamiento por empresa
const LS_KEYS = {
  clientesSanare: "factu_clientes_sanare",
  clientesNomad: "factu_clientes_nomad",
  productosSanare: "factu_productos_sanare",
  productosNomad: "factu_productos_nomad",
  comprasSanare: "factu_compras_sanare",
  comprasNomad: "factu_compras_nomad",
  pagosSanare: "factu_pagos_sanare",
  pagosNomad: "factu_pagos_nomad",
  notasSanare: "factu_notas_sanare",
  notasNomad: "factu_notas_nomad",
  facturasSanare: "factu_facturas_sanare",
  facturasNomad: "factu_facturas_nomad",
  empresaActual: "factu_empresa_actual",
  folioSanare: "factu_folio_sanare",
  folioNomad: "factu_folio_nomad"
};

// catálogos base cargados desde tus Excel
const CLIENTES_BASE_SANARE = [
  {
    "id": "sanare-cli-1",
    "nombre": "PUBLICO EN GENERAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "sanare-cli-2",
    "nombre": "Cliente Mostrador",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "sanare-cli-3",
    "nombre": "LUIS GABRIEL MONTES MEDINA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VERACRUZ",
    "email": ""
  },
  {
    "id": "sanare-cli-4",
    "nombre": "JOSE FERNANDO TORRES GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "XOCHITLA :MZ.3LT.44",
    "email": ""
  },
  {
    "id": "sanare-cli-5",
    "nombre": "VICTOR MANUEL ALLENDE TELLEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ROBLE",
    "email": ""
  },
  {
    "id": "sanare-cli-6",
    "nombre": "SANDRA PALACIOS MARQUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RAFAEL ANGELPEÑA",
    "email": ""
  },
  {
    "id": "sanare-cli-7",
    "nombre": "MARCOS AUGUSTO PORTILLO CARRILLO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV 5 DE MAYO",
    "email": ""
  },
  {
    "id": "sanare-cli-8",
    "nombre": "CUITLAHUAC OMAR CASTRO VERDUGO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TERCERA OESTE",
    "email": ""
  },
    {
    "id": "sanare-cli-9",
    "nombre": "KAREN HERAS GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "DOCTOR AGUSTIN TORRES CRAVIOTO",
    "email": ""
  }
];
const CLIENTES_BASE_NOMAD = [
  {
    "id": "nomad-cli-1",
    "nombre": "PUBLICO GENERAL",
    "rfc": "XAXX010101000",
    "regimen": "616",
    "usoCfdi": "",
    "cp": "03020",
    "direccion": "Información de Poblacién Colonia, Ciudad de México, CP 03020, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-2",
    "nombre": "SOHIN GENETICS",
    "rfc": "DOL120925842",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "01210",
    "direccion": "GUILLERMO GONZALEZ CAMARENA 19, Col. CENTRO DE SANTA FE, ALVARO OBREGON, Ciudad de México, CP 01210, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-3",
    "nombre": "SEGUROS INBURSA, S.A., GRUPO FINANCIERO INBURSA",
    "rfc": "SIN9408027L7",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "14060",
    "direccion": "AVENIDA INSURGENTES SUR, Col. PEÑA POBRE, TLALPAN, Ciudad de México, CP 14060, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-4",
    "nombre": "ALEJANDRO ZARCO MENDOZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PAOLO UCCELLO",
    "email": ""
  },
  {
    "id": "nomad-cli-5",
    "nombre": "AXA SEGUROS",
    "rfc": "ASE93116231",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "03200",
    "direccion": "AV FELIX CUEVAS, Col. Tlacoquemécal, Benito Juarez, Ciudad de México, CP 03200, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-6",
    "nombre": "SEGUROS SURA",
    "rfc": "R&S811221KR6",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "01090",
    "direccion": "AVENIDA DE LOS INSURGENTES SUR, Col. Loreto, Alvaro Obregon, Ciudad de México, CP 01090, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-7",
    "nombre": "PROMOTORA SN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CORAS",
    "email": ""
  },
  {
    "id": "nomad-cli-8",
    "nombre": "FRANCISCO JAVIER GONZALEZ BARRENA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LOMA DE PINAL DE AMOLES",
    "email": ""
  },
  {
    "id": "nomad-cli-9",
    "nombre": "OMAR YAIR CASTILLO CRUZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ANGELA PERALTA",
    "email": ""
  },
  {
    "id": "nomad-cli-10",
    "nombre": "MARIO ENRIQUE ESQUINCA MICELI",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "8A PONIENTE NORTE",
    "email": ""
  },
  {
    "id": "nomad-cli-11",
    "nombre": "GUILLERMINA SOFIA COPPEL KELLY",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ERNESTO COPPEL CAMPAÑA",
    "email": ""
  },
  {
    "id": "nomad-cli-12",
    "nombre": "GILBERTO CELIS LONGORIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TARASCO",
    "email": ""
  },
  {
    "id": "nomad-cli-13",
    "nombre": "CARLOS EDUARDO ZERON BENITEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE 5",
    "email": ""
  },
  {
    "id": "nomad-cli-14",
    "nombre": "MEDALFA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "EMILIANO ZAPATA BODEGA B2, B3, B4 PARQUE INDUSTRIAL LERMA",
    "email": ""
  },
  {
    "id": "nomad-cli-15",
    "nombre": "MARIANELA SANTOVEÑA RODRIGUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PROL. CALLE 7",
    "email": ""
  },
  {
    "id": "nomad-cli-16",
    "nombre": "MARIA ADRIANA DELABRA DEL RAZO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-17",
    "nombre": "CLINICA DIGITAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JESUS DEL MONTE",
    "email": ""
  },
  {
    "id": "nomad-cli-18",
    "nombre": "SYLVIA DIANA ORDOÑEZ Y AROESTE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "INSURGENTES SUR",
    "email": ""
  },
  {
    "id": "nomad-cli-19",
    "nombre": "KARLO MAGNO DE JESUS GOMEZ GASCA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PLAYA CALETA",
    "email": ""
  },
  {
    "id": "nomad-cli-20",
    "nombre": "URSINA IBETT REYES GUTIERREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FORRAJES",
    "email": ""
  },
  {
    "id": "nomad-cli-21",
    "nombre": "GUILLERMO BRENIS TEJEDA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TEPEACA",
    "email": ""
  },
  {
    "id": "nomad-cli-22",
    "nombre": "JUAN CARLOS GARCIA CANO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CERRO DE LAS TORRES",
    "email": ""
  },
  {
    "id": "nomad-cli-23",
    "nombre": "CENTRO DE INFUSION PEDIATRICA INTEGRAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PERIFERICO SUR",
    "email": ""
  },
  {
    "id": "nomad-cli-24",
    "nombre": "PUNTO PEN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VERSALLES",
    "email": ""
  },
  {
    "id": "nomad-cli-25",
    "nombre": "AGNI ATENEA TERRES RINCON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GRAL. BENJAMIN ARQUIMEDES",
    "email": ""
  },
  {
    "id": "nomad-cli-26",
    "nombre": "LOURDES ESTHER GUEVARA CASTAÑEDA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PITAGORAS 305-104",
    "email": ""
  },
  {
    "id": "nomad-cli-27",
    "nombre": "ABEL PEREZ LEDESMA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE HEROICO COLEGIO MILITAR S/N",
    "email": ""
  },
  {
    "id": "nomad-cli-28",
    "nombre": "JOSE RENE MANUEL ANGUIANO MARTINEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LIC. LUIS DONALDO COLOSIO MURRIETA",
    "email": ""
  },
  {
    "id": "nomad-cli-29",
    "nombre": "MARCELA NOEMI RAMOS GUILLEN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA ROBLES",
    "email": ""
  },
  {
    "id": "nomad-cli-30",
    "nombre": "GRUPO CUAUHTEMOC MOCTEZUMA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ALFONSO REYES NTE",
    "email": ""
  },
  {
    "id": "nomad-cli-31",
    "nombre": "FERNANDO UREÑA NUÑEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "NICOLAS BRAVO",
    "email": ""
  },
  {
    "id": "nomad-cli-32",
    "nombre": "MARIA ESTELA GONZALEZ SANCHEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA TAMAULIPAS",
    "email": ""
  },
  {
    "id": "nomad-cli-33",
    "nombre": "PUEBLICO EN GENERAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BEST DOCTOR INSURANCE 5201 BLUE LAGOON DRIVE SUITE 300 MIAMI  FL 33126",
    "email": ""
  },
  {
    "id": "nomad-cli-34",
    "nombre": "MYRIAM SERRA CASTELLANOS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CERRO DE LAS CAMPANAS 380",
    "email": ""
  },
  {
    "id": "nomad-cli-35",
    "nombre": "ADRIANA SALAZAR ANZURES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "80 MANZANA 24 LOTE 32",
    "email": ""
  },
  {
    "id": "nomad-cli-36",
    "nombre": "NUVIA ARELY NAVARRETE CERVANTES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CAMINO A LA VITELA KM 1",
    "email": ""
  },
  {
    "id": "nomad-cli-37",
    "nombre": "JESSICA GUERRERO ALVAREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CARRIL NTE A SN CRISTOBAL",
    "email": ""
  },
  {
    "id": "nomad-cli-38",
    "nombre": "RAUL CABALLERO LOPEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RIO BALSAS 28",
    "email": ""
  },
  {
    "id": "nomad-cli-39",
    "nombre": "HECTOR MORALES ROJAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CAMINO AL DESIETO DE LOS LEONES 5232",
    "email": ""
  },
  {
    "id": "nomad-cli-40",
    "nombre": "PRODUCTOS ROCHE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CERRADA DE BEZARES",
    "email": ""
  },
  {
    "id": "nomad-cli-41",
    "nombre": "LESLEE JOVANA LOPEZ GUTIERREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GERARDO CARRASCO S/N",
    "email": ""
  },
  {
    "id": "nomad-cli-42",
    "nombre": "JAVIER TEJEDA VALLEJO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "EL ROSARIO",
    "email": ""
  },
  {
    "id": "nomad-cli-43",
    "nombre": "MARIA EUGENIA ESTRADA NOBLE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LAGUNA DE MAYRAN TORRE LONDRES DEPTO. 203",
    "email": ""
  },
  {
    "id": "nomad-cli-44",
    "nombre": "LUIS MANUEL ALVA VALDIVIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MAIZ",
    "email": ""
  },
  {
    "id": "nomad-cli-45",
    "nombre": "ANCORA INGENIERIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VIVEROS DE ASIS",
    "email": ""
  },
  {
    "id": "nomad-cli-46",
    "nombre": "PABLO CUARTO GONZALEZ RUBIO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "EJIDO SAN LORENZO TEZONCO",
    "email": ""
  },
  {
    "id": "nomad-cli-47",
    "nombre": "ENRIQUE ANTONIO SANTA CRUZ POLANCO Y BERUMEN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "21A",
    "email": ""
  },
  {
    "id": "nomad-cli-48",
    "nombre": "FERNANDO MATIAS MORENO YNTRIAGO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LLUVIA",
    "email": ""
  },
  {
    "id": "nomad-cli-49",
    "nombre": "ENRIQUE FERNANDO SALAZAR DIAZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PASEO DEL RIO",
    "email": ""
  },
  {
    "id": "nomad-cli-50",
    "nombre": "EDGAR ALBERTO SANCHEZ HERNANDEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VILLAS DE MERCURIO",
    "email": ""
  },
  {
    "id": "nomad-cli-51",
    "nombre": "CAMIORENTA MX",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CUAUHTEMOC",
    "email": ""
  },
  {
    "id": "nomad-cli-52",
    "nombre": "MIROSLAWA MAJA MISZALSKA HARASYMOWICZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "HERACLITO",
    "email": ""
  },
  {
    "id": "nomad-cli-53",
    "nombre": "JOSE ANTONIO DAVILA ORTIZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "HACIENDA DEL CIERVO",
    "email": ""
  },
  {
    "id": "nomad-cli-54",
    "nombre": "MARIA CELINDA GONZALEZ NAVARRETE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "POK TA POK",
    "email": ""
  },
  {
    "id": "nomad-cli-55",
    "nombre": "GUSTAVO DE LA SERNA CARDENAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PROLONGACION VASCO DE QUIROGA,  EDIFICIO E DEPTO. 1302",
    "email": ""
  },
  {
    "id": "nomad-cli-56",
    "nombre": "MIGUEL ANGEL HERRERA TORRES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PROGRESO",
    "email": ""
  },
  {
    "id": "nomad-cli-57",
    "nombre": "FERNANDO GARCIA GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ASTRON",
    "email": ""
  },
  {
    "id": "nomad-cli-58",
    "nombre": "JESUS ANTONIO AVILA GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ACTOPAN COLONIA  SANTA JULIA INFONAVIT",
    "email": ""
  },
  {
    "id": "nomad-cli-59",
    "nombre": "ESTEBAN BERNAL QUINTANA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PROLONGACION VICENTE GUERRERO",
    "email": ""
  },
  {
    "id": "nomad-cli-60",
    "nombre": "MARIA DEL CARMEN ARIAS POLLEDO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV DE LS TORRES",
    "email": ""
  },
  {
    "id": "nomad-cli-61",
    "nombre": "EDGAR ULISES ESPINOSA MORENO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE RIO LAJAS",
    "email": ""
  },
  {
    "id": "nomad-cli-62",
    "nombre": "ALVARO URQUIZA ESTRADA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GRANJA EL PILAR",
    "email": ""
  },
  {
    "id": "nomad-cli-63",
    "nombre": "JOSE ANTONIO BLANCO GAMBOA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "COLONIA MACUZARI",
    "email": ""
  },
  {
    "id": "nomad-cli-64",
    "nombre": "BIBIANA CAROLINA SANDOVAL ENRIQUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LUIS REYES SPINDOLA",
    "email": ""
  },
  {
    "id": "nomad-cli-65",
    "nombre": "FRANCISCO JOSE MICHAUS MONTES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "EJE CENTRAL LAZARO CARDENAS",
    "email": ""
  },
  {
    "id": "nomad-cli-66",
    "nombre": "MARIA ESQUIVEL  QUINTERO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ENRIQUE REBSAMEN",
    "email": ""
  },
  {
    "id": "nomad-cli-67",
    "nombre": "ANTONIO POMPA GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CANGREJO",
    "email": ""
  },
  {
    "id": "nomad-cli-68",
    "nombre": "URGENT 24",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TAMAULIPAS",
    "email": ""
  },
  {
    "id": "nomad-cli-69",
    "nombre": "MARIA DE LOURDES CRUZ RODRIGUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CIRCUNVALACION",
    "email": ""
  },
  {
    "id": "nomad-cli-70",
    "nombre": "FRANCISCO JAVIER GONGORA VAZQUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "55",
    "email": ""
  },
  {
    "id": "nomad-cli-71",
    "nombre": "CASA DE LA AMISTAD PARA NIÑOS CON CANCER",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ALDAMA",
    "email": ""
  },
  {
    "id": "nomad-cli-72",
    "nombre": "ROBERTO ESCOBAR ARIAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "Esperanza",
    "email": ""
  },
  {
    "id": "nomad-cli-73",
    "nombre": "UNIVERSIDAD NACIONAL AUTONOMA DE MEXICO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-74",
    "nombre": "CARLOS ALBERTO SILICEO CURIEL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ANTONIO DE MENDOZA",
    "email": ""
  },
  {
    "id": "nomad-cli-75",
    "nombre": "PAULINA MONTSERRAT MOLINA TELLEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FELIX CUEVAS",
    "email": ""
  },
  {
    "id": "nomad-cli-76",
    "nombre": "JULIETA GUTIERREZ ZAMORA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SALINEROS",
    "email": ""
  },
  {
    "id": "nomad-cli-77",
    "nombre": "SANIDAD DIGITAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOSE RUBEN ROMERO",
    "email": ""
  },
  {
    "id": "nomad-cli-78",
    "nombre": "PEDRO IVAN CORREA BENAVENTE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GUADALUPE",
    "email": ""
  },
  {
    "id": "nomad-cli-79",
    "nombre": "ROGERIO ARMANDO CHACON SOLIS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "QUINTANA ROO  PISO 5 CONSULTORIO 507",
    "email": ""
  },
  {
    "id": "nomad-cli-80",
    "nombre": "ROMAN FERNANDO SOLARES TERAN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ANSELMO DE LA PORTILLA UNIDAD 4 EDIFICIO 6 DEPARTAMENTO 63",
    "email": ""
  },
  {
    "id": "nomad-cli-81",
    "nombre": "SERVICIOS ESTATALES DE SALUD",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CHAPULTEPEC",
    "email": ""
  },
  {
    "id": "nomad-cli-82",
    "nombre": "VALERIA GUADALUPE MILLAN ENCARNACION",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOAQUIN VELAZQUEZ DE LEON",
    "email": ""
  },
  {
    "id": "nomad-cli-83",
    "nombre": "NUCLEO DE ATENCION MATERNA Y SALUD FETAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MONTECITO",
    "email": ""
  },
  {
    "id": "nomad-cli-84",
    "nombre": "TERE ALMAZAN MASON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ESTRELLA EDIFICIO A INTERIOR 111",
    "email": ""
  },
  {
    "id": "nomad-cli-85",
    "nombre": "ABAVEN CONSULTING",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SAN BENITO",
    "email": ""
  },
  {
    "id": "nomad-cli-86",
    "nombre": "EDGAR ALEJANDRO CRUZ GUZMAN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-87",
    "nombre": "ROGELIO MARTINEZ GOMEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VICTORIA",
    "email": ""
  },
  {
    "id": "nomad-cli-88",
    "nombre": "ESTUDIO BOSCO SODI",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-89",
    "nombre": "ALEJANDRA IBARRA CHAOUL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-90",
    "nombre": "PERLA YOLANDA FABRO TREJO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-91",
    "nombre": "CENTRO DE ATENCION MATERNO FETAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PERIFERICO SUR",
    "email": ""
  },
  {
    "id": "nomad-cli-92",
    "nombre": "MASSIEL MARLEN BETANZOS NUÑEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-93",
    "nombre": "LORENZO JOSE VELANDIA MONTES DE OCA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "NICOLAS SAN JUAN",
    "email": ""
  },
  {
    "id": "nomad-cli-94",
    "nombre": "CINTHYA OCHOA VEGA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "NICOLAU INTERIOR",
    "email": ""
  },
  {
    "id": "nomad-cli-95",
    "nombre": "CYMARKETING",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LAGUNA DEL CARMEN",
    "email": ""
  },
  {
    "id": "nomad-cli-96",
    "nombre": "RAUL ARMANDO SOBRINO DE LA CERDA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PROVIDENCIA",
    "email": ""
  },
  {
    "id": "nomad-cli-97",
    "nombre": "ARTURO FREG TENORIO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MONTECILLO",
    "email": ""
  },
  {
    "id": "nomad-cli-98",
    "nombre": "EDITH ELIZABETH MORA HERNANDEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV DR JOSE MARIA VERTIZ",
    "email": ""
  },
  {
    "id": "nomad-cli-99",
    "nombre": "DIANA PERAFAN VILLEGAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CENTRAL  EDIFICIO 2 CASA 1",
    "email": ""
  },
  {
    "id": "nomad-cli-100",
    "nombre": "LAURA VALERIA RAMIREZ GILES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TECAX MANZANA 45 LOTE 09",
    "email": ""
  },
  {
    "id": "nomad-cli-101",
    "nombre": "MONTSERRAT GUZMAN GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-102",
    "nombre": "JACQUELINE JHOANNA MAYA QUIÑONES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GALLOS 4",
    "email": ""
  },
  {
    "id": "nomad-cli-103",
    "nombre": "CINTHYA GABRIELA GUTIERREZ ZUÑIGA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "HACIENDA DE LA LLAVE",
    "email": ""
  },
  {
    "id": "nomad-cli-104",
    "nombre": "KARLA ELIZABETH OLVERA PARADA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BAZOFERTEMANZANA3",
    "email": ""
  },
  {
    "id": "nomad-cli-105",
    "nombre": "UNIDAD AVANZADA DE DIAGNOSTICO MATERNO FETAL CUERNAVACA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CHILPANCINGO",
    "email": ""
  },
  {
    "id": "nomad-cli-106",
    "nombre": "MARIA FERNANDA GARCIA TRABADO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "XICOTENCATL",
    "email": ""
  },
  {
    "id": "nomad-cli-107",
    "nombre": "EVELYN MORENO MEDINA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BOSQUE DE NIAMEY",
    "email": ""
  },
  {
    "id": "nomad-cli-108",
    "nombre": "FRANCISCO JAVIER MORENO MORALES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOSE MARIA MORELOS Y PAVON",
    "email": ""
  },
  {
    "id": "nomad-cli-109",
    "nombre": "CARLOS UTRERA MENDEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GENERAL INGNACIO DE LA LLAVE NTE",
    "email": ""
  },
  {
    "id": "nomad-cli-110",
    "nombre": "JAQUELINE GARCIA GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "4A AVENIDA",
    "email": ""
  },
  {
    "id": "nomad-cli-111",
    "nombre": "IVETTE GABRIELA LOZANO FLORES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "NORTE 24 A",
    "email": ""
  },
  {
    "id": "nomad-cli-112",
    "nombre": "CATALINA FERNANDA PADRES ROJO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVE. SANTA FE 425 EDIFICIO A",
    "email": ""
  },
  {
    "id": "nomad-cli-113",
    "nombre": "JESUS ARTURO SALAS SALAZAR",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MANZANO",
    "email": ""
  },
  {
    "id": "nomad-cli-114",
    "nombre": "INMOBILIARIA ORANGE COUNTRY",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "REFORMA SUR",
    "email": ""
  },
  {
    "id": "nomad-cli-115",
    "nombre": "INGENIERIA INTEGRAL DE VALUACION",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ACORDADA",
    "email": ""
  },
  {
    "id": "nomad-cli-116",
    "nombre": "ANGELA LEZAMA CASTRO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "IGNACIO ALLENDE",
    "email": ""
  },
  {
    "id": "nomad-cli-117",
    "nombre": "ORNELLA AGOSTINA SAURO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "OBREROMUNDIAL",
    "email": ""
  },
  {
    "id": "nomad-cli-118",
    "nombre": "ULTRASCANMX",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "XOLA",
    "email": ""
  },
  {
    "id": "nomad-cli-119",
    "nombre": "ELVIA MORENO SANCHEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LAGUNA DE TERMINOS",
    "email": ""
  },
  {
    "id": "nomad-cli-120",
    "nombre": "ANA PAULA RODRIGUEZ GALVEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LA JOYA 62",
    "email": ""
  },
  {
    "id": "nomad-cli-121",
    "nombre": "CARLOS JUAN RABINDRANATH CANTU HERRERA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOSE MARIA MORELOS",
    "email": ""
  },
  {
    "id": "nomad-cli-122",
    "nombre": "ARACELI LEON SANCHEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA DE LA LUNA",
    "email": ""
  },
  {
    "id": "nomad-cli-123",
    "nombre": "ALDO HERNAN JARAMILLO ROMERO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE ANDADOR CEIBA",
    "email": ""
  },
  {
    "id": "nomad-cli-124",
    "nombre": "OSWALDO ALEJANDRO LOPEZ ARELLANOS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CANDELARIA",
    "email": ""
  },
  {
    "id": "nomad-cli-125",
    "nombre": "MARLEN JOCELYN LUNA RIVERA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LAURELES",
    "email": ""
  },
  {
    "id": "nomad-cli-126",
    "nombre": "FRIDA HARARI CHEREM",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FUENTES DE MOLINOS TORRE A INT 102",
    "email": ""
  },
  {
    "id": "nomad-cli-127",
    "nombre": "YESENIA ELIZABETH HUIZAR VILLALOBOS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ANDADOR LLUVIA",
    "email": ""
  },
  {
    "id": "nomad-cli-128",
    "nombre": "AVID SAUL PACHECO GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RAMON TORRES",
    "email": ""
  },
  {
    "id": "nomad-cli-129",
    "nombre": "CLAUDIA ANDREA SANCHEZ RODRIGUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LE EROS",
    "email": ""
  },
  {
    "id": "nomad-cli-130",
    "nombre": "DANIELA ARIAS ARANDA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MONACO",
    "email": ""
  },
  {
    "id": "nomad-cli-131",
    "nombre": "INTEGRA SALUD Y SERVICIOS MEDICOS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MIGUEL LERDO DE TEJADA",
    "email": ""
  },
  {
    "id": "nomad-cli-132",
    "nombre": "ESTEFANIA ZAVALA LOPEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PASEO VIZCARRA",
    "email": ""
  },
  {
    "id": "nomad-cli-133",
    "nombre": "MARY CARMEN CUEVAS REYES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SUR 143",
    "email": ""
  },
  {
    "id": "nomad-cli-134",
    "nombre": "ALBERTO BELTRAN CAMPOS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ORQUIDEAS",
    "email": ""
  },
  {
    "id": "nomad-cli-135",
    "nombre": "MARIA EUGENIA GONZALEZ VARGAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PORTAL MORELOS",
    "email": ""
  },
  {
    "id": "nomad-cli-136",
    "nombre": "EDGAR ABEL MARQUEZ GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "OLIVOS",
    "email": ""
  },
  {
    "id": "nomad-cli-137",
    "nombre": "ANA TERESA MEDEL GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "95 PTE ALTOS",
    "email": ""
  },
  {
    "id": "nomad-cli-138",
    "nombre": "LUIS FERNANDO GAMA MUÑOZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AUXILIADORAS",
    "email": ""
  },
  {
    "id": "nomad-cli-139",
    "nombre": "ALEJANDRO MEZA DE ALBA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-140",
    "nombre": "MARIA BLANCA DIAZ ALVAREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MARGARITAS",
    "email": ""
  },
  {
    "id": "nomad-cli-141",
    "nombre": "PAN - AMERICAN MEXICO, COMPAÑIA DE SEGUROS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV. PASEO DE LA REFORMA 411 SUITE1501",
    "email": ""
  },
  {
    "id": "nomad-cli-142",
    "nombre": "EFREN OCTAVIANO MENDEZ TREVILLA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CAMINO A SANTA TERESA",
    "email": ""
  },
  {
    "id": "nomad-cli-143",
    "nombre": "ALONDRA SELENE ROMERO GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MEXICO Y ABASOLO",
    "email": ""
  },
  {
    "id": "nomad-cli-144",
    "nombre": "YOLANDA MARIA GUADALUPE CORTES ORDOÑEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PESTALOZZI",
    "email": ""
  },
  {
    "id": "nomad-cli-145",
    "nombre": "KEVIN DANIEL GARCIA OLGUIN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VALLE DE TULA MANZANA 11 LOTE 1",
    "email": ""
  },
  {
    "id": "nomad-cli-146",
    "nombre": "LUIS ANTONIO FUENTES SOBREYRA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PLANTA TINGAMBATO",
    "email": ""
  },
  {
    "id": "nomad-cli-147",
    "nombre": "PAULO CESAR ESPITIA JAIME",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ANTONIO DE MENDOZA",
    "email": ""
  },
  {
    "id": "nomad-cli-148",
    "nombre": "ELIA IXEL APODACA CHAVEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ARENAL",
    "email": ""
  },
  {
    "id": "nomad-cli-149",
    "nombre": "VICENTE VARA CELIS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SAN VICENTE",
    "email": ""
  },
  {
    "id": "nomad-cli-150",
    "nombre": "PAULETTE FRAGOSO SABBAGH",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOJUTLA",
    "email": ""
  },
  {
    "id": "nomad-cli-151",
    "nombre": "NAOMI SANTANA JIMENEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "POPOCATEPETL",
    "email": ""
  },
  {
    "id": "nomad-cli-152",
    "nombre": "JUAN CARLOS BUSTAMANTE OGANDO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RIO MANILA",
    "email": ""
  },
  {
    "id": "nomad-cli-153",
    "nombre": "OSCAR OMAR HERNANDEZ MARTINEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FLOR DE NUBE MZ. 24 LT.3",
    "email": ""
  },
  {
    "id": "nomad-cli-154",
    "nombre": "MANUEL ABRAHAM VALDERRAMA YAPOR",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "",
    "email": ""
  },
  {
    "id": "nomad-cli-155",
    "nombre": "SILVIA BERNARDETE REYNOSO ESPARZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VERACRUZ",
    "email": ""
  },
  {
    "id": "nomad-cli-156",
    "nombre": "EVA PATRICIA AVILES GOMEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "NOGAL",
    "email": ""
  },
  {
    "id": "nomad-cli-157",
    "nombre": "JONATHAN ISRAEL FONSECA MENDEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PUERTE CAMPECHE",
    "email": ""
  },
  {
    "id": "nomad-cli-158",
    "nombre": "RAUL ALBERTO RUIZ DIAZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TUXPAN TAMIAHUA",
    "email": ""
  },
  {
    "id": "nomad-cli-159",
    "nombre": "JUAN OMAR AVILES CORONA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "DIAGONAL 1",
    "email": ""
  },
  {
    "id": "nomad-cli-160",
    "nombre": "JOSE SANCHEZ SALGADO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ROTOGRABADOS",
    "email": ""
  },
  {
    "id": "nomad-cli-161",
    "nombre": "SILVIA IBETH GONZALEZ LOPEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA CONSTITUYENTES 1076 EDIFICIO PINOS",
    "email": ""
  },
  {
    "id": "nomad-cli-162",
    "nombre": "KEYDY AIRY ORDAZ GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PASEO DEL HALCON",
    "email": ""
  },
  {
    "id": "nomad-cli-163",
    "nombre": "CARLOTTA ELISABETH OETLING VON REDEN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SONORA",
    "email": ""
  },
  {
    "id": "nomad-cli-164",
    "nombre": "BLANCA DEL ROCIO MORENO AVILA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ESTADO DE MEXICO",
    "email": ""
  },
  {
    "id": "nomad-cli-165",
    "nombre": "ALBERTO EFRAIN CERVANTES ESPINOSA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JUAREZ",
    "email": ""
  },
  {
    "id": "nomad-cli-166",
    "nombre": "NANCY CANSECO RODAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TLAHUAC",
    "email": ""
  },
  {
    "id": "nomad-cli-167",
    "nombre": "CYNTHIA RODRIGUEZ DE JESUS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE MIGUEL BARRAGAN MANZANA 65 LOTE 7",
    "email": ""
  },
  {
    "id": "nomad-cli-168",
    "nombre": "LORENA MARTINEZ GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CAMINO A SANTA TERESA",
    "email": ""
  },
  {
    "id": "nomad-cli-169",
    "nombre": "HORACIO ZALDIVAR GAMBOA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "COOK",
    "email": ""
  },
  {
    "id": "nomad-cli-170",
    "nombre": "VICTOR MANUEL TELLEZ MEDINA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "DR. ANTONIO HERNANDEZ",
    "email": ""
  },
  {
    "id": "nomad-cli-171",
    "nombre": "GALDINA GARCIA LUDLOW",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "INSURGENTES",
    "email": ""
  },
  {
    "id": "nomad-cli-172",
    "nombre": "HEALTWAY",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "HERMANOS SERDAN",
    "email": ""
  },
  {
    "id": "nomad-cli-173",
    "nombre": "FERNANDO MONTOYA VELA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LEONARDO DE VINCI",
    "email": ""
  },
  {
    "id": "nomad-cli-174",
    "nombre": "ELIZABETH BARRIENTOS SANCHEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PRIVADA DEL VALLE",
    "email": ""
  },
  {
    "id": "nomad-cli-175",
    "nombre": "VIRGINIA PAOLA ROY LUZARRAGA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ARENAL",
    "email": ""
  },
  {
    "id": "nomad-cli-176",
    "nombre": "CHARLY LESGOURGUES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOSE MARTI",
    "email": ""
  },
  {
    "id": "nomad-cli-177",
    "nombre": "OSCAR ALEJANDRO SANCHEZ PEREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PRIVADA SOLES",
    "email": ""
  },
  {
    "id": "nomad-cli-178",
    "nombre": "XOCHITL YASMIN SANCHEZ GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE 11",
    "email": ""
  },
  {
    "id": "nomad-cli-179",
    "nombre": "FLORENCIO GARCIA ZARAIN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "11 SUR",
    "email": ""
  },
  {
    "id": "nomad-cli-180",
    "nombre": "RODRIGO BARROSO CORONA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "OJO DE AGUA",
    "email": ""
  },
  {
    "id": "nomad-cli-181",
    "nombre": "DANIELA PLAZA HERNANDEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ORIENTE106",
    "email": ""
  },
  {
    "id": "nomad-cli-182",
    "nombre": "LUIS MARCOS CISNEROS FUENTES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "C 14 NORTE #1005, BARRIO DE SAN JOSE",
    "email": ""
  },
  {
    "id": "nomad-cli-183",
    "nombre": "MARCO ANTONIO GURROLA GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ARRAYAN",
    "email": ""
  },
  {
    "id": "nomad-cli-184",
    "nombre": "EDGAR STAMER GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "HACIENDA DE LAS PALMAS",
    "email": ""
  },
  {
    "id": "nomad-cli-185",
    "nombre": "UNIDAD ONCOLOGICA AMBULATORIA",
    "rfc": "UOA14111491A",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "22000",
    "direccion": "GONZALEZ ORTEGA, Col. Zona Centro, Tijuana, Baja California, CP 22000, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-186",
    "nombre": "JOSE ANTONIO ORTIZ VALENCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ORIENTE 10",
    "email": ""
  },
  {
    "id": "nomad-cli-187",
    "nombre": "ELIZABETH BARANDA DELGADO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RECREO",
    "email": ""
  },
  {
    "id": "nomad-cli-188",
    "nombre": "AVELINO GONZALEZ GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA HIDALGO",
    "email": ""
  },
  {
    "id": "nomad-cli-189",
    "nombre": "ALEJANDRO RIEFKOHL CRAULES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MONTEEVEREST",
    "email": ""
  },
  {
    "id": "nomad-cli-190",
    "nombre": "ROSALINDA FRANCO SOTO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FRANCIA",
    "email": ""
  },
  {
    "id": "nomad-cli-191",
    "nombre": "MARIA AURORA VIDAL ESTRADA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE 16",
    "email": ""
  },
  {
    "id": "nomad-cli-192",
    "nombre": "JOSE ALBERTO MIRANDA CASILLAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MORELOS",
    "email": ""
  },
  {
    "id": "nomad-cli-193",
    "nombre": "ERNESTINA SALINAS GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FRAGIL VISTA",
    "email": ""
  },
  {
    "id": "nomad-cli-194",
    "nombre": "IVONNE MORENO CALDERON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA ARAUCARIAS",
    "email": ""
  },
  {
    "id": "nomad-cli-195",
    "nombre": "VICTOR OSCAR VILLAFAÑE FERRER",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "IBSEN",
    "email": ""
  },
  {
    "id": "nomad-cli-196",
    "nombre": "CARMEN HERNANDEZ ESPINOSA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CIPRES",
    "email": ""
  },
  {
    "id": "nomad-cli-197",
    "nombre": "PAOLA STEPHANIE GONZALEZ LOZANO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BENJAMIN FRANKLIN",
    "email": ""
  },
  {
    "id": "nomad-cli-198",
    "nombre": "SONIA ELIZABETH MALDONADO CABALLERO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JULIO JIMENEZ RUEDA",
    "email": ""
  },
  {
    "id": "nomad-cli-199",
    "nombre": "MARIA ELENA MORENO DIAZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LA GUADALUPANA",
    "email": ""
  },
  {
    "id": "nomad-cli-200",
    "nombre": "MARIA EDITH MORALES ESCOBAR",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PROLONGACION ALAMOS, EDIFICIO G",
    "email": ""
  },
  {
    "id": "nomad-cli-201",
    "nombre": "PREVEM SEGUROS",
    "rfc": "PSE1006082N5",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "01050",
    "direccion": "Col. Ex Hacienda de Guadalupe Chimalistac, Alvaro Obregon, Ciudad de México, CP 01050, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-202",
    "nombre": "RICARDO PAREDES LUCIO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PUERTO GUAYMAS 43",
    "email": ""
  },
  {
    "id": "nomad-cli-203",
    "nombre": "MARIA LUISA NARDONE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "HACIENDA EL ROCIO",
    "email": ""
  },
  {
    "id": "nomad-cli-204",
    "nombre": "JUAN RODOLFO SANCHEZ GOMEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SITIO DE CUAUTLA",
    "email": ""
  },
  {
    "id": "nomad-cli-205",
    "nombre": "FLOR MARIA ESCAMILLA MALAGON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FUERTE DE LORETO",
    "email": ""
  },
  {
    "id": "nomad-cli-206",
    "nombre": "MOISES RAYEK KHABIE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SIERRA NEVADA",
    "email": ""
  },
  {
    "id": "nomad-cli-207",
    "nombre": "BEST DOCTORS INSURANCE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "5201 BLUE LAGOON DRIVE SITE 300 MIAMI, FL 33126",
    "email": ""
  },
  {
    "id": "nomad-cli-208",
    "nombre": "GERARDO CASTORENA ROJI",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ALICA",
    "email": ""
  },
  {
    "id": "nomad-cli-209",
    "nombre": "MARTIN GARCIA MARQUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CARRETERA TIJUANA TECATE",
    "email": ""
  },
  {
    "id": "nomad-cli-210",
    "nombre": "ALFONSO BARBA GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "DR. DIAZ DE  LEON",
    "email": ""
  },
  {
    "id": "nomad-cli-211",
    "nombre": "MARIA DEL ROSARIO SANDOVAL TINOCO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PRIVADA YUCATAN",
    "email": ""
  },
  {
    "id": "nomad-cli-212",
    "nombre": "ANGEL GERARDO DIAZ ACOSTA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GUILLERMOGONZALEZCAMARENA",
    "email": ""
  },
  {
    "id": "nomad-cli-213",
    "nombre": "JORGE ALBERTO SOBREVILLA GARZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE ALAMO",
    "email": ""
  },
  {
    "id": "nomad-cli-214",
    "nombre": "NORMA AVILA RAMIREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PROLONGACIONZARAGOZA",
    "email": ""
  },
  {
    "id": "nomad-cli-215",
    "nombre": "ALFONSO SALOMON MASRI DIWAN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "16 DE SEPTIEMBRE, BODEGA 5 PISO1",
    "email": ""
  },
  {
    "id": "nomad-cli-216",
    "nombre": "MARTHA CECILIA MARCOS ASSAD",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOSE VANSCONCELOS",
    "email": ""
  },
  {
    "id": "nomad-cli-217",
    "nombre": "MARIA FERNANDA OSORIO CARRILLO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "NAUHOLIN",
    "email": ""
  },
  {
    "id": "nomad-cli-218",
    "nombre": "ANA LUISA GUTIERREZ GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "21 PONIENTE DEPARTAMENTO 201",
    "email": ""
  },
  {
    "id": "nomad-cli-219",
    "nombre": "ASTRID NUÑEZ SALGADO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "INDEPENDENCIA",
    "email": ""
  },
  {
    "id": "nomad-cli-220",
    "nombre": "YAD LA JOLEH",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PRESIDENTE MASARIK",
    "email": ""
  },
  {
    "id": "nomad-cli-221",
    "nombre": "NORA PALOMA AMEZOLA VILLALPANDO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ANDEN 6, BODEGA 14",
    "email": ""
  },
  {
    "id": "nomad-cli-222",
    "nombre": "FRANCISCO RAUL VARGAS PINZON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BLVDMAVILAC",
    "email": ""
  },
  {
    "id": "nomad-cli-223",
    "nombre": "MARIA ASUNCION RAMIREZ FRIAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE CUATRO",
    "email": ""
  },
  {
    "id": "nomad-cli-224",
    "nombre": "TERESITA DEL NIÑO JESUS CORTES LLAMOSA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BENITO JUAREZ",
    "email": ""
  },
  {
    "id": "nomad-cli-225",
    "nombre": "MARIA HINESTROSA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SUDERMANN",
    "email": ""
  },
  {
    "id": "nomad-cli-226",
    "nombre": "FLORINA ENRIQUEZ LOPEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "16 SUR ORIENTE",
    "email": ""
  },
  {
    "id": "nomad-cli-227",
    "nombre": "MARIA DEL CARMEN ABASCAL ALVAREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FUENTEDEQUIJOTE",
    "email": ""
  },
  {
    "id": "nomad-cli-228",
    "nombre": "CLAUDIA ESTHELA MARTINEZ DE LA GARZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PALESTINA",
    "email": ""
  },
  {
    "id": "nomad-cli-229",
    "nombre": "JOSE FRANCISCO ALEXANDER MEZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA MOCTEZUMA",
    "email": ""
  },
  {
    "id": "nomad-cli-230",
    "nombre": "FRANK WOLBERG RODRIGUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE SAMARIA",
    "email": ""
  },
  {
    "id": "nomad-cli-231",
    "nombre": "ENRIQUE PEREZ CHAVEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CUAUTLA",
    "email": ""
  },
  {
    "id": "nomad-cli-232",
    "nombre": "JUAN MIGUEL ZATARAIN TISNADO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDAPASEODELOSAILES",
    "email": ""
  },
  {
    "id": "nomad-cli-233",
    "nombre": "SUSANA COUTTOLENC GARCIA JURADO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VERGEL",
    "email": ""
  },
  {
    "id": "nomad-cli-234",
    "nombre": "BEATRIZ CORDERO RODRIGUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "307",
    "email": ""
  },
  {
    "id": "nomad-cli-235",
    "nombre": "J. REMEDIOS MAJIN RODRIGUEZ ESCALANTE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MORELOS",
    "email": ""
  },
  {
    "id": "nomad-cli-236",
    "nombre": "PEDRO MORA BERMEJO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA 5 DE MAYO",
    "email": ""
  },
  {
    "id": "nomad-cli-237",
    "nombre": "BEATRIZ RIVERA VAZQUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "OTE 168",
    "email": ""
  },
  {
    "id": "nomad-cli-238",
    "nombre": "ELIO ESPINOSA RODRIGUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE AMORES",
    "email": ""
  },
  {
    "id": "nomad-cli-239",
    "nombre": "GRUPO NACIONAL PROVINCIAL",
    "rfc": "GNP9211244P0",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "04200",
    "direccion": "AVENIDA CERRO DE LAS TORRES, Col. CAMPESTRE CHURUBUSCO, Coyoacan, Ciudad de México, CP 04200, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-240",
    "nombre": "DIEGO GOMEZ HARO KATZNELSON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MAZATLAN",
    "email": ""
  },
  {
    "id": "nomad-cli-241",
    "nombre": "ANA HILDA SAMANO GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA DE LOS PELICANOS",
    "email": ""
  },
  {
    "id": "nomad-cli-242",
    "nombre": "AVRAHAM ASHKENAZI TAVASHI",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV. DE LOS BOSQUES",
    "email": ""
  },
  {
    "id": "nomad-cli-243",
    "nombre": "CLAUDIA YAZMIN LOPEZ MONZON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JENUFA",
    "email": ""
  },
  {
    "id": "nomad-cli-244",
    "nombre": "MEXICO INTEGRATIVE ONCOLOGY PROJECT",
    "rfc": "MIO181009U9A",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "11000",
    "direccion": "ALICA, Miguel Hidalgo, Ciudad de México, CP 11000, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-245",
    "nombre": "MARIA ANTONIA ANICETO PADILLA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "NORIA",
    "email": ""
  },
  {
    "id": "nomad-cli-246",
    "nombre": "MARIA ELENA CANAAN GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOSE MARIA MACHUCA",
    "email": ""
  },
  {
    "id": "nomad-cli-247",
    "nombre": "SERGIO ANTONIO BAYARDO TOLEDO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE SAN ERNESTO",
    "email": ""
  },
  {
    "id": "nomad-cli-248",
    "nombre": "ADOLFO ROMAN JAUREGUY RODRIGUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TACNA",
    "email": ""
  },
  {
    "id": "nomad-cli-249",
    "nombre": "JOSE LUIS MENCHELLI JIMENEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "ALVARO OBREGON",
    "email": ""
  },
  {
    "id": "nomad-cli-250",
    "nombre": "DAVID AGAMI HAIAT",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV. INGENIEROS MILITARES",
    "email": ""
  },
  {
    "id": "nomad-cli-251",
    "nombre": "MARTHA REYNOSO ROBLES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AGUILA",
    "email": ""
  },
  {
    "id": "nomad-cli-252",
    "nombre": "ADALBERTO THOMAE LOPEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PASEO DE LOS FRESNOS",
    "email": ""
  },
  {
    "id": "nomad-cli-253",
    "nombre": "ALFREDO FEDERICO MORENO BENAVIDES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JOSE LOPEZ PORTILLO",
    "email": ""
  },
  {
    "id": "nomad-cli-254",
    "nombre": "CENTRO DE ONCOLOGIA DE PRECISION",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LA MORENA",
    "email": ""
  },
  {
    "id": "nomad-cli-255",
    "nombre": "BEATRIZ VEGA RUBIO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "Encino",
    "email": ""
  },
  {
    "id": "nomad-cli-256",
    "nombre": "LILIAN FRANCISCA ELIZABETH FRANK DIAZ DE SANDI",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "EFRAIN GONZALEZ LUNA",
    "email": ""
  },
  {
    "id": "nomad-cli-257",
    "nombre": "ALBERTO ESCOBELL RIOS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GALATONE",
    "email": ""
  },
  {
    "id": "nomad-cli-258",
    "nombre": "ALEJANDRO CASTIL VAZQUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CONSTITUCION",
    "email": ""
  },
  {
    "id": "nomad-cli-259",
    "nombre": "PLAN SEGURO SA DE CV COMPAÑIA DE SEGUROS",
    "rfc": "PSS970203FI6",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "01900",
    "direccion": "ADOLFO RUIZ CORTINEZ, Col. JARDINES DEL PEDREGAL, Alvaro Obregon, Ciudad de México, CP 01900, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-260",
    "nombre": "MA. TERESA AGUSTINA VELASCO GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SAN MATEO",
    "email": ""
  },
  {
    "id": "nomad-cli-261",
    "nombre": "EDUARDO ALEJANDRO GONGORA RAMIREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PISA",
    "email": ""
  },
  {
    "id": "nomad-cli-262",
    "nombre": "FRANCISCO JAVIER GOMEZ PLASCENCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FRANCISCO VILLA",
    "email": ""
  },
  {
    "id": "nomad-cli-263",
    "nombre": "JESUS ANTONIO MARIN ROJAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PLUTARCO ELIAS CALLES",
    "email": ""
  },
  {
    "id": "nomad-cli-264",
    "nombre": "FERNANDO VAZQUEZ MAYA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PRESIDENTES",
    "email": ""
  },
  {
    "id": "nomad-cli-265",
    "nombre": "MARIA FERNANDA MAGALLANES QUIROZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PASEO ROSAS",
    "email": ""
  },
  {
    "id": "nomad-cli-266",
    "nombre": "JOSE GUILLERMO CAMPOS LIMON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PRIVADA 3 A SUR",
    "email": ""
  },
  {
    "id": "nomad-cli-267",
    "nombre": "EUGENIO MANILLA CALDERON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "EJIDO LOS REYES",
    "email": ""
  },
  {
    "id": "nomad-cli-268",
    "nombre": "PRECISION DIAGNOSTICA DALICE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LUIS DONALDO COLOSIO",
    "email": ""
  },
  {
    "id": "nomad-cli-269",
    "nombre": "MARCELA ALINA FUENTES MILAN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BOSQUE REAL",
    "email": ""
  },
  {
    "id": "nomad-cli-270",
    "nombre": "EMILIA RIVERO RIVERA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CARRETERA MEXICO TEXCOCO",
    "email": ""
  },
  {
    "id": "nomad-cli-271",
    "nombre": "JOSE ANTONIO JIMENEZ CORTEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PUEBLA",
    "email": ""
  },
  {
    "id": "nomad-cli-272",
    "nombre": "SILVIA CHEREM SACAL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MANUEL AVILA CAMACHO BLVD",
    "email": ""
  },
  {
    "id": "nomad-cli-273",
    "nombre": "SILVIA PAULINA PONCE ROGEL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JUAREZ",
    "email": ""
  },
  {
    "id": "nomad-cli-274",
    "nombre": "JUAN PABLO HERNANDEZ SEGOVIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "1ERA AVENIDA",
    "email": ""
  },
  {
    "id": "nomad-cli-275",
    "nombre": "M DE LOS ANGELES SANCHEZ JUNQUERA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JACARANDAS",
    "email": ""
  },
  {
    "id": "nomad-cli-276",
    "nombre": "OLGA SOLBES GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PASEO DEL MONARCA",
    "email": ""
  },
  {
    "id": "nomad-cli-277",
    "nombre": "ZURICH ASEGURADORA MEXICANA",
    "rfc": "QMS950529PU4",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "53390",
    "direccion": "BOULEVARD MANUEL AVILA CAMACHO, Col. LOMAS DE SOTELO, Naucalpan de Juarez, Estado de México, CP 53390, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-278",
    "nombre": "ERAYON SERVICIOS MEDICOS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VIALIDAD DE LA BARRANCA",
    "email": ""
  },
  {
    "id": "nomad-cli-279",
    "nombre": "MARCO ANTONIO LOPEZ MEZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "25 PONIENTE",
    "email": ""
  },
  {
    "id": "nomad-cli-280",
    "nombre": "MARIA LUISA MARTINEZ OROZCO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE 8",
    "email": ""
  },
  {
    "id": "nomad-cli-281",
    "nombre": "RAMON OLIVAS GASTELUM",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "REPUBLICA DE BOLIVIA",
    "email": ""
  },
  {
    "id": "nomad-cli-282",
    "nombre": "JOSE ARTURO BRITO MUÑOZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PRIV 3B SUR 5105 CASA 2",
    "email": ""
  },
  {
    "id": "nomad-cli-283",
    "nombre": "YRMA PATRICIA TAMAYO LEON",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CONOCIDO",
    "email": ""
  },
  {
    "id": "nomad-cli-284",
    "nombre": "HECTOR ALEJANDRO GOROSTIETA FLORES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CALLE CENTENARIO",
    "email": ""
  },
  {
    "id": "nomad-cli-285",
    "nombre": "FERNANDO MARTIN SALDIVAR GALINDO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV. CERRO GORDO",
    "email": ""
  },
  {
    "id": "nomad-cli-286",
    "nombre": "MARIA ELOISA CASILLAS MUÑOZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BOULEVARD DEL CAMPESTRE",
    "email": ""
  },
  {
    "id": "nomad-cli-287",
    "nombre": "CARLOS SANCHEZ ROMERO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CARR MEXICO VERACRUZ",
    "email": ""
  },
  {
    "id": "nomad-cli-288",
    "nombre": "SANDRA PALACIOS MARQUEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "06800",
    "email": ""
  },
  {
    "id": "nomad-cli-289",
    "nombre": "LUZ MARIA RUIZ ROSAS",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PASEO PLAYA DEL CONJCHAL",
    "email": ""
  },
  {
    "id": "nomad-cli-290",
    "nombre": "ADRIANA DE LOURDES DAVILA MORALES",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "OTE 121",
    "email": ""
  },
  {
    "id": "nomad-cli-291",
    "nombre": "ALEJANDRO LUQUE GOMEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VALLE TIZAYUCA",
    "email": ""
  },
  {
    "id": "nomad-cli-292",
    "nombre": "MARTHA ALICIA AGUIRRE ESPINOZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "BELLAS ARTES",
    "email": ""
  },
  {
    "id": "nomad-cli-293",
    "nombre": "GLORIA MARIA GARZA DE LA GARZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AV DE LAS FUENTES",
    "email": ""
  },
  {
    "id": "nomad-cli-294",
    "nombre": "MARIANA PORRAS REALZOLA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA DE LAS FUENTES",
    "email": ""
  },
  {
    "id": "nomad-cli-295",
    "nombre": "ANA LAURA NUÑEZ ARANA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "TLACOTALPAN",
    "email": ""
  },
  {
    "id": "nomad-cli-296",
    "nombre": "GLORIA MARIA TORRUCO GARZA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "JABIN",
    "email": ""
  },
  {
    "id": "nomad-cli-297",
    "nombre": "ALEJANDRO EDUARDO CASTILLO ARCE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FUENTE DE SAN MIGUEL MZ 22 LT 43",
    "email": ""
  },
  {
    "id": "nomad-cli-298",
    "nombre": "BBVA SEGUROS SALUD MEXICO, SA DE CV, GRUPO FINANCIERO BBVA MEXICO",
    "rfc": "PCG020325UF4",
    "regimen": "601",
    "usoCfdi": "",
    "cp": "06600",
    "direccion": "PASEO DE LA REFORMA, Col. JUAREZ, Cuauhtémoc, Ciudad de México, CP 06600, MEX",
    "email": ""
  },
  {
    "id": "nomad-cli-299",
    "nombre": "FERNANDO DE ALBA QUINTANILLA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CARRANZA 31",
    "email": ""
  },
  {
    "id": "nomad-cli-300",
    "nombre": "ELSA ITZEL CERNA CERINO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RODOLFO CAO ZAMUDIO",
    "email": ""
  },
  {
    "id": "nomad-cli-301",
    "nombre": "LORENA ORNELAS HALL",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "GELATI",
    "email": ""
  },
  {
    "id": "nomad-cli-302",
    "nombre": "LUIS ENRIQUE GUERRA GARCIA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "20 DE NOVIEMBRE",
    "email": ""
  },
  {
    "id": "nomad-cli-303",
    "nombre": "FRANCISCO MAURICIO MACEDO GUTIERREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "FAISAN",
    "email": ""
  },
  {
    "id": "nomad-cli-304",
    "nombre": "MARTA TRIGUEROS RAMIREZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "SANTISIMO",
    "email": ""
  },
  {
    "id": "nomad-cli-305",
    "nombre": "MONICA GUERRERO LEBRIJA",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "HEGEL",
    "email": ""
  },
  {
    "id": "nomad-cli-306",
    "nombre": "GERARDO ORTIZ MORENO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RICARDO MARGAIN ZOZAYA",
    "email": ""
  },
  {
    "id": "nomad-cli-307",
    "nombre": "ERIKA ESTRADA GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "12 SUR",
    "email": ""
  },
  {
    "id": "nomad-cli-308",
    "nombre": "ROGERIO MARCELINO DOMINGUEZ MARTINEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MAR MUERTO",
    "email": ""
  },
  {
    "id": "nomad-cli-309",
    "nombre": "RODOLFO DE LEIJA GONZALEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "MORELOS",
    "email": ""
  },
  {
    "id": "nomad-cli-310",
    "nombre": "MARIA PALOMA CAMACHO LIBIEN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "VICENTE GUERRERO",
    "email": ""
  },
  {
    "id": "nomad-cli-311",
    "nombre": "JOSE ZENO EDGAR DOBERNIG GARRIDO",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "LAZARO CARDENAS 402, 11E",
    "email": ""
  },
  {
    "id": "nomad-cli-312",
    "nombre": "JAIME VON BERTRAB MESTRE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "CRR MEXICO TOLUCA",
    "email": ""
  },
  {
    "id": "nomad-cli-313",
    "nombre": "ALISTAIR MCCREADIE",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "AVENIDA CUAUHTEMOC",
    "email": ""
  },
  {
    "id": "nomad-cli-314",
    "nombre": "KARINA FUENTES MARTINEZ",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "PLATEROS",
    "email": ""
  },
  {
    "id": "nomad-cli-315",
    "nombre": "KARINA RABNER CYMERMAN",
    "rfc": "",
    "regimen": "",
    "usoCfdi": "",
    "cp": "",
    "direccion": "RETORNO",
    "email": ""
  }
];
const PRODUCTOS_BASE_SANARE = [
  {
    "id": "sanare-prd-1",
    "descripcion": "VINCRISTINA 1MG/10ML CAJ C/1 FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "VINCRI1"
  },
  {
    "id": "sanare-prd-2",
    "descripcion": "SULFATO DE MAGNESIO /G10ML FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "SULFMAG"
  },
  {
    "id": "sanare-prd-3",
    "descripcion": "SILLON DE INFUSION - DERECHO A SALA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "SILLONINFU"
  },
  {
    "id": "sanare-prd-4",
    "descripcion": "RETIRO DE INFUSOR CON HEPARINIZACIÓN",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "RET"
  },
  {
    "id": "sanare-prd-5",
    "descripcion": "PREPARACION DE MEZCLA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PREPMEZ"
  },
  {
    "id": "sanare-prd-6",
    "descripcion": "PREDNISONA 50MG 20TAB (AMSA)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PREDI50"
  },
  {
    "id": "sanare-prd-7",
    "descripcion": "PERFALGAN 1G SOLINY C/4 FCO10ML",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PERFA1G"
  },
  {
    "id": "sanare-prd-8",
    "descripcion": "PALONOSETRON (VINALTRO 025.MG/5ML AMP 1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PALOVAINAL"
  },
  {
    "id": "sanare-prd-9",
    "descripcion": "PACLITAXEL300 MG/500ML C/1FA(SIRAPEH)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PACLITAX"
  },
  {
    "id": "sanare-prd-10",
    "descripcion": "OXALIPLATINO 50MG/10ML C/1 FA RECOPLAT",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "OXA50MG"
  },
  {
    "id": "sanare-prd-11",
    "descripcion": "OXALIPLATINO 100MG/200ML C/1 FA RECOPLAT",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "OXA100"
  },
  {
    "id": "sanare-prd-12",
    "descripcion": "ONDANSETRON ANTIVON 8MG 4MLC/1 AMP SI N",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "ONDAANT"
  },
  {
    "id": "sanare-prd-13",
    "descripcion": "OMEPRAZOL (PENTREN 40 MG AMP C/10ML)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "OMPRZ"
  },
  {
    "id": "sanare-prd-14",
    "descripcion": "METOCLOPRAMIDA 10MG/2ML CAJ C/6 AMP",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "MET1"
  },
  {
    "id": "sanare-prd-15",
    "descripcion": "MANITOL 20% 250 ML",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "MANITOL"
  },
  {
    "id": "sanare-prd-16",
    "descripcion": "MAGNEFUSIN SULFATO DE MAGNESIO PISA 10%",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "MAGNEF"
  },
  {
    "id": "sanare-prd-17",
    "descripcion": "LIDOCAINA/PRILOCAINA 1G CAJ C/2 PAR",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "LIDO/PRILO"
  },
  {
    "id": "sanare-prd-18",
    "descripcion": "KIT DE INSUMOS",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "KITINSUM"
  },
  {
    "id": "sanare-prd-19",
    "descripcion": "KETOROLACO 300 MG TB (ONEMER SUBBLINGUAL",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "KETEONESUB"
  },
  {
    "id": "sanare-prd-20",
    "descripcion": "KELEFUSIN CLORURO DE POTASIO PISA ANP 1.",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "KELEFISIN"
  },
  {
    "id": "sanare-prd-21",
    "descripcion": "INSUMOS Y SERVICIO DE INFUSION",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "SERINF"
  },
  {
    "id": "sanare-prd-22",
    "descripcion": "INFUSOR HOME PUMP",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "INFHOME"
  },
  {
    "id": "sanare-prd-23",
    "descripcion": "INFUSION GEMCITABINA+CISPLATINO",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "INFG+CIS"
  },
  {
    "id": "sanare-prd-24",
    "descripcion": "INFUSION CARBOPLATINO 3AUC+PACLITAXEL",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "INFCAR3AUC+PACLI"
  },
  {
    "id": "sanare-prd-25",
    "descripcion": "HIERRO 500MG/10ML (RENEGY)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "HIE01"
  },
  {
    "id": "sanare-prd-26",
    "descripcion": "HIDROCORTIZONA 100MG/1ML (HIDROCORTIZONA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "HIDROCORTIZONA"
  },
  {
    "id": "sanare-prd-27",
    "descripcion": "HEPARINA 100UI/1ML CAJ C/1 FA(INHEPAR)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "HEP100"
  },
  {
    "id": "sanare-prd-28",
    "descripcion": "GEMCITABINA 1G/25ML  C/1 FA(ULDEUS)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "GEMCITAB"
  },
  {
    "id": "sanare-prd-29",
    "descripcion": "GEMCITABINA (ACCOGEM 200MG/5ML F A C/)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "GEMCITAACCOGEM"
  },
  {
    "id": "sanare-prd-30",
    "descripcion": "FOSAPREPITANT 150MG/5ML CAJ C/1 FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FOS1"
  },
  {
    "id": "sanare-prd-31",
    "descripcion": "FLUOROURACILO 250MG/10 FRA(ULSACIL)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FLUO10"
  },
  {
    "id": "sanare-prd-32",
    "descripcion": "DOXORUBICINA 50MG/25ML CAJ C/1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "DOXO50"
  },
  {
    "id": "sanare-prd-33",
    "descripcion": "DOCETAXEL (MIOCERKEL 20 MG  SOL INY C/1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "DOCETAXEL"
  },
  {
    "id": "sanare-prd-34",
    "descripcion": "DIFENHIDRAMINA SOL INYECTABLE 10MG CAJ/1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "DIFENINYEC"
  },
  {
    "id": "sanare-prd-35",
    "descripcion": "DIFENHDRAMINA SOL INYECTABLE 10 MG C/1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "DIFENH"
  },
  {
    "id": "sanare-prd-36",
    "descripcion": "DEXAMETASONA (DECOREX 8MG/2ML CAJA C/1)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "DEXADECOREX8M2ML"
  },
  {
    "id": "sanare-prd-37",
    "descripcion": "CURACIÓN CON HEPARINIZACIÓN",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CURHEP"
  },
  {
    "id": "sanare-prd-38",
    "descripcion": "CONSULTA ONCOLÓGICA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CONSONC"
  },
  {
    "id": "sanare-prd-39",
    "descripcion": "CLORURO DE POTASIO 1.49 G/5ML CAJ/1 FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CLOPOT"
  },
  {
    "id": "sanare-prd-40",
    "descripcion": "CLOROPIRAMIDA (AVAPENA SOL. INYECTABLE)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CLORO(AVAP)"
  },
  {
    "id": "sanare-prd-41",
    "descripcion": "CISPLATINO 50MG/50ML CAJ C/1FA (ACCOCIT)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CIS50"
  },
  {
    "id": "sanare-prd-42",
    "descripcion": "CISPLATINO (ACCOCIT 10 MG/10ML FAM C/1)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CISPLA"
  },
  {
    "id": "sanare-prd-43",
    "descripcion": "CICLOFOSFAMIDA 500MG CAJ C/1 FAM(CYATA)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CICLO500"
  },
  {
    "id": "sanare-prd-44",
    "descripcion": "CICLOFOSFAMIDA 200MG/10ML CAJ C/5 FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CICLO200"
  },
  {
    "id": "sanare-prd-45",
    "descripcion": "CICLOFOSFAMIDA 1000MG CAJ C/1 FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CICLO1000"
  },
  {
    "id": "sanare-prd-46",
    "descripcion": "CARBOPLATINO450MG/45ML C/1 FA NUVAPLAST",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CARBPLAT"
  },
  {
    "id": "sanare-prd-47",
    "descripcion": "CARBOPLATINO 150MG/15ML CAJ C/1FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "CARBPLAT150"
  },
  {
    "id": "sanare-prd-48",
    "descripcion": "BLINATUMOMAB 35MCG CAJ C/1 FA(BLINCYTO)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "BLINA35"
  },
  {
    "id": "sanare-prd-49",
    "descripcion": "BEVACIZUMAB 400MG/16ML CAJ C/1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "BEVACI400"
  },
  {
    "id": "sanare-prd-50",
    "descripcion": "BEVACIZUMAB 100MG/4ML CAJ C/1 FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "BEVACI100"
  },
  {
    "id": "sanare-prd-51",
    "descripcion": "APREPITAN (IRAMENOL 125/80MG)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "APREMIRA125/80M"
  },
  {
    "id": "sanare-prd-52",
    "descripcion": "ACIDO FOLINICO 50MG/4ML CAJ C/1 FA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "ACIFOLI"
  }
];
const PRODUCTOS_BASE_NOMAD = [
  {
    "id": "nomad-prd-1",
    "descripcion": "TEMPUS XT-XR",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "XTXR"
  },
  {
    "id": "nomad-prd-2",
    "descripcion": "TEMPUS XT +XR",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "XT+XR"
  },
  {
    "id": "nomad-prd-3",
    "descripcion": "TEMPUS XF+",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TXF+"
  },
  {
    "id": "nomad-prd-4",
    "descripcion": "TRUSIGHT HEREDITARY CANCER PANEL",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TRUG"
  },
  {
    "id": "nomad-prd-5",
    "descripcion": "MATERNA AVANZADA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TRIPREM"
  },
  {
    "id": "nomad-prd-6",
    "descripcion": "MATERNA ESENCIAL",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TRIESE"
  },
  {
    "id": "nomad-prd-7",
    "descripcion": "TEMPUS XT CDX + PDL1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TPSXTPD1"
  },
  {
    "id": "nomad-prd-8",
    "descripcion": "TEMPU XT CDX",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TMPXF+"
  },
  {
    "id": "nomad-prd-9",
    "descripcion": "TIPO DE SANGRE",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TISAN"
  },
  {
    "id": "nomad-prd-10",
    "descripcion": "TEMPUS XR + CON PDL1 CLONA 22C3",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "TEMXT+FOLR1"
  },
  {
    "id": "nomad-prd-11",
    "descripcion": "SOLID TUMOR PROFILE",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "SOTUMPROF"
  },
  {
    "id": "nomad-prd-12",
    "descripcion": "RENTA DE OFICINAS",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "RENTA"
  },
  {
    "id": "nomad-prd-13",
    "descripcion": "RECEPTOR DE FOLATOS ALFA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "RDFA"
  },
  {
    "id": "nomad-prd-14",
    "descripcion": "QYUIMICA SANGUINEA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "QUISAN"
  },
  {
    "id": "nomad-prd-15",
    "descripcion": "PROSIGNA PAM 50",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PROSPAM50"
  },
  {
    "id": "nomad-prd-16",
    "descripcion": "QIAGEN THERASCREEN PIK3CA RGQ PCR KIT",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PIK3CA"
  },
  {
    "id": "nomad-prd-17",
    "descripcion": "PAGO",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PAGO"
  },
  {
    "id": "nomad-prd-18",
    "descripcion": "PANEL DE GENOTIFICACION DE GIST",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "PAGENGIST"
  },
  {
    "id": "nomad-prd-19",
    "descripcion": "ONCOTYPE DX",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "OCTP"
  },
  {
    "id": "nomad-prd-20",
    "descripcion": "MATERNAL GEMELAR",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "MATGEM"
  },
  {
    "id": "nomad-prd-21",
    "descripcion": "ANALISIS DE PRUEBA PCR SARS-COV-2",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "MAQPCRCOV"
  },
  {
    "id": "nomad-prd-22",
    "descripcion": "EMISION DE RESULTADOS POR ANTIGENO",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "MAQANTCOV"
  },
  {
    "id": "nomad-prd-23",
    "descripcion": "MANEJO DE DEUDA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "MADEU"
  },
  {
    "id": "nomad-prd-24",
    "descripcion": "LOGISTICA DE ENVIO A FOUNDATION MEDICINE",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "LOGENV"
  },
  {
    "id": "nomad-prd-25",
    "descripcion": "KIT SOMATICO NRTK",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "KSOM"
  },
  {
    "id": "nomad-prd-26",
    "descripcion": "INVITAE",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "INV2210"
  },
  {
    "id": "nomad-prd-27",
    "descripcion": "INMUNOHISTIQUIMICA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "INMUNO"
  },
  {
    "id": "nomad-prd-28",
    "descripcion": "INESTABILIDAD MICROSATELITAL EN BIOPSIA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "INEMICRO"
  },
  {
    "id": "nomad-prd-29",
    "descripcion": "GUARDAN HEALT 360 DE 74 GENES",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "GUAHEA36074G"
  },
  {
    "id": "nomad-prd-30",
    "descripcion": "FOLR1 INMUNOHISTOQUIMICA (IHQ)",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FOLHER"
  },
  {
    "id": "nomad-prd-31",
    "descripcion": "FOUNDATION ONE LIQUID",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FM1 LIQUID"
  },
  {
    "id": "nomad-prd-32",
    "descripcion": "FOUNDATION ONE HEME",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FM1 HEME"
  },
  {
    "id": "nomad-prd-33",
    "descripcion": "FOUNDATION CDX + PDL1",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FM1 CDX+PDL1"
  },
  {
    "id": "nomad-prd-34",
    "descripcion": "FOUNDATION ONE CDX",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FM1 CDX"
  },
  {
    "id": "nomad-prd-35",
    "descripcion": "FOUNDATION ONE LIQUID",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "FM1"
  },
  {
    "id": "nomad-prd-36",
    "descripcion": "ESTUDIO GENOMICO, METASTASIS DE PANCREAS",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "ESTGEN"
  },
  {
    "id": "nomad-prd-37",
    "descripcion": "ONCURIA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "ESONC"
  },
  {
    "id": "nomad-prd-38",
    "descripcion": "PAGO DE DEDUCIBLE",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "DEDU"
  },
  {
    "id": "nomad-prd-39",
    "descripcion": "PANBIOTM COVID-19AG RAPID TEST DEVICE",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "COVD25TEST"
  },
  {
    "id": "nomad-prd-40",
    "descripcion": "SERVICIO DE COMISION POR VENTAS",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "COMVEN"
  },
  {
    "id": "nomad-prd-41",
    "descripcion": "COMPREHENSIVE PGX  PANEL",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "COMPGX"
  },
  {
    "id": "nomad-prd-42",
    "descripcion": "MAMMAPRINT",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "COMMAMMA"
  },
  {
    "id": "nomad-prd-43",
    "descripcion": "PAGO DE COASEGURO",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "COASE"
  },
  {
    "id": "nomad-prd-44",
    "descripcion": "BRAF EN BIOPSIA LIQUIDA",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "BRAFLIQ"
  },
  {
    "id": "nomad-prd-45",
    "descripcion": "AVEIO CGP",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "AVECGP"
  },
  {
    "id": "nomad-prd-46",
    "descripcion": "PRUEBA DE ANTIGENO SARS-COV-2 TEST 5",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "ATGCOVTST5"
  },
  {
    "id": "nomad-prd-47",
    "descripcion": "PRUEBA DE ANTIGENO SARS-COV-2",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "ATGCOV"
  },
  {
    "id": "nomad-prd-48",
    "descripcion": "ARCHER VARIANTPLEX CORE MYELOID",
    "claveProdServ": "",
    "claveUnidad": "",
    "unidad": "",
    "precio": 0,
    "gravaIva": true,
    "claveInterna": "ARCVARIAN"
  }
];


// ========================= PAGOS =========================

function initPagos() {
  const form = document.getElementById("form-pago");
  if (!form) return;

  renderClientesEnPagos();
  renderTablaPagos();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarPagoDesdeForm();
  });

  const btnLimpiar = document.getElementById("btn-pago-limpiar");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      form.reset();
      const jsonArea = document.getElementById("pag-json");
      if (jsonArea) jsonArea.value = "";
      const serieInput = document.getElementById("pag-serie");
      if (serieInput) serieInput.value = "CP";
    });
  }
}

function renderClientesEnPagos() {
  const sel = document.getElementById("pag-cliente");
  if (!sel) return;
  sel.innerHTML = "";
  if (!Array.isArray(clientes) || clientes.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No hay clientes, crea uno primero";
    opt.value = "";
    sel.appendChild(opt);
    return;
  }
  clientes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nombre} (${c.rfc || "S/RFC"})`;
    sel.appendChild(opt);
  });
}

function guardarPagoDesdeForm() {
  const form = document.getElementById("form-pago");
  if (!form) return;

  const clienteId = document.getElementById("pag-cliente").value;
  const cliente = clientes.find((c) => c.id === clienteId);

  if (!cliente) {
    alert("Selecciona un cliente para el pago.");
    return;
  }

  const fechaPago = document.getElementById("pag-fecha").value || hoyIso();
  const serie = (document.getElementById("pag-serie").value || "CP").trim();
  const folio = (document.getElementById("pag-folio").value || "").trim();
  const formaPago = document.getElementById("pag-forma-pago").value;
  const monto = parseFloat(document.getElementById("pag-monto").value || "0");
  const facturasRel = (document.getElementById("pag-facturas").value || "").trim();
  const notas = (document.getElementById("pag-notas").value || "").trim();

  if (!monto || monto <= 0) {
    alert("Captura un monto de pago válido.");
    return;
  }

  const id = form.dataset.editId || uid();

  const pago = {
    id,
    facturaId: (form.dataset.facturaId || ""),
    serie,
    folio,
    clienteId,
    clienteNombre: cliente.nombre,
    clienteRfc: cliente.rfc,
    fechaPago,
    formaPago,
    monto,
    facturasRel,
    notas,
    creadoEl: new Date().toISOString()
  };

  const idx = pagos.findIndex((p) => p.id === id);
  if (idx >= 0) {
    pagos[idx] = pago;
  } else {
    pagos.push(pago);
  }

  // JSON "maqueta" de complemento de pago
  const json = {
    tipoComprobante: "P", // pago
    versionCfdi: "4.0",
    emisor: {
      nombre: EMISOR.nombre,
      rfc: EMISOR.rfc
    },
    receptor: {
      nombre: cliente.nombre,
      rfc: cliente.rfc
    },
    pago: {
      fechaPago,
      formaPago,
      moneda: "MXN",
      monto,
      facturasRelacionadas: facturasRel
        ? facturasRel.split(",").map((x) => x.trim()).filter(Boolean)
        : []
    }
  };

  const jsonArea = document.getElementById("pag-json");
  if (jsonArea) {
    jsonArea.value = JSON.stringify(json, null, 2);
  }

  guardarEnLocalStorage();
  renderTablaPagos();
  const fid = (form.dataset.facturaId || "");
  if (fid) {
    actualizarResumenFacturaPagos(fid);
    sincronizarSaldoFacturaConPagos(fid);
  }
  form.dataset.editId = ""; // modo alta de nuevo
}

function ensurePagosActionsColumn() {
  const table = document.getElementById("tabla-pagos");
  if (!table) return;
  const headRow = table.querySelector("thead tr");
  if (!headRow) return;
  const ths = headRow.querySelectorAll("th");
  if (ths.length < 6) {
    const th = document.createElement("th");
    th.textContent = "Acciones";
    headRow.appendChild(th);
  }
}

function renderTablaPagos() {
  ensurePagosActionsColumn();

  const tbody = document.querySelector("#tabla-pagos tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!Array.isArray(pagos)) return;

  const filtroFacturaId = window.__pagosFacturaFilterId || "";
  const lista = filtroFacturaId
    ? pagos.filter(p => (p.facturaId || "") === filtroFacturaId)
    : pagos;

  lista.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeXml(p.serie || "")} ${escapeXml(p.folio || "")}</td>
      <td>${escapeXml(p.fechaPago || "")}</td>
      <td>${escapeXml(p.clienteNombre || "")}</td>
      <td>${formatoMoneda(p.monto || 0)}</td>
      <td>${escapeXml(p.facturasRel || "")}</td>
      <td>
        <button type="button" class="btn small btn-light pago-edit" data-id="${escapeXml(p.id)}">Editar</button>
        <button type="button" class="btn small btn-danger pago-del" data-id="${escapeXml(p.id)}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ========================= NOTAS DE CRÉDITO =========================

function initNotasCredito() {
  const form = document.getElementById("form-nota");
  if (!form) return;

  renderClientesEnNotas();
  renderTablaNotas();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarNotaDesdeForm();
  });

  const btnLimpiar = document.getElementById("btn-nc-limpiar");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      form.reset();
      const jsonArea = document.getElementById("nc-json");
      if (jsonArea) jsonArea.value = "";
      const serieInput = document.getElementById("nc-serie");
      if (serieInput) serieInput.value = "NC";
    });
  }
}

function renderClientesEnNotas() {
  const sel = document.getElementById("nc-cliente");
  if (!sel) return;
  sel.innerHTML = "";
  if (!Array.isArray(clientes) || clientes.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No hay clientes, crea uno primero";
    opt.value = "";
    sel.appendChild(opt);
    return;
  }
  clientes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nombre} (${c.rfc || "S/RFC"})`;
    sel.appendChild(opt);
  });
}

function guardarNotaDesdeForm() {
  const form = document.getElementById("form-nota");
  if (!form) return;

  const clienteId = document.getElementById("nc-cliente").value;
  const cliente = clientes.find((c) => c.id === clienteId);

  if (!cliente) {
    alert("Selecciona un cliente para la nota de crédito.");
    return;
  }

  const fecha = document.getElementById("nc-fecha").value || hoyIso();
  const serie = (document.getElementById("nc-serie").value || "NC").trim();
  const folio = (document.getElementById("nc-folio").value || "").trim();
  const tipo = document.getElementById("nc-tipo").value;
  const monto = parseFloat(document.getElementById("nc-monto").value || "0");
  const facturaRel = (document.getElementById("nc-factura-rel").value || "").trim();
  const tipoCancelacion = document.getElementById("nc-cancelacion").value;
  const sustituye = (document.getElementById("nc-sustituye").value || "").trim();
  const motivo = (document.getElementById("nc-motivo").value || "").trim();

  if (!monto || monto <= 0) {
    alert("Captura un monto de nota válido.");
    return;
  }

  const id = form.dataset.editId || uid();

  const nota = {
    id,
    serie,
    folio,
    clienteId,
    clienteNombre: cliente.nombre,
    clienteRfc: cliente.rfc,
    fecha,
    tipo,
    monto,
    facturaRel,
    tipoCancelacion,
    sustituye,
    motivo,
    creadoEl: new Date().toISOString()
  };

  const idx = notasCredito.findIndex((n) => n.id === id);
  if (idx >= 0) {
    notasCredito[idx] = nota;
  } else {
    notasCredito.push(nota);
  }

  // JSON "maqueta" de nota de crédito / cancelación
  const json = {
    tipoComprobante: "E", // E = Egreso
    versionCfdi: "4.0",
    emisor: {
      nombre: EMISOR.nombre,
      rfc: EMISOR.rfc
    },
    receptor: {
      nombre: cliente.nombre,
      rfc: cliente.rfc
    },
    nota: {
      fecha,
      tipo,
      monto,
      facturaRelacionada: facturaRel,
      cancelacion: {
        tipo: tipoCancelacion,
        sustituye
      },
      motivo
    }
  };

  const jsonArea = document.getElementById("nc-json");
  if (jsonArea) {
    jsonArea.value = JSON.stringify(json, null, 2);
  }

  guardarEnLocalStorage();
  renderTablaNotas();
  form.dataset.editId = "";
}

function renderTablaNotas() {
  const tbody = document.querySelector("#tabla-notas tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!Array.isArray(notasCredito)) return;

  notasCredito.forEach((n) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeXml(n.serie || "")} ${escapeXml(n.folio || "")}</td>
      <td>${escapeXml(n.fecha || "")}</td>
      <td>${escapeXml(n.clienteNombre || "")}</td>
      <td>${escapeXml(n.tipo || "")}</td>
      <td>${formatoMoneda(n.monto || 0)}</td>
      <td>${escapeXml(n.facturaRel || "")}</td>
    `;
    tbody.appendChild(tr);
  });
}


// ========================= UTILIDADES =========================
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatoMoneda(n) {
  return (n || 0).toFixed(2);
}

// Para mostrar con comas: 50,000.00
function formatoMonedaBonito(n) {
  const num = Number(n || 0);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeXml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function hoyIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() + "-" +
    pad(d.getMonth() + 1) + "-" +
    pad(d.getDate()) + "T" +
    pad(d.getHours()) + ":" +
    pad(d.getMinutes()) + ":" +
    pad(d.getSeconds())
  );
}



// ========================= FOLIOS POR EMPRESA =========================
function obtenerClaveFolioActual() {
  return empresaActual === "nomad" ? LS_KEYS.folioNomad : LS_KEYS.folioSanare;
}

function inicializarFolioSegunEmpresa() {
  const inputFolio = document.getElementById("fac-folio");
  if (!inputFolio) return;
  const key = obtenerClaveFolioActual();
  let ultimo = parseInt(localStorage.getItem(key) || "0", 10);
  if (!Number.isFinite(ultimo) || ultimo < 0) ultimo = 0;
  const siguiente = ultimo + 1;
  inputFolio.value = siguiente;
}

function guardarFolioUsado(folioValor) {
  const folioNum = parseInt(folioValor || "0", 10);
  if (!folioNum || folioNum <= 0) return;
  const key = obtenerClaveFolioActual();
  const actual = parseInt(localStorage.getItem(key) || "0", 10);
  if (!Number.isFinite(actual) || folioNum > actual) {
    localStorage.setItem(key, String(folioNum));
  }
}
// ========================= CARGA INICIAL =========================
document.addEventListener("DOMContentLoaded", () => {
  initNavegacion();
  cargarDesdeLocalStorage();
  cargarSatCatalogs();
  initClientes();
  initProductos();
  initCompras();
  initFacturacion();
  initPagos();
  initHistoricoFacturacion();
  initAdminPagosDrawer();
  initPagosTablaAcciones();
  initNotasCredito();
});

// ========================= NAVEGACIÓN =========================

function initNavegacion() {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const section = btn.dataset.section;
      document
        .querySelectorAll(".section")
        .forEach((sec) => sec.classList.remove("visible"));
      document
        .getElementById(`sec-${section}`)
        .classList.add("visible");
    });
  });

  const empresaButtons = document.querySelectorAll(".empresa-btn");
  empresaButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const emp = btn.dataset.empresa;
      if (emp !== "sanare" && emp !== "nomad") return;
      empresaActual = emp;
      // guardamos empresa seleccionada y recargamos catálogos
      localStorage.setItem(LS_KEYS.empresaActual, empresaActual);
      cargarDesdeLocalStorage();
      renderClientes();
      renderProductos();
      renderClientesEnFactura();
      if (typeof renderHistorialCompras === "function") {
        renderHistorialCompras();
      }
      if (typeof renderClientesEnPagos === "function") {
        renderClientesEnPagos();
      }
      if (typeof renderClientesEnNotas === "function") {
        renderClientesEnNotas();
      }
      if (typeof renderTablaPagos === "function") {
        renderTablaPagos();
      }
      if (typeof renderTablaNotas === "function") {
        renderTablaNotas();
      }
      // reiniciar folio de factura para la empresa seleccionada
      inicializarFolioSegunEmpresa();
      // actualizar estilos activos
      empresaButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}


// ========================= LOCAL STORAGE =========================


function cargarDesdeLocalStorage() {
  try {
    const emp = localStorage.getItem(LS_KEYS.empresaActual);
    if (emp === "sanare" || emp === "nomad") {
      empresaActual = emp;
    }

    const cliSan = localStorage.getItem(LS_KEYS.clientesSanare);
    const cliNom = localStorage.getItem(LS_KEYS.clientesNomad);
    const prdSan = localStorage.getItem(LS_KEYS.productosSanare);
    const prdNom = localStorage.getItem(LS_KEYS.productosNomad);
    const cmpSan = localStorage.getItem(LS_KEYS.comprasSanare);
    const cmpNom = localStorage.getItem(LS_KEYS.comprasNomad);
    const pagSan = localStorage.getItem(LS_KEYS.pagosSanare);
    const pagNom = localStorage.getItem(LS_KEYS.pagosNomad);
    const ncSan  = localStorage.getItem(LS_KEYS.notasSanare);
    const ncNom  = localStorage.getItem(LS_KEYS.notasNomad);
    const facSan = localStorage.getItem(LS_KEYS.facturasSanare);
    const facNom = localStorage.getItem(LS_KEYS.facturasNomad);

    let clientesSanare = cliSan ? JSON.parse(cliSan) : [];
    let clientesNomad = cliNom ? JSON.parse(cliNom) : [];
    let productosSanare = prdSan ? JSON.parse(prdSan) : [];
    let productosNomad = prdNom ? JSON.parse(prdNom) : [];
    let comprasSanare = cmpSan ? JSON.parse(cmpSan) : [];
    let comprasNomad = cmpNom ? JSON.parse(cmpNom) : [];
    let pagosSanare = pagSan ? JSON.parse(pagSan) : [];
    let pagosNomad  = pagNom ? JSON.parse(pagNom) : [];
    let notasSanare = ncSan ? JSON.parse(ncSan) : [];
    let notasNomad  = ncNom ? JSON.parse(ncNom) : [];

    let facturasSanare = facSan ? JSON.parse(facSan) : [];
    let facturasNomad = facNom ? JSON.parse(facNom) : [];

    // aplicamos parches de catálogo base (solo llena campos vacíos)
    clientesSanare = aplicarParchesClientesBase(clientesSanare, CLIENTES_BASE_SANARE);
    clientesNomad = aplicarParchesClientesBase(clientesNomad, CLIENTES_BASE_NOMAD);

    // si están vacíos, usamos catálogo base de Excel
    if (clientesSanare.length === 0) clientesSanare = CLIENTES_BASE_SANARE.slice();
    if (clientesNomad.length === 0) clientesNomad = CLIENTES_BASE_NOMAD.slice();
    if (productosSanare.length === 0) productosSanare = PRODUCTOS_BASE_SANARE.slice();
    if (productosNomad.length === 0) productosNomad = PRODUCTOS_BASE_NOMAD.slice();

    // elegimos arreglo según empresaActual
    if (empresaActual === "sanare") {
      clientes = clientesSanare;
      productos = productosSanare;
      compras = comprasSanare;
      pagos = pagosSanare;
      notasCredito = notasSanare;
      facturas = facturasSanare;
    } else {
      clientes = clientesNomad;
      productos = productosNomad;
      compras = comprasNomad;
      pagos = pagosNomad;
      notasCredito = notasNomad;
      facturas = facturasNomad;
    }

    // guardamos de nuevo por si se inicializaron con base Excel
    localStorage.setItem(LS_KEYS.clientesSanare, JSON.stringify(clientesSanare));
    localStorage.setItem(LS_KEYS.clientesNomad, JSON.stringify(clientesNomad));
    localStorage.setItem(LS_KEYS.productosSanare, JSON.stringify(productosSanare));
    localStorage.setItem(LS_KEYS.productosNomad, JSON.stringify(productosNomad));
    localStorage.setItem(LS_KEYS.comprasSanare, JSON.stringify(comprasSanare));
    localStorage.setItem(LS_KEYS.comprasNomad, JSON.stringify(comprasNomad));
    localStorage.setItem(LS_KEYS.pagosSanare, JSON.stringify(pagosSanare));
    localStorage.setItem(LS_KEYS.pagosNomad, JSON.stringify(pagosNomad));
    localStorage.setItem(LS_KEYS.notasSanare, JSON.stringify(notasSanare));
    localStorage.setItem(LS_KEYS.notasNomad, JSON.stringify(notasNomad));
    localStorage.setItem(LS_KEYS.facturasSanare, JSON.stringify(facturasSanare));
    localStorage.setItem(LS_KEYS.facturasNomad, JSON.stringify(facturasNomad));
    localStorage.setItem(LS_KEYS.empresaActual, empresaActual);
  } catch (e) {
    console.warn("Error leyendo localStorage", e);
    // si algo falla, cargamos catálogos base
    clientes = empresaActual === "sanare" ? CLIENTES_BASE_SANARE.slice() : CLIENTES_BASE_NOMAD.slice();
    productos = empresaActual === "sanare" ? PRODUCTOS_BASE_SANARE.slice() : PRODUCTOS_BASE_NOMAD.slice();
    compras = [];
    pagos = [];
    notasCredito = [];
    facturas = [];
  }
}

function guardarEnLocalStorage() {
  // leemos lo que haya
  const cliSan = localStorage.getItem(LS_KEYS.clientesSanare);
  const cliNom = localStorage.getItem(LS_KEYS.clientesNomad);
  const prdSan = localStorage.getItem(LS_KEYS.productosSanare);
  const prdNom = localStorage.getItem(LS_KEYS.productosNomad);
  const cmpSan = localStorage.getItem(LS_KEYS.comprasSanare);
  const cmpNom = localStorage.getItem(LS_KEYS.comprasNomad);
  const pagSan = localStorage.getItem(LS_KEYS.pagosSanare);
  const pagNom = localStorage.getItem(LS_KEYS.pagosNomad);
  const ncSan  = localStorage.getItem(LS_KEYS.notasSanare);
  const ncNom  = localStorage.getItem(LS_KEYS.notasNomad);
  const facSan = localStorage.getItem(LS_KEYS.facturasSanare);
  const facNom = localStorage.getItem(LS_KEYS.facturasNomad);

  let clientesSanare = cliSan ? JSON.parse(cliSan) : CLIENTES_BASE_SANARE.slice();
  let clientesNomad = cliNom ? JSON.parse(cliNom) : CLIENTES_BASE_NOMAD.slice();
  let productosSanare = prdSan ? JSON.parse(prdSan) : PRODUCTOS_BASE_SANARE.slice();
  let productosNomad = prdNom ? JSON.parse(prdNom) : PRODUCTOS_BASE_NOMAD.slice();
  let comprasSanare = cmpSan ? JSON.parse(cmpSan) : [];
  let comprasNomad = cmpNom ? JSON.parse(cmpNom) : [];
  let pagosSanare = pagSan ? JSON.parse(pagSan) : [];
  let pagosNomad  = pagNom ? JSON.parse(pagNom) : [];
  let notasSanare = ncSan ? JSON.parse(ncSan) : [];
  let notasNomad  = ncNom ? JSON.parse(ncNom) : [];
  let facturasSanare = facSan ? JSON.parse(facSan) : [];
  let facturasNomad  = facNom ? JSON.parse(facNom) : [];

  if (empresaActual === "sanare") {
    clientesSanare = clientes.slice();
    productosSanare = productos.slice();
    comprasSanare = compras.slice();
    pagosSanare = pagos.slice();
    notasSanare = notasCredito.slice();
    facturasSanare = facturas.slice();
  } else {
    clientesNomad = clientes.slice();
    productosNomad = productos.slice();
    comprasNomad = compras.slice();
    pagosNomad = pagos.slice();
    notasNomad = notasCredito.slice();
    facturasNomad = facturas.slice();
  }

  localStorage.setItem(LS_KEYS.clientesSanare, JSON.stringify(clientesSanare));
  localStorage.setItem(LS_KEYS.clientesNomad, JSON.stringify(clientesNomad));
  localStorage.setItem(LS_KEYS.productosSanare, JSON.stringify(productosSanare));
  localStorage.setItem(LS_KEYS.productosNomad, JSON.stringify(productosNomad));
  localStorage.setItem(LS_KEYS.comprasSanare, JSON.stringify(comprasSanare));
  localStorage.setItem(LS_KEYS.comprasNomad, JSON.stringify(comprasNomad));
  localStorage.setItem(LS_KEYS.pagosSanare, JSON.stringify(pagosSanare));
  localStorage.setItem(LS_KEYS.pagosNomad, JSON.stringify(pagosNomad));
  localStorage.setItem(LS_KEYS.notasSanare, JSON.stringify(notasSanare));
  localStorage.setItem(LS_KEYS.notasNomad, JSON.stringify(notasNomad));
  localStorage.setItem(LS_KEYS.facturasSanare, JSON.stringify(facturasSanare));
  localStorage.setItem(LS_KEYS.facturasNomad, JSON.stringify(facturasNomad));
  localStorage.setItem(LS_KEYS.empresaActual, empresaActual);
}
// ========================= SAT CATALOGS =========================
async function cargarSatCatalogs() {
  try {
    const res = await fetch("sat_catalogs.json");
    if (!res.ok) throw new Error("sat_catalogs.json no encontrado");
    satCatalogs = await res.json();
    console.log("SAT catalogs cargados", satCatalogs);
  } catch (e) {
    console.warn("No se pudieron cargar los catálogos SAT; uso valores mínimos", e);
    // Fallback mínimo (suficiente para operar)
    satCatalogs = {
      formaPago: [
        { clave: "01", descripcion: "Efectivo" },
        { clave: "02", descripcion: "Cheque nominativo" },
        { clave: "03", descripcion: "Transferencia electrónica de fondos" },
        { clave: "04", descripcion: "Tarjeta de crédito" },
        { clave: "05", descripcion: "Monedero electrónico" },
        { clave: "06", descripcion: "Dinero electrónico" },
        { clave: "07", descripcion: "Tarjeta de débito" },
        { clave: "08", descripcion: "Vales de despensa" }
      ],
      metodoPago: [
        { clave: "PUE", descripcion: "Pago en una sola exhibición" },
        { clave: "PPD", descripcion: "Pago en parcialidades o diferido" }
      ],
      regimenFiscal: [
        { clave: "601", descripcion: "General de Ley Personas Morales" },
        { clave: "605", descripcion: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
        { clave: "612", descripcion: "Personas Físicas con Actividades Empresariales y Profesionales" }
      ],
      usoCFDI: [
        { clave: "G01", descripcion: "Adquisición de mercancías" },
        { clave: "G03", descripcion: "Gastos en general" }
      ],
      prodServ: [],
      claveUnidad: []
    };
  }

  normalizarSatCatalogs();
  poblarCombosSat();
}


function poblarCombosSat() {
  // Cliente: régimen y uso
  const selReg = document.getElementById("cli-regimen");
  const selUso = document.getElementById("cli-uso-cfdi");
  selReg.innerHTML = `<option value="">Selecciona...</option>`;
  satCatalogs.regimenFiscal.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.clave;
    opt.textContent = `${r.clave} - ${r.descripcion}`;
    selReg.appendChild(opt);
  });
  selUso.innerHTML = `<option value="">Selecciona...</option>`;
  satCatalogs.usoCFDI.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.clave;
    opt.textContent = `${u.clave} - ${u.descripcion}`;
    selUso.appendChild(opt);
  });

  // Factura: forma de pago, método
  const selForma = document.getElementById("fac-forma-pago");
  const selMetodo = document.getElementById("fac-metodo-pago");
  selForma.innerHTML = "";
  satCatalogs.formaPago.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.clave;
    opt.textContent = `${f.clave} - ${f.descripcion}`;
    selForma.appendChild(opt);
  });
  selMetodo.innerHTML = "";
  satCatalogs.metodoPago.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.clave;
    opt.textContent = `${m.clave} - ${m.descripcion}`;
    selMetodo.appendChild(opt);
  });

  
  // Pagos: forma de pago (se reutiliza catálogo SAT)
  const selFormaPagoPago = document.getElementById("pag-forma-pago");
  if (selFormaPagoPago) {
    selFormaPagoPago.innerHTML = "";
    satCatalogs.formaPago.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.clave;
      opt.textContent = `${f.clave} - ${f.descripcion}`;
      selFormaPagoPago.appendChild(opt);
    });
  }
  // Facturación: tipo de comprobante
  const selTipo = document.getElementById("fac-tipo-comp");
  if (selTipo) {
    selTipo.innerHTML = "";
    (satCatalogs.tipoComprobante || [
      { clave: "I", descripcion: "Ingreso" },
      { clave: "E", descripcion: "Egreso (Nota de crédito)" },
      { clave: "T", descripcion: "Traslado" },
      { clave: "N", descripcion: "Nómina" },
      { clave: "P", descripcion: "Pago" }
    ]).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.clave;
      opt.textContent = `${t.clave} - ${t.descripcion}`;
      selTipo.appendChild(opt);
    });
    selTipo.value = "I";
  }


// Producto: datalist de ClaveProdServ y ClaveUnidad (TODOS los valores del Excel)
  const dlProdServ = document.getElementById("lista-clave-prodserv");
  const dlUnidad = document.getElementById("lista-clave-unidad");
  dlProdServ.innerHTML = "";
  satCatalogs.prodServ.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = `${p.clave} - ${p.descripcion}`;
    dlProdServ.appendChild(opt);
  });
  dlUnidad.innerHTML = "";
  satCatalogs.claveUnidad.forEach((u) => {
    const texto = u.simbolo
      ? `${u.clave} - ${u.nombre} (${u.simbolo})`
      : `${u.clave} - ${u.nombre}`;
    const opt = document.createElement("option");
    opt.value = texto;
    dlUnidad.appendChild(opt);
  });
}

function pad2Clave(valor){
  const s = String(valor ?? "");
  return (/^\d$/.test(s)) ? `0${s}` : s;
}

function normalizarSatCatalogs(){
  if (!satCatalogs) return;
  // Normaliza forma de pago 1..9 => 01..09
  if (Array.isArray(satCatalogs.formaPago)) {
    satCatalogs.formaPago = satCatalogs.formaPago.map(fp => ({
      ...fp,
      clave: pad2Clave(fp.clave)
    }));
    // Asegura 07 (Tarjeta de débito)
    const tiene07 = satCatalogs.formaPago.some(fp => fp.clave === "07");
    if (!tiene07) satCatalogs.formaPago.splice(6, 0, { clave: "07", descripcion: "Tarjeta de débito" });
  }

  // Catálogo local para tipo de comprobante (CFDI)
  satCatalogs.tipoComprobante = [
    { clave: "I", descripcion: "Ingreso" },
    { clave: "E", descripcion: "Egreso (Nota de crédito)" },
    { clave: "T", descripcion: "Traslado" },
    { clave: "N", descripcion: "Nómina" },
    { clave: "P", descripcion: "Pago" }
  ];
}

function buscarEnCatalogo(nombre, clave){
  if (!satCatalogs || !satCatalogs[nombre]) return "";
  const c = String(clave ?? "");
  const normalizado = (nombre === "formaPago") ? pad2Clave(c) : c;
  const item = satCatalogs[nombre].find(x => String(x.clave) === normalizado || String(x.clave) === c);
  return item ? item.descripcion : "";
}

function formatearClaveDescripcion(nombreCatalogo, clave){
  const c = (nombreCatalogo === "formaPago") ? pad2Clave(clave) : String(clave ?? "");
  const d = buscarEnCatalogo(nombreCatalogo, c);
  return d ? `${c} - ${d}` : c;
}

function formatearTipoComprobante(clave){
  // usa catálogo local
  if (!satCatalogs || !satCatalogs.tipoComprobante) return String(clave ?? "");
  const c = String(clave ?? "");
  const item = satCatalogs.tipoComprobante.find(x => x.clave === c);
  return item ? `${item.clave} - ${item.descripcion}` : c;
}


// ========================= CLIENTES =========================
function initClientes() {
  const form = document.getElementById("form-cliente");
  const btnLimpiar = document.getElementById("btn-cli-limpiar");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.dataset.editId || uid();
    const data = {
      id,
      nombre: document.getElementById("cli-nombre").value.trim(),
      rfc: document.getElementById("cli-rfc").value.trim().toUpperCase(),
      regimen: document.getElementById("cli-regimen").value,
      usoCfdi: document.getElementById("cli-uso-cfdi").value,
      cp: document.getElementById("cli-cp").value.trim(),
      direccion: document.getElementById("cli-direccion").value.trim(),
      email: document.getElementById("cli-email").value.trim(),
      telefono: document.getElementById("cli-telefono").value.trim()
    };

    if (!data.nombre || !data.rfc || !data.regimen || !data.usoCfdi || !data.cp) {
      alert("Revisa los datos obligatorios del cliente.");
      return;
    }

    const idx = clientes.findIndex((c) => c.id === id);
    if (idx >= 0) {
      clientes[idx] = data;
    } else {
      clientes.push(data);
    }
    guardarEnLocalStorage();
    renderClientes();
    renderClientesEnFactura();
    limpiarFormCliente();
  });

  btnLimpiar.addEventListener("click", limpiarFormCliente);

  renderClientes();
  renderClientesEnFactura();
}

function renderClientes() {
  const tbody = document.querySelector("#tabla-clientes tbody");
  tbody.innerHTML = "";

  clientes.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.nombre}</td>
      <td>${c.rfc}</td>
      <td>${c.regimen}</td>
      <td>${c.usoCfdi}</td>
      <td>${c.cp}</td>
      <td class="actions">
        <button type="button" data-id="${c.id}" class="btn-cli-edit">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-cli-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      editarCliente(btn.dataset.id);
    });
  });
}

function editarCliente(id) {
  const c = clientes.find((x) => x.id === id);
  if (!c) return;
  const form = document.getElementById("form-cliente");
  form.dataset.editId = c.id;
  document.getElementById("cli-nombre").value = c.nombre;
  document.getElementById("cli-rfc").value = c.rfc;
  document.getElementById("cli-regimen").value = c.regimen;
  document.getElementById("cli-uso-cfdi").value = c.usoCfdi;
  document.getElementById("cli-cp").value = c.cp;
  document.getElementById("cli-direccion").value = c.direccion;
  document.getElementById("cli-email").value = c.email;
  document.getElementById("cli-telefono").value = c.telefono;
}

function limpiarFormCliente() {
  const form = document.getElementById("form-cliente");
  form.reset();
  delete form.dataset.editId;
}

// ========================= PRODUCTOS =========================
function initProductos() {
  const form = document.getElementById("form-producto");
  const btnLimpiar = document.getElementById("btn-prd-limpiar");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.dataset.editId || uid();

    const claveProdServText = document.getElementById("prd-clave-prodserv").value.trim();
    const claveUnidadText = document.getElementById("prd-clave-unidad").value.trim();

    const claveProdServ = claveProdServText.split(" - ")[0] || "";
    const claveUnidad = claveUnidadText.split(" - ")[0] || "";

    const data = {
      id,
      descripcion: document.getElementById("prd-descripcion").value.trim(),
      claveProdServ,
      claveUnidad,
      unidad: document.getElementById("prd-unidad").value.trim(),
      precio: parseFloat(document.getElementById("prd-precio").value || "0"),
      gravaIva: document.getElementById("prd-grava-iva").checked
    };

    if (!data.descripcion || !data.precio) {
      alert("Revisa los datos del producto.");
      return;
    }

    const idx = productos.findIndex((p) => p.id === id);
    if (idx >= 0) {
      productos[idx] = data;
    } else {
      productos.push(data);
    }
    guardarEnLocalStorage();
    renderProductos();
    limpiarFormProducto();
  });

  btnLimpiar.addEventListener("click", limpiarFormProducto);

  renderProductos();
}

function renderProductos() {
  const tbody = document.querySelector("#tabla-productos tbody");
  tbody.innerHTML = "";

  productos.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.descripcion}</td>
      <td>${p.claveProdServ}</td>
      <td>${p.claveUnidad}</td>
      <td>${p.unidad}</td>
      <td>${formatoMoneda(p.precio)}</td>
      <td>${p.gravaIva ? "Sí" : "No"}</td>
      <td class="actions">
        <button type="button" data-id="${p.id}" class="btn-prd-edit">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-prd-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      editarProducto(btn.dataset.id);
    });
  });
}

function editarProducto(id) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  const form = document.getElementById("form-producto");
  form.dataset.editId = p.id;
  document.getElementById("prd-descripcion").value = p.descripcion;
  document.getElementById("prd-clave-prodserv").value = p.claveProdServ;
  document.getElementById("prd-clave-unidad").value = p.claveUnidad;
  document.getElementById("prd-unidad").value = p.unidad;
  document.getElementById("prd-precio").value = p.precio;
  document.getElementById("prd-grava-iva").checked = !!p.gravaIva;
}

function limpiarFormProducto() {
  const form = document.getElementById("form-producto");
  form.reset();
  delete form.dataset.editId;
}

// ========================= FACTURACIÓN =========================
function initFacturacion() {
  // Fecha actual
  document.getElementById("fac-fecha").value = hoyIso();
  inicializarFolioSegunEmpresa();

  // Cliente en combo
  renderClientesEnFactura();

  // Botones
  document
    .getElementById("btn-agregar-concepto")
    .addEventListener("click", agregarConcepto);

  document
    .getElementById("btn-generar-xml")
    .addEventListener("click", generarXml);

  document
    .getElementById("btn-ver-impresion")
    .addEventListener("click", verImpresion);

  const btnCancelarUlt = document.getElementById("btn-cancelar-ultima-factura");
  if (btnCancelarUlt) {
    btnCancelarUlt.addEventListener("click", () => {
      if (!ultimaFacturaId) return alert("Aún no hay una factura generada para cancelar.");
      abrirModalCancelacion(ultimaFacturaId);
    });
  }


  // iniciar con una fila de conceptos
  agregarConcepto();
}

function renderClientesEnFactura() {
  const sel = document.getElementById("fac-cliente");
  sel.innerHTML = "";
  if (clientes.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No hay clientes, crea uno primero";
    opt.value = "";
    sel.appendChild(opt);
    return;
  }
  clientes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nombre} (${c.rfc})`;
    sel.appendChild(opt);
  });
}

function agregarConcepto() {
  const tbody = document.getElementById("fac-conceptos-body");
  const id = uid();
  const tr = document.createElement("tr");
  tr.dataset.rowId = id;

  const opcionesProductos = productos
    .map((p) => {
      const etiqueta = p.claveInterna
        ? `${escapeXml(p.claveInterna)} - ${escapeXml(p.descripcion)}`
        : escapeXml(p.descripcion);
      return `<option value="${p.id}">${etiqueta}</option>`;
    })
    .join("");

  tr.innerHTML = `
    <td>
      <select class="fac-prod-select">
        <option value="">Selecciona...</option>
        ${opcionesProductos}
      </select>
    </td>
    <td><input type="text" class="fac-clave-interna" /></td>
    <td><input type="text" class="fac-descripcion" /></td>
    <td><input type="number" min="0" step="0.0001" class="fac-cantidad" value="1" /></td>
    <td><input type="text" class="fac-clave-prodserv" list="lista-clave-prodserv" /></td>
    <td><input type="text" class="fac-clave-unidad" list="lista-clave-unidad" /></td>
    <td><input type="text" class="fac-unidad" /></td>
    <td><input type="number" min="0" step="0.000001" class="fac-precio" /></td>
    <td><input type="text" class="fac-importe" readonly /></td>
    <td><input type="number" min="0" step="0.000001" class="fac-coaseguro" list="lista-coaseguro" /></td>
    <td><input type="number" min="0" step="0.000001" class="fac-deducible" list="lista-deducible" /></td>
    <td><input type="number" min="0" step="0.01" class="fac-descuento" /></td>
    <td><input type="text" class="fac-iva" readonly /></td>
    <td class="actions"><button type="button" class="fac-row-del">X</button></td>
  `;

  tbody.appendChild(tr);

  const selProd = tr.querySelector(".fac-prod-select");
  const inpClaveInterna = tr.querySelector(".fac-clave-interna");
  const inpDesc = tr.querySelector(".fac-descripcion");
  const inpCant = tr.querySelector(".fac-cantidad");
  const inpClaveProd = tr.querySelector(".fac-clave-prodserv");
  const inpClaveUni = tr.querySelector(".fac-clave-unidad");
const inpUni = tr.querySelector(".fac-unidad");
const inpPrecio = tr.querySelector(".fac-precio");

if (satCatalogs && Array.isArray(satCatalogs.claveUnidad)) {
  inpClaveUni.addEventListener("change", () => {
    const clave = extraerClaveSat(inpClaveUni.value);
    const match = satCatalogs.claveUnidad.find((u) => u.clave === clave);
    if (match) {
      inpUni.value = match.simbolo || match.nombre || inpUni.value;
    }
  });
}

  const inpImporte = tr.querySelector(".fac-importe");
  const inpCoaseguro = tr.querySelector(".fac-coaseguro");
  const inpDeducible = tr.querySelector(".fac-deducible");
  const inpDescuento = tr.querySelector(".fac-descuento");
  const inpIva = tr.querySelector(".fac-iva");
  const btnDel = tr.querySelector(".fac-row-del");

  selProd.addEventListener("change", () => {
    const p = productos.find((x) => x.id === selProd.value);
    if (!p) return;
    if (inpClaveInterna) {
      inpClaveInterna.value = p.claveInterna || "";
    }
    inpDesc.value = p.descripcion || "";
    inpClaveProd.value = p.claveProdServ;
    inpClaveUni.value = p.claveUnidad;

    // Rellenar unidad automáticamente usando catálogos SAT si existen
    if (satCatalogs && Array.isArray(satCatalogs.claveUnidad)) {
      const clave = extraerClaveSat(p.claveUnidad || inpClaveUni.value);
      const match = satCatalogs.claveUnidad.find((u) => u.clave === clave);
      if (match) {
        inpUni.value = match.simbolo || match.nombre || p.unidad || "";
      } else {
        inpUni.value = p.unidad || "";
      }
    } else {
      inpUni.value = p.unidad || "";
    }

    inpPrecio.value = p.precio;
    calcularImportes();
  });

  [inpCant, inpPrecio, inpDescuento].forEach((inp) => {
    if (!inp) return;
    inp.addEventListener("input", () => calcularImportes());
  });

  [inpCoaseguro, inpDeducible].forEach((inp) => {
    inp.addEventListener("input", () => recalcularTotales());
  });

  btnDel.addEventListener("click", () => {
    tr.remove();
    calcularImportes();
  });

  function calcularImportes() {
    const cant = parseFloat(inpCant.value || "0");
    const precio = parseFloat(inpPrecio.value || "0");
    const base = cant * precio;
    const descPorc = parseFloat((inpDescuento && inpDescuento.value) || "0");
    const montoDesc = base * (descPorc / 100);
    const neto = base - montoDesc;
    const p = productos.find((x) => x.id === selProd.value);
    const gravaIva = p ? p.gravaIva : true;
    const iva = gravaIva ? neto * 0.16 : 0;
    inpImporte.value = formatoMoneda(neto);
    inpIva.value = formatoMoneda(iva);
    recalcularTotales();
  }
}

function extraerClaveSat(valor) {
  const v = (valor || "").trim();
  if (!v) return "";
  const partes = v.split(" - ");
  return partes[0].trim();
}

function leerConceptosFactura() {
  const rows = Array.from(document.querySelectorAll("#fac-conceptos-body tr"));
  const conceptos = [];

  rows.forEach((tr) => {
    const cant = parseFloat(tr.querySelector(".fac-cantidad").value || "0");
    const precio = parseFloat(tr.querySelector(".fac-precio").value || "0");
    if (!cant || !precio) return;
    const base = cant * precio;
    const descuentoPorcentaje = parseFloat(tr.querySelector(".fac-descuento")?.value || "0");
    const descuentoMonto = base * (descuentoPorcentaje / 100);
    const importeNeto = base - descuentoMonto;
    const iva = parseFloat(tr.querySelector(".fac-iva").value || "0");
    const coaseguro = parseFloat(tr.querySelector(".fac-coaseguro")?.value || "0");
    const deducible = parseFloat(tr.querySelector(".fac-deducible")?.value || "0");

    conceptos.push({
      claveInterna: tr.querySelector(".fac-clave-interna")?.value.trim() || "",
      descripcion: tr.querySelector(".fac-descripcion").value.trim(),
      cantidad: cant,
      claveProdServ: extraerClaveSat(tr.querySelector(".fac-clave-prodserv").value),
      claveUnidad: extraerClaveSat(tr.querySelector(".fac-clave-unidad").value),
      unidad: tr.querySelector(".fac-unidad").value.trim(),
      valorUnitario: precio,
      importeBase: base,
      descuentoPorcentaje,
      descuentoMonto,
      importe: importeNeto,
      iva,
      coaseguro,
      deducible
    });
  });

  return conceptos;
}

function recalcularTotales() {
  conceptosFactura = leerConceptosFactura();
  let subtotalBase = 0;
  let descuentoTotal = 0;
  let ivaTotal = 0;
  let coaseguroTotal = 0;
  let deducibleTotal = 0;

  conceptosFactura.forEach((c) => {
    const base = c.importeBase != null ? c.importeBase : c.importe || 0;
    const desc = c.descuentoMonto || 0;
    subtotalBase += base;
    descuentoTotal += desc;
    ivaTotal += c.iva || 0;
    coaseguroTotal += c.coaseguro || 0;
    deducibleTotal += c.deducible || 0;
  });

  const subtotalNeto = subtotalBase - descuentoTotal;
  const totalCfdi = subtotalNeto + ivaTotal;
  const totalPaciente = totalCfdi - coaseguroTotal - deducibleTotal;
  const notasInput = document.getElementById("fac-notas");
  const notas = notasInput ? notasInput.value.trim() : "";

  const elSub = document.getElementById("fac-subtotal");
  const elDesc = document.getElementById("fac-descuento");
  const elIva = document.getElementById("fac-iva");
  const elTot = document.getElementById("fac-total");
  if (elSub) elSub.textContent = formatoMonedaBonito(subtotalBase);
  if (elDesc) elDesc.textContent = formatoMonedaBonito(descuentoTotal);
  if (elIva) elIva.textContent = formatoMonedaBonito(ivaTotal);
  if (elTot) elTot.textContent = formatoMonedaBonito(totalCfdi);

  const elCoa = document.getElementById("fac-coaseguro-total");
  const elDed = document.getElementById("fac-deducible-total");
  const elTotAdj = document.getElementById("fac-total-ajustado");
  if (elCoa) elCoa.textContent = formatoMonedaBonito(coaseguroTotal);
  if (elDed) elDed.textContent = formatoMonedaBonito(deducibleTotal);
  if (elTotAdj) elTotAdj.textContent = formatoMonedaBonito(totalPaciente);
}


// ========================= GENERAR XML CFDI =========================
function generarXml() {
  conceptosFactura = leerConceptosFactura();
  if (conceptosFactura.length === 0) {
    alert("Agrega al menos un concepto.");
    return;
  }

  const clienteId = document.getElementById("fac-cliente").value;
  const cliente = clientes.find((c) => c.id === clienteId);
  if (!cliente) {
    alert("Selecciona un cliente.");
    return;
  }

  const serie = document.getElementById("fac-serie").value.trim() || "";
  const folio = document.getElementById("fac-folio").value.trim() || "";
  const formaPago = document.getElementById("fac-forma-pago").value;
  const metodoPago = document.getElementById("fac-metodo-pago").value;
  const moneda = document.getElementById("fac-moneda").value.trim() || "MXN";
  const lugarExp = document.getElementById("fac-lugar-exp").value.trim() || EMISOR.cp;
  const tipoComp = document.getElementById("fac-tipo-comp").value.trim() || "I";
  const fecha = hoyIso();
  document.getElementById("fac-fecha").value = fecha;

  let subtotal = 0;
  let ivaTotal = 0;
  conceptosFactura.forEach((c) => {
    subtotal += c.importe;
    ivaTotal += c.iva;
  });
  const total = subtotal + ivaTotal;

  const conceptosXml = conceptosFactura
    .map((c) => {
      const base = c.importe;
      const importeIva = c.iva;
      return `
  <cfdi:Concepto ObjetoImp="02"
    ClaveProdServ="${escapeXml(c.claveProdServ || "01010101")}"
    Cantidad="${c.cantidad.toFixed(4)}"
    ClaveUnidad="${escapeXml(c.claveUnidad || "E48")}"
    Unidad="${escapeXml(c.unidad || "SERV")}"
    Descripcion="${escapeXml(c.descripcion)}"
    ValorUnitario="${c.valorUnitario.toFixed(6)}"
    Importe="${base.toFixed(2)}">
    <cfdi:Impuestos>
      <cfdi:Traslados>
        <cfdi:Traslado Base="${base.toFixed(2)}"
          Impuesto="002"
          TipoFactor="Tasa"
          TasaOCuota="0.160000"
          Importe="${importeIva.toFixed(2)}" />
      </cfdi:Traslados>
    </cfdi:Impuestos>
  </cfdi:Concepto>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  Version="4.0"
  Serie="${escapeXml(serie)}"
  Folio="${escapeXml(folio)}"
  Fecha="${fecha}"
  Moneda="${escapeXml(moneda)}"
  Exportacion="01"
  TipoDeComprobante="${escapeXml(tipoComp)}"
  FormaPago="${escapeXml(formaPago)}"
  MetodoPago="${escapeXml(metodoPago)}"
  LugarExpedicion="${escapeXml(lugarExp)}"
  SubTotal="${subtotal.toFixed(2)}"
  Total="${total.toFixed(2)}"
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd">
  <cfdi:Emisor
    Rfc="${escapeXml(EMISOR.rfc)}"
    Nombre="${escapeXml(EMISOR.nombre)}"
    RegimenFiscal="${escapeXml(EMISOR.regimenFiscal)}" />
  <cfdi:Receptor
    Rfc="${escapeXml(cliente.rfc)}"
    Nombre="${escapeXml(cliente.nombre)}"
    DomicilioFiscalReceptor="${escapeXml(cliente.cp)}"
    RegimenFiscalReceptor="${escapeXml(cliente.regimen)}"
    UsoCFDI="${escapeXml(cliente.usoCfdi)}" />
  <cfdi:Conceptos>${conceptosXml}
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${ivaTotal.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${subtotal.toFixed(2)}"
        Impuesto="002"
        TipoFactor="Tasa"
        TasaOCuota="0.160000"
        Importe="${ivaTotal.toFixed(2)}" />
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <!-- Complemento de timbrado se agrega cuando el PAC timbra este CFDI -->
</cfdi:Comprobante>`;

  document.getElementById("xml-output").value = xml;
  actualizarVistaImpresion(cliente, { serie, folio, fecha, formaPago, metodoPago, subtotal, ivaTotal, total });
  guardarFolioUsado(folio);
}

// ========================= VISTA IMPRESIÓN =========================
function actualizarVistaImpresion(cliente, datosFactura) {
  const preview = document.getElementById("preview-impresion");
  const conceptosHtml = conceptosFactura
    .map((c, i) => {
      return `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeXml(c.claveInterna || "")}</td>
        <td>${escapeXml(c.descripcion)}</td>
        <td>${c.cantidad.toFixed(2)}</td>
        <td>${escapeXml(c.unidad || "")}</td>
        <td>${formatoMonedaBonito(c.valorUnitario)}</td>
        <td>${formatoMonedaBonito(c.importe)}</td>
        <td>${formatoMonedaBonito(c.coaseguro || 0)}</td>
        <td>${formatoMonedaBonito(c.deducible || 0)}</td>
        <td>${formatoMonedaBonito(c.iva || 0)}</td>
      </tr>`;
    })
    .join("");

  const logoHtml =
    empresaActual === "nomad"
      ? `<div><img src="data:image/png;base64,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" alt="NOMAD" style="max-height:100px;margin-bottom:8px;" /></div>`
      : empresaActual === "sanare"
      ? `<div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABnwAAAgACAYAAAAMpJ0gAAAQAElEQVR4AezdCXxcVdn48ee5M0m6pC1LW3YEVFDxFRBEFLe6AtombSXKK6KIEJqUAG1CwXX070KbpViapFERxfUN0iQtsghaxZXXfcPlRdlBCgW60SaZuc//TFlkaZJZ7p25M/ObzzmZyb3nPOd5vrclYU5nxhNuCCCAAAIIIIAAAghUsMD6vr4p161aNX3o8uX7X7Nq+YH93V0vGlzT8bJre9tffk1P5wnpPrC68y2D3R1N6T60puP8ge7Oywe627/8VB/s7bh6sKfj167/Ntc+0NN+41Px/nPfcVF6zXQf6O44LZ1Luq9d03lUOse1X+w8/JovLT+wv7frgIGVK/cYumL5tP7+/lgFX05KRwCBsQU4gwACCCCAAAIIIFDmAmz4lPkFpjwEEEAgMwFGIYAAAuUtsHb16r2/29P+isHu9rkDvR3vd5syn3CbNN3u/tup1LZrRuMjA34sdl0sHru+Wu0m8WXDqOmPY2K/SHf17GZR6U538+UyVVusqmc91cXk3SJyrOvH5NpV9O1PxfvPvSxPr5nuqvKtdC7p7vl2SzpHL2U/iI3Ebqg2/zqpSQ7aSGyg+uG7/sdtHn19qLf9067WpW6z6N2Dfe2vHuhb8cK+vr4qlx8NAQQQQAABBBBAoGIFKBwBBMpZgA2fcr661IYAAggggAACCJS5QHoD46lX6KQ3dQZ6Vx4yuKbzlIHerqVus+NbQz0dv3CbOo953s6H46J/ENV1anKVY/mUmDS5+/eK2Ekm8mYVOcp9/3L3/SHufrb7fi93H9U23SU2W0wOFJUj3eNXqOgb3fdvEdGF7vHpZvpxNelw56+WlP5SU97t+6S2jjiTfw72dt68tru9faCn4xxndfza3vbZN3y5a6+h5cunXbdqVU1//6m8Ski4IYAAAggggAACCCCAAAKlJcCGT2ldr6Jmy+IIIIAAAggggEAxBfoTiervrlnx4rXdK04a6O384EBvx3K3gdGXSm0dGo6P3OLpzr+ope4Q376n5ne4zY7T3EbOCS7nGa7TnhRwJoeJ2Vs81VYV6XNWt3qmd+4cTv3BpsW+Pxwf/mb1w6/+wkBP+yXO+P3rejpPWN/bdcCT07lDAAEEEKgAAUpEAAEEEEAAgdIUYMOnNK8bWSOAAAIIIFAsAdZFoGAC/V1dkwd629+0tru9fain/fqafWo3x837s6feerdhcYXb0LnIJXOm6291GxdHico+7jEtN4HJonqgm3qCii50980q3mfd4yt9sVtSlvrXUE/HA4O9nUNre9qXpD9DSLghgAACCCCAAAIIIIBAOQtQWwkKsOFTgheNlBFAAAEEEEAAgXIRSL992EDvykPW9qx44+CazjMGejr+30BP+3fd5sK/aib5W9R0Q/qVKCZ6kplMEpNqV3tcRfg91kGE20zdxlr6rd2qRLTaRPZ138/zRDs9337vrtGo6/872NP5tcGejk+s7+58z9rujtd978sdLxBuFSBAiQgggAACCCCAAAIIIBA1AS9qCZEPAgiUgQAlIIAAAgggMI5Af3eidmBNx2mDvZ1rRuIjv1BJ/cQTb1B9u0JFPqaiC93mwqGux8cJw6kiC6Svj+uvErEzXCqfSqld5amsGx2Vn7oNoN+5vmLd6q66676xKv15Q24IDQEEEEAAAQTKToCCEEAAAQQiJeBFKhuSQQABBBBAAAEEECgbgV/39VVds2r5geu6O1410NN5+mB35xfcJsCfqrV2q/ryLTFrdMUeIybptxLbw20esMHjQEq4pV99teeT1/NoV0eb7/mDI1tGHh7obv+Vu/ar13Z3LBjo6TjW/Vk4aEMiwfV2SDQEEEAAAQQQQAABBBBAICiBYm34BJU/cRBAAAEEEEAAAQQiJNDf31+9rqfzBPfk/kfuTW0d8OKx61MqN6jKVaLW4lJ9ueu0yhKoUtXjXMnNnso1nuj17s/C9Ztn11470Nv58aHeFSem39rPnachgEB5ClAVAggggAACCCCAQIEEvAKtwzIIIIAAAgjsRoBDCCBQygJmpt/s+fye6c/gGeppf+dgb8c3qh+++35f7Bci8lnX36kiL3d9L3Fj3fc0BMTEZjmGI11/h5p92sz76Uhs5N9uk7B/oKfz9O+t7jz8hi937cUrgJwQDQEEEEAAAQQQKBsBCkEAgUIIsOFTCGXWQAABBBBAAAEEykhgfW/XAUO9Xe8d6u38whSpWqeW+pWJXuueyX+fK3Nv12kIZCegsoeInKpiX0969qudI/73HptV2zfY29m4trf95YlEgv9vcUA0BBBAAAEEEEAAAQQQQGA8Af7HaTwdzkVCgCQQQAABBBBAoKgCuiGRiKffcmugt71hsKf9pynz7zXzv+2yOk9FXufuZ7pOQyAQAROZ7gKdoCofErM1numfjplde/dgT8cnrulbuV9fX18VG0BOiIYAAgiUoQAlIYAAAggggEB+Amz45OfHbAQQQAABBBAojACrFFhg6Irl0wbWdL7FPcmeeGx27bqR+OjDavo/InqicEOgwAJuE+gAt+SnYqnU/bNTW39x9Oxpqwa7O89Yf3nHS9xxt+/ovtIQQAABBBBAAAEEEECgHASoIQ8BNnzywGMqAggggAACCCBQbgJDvZ3HDHa3f9Hf6f1TfX+dq+8T7tn0k0Ws1j2mIVB0Affn8Vj357FZ1L6ciskvBns6frW2t/3s/q6uyUVPjgQKIMASCCCAAAIIIIAAAgggMJYAGz5jyXAcAQRKT4CMEUAAAQSyFdChL122z/rurrcP9bZ/erCn8zYz+62onq2qs0R0inBDILoCVS619Gf/HOuZfrF6kv/IYE/HuoHu9rMGejqOvfGq9qnuPA0BBBBAAAEEylGAmhBAAAEEdivAhs9uWTiIAAIIIIAAAgiUr0B/f39sYFXX8QO9HSttdHSDL/5aM/24iL20HKqmhooVmOQqn+s2LL/o/ifn2p3bvJsHuzs/uu5L7Ye64zQEEEAAAQQQQAABBBBAoOwF3P8LlX2NzyyQxwgggAACCCCAQEUKrO9LTBnqWX7EUE/HudUP332Lxv1b1eR8EX2pqfBKCOFWLgIq4pnIviZ2gqh9JjWqfx/s6bhpqKdz3kDfihduuDKR3hgql3KpAwEExhbgDAIIIIAAAgggUHECbPhU3CWnYAQQQAABEQwQqByBocsu22eot31xKlXbbxL7gXsivMdV/1rXaQhUhICKpN/67a0ido2mvJu37Kj95lBPxwfWrl69d0UAUCQCCCCAAAIIIFDRAhSPQGUJeJVVLtUigAACCCCAAALlLWAmelV7+9R1l7cfOtjTudqqk/8208td1e90/QDX3fPf7isNgQoTMJG4K/kQd7/A9a963s77Brs7v3BN38r90n9n3Dn+bjgEGgIIIIAAAggggAACCJSugFe6qZM5AuEKEB0BBBBAAIFSE1i3uuvIoZ4VS6fX6pAf0z+KWHOp1UC+CBRQoEbUWmKp1B3Tpuq6oe6OtsG+rv+yRIL/RyrgRWApBBBAIAoC5IAAAggggEC5CPA/M+VyJakDAQQQQAABBMIQKImY6/ouO3iwp+M75vm/FvVWiMlbXOK1rtMQQGBigRoVebOpXGop/zdDs6auH1rTddzE0xiBAAIIIIAAAggggAACZSRQFqWw4VMWl5EiEEAAAQQQQCBTgV2bI92d7xl0/dqersMynRelcWam16xafuBAd+cH3UbPkJ9K3unye4+JTHL37rlr95WGAALZCqj7y1MlqqeY7//S/d362cDq9gvWruk8ilf9ZEtZjuOpCQEEEEAAAQQQQACB6Auw4RP9a0SGCCAQdQHyQwCBkhD43pXd+w51d3RYMvl1NXtgZFjXvatpyb9KIvlnJHndV1bNGuzpbI/FYreo2JfcqXmuu+ep3VcaAggEJRBzgV6rnq70fPv+utm169wm8Wv7+/vTx90pGgIIIIAAAghUpABFI4AAAhEXYMMn4heI9BBAAAEEEEAgd4GBlSv3WNfTecJAT3vP6I4dfzCVqV5cFtYtbr2lYcmSHblHLuzMoeXLp13Ts/yEwd7OLwzvHPmXqiwVlUNFJV7YTFhtPAHOla3AbBN5p6r9uPrhu29a29N5qtv8Oahsq6UwBBBAAAEEEEAAAQQQKFkBNnwKc+lYBQEEEEAAAQQKKLDhyisnDfR2vF9r/LW+2vdU9FhPvIaRmdvOn9vY+nABU8lrqetWraoZ6F2x0KbFro5Z7Hoxa1ERPpsnL1UmI5CbgNv0SW+wzvHEvilq17sN2DUDvSsPyS0asxBAoIwFKA0BBBBAAAEEECiaABs+RaNnYQQQQACByhOg4jAFEomEt7a3ffZgT/t/b96x6fdqcpWIHW3ifb06Wf2GeU1LftzQkBgJM4cgYqc/n2ft6tV7r+ttf/NIfORnat53Xdx3iMoewg0BBKIgUOWSONJtwDZ6lvrbYHdH7+CqjpelN5rdcRoCCCCAAAIIIIAAAiICAgLFEWDDpzjurIoAAggggAACAQp8d82KFx89u/aTMdPvi+g3ReQIFf2xL978+YuWXHBKS8uwOxb5NnDlyj0GezqXqLfzet/0Bpfwsa7TEEAgogImUuM2Y8+VuPzssR2bvjnQ295wVXv71AnTZQACCCCAAAIIIIAAAgggEIIAGz4hoBISgXwEmIsAAgggkJlA+hU9/d3dtYM97ZfGfe9vbtYn3JOvR6nIThX9SF3T0jctaFryY3c86k37+vqqBtZ0nKY7UnepSoeKvMolnX4VgbujIYBACQjs4f7eLlDT/5k+VX+5tq/jdem/1yWQNykigAACCBRRgKURQAABBBAIWoANn6BFiYcAAggggAACoQsMdne+9uh9ajuq9fG/iOgyEUn/TpMyse/75tfN27h1uTsW+da/atWsge725tmprT9TX77lEp7uerrREUCgdAVe7vn6o32SW3882NvZ2N+9Yt/SLYXMEUAAAQQQQAABBBBAIGSBQMOnnxwJNCDBEEAAAQQQQACBsATWXXbZwYM9HetE7UYxuUBED5YnbyaSGLUpC+c3X/R9TST8Jw9H8q6/v796oLdzUXV85DZVXalPvKInkrmSFAII5CBgFhOV14hZd7V6v1i7uvNDOURhCgIiAgICCCCAAAIIIIAAApkLsOGTuRUjEUAAgWgJkA0CFSJgZjqwavnxA90dl/nVyT+7sue6Xuu6impKVW5Jib5mflPrZxqam7e545Ft37rss/sM9rSfWf3w3b9Usx6X6EzX467TEECgPAVirqxDPM+ucJvVtw/2drb0d3/+Rem3pHTHaQgggAACCCCAQGYCjEIAAQQyFGDDJ0MohiGAAAIIIIBA4QXWr1nx4nVrugY0HlvvedriMpjm+q6mIjvF7BOeJwsXNi395a6DEf3Sn0hUD/S0nz6luuZ6Ea/PpXmM6zQEAhEgSMkIvFBMuqq16vpjZtd+qmSyJlEEEEAAAQQQQAABBBAoGQE2fErm1h6bQgAAEABJREFUUuWUKJMQQAABBBAoOYENiUT82p6uw4bWdF6S8r2fm1mdK2K2u1d3v6uZyB9MbG59U+vn5ja2PrzrYAS/bOjurh1a03Vc9ezaG1T0Kpei2+ixKndPi4aA+6Mk21Rki0vnEdfvE5V7d3WR29z3z+3pjcV8+rPjmfxt11rpNc3ud3+mN6dzSXe3Nq0sBSz9ip8XuT94Hxvq6fznYHfne9b2ts8uy1IpCgEECi3AeggggAACCCCAgLDhwx8CBBBAAAEEyl6gdArs/3LXXo/tU9uREv8m8+1zLvP0W565uyeaeyJ8u5isjMWS8+qb2m5+4mg0vw72tb96i+74ivmpH7sM57ju0ndfaYUTUHlA1W3cqPzAbaZco6KXuY3D/+ceX+irnWZq7/V9WaBq81X9eZLyTvbFnuhqc9yYZ/X6ptbX5NOfG69K/DlPrefyPDkmsTrdlYvN99VOS3e3MdCyK2eTHpf3NW6D6Aci9ldXy0OFg2SlMATc9TxMPLtKTa8d7O64cH1fYkoY6xATAQQQQAABBBBAoJIEqLXSBbxKB6B+BBBAAAEEECiugHtCW/u7E7WDPR0frh7x71ST892xw56Zlbpnwd1Gz2PuCfAP1Te3LpnXePHdzzwflcfuiXlXy4p9B3o7L5eU/tLVcaqI8iSuBHbz3YbHiIuW/qymx9x9+tVdd7n7QRXrFfPbRLy3xbyqw93GjNYvat2/blHrke7+rfOb2t5d17T0wvnNbZ9wjy9bsKjtO/MXtfUvWNx607xFbT+sW3TRz+rPW/Ind/zPT/aN7v5Z3a2TV3tuvHc2X/Rvd2zXenVNbX+c17Tkx/NcLunujn8n3ec3tV6+K+fm1ub5roZ0LfVNbS9ztcyuW7TU8309QkxPTNfu/u50qsj1InqniDwsJmmjbaqyU0R812lREzCpVpFXuT/XXanU1J8N9La/acOVV04KLU0CI4AAAggggAACCCCAQFkLsOFT1peX4hDIXICRCCCAQDEE+vsT1et6OhqrdOp1bv0vuf70Z/S4x081t49i31VNnZB+gv6pg1G771/1uVlD3Z2XVKt3s5otjlp+JZePu+DuifD7XN7pV3J9x923m9hS94fhLN/k5FhMXuP6S+ubWg9xfb7bMGmqb76oo75pyc1zzz3//9z4sm/qNkIXLF76j/rmpT9P117X3Npa19R6Sn3T0kPjMuVwR3iCZ3Ky2+p5n6he6P5cfkrM0p8h9SMR+7sDGnadFhkBPdpt2l2/ecem/xlc03nKdatW1UQmNRJBAAEEECgrAYpBAAEEEChfATZ8yvfaUhkCCCCAAAKRFhjs6Xp99aba20ykW0VfP0ayO0Rl6cjMg0+ra1qWfoJ6jGHFPby2r+N1NfHqX4onn3GZHOl6qbZi5r1NRX4pph/zfat/dNLW2uGZBx82Y+O2k931P71u0dJl85vaLnP9GwuaW386t7H1b66nX+FTzJwju/a7mpoeTf+dmees3EbQ2vpFS1fVNbd96vcPbW9ypm8b2bj9FSM7vT3N/GPchtDZZvIV93ftn5EtqGIS0/Sre+apb0MjsdFv91966YyKKZ1CEUAAAQQQQAABBBBAIG+BLDZ88l6LAAgggAACCCBQ4QIbNmyID/R2HT/Y0/EVEf97YvJCRzLW7yM/d09G19cval3Z0NCQcuMi1wZ6Oo4d6O78speSH7uNq/Tb0Lk9i8ilGaWEtrpk/ihm6Vd0XameXKBi71JJvaS+qXVaXfozcpqXfnbB4rahM89M7HTXfWROIpF09ylVdcTCLT8BSyQS/i7TRGKkYcmSHfObL/p9/eLWL89vbj3L/V17kdsE2lvieqKIvU9El7v+Lff39BZRu1dEkq7TCiBgInFnPr96Wvw+99/Lzw70rjykAMuyBALPEOAhAggggAACCCCAQCkKeKWYNDkjgAACCBRRgKURyFGgv7u7dvNtv1mh5q93Ic50fXdv3yaaflLZdJXvT5pX39R2kxsXuZb+zKGBnvbPuVxvcPsQH3IJ8juVQxij/a+7qCvdpsGpFvOP8dXeNnmaNIzMvPXsunNbv1DX1Pa99CtRxpjL4QILuE2gR+rPWfpz93fvW/VNSy8+MFb7QRuJ1YnvvdbMf5XbeDvLxL7m/uzfV+DUKnM5lalu8+dildRPBrtXtKbfBrMyIagaAQQQQAABBIoiwKIIIFByAjw5UXKXjIQRQAABBBAoLYH+vktnrOvuOK1ad/zJPfF/oct+tutjNLtbRJeNzDqobcHixZvck8vuuU6JzK2/q2vy4Kr2t1Zp7Q9V9BKX2EzX1fWKbyr6kOt/cf0GEV2uYu/y/ZGZ9U2tr65f1Lqkvrn1u/MbL/rngkVtG99xRtv2hoarU8It8gLHNTaOzr/wwsfqm5feM7/5ot/XLVr6lflNbR+sa2o9UGtqDvBNFqrKClfIj1y/zfVHXY/U31uXT0k3FfHchumBol579abam9au7njbVe3tU0u6KJJHAAEEEEAAAQQQQACBUATY8AmFteKDAoAAAggggIAkEglvbW/7m6uT8et9kSscyfhvSWRyi6pXX9e0tKuhoWHEjY9U61+1albNpNQXJa5rVeRVkUquWMmY/MMtvcYXbfDFTjaTk4dnHlSXfmVIXVPb9xYs/sgmd55WpgJ1Z513/4Lm1rV1i1qXVSerTxLTk8S3k939aa7kbhH9q3ALVsDkDZ4na6dPla8Nrul4WbDBiYYAAgjkJMAkBBBAAAEEEIiQABs+EboYpIIAAggggEA5CKQ3evq7V+x71KzaFZ7pDaLyGtcnj1Wb2zzZrirfnDFl73fULVr6u7HGFev4hisTkwa7V7ynOj58p4me7vLY7VvRuePl3ExFt5jJvSL6fV/tfNPYofXNrUfUN7UuWtC09Or5Ta2/Sb8KJIqbdcItdIFTWlqG09e/fnHbre7+f9yfi8Vu4+9lqarqg9wfnjNU5GoTucslkn4FUNLd03IXqBXRhWrym4GejvPWrv7c3sINAQQQQAABBBBAAIGiCrB4VATY8InKlSAPBBBAAAEEykBgw5VXTnrFPlMXV6v3A7eJs9SVVOX6eG2TmTb97sFtZ8w588yd4w0s9DlziQ2ubn/1YztqvymqXxHRKVJ5t43OoV9MLzLxF8bi8RNHZh50yoJFbavmL7rwzsrjoOJsBRae3XLv/EWtX69ram0wteNVY3NVtdHF6Xb9L2LC5o+DyKWZySS3kbbS86qvHejuOC3Sn++TS4HMQQABBBBAAAEEEEAAgawF2PDJmowJCCAQpACxEECgPATcpoCuXd15+JYdm37vmX7BVTX+Ww2pmnui9/ZUVfXR9c1Lr0okEr6bE5nW398fG+rrer94erN7QnWBVMBmj7pr4mpNP/m+2dV7jYi9bWTmwQfNb257j7tGHfVNbTfPa7zg7oaGBj57R7jlIuA2CjfWLbrwZ3WLln6lvql1sesvT40MHyy+/1EX758mMup6pP5b4PKKeou5BE9QlW9Vb6r9yrU9PXu6791fZfeVhgACCCCAQMQESAcBBBBAIHwBNnzCN2YFBBBAAAEEylpgoPfzh6xb0/UJz7OfuSdrj5ioWDdmVMy+qpNSb0z/6/+Jxhf6/Lovdryq6uG7+8W3r7m1a10v76bysNt9+6HbgLs0KVY/qdo7rL5p6bvr3QaP29wp1Gcplbcx1Y0psPDCjz5Qv/iiz7nNxSNMq16pYh8WlR434X9d3+E6LVMBk/clZcdvB3vbzxu6YnklvvVkplKMQwABBBBAAAEEEECgbAVKYMOnbO0pDAEEEEAAgZIXWLu6/TVqVTea2SdcMTNdn6ht9nw9tzpZvajurGX3TzS4kOf7E4nqgZ7OCywpN6vq/EKuXYy1TOUPKrJoRLyjt26Xeb/buPVjC5vavnfSh5c8Uox8WLOyBdzmYmrBovP/7DYarxzZ++AWrUm9VSV+jKolnMw/XKdlJGCHiK+dNhzbsHZN51EZTWEQApESIBkEEEAAAQQQQACBfATY8MlHj7kIIIAAAoUTYKVICQx1d71ooKe9x/P05y6xw12f+HcKlT95nveBeQ9v/eopLS3Dbk5k2ndXX3pk9ezaL6vYChOZLua2QyKTXUCJqD7gNniuF9M2z/de/ocHtx1X19S6pmHRkvvOaGvbHrW31QuoasKUoEB688dtCG+ta7rg73WL2j71YGzay92f2xNd/5gr52b35/g+d89bvzmE3Ta3U+aOH+v59sOhnva2ocuX7+++d2zuKw0BBBBAAAEEECgFAXJEAIGcBSZ+cibn0ExEAAEEEEAAgXIT2JBIxNd2d7zPV/9GEW2UDG/umcZrTWLz5p27ZEgT0fm8HkskvKHezg/FvarrXCnvd73K9fJqKj9S03N833vLpFo7Nf15PPMWL/mL2+BJf16PcEMg6gKNjY2j7s/tz13/7LZk9UKR1FvcnuxZLu+bTWTU3dN2L7CXibfcYrF1Q2s6Xr/7IRxFAAEEEEAAAQQQQACBchJgw6ecria1IIAAAgggEJKA2xzwBvpWvHDz7GlXeKpfcxs4h7k+4e8R7snYbS6lr0tN6r/nL7rwTvc4Es3lpUNXXL7/4Oxp7b7ZGhE7OBKJBZGEylYR/YuY9Pi+HlG/qHVOXfPSLy1ovvCv7zijbbtwQ6CEBU5vadlS17Ts7/Obl361vqn1bbEqO0JMP6aiv1SRf7u/234JlxdC6rterXis+fLjwe72z3yve8W+ISxCSAQQQKAYAqyJAAIIIIAAArsRmPCJmt3M4RACCCCAAAIIVJBAerPnmNm152jKu8ltjJzheizD8je7zaHzD4xNOyv99kwZzglg2MQh1ve2z/GHhwdVbIl7krhcXtVzl4h2iNmCWMzeVN/c2rxg8VI++0S4lbPAvLPb7ki/8mdSrf9Wt9PzLlfrBaL6A3dPe46Aqi4b9WJDa3s73+X+ux5/zmm+RQABBBBAAAEEEECgBAVI+bkCbPg8V4TvEUAAAQQQQGCXgJlpf/eKfY+aPbXfRHrdwUNdz6S54fKAe3JxTt2ipV85rrExMm+5dN2qVTWD3R0X+qY/cBs9r8qkmOiOUROT7a6OX0nKe9/ITu+l9U1L2+qb2m6e29j6cHTzJjMEghdIv3ptflPrb1y/vH7R0remktUHub8bX1TRh9xqw65XfHP/YY67DeHjPbNrjt5nauKq9vapZY9CgQgggAACCCCAAAIIVJgAGz4VdsEpFwEEnhDgKwIIjC/Qn0hUD/WuPK3a877vnjBdOP7o557VG1XsJLfZ87vnninm9/09y48YrRq5UtQuLWYegayt8idR+Zyv/jurktWvrz9vybcalizZEUhsgiBQBgILW1rurWtqbdwmI0e4/4a930y+4jZI7yiD0oIooVpMPzp9qg4OdXfOcRtBGkRQYiCAAAIIIBBVAfJCAAEEKkmADZ9KutrUigACCCCAQAYCQ1csn1azT+3XRfyrxOS/MrzKBwIAABAASURBVJjynyEq35yxcevcuqa2P/7nYPEfDfV1zqmW2C/dk76niWi1lOhNVf/gi/emA71px9adu+TjC5ou+vEpLS28eiH368nMMhd4X9Mlj9Y1Lb26/qFtZ0+eZv9l6p/pdjduL/OyMy3vrab2/aHejgsyncA4BBBAAAEEEEAAAQQQiLYAGz5jXh9OIIAAAgggUFkCv+7rq1rX03GyPxy72W2MNLjqM/2sHjdURszsEyM7vLPnJBLJ9IEo9Jv6Lp0x2NvZYinrd/ns4XrpNZW/iVmf5zZ6hvc+6PgFTUt+nH6bPLf5Y6VXDBkjUBwBTST8d5zRtn3+oou+Ojxz25Fq3skq8kUx+VuF/12KO4OuwZ6Ooe/2tL+iOFeHVRGIggA5IIAAAggggAAC5SHAhk95XEeqQAABBBAIS6CC4t7rb/ukiX7HPQl6fDZlq9lD6sm79njZ9s9H6W3F+t1mz/ZU7Aq3EbXS1TPT9VJr97mEz07tHH7zgfHp581zGz0NDQ0j7hgNAQTyEGhoSIzUNS+5YfrGbc1V4s9Jpfz57r97v3Ihfdcrtc2Nm35/bXfn2RsSiXilIlA3AggggAACCFS4AOUjUAYCbPiUwUWkBAQQQAABBHIVcJshOtTT/orB3s5bxOyjJjY9y1i3i3jvqTu39aY5c6Lxyp70k5UDvV3HV6fiPxLRhSpSSr/vbBKxm911eH99U+uBrn954YUffSD9ih7hhgACgQrMSSSS72y+6N8LFrcN/Ts27UQz/2RRvcZE7trdQmV+TEVlH09t9eZZtSv6ez9zQJnXS3kIIIAAAggggAACCJSlQCk9AVKWF4CiykKAIhBAAIGSFXAbPWeb6JDb7Hl9DkV8z7fUvLrmpRtymBvalM2zpvy3mv9dt8DRrpdOU+nxfZurNf6C+U1t3yidxMkUgdIXaGxsHJ3ffNH3H/RqTzNLnSyii0Xk765XWqt2Gz8XVvs1g+t6Vryx0oqnXgQQQCADAYYggAACCCAQaQE2fCJ9eUgOAQQQQACBcATWrv7c3kM97T0q0udWOMT1bJrv5l2rVfGzFjQv+2s2E8McO7R8+bTBno5PiXpfc+sc5HqBW9bLpUT1QWf5RRuO7Vm/qLV5weK2X9SdtWxr1pGYgAACgQikN37S/12rb1raPWPy3m7T2D7kAv9eTLa7+8ppqseZeDcM9LSfflV7+9TKKZxKEUAAAQQQQAABBBDIRCC6Y9jwie61ITMEEEAAAQRCERjqXXGiF6tea6KN2S+gj7s5lw7HkqfXnX3Bg+5xJNo1q5YfaNNiX3LJXOJ6KbR/msoy81MnDc88uGn+hRc+VgpJkyMClSQw58wzd9Y3tV05Eku+ScxvELGrTGRbpRi4Wiep6NdmTJWetatX710pdQdSJ0EQQAABBBBAAAEEECiSABs+RYJnWQQQqEwBqkagmAKJRMIb6u5YYOZdLyZvcLlk+XuApkT87pGZB3+iofHizW5+JNpQz/Ij4vHY71wy73G9yvWINjXn/pjrl9Q3tb5o/qLWzvnNF/2+oaHBuUY0ZdJCAAFJ//eufvFF19U3tX2g2ia/WESvEbH05rdUwM0z0TM8b+cda9d0HmUiKtwQQAABBBBAICMBBiGAAALFEMjyiZ5ipMiaCCCAAAIIIJCvQPoVMEfPmrrSVL7jYk1zPdv2bzP5sHvC86IobVAMdne8WzQ26J6EnJltQYUcr6J/cX6f9KrtlfXNrZcWcm3WiqQASZWowDubm//9+41bG8zsRPOty5Vxu+uV0KZ5vl030NPR2J9IVFdCwdSIAAIIIIAAAggggEApCrDhE7mrRkIIIIAAAggEK5B+K55YPHa1qJ7nIufwChgdVdP/rm9akv5sHBei+K2/vz+2tre9RVS+7jZSXlL8jHafgYo8auadNyU2emJ989LPzDu77Y7dj+QoAgiUikAikfDnN1/0+/qHt7fFZfT49N/x9N/1Usk/jzz391S+UD27dk1/36Uz8ojDVAQQeFqABwgggAACCCCAQLACbPgE60k0BBBAAAEEghEIIMqv+/qqBnvb58diO//mwp3guntO0n3NtKm6vRT5s4i+pa556QZ130sEbkNXLJ9WvfHuZTHTz7l0JrketWYi+lcV/bykUi+f37xk9dsaL96sIu64cEMAgTIR0ETCf1fTJY+m/46n/65r+u+8yG2uvPJ9m0aT9Kt7PlCdrPrO4OVd/+VqpSGAAAIIIIAAAgjkK8B8BAIUYMMnQExCIYAAAgggECWBe5JbPy++fsXt2uT0dmdq8s+Yn3xvfdOSn0Slruu+smqWDce/JJ5+2kSmRiWv/+Shj7ttss94Kf+ddU1LP1J33rL7/3OORwggUK4C6b/r6b/zYnqSmV3g6nzY9UBaBIN4onaSxPx1g93tcyOYHykhgAACCCCAAAIIIFCxAl7FVk7hCJS+ABUggAACuxUYunz5/oM9HQOqslRU9pDsbykx+UHVpKrXzlt88V+ynx7OjGv6Vu43unNkjYi9x/VYOKvkHPVhE/uGppIvrmtu+8S883jrtpwlmYhACQvUNy+9Z35z2+oR23Zo+hU/KvIv15MlXNJ4qR/iNt+/OdjdecaG7u7a8QZyDgEEEEAgbwECIIAAAgggkJEAGz4ZMTEIAQQQQACB0hBY193xKonFBl22da7n2m6Oed4HTvlQy0O5Bgh63lBv5zGxVGrQRBYEHTvPeEm3sdbve7F59yRrPlxXlFf05FkB0xFAIHCBhubEtvQrfmLivc0Xa3Ob7/cGvkgUAppME7Uvb9Ednem324xCSuSAAAIIIIAAAggggED5CkxcmTfxEEYggAACCCCAQNQFzEzX9XSc7Kt8322KvMrlq65n25JidlUsNm3B3EVL7st2chjj03UNXbb8CHf/HRf/eNej0tL/Yv/vvto76ha1vmfBuRf+oqWlZTgqyZEHAghEQ+BdTUv+Nb+p7bL6Ra0HuYzWuP6o6+4/0+5r+bQqV9A5Mhz7n2tWrtyvfMoqwUpIGQEEEEAAAQQQQKDiBdjwqfg/AgAggEAlCFBjeQt8Y1Vi+rqeziVus+cbrtJc3sLNTXPN7IoR2d48t7Hxcfdd0Zvb5NGh7vaT/Sov/RlChxc9oacTsL+Lyfkj1d5rFyxq++HTh3mAAAIIjCMwsuHWxcmkvkVEO0UkvfHj7sqnuU2fk+OT/Gvdz6MTyqcqKkEAAQQQQKD0BMgYAQQqW4ANn8q+/lSPAAIIIFDiAv2JRPW0eG27qawQk71yLcdMvj0y6wXN6bchyjVG0PMGeztPEs/7pqrOCjp2HvEut+H4CfXNrT0NH17ySB5xmIpAMQRYs4gCDVdfnXp3y9Lf1S1aclFMvf9y/92+qYjphLK026h/pS92w1BP57xQFiAoAggggAACCCCAAAIIjCvAhs+4PJV0kloRQAABBEpN4LurLz2yZlbt103kHJd7rj/TR9wTdJ/4w0PbTm9oaEi5OEVvv+7rqxro7vygK2itSyb3Vyy5yQE19/ylrPdT9pb6ptaW+Rde+FhAcQmDAAIVKOA2sS39tpl/eHDbKSpa5zbrf+AYyuktIWeY2DcGutsXu7poCCAQSQGSQgABBBBAAIFyFXDPpZRradSFAAIIIIBA+QqsW911ZNyLf8tUGvKp0kwuqknVrEgkEv6uOBH4cp+/ZaGKfcFEJkUgnTvdE7LzR2Tbfy84j7dvi8D1IAUEykbA/Xc3Wde0dN3I1uRC8e00V1gkPjvN5RFEm+Y2tlYM9HZddt2qVTVBBCQGAggggAACCCCAQMAChCtLATZ8yvKyUhQCCCCAQLkK9PX1VQ11d87xNfV9V+MrXM+x6eNus2fZ/ObWL5zS0hKJf1l+Y3v71MHejgvF9EpRmZ5jYQFNs00q8rVUMvX69BOyUXqru4AKJAwCCEREoOHiizfXL24biG3cdriIdrj//t0rEbgFkMJkNb9lJDb6hbWrP7d3APEIgQACCCCAAAIIIIAAAhMIsOEzARCnEUDgeQIcQACBIgrsk9x2mq/2XVHdP680TD45OuxdnleMgCfvmBpbKiafj8Are27VmHfq9I3bPrywZVm5PPEa8NUiHAIIBC0wN5F4/MFY7Ud8sZPdhvxX3H8Pk0GvUYR4KmpnqVd1zdBln92nCOuzJAIIIIBAfgLMRgABBBAoMQE2fErsgpEuAggggEBlCvR3dU0e6u443z1x9jUV2SsPhR2+6NL65qUdDUuW7MgjTmBTr7wyMWmgu+MiEf9TLmgx3/pnk1v/k/VNrSfUNS7dMCeRKIcnW11JYTXiIoBA0AKNjY2jCxa1/fkPD20728R/p9sA/5fro0GvU+B4cRV9o1XXrFu7uvPwAq/NcggggAACCCCAAAIIVJRAOBs+FUVIsQgggAACCIQr0N/fH6ua5C83lfb8V7JPJXdqb/5xgonw676+qj0en3qxqnw+mIg5RRl1G2nXxNQ7ZWTmwZ/NKQKTEEAAgQAFEomEP7/5ou+PxpKvjIm6DXF5JMDwxQp1vKr/7aHeFScWKwHWDUmAsAgggAACCCCAAAKREWDDJzKXgkQQQACB8hOgovwFhq5YPq3qobu/riLnuWhVrufUTMQ3s/Pqm9qWR+WVPe4JTe+e5PYWVf2kK6oov5M41+2ut9Sd23rq3EVL/rehoSHlcqEhgAACkRBoaLx487ympZdVJ6sPdQmtE9GS/m+U++/9K828waHelWz6CDcEEEAAAQTKS4BqEEAgGgJFeXIlGqWTBQIIIIAAAtEWGLrssn1sZ+zbqnJaPpmmN3vU5KMb49P78okT5Nz1fYkpx+wz7eOqfkeQcTOPZSOi8l1fU2+ua2pdo+qEMp/MSAQQyE6A0XkKnNLSsmVkp/deFf+DLtT/pv+77u5Ltc00P/X1ob6V73Qb//FSLYK8EUAAAQQQQAABBBCIogAbPlG8KhWVE8UigAACCOxO4JrVHS+w6uQP3KbEybs7n9Uxs/MfjE/rTH82RFbzQhyc8mtbfLOPhrjEmKFVZLuJnjdj0rb3z1+07H/HHMgJBBBAIEIC6Vdn1jW1fcP3J53i/jsWmbfmzIlI5VBLpb599Oyp789pPpMQQKBEBUgbAQQQQAABBMIWYMMnbGHiI4AAAgggkKXA2t72l8c9GXLTjnQ9n5/VO0Ts4vnNbaujstnTn0hUD3W3ny0mn3dPWP7nLepcoYVoZnKTSPy185tavzjnzMTOQqzJGggggECQAgsWL95U39S62BfvTSL6c9dNSvM2TUy71q3uaujv74+VZglkjQACCCCAAAIIIJC1ABNCFfBCjU5wBBBAAAEEEMhK4Jrujld5pv9joq/IauJuBvuiHxvZGVu1m1NFO1Q1s/Y9ptpe+ATsUVO/aXKN9966pgv+WPj1WREBBBAIVmBB05If++rPF5OLXOQtrpdeU9nD91JX1jx899mJRGLX/5uWXhFkjAACCCCAAAIIIIBAdAT4pTo614K8OMiRAAAQAElEQVRMEEBgfAHOIlD2Amsvb39zTO16V+jLREzdfW5NZcQ3uWRB09Ku9FsA5RYk2Fl9fX1VA5evWOh58kUXeYbrhWpu30tu81XeXX9u25qTPrzkkUItzDoIIIBA2AILFrVtrG9e2uGZvNWt9XPXR10vsaZTTOTSo/eZuvjKRGJSiSVPuggggAAC4QgQFQEEEEAgRwE2fHKEYxoCCCCAAAJBCgz2dL3ei+kVIrq35Hvz9WvT4tMi9fkO+yS3nKQx7yvuSb0CPplnI2LyhRHx3u6eFP2hqrrl88VlfvEFyAABBJ4rMK+59Ve+PzJPxT4qKqW4sT1DfO3ca/bUT/R3dU1+bn18jwACCCCAAAIIIIAAApkJlNeGT2Y1MwoBBBBAAIHICLgdCF3b0/VGEfuBS+oQ1/NpSTG7qr556Tlva2zcnE+goOaamX738o6XqKdfcjGnux5+e2JjZ7Pve4vqm1uXNCxacl/4i7ICAgggUFyBBYs/sqmuqa1d1XuHiN4pIinXS6epxE20rWay37QhkYiXTuJkWjQBFkYAAQQQQAABBBB4ngAbPs8j4QACCCCAQKkLlFL+g73tp3riX+E2fKryzVtFB3SSvzjfOEHOH+ruOD7m2S1msk+QcceNZXKTmf+mBYuXfmXccZxEAAEEylCg7twlv/b9muPEpF1FdpZYiXH38+Lzj82u/eT6vr4pJZY76SKAAAIIIIBAEQRYEgEEni3Ahs+zPfgOAQQQQACBggkM9HSco6bfcgu+0PV825+lJnlW3VnLtuYbKKj53+tesa94+hVVnRVUzInjWPuMjVvfOb/5ot9PPJYRCCBQ5gIVW96CxYs3/f6hbR/VuHecQ0i/2sfdlUyrcv+TenEqueXCksmYRBFAAAEEEEAAAQQQiIiA+106IpmQBgIFFWAxBBBAoLgCg92dZ6jY51wWMddzbm4zxVTkh1qz52ujtNlzzarlB46qXukKe5nroTcTuUtMPzDjpds/MieRSIa+IAsggAACERdIJBL+vHOW/GXERt/mUv26iJXMq31MJG6qnxzsbv8or/RxV4+GAAJ5CjAdAQQQQACByhHwKqdUKkUAAQQQQCAaAkO9nYtEpVtE95Y8b+bbfSKpprqzzorMK3v6+y6dEYt5fSJ6khTm9iPflzfWNS35+pw5WW72FCY/VkEAAQSKJtDQfMnt1cnqs028s93PnkeKlkiWC6tIlaomksmti83MfZtlAIYjgAACCCCAAAIIIPBMgQp57FVInZSJAAIIIIBAJATW9nSe6p64+ryI1QaQ0D0pk9fVNS37ewCxAgmxIZGIV6diHxPVdwQScPwgO0T0W77aexYubr3LPTFowg0BBBBA4HkCp7S0DM9vWvoNSXpvUpOfugGjrke+uf+ox1XlkqGezoX9/f15vSJ2omI5jwACCCCAAAIIIIBAOQh45VAENSCAAAIhChAagcAE1q7qeqNn/mUu4AzX820PeGofTG905BsoqPl9fX1Vm2dNTYhoi4iE/cTcZjG7cMbGrR9YsKhto1uPhgACCCAwgUD9eUv+5MVlvqh0TjA0Sqf3cPleWbPxnnP6Tz017J8tUaqbXBBAAAEECi/AiggggEDJC7DhU/KXkAIQQAABBEpB4Jruzjlelb9eVPfPP1/dpqr/b96ith/mHyu4CPvY1jrxdm32VAcX9TmRVM0dud8Tr66+ua1vToK3cHMetIIIsAgC5SEwt7H14fpFrZeIbwtcRfe7XgqtVjy7tOoNJ9SXQrLkiAACCCCAAAIIIIBAsQTY8AlCnhgIIIAAAgiMIzDY0/V6T+3LYjJtnGEZntLHRezCukVLezOcUJBhg6vbXy2+XBZMjTLmzXy7WSX15nlNS3485iBOIIAAAghMKFDX3DrodtDnmclNEw6OwACX63SN2RWDazpPiUA6pFDJAtSOAAIIIIAAAghEWIANnwhfHFJDAAEEECgtgd1lO7hqxetF/FtU5LDdnc/6mPk9IzMPvjLreSFOGOzuPEg8vcUtcYDrYTXfbSZ9c35z69uj9JlFYRVLXAQQQCBsAVW1+U2tv0n/d9VEu0S0FD7XZ4b49rWh3pUnCjcEEEAAAQQQQKCIAiyNQFQF2PCJ6pUhLwQQQACBkhdY2738pRL3VgVViIl8La7JzzU0NKSCiplvnP6urr1E5csuTrXr4TSTHW6z56MjD237UDgLEBUBBBAIVKDkgsVjtR9XsfTnr91ZAsnPND/19bXdK19aArmSIgIIIIAAAggggAACBRVgw6eg3CyGAAIIIFApAtes7niBJ7Hvq+pRAdV8c02yuuVdTZc8GlC8QMJUTbIVIvbWQILtJoiKPGqenTLjoW0dDYnEyG6GcAgBBBBAIE+BuY2Nj89btLTPbfrUuVC3ux7tpnKop6kb2fSJ9mUiOwQQQAABBBBAAIHCC7DhU3hzVkQAAQQQKHOBdX2XHRz35GpROdDM3J5FfgWbyP9JKrnklJaWLflFCm52X19f1WBvx4XuycGzXNSwfp/4o/hSP39R24/mJBJJt075NCpBAAEEIiagqlbX1PZHHRl+nUttUEWG3X2U20Fu06dnfV/HzCgnSW4IIIAAAggggAACFS5Q4PLDeoKmwGWwHAIIIIAAAtEQuKq9faqfTH7FbdK8MqCMNnpi764/7+I/BRQvkDCz/S0nmsnHAgm2+yA3jowk59Ytbk1/NtDuR3AUAQQQQCBwgboLPvpgLDbtfe7n2OcCDx58wDekknLt2t722cGHLkxEVkEAAQQQQAABBBBAIEgBNnyC1CQWAgggEJwAkUpQ4LpVq6bPmKrfEZW3uPRjrufZdJv6dn76X1znGSjQ6evXfOHFanqViuwVaOBdwTQlYtdUJ6vf33DBxXfvOsQXBBBAAIGCCqTf4q2+qfXTnu/Vu//W/7ugi2e3mOd+5r46Zvr/+ru7a7ObymgEEEAAAQQiI0AiCCCAQGACXmCRCIQAAggggECFC4zERz7ji7wjKAYzWVHl1wwEFS+IOOl/RZ3yR3tcrINcD7ol3ROLK0Zs+wdPaWl5KOjgxEOgNAXIGoHiCcxbvGSdxuRUl8Ftrke5faBKdyyLcoLkhgACCCCAAAIIIIBAIQTY8CmEclhrEBcBBBBAIBICGxKJ+EB3+2KXzHluw6LK3efbfBX9xvzmpf/PbXxE5jMUzExjvqTrfGu+BT5vvklSfPvYvI1bP9bQnNj2vPMcQAABBBAohoDNa2z9qW5NnWAiP3TdL0YSE63p8qpRkY8N9HR8rP/UUwN4he1EK3IegSIIsCQCCCCAAAIIIJCBABs+GSAxBAEEEEAAgbEELJHwNs+s/aCqXjbWmByO3yKpZMb/UjmH+DlNGeztep+otzSnyeNPuk/FmmYceVynJhKRfDJx/PQ5iwACCJS3QN2yZVu9qvh/q0hvtCvVlpo5x58U7RzJDgEEEEAAAQQQyF2AmQhMJMCGz0RCnEcAAQQQQGAcgbX7zThaPP2CGxLUvyje5vvaWHfesvtdzMi0gZ6OY92mzOUmNiXgpHb4vjXXNbd9ac6cOcmAYxMOAQQQqCSBUGutO/uCB+s2bmtxmz4fdAuNuh655n5OzTLRbw71LD8icsmREAIIIIAAAggggAACBRBgw6cAyCyBQPEFyAABBMIQWL+m/TWxVOpaCWgTxEQecb1hweKl/wgj31xjru/rm+KeRPuMm7+H60G22/yYvH3B4rahIIMSCwEEEEAgHIH0qzCHZ277ttv0Odv97Hs0nFXyjjrDJD6wdnXn4XlHIgACCCBQkgIkjQACCCBQyQJs+FTy1ad2BBBAAIGcBfovu/TglK89LsB+rgfS3BNoq/+wcdtNgQQLMEjK33aZqPe2AEOmQ93jNrfOWNDY+tP0N/QCCbAMAgggkKdAQ0Ni5Hcbt33d/cx6kwsVqX+g4PJ5stlLPPVXPvkNdwgggAACCCCAAAIIVIzA0xs+FVMxhSKAAAIIIJCnQH9X115VVfFLXZijXQ+qratOVn8ukUhE5m3NXC7eQG/H+8XsbNeDess6t88jt6p5b57f1PqboPCIgwACCCBQOAH388Gva2r7o/h2hlv1965HramonjLY07G6v7u7NmrJRSEfckAAAQQQQAABBBAoTwE2fMrzulIVAgggkKsA8yYQ6O9O1FZN8rtU5bQJhmZz+taRnd6Zp7S0DGczKeyxR+015VDPl48EuY6K/MxL2Wl1zUtuDzIusRBAAAEECi9Qv7jtVk2l3immN7jVfdej1hZVy47F/f39Qf2jhajVRz4IIIAAAgjkI8BcBBAoQwE2fMrwolISAggggEB4AtUy9X1u06IhsBVUHjG1ixuWLHkksJgBBOrv6posVbFOU3lJAOHSIUxE/zqsO98777y2O4QbAghEXID0EMhMoO68ZffbFC/9jyDSb0katU0fT1RaJ2+87/jMqmEUAggggAACCCCAAAKlLeCVdvpkXxQBFkUAAQQqVGBwTddcVf28K3+y60G0EfHtI6N7v+AnQQQLKkb6X0LX1NgyNasLJqaamFyTSibf3rDoY/cFE5MoCCCAAAJREZh/5oWP2eTYe91/7C9TkZ1RyevJPPZOean/uWb1ilc++T13CCCQjQBjEUAAAQQQQKCkBNjwKanLRbIIIIAAAsUSGOhecbSk/G+YyJ5B5OA2jlwo+VJ9c1tfQ0NDKoiYQcWIPXT3K01t0UTxMjuv5p78+/mMKXu/f2HLsnszm8MoBBBAAIFSE0hv+uyxcfsyEbvS5R61V/ocFPO8y9f3dcx0udEQQAABBBBAAAEEshRgeOkIsOFTOteKTBFAAAEEiiRwY3v7VNXYcvF0WmApmP3aNNYRWLyAAg1dsXxaXKXLhZvter7NbWT5354+ea+3zjnzzKj9i+98a2M+AggggMATAk9/nZNIJIc3br/Abfp8xEQi9ValIvpqP2Wf7k8kqoUbAggggAACCCCAAAJlKsCGT5leWMpCIBoCZIFAeQjsmCrfdk9evVUs/WKVYGpK+v658xddeFcw0YKLYiOxS92TdCcGEtHsByNbUk1z2OwJhJMgCCCAQCkINCQSI3Ubt7erJx+PVr4WM9Fz4rNrL45WXmSDAAIIlIsAdSCAAAIIREGADZ8oXAVyQAABBBCIpMCGDYn4YE/nMhGdKyKB/Mw0kR0iunjh4ot+K24XyfXItIHuFW83s/e5hNT1fNqomvSPDMfqGy6+eHM+gZhbJgKUgQACFSWgiYRff25rj6md5wq/3/WotFjM/QxO/7yLSkLkgQACCCCAAAIIIIBAkAKBPHmVT0LMRQABBBBAIKoCj/156uvcnkxrkPm5nZSbJtf6Xw0yZlCxPPU+7vr0fOO5GtenbKSpYckSt7mVbzTmI4AAAgiUqkD9orZu8fRsEd0mEbmZ2CxVryf9dq0RSami0qBYBBBAAAEEEEAAgXAF2PAJ15foCCCAAAKZCURu1Hd7ug7TmKY3ZmYGSukkHQAAEABJREFUmNxGL2UXvOOMtu0Bxsw71IZE+pVM7em3cnudWV5vW5d0yawf3umdvmDxRza5xzQEEEAAgQoWUBGrP3fpdSI6X1QflOjcXrhzqq5Lf25ddFIiEwQQQAABBCpGgEIRQCBEATZ8QsQlNAIIIIBAaQr0d3XtFTP/Mpf9C1wPppls8dVOm3de2x3BBAwuymOza98moi2S501Fb/b9SWfyyp48IZmOQEULUHw5CtQ3LbnZMzszSps+JvIGGY4vzvMfOpTj5aImBBBAAAEEEEAAgRIWYMOnhC9exaVOwQgggEABBNJP/FTX+B9QlZODW07d80pyxZ4Pbr8luJjBRLpu1arpInaJizbZ9dyapuvTOyWVPGvB4sW8sic3RWYhgAACZS0wr6n1ejE9XaLz9m5xE/vkut4vHC7cEEAgegJkhAACCCCAAAI5CbDhkxMbkxBAAAEEylVgXW/XXFH5hKsv7npAzf6RSqW65iQS6bc8CyhmMGFG4iOLVfS1OUdzmz1qtkFTyRPrzltWkA/mzjlXJiKAAAIIFFUg/UofNT3VJXGP61FoNSbJm9b3dbwkCsmQAwIIIIAAAggggMCzBfguewE2fLI3YwYCCCCAQJkKrF3debipdbvy9nA9qLZDzXvXwpZl9wYVMKg4Az0dx5rI/3PxYq7n1kzuklTq/Wz25MbHLAQQQKDSBOqal9xovp4ZQN1BhTgo5evn1vclpgQVkDgIIIAAAggggAACCBRLgA2fYsmzLgIIhChAaARyE4h58lExOSC32budNSpin3JPbt2+27NFPNjfd+kMFf2ciuTzu8BtmtJT2ewp4oVkaQQQQKD0BGz+4qU/MPPf4X5G3h2J9M1O8f1pH4hELiSBAAIIIJClAMMRQAABBJ4pkM+TPM+Mw2MEEEAAAQRKWmCgu+MiM/tvV4S6HlT7+3ZJfjGoYEHGqbaqOlF7Ux4x7zGRM+rOW/LrPGIwFYFwBYiOAAKRFahvartJVM9xCUbh7U5rzPyOwe7O3N/i1BVCQwABBBBAAAEEEECg2AIVu+FTbHjWRwABBBCIjsDQmo43uF2ez4pKPMCsHkuqnvG+pkseDTBmIKGu6fvsfpLyPy8m1bkENNGH3GbR+fObWn+Ty3zmIIAAAgggoKpWv6g1/fZuJ7mfwfcVX0SniGcdQ5ddtk/xcyGDoAWIhwACCCCAAAIIVIoAGz6VcqWpEwEEEEBgdwLS391d6/sS9GZPym2mfPrdi5b+breLFvHglVcmJsX9mnZR3T+nNEweNJUP1S9qG8hpPpMQQAABBBB4hkD67d18kbPdoUdcL24zeZVfPXp+cZNgdQQQQAABBBAISYCwCFSEABs+FXGZKRIBBBBAYHcC/f39sSrdsUxFXre78zkfU/mZbyNX5Tw/xIl77qx9o4m8K8clhlX1C8m9D7o+x/lMQwABBCIqQFrFFJjf1Op+rnjvcTlscb2YLa6il6zt7XyXmWkxE2FtBBBAAAEEEEAAAQRyEWDDJxc15lSWANUigEDZCkzadE+9qlwUZIHu2aGd6mtiweKPbAoyblCx1OwSMZmRdTyTpIp9fPrGre0NDQ2prOczAQEEEEAAgXEE6puW3Oy2WBa7IY+5XtQWM1l5bd+qFxU1CRZHAIHiCLAqAggggAACJS7Ahk+JX0DSRwABBBDITaC/t+sA3+xjkuPn2Ox2VVXzRTrqmpdu2O35Ih8c6F2xyETfmG0a6uoSld7pL92+ck4ikcx2frmMpw4EEEAAgXAF5i9q/bqaJES1qP+wwMRelLJkm3BDAAEEEEAAAQQQqEiBUi6aDZ9SvnrkjgACCCCQs0C1n/q4m3y068E1s1snV3srgwsYXKShnsuOUN/7ZC4RfV/WjVR7iTlz2OzJxY85CCCAAAKZC9Q1t37BxL/AzdjhevGa2QeHerveu5sEOIQAAggggAACCCCAQGQF2PCJ7KUhMQQQKD0BMi4VgbXdHe8T1Q8Hnq9J50kfXvJI4HHzDJj+HAKT5Fni6exsQ6nIT0eH9bSGCNaVbS2MRwABBBAoDYGDvOl9atJT5GyrzPwv9vcsP6LIebA8AggggEAkBUgKAQQQiKYAGz7RvC5khQACCCAQksBA34oXuh9+/8+Fj7keYLNr6ptbvxtgwMBCrf9yxyEu2Ackyw+gNpH/G/WT5zYsWVLcf2XtkqchUFICJIsAAnkJHNfYODo86+CPiMkakaK+vdu0aot9/LpVq2qEGwIIIIAAAggggAACJSDgnvMqgSzLKEVKQQABBBAoskBKl5rKC4LNwv7u+5Mbg40ZXDQ/6X3NRcvy1T32qJfU97x78cV/cXNpCCCAAAIIFFSgoaFhJBbftlTEvuUWNteL01QW7vSGTyrO4qxa6gLkjwACCCCAAAIIFFqADZ9Ci7MeAggggEDRBAZ7ul6vootUJMiff0kxXbVg8eJNWRRWqKE60NN+upi9PssFN7uazqlrWfq7LOcxHAEEEEAAgcAE5jYmHh/Z6V3gfib9JrCg2QeaFPP0m+u+dPmh2U9lBgIIIIAAAgggIBAgUFABr6CrsRgCCCCAAAJFEri2p+swFf+KwJc3+/NIjfedwOMGEPC6Vaumicn7sw2lop8embVtXbbzGI8AAgggkK0A4ycSaFiy5BFvNLbQjbvZ9aI0E5maGh3+/I1XtU8tSgIsigACCCCAAAIIIIBAhgJs+GQIxTAECi7AggggEJiAmWlKrdE9YfOiwIKmA6mMpETPafjwkkfS30atj8SSb1TVt2eRly+iV9U1Le1qaEiMCDcEEEAAAQQiIDDvggvuTvn+Mvdz/K5ipaOic7dvzfoVs8VKl3URQKDUBMgXAQQQQACBgATY8AkIkjAIIIAAAtEVGOxpP8rEPuQyVNeDar75cvnC5tZfBRUwyDg3fLlrL1G/I7uYdvN2GbkguzmMDluA+AgggAACIgsXX/Rbz/RM94P84eJ42BRPY139vV0HFGd9VkUAAQQQQAABBBAod4Eg6mPDJwhFYiCAAAIIRFagv6trsqfeNWIyM9gk7d54XL4cbMzgou0c9ttctMNdz6i5J9C2mCYb39d0yaMZTWAQAggggAACBRaoa166QTX2HhF7vMBLP7mcvbTa9z/z5DeFvmM9BBBAAAEEEEAAAQQmFGDDZ0IiBiCAAAJRFyC/sQT6+/tj1ZP9803ksLHG5HpcRb80t7H1b7nOD3PeusvbDxW1+Vms8e+kL3PnL7rkzizmMBQBBBBAAIGCC+zce/NPRfX/FXzhpxZUmTfY0/XWp77lHgEEEEAAgcIKsBoCCCAwvgAbPuP7cBYBBBBAoIQFarbesY9L/8OuB9pU5bZHJm/L8u3SAk1h3GCpuLxTRDP9vKIREfn4wsWtP3H3NAQQKGUBckegAgTSnzFXPVq90pX6OdcL3lR1T1VLFHxhFkQAAQQQQAABBBBAIAMBNnwyQCqHIdSAAAIIVJpA+tU9Nuy1i8kLg6xdRbb7KW0588zEziDjBhVr6LLL9lHTj7p4MdcnaJoSlW8dGJv2NTfQXKchgAACCCAQeYFTWlqGY7FtnxXRa9TtvkgBb2amrp+4tqdzSSKR4P+nC2jPUpkLMBIBBBBAAAEEKleAX1Ar99pTOQIIIFDWAlUb71qoog1BF+l2RX44Zbr/y6DjBhXPqpKXulj7ur679pxj9r0Rf/J5xzU2jj7nBN8igAACCCAQaYG5jYnHTb1WMftHMRL11D561OzaY4qxNmsigAACCCCAAAIZCDCkQgXY8KnQC0/ZCCCAQDkLrO/rmKkqbW5zJh5onSZJUel+xxlt2wONG1CwtWs6j3L5nZJhuH+KJ5c0NDdvy3A8wxBAAAEEykagPAqZv+jCO6Wm5s0qcl/BKzLZS0yaLMGrfApuz4IIIIAAAggggAACYwqw4TMmDScQqFABykagDAR8X08V1f8KvBSVr9cvar0x8LgBBfRMTnWhZro+URt2vwCcV39u620TDeQ8AggggAACURaoO+u8+81skctxs+sFbZ7Ku9fNrH1dQRdlMQQQQCBIAWIhgAACCJSdgHu+p+xqoiAEEEAAgQoWGFi5cg/3xE/6w5RrgmRQkX/7/khbkDGDjNXf3x8T2fWE10Q/281thp0/r6n1+iDXJ1b5CVARAgggUCoC9c1t603kcpevu3NfC9TcYtPFk/X93d21BVqSZRBAAAEEEEAAAQQQGFdgoieFdjeZYwgggAACCERSoL8/Ua01qXaX3GzXg2xmYl9Lzn7RY0EGDTJW9cN3r5b028tMFFTlmhFv9DsTDeM8AggggAACpSQwv6n14y7fK1z3XS9YS2/6VOuOljJ+a7eCWbIQAggggAACCCCAQP4CbPjkb0gEBBBAoEIFold2/KHa411WC1wPtqmMxmL61YaGhlSwgYOJNtRz2StcpA+6PlF7oHq0uqmh8eKCv+3NRIlxHgEEEEAAgXwFYo/LJW4D5jf5xslh/tlr95q8fw7zmIIAAggggECJCJAmAgiUigAbPqVypcgTAQQQQGBCAU9lsRu0l+uBNt/XT89tbP1boEEDCpZIpD8sOjnPhZvoLeweNvNPOaWl5SE3loYAAggEJ0AkBCIiMLe19WFNeWeJyr0FTumQWFXskgKvyXIIIIAAAggggAACCDxPgA2f55FwIEgBYiGAAAKFEhjsWfF6EasLej0T+fOkVFVH0HGDinfifpOmuVjvdV1dH6v57gf+ytFZv/rTWAM4jgACCCCAQDkI1J+35E+WtPe7Wgr9atYPr+1ecZJbl4ZAxQpQOAIIIIAAAggUX8A9/1P8JMgAAQQQQACBfARuvKp9qoj3dRGdJMHeUqr6pVNaWoaDDRtctMctfprblDpy/Ij6i3iyurOh4epivSXd+OlxFgEEEEAAgQAF9ti0/adqtirAkBOHMqn21Fu6obu7duLBjEAAAQQQQAABBMpWgMKKLMCGT5EvAMsjgAACCOQnYGa6Y6t+wEU5yPVgm8oDqZQNBRs0uGjfWLVquiv/ExNE/F31pKr5Ud60miB/TiOAAAIIlI1AYQqZk0gkZZLfLmYDhVnxiVVU5DWPejvf9MR3fEUAAQQQQAABBBBAoPACbPgU3pwVEUBgdwIcQyBHgesvv3yaqJzhpgf+M818/eLCxa13udiRbNNiI2e6J7P2GzM5k+0qmjjlQ3xuz5hGnEAAAQQQKEuBurOWbT0wPv09rrg/u16QZiJTPfNX9PX1VRVkQRZBAAEESlWAvBFAAAEEQhMI/Mmx0DIlMAIIIIAAArsRGI4Pz3OHj3M96Ha7Nyl5WdBBg4r3zZ7P72meLBgvnoqsGZ659YbxxnAOgagJkA8CCCAQlMBxjY2jatoiotukYDd96b62talgy7EQAggggAACCCCAAALPECilDZ9npM1DBBBAAAEERNb3dcz0RNPv0R8L2sNX/Xz6XwcHHTeoeFNS8aPE5IRx4t06/KNblzU0JEbGGcMpBEzoO0wAABAASURBVBBAAAEEylqgrnnpj8RsWSGLNF/a1q7uPLyQa5bhWpSEAAIIIIAAAgggkIOAl8McpiCAAAIIIFBEgSeW7u/vj6WSstRE9nziSHBfTeyvcS92c3ARg4+kcW12Uatd3127T1OpxQ1XX53a3UmOIYAAAgggUEECVt/c2qOiV7iaC/VzcV8v5p/q1qMhgAACCCCAQF4CTEYAgWwF2PDJVozxCCCAAAKREIhtvPtA9aRewrip9z9zzzn/njBCBxFzcE3Hy8RkzNrdJtjy4X0O/Z1wQwABBMpZgNoQyELAV+8zbvgdrheixdS884eWL59WiMVYAwEEEEAAAQQQQACBpwTY8HlKgvuyEqAYBBAofwHPk3lm8pIQKt0ci/tXqarbNwkhep4h069scpl9zIWJu/68piLr5je1Xt7Q0FCof8X8vBw4gAACCCCAQNQE5i+68E7f/PPcz8kthcjNxGbZtFiXJRL8P3chwFmjogUoHgEEEEAAAQT+I8Avn/+x4BECCCCAQIkI9H+5ay8R/biEcHNPBHXMO7utUP8COOsKvI3/eonb6HrdGBNv82P+kjHOVeJhakYAAQQQQOBpgQXNF93g+/7F7md98umD4T5437q9J78y3CWIjgACCCCAAAIIICAiIDwpwIbPkxDcIYAAAgiUhkAikfCqR9JP1tiswDM2uV9HklcFHjfAgDEvfqKI7i/PuZmI75l1zW+86J/POcW3CCCAAAIIVLjAf8ofrfK/5b67wfVCtMnmxc/p6+urKsRirIEAAggggAACCCCAABs+/BlAAIHKFqD6khM4dt8pL3RJn+p64E1Vr9+5/85/Bx442IBniVjsuSFVrH/TlO3ffO5xvkcAAQQQQACB/wg0NF682VLeR9yRB1wPv6ktnDW67dDwF2IFBBBAAIEJBRiAAAIIVIAAGz4VcJEpEQEEECgngZTvvdHVc4jrgbekJb/Z0JAYCTxwQAEHe1a8XkWO302420c2bv/AmWcmdu7mHIcQQCADAYYggEDlCNSft+RPfspOdxX7rofd9lLP/5xbxP0Id19pCCCAAAIIIIAAAgiEKMCGz8S4jEAAAQQQiIjAdatW1bhUmlwPo/384fgePw0jcBAxE4lE3Mzb3ecWDZvKpxsSidEg1iEGAggggAAClSCQ3LQ9/TO/19VqrofaVHThur6OE0NdhOBBCRAHAQQQQAABBBAoaQE2fEr68pE8AgggUFkCI7GRs0T0aAnhpqqLGxsbx9k0CWHRLEIeNWvKy1Xl1c+doiI3b/SmfccdD/0JK7cGDQEEEEAAgbIQaEgkRlKx2Gfdz9FNhSjI9+X8/v7+6kKsxRoIIIAAAgggkK8A8xEoXQE2fEr32pE5AgggUFECN/X1zVDVZSLmnpsJuHSVW6a/ZOufAo4aZDhXuneKC1jr+jPb31P+pA9EeaPqmcnyGAEEECgLAYooG4GFjRc+YOItcAU95nqozXx7Y9XDd/9XqIsQHAEEEEAAAQQQQKDiBdjwqfg/AgAEKUAsBBAIT+Dx1Ja5prZv0CuYiC++v37OnEQy6NhBxduwIRETlXe4eE//3Ha7XtvF/E8uWLy4IP8y2a1NQwABBBBAoOwE6puW/MQVtcp13/XQmqrOEpPFoS1AYAQQKLgACyKAAAIIIBBFgaefOIpicuSEAAIIIIBAWqC/vz9mogvdEyWBvxWK+0H4SDIpQ+l1otof/ePUl7ja3/DM/Ezl+pHh+LpnHuNxZARIBAEEEECghARSsdgaUf1L2CmrygfX9ra/POx1iI8AAggggAACCCBQMIHILeSe54pcTiSEAAIIIIDAswTiG+95oYi+VUK4uY2kDf5Pf/WvEEIHFjJWpZ99ZjAV+bfnJZc2LFmy45nHeYwAAggggAAC2Quk39rN963JzRx2PcD2/FCerxcnEon4889wBAEEEEAAAQQQQACB/AXY8MnfkAgIIIBA9gLMyFjAPSniqed/TsSe+/k1GccYZ2BSa6ovaLj66tQ4Y4p6amDViheayLxnJJE00wvmNV589zOO8RABBBBAAAEE8hBY0Nz6Uzf9066H+tZupvLml+817b/cOjQEEEAAgUoRoE4EEECggAJs+BQQm6UQQAABBLIXOGafaUdp+u3csp+ayYwb68467/5MBhZrjFZ5pz5n7RtH4qM3POcY3yKAQIkKkDYCCERHQFOpr4rpb8PMSEX2icesIcw1iI0AAggggAACCCBQuQJs+ET32pMZAggggEBawLf3pe9C6CkV/VoIcQML2d/dXSu+vfFZAWPeJQ2NF29+1jG+QQABBBBAAIG8BerOW3a/qC7JO9D4ATxR+dD4QzhbgQKUjAACCCCAAAIIBCLgBRKFIAgggAACCIQgcN2qVbPSb30SQuh0yLvF9HfpB1Htcdu5v6i+6sn8Uiby8frGJX968nvuEEAAAQQQQCBggfqmJT8R1c+6n7lhvrXb7KGezs8FnDrhEEAAAQQQQKDkBSgAgfwF2PDJ35AICCCAAAIhCYzGkse60KG8z72K/Hp41i/ucPEj2zwv9W6X3N6up9utzuPy9AM6AggggEAFClBywQRGqrRLRX8W5oImdtZA7+cPCXMNYiOAAAIIIIAAAghUngAbPpV3zam4DAUoCYFyFOjv74+Z2kdcbXHXA28pP7ayoeHqVOCBAwrY399freKdK0/cUjGRdt7K7QkMviKAAAIIIBCmQMOHlzwiJt1ujaTr4TSTvTypPjmc4ERFAIFyFqA2BBBAAAEExhNgw2c8Hc4hgAACCBRNIPbQ3a9UsdeEkYCJ/OqPD2/+VRixg4pZtemu17o8D3oy3tpYsvr6Jx9zh8BYAhxHAAEEEAhI4MB47VoX6suuh9NU4r5vCzckEqH8w5ZwkiYqAggggAACCCCAQEQExkyDDZ8xaTiBAAIIIFAsgUQi4blnP841EXcXeBa+in7NrRHev9rNM2WXm+f5+v4nw2zUramzTmlpGX7ye+4QQAABBBBAIGSB4xobR0c2bjtfTP4R1lKq8pat++9xTPDxiYgAAggggAACCCBQqQJepRZO3QgggEBFCpRI0UftM+Ng8eS1IaX7gEry5pBiBxL2ZXtMOtBUThCVERP7fN2yZVsDCUwQBBBAAAEEEMhYoCGRGHU/h1e4CSOuh9IsmVrZn0hUhxKcoAgggAAClS1A9QggUJECbPhU5GWnaAQQQCDaApqyY8zkRaFkafYnL7bHPaHEDijo5JrYYSJ2mJjcbf7o1wMKSxgEEEDgaQEeIIBARgJWk6r5hor8LqPROQxyG0onxmfVHp/DVKYggAACCCCAAAIIIPA8ATZ8nkdS8QcAQAABBIouoJ5/uksijLdzc2H1+3MbGx93DyLbRk3eKaIxUVm8YPFHNgk3BBBAAAEEECiKQPotVYcl9QERC+3nsafygb6+vqqiFMiilS5A/QgggAACCCBQZgJs+JTZBaUcBBBAoNQFvndl975mMi+sOtRP/U9YsYOK66m+V0W/XHfu0u8HFTP7OMxAAAEEEEAAgbRAQ9Oyv6tq+q3d0t+G0d+078hjs8IITEwEEEAAAQQQQGBiAUaUkwAbPuV0NakFAQQQKAOB0R2PXyAqoby6R0Wurztv2f1RZhrsaX+rmKilRnvdk0sW5VzJDQEEEECgAgQocZeA+fpt9+CProfRXpSKxd4WRmBiIoAAAggggAACCFSWABs+lXW9qRaBQAUIhkDQAuv7OmaK6HwJ6ZbyZGVIoYMLq16TiV41Y9POvwYXlEgIIIAAAgggkI9AffPSe8Szj+UTY7y5nsknxzvPOQQQQKDYAqyPAAIIIFAaAmz4lMZ1IksEEECgIgT8pHecK3R/18NodyYf934TRuCgYu7a8PJtj9Fq7ZiTSCSDikscBEIWIDwCCCBQEQL157atd4Wmu7sLuKkcOtjd8e6AoxIOAQQQQAABBBBAoMIEQt7wqTBNykUAAQQQyEvA1H+9qE7NK8gYk1X0p7Jly7YxTkfi8GjKP9LEu7Thw0seiURCJIEAAggggAACzxJQsfSrfO551sHAvrH/7u9PVAcWruCBWBABBBBAAAEEEECg2AJs+BT7CrA+AgggUAkCGdRoZmoi7xB3n8HwbIf4Lv4vGhKJkWwnFnK8mff49lT8l4Vck7UQQAABBBBAIHOB4Zkv+IuqrM18RhYjVY+btHH6i7OYwVAEEEAAAQSiJ0BGCCBQVAE2fIrKz+IIIIAAAk8JDHR3nKAixz71faD3KslkzL8p0JghBFvY3Pqr01tatoQQmpAIIIBAJARIAoFSF2hoaEgNDye7ROzuEGo5wFd5YwhxCYkAAggggAACCCBQIQJs+FTIhS6BMkkRAQQqXMDzvPPDIlCTu9597kW3hxWfuAgggAACCCBQOQINF1x8t6m0hVCxp+qfE0JcQiIQNQHyQQABBBBAAIGQBNjwCQmWsAgggAACmQsMXb58fxF/fuYzshvpi3S4GeY6LfICJIgAAggggED0BeLe9GtF9AYJ+OZ+WTlqqK9zTsBhCYcAAggggAACCERQgJTCEGDDJwxVYiKAAAIIZCVgXvz1IhqTEG4qsrMmWf21EEITEgEEEEAAAQTCEoh43LmNjY+bWJ9LM+V6oM1SdmGgAQmGAAIIIIAAAgggUDECbPhUzKWmUATKR4BKyksgkUjERfy3uKpC2fDxTX52SkvLsItPQwABBBBAAAEEAhMY3bjtOhX5fmABnwzkYr5qcFXHy578ljsEEECgogUoHgEEEEAgOwE2fLLzYjQCCCCAQMACxxw0ebKpHh1w2KfDqXq3PP0NDxBAoJwEqAUBBBAoqkBDIjEiqdSHXRIPux5YM5GZ4slrAwtIIAQQQAABBBBAAIGKESjTDZ+KuX4UigACCJS8wOhw1SwVOSqUQkx2eJ78IZTYBEUAAQQQQACBiheoO2/Z/aK73trNDxAjLirvCDBemYeiPAQQQAABBBBAAIGnBNjweUqCewQQQACBogjExD/TLVztevBN5ZGdo6k/Bh+YiAgggAACCCCAwBMCXir2bTF56InvAvt68g1f7torsGgEQgABBBBAoNwFqA8BBHYJsOGzi4EvCCCAAALFEDAzdT+I0hs+YS1/X8N5bXeEFZy4CCCAAAKlIUCWCIQpMG/xkr/4Yl8OdA2VqTuGU+cFGpNgCCCAAAIIIIAAAmUv4J5nK/saKRCB8QQ4hwACRRQY7O18pYkcEFYK7smX74YVm7gIIIAAAggggMBTApNm1Kwwsf976vsg7lV0UX93ojaIWMRAAIFdAnxBAAEEEECg7AXY8Cn7S0yBCCCAQHQFPLG3h5mdavzqMOMTu5wEqAUBBBBAAIHcBU45vWWL58c+4SIkXQ+mqewdlymvCyYYURBAAAEEEEAAAQSeECjvr2z4lPf1pToEEEAgsgIbrrxykomeGGKC/5i/6MI7Q4xPaAQQQAABBBAoN4E86klW6Y/NLLDPDlTVmKcNDfVdAAAQAElEQVTem/v7T43lkRZTEUAAAQQQQAABBCpIgA2fCrrYlIoAAvkJMDtYgUe2b9rHRXyR6+E0kx+GE5ioCCCAAAIIIIDA8wUWnHPBv0X0Kgno5jaP1ETeVLP1uCkBhSQMAggggECGAgxDAAEESlWADZ9SvXLkjQACCJS4QDzmHyhiLwipDF89+3FIsQmLAAKVLUD1CCCAwG4FVNVGh70vupO3ux5UO1qGZf+gghEHAQQQQAABBBBAoLwF2PAJ9PoSDAEEEEAgUwEz7y0iOklCuKnoJt/0/0IITUgEEEAAAQQQQGBMgYYlS3aoJ00itnPMQVmcUJEqX2OLspjC0IIJsBACCCCAAAIIIBA9AS96KZERAggggEAlCJjKSWHVaWIP+LHY/WHFnzAuAxBAAAEEEECgYgW2jlTfKuLdEhSAmpzV19dXFVQ84iCAAAIIIIBAgAKEQiBiAmz4ROyCkA4CCCBQCQLr+zpmislxYdWqIvftdfjmh8KKT1wEEEAAAQQyEWBMZQqc3tKyxXz7RoDV185ObX1ngPEIhQACCCCAAAIIIFCmAmz4lOmFpazIC5AgAhUtkPTtzW5TJrR/qeqr/u+cOYlkRSNTPAIIIIAAAggUTeAPD2/7plv8HtcDaZ7ouwIJRBAEECiGAGsigAACCCBQMAGvYCuxEAIIIIAAAk8KqHl1Tz4M5S4mfmBvoxJKggRF4GkBHiCAAAIIlKNAIpHwffHe72obdj3vZmIvXbt69d55ByIAAggggAACCCCAQJEECrMsGz6FcWYVBBBAAIEnBa5btWq6uCctnvw2lLv4aM3PQglMUAQQQAABBBBAIEOBP27c8jMx+0FGwycedGRVfPjAiYcxAgEEEEAAAQQQQKCSBdjwqeSrT+0IIFASAuWW5Ig+/gJX02zXw2q3ntLSEsi/pg0rQeIigAACCCCAQPkLJBKJpKh8V0ySAVQ7I5nyXx9AHEIggAACCERYgNQQQACBfAXY8MlXkPkIIIAAAlkJePGq9IbPzKwmZTNY9eZshhdr7JWJxKT+7kRtsdZnXQQQKDkBEkYAgRIU8FW+5zZ9HggidVU9LYg4xEAAAQQQQAABBBAoXwE2fMri2lIEAgggUDoCKdEjXLY1rofTUqmfhxM42Kh77DNj37jMOCjYqERDAAEEEEAAgSgJLFjUttHl82nXfdfzba9dd3n7ofkGYX6pC5A/AggggAACCCAwtgAbPmPbcAYBBBBAIAQBT/zjQwj7VMjNcS/+t6e+ifK9Z8kja2T00UBzJBgCCCCAAAIIRE5gZOO2q8zkN0Eklop5dUHEIQYCCCCAAAIIlLgA6SMwhgAbPmPAcBgBBBBAICQBsxNCipwOe9eIpralH0S9+6ovGfY0iH/tG/VSyQ8BBBBAoMACLBctgYZEYkRVv6aqlm9mqvIut3mk+cZhPgIIIIAAAggggEB5CrDhU57XlaoQGEuA4wgUVWB9b9cBJnpwWEmYykOTRmt2hhU/yLjuB/AJyQe3PxZkTGIhgAACCCCAQDQF4qLXi9kdeWdn8sKB7s4X5x2HAAggUAkC1IgAAgggUIEC7vmmCqyakhFAAAEEiiKQstTbw1xYxf518nnnbQ1zjSBi39jePtVEDkj/i98g4hEDgewFmIEAAgggUEiBdy668A5fZX3+a/r7enF5Uf5xiIAAAggggAACCCBQjgLP3/ApxyqpCQEEEEAgIgLeW8NMRE3+TwN4u5Qwc0zHfnyad4KYPJh+TEcAAQQQQACB8hdI/34SS9oXXKV5fn6fTpKUHOPiBNOIggACCCCAAAIIIFBWAmz4lNXlpBgEEEAgOIGQIr0upLhPhDX95xMPov3VUvYqFXsg2lmSHQIIIIAAAggEKTDvvLY71PSb+cY09d+WbwzmI4AAAggg8EwBHiOAQPkIsOFTPteSShBAAIFICwz0rXihiE0LM0k17+9hxg8qtqf2UlEvFVQ84iCAAAIhChAaAQQCFEh5fp/7fWhTPiE90Vev70tMyScGcxFAAAEEEEAAAQTKU8Arz7KoqjACrIIAAghkIWCxQ9wTHDVZzMh6qFZtuSPrSQWecN2qVc5AjzTf/lXgpVkOAQQQQAABBIossG2b3CGmP88nDROZ5Cdr5+cTg7kIZC/ADAQQQAABBBAoBQE2fErhKpEjAgggUA4CZvubaFVYpajIH+Y2Jh4PK35QcS22c08xmSoqW4OKWfQ4JIAAAggggAACGQmc0da23ffsWxkNHm+QJ+8d7zTnEEAAAQQQQACBUAQIGnkBNnwif4lIEAEEECh9ARNRNXmJ25QJbcPHxP4gJXAbjsX2EZXpJZAqKSKAAAIIIJCVAIMzE6jypq9zI//heu7N9NUDK1fukXsAZiKAAAIIIIAAAgiUowAbPuV4VakJgegJkFGlCyQSbq9HDwyTwUR/Fmb8oGLHVPZysWqTXur37p6GAAIIIIAAAhUmMLex8XEV/Vg+ZZvYZG/S6JH5xGAuAgggEJIAYRFAAAEEiijAhk8R8VkaAQQQqBSBL+63X8zMXhxyvb8JOX4g4VOp1EwXqFZVfXdPQ6DCBCgXAQQQQCAt4A97N7n7v7ueU1ORSWoeGz456TEJAQQQQAABBBAoX4HobPiUrzGVIYAAAhUvsOeeD6h6clCYEPHYtL+GGT+o2J7GDnex+PnrEGgIIIAAAghUqsDoAT/fKibX5Vq/icR9kVckEgkv1xhFncfiCCCAAAIIIIAAAqEI8MthKKwERQABBBB4psDowzVT3ZMaGb2l2zPnZfH4vh17PpDMYnwRh9r+6cWrND6cvqcjgAACCCCAQOUJNDRcnXIbNmvd70f5/P5yzH773R+rPD0qRgABBBAoFwHqQACB4AXY8AnelIgIIIAAAs8RmCo1L3/OoaC/vevRR++3oIOGEs8k/Qofie+M3x5KfIIigAAC5SFAFQiUvcBD8Wm3qme5f6afyTEHDb+c/6cv+z8pFIgAAggggAACCGQuwC+HmVsxMjICJIIAAqUmYGInh5mzimw+/IH9Lcw1Aox9SDrWKS0tvMInDUFHAAEEEECgQgUaGxtHxfcucuWnXM++qUwejo+E+jtW9kkxA4GgBYiHAAIIIIAAAtkIsOGTjRZjEUAAAQRyElCxl+Y0McNJZnbvj0X8DIcXe9iuDZ9iJ1EW61MEAggggAACJS5Q17x0g4r8No8y6vOYy1QEEEAAAQQQQKA0BMgyYwE2fDKmYiACCCCAQB4Cx+Yxd8KpJnJ/IpGI/IbP2t729FvbxScsiAEIIIAAAgggkLFAqQ80lbW51uD+h36+m+v2jNxXGgIIIIAAAggggEDFC7jfDyveAAAEEChfASqLgEB/V9dkl8ZBrofV3PMkujms4EHGjZl3WJDxiIUAAggggAACpS+Q8uUHIrYpl0pMZPp316x4US5zmYMAAgiUmQDlIIAAAgg4ATZ8HAINAQQQQCA8gZrpckB40V1klVH1ZKN7FPnmm704naSKbE/f0xFAoFACrIMAAghEVyA16+Dfiulfcs0wZvKKXOcyDwEEEEAAAQQQQKC8BNjwKa/rSTUIIIBA5AT8HakDw0xKTXzfSmMDxW1MHZO2MJF/pO/pCCCAAAIIIIBAQ0NDylRW5iqh5r0y17kVN4+CEUAAAQQQQACBMhdgw6fMLzDlIYAAAsUWME9DfYWP2zxJmsnD+dZZkPkmhxZkHRZBAAEEEEAAgZISGJ257ToR+2cuSZvYEVdemZiUy1zmIIAAAgggUIkC1IxAOQuw4VPOV5faEEAAgQgIeKL7hZxG0kvJIyGvkXf4RCLhqQif4ZO3JAEQQACBUAUIjkBRBBoaEiNm3tdE1CTLm4oeNGN79dQspzEcAQQQQAABBBBAoAwFvDKsiZIQCEmAsAggkJuA7Z/bvIxn+V5NclvGo4s08BX7TJ1pYlVFWp5lEUAAAQQQQCDiAr7YDSKWyz9iOTBe5bHhE/HrS3qlJkC+CCCAAAIIlKYAGz6led3IGgEEECgVAVWVUJ+AcJsoqS3DUx6LOkg8ucuBn7tRv1CZ5McYBBBAAAEEQhBIyeS/ispfcgi9vz9SPSOHeUxBAAEEEEAAAQQQGE+gBM/xxFMJXjRSRgABBEpFoL+ra5KpzgozXxVNnd7SsiXMNYKIndz1WUbKK3yCwCQGAggggAACERAIOoWG5uZtanJTLnEt7r89l3nMQQABBBBAAAEEECgvATZ8yut6Ug0CCERDgCyeFJg8dYuKWezJbyv6TmNaI2L83K3oPwUUjwACCCCAwPgCyVjsivFH7P6s+Xbi7s9wFAEEEEAgZAHCI4AAApES4ImnSF0OkkEAAQTKTaB2iqiG+hk+avaLUlBT39/HWcRLIVdyRACBoASIgwACCGQnsLDxwgfUpD+7WSIx1ddkO4fxCCCAAAIIIIAAAuUnwIZPsa4p6yKAAAIVIDDqmydm1RVQ6oQlmujeYsKGz4RSDEAAAQQQQKCyBXzferMVMJF9h3qWH5HtPMYXSIBlEEAAAQQQQACBAgmw4VMgaJZBAAEEKlEg7qUmqcjMMGs3lcekBG5mMtWl+byfu+4YDQEEEEAAAQQQeFrAm1T1V/fNX1zPqqV87yVZTWAwAggggAACCBRUgMUQKIQATzwVQpk1EEAAAQTCEzC7LbzgwUQ2M/VU9gomGlEQQAABBMpQgJIQeFrgd/c9tklVf/70gQwfxGJyTIZDGYYAAggggAACCCBQpgJs+JTphaWschKgFgRKVyA5WjXJRGaVbgXBZP6pT31KxWyPYKIRBQEEEEAAAQTKWSCRSCRTKf+H2dbo+97R6X9kku08xiOAQJQEyAUBBBBAAIH8BNjwyc+P2QgggAAC4wj4ZumfM1XjDKmIUy972V9URKfIkzf3Tc2TD7lDIHMBRiKAAAIIVJDA5JtcsTtcz6LZ7Ku/uHx6FhMYigACCCCAAAIIIBBFgTxySj8Rl8d0piKAAAIIIDC2gOfF3N7G2OeDOGMWvzuIOGHGmHXbkWoi+z61hnv8sqcec48AAggggAACCDxXYMHixZt8s6ufezz9/ZhdbbZn3uwxz3MCAQQQQAABBBBAoOwF2PAp+0tMgQggUEECkSvVk9FXhJ2Uqt0b9hrERwABBBBAAAEECi0Q87zLVCSZ6bqqXq0mZVqm4xmHAAIIIFDSAiSPAAII7FbA2+1RDiKAAAIIIBCMAG9d5hyn7befiso+7iENAQQQKIAASyCAQDkIHODV/tlEbsu4FrNZsZhX8Z+dmLEXAxFAAAEEEEAAgTIUYMOnDC/quCVxEgEEEECg4AL/2vMBVbOpBV+YBRFAAAEEEECgZAWufeCBlJj+KIsCPPN1vyzGM7TcBagPAQQQQAABBCpOgA2firvkFIwAAggUTkDVm1K41VgpGwHGIoAAAggggEC0BRKJhG+e3OKyHHY9o6aef0xGAxmEAAIIIIAAAhUjQKGVJcCGT2Vdb6pFAAEECipg98kFcgAAEABJREFUIi8v6IIRXWz7beKJ6gHPTK9/1ed4y5VngvAYAQQQQKAYAqwZcQH15X9VdEvGafpyUMZjGYgAAggggAACCCBQdgJe2VVEQQggEJAAYRBAIDCBF+yKVL3r65NfYjVxnpB50oI7BBBAAAEEENi9QH3z0ntM7Ee7P7ubo6pH7uYohxBAAIEJBDiNAAIIIFAuAmz4lMuVpA4EEEAAAQQQQCAMAWIigAACCBRVwES+lUUCh/f3nxrLYjxDEUAAAQQQQAABBMpIIK8NnzJyoBQEEEAAAQRCE5j9+Kw9QgtOYAQQQAABBBAoa4GaZPX1onJvpkVWP/LqIzIdm804xiKAAAIIIIAAAghEX4ANn+hfIzJEAAEEoi5AfhMIDMd2/Ndzh3i+vui5x/geAQQQQAABBBB4rsApLS3D7tgG1zNqqaSx4ZORFIMQQAABBHIQYAoCCERcgA2fiF8g0kMAAQQQKH0BTfn63CrUdPpzj/E9AgggUNoCZI8AAqEJ+HqzmCQzie/FvJdnMo4xCCCAAAIIIIAAAuUnwIZP+V3TaFZEVggggAACCCCAAAIIIIAAAjkJpMT+aiqPZDJZzedVxJlAMSY8ASIjgAACCCCAQNEE2PApGj0LI4AAAghUtIDaIZVYPzUjgAACCCCAQPYCKdn2VzW7O7OZ+orMxjEKAQQQQAABBBAIT4DIxRFgw6c47qyKAAIIIFDhAmqyV4UTUD4CCCCAQOUKUHmWAg3NiW0i+hPJ7Datv79rcmZDGYUAAggggAACCCBQTgJs+JTT1aQWBMpCgCIQKD8BFX3D86pSiT/vGAcQQAABBBBAAIExBNzvE+vHOPXcw9WTN/EPS56LwvcIIBBFAXJCAAEEEAhagA2foEWJhwACCCCAQCYCpi/MZBhjEKhYAQpHAAEEEHiWwL/jtT91Bza6PlGrGZXUnhMN4jwCCCCAAAIIIIBA+QmU5IZP+V0GKkIAAQQQyF0g9drc5xZ15pSirs7iCCCAAAIIIFBSAo2NjaNiNjRx0hYzX8vmLd0mrpcRCCCAAAIIIIAAAk8JsOHzlAT3CCCAAAKlJlDS+foik4euWD6tpIsgeQQQQAABBBAorEDMGzQR92vEeMvqJFGbPd4IziGAAAIIIFBiAqSLAAIZCrDhkyEUwxBAAAEEEAhSQEWqUiMe//o2SFRiIYBAhQpQNgKVI5BU+5f7HeLBCSqOx4xX+ExgxGkEEEAAAQQQQKAsBbyyrIqiEHhKgHsEECiqgG+2I/QE1CvJt0YzkarkcGpS6D4sgAACCCCAAAJlI+BL8gFXzN9dH6/V+CozxxvAOQTKUoCiEEAAAQQQQEA8DBBAAAEEEAhLwFOd6AmJIJZ+WRBBCh1DVSbHa2LTC71upa5H3QgggAACCJSDwKmNF29xv0P8YaJaYir8jjEREucRQAABBBBAoCwFKr0oNnwq/U8A9SOAAAJhCpg/Emb4dGw1q07fl1w3qY77ylu6ldyFI2EEEEAAgRIWKPnUVcSSZjdNVIj5su9EYziPAAIIIIAAAgggUH4CbPiU3zWlIgQQyEmASSUr4OnepZi7e8Jmkng2rRRzJ2cEEEAAAQQQKJ7A5Ok1P3Grj/+2uZ7WujE0BBBAAIHdCnAQAQQQKF8BNnzK99pSGQIIIFB0ARNvNOwkzOTwsNcII76JTDLzeDImDFxiIpCPAHMRQACBiAuccnrLFvd7xM3jpun7+497npMIIIAAAggggAACZSnAhk8Wl5WhCCCAAALZCaR8+V12MypqdHVK/SkVVTHFIoAAAggggEAgAm7D55rxAplK1XjnOTexACMQQAABBBBAAIFSFGDDpxSvGjkjgAACCDwt4J7wqB7s7jzo6QPhPwhsBRV5SWDBCIQAAggggAACFSMwVe16V+wW13fbVPSQ3Z7gIAIIIIAAAghkI8BYBEpOgA2fkrtkJIwAAgiUjkCV5yVF7PEwM1YX3IuPpu/co9JqKjq9tDImWwQQQACB/wjwCIHiCezc4u8Qlb+MlYGJ6VjnOI4AAggggAACCCBQvgJs+JTvtaWyYgqwNgII7BLQ+MiIij6265vwvlT5o7H9wgsfYmSTA0OMTmgEEEAAAQQQKFOB6Tt27BAbe8PHlb2H6zQEECiEAGsggAACCCAQIQE2fCJ0MUgFAQQQKDcBP1llJpIKtS4TT0VrQl0j3+AqW8cIUZJvRTdGLRzejQCHEEAAAQQQCENgTiKRdP8z/0cX23f9eU1FZz3vIAcQQAABBBBAAAEEQhOISmD3O2JUUiEPBBBAAIFyE6ieXLXT1bTJ9fCaStxUZoe3QACRPe9Pu4uiEvG8d5c0xxBAAAEEEEAgW4FQxvtJ//di4ocSnKAIIIAAAggggAACJSnAhk9JXjaSRgCB8hEo70p2Pr4t/STEcJhVmoj7WeZPCXONfGNbKpXcXQyX+2GWSLj8d3eWYwgggAACCCCAwNgCfpX+XVRGxxqxvi8R6d+Pxsqb4wgggED5ClAZAgggEL4ATzKFb8wKCCCAQMUKTJ2+6xU+D4cJ4KnGVXWfMNcIM/a1+9UeHmZ8YiOAQIkIkCYCCCCQpcCCRW0bRfS3MsbNt9rjxjjFYQQQQAABBBBAAIEyFWDDpwQuLCkigAACpSowsmO7udxD/QwfM1MTrXXrqOsl11KjeljJJU3CCCCAAAIIIBARgdS3I5IIaQQkQBgEEEAAAQQQQCAfATZ88tFjLgIIIIDAuAJzGxOPuwH3ux5ys4MskYjsho+pjPm2dr76x2SIwzAEEEAAAQQQQOBZAl6VXvesA3yDAAIIIIAAAuUgQA0I5CzAhk/OdExEAAEEEMhIwOQxCf3mHfAjSX+WT+gL5bRA0qb+ZqyJMdWjxjrHcQQQQAABBJ4vwBEE/iMw7+y2O1TkX/85wiMEEEAAAQQQQACBShZgw6eSrz61l58AFSEQQQH3JMS/w0/Lpv9jv/3cUuGvlMsK26c8lBxrnokcOdY5jiOAAAIIIIAAAhMJ+Kp/2t2YlG98hs/uYDiGQLkIUAcCCCCAAAK7EWDDZzcoHEIAAQQQCFTgnkCj7S6Y2T577vlAZDd8dpfyM47N7O/uTn8G0TMO8RCB/ASYjQACCCBQOQJq9ofdVauiU3Z3nGMIIIAAAggggAAC5SPw3ErY8HmuCN8jgAACCAQqkIrLxkAD7i6Y6qEzdk6t2t2pSBy7a1cWY32OT1VVfPs+u0bwBQEEEEAAAQQQyFLARP9PREfl+TeOIIAAAggggAACCFSYABs+FXbBKRcBBBB4QqCAX1XD3/Bx5Ty+PRbZt0ab+jLxxex+l+bzmolUmens553gAAIIIIAAAgggkIGAr6k7RGxbBkMZggACCCBQkQIUjQAClSTgVVKx1IoAAgggUHiBBecs/Ydb1e1ruK8hNjP/lSGGDy20qlTHTA8LbQECI4AAAuMJcA4BBEpeYJIv/3RFbHGdhgACCCCAAAIIIFDhAl6F10/54whwCgEEEAhOwNKbPsGF200kNXnVbg5H4tBhj+5nqrr7J2JMqswXXuETiStFEggggAACCJSewPZZhzykUoC30C09GjLOQoChCCCAAAIIIFAeAmz4lMd1pAoEEEAg2gKmvw47Qc+TF4W9Rq7xtz7wgPkmD48xX82TF5iZe65mjBHFPczqCCCAAAIIIBBhgYaGhpQv4f+uFWECUkMAAQQQQACBYASIUgYCbPiUwUWkBAQQQKAEBH4Tdo5m8oYNiUQ87HVyja8qybHmqumBV199NT+TxwLiOAIIIIBABARIIdIC6v8o0vmRHAIIIIAAAggggEBBBHhyqSDMLIJAmQtQHgITCGjM++sEQwI5vWl2zcGBBAo4yJtEfBG7f6ywJnbwo48+ys/ksYA4jgACCCCAAALjCsS36w/HHcBJBBBAICgB4iCAAAIIRFqAJ5cifXlIDgEEECgPgUdqtqT/1anb9Ai3niq/6sBwV8gt+qfS02zsV/i4H8YHHTQ87O7SA+kIlK4AmSOAAAIIFEdgbmvrwyJ6p3BDAAEEEEAAAQQQqGiBQj25VNHIFI8AAghUusDUqS9zmz3277Ad/JgeFvYaucT/5Cc/aSK6Sca4uZP7Jmv8fcY4zWEEEEAAAQQQQGBCARP77YSDCjOAVRBAAAEEEEAAAQSKJMCGT5HgWRYBBBCoJIFZs27zRfV2kXCrVrF9w10ht+iqar7I5vFmp1LJV453nnMIIIAAAggggMB4Ap7oz8Y7zzkEEEAAAQQKK8BqCCBQDAGvGIuyJgIIIIBAZQk89NBfzFV8j+thtyP6+/tjYS+SS/x4TLaIaErGvtWPfYozCCCAQJkJUA4CCAQukPL9f8r4v2sINwQQQAABBBBAAIHyFmDDp7yvb0lWR9IIIFB+Ag0NV6fMt9tDr8xk78mPPloT+jo5LOD79piojbnhoyLH5hCWKQgggAACCCCAwC6BuOr9Iu73jV3f8QWB0hAgSwQQQAABBBAIVoANn2A9iYYAAgggMIZAzD0J4TY1kmOcDuaw2X4iW6cEEyzYKL56W8RkzA0ft9rLh65YPs3d054Q4CsCCCCAAAIIZCGQ8kYfcr9rPJTFFIYigAACCCCAAAJRECCHAAXY8AkQk1AIIIAAAmMLJMX/u5kMjz0igDOq+6WSOjmASMGHSL/CR8bd8BF/pOqlwS9MRAQQQAABBEpZgNwzFRj19FFReSTT8YxDAAEEEEAAAQQQKD8BNnzK75pSEQKVI0ClJSVQ5cn9LuFR18Ns+3im08NcINfYvi8Pu7njvsLJM58NH4dEQwABBBBAAIHsBRoaL94stuv3rewnMwMBBBCIugD5IYAAAghkJMCGT0ZMDEIAAQQQyFfgfp1xp3ghv8JHJG6evSzfXMOYX12dfNzF9V0fs5koGz5j6nACgbEFOIMAAggg8KSAyu+efMQdAggggAACCCCAQAUKeGVeM+UhgAACCEREoLGxcVRFbg4/Hf+14a+R/QrzGi++280acX3MZmaHXrdqVc2YAziBAAIIIIAAAgiMJ6DeX5867ammX1391LeVcE+NCCCAAAIIIIBAxQuw4VPxfwQAQAABBAon4JvcEvZqZvrK568RkSNm946Xiaoc6MfjU8YbwzkEEEAAAQQQQGAsgVTK/+3T59Ruf/oxDxBAAAEEEKgYAQpFoLIF2PCp7OtP9QgggEBBBTxJ/Tj0BVXekEgkIvnzTT29c7z6VeSwYf/xSH4G0Xh5cw4BBBAoGQESRaDMBRYubr3L/T7xaJmXSXkIIIAAAggggAACYwhE8gmxMXLlMAKhChAcAQTCF6hrWvZ3t8pG10Ntr5g144hQF8gxuO/b02+zsrsQJjKrSmX27s5xDAEEEEAAAQQQyETA/T7x80zGMQaBShagdgQQQAABBMpVgA2fcr2y1IUAAghEVMA9CfHTsFOLSSqSb+tmFrttgtpjvsirJhjD6XAFiI4AAggggEBpC5j8qbQLIHsEEHFagm0AABAASURBVEAAAQQQQKAgAmW5CBs+ZXlZKQoBBBCIroCa/ue95UNK01eL5IZPLD468Xvpq50UEgthEUAAAQQQQCBjgVIeaLte4VN3bustpVwFuSOAAAIIIIAAAghkL8CGT/ZmzEAAgUoXoP68BGJqfxGVkbyCTDBZRY/ckEjEJxhW8NNVI5Mz+Re3byt4YiyIAAIIIIAAAmUjEIvZ31Rke9kURCEIIIBAMQVYGwEEECgxATZ8SuyCkS4CCCBQ6gK+6l1isinkOmZvOWCPvUNeI+vwp7S0DLtJ97s+TtNJ69d0HjXOAE4hgEBEBEgDAQQQiKLADht53ETui2Ju5IQAAggggAACCCAQrgAbPuH4EhUBBBBAYAyBmE2+U1QeHuN0UIf3GR0d3SeoYAHHuXuieEmT1040hvMIIIAAAggggMDuBKp2Tk2/uufW3Z3jWCgCBEUAAQQQQAABBCIjwIZPZC4FiSCAAAKVIfCupqZH1eQvIVe7d7XKzJDXyCD87obYnbs7+sxjMdv1GUT6zGM8RgABBBBAAAEEMhHYY4/NO0VsglcUZxKJMQgggAACCCCQuQAjEYiGABs+0bgOZIEAAghUmIB3Q8gF1yRNDw95jZzCm8gdE030VY7s77t0+kTjOI8AAgggUCICpIlAAQXmnJnYqaqZfG5gAbNiKQQQQAABBBBAAIFCCLDhUwhl1kBgHAFOIVCJAnGruVFU3d5HeNWr2OvDi557ZDXvDxPONpnt7fRmTziOAQgggAACCCCAwG4Eaqq863dzmEMIIFBkAZZHAAEEEEAgbAE2fMIWJj4CCCCAwPME3tnc/G938Feuh9ZUvGMkgjdVf5uI7Rw3NZP9q2q8/cYdw8lyE6AeBBBAAAEEAhM46cNLHgksGIEQQAABBBBAAAEEghQINRYbPqHyEhwBBBBAYEwBX9aNeS6QE3bE967s3jeQUAEGUfE2iajb9JGxbyqTzeTYsQdwBgEEEEAAAQTKU4CqEEAAAQQQQAABBBDIXYANn9ztmIkAAggUVqDMVlPP+5Eradj1sJo3unP4NWEFzzVu0pdH3GbO9onmm29vnGgM5xFAAAEEEEAAAQQQQAABBMpQgJIQQACBHAW8HOcxDQEEEEAAgbwEkqnUvS7Ana6H1tRSbwsteM6BhzepytaJpnvqvXaiMZxHAIHKFKBqBBBAAAEEEEAAAQQQQAABBHYnwIbP7lRK9xiZI4AAAiUjsNfUbQ+6ZP/hemjNRN+yIZGIh7ZADoEXLP7IJjftYdfHbSY2a2jN8uPGHcRJBBBAAAEEEEAAgUoVoG4EEEAAAQQQQOB5Amz4PI+EAwgggAAChRCYc2Zip5jeGvJatZv2nXJoyGvkEv5PmUzyzZuXybjnj+EIAggggAACCCCAAAIIIIAAAgiUvwAVIvBsATZ8nu3BdwgggAAChRXYEO5yOj3mey8Kd43so5vqbzOZpaanJBIJflZngsUYBBBAAIHnC3AEAQQQQAABBBBAAAEEKkqAJ5Eq6nJTLAL/EeARAlEQeDBe+ytVSb+1WyjpmNgUUXthKMHzCOp++P4hw+n7vvKAqS/IcCzDEEAAAQQQQAABBBBAAIHnCXAAAQQQQKByBNxzTpVTLJUigAACCERLoLGxcdR8+VZYWamIp+IdKxG7zTt3ye8zSkllup/UwzMayyAEchNgFgIIIIAAAggggAACCCCAAAIIlInAOBs+ZVIhZSCAAAIIRFogmRr9uqiMhJWk+f4rwoqda1xVNRWZ+FU+JtPE7Ohc12EeAggggAACCCCQmQCjEEAAAQQQQAABBMpBgA2fcriK1IAAAgiEKRBy7Fhq0h1uiX+5HkpT0VcMLV8+LZTgeQT1Rf6Y0XSTV2c0jkEIIIAAAggggAACCCCAAAII5CPAXAQQKHkBNnxK/hJSAAIIIFDaAgdNmbLdVfAr18NpKvHUtNiCcILnHtX9AP5BJrNV9fgNiUQ8k7GMQQABBMIUIDYCCCCAAAIIIIAAAggggEC0BdzzTdFOkOxKQoAkEUAAgZwFjkt/jo/oL1wA3/VQmvthd1oogfMImvLtHyqSnCiEiRzw6KzaEyYax3kEEEAAAQQQQAABBAogwBIIIIAAAgggEGEB9xxYhLMjNQQQQACBihAwif/EbWykQiz2Td9YtWp6iPGzDl1l+qir+aHMJtrpmY0r9ijWRwABBBBAAAEEEEAAAQQQQACB8hegwqgKsOET1StDXggggEAFCST33u+vrtzfux5OM4lNie88JpzguUUdjdsjbsPn3kxmxzxduL6vb0omYxmDAAIIIIBA0QVIAAEEEEAAAQQQQAABBIoiwIZPUdhZFIHKFaByBHYn0NDQkFJPviph3VRi6mukNnwmjdZsVpF/SwY382WPVGrzsRkMZQgCCCCAAAIIIIAAAgggEAkBkkAAAQQQKLwAGz6FN2dFBBBAAIHdCFhN7Fvu8FbXw2iqKsf09fVVhRE8l5intLQMq9g/M5qrEhP1jhNuCJSPAJUggAACCCCAAAIIIIAAAggggEDAAhHc8Am4QsIhgAACCJSEwPwzL3zMJfoD10NppnrUQcPDk0MJnmtQlVsznKoqcsJ1q1bVZDieYQgggAACCCCAQAkIkCICCCCAAAIIIIBAkAJs+ASpSSwEEEAAgbwE3A+lH4poStK3gLsn+uLhqtReAYfNK5zbhPpjpgHM7KjhVCpaG1aZJs84BBBAAAEEEEAAAQQQQAABBMYS4DgCCAQm4AUWiUAIIIAAAgjkKZDS1K0ifvqVPnlGev50E5tikpz3/DPFO/KgTvs/FdmeWQb6IpucfGlmYxmFAAIIlI8AlSCAAAIIIIAAAggggAACCGQmwIZPZk6MiqYAWSGAQJkJxL09/izq3R9WWZ54DWHFziVuY2PjqKl+P8O5sZjpezIcyzAEEEAAAQQQQAABBMpJgFoQQAABBBBAIAMBNnwyQGIIAggggEBhBOY2Nj4uZt8JbTWT469ZtfzA0OLnENjMbsh0mpl8kM/x2Z0WxxBAAAEEEEAAAQQQQAABBBBAoPwFqHAiATZ8JhLiPAIIIIBAQQWqJk/+iomMhrOoVcWr4m8PJ3ZuUb2q+JCb6bueSZsxEh9+fSYDGYMAAggggEDFCVAwAggggAACCCCAAAIVLsCGT4X/AaB8BCpFgDpLR+CdZzb/22W71vVQmvn2+g2JRDyU4DkE9eM27Kbd7npGTcV7p3BDAAEEEEAAAQQQQAABBBDYrQAHEUAAgUoWYMOnkq8+tSOAAAIRFfBErwkxtZc+tFf1niHGzyr06KNuw8c04w0fEzn22p7PRyb/rIplMALFFyADBBBAAAEEEEAAAQQQQAABBMpWwCvbyrIujAkIIIAAAlERGJbkH10ud7geeDOVF8erqvYJPHCOAW/bsmVY1P6S6XQz/yVJr2q/TMczDgEEEEAAAQQQQOC5AnyPAAIIIIAAAgiUpwAbPuV5XakKAQQQKGmB2zbu+KeY/DmMIlR1T0/lVWPGLvCJRCLhi+f91UQy+hwf9byZIvbqAqfJcggggAACCCCAAAIIIIAAAgiUlwDVIFCGAmz4lOFFpSQEEECg1AXcJkjSVPtDqcNMXTstlNg5Bk0lk39QkVRG013yrkUq/4zyZhACCCBQYgKkiwACCCCAAAIIIIAAAgiUmgAbPqV2xcg3CgLkgAACBRCIx7audctscj3wpiZv6P9y116BB84x4GR/Uvot3bZmOj2d//rergMyHc84BBBAAAEEEEAAAQQQyEmASQgggAACCJSUABs+JXW5SBYBBBCoHIG5jYnHxeRLIVVcUzWcmh9S7KzDntLSMiyi10rmt5qU+R/IfDgjwxEgKgIIIIAAAggggAACCCCAAAIIlL9A6VTIhk/pXCsyRQABBCpPIO59yxW92fXAmyf6nv7+/ljggXMM6Fvq29lNtVPW9yWmZDeH0QgggAACCCAQuAABEUAAAQQQQAABBBCIiIAXkTxIAwEEEChLAYrKT2BERu42kd/kF2X3s32VF3oP3/uC3Z8t/NEFzRfdIKKPS4Y3FX2hyYyXZDicYQgggAACCCCAAAIIIIAAAiEKEBoBBBCIggAbPlG4CuSAAAIIILBbgVPPWbbFndjgeuBNRfarEnt54IHzCmi3ZjF9pp9KHpXFeIYigEDxBFgZAQQQQAABBBBAAAEEEEAAgdAF2PAJnXiiBTiPAAIIIDCWgKqaJP0s3+psrGjPOz7Z9+2tzzta1AP2v5kubyJxU68u0/GMQwABBBBAAAEEECi2AOsjgAACCCCAAALhCnjhhic6AggggAAC+QnMb7non6Lyg/yijDHbkzljnCn8YbeimroNH9vpHmbU1Ozka/pW7pfRYAYhgAACCCCAAAIIIIAAAggggEDxBcgAgRAF2PAJEZfQCCCAAALBCPgjdkEwkZ4dRUVetnZ1+2uefbR435nv/Z+otzmLDKpjqdS5WYxnKAIIIIBAxAVIDwEEEEAAAQQQQAABBBDIVYANn1zlmIdA4QVYEYGKFdjzFdv/Jiq3hADgeZ5EZsMkVj31n67Gja5n3Nym1fs3XHnlpIwnMBABBBBAAAEEEEAAAQSiLkB+CCCAAAII5CTAhk9ObExCAAEEECikwJw5iZSY3OjW9F0PtKno269ZGY23RZvb2Pi4+vb9LAuc/djwIydmOYfhJS1A8ggggAACCCCAAAIIIIAAAgggUP4C2VfIhk/2ZsxAAAEEECi8gJn517llt7keaDORPbQqebxE5GbqDWWTist/qqZkjrvXbOYxFgEEEEAAAQRKXID0EUAAAQQQQAABBBB4jgAbPs8B4VsEEECgHATKsYY/PPT4n83k1qBrU9Uaz5PXmVkkNkzqm5b8RETvlixuqvb2L/b1xbOYwlAEEEAAAQQQQAABBBBAAIEyEKAEBBBA4JkCbPg8U4PHCCCAAAKRFUgkEklV//8FneCujR7z3vTFL34xOhsm5qffvi7jUk31uFmj2w7NeAIDEUCgUgSoEwEEEEAAAQQQQAABBBBAoIIE2PCpoIv97FL5DgEEECg9gfqmi9KvfnE94NzVjtpHtr8k4Kg5h/NFb1CRZMYBzNTz7DMZj2cgAggggAACCCCAQAUJUCoCCCCAAAIIVIoAGz6VcqWpEwEEECgTARP7hoimJNhblfl2SbAh84jm2T9M5d9ZRqgf6F15SJZzRJiAAAIIIIAAAggggAACCCCAAALlL0CFFSHAhk9FXGaKRAABBMpHwJPUj92mz71BV6Rmpw1ddtk+QcfNJV6s2r/LzfuX69m0KhV/npugrtMQQAABBBDISoDBCCCAAAIIIIAAAgggUPoCbPiU/jWkAgTCFiA+ApESGJ556O2eys9DSaom9c5Q4mYZtO6sZVvN5JYsp4mZve3Gq9qnZDuP8QgggAACCCCAAAIIIICAiICAAAIIIFDiAmz4lPgFJH0EEECg0gQaGhpSSV9Wuroz/4wbNzh6e8q3AAAQAElEQVSzZu+4btWqmszGhjvKbfjcmO0KKnL8zq2x/bKdx3gEMhNgFAIIIIAAAggggAACCCCAAAIIRFkgmA2fKFdIbggggAACZSewsLn1VyZyQ9CFuU2WV++QHbOCjptLvIfi024Vlb9lOXe2efaeLOcwHAEEEEAAAQQQyFyAkQgggAACCCCAAAKRFWDDJ7KXhsQQQACB0hMoaMYp63TrjbgeZHuBV6WvDjJgrrEaGxtHReyarOebXZxIJPj5njUcExBAAAEEEEAAAQQQQAABBDIVYBwCCERTgCeEonldyAoBBBBAYAKBeLX+2Q35reuBNs+81kAD5hHMTAfc9B2uZ9Nqj5499b3ZTGAsAgggELAA4RBAAAEEEEAAAQQQQAABBIogwIZPEdAre0mqRwABBIIRmNvYusk8XRdMtP9EMZFXD63pOu4/R4r3yPyRO10+f8o2A1P94IYrr5yU7TzGI4AAAggggAACCCAQnACREEAAAQQQQKDQAmz4FFqc9RBAAAEEghJw+yHJr7tgm10Psqn5/gej8LZoydkveswT/U22xalvR24eefTF2c4r6HgWQwABBBBAAAEEEEAAAQQQQACB8hegwoIKeAVdjcUQQAABBBAIUGBhy7J7Xbhu14Nurz9m78n7Bh0023gNDQ0ps9Qvs50nqvta0n971vOYgAACCCCAQIEFWA4BBBBAAAEEEEAAAQSCE2DDJzhLIiGAQLACREMgIwHfH+lyA+93Pch2hFRVvSLIgLnG8j29QUWGs5zvqdqi/v5EdZbzGI4AAggggAACCCCAAAIIFFqA9RBAAAEEAhJgwycgSMIggAACCBRH4KGqvbe4DZFrA169xlL+ewKOmVO4BYvaNprqddlP1hdWPVK7MPt5zEAgagLkgwACCCCAAAIIIIAAAggggAACmQiU9oZPJhUyBgEEEECgrAUaGxtHU+J9S0ySgRaq2rC+o2NmoDFzDJZKpT5jIn620z3T1g2JRDzbeYxHAAEEEEAAAQQiJ0BCCCCAAAIIIIAAAhMKsOEzIREDEEAAAQSiLrB58pZbReXXweZpU/wpcn6wMXOL9nDVjD+p2W+znW1mh22dPf3EbOcxHgEEEEAAAQQQQAABBBBAAIEoCpATAgiML8CGz/g+nEUAAQQQKAGBM89M7LRY9ekhpPrfa1d/bu8Q4mYV8pxzzkmK6oasJj0xeI+U+XOfeMhXBBBAoOwFKBABBBBAAAEEEEAAAQQQqGgBNnwq+vJXUvHUigAC5S4wv7Hln25TJIfPuhlbxkT3jWn1G8ceUZgzqmqeZz9zq+10PaumIgv6+/urs5rEYAQQQAABBBBAAAEESlaAxBFAAAEEEKhcATZ8KvfaUzkCCCBQdgIq/tdFLOtNkbEhbIrb9Hn72OcLd2bnSM3P3WrbXM+uqRxa/fA9Z2c3qYxHUxoCCCCAAAIIIIAAAggggAACCJS/QIVWyIZPhV54ykYAAQTKUSCVGr1JRG+XIG9qC4euWD4tyJC5xGpoaXlIRL8qudxUPn3dqlXTc5nKHAQQQAABBMpRgJoQQAABBBBAAAEEEChHATZ8yvGqUhMCCOQjwNwSFliw+CObzKwv4BJmynDs/IBj5hTOkqk1buKw61k1Z7LHSGxnfVaTGIwAAggggAACCCCAAAIIlLcA1SGAAAJlJ8CGT9ldUgpCAAEEKltgfnPbalX5vyAVTORjA1eu3CPImLnEmt9y0T/dvB+5nlVTEU+82LzrVq2qyWoigxGoaAGKRwABBBBAAAEEEEAAAQQQQKC0BNjwyeV6MQcBBBBAINICKZPPuk2a0aCSdLGqvB2puqDi5RXHbMDNT7qeVTOzOTu90RdkNYnBCCCAAAIIIIBApQtQPwIIIIAAAgggUEICbPiU0MUiVQQQQACBzARiqdRNKvLXzEZPPMrF8nyR+iuvTEx65uhiPLaq+K1u3Ydcz6q5GvbyYvbZrCYxGAEEEEAAAQQQQAABBBBAAAEEBAIESkWADZ9SuVLkiQACCCCQsUDdecvuN5NvZjwhg4Fuw+RNs3ZM3z+DoaEOGb1/821ugd+6nn0zmTt4edd/ZT+RGQgggAAC4whwCgEEEEAAAQQQQAABBBCIhAAbPpG4DCRRvgJUhgACxRIYnXXwZWKyPcD190iK/7EA4+UUqiGRGPFNvpLTZJEajaU+mONcpiGAAAIIIIAAAggggMCYApxAAAEEEECg+AJs+BT/GpABAggggEAIAg0NDSMm8kkX2nc9qPbegd6VhwQVLNc4e07Z+zoxuSOn+aqnXLO6g8/yyQkvj0lMRQABBBBAAAEEEEAAAQQQQACB8hcocoVs+BT5ArA8AggggEB4AqOe9x0X/W+uB9Ume5Y6K6hgucaZc+aZO011VS7zfZPDvZi8IZe5zEEAAQQQQACB/ASYjQACCCCAAAIIIIBAmAJs+ISpS2wEEEAgcwFGhiBw24NbHnBhB10PrPkic4cuX170z/Ix9W8WsU3ZFqYinvrysRvb26dmO5fxCCCAAAIIIIAAAggggAACeQsQAAEEEAhNgA2f0GgJjAACCCBQbIFEIuGbxr6koo8HlYuKvMSqYq8NKl6ucbZtS7+lm/46p/kqh++Y7vFZPjnhMQmBsAWIjwACCCCAAAIIIIAAAggggEBuAl5u05hVFAEWRQABBBDIWmD+ogvvNN8+6yb6rgfRaiwl51oiUdSfoWe0tW03s6tzLihl5/T3XToj5/lMRAABBBBAAAEEEAhPgMgIIIAAAggggEAOAkV9siqHfJmCAAIIIIBA1gIjOnmVivwm64ljTFCVt6ybPe1dY5wO/fBTC8TjOqQqDz71fXb3+qLqZPxt2c1hNAIIIIAAAggggAACCCCAAAIIFEqAdRDIVoANn2zFGI8AAgggUHICDc3N20z0ay7xlOsBNTv/1319VQEFyynM3MbWh8V0RU6TxaaISlNuc5mFAAIIIBABAVJAAAEEEEAAAQQQQAABBJ4lwIbPszj4BoFyEaAOBBB4rsCI6qCI3icB3Uzk6HtGtpwYULicwySTVf1u8kbXc2lzBnrb35TLROYggAACCCCAAAIIIIBAFATIAQEEEEAAgf8IsOHzHwseIYAAAgiUsUDDoiX3mcqlQZWoqnuqp/OCipdrnIdrah50m0/X5zpffa+9v7+/Otf5zIu4AOkhgAACCCCAAAIIIIAAAggggED5CzxZIRs+T0JwhwACCCBQ/gLzFy3tdVX+2fW8m5nbPvLkQ9/r7t4372B5BGhsbBz1RL/nQuT2dnVqR1Y/dNc73HwaAggggAACCJSpAGUhgAACCCCAAAIIVIaAVxllUiUCCCCAwBgCFXjYPi9ijwdSuMmMpO5cFUisPIIM26T0K3zuzzHEZBM9vb+/P5bjfKYhgAACCCCAAAIIIIAAAghEX4AMEUCgAgTY8KmAi0yJCCCAAAL/EfD90RtFvdv+cyTvR+8YurzruLyj5BGgobl5m5j/MRfCXM+6eSp1kx+8+8VZT2QCAgiUkQClIIAAAggggAACCCCAAAIIlLoAGz6lfgULkT9rIIAAAmUksGDxRzapb5cFVZIvVut7qXfteou3oILmEGdk1iHfMZHbc5gqbl6NH9Mv9ycSfJZPLoDMQQABBBBAAAEEykWAOhBAAAEEEECgpAXY8Cnpy0fyCCCAAAK5CNQ1t37Tzdvget5NRTxV/cCPvvqpmryD5RGgoaFhRESvlBxvJnZizexpJ403nXMIIIAAAggggAACCCCAAAIIIFD+AlRYugJs+JTutSNzBBBAAIE8BFRjHzeRzXmEeObUQ7bsnHrxMw8U47Ef825U0YdyXdtMPnhVe/vUXOczDwEEEECgIgQoEgEEEEAAAQQQQAABBCIqwIZPRC8MaSFQmgJkjUDpCHje5t+5H4I/DypjE73k2p6uw4KKl0ucBQ9s/r2J/TCXubvmqP+OaVPifJbPLgy+IIAAAggggAACCCCAwNgCnEEAAQQQiKKAe64rimmREwIIIIAAAuEKzG1MPJ5M+Z8V0VEJ4mZSnZTUOf39/bEgwuUSQxMJ3zPpVJWducwX0Smqqc9ceWViknBDIB8B5iKAAAIIIIAAAggggAACCCCAQMEFCr7hU/AKWRABBBBAAIExBBZsevwXIvadMU5nfVhFF9Q8eMc+WU8McMK85tZfmW/9uYfUk2bsqH1P7vOZiQACCCCAAAIIPCHAVwQQQAABBBBAAIHCCrDhU1hvVkMAAQQQeEIgEl/Tr4gZGUl+TFTuDSIhE3mxxLz3BRErnxgm9k0x2Z5bDIu5Xw4WXdvz+T1zm88sBBBAAAEEEEAAAQQQQAABBJ4W4AECCBRQwD2nU8DVWAoBBBBAAIGoCex/2H3iyzdcWm6/xn3Ns5noxev6Ljs4zzB5Ta+N+7e6TZ9f5xHkFcNS/fo85jMVAQQQyFCAYQgggAACCCCAAAIIIIAAAkEJsOETlCRxghcgIgIIIFAAgYaGhlTKZI1bKsdXxLiZz257mZ9ckkgkivYz9m2NF28Wk55np5XVd5M9sU/09fVVZTWLwQgggAACCCCAAAII5CLAHAQQQAABBBAIRKBoT0YFkj1BEEAAAQQQCEBg4eLWu0zs4wGE2hXCRN517L5TXrjrmyJ92bpDvieif5Ecbypy7L62tSnH6YFOIxgCCCCAAAIIIIAAAggggAACCJS/ABXmL8CGT/6GREAAAQQQKAOB+kWtX3Bl3Op63k1FD0ulpC7vQHkEOKOtbbuZLskjhJgvF1zTt3K/fGIwFwEEEEAAgYAECIMAAggggAACCCCAAAITCLDhMwEQpxFAoBQEyBGB/AVU1US8VWayI99oZqai3rJ1l7cfmm+sfOZX6fCvVOSnecQ4KJbyz8hjPlMRQAABBBBAAAEEEEAAgQAFCIUAAgggMJ4AGz7j6XAOAQQQQKCiBLYl49e6DZLbAyp6ph/z2gOKlVOYdzZd8piZfDunyU9Mion4vK3bExZ8LQUBckQAAQQQQAABBBBAAAEEEECgggUqZsOngq8xpSOAAAIIZChwekvLFhE9V0Ufl0Bu/pvW9XSeEEioHIKoiG1LVX/DTb3f9RybHjzY0/ElSyT4nSFHQaYhgAACCCCAQGEFWA0BBBBAAAEEEKhUAZ68qdQrT90IIIBAZQpMWHV989Kf+yZfmXBgRgN0r5TZ2RkNDWnQrk0sT/PN4X0D+854dUgpEhYBBBBAAAEEEEAAAQQQQACBoAWIh0BFCrDhU5GXnaIRQAABBMYTiFXpGnf+Htfzbeqp/PdA78pD8g2Uz/wZR2z9voj+RHK/TfZ8/9xf9/VV5R6CmQgggECUBMgFAQQQQAABBBBAAAEEECg/ATZ8yu+aUlG+AsxHAIGKF5h2/5a/m0l/EBAmMkn85LfW9/VNCSJeLjHmzEkkRewql8toLvOfmGN198qWVz7xmK8IIIAAAggggAACCJSBACUggAACCCBQZgJs+JTZOtzMwwAAEABJREFUBaUcBBBAAIH8BeYkEskpj9snxeQxCeCmqsenktvmBhAq5xAjseTV7of+ppwDiMyQlHwhUUGf5ZOHFVMRQAABBBBAAAEEEEAAAQQQQKBEBMopTffcTzmVQy0IIIAAAggEI/COtrbtIv65LtoO1/NtMRFrvKq9fWq+gXKd39B48eaUSauI5vEqH331UftMa2TTR7ghgAACCFSOAJUigAACCCCAAAIIIFAyAmz4lMylIlEEEIieABmVu8CITP2e26j5cSB1qryhttabE0isHIMkZx38HRO7Mcfpu6ap2dnH7D15313f8AUBBBBAAAEEEEAAAQQQqAgBikQAAQRKQ4ANn9K4TmSJAAIIIFAEgYbm5m0qsjqgpWOe2dfW9rbPDihe1mEaGhpSMdU+Ed0mud9eYfHYe3KfzkwEylCAkhBAAAEEEEAAAQQQQAABBBCIgAAbPiFfBMIjgAACCJS2wPSN2280k69KMLe9YuYt6+/vjwUTLvso8dGqW0Tsz9nPfHpGTHz5xFDP8iOePsIDBBBAAAEEEEAAAYEAAQQQQAABBBAotgAbPsW+AqyPAAIIIBBpgTmJRHJ02FvqkrzD9Vzb0/N8sXrvwbtf/PSBAj84paVlSyrlt5pI7p/lo7KHSezS61atqilw+iyHAAIIIIAAAggggAACCCCAQJQFyA2Bogqw4VNUfhZHAAEEECgFgVMvXPKoqXS7XJOu59VU5DAvJukNpLzi5DN54XkX/UxMvp5PDDf3zaOxZFE/k8jlQEMAAQRKTIB0EUAAAQQQQAABBBBAAIHwBNjwCc+WyAhkJ8BoBBCIrICq2PbR6i+5BO91Pe/mfvh+eLBnxevzDpRHAE/jK9z0+13PtU331W/bkEjEcw3APAQQQAABBBBAAAEEKlKAohFAAAEEEAhJwD3nFFJkwiKAAAIIIFBGAqe3tGxRXz6gItuDKEvF+9z6vo6ZUqRbVdK7U8y+m8/yzuLNm2fVnpdPDOY+X4AjCCCAAAIIIIAAAggggAACCCBQ/gJhVOiFEZSYCCCAAAIIlKNA3eLWW0Q0/UofyfdmIif4SXlHvnFynX9KS8vwiNjnc53/9DyVj6/9QvvLn/6eBwgggAACCCAQhAAxEEAAAQQQQAABBBDIWoANn6zJmIAAAggUW4D1iymQUv8KFbkjgBzipnJJf1fXXgHEyilEQ/NF/1Zfz3KTU67n2mZo3GtMJBL8TpGrIPMQQAABBBBAAAEEEEAAgd0KcBABBBDIToAnZ7LzYjQCCCCAQIUL/PHB7bf5Jt0BMRxZXZO6NKBYuYWZnLzaTfyJ67k2T9XOesVek/4r1wD/n707gY+rKhs//jx3kkmXtGXpgorgrry+svhHUXEryCLQTpLCoIBgZUmTaSNNJi2bekWBtlla0mbSAFpBURholhYKKFAVV0QW0df1fVVAgZatNF2SzNzzP1MWS5u2mSWZ7Tefc5KZe8/z3Od8L58PSZ/PTIhDAAEEEEAAAQQQQAABBBBAAIHCF2CHIy9Aw2fkjbkCAggggEABCbiu61WGwi0i5t7MbEvPWtOx9LjM5Eo+S+D8hZsdI9fZyHTe5TPWKSn5XvfSpfvZPAwEEEAAAQRSESAGAQQQQAABBBBAAAEE0hSg4ZMmIOEIIDAaAlwDgdwTUMd3qa3qX3amN1TGeyY+LxqN+tJLlHq0lvT1iuo9qWfYEfnf6vdCtiHGzxY7OPiCAAIIIIAAAggggAACyQsQgQACCCCQjgD/KJOOHrEIIIAAAkUr0H/AwY/YzXfZmYlRMeb5Jz+biUSp5JhR7W5Vv/9CEfN8KvGvx6g597+nlr3t9dc8QSDTAuRDAAEEEEAAAQQQQAABBBBAAIE9ChRMw2ePO+QEAggggAACIyAQDAbj/jH+b6jI/2UivWfMdbdHWt+RiVyp5AicP+/fqs5yG5vOR7u9p1RLv2lzMBBAAAEEEEAAgRETIDECCCCAAAIIIIDA0AI0fIZ24SgCCCCAQH4KjGrVp3ypbqP6fGfYi26zM93xphLxGrP50W4xx0n8LZ8n09mIMfL5rkjzeenkIBYBBBBAAAEEEEAAAQQQQACBfQhwGgEEhhCg4TMECocQQAABBBAYrsD2pzf93q79tp3GznRHxZjnnvxQuklSjZ9VPf9pI/oVGz9oZ8pDReav6Vx2SMoJCEQAAQTSFiABAggggAACCCCAAAIIIFB8AjR8iu+es2MEEEAAgQwKBF13wImbFpsyrSaJjU+MgzwxKxJPsjUHJ//qB6LSm871bcPnA148dk46OYhFAAEEEEAAAQQQQCBtARIggAACCCBQZAI0fIrshrNdBBBAAIHMC8yc1/h3UedzIrpV0n/8v572psuz9dFuweBtceN5V9ltPGNnqiPx88VXe1YsOybVBKMRxzUQQAABBBBAAAEEEEAAAQQQQKDwBYpph4l/kCmm/bJXBBBAAAEERkSgoqa+W8V8LyPJ1blo3PP/PCwjuVJIst/Grb83oqtSCN05pEx98cjazubJOx/kOQIIIIAAAjkmQDkIIIAAAggggAACCBSMAA2fgrmVbAQBBDIvQEYEkhOIm/gyG/F3O9Mc5pCYOHXZepfPdNeNDW7Xb9hN/M3OlIcx5vB4TC5IOQGBCCCAAAIIIIAAAggggMCoCHARBBBAoDAEaPgUxn1kFwgggAACOSBQFVr4RzHepZkoRY2ZXfr8E2dlIlcqOYL19ds8NdUq8mIq8a/GlIijF3e1L87au5VerYNvCKQnQDQCCCCAAAIIIIAAAggggAACeSBAwyfNm0Q4AggggAACOwtUhBbcKsZcb48ZO1MeNrjENluuXnN909tTTpJm4JjBsp/bOu5IK40x03zquzkadf1p5SEYAQQQQAABBBDIsgCXRwABBBBAAAEEcl2Ahk+u3yHqQwABBBDIB4E31GjiZrFtlKT1cWiJhMbIm71BbUg8z8Y8pa6uf8AMXmmv/ZKdKQ9rcYR/47g647r83JGyIoEIIIAAAggggAACCCCAAAI5IEAJCOS0AP/wktO3h+IQQAABBPJRoLJuwf/a/8FelW7tKmLTSE1XZ/PH082VanwwdOnf4mLOSTX+1Ti7D6ehe7J//1df8w0BBBAoUAG2hQACCCCAAAIIIIAAAghkT8D+A0z2Ls6VESgqATaLAAJFJRCoDd+oIjdmYNOOE5ObVrctPjgDuVJKEZ986N2i8l0bbOxMbagc5Dilt/QuXjwhtQREIYAAAggggAACCCCQJwKUiQACCCCAQJYEaPhkCZ7LIoAAAggUvoAx+hW7y9/bmdZQR9/mlPrC6123RLLwCAaDcRVdai+92c40hn7GlPtCaSQoiFA2gQACCCCAAAIIIIAAAggggAAChS+QjR3S8MmGOtdEAAEEECgKgYpQw5NitMluNmZnysPYzpEaOW/zlPKjUk6SZmCgpuEREXO1iMYljYcRmdMbaTo8jRSEIoAAAgggUAgC7AEBBBBAAAEEEEAAgYwL0PDJOCkJEUAAgXQFiC8kgYNLyn9g93ODnemO/TyVaO+yq6almyjV+EkbtrTYpk9XqvGJOFU5VIwsTjxnIoAAAggggAACCCCAAALFLcDuEUAAgcwK0PDJrCfZEEAAAQQQeIPA0dXVgwf7JtTZg4/Yme54m/jLvrJ+fXY+2m2668bUcZaI6tPpbMSontwbaWqMRs/wpZOHWAQKXoANIoAAAggggAACCCCAAAIIIJCEAA2fJLByaSm1IIAAAgjkj0Ci6SMql4qYrelWbVQ+/9Ifxn4q3Typxs985uWHjWdaUo1/Lc6Ihsue/dBHXnvNdwQQQAABBBBAAIGhBTiKAAIIIIAAAggMV4CGz3ClWIcAAggggEAaAhU14XuMOCtV1aSRxvaM5ADH8a3sXrp0PxFJK1Uqweq6XmUo3GIbT/enEr9TzFRT4nzFdV1+FtkJhacIIIAAAggggAACCCCAAAIIDCHAIQSGJcA/sgyLiUUIIIAAAgikL/DShs2XG8+7K91MRuRdUhZftrazc1y6uVKNN55vror+X6rxO+KMnHTktPJv2KZPyY7XfEEAAQQQSFGAMAQQQAABBBBAAAEEEEBAhIYP/xUgUOgC7A8BBHJGYLbrbjeqX7UFpfU3cGy8qJgz4t6WkxLPszEray/+k1FZkva1jV581JsmZW0faddPAgQQQAABBBBAAAEEckWAOhBAAAEEil6Ahk/R/ycAAAIIIIDAaApU1oZ/K6JXiUjMzjSGjhNjrlrdufRNaSRJOTTx0XT+wdLv2ARr7ExjmHEmHr8s2rloUhpJCB2GAEsQQAABBBBAAAEEEEAAAQQQQKCwBRINn8LeIbtDAAEEEEAgxwQO9pVfZ0Q60i/LHOaLx2+Kuq4//VzJZzilrq7fp06tqjyWfPQbIj5SFi+59g1HeIEAAggggAACIyFATgQQQAABBBBAAIECFqDhU8A3l60hgAACyQmwerQEjq6uHvR8vmvs9X5tZ7rjU2OmllfbBpKmmyiV+Bk19f8SY5pFZSCV+FdjHFv/eT2Rptmu6/KzyasofEMAAQQQQAABBBBAAAEERkaArAggUKgC/KNKod5Z9oUAAgggkNMCVRdd/Iw68hVb5DY70xmlnsglq1cueVc6SdKJ7d/uWy2eWZVOjkSsEb306KkT35Z4zkQAgSwKcGkEEEAAAQQQQAABBBBAAIG8FKDhk5e3LXtFc2UEEEAAgcwIqKoJzAn/yOiOpk88zaxvLolr782Ra/ZPM09K4cH6+m0VocY5NvhXdqY8VOTdcfFWPNTZWZpyEgIRQAABBBBAAAEEMiJAEgQQQAABBBDIPwEaPvl3z6gYAQQQQKCABAa3ORFVWa22AZTWtlQPGy+ll65raytLK8/wgodcZdRcak+8aGfKw4h89imvb0EnTZ+UDQlEAAEEEEAAAQQQQAABBBBAIEMCpMkzARo+eXbDKBcBBBBAoLAEEu+OMZ6GjTGD6e5MReZtc+LvTzdPqvEVNY0/sU2fpanGvx5nTOOUwZePfv01TxBAAAEEclSAshBAAAEEEEAAAQQQQCCXBGj45NLdoBYECkmAvSCAwLAFKkINT9pGyUk24Hk7Ux5GZIzPia+OLm96e8pJ0gi0DSdTWdP4DZviVjs9O1Mdk9TRZV0dTVNTTUAcAggggAACCCCAAAIIjJIAl0EAAQQQyBkBGj45cysoBAEEEECgmAVso+THKs5iEYnZmc54W6lP2+65qWl8OknSiXXiOz7a7U/p5LDNow874qzi7/mko5gbsVSBAAIIIIAAAggggAACCCCAAAKjI5DNhs/o7JCrIIAAAgggkCcCpbGSThHz43TLtc2SE7f26ZfSzZNq/Mx5jX83nvm6GNmSao4dccYc/6/45vN3POcLAggggAACCOSzALUjgAACCCCAAAIIjIIADZ9RQOYSCCCAAAJ7E+DcawKn1NW9PKD9X7SvH7EzneG3TZ8reyJNn3Tsu84AABAASURBVEknSTqxg1MPXa1mR9MnnXcslRmRr63J0kfUpbN/YhFAAAEEEEAAAQQQQAABBHYV4DUCCIy0AA2fkRYmPwIIIIAAAkkIBGuu+JeI82UbssHOdMZ+Irpi9YrmQyULj2AwGJct3kpRuSPNyx/k+fR+/p5PmoqEI5APAtSIAAIIIIAAAggggAACCCCQlgANn7T4CB4tAa6DAAIIFJPAwb7xv/I805yBPb+rxNGvZCBPSikCCxdu9tR8RUVsEyulFK8FHapG3GjU9b92gO8IIIAAAggggAAChSnArhBAAAEEEEAgdQEaPqnbEYkAAggggMCICBxdXT1YNbexyah8W9W2OlK/is+IOb8n0jrbiNi+i4z6o6qm8ffixCtEzNY0Lq4qWlO2cdxxaeQgFAEEEEAAAQQQQAABBBBAAAEE8kOAKlMUoOGTIhxhCCCAAAIIjLTA2FKnUYz5efrXMW09keaTbR61c9THI89se1hErxKRQTtTHkadW3rbF09POQGBCCCAAAIFIsA2EEAAAQQQQAABBBBAYCgBGj5DqXAMAQTyV4DKESgggZMvqH9hMC4Xpr8lU247PYuinYsmpp8r+Qyu63oDk/uaRcyvko9+Q8Qk45QsWd259E1vOMoLBBBAAAEEEEAAAQQQKD4BdowAAgggsJsADZ/dSDiAAAIIIIBA7gicPi/8JxUN2IpetDOdcbg/XnL9TU1N49NJkmpsMOgOeN7YSlV9ONUcO+KMObokHnejra1jd7zmCwJ7EOAwAggggAACCCCAAAIIIIAAAsUmUIwNn2K7x+wXAQQQQCDPBWbW1K81xrTZbcTtTGecMWm8c3k0GvWlkyTV2Kq5c5+Pm3i9jd9gZ8rDiJ4/Zqy5POUEBCKAAAIIIIBAsQiwTwQQQAABBBBAoKgEaPgU1e1mswgggAAC/xHIn2eqagZlXLOI3idpPoyYOaUb/3F8mmlSDq+qXfATUb1KRbannESMz/NMqKuj5bTUcxCJAAIIIIAAAggggAACCCBQHALsEoHiEaDhUzz3mp0igAACCOSxQDAU6vP5zNmi8tM0t7G/Or7ru9qXHpZmnpTDJz27OSJiltoEqb9jSWU/x5jFPe3ffKvNw0AAAQRSFyASAQQQQAABBBBAAAEEECgQARo+BXIj2cbICJAVAQQQyCWBGdXh5+Jxb75t+jyVVl3GHOLT+I29y66allaeFIOnu27M6y9ZYsPvtTOd8V+iY+6ILlo0KZ0kxCKAAAIIIIAAAggggAACCCCAAAKFIEDDpxDuIntAAAEEECgagVlzFzxsYt7FdsMDdqY8jMiRxj8ma38Hp3L+/JdUSr5sN/AXO9MZ7/dPLLncdd2R/JkmnfqIRQABBBBAAAEEEEAAAQQQQACB/BDI+yr5x5G8v4VsAAEEEECg2AQq5y1Y7YlcZPc9aGeqo1TEhLojTYnmUao50ooL1F78Zx2IzzTGbEwjkc/GNhwxbUKl/c5AAAEEEEBgBAVIjQACCCCAAAIIIIBAbgvQ8Mnt+0N1CCCQLwLUicAoC+xvxq42Kt9N87KOilzVG2mZafPYp/brKI/+Nz/0N3vhr4ho6n/PR8RRY77b3b7kRNs8UuGBAAIIIIAAAggggAACCIyUAHkRQACBHBag4ZPDN4fSEEAAAQQQ2JPA9FCob9CJ1RuRn+1pzfCO6zgj3pKuFVcfMLz1mV0VDN4WP7hk4rdVvavTzDzWcXxLbos0ZeXvEqVZO+EFJMBWEEAAAQQQQAABBBBAAAEEEMiWAA2f0ZPnSggggAACCGRUIFh9ySbP5wvaps9j6SXW9zqO/851326bkl6e1KKPrq4eDNQ0flXE3GIzeHamNIwxR/jVua5rxYoDU0pAEAIIIIAAAgggkBkBsiCAAAIIIIAAAlkRoOGTFXYuigACCCBQvAKZ3XnVRfOfUaO1Nms6f8/HhssxA9sHFt/U1DQ+8SIb019a1miv+zs70xkzfM72q9d2uuPSSUIsAggggAACCCCAAAIIIIAAAukJEI3A6AvQ8Bl9c66IAAIIIIBAxgRUxVSEGn6hoqfbpH12pjPOmTBez3ZdNys/H5xyYd1TMXFm2Q08aWfKw4icF49PPDPlBAQigAACoyHANRBAAAEEEEAAAQQQQACBDAtk5R90MrwH0iFQcAJsCAEEEEhWIFDbsMaI+YqN22ZnqqPU/mDQ+sFp5WenmiDduNNr6//P8+R8FflXGrnKVLxl3ZHmijRyEIoAAggggAACCCCAwIgLcAEEEEAAAQQyKWD/XSeT6ciFAAIIIIAAAtkSGJx8aESN3KVqv6ZYhBEZ7xlZ1N2+9MgUU6QdVjU3/CMx0mQTpf73fEQm2qZR5+0d1xxl8+TroG4EEEAAAQQQQAABBBBAAAEEECh8gYztkIZPxihJhAACCCCAQHYFgsHgQGncf5YRs9pWknKzxMa+WTW+srvjmrfZ51kZgVD4Wnvhb9qZzjuWppaY0taujqapNg8DAQQQQACBPBWgbAQQQAABBBBAAAEEhidAw2d4TqxCAAEEclOAqhDYReCUurp+jcW/bA8/Zmc64xj1Sm+OtrYekE6SdGIHtjuLVDTRvEojjX7KZ/TmVa47Jo0khCKAAAIIIIAAAggggAAC2RXg6ggggMAwBGj4DAOJJQgggAACCOSTQGDewn9L3DnPiPw1rbpVPlI2xlz5UGdnaVp5UgwO1tdvi3v9F9vwe+1McZjE59sdv/+U8YuztY8UCycMgaQEWIwAAggggAACCCCAAAIIIIAADZ/C/2+AHSKAAAIIFKFAxbz6x514/CwR80Qa23eMmAv/Fd+yMI0caYVWzb3s+YFY4mPq5P40Eqmoc8G/vJe/mEYOQhFAAAEEEEAAgVwXoD4EEEAAAQQQKHIBGj5F/h8A20cAAQQQKFyBwLyFD6nqZbbps1Uk5X36bdPH7W5vOt913az83BCsq9voGbnE7uAfdqY4zDhj9Lqe9pYzTZb2kWLhhCGAAAIIIIAAAggggAACCCCQhABLi1kgK/9wU8zg7B0BBBBAAIHRFOg/8JBbxDhfUpEtqV/X+Gzj6MrDDxp/TOo50oucFQr/Ju55s2yW5+xMfahZfMe0iUennoBIBBBAIM8FKB8BBBBAAAEEEEAAAQQKVoCGT8HeWjaGQPICRCCAQOEJBIPBeKC2PiqqTWIklsYO3+x4+sOujqb/TiNHWqGz5i54WMUkPpZtUxqJDrWNo1vu7lz6pjRyEIoAAggggAACCCCAQF4LUDwCCCCAQGEK0PApzPvKrhBAAAEEEHhdQFXNpj6v2X6//vWDqT0pdzxnVXfH0relFp5+VP/6B++2P7x8xWYasDO1ofL2/ng82tPe8tbUEhR8FBtEAAEEEEAAAQQQQAABBBBAAIE8FLD/ZpJM1axFAAEEEEAAgXwUOLexcUv/5LfOE6NpNX3Ukf+nJn5rtgyCt90Wn1HTsMITucjWMGhnakP1WFHTlFowUQgggAACCBSDAHtEAAEEEEAAAQQQyDcBGj75dseoFwEEEMgFAWrIS4HEx7upF3ONkR+lugFjjNrYD/dEmn4QbW09wD4f9aGqZn8zdrUY05HqxV/dx5k9keYV0fb28lTzEIcAAggggAACCCCAAAIIFLQAm0MAgbwSoOGTV7eLYhFAAAEEEEhPIDBv4b+3bZOzjOhP0spk9PTSMSacVo40gqeHQn2+ki2XGpHlaaRJhFaX6dZ5rzaAEq+ZCCCQhABLEUAAAQQQQAABBBBAAAEEckeAhk/u3ItCq4T9IIAAAgjkqMBZ4fBzcU9DYuQPKZeoUqJiLu1ub26IRl1/ynnSCJxR7W7dvMVcalP0iKrt/dhnyY8So+qu6Vh2SjQa9SUfTgQCCCCAAAIIIFD0AgAggAACCCCAQI4I0PDJkRtBGQgggAACCIymwKzQ/P/x+fRse81/2pnysH2WK/0byy/Y8ztkUk49rMDE3yYaMF6NGnP3sAKGWmTEbyT+g7Lnn/jcUKc5hgACCCCAAAIIIIAAAggggAAC+xLgfC4I0PDJhbtADQgggAACCIyygNpOzYw5DY95WnqavfQGO1McOk7FuD0dLR/MVtMnGFrwjGyOn6kij9hNpPpOnwnGyDe625ceaXMwEEAAAQQyLUA+BBBAAAEEEEAAAQQQGHEBGj4jTswFEEBgXwKcRwCB7An87tkX/8dRPd9WsNnOlIZRnWIDf9gbaU40j+zT0R+BhQs3m5icY5s+j6Zx9berxru625fQ9EkDkVAEEEAAAQQQQAABBPYkwHEEEEAAgZEVoOEzsr5kRwABBBBAIKcFXNf1ZtY03CHx2LEi2icpPmyj5QDb+GmJLlt0SIop0g6rqAv/j2yOf8om+oudqY63qzjfW9O5LGv7kOJ9sHMEEEAAAQQQQAABBBBAAAEEEEhDIE8aPmnskFAEEEAAAQQQ2KdAxbxLHvfENEp6TZ93+/2l627vaDlKsvRIvNNHYt4FovK/KZeg8n4vHu/sWnH1gSnnIBABBBBAAAEEUhQgDAEEEEAAAQQQQCBVARo+qcoRhwACCCAw+gJccUQF9t/Qd4Nt+sxN7yLm/SXGdNzZ3n5QenlSjw7Ma/yZDuoZYmRL6lnMSY5T1h1tbT0g9RxEIoAAAggggAACCCCAAAIIpCRAEAIIpCRAwyclNoIQQAABBBAoPIHprhurqg3faDytNSIpf7yblTlmULfdsLpt8cH2+agPVTWBuoZHTDx+nL343+xMZaiIOdY/xlv8UGdnaSoJiEEAgZETIDMCCCCAAAIIIIAAAggggMDuAjR8djfhSH4LUD0CCCCAQJoCL43fvMp2OzrSTHNqSYnvumjnoklp5kk5/LEXtj0kRs+T1N/pk/g56dx/xV6+YV1bW1nKhRCIAAIIIIAAAgggMBIC5EQAAQQQQACBXQQS/5CxyyFeIoAAAggggEAxC8ye7W6vqA0vsI2SpSJme6oWRuQkf6x08drOznGp5kg9TsR1Xa8i1PAL48k5RuSFFHP5jeoXBn0DV3XyTp8UCQlDAAEEEEAAAQQQQAABBBBAYKQEyLuzAA2fnTV4jgACCCCAAAKvCwz0O5cbo22vH0j+iSNqLojHN3/njsg1+ycfnpmIirkNvY46IRHdKqk91Dhy0ZTBly9OLZwoBBBAAIGsCXBhBBBAAAEEEEAAAQSKSMApor2yVQQQQOANArxAAIG9CwTr67dVhsIL7ap2OwftTGX4RPT0mPgXZusdMjv+pk9N/S2ep2fZWlJr+hiZ4Di6pKe9JRyNRu2ehAcCCCCAAAIIIIAAAgjkiQBlIoAAAsUiQMOnWO40+0QAAQQQQCBFgcCGvjpPtNWGp9j0MSrizZs2uPmKqOv6bZ6sjKq59b22+XO+kZQ/3k2MmitKNzxhG0dZ2QIXHRkBsiKAAAIIIIAAAggggAACCCBQEAI0fPZ6GzmJAAIIIIAAAuq6XuWGzZdZievsTHHoOHHkK/5BtUaFAAAQAElEQVSp5d/M5jtkZs6Zf6vE5fwUNyG2czVJHVnVvbz5s6nmIA4BBBBAAAEEclGAmhBAAAEEEEAAgfwXoOGT//eQHSCAAAIIjLQA+SXR9KmoDc8V1estR8zOVIbtl2jIv/HJS7L58W6V88I9xjNn2g1ssDOV4XN8emPPiqbKVIKJQQABBBBAAAEEEEAAAQQQyFEBykIgzwVo+OT5DaR8BBBAAAEERlOgxIxdaK93l50pDjNOHPPVafFNV6SYICNhg1MPXS3GF0o1mREzxTa/vt0dWco7fVJFJA6BPBSgZAQQQAABBBBAAAEEEEAglwVo+OTy3aG2fBKgVgQQQKAoBE6rrX1xYLtzpop02Q2n9jd9jPhFnC93tbeca3NkZQSDwXhFaP7tamSWEd2YUhEq+zkSv61rRctpNl7tZCCAAAIIIIAAAggUvgA7RAABBBBAIGcFaPjk7K2hMAQQQAABBHJTIFhfvy3uDVwkqt9Jo8JJjmOW9kaa56SRI+3Q/h//utc2feapSCyVZEZkvDrm2t7I4ve8Es9XBBBAAAEEEEAAAQQQQAABBBAofIHc3CENn9y8L1SFAAIIIIBATgtUzb3s+YqahovEaJsttN/O5IeRA0Ql0fQ5zzZObM8l+RTpRgRvuy1eEWq4VRzno7aWp1LJZwt/hxHfQ70dLUcZY+zLVLIQgwACCCBQUAJsBgEEEEAAAQQQQACBLAjQ8MkCOpdEAIHiFmD3CBSSwMCUzY0iukxEPDuTHsbIGBFt6mlv+pJk8RGYU/+QZ7xzUm362NLLjfFuXrOy9Uj7nIEAAggggAACCCCAAAIICAQIIIDAaAvQ8Bltca6HAAIIIIBAAQkEg+5ARW3DJUa0024rtaaPmCmqekN3e9P5RmzLRbLzqKpd8BM18c/Yq2+yM4WhhxljftobWfzeFIIJKT4BdowAAggggAACCCCAAAIIIIBARgVo+GSUM1PJyIMAAggggEB+CVTWNtSKaJOIpPbxbjbQUeeaNZHmc+3TrI1A7cI/S8ybYdtO/5tiEeVGfL09K5qOSTGeMAQQQAABBBAoKgE2iwACCCCAAAIIZE6Ahk/mLMmEAAIIIIBAZgXyLNvA5M1fFbPjnT4pVW7ETLGNlpW9keY5KSXIUFBgXuPP4oPxT6vI31JM+V51tOf2a5e8O8V4whBAAAEEEEAAAQQQQAABBIpJgL0ikCEBGj4ZgiQNAggggAACxS6w4+PdQg1fFiOLjEhfKh6Jv+ljVK7qam/J2jt9VNXMqlv4VMyTz9imz69S2ofIQSWleu+aSMtHUoknBgEEENhZgOcIIIAAAggggAACCCCAwHAEaPgMR4k1COSuAJUhgAACOSfw4ri+r9uiGuxMbRg5wFHT1tvRUpNagsxEzZobfkKM8wXb9PlbKhlVnbd6Yr7X2976rlTiiUEAAQQQQAABBBBAYCcBniKAAAIIILBPARo++yRiAQIIIIAAAggkIzB7tru9sjZ8nefp+TbuZTtTGZOMkSU97S3nRqNRXyoJMhBjAqH6v03c0HeYUe21+Tw7hz2MMbZXJO8U9R5c3d78oVdfDzs+uYWsRgABBBBAAAEEEEAAAQQQQACBwhfY+w5p+Ozdh7MIIIAAAgggkKLAIaXl3xWjC1IMt2Gm3DZLWv3PPXFN1HX99kBWxnTXjTmxWK29+F12Jj2MyP4+1Rt7Vyz+76SDCUAAAQQQQCAZAdYigAACCCCAAAIIFLUADZ+ivv1sHgEEikmAvSIw2gJHV1cPVoQaOlX1g/baL9iZwtADbVDYP7n88s7OzlL7PCsjMG/hvytqw6cZIy22gLidSQ5zmPhKftEbaTrcdV1+/kpSj+UIIIAAAggggAACCCAwfAFWIoBA8QrwDw7Fe+/ZOQIIIIAAAqMiEKhpeFSM+aK9WIpNH1FxTHja4OYrsvlOH7GP8pIJ31DR5fbpgJ3JjnIjztoPTp44I9lA1iOQQQFSIYAAAggggAACCCCAAAIIFKgADZ8CvbGpbYsoBBBAAAEERkTAVIQa71DVz6iYJ1K7go4TR77in1r+zSz+TR85obp608wNmxs8kYvsPgbtTHKYQzzHu717efNnkwxkOQIIIIAAAgggkEEBUiGAAAIIIIBAIQrQ8CnEu8qeEEAAAQQQSEdgZGJNoKbhEU+0yqb/HztTGSqiIf9zT1wb7Vw0SbL0UNf1YpP7fmCMqRcxL6ZQRonj0xt7VjRVphBLCAIIIIAAAggggAACCCCAAAKZESBLwQnQ8Cm4W8qGEEAAAQQQyF2Bitrww2qcgKg+lFqVZpyNqymLl3x7XVvbRPs8KyMYdAce27glop5W2AKetzOpYcRMsQbf7o4s5Z0+ScmxGAEERlOAayGAAAIIIIAAAggggEB+CdDwya/7RbUI5IoAdSCAAAIpCaiICYTq/xZ3nJlG5P6Ukog4nkjFQMnA4u5VS/dLMUfaYa7rejNDDQ846gvabSX/UXUq+6nEenrbm79sjFHhgQACCCCAAAIIIIBA7glQEQIIIIBAHgnQ8Mmjm0WpCCCAAAIIFIrArOr5Tw8OxGbb/ay0M+lhuyP2Zxi9ULbFV3d3LH1b0gkyFKCqZmbN/Ps9lVNFzAPJp1W/bfVc2dvRvCD52FyIoAYEEEAAAQQQQAABBBBAAAEEEMgVAfuPJSNUCmkRQAABBBBAAIG9CAQvvuSJFzf0zbdLVtkZtzPJYXy28XOcmvjKu29oPSDJ4Iwur6pp/L0Tl/OMyIM2sWdnMmOiiC7qjTQ1rmtrKxMeCCCAAAII5JsA9SKAAAIIIIAAAgjkhAANn5y4DRSBAAIIFK4AO0NgbwKzXXd7X8x/sRjzNdssGdzb2r2cO6l/wHStibR8ZC9rRvzUzHmNf5exvpPUyHdS24te2e/rb6bpM+K3igsggAACCCCAAAIIIIDACAiQEgEEsi9Awyf794AKEEAAAQQQKGqBc+rqXq4INV6lngmL6FZJ4WHEfCou5qboskWHpBCesZDK2fNfmrixr9oRc4NNmtQ7fWyTaIyqzh30DURo+lg9RqEJsB8EEEAAAQQQQAABBBBAAIERFqDhM8LApB+OAGsQQAABBBAQGZh6aLsa72IR/Zek8FCRd/v9pet6Iy0zXdfN2s8401031r9hy8VGtMGIvJDsVozKFwZLB1Z1rbj6wGRjWY8AAggggAACCOS2ANUhgAACCCCAwEgKZO0fQ0ZyU+RGAAEEEEAAgfwTCAaD8Zm14RtUnTNt9c/YmcIw7/eMd8MRB47/ZArBGQsJuu5AxYbNbcY4Z6eQtNQY+ZzjlHVHW7P7t4lSqJ0QBBBAAAEEEEAAAQQQQAABBPYuwNkRE6DhM2K0JEYAAQQQQACBZAVU1QRq5v88bmSmjf2dnUkPm2OKlmhPd3vT+dn8aDR1Xa8qVH+3I/pRMfJ4khtREfMJf5nX3d2x9G1JxrIcAQQQyGsBikcAAQQQQAABBBBAAIHUBJzUwohCAAEEsiLARRFAoEgEZoXCvzHqC9iux10pbdnIJFVnWb9v4MspxWcwaGZtw69UnCoR+a2dyQ2VT6qJ372mvflDyQWyGgEEEEAAAQQQQACBvBageAQQQACBFARo+KSARggCCCCAAAIIjLxAZc38f8TVfFGMWWdEBpO/oilXlcXd7U1utHPRpOTjMxcRCNX/bewW8ymb8bYU9vJeT+UHt3e0HGWy+LeJbO05NCgFAQQQQAABBBBAAAEEEEAAAQR2FSi8hs+uO+Q1AggggAACCOStQFVN44YXN26ZJaLNojIgKTxU9av+eGnb2k53XArhGQs5qbFxS4kMVqsn16SQ9J0lIj29U8efR9MnBT1CEEAAAQQKU4BdIYAAAggggAACCLxBgIbPGzh4gQACCCBQKALso3AEZrvu9srahsuMyFdEdKsk/1ARc248PuGO3mXLpiUfnrmI02ovfbFibvhrasQ2sWRTUpmNOUREl/ZOmXCG67q2/yM8EEAAAQQQQAABBBBAAIGiFwAAAQT+I0DD5z8WPEMAAQQQQACBHBaorAkvUWO+IMY8lVqZZrqUxaK9kabDU4vPXFT/lEN6VczZNuNf7ExmTDJqvnvElPGXRtvd8mQCWYtAkQqwbQQQQAABBBBAAAEEEECgaARo+BTNrWajuwtwBAEEEEAg3wQCoXB3zMRPFiPPpla7fkJEf9zb3vouyeIjGAzGA7WNd3rewMeMMQ8nU4qKlKqqWyoTUvlouGQuxVoEEEAAAQQQQKBABNgGAggggAACxSHgFMc22SUCCCCAAAIIFIiAOX3uJX8oUedjdj/32JnUsM0VNSL7G8db3xtpOWNHcBa/VM297HlfSWmlbWB9xzZyYkmU4qiaud3tzbeu6Vx2SBJxLEUAAQQQQAABBBBAAAEEEECgOAWKYNc0fIrgJrNFBBBAAAEECk3gtNr6/zNjfZ8TMatS2puRg42Y63sizZelFJ/BoJnVFz/hj/vneEYut2kH7Bz2UJUzvHjs1mhr6wHDDmIhAggggMCQAhxEAAEEEEAAAQQQQCDfBWj45PsdpH4EEBgNAa6BAAI5KFA5e/5LA5MPnaMi37TlJdUosesTY5IRcXvbW65c19ZWljiQrXlKXV1/ZSi8xDaw5tga/mHncIfdvnykbIz3UG/H0mNd1+Vnu+HKsQ4BBBBAAAEEEEAAgd0FOIIAAgjktQD/KJDXt4/iEUAAAQQQKG6BYDA4UBrzf1OMOd1KPGdnUsN2S0qNmgWDJYO3r+1snpxU8AgsrqhtXBU3ErSpf2fnsIdtXL3dmPjNH5g64bRhB7EwBQFCEEAAAQQQQAABBBBAAAEEEMhdARo+mbo35EEAAQQQQACBrAgk3h1TEWpcK55JNDv+kkIRZUbMaV5cftDdcc3bUojPaMisUPg33vgxx4mR+2ziZN65dKhPTG9XpHlOtt+xZOtmIIAAAgggULgC7AwBBBBAAAEEEMhRARo+OXpjKAsBBBBAID8FqDp7AhVzG3/tlegMW8FaEY1Lkg8j8hk1pV09kdbPJBma8eVV58193gz4ThdPvp5scvvDXfNgSf+i9atWjUk2lvUIIIAAAggggAACCCCAAALDE2AVArkoYP9NIBfLoiYEEEAAAQQQQCB5gaqLGv6iZfGzHTE32WjPzmTHUSLx6Nr21hONMZpscCbXV86f/1LF3PDV6sQ/ZPP22TncMd6IXrxp63PdN0eu2X+4QaxDAIGMCpAMAQQQQAABBBBAAAEEEBh1ARo+o07OBRFAAAEEEEBgJAUC5y/cvH1D3xxjvEuNmI3JX0v3j6v3gzUdzZdE29vLk4/PbERgzsKHHNETRPQBSeahelK5lt7adW3TfycTxloEEEAAAQQQQACBTAmQBwEEEEAAgdEVcEb3clwNAQQQQAABBBAYeYGg6w48tnFrs6p+wV5ts53JjgOM6JV+3bYo2cBhr09i4czahl8NmDGnGKPfsmFxO4cz1Bg5QUv1G6LF7AAAEABJREFUJ70rm23DaDghrEEAAQQQQAABBBBAAAEEEEAAgYwKjGIyGj6jiM2lEEAAAQQQQGD0BFzX9SpqwvcYn3eUiq63V072I95KbEyoO9J8X9eKlvfY52pn1kYwFOrbvNX7shq5LJl3LtmiDzCe3LSmo/kL69rayrK2AS6MAAIIIDCkAAcRQAABBBBAAAEEEMiUAA2fTEmSBwEEEMi8ABkRQCADApXVC/43rt7nVHRVKulU5DjHMbesXrHkqFTiMxlzbmPjlv4ph7So+GYZI3+R4T8O8jzp7C/pv3r9KnfM8MNYiQACCCCAAAIIIIAAAqMgwCUQQACBjAjQ8MkII0kQQAABBBBAIJcFqmoaNwRqGy5QcRaIyguS/OOoEsf5aXdHU/Chzs7S5MMzFxEMBuMVtfUP+Dxzsoj+XMQMyHAeKmNVtH7TtvLI2o7WtwwnhDW5IkAdCCCAAAIIIIAAAggggAACCOxbgIbPvo1yewXVIYAAAggggMCwBfo3vHytes7ZIvpHSfJhRMar0ZVPen2XrV+1Kuvvkpk5r/HvY7d4J4no1+0c7t/1EfuYHTde15oVSz9onzMQQAABBBBAIF8EqBMBBBBAAAEEENiHAA2ffQBxGgEEEEAAgXwQoMbhCQRddyAQqr877nOOlx3vjhHbx5FkHvurMe6mrc99v3vp0v2SCRyJtSc1Nm6pqA1fbX+g+7iKPGOvMdz9fNhz4j/qaVvyifWum/hbRTaUgQACCCCAAAIIIIAAAgggkOsC1IfA3gTsvw/s7TTnEEAAAQQQQACBwhOYVT3/6Xi/c4aIttjZJ8k+VANSFl/dG1l2eLKhI7F+Zm3Dr+ImfpyI6Uoi/wFS4tz50rQJlxrX5WfCJOBYikAOC1AaAggggAACCCCAAAIIFLEAv9wX8c1n68UmwH4RQAABBHYWmDV//tMDk996iYhXZ4/H7UxmOCpynJHYA92R5s8mEzhSa6tCC/84MPnQM43KQnuNmJ3DGRMS71jqnVb+w2hr69jhBLAGAQQQQAABBBBAINcFqA8BBBBAoFgFaPgU651n3wgggAACCCAgwWAwXlHbuEo8c6wa+Zkl8exMZky0jZ8f9LY3fzna7pYnEzgSaxP7GTzwkJa46Cyb/xE7dx+7H3HEyPGlY+J3rW5v/tDupzmCAAIIIIAAAggggAACCCCAAAL5IPCGhk8+FEyNCCCAAAIIIIBApgUq5jb+ukS8M1T11hRyT/JUWv06obN38eIJKcRnNCTR9JlV27DGp84MY0x0uMlV9JO283Nnz8qWM4cbwzoEEEAAgfwVoHIEEEAAAQQQQACBwhOg4VN495QdIYAAAukKEI9AUQqcGlrwTKCm4SxRqRcxzyeDoCL2Zypzlpngu7tn+aIPRKNn+JKJH4m1M2rq/1UWLzvXmB0f8fbvYVzD9rt0ihhzfU97S/iem5rGDyOGJQgggAACCCCAAAIIIJC/AlSOAAIFJmD/caLAdsR2EEAAAQQQQACBNAQmPdu3XGKm0qb4i53Jjo+Jz3eH/4VjEvHJxmZ8/Sl1df0VoXCT55nTVeR3w7qAkQmiZtG2Pv3+6rbFBw8rhkUFKsC2EEAAAQQQQAABBBBAAAEE8kmAhk8+3a1cqpVaEEAAAQQQKFCB6a4bq6hb8ECJDH7EGLPWiHjJbVUPsRG3dbcvWZALH/GmIqZqbuMvA7XhI+w+2u3Lrfb7vkbiHUozfSW+tT3LW3PiHUv7KpjzCCCAAAIIIDBCAqRFAAEEEEAAgbwRoOGTN7eKQhFAAAEEEMg9gUKu6LTaS18sL4l/QVXn230+Z2dSQ9X5ppnguz6X3iUzsN1pFKPnGZW/DnMzR4rPu7f0+Y9ctH69WzLMGJYhgAACCCCAAAIIIIAAAggUmADbyQ8BGj75cZ+oEgEEEEAAAQSyIHBC9SWbKmoa2myTJCAqLyRZQqldf6avxPfo6kjLR+zzrI9gff22ilD49hJHPiaiPxSR4bx7aaoaE3nxj+OvW+/S9LFmDAQQ2F2AIwgggAACCCCAAAIIIJADAjR8cuAmUAIChS3A7hBAAIH8F6gINfwiHpcPipGb7W6225nMONCn5raeSEtobWfnuGQCR2rtjOrwc2PLvSo1Um8bWU8N5zqO6OxNU8vvWr1iyQeHs541CCCAAAIIIIAAAsUmwH4RQAABBLIt4GS7AK6PAAIIIIAAAgjkg8CsueF/+uP+8414X066XiMHi5hl8Xjf9b3fWjwh6fgRCDjp3MYtM2sb2ko834kq8tgwL/EZn+Os72pvPnuY6/+zjGcIIIAAAggggAACCCCAAAIIIDCiAjnR8BnRHZIcAQQQQAABBBDIkMApdXX9lbULrhOjxxqR3ySZtsQ2fc4y/b7eNe3NH3JdN+s/h6mqOS00/4+Ob8LH7F6utvU9b7/va0x0VK7vjbRcvbazefK+FnMeAQQQQACBnQV4jgACCCCAAAIIIDByAln/h4aR2xqZEUAAAQTyTIByEcgbgUCo4ZdOWVmFEW01IoNJFj7dU+k9atqELyYZN2LLZ1RXbx3Y0Pd1o75T7H5+P4wLjTViFsZj5q6utpYjhrGeJQgggAACCCCAAAIIIIDAawJ8RwCBERKg4TNCsKRFAAEEEEAAgcIVUBETOH/evx/bsHmh/WGqzr78d5K7fZMx5ls97U3XdnU0TU0ydkSWB113oLKm/sHB7c6n7AVuEJVN9vvehiOqRzsl3rreFc0nrF+1aszeFnMOgeELsBIBBBBAAAEEEEAAAQQQQCAVASeVIGIQyJoAF0YAAQQQQCCHBFzXjQVqwytt8+ZUW9YaOz07hz9U5zrG6bo90nT48INGdmWwvv6FSRv6ajzRc+yVhvFuH32zceTOl7Y+15Qrf5/I1s1AAAEEEEAAgXwXoH4EEEAAAQQQSFqAhk/SZAQggAACCCCAQLYFcu36laEFjw5s6DvDqDSLmK1J1Gd/FjPHlog+1hNpOmu965YkETtiS6e7bqyqpuGOEhn3SVXTqyLb93GxUrXNK9Pv/LQ3suy9thFm97WPCE4jgAACCCCAAAIIIIAAAgggsA8BTicnwC/jyXmxGgEEEEAAAQQQGFLglY9ECy8UI5+zC35rZ5JDOzdNKb/2zlVLDkoycMSWn1Zb++Ijz26p8ox8yV7kf+zcx9AjjYnde/jU8ovWtbWV7WMxpxFAAIF0BYhHAAEEEEAAAQQQQACBnQRo+OyEwVMEECgkAfaCAAIIZEegItS49mDfhI+Kys1JVlBuY2oHt+n93W1L3plk7Igtd13XqwyFfzCwoe8oW9937IXidu55qBysIu0Dvv7bulZcfeCeF3IGAQQQQAABBBBAAIFMCJADAQQQQOA1ARo+r0nwHQEEEEAAAQQQyJDA0dXVgwMH9n3JNj5qjMg/k0urhzklzk96Olqqc+lv4iTewfTEoH+OozJbVR6ze/LsHHLYfTuieprj+Nf1rmw+IRqN+oZcOBoHuQYCCCCAAAIIIIAAAggggAACRSLgFMk+h9wmBxFAAAEEEEAAgZESCAbdgZk1DZ0+X8knxchaex3b+7FfhzHswreIMW1ev7NyGMtHbUldXV3/zJrwd2OD8dPsRb9t596G7fvIh8XT28uee/IbnZ2dpXtbzDkEEEAAAQRGUoDcCCCAAAIIIIBAMQjQ8CmGu8weEUAAAQT2JsA5BEZMQFXNzOqLn3h5q/m8ff512/h5NomL+VX0rJ5I8597V+TWu2Rm1S18qqI2fKGIOdvu53d2b7ZHZZ8NMYyYiXZeOi3+8po1K1rfz7t9hkDiEAIIIIAAAggggAACCIyGANdAoOAFaPgU/C1mgwgggAACCCCQbYFzGxu3BGoavu6JnK5ifp5kPe/xHHOz//knvrnKdcckGTuiywM1jT+IezLT7uvr9kIDdu5l6Mme491R8twTtlG0l2WcQiBrAlwYAQQQQAABBBBAAAEEEMhvARo++X3/qH60BLgOAggggAACGRCoCoV/Fqht/LhRudam22znsIaKThEjlxwwrbyrt731XcMKGoVFartXs+aG/1lpm1kizqmi8j/2snE79zTeZn/47Ohtb7q1d/niN+9pEccRQAABBBBAAIGsCXBhBBBAAAEE8ljA/s6dx9VTOgIIIIAAAgggMIoCmbrU4LN9C2yv5PMq8rNkchojnzXirbUNkwvb2trKkokd6bUVtfX3emKmq+rX7bWet3OPw6ieYXy+O3raW85cv359yR4XcgIBBBBAAAEEEEAAAQQQQACBLAjk6yVp+OTrnaNuBBBAAAEEEMhbgaDrDgRqG+/s39B3vG36XGc3ErdzeEPlfbZh0nGIb6C1s7OzdHhBo7OqqqZxQ6Cm4RtO3HzI7ut39qqenUMNe1qOEjU3v/zHh5rW5VjzaqiCOYYAAgjsJMBTBBBAAAEEEEAAAQRyUoCGT07eFopCAIH8FaByBBBAYPgCicbPM74Jcz2V80T1IRtp7BzO8IlK7dT45l/2rmw+wRiTaKAMJ25U1syc1/j3TVvMx4xog73gk3buafjsmov7SwfWd69oOd51Xd7tsycpjiOAAAIIIIAAAgjkmADlIIAAArknQMMn9+4JFSGAAAIIIIBAEQlUV1cPVtWEb/biZSd7Yr6bzNZtl+f/GU+6uyMtC5OJG4215zY2bnlsw+Y2n08+aJtTN9trGjuHHGrko45jeo+cUv6NIRfk40FqRgABBBBAAAEEEEAAAQQQQGCUBWj4jDJ44nJMBBBAAAEEEEBgV4GquXOfr6ptPE+MnGHn47ue38vr8Y7KNb2R5rVrOpd8cC/rRv2U67rejOrwc886E2aL0c/bAh6xTaqY/b7bMCLjbWPokt725gd6Iks+sdsCDiCAAAIIIJCHApSMAAIIIIAAAgiMpgANn9HU5loIIIAAAgj8R4BnCAwpEKhtWC2ip4pIk52Ddg5r2IbJqV7cWWMbJl+2jZac+mi0xLuYKkINt8Z9vlONMYvthrbZOeQwKh834tze29F05drOznFDLuIgAggggAACCCCAAAIIIJA/AlSKwKgJ0PAZNWouhAACCCCAAAII7FtAVY1tjjz56Ia+S8ToF2wj5682yrNzX0PtgrfYhknLUVPL29dc3/R221xJHLOHc2PMqp7/dEWo8Yq45/u4reheOwfs3G3Yoqcao5fH45u7utoXH2YbWPzMupsSBwpHgJ0ggAACCCCAAAIIIIAAApkR4JfnzDiSBYGRESArAggggEDRCtgmh2cbP7cODsQ+Yxs/KyzEcN/t47NNoou8Qb2rN9IatHE5N2bNnf+wf6J/lm3sXCRi/ryHAhM/p57kU9/9R00pn9fZ2Vm6h3UcRgABBBBAAAEE8l+AHSCAAAIIIJABgcQv0hlIQwoEEEAAAQQQQACBkRAIXnzJE7bx82VPzcmq8lfbzBnOu30SpbxX1NzSE2nuiLa1TUkcyKV5yjl1LwdqwzeO9008xu4ramvbYrH39YsAABAASURBVOduw+73IKOybFq87561Ha1vsY0wfn7dTYkDCCCAAAIIIIAAAggggAAChSCQ7h74hTldQeIRQAABBBBAAIFREKiqabw/Nhg/To0sEZXNSVxyTmnJwJ1rOlpOSyJm1JaeUF29KVATPlPEqTBGe/d8YTM9brwHDp824Yvr2trK9ryOMwgggEDBCrAxBBBAAAEEEEAAAQT2KkDDZ688nEQAAQTyRYA6EUCgGARm1S186tGNfZfH475PG5HE3/YZ1rZV5EPGmO7eSPOKtZ2d44YVNMqLKmrr7x2c8tZZKhqwl95g51Dj7Y6R6wZLBnvWfTv33rU0VMEcQwABBBBAAAEEEEAgswJkQwABBPYsQMNnzzacQQABBBBAAAEEck7AdV0v8TdwjDfwURX5pi3wGTv3OYxIiZ2heLzvh2vbl5yYi++SCQaD8UBtwxqfOh9UlWtF9GnZ7WF8RszJA9sH1ve0Lzk32t5evtuSYj7A3hFAAAEEEEAAAQQQQAABBIpWwCnanRfhxtkyAggggAACCBSOQNXcy55/ZEPf1yTunCjG/HL4OzPHxtW5dbCk/2vDjxndlTNq6v/Vf+AhDZ4nnxaRNXYONd4v6lzn123fviNyzf5DLeAYAggggAACxSrAvhFAAAEEEECgOAVo+BTnfWfXCCCAAALFK8DOC0gg8W6finn1j1eEGj8mRi61W/unncMZ+xnRS3sizb/s7Vh6rDFGhxM0mmsS7/apmtvwl0BNQ4XjyFmi+pCoDOxSQ+Jv+ZwRk9I/dXc0BXP14+p2qZmXCCCAAAIIIIAAAggggMBoCHCNIhSg4VOEN50tI4AAAggggEDhCTy6sW+JOHKKqumwu9u1MWIPDTk+Yrz46jUrW5q+19Y2ccgVWT6odkMz54R/UOqNmaGiF9vG1lNDlDRVRW+Ixzff3NW+9LAhznMIAQR2E+AAAggggAACCCCAAAIIFJoADZ9Cu6PsB4FMCJADAQQQQCDvBHa822dO+H8mPrulTlW+ZIxJNEbi+9yIyjRjpKG8dODu3kjT4TZPyT5jsrDg1FDomUBNQ4d/rP+DnsgNtoQX7fzPMDLBvqhwNP5AT6TprJuamsbb1wwEEEAAAQQQQACBvQlwDgEEEECgoARo+BTU7WQzCCCAAAIIIFDsAtNdNxaoCd88OBg/VlSarMc2O/c9jHzUiP7oiCnli9Z9u21KIiAX5ylfqtsY29AXcozMFCO32hp33d+BYvTGieX6ne6O1g/b8wwEEEAAAQQQQAABBBBAAAEEikIg1YZPUeCwSQQQQAABBBBAIF8Fghdf8kRFTfhS4/N/wO7hUTuNnfsaU1WlYXD7wK+72hYd4bpuTv6sGHTdgZmh8M8qQuHPeWpOs5t62k7PzleGSokYOV2N9+Oejub56103J9+19EqxfEUAAQRyXoACEUAAAQQQQAABBPJEICd/ic8TO8pEAAEEEBAIEEAg1wUqq+v+1/T7phsjl4iYPw+nXiPydl9Jyc+Pmjr+m10dTVOHE5OtNVU1jfdPGnvgOzzROltDorFlv70+xtrGT8tLU8rX9USaPvP6UZ4ggAACCCCAAAIIIIBAkgIsRwCBfBCg4ZMPd4kaEUAAAQQQQACBNAQq589/qaK2oUnj3nGq8oPhpLJNn/FGnAWOOL/r6mg5zRijw4nLxprps2dvr6ypj/gn+j9lqwzbGl6y87WhqnKCivb0Rpo7e7+1OPG3fl47x/dMCZAHAQQQQAABBBBAAAEEEEAg6wI0fLJ+Cwq/AHaIAAIIIIAAAtkXUFUTmLfw34Ga8FmeaFBUfrnvqoxPjJnmM3Jrb0frkjsire/I1cZPYn+nnFP3cmVNuMXz9Bi7txvsfNLOHeOVBpZcZAZ893StaApEo61jd5zgCwIIIIAAAghkTIBECCCAAAIIIJBdARo+2fXn6ggggAACCBSLAPvMIYHK2obbPTEVKlIjRp7dV2lGzDgRE46Jd1d3pOWsfa3P9vmquQ1/GZh8yByJO6caI98RkQE7XxlGPuo4enPZc973epctm/bKQb4igAACCCCAAAIIIIAAAghkSIA0WRSg4ZNFfC6NAAIIIIAAAghkQ8A2ekxVTeOGQG14pao50TZ97jMifcOo5T2Oyvd6Ii233L6i9f3DWJ+1JcFgMF4xr/7xylB4tonFPyGiP1fRl+WVx3i73yrjj/29u73p/GjnokmvHOYrAgiMvABXQAABBBBAAAEEEEAAgZESoOEzUrLkRQCB5AWIQAABBBAYdYFAbePvDi6Z8FlH9Esq8rvhFWCCPsdb0xtpasyHZkll3cIHfb7yE1XM58Ro9057HKuORvxeSU/3ipbjXdd1djrHUwQQQAABBBBAAIGREiAvAggggMCICPBL7YiwkhQBBBBAAAEEEMgfgaOrqwcDtQ23BWrDR4iRRaLywj6qV9sceocRXeKP+9au7lz6JtssKdlHzLBPj8TCGdXVW2fWhu+qCDVUqfE+azfwJyMyaPfrt/PT6jPrjpgyrrV76dL97F74GXkkbgI5EUAAAQQQQAABBBBAAAEERlQg336ZHVEMkiOAAAIIIIAAAsUu8OjGvsuNkRPt/LZt6rz2EWh7YdFP+OLxPx05tfzrazubJ+9lYc6cCoQW3O048gkx3kW2qPV2Gtv08as6X9ay2C+OmFp+wbq2tjJ7nIEAAgggkD0BrowAAggggAACCCCQpAANnyTBWI4AAgggkAsC1IAAAiMl4LquV1kb/m3Fxr4LxZMZw2v6yERbz6XxuPwp8dFo9nnOjxnV4ecqQwu+M2lD34kixk752ytF62H2e8dAycBDXSta3mOfMxBAAAEEEEAAAQQQQCBrAlwYAQSSEaDhk4wWaxFAAAEEEEAAgSIRUNv4CcwN/7Tf9L1FxSyw2/6HnXsbtjckBzqO6e3paG7vWd76gegZZ/j2FpAL56a7bqyitvHe8b7Y0aLmy8bow/YHZM/W9t92Lw/0tjddeXuk9R32tdrJyDUB6kEAAQQQQAABBBBAAAEEEHhdwP4++/pzniBQUAJsBgEEEEAAAQTSFwiG3L6ZG7a0xGPxT6hKi6gM7C2rERkvRmrV593lP+7Dob2tzaVzJ1RfsqmiprFtMN5/shGT+Ki3Dba+qeI4V5SKd293x5I59jUDAQQQQAABBHJQgJIQQAABBBBA4BUBGj6vOPAVAQQQQAABBApTgF1lQCDxbp9ZdQufCtSEw57nBUT1Ppt2m517HLbx8xYxem13pPmBrkjrp6LRaM6/2yexmWDdZRsrahtXvbzFvEM9s0CMecgYOUiNE+lub/5hT2TJJ1zXLUmsZSKAAAIIIIAAAggggAACCOSMAIVYARo+FoGBAAIIIIAAAgggMDyBqtCCu9Ufq1TR80TMH/cVpSIfV4nfVrbxn51rOpcdsq/1uXL+3MbGLYG5jU1xb+CztqZz7XxQVU4w4lt95NTy67o7rnmbPcZAAIG8EaBQBBBAAAEEEEAAAQQKX4CGT+HfY3aIAAL7EuA8AggggEBSAoHzF24O1DbcNjB5y5GiepUxZqNNYOwccqjoFKN6vufFft4baZn5vTZ34pALc/Bg1dzLnq8IhW+vqA0fYxs+56iYZ1Xk82pKH+7taPrcHZFr9s/BsikJAQQQQAABBBBAYCgBjiGAAAIFLkDDp8BvMNtDAAEEEEAAAQRGSiAYdAcqahqu8JWUnGxU2ux19voxb2LkYCPm9vEl5Tf3tLd8zK7PqbGvYgI14Zt9PpkuamaL6P2e0ZvjUrqmyzZ+oq7rFx4IIIAAAggggAACCCCAAAIIZFGAhs/w8FmFAAIIIIAAAgggsAeBmdXzH66sCV+sEj/KLvmtEfHs9z2NUhU5zTZNft4VaVm0vr29fE8Lc/H4jOrwc4GaxlsqahtOj3vO4XavYx2j3/VPLV+zrq1tijHGbi8XK6cmBBBAAIFhCrAMAQQQQAABBBDIWwEaPnl76ygcAQQQQGD0BbgiAgjsTSBQu/DPPl/fJ+0PmF+y635hZ9zOPQ5HZcEm3fbTnkjzBdEbWg/Y48IcPXH63Po/DGx3PuGoOck2fp4Z8A38oqej+arbI63vyNGSKQsBBBBAAAEEEEAAAQSGJcAiBPJTwP4+np+FUzUCCCCAAAIIIIBA7gnMqHa3BmrDNw74YqeopxfttcJX3g1zlBjp8Pd767rblrxzr+tz8GSwvn7bzJrG+wc39F00EB/4mCNOWYl4P9vRxOJj3nLwjmWoJNIggAACCCCAAAIIIIAAAjkoQMMnB28KJeW3ANUjgAACCCCAgEiw+pJNgbkN3x4w3pvEmMTf9/n3Hl1USkTlGC1xft8TaVrU2976rj2uzdETQdcdCNZdtjFQ29DgefppFX2Hf1r50t5I06nRdjevPrYuR4kpCwEEEEAAgZwToCAEEEAAAQRyTYCGT67dEepBAAEEEEAAgUIQYA+vCgRDC57xx8sW2J7OccbIt43I4Kunhvo2RkTDRr0fdnU0X7K2s3Oc5OGjam7DX2Zu2HyF+suuiqujfl/5V7vaWo7Iw61QMgIIIIAAAggggAACCCCAwN4FcuosDZ+cuh0UgwACCCCAAAIIFJ7AKXV1/YHai/9cGQqf78W96XaHvxLRPhn64bOH3+4YuSoe33znmvbmj0dbW8faY3k11HW9wPnz/l1V03DHwDN9V2iJ94HuSHNFPu4lr+ApFoGcE6AgBBBAAAEEEEAAAQRGT4CGz+hZcyUEEEDgjQK8QgABBIpQYNa8BT/3x/wnOSqfF5Vf7oUg8XPqpz2Vu0rHxK9b29n8vr2szelTiY97q6xt/N7gZOceOfjleE4XS3EIIIAAAggggAACmRcgIwIIIDBKAolfpEfpUlwGAQQQQAABBBBAAAGRU+rqXp6ZeOfLgYd8QlXPtybPqUjMfh9qlKvoOfG4/LF7RfMVd0Qi+w+1KB+OBYP124JBd2DXWnmNAAIIIIAAAggggAACCCCAQCYEaPhkQnHkcpAZAQQQQAABBBAoWIFgMBgP1DR8W4x+0BjvUtv8eWKvm3Xk6zHZev+aSPNF0c5Fk/a6lpMIIIAAAgjklwDVIoAAAggggAACaQvQ8EmbkAQIIIAAAgiMtAD5EShsgYpQw5OB0IKW/gM3v1tEF4uY7TLEQ0USP7se6Yl0lMVLftKzsvm/hljGIQQQQAABBBBAAAEEEEAgTwUoG4H0BBK/NKeXgWgEEEAAAQQQQAABBNIUUNvlSXzcWUVtwyXGmI+q0W+L6NMy9MMxIkcYTx7tjjRFutsWf3joZRxFoMAE2A4CCCCAAAIIIIAAAgggsBcBGj57weEUAvkkQK0IIIAAAggUikBlaMGjbykpn+N58mlRuVn28LBNolIVnaMlzrqe9pZrexcvnrCHpRxGAAEEEEAAAQQKRoCNIIAAAgggsCcBGj57kuE4AggggAACCCCQfwIFU/HR1dWDVXMb/lJRE/6Cp77jRfSHtvl0z1S7AAAQAElEQVTzguz+UBE9UNTUmQm+h3oiTbO7Vqw4UHgggAACCCCAAAIIIIAAAgggULgCQ+6Mhs+QLBxEAAEEEEAAAQQQyBEBU1Uz//5JYw8IeGLOEDH37qWu96hqxOdsv2vNiqZAZ2dn6V7WcgoBBBAoYAG2hgACCCCAAAIIIFCMAjR8ivGus2cEEChuAXaPAAII5KHA9Nmzt1fVNN5fUdt4gko8YBs7D9ltbLPzDcMYGWNEPuQ52jU1tvnOOyKt71i1yh3zhkW8QAABBBBAAAEEEECgGATYIwIIFJ0ADZ+iu+VsGAEEEEAAAQQQyG+BQO3CNT4zcKIYOVdF7rK7sT0e+/WNw1GVE2LiPbL/tvLlPZ2tH3jjaV4hgAACCCCAAAIIIIAAAgggUFgCNHwK635majfkQQABBBBAAAEEclrgtNpLX6wIhW8P1IZPEXHOEdWnbcGenbuOifbABRL3ftcdaWpZ395ebrtDao8xEEAAAQQQQEAEAwQQQAABBBAoIAEaPgV0M9kKAggggAACmRUgGwL5IVBRW//9gcH+I1SdL9uKf2FnzM7dhorWb9KtD62JtMzvXb74zbst4AACCCCAAAIIIIAAAgggUJQCbLpQBGj4FMqdZB8IIIAAAggggEARCwTrLtsYqKlfMcmMPcl45mwVeWZoDn2vEbPYlPh+3d2xpGboNRxFAIE3CPACAQQQQAABBBBAAAEE8kKAhk9e3CaKRCB3BagMAQQQQACBXBKYHgr1Vc5tjDq+vneKkXoj8htRGdilxhJ77mA1zoqeSPP9a1a2Bnq/tXjCLmt4iQACCCCAAAIIILCTAE8RQAABBHJfgIZP7t8jKkQAAQQQQAABBHJdIOfqm1Htbq0IhZcaNaeJp+eq6P8NUWTiZ+HpxvNuNdt93V0dTccNsYZDCCCAAAIIIIAAAggggAACCOSFQOKX3BEulPQIIIAAAggggAACCGRHoKqmcUNFqOHWQG3DO41Inag+br8P7lyNfV0mKsc7Ru/raW/q6o40/79o1PXvvCZfnif+NtHalUveHW13y/OlZupEAIFCEmAvCCCAAAIIIIAAAtkUoOGTTX2ujQACCBSTAHtFAAEEsixQWRterrHYyba5c74t5RE7dx+qlWrkTv9z5Tf2rGg6ZvcFuX3kGf9+G714iSnxTTz+9kjTZ3K7WqpDAAEEEEAAAQQQKEgBNoUAAlkToOGTNXoujAACCCCAAAIIIDDaAoF5C/9dWRP+bkVt+IOep4nGzz9sDXE7/zNUptkXnxNHf9Xd3rx4defSNxnXzYufm6urqwcDofq/Vc2p73U81e5I83fWrmw5Yl1bW5ndU04MikAAAQQQQAABBBBAAAEEEBgZgbz4xXVktk7WHBSgJAQQQAABBBBAYNQEquY2fHvAeB8V1ZCoWWdE3vBRb4lCVGWBL+79omfy+Kbu9iVHunnS+EnUXjU3/KNSGZzvGfl/gyUDV3StaArQ+EnIMBFAAAEEckCAEhBAAAEEEEBgBARo+IwAKikRQAABBBBAIB0BYhEYPYFgaMEzFTUNnZOe3RIwPjnOXvn3du4yzNvU0XpV/fmRU8vbdjmZ0y9Pq730xZlz6lf1b+j7hooeP1AyePOd7e0H5XTRFIcAAggggAACCCCAAAJFIsA2My1AwyfTouRDAAEEEEAAAQQQyDuB6a4bq6oO/+zlLeYjRuVcFb3bbuIlO3caOs6+CPVEmv/W3dHc0N3Z9k77OueHbVSZoOsODE49ZL6IXhtztrX2tjc3d7U3fzwadf3CA4FcFaAuBBBAAAEEEEAAAQQQSEqAhk9SXCxGAIFcEaAOBBBAAAEERkLg3MbGLYm/8dNvxpwR93zH22ussXPX8U41sljjA+t72pu+GT3jDN+uC3LxdTAYjFfU1j/gOBMuEPHutb8IXO9/rvzWNZ3LDsnFeqkJAQQQQAABBBBICDARQAABBIYvYH/PG/5iViKAAAIIIIAAAgggkEMCI1ZKMBTqmzV3/sMVteEKT23jx5h19mJPi9hWj+x4JJo8bxXVy/3Tj/l3d6R5XnR509t3nMnxLzOqq7cGQgvuHuh3PmiM/G88Fvt5T6T567evWPT+aDSa2FeO74DyEEAAAQQQQAABBBBAAAEEhhIo4IbPUNvlGAIIIIAAAggggAACSQmYqpr590/auCVgRGaIkeU2erudO4+p9ofqVr9P7+rpaL6ma8WKA3c+mavPg/X12zaUTLjUOOaztsa3ljglPWXPPRG5PdL6DvuagQACCOSRAKUigAACCCCAAAIIJATs76aJb0wEEEAAAQQKVIBtIYAAAhkQmO66scra8G8rQg1fjsf87xZjOm3z51nbBPIS6e33Evv9vfbYJY6z/c89kZZQ7/XLptljOT2qq6sHq2oaf19RG/6SkXijrf+TJeI9mi/15zQuxSGAAAIIIIAAAgiMrgBXQwABoeHDfwQIIIAAAggggAACCCQhMKuu7qmKUOMczzGfsQ2SS1XlT7uEHyhi2sxA7L7uSPM38uVv5FTWLuyRwZJPi8rVKqY+UX9vR8uVqzuXvmmX/eXlS4pGAAEEEEAAAQQQQAABBApdgIZPod9h9jccAdYggAACCCCAAAJJCyTeGVMZCi8J1IQPs8EX2rnBzh3v+LHfHds4eb+KXOHFY4/3tDfPj7qu3x63h+zXHB2Biy9+tqImvKj/5dgHVfRvxpjLfPH4r7vam6s6OztLc7RsykIAAQQQQGC4AqxDAAEEEECgoAWcgt4dm0MAAQQQQAABBIYtwEIEUheoqA3f4J/of7canSPGrLOZBux8bUy0zZ/Wsmnlj/VEWhZ0dy5552sncvV78JJLNj1TUn6G55hZYuRvjkp0mrf5J92RlnOi7e3luVo3dSGAAAIIIIAAAggggAAC+xYo3BU0fAr33rIzBBBAAAEEEEAAgVEUOOWcupcDoYbrB/p9p8di+hF76TvtfH0YI+8zYq7WmPPznkhzW+/ixRNeP5mDT3b8fZ85jb0vbzUzjMpC2/g5UsXc4Jdtv+la2XxCDpZMSQhkRoAsCCCAAAIIIIAAAgjkqQANnzy9cZSNAALZEeCqCCCAAAII7EsgWF+/7fS6hkcqasOnqdHjbJPkWzbmn3aKijj2yzT7fJ5M8P2zt73pytsjTYdHo1GfPZaT49zGxi2VNeEWx3M+ZGtfa+dbHE/u6Glv/l73ipbjjbHtoJysnKIQQAABBBBAAIHUBYhEAAEE8lHAyceiqRkBBBBAAAEEEEAAgSwKDPvSgVDD+tJYWUiN8xnbFgnbwKft3DGMyP5G9fIS0XX+55+4oTey7L07TuTol5lz6/8wts980XhaaUv8k238nK1qbu/taOnpWd76AXuMgQACCCCAAAIIIIAAAgggkEUBGj4ZxychAggggAACCCCAAAL/ETilrq4/EKr/W+JdMr4Nfe8So43GmIfFyDa7KvHz+Fvs8y8aif2pO9Lc2d2+5Mho1PXbczk3Tkq822duw32Txh54jGe0zRbYb+dM8XkP9HS0XL5medPbc/ndSrZWBgIIIJBBAVIhgAACCCCAAAK5JZD4BTO3KqIaBBBAAAEECkGAPSCAAAJDCMxw3a0VoYZm48hnRcyZRiVql3l27hgqcpGKc7f/uQnfW9PRcprk6GP67Nnbf7dx83xb/6m2eZXYw1gx5pvGpz8se/7JK6I3tB6Qo6VTFgIIIIAAAggggAACmRUgGwI5JEDDJ4duBqUggAACCCCAAAIIFIdAVU3jhopQ49rKmvCZ8VL/oXbXPXa+aKcnKtNsM+gMz5i1vZGmn665rvlDazs7x9lzOTVc1/Uqa8O/rQw1nqlqzrPNqn8ZkXfYBpDrH/D+2rWiKRBtd8tzqugsFMMlEUAAAQQQQAABBBBAAIHREqDhM1rSXAeB3QU4ggACCCCAAAIIyKwL654amHzI6eJzPqVirrANk4dfYzGin/Bi8kAstrmnu73li9HW3HznTKCm8RZPBz9ujDTb2hONqwMc1dv9Un5nT3vLmZ2dnaXCAwEEEEAAgeIVYOcIIIAAAgiMigANn1Fh5iIIIIAAAggggMCeBDiOgEgwGIxXVNc/HqhtXLShZOJHROVkI/LXV23KVOUEUfMt/xjvrz2R5gseysEGSmXNpf94bGPfpT6ffEyM/MXuocTOT9q6bz4o/vKPutoXH/bqfviGAAIIIIAAAggggAACCBShwMhvmYbPyBtzBQQQQAABBBBAAAEEhitgqqurBytqwvcMbuj777howDZ+brTBT6pI4mf3xN/G6Xwqtvl3vZHWxq6Opv+259Wez4mR+Ji3GdXhP/lKJhxlm1RhW9s/bWE+I/opR32/6I60tHStbDnCuG5iL/YUAwEEXhfgCQIIIIAAAggggAACaQrwi1aagIQjgAACoyHANRBAAAEEik8g6LoDs2ob1pTF/NVi9FgxUi8qL1gJx35/nxFvsX1y75qO5u+u7Wx+nz2eM2NGdfXWmXMaWgcHYp+0jZ9vGxHPFrefiql3PHN3z9QJTfY1AwEEEEAAAQQQQGAXAV4igAAC6Qg46QQTiwACCCCAAAIIIIAAAiMrcEpdXX9FqOHJilB46cA252BVPV9E14vIJtsEmmaMnB2Py8M9kebre5cvObb3W4sn2HNZH7ZOE7z4kife4kyYo0bOtE2f39uiYnYelGj82Hr/0RVpPq9rxdUH2mMMBBBAAAEEEEAAAQQQQACBNAVo+KQJmDvhVIIAAggggAACCCBQ6ALB+vptgZqGbw/4BivF6Km2qbLE7nmznWPtvMD4nLuk39fT1d50YTTamjhmD2d3HJ34iLpQ+PYSdU424i2y1Wy3MzEOdYx0+Bz/XasjLTNd1y1JHGQigAACCOxLgPMIIIAAAggggMDQAjR8hnbhKAIIIIAAAvkpQNUIIFAUAsHqSzZVhBp+YZs/C3Vz/C0ieomI/EVFbA9FjnNUr/M/7z3cHWk65872JQcZY9Sez+qYUVP/r8raBV8x6nzKFvJrMRITlbFG5EM+Mb1HTB1/Y1f70sPW0/ixPAwEEEAAAQQQQAABBPYhwGkEhhCg4TMECocQQAABBBBAAAEEEMgXgcDChZsrahsWe2o+EffM2aLmelv7S7ah8j5HnZsGxVm/prNl8Zr25g+5rpv1n/8ra+of9I/xz7AtqHpb5z/t3DFU9Cyf463fNK18SXfH0rftOMiXlAUIRAABBBBAAAEEEEAAgeITyPovfMVHzo4RyLoABSCAAAIIIIBAAQpU1TRuqJrb2FtR03jRgBn7Vk/kamPMgKi+23jS6Kn8/Mip5WsSzZRoNOrLJsEpX6rbWFkbXu6Umum2jl8YEVuuiK13mm1UzVcTf7y7o+WL63m3j+VhIIAAAgggkLIAgQgggAACRSZAw6fIbjjbRQABBBBAAAEEXhHgayELBEOhvqra8OWeN/AWI94X7V5vtfN5O0+1zZQ/+Z97omvNytbzV3cuQhMIywAAEABJREFUfZM9lrUx88LGv1fUho+1BdTYds8f7ffXRrkas2rT1Al39kZazqDx8xoL3xFAAAEEEEAAAQQQQACBPQsM3fDZ83rOIIAAAggggAACCCCAQJ4IVM297PnK2sbv+WP+88Toh42Yy2zpm+yc6XneSl88/lBPR/NVd0Qi+9tjWRsVNQ3Xm/6Sj9kCVtkZs/PVYU60jaCbXp5Sfl/XdS3vefUg3xBAIJMC5EIAAQQQQAABBBAoGAEaPgVzK9kIAgggkHkBMiKAAAIIFIbAKXV1/RWhhidt8+easeXmHbb5c56o/nDH7oxcNijb/twdaWrpbW+Z3vutxRN2HB/FL6pqKufPf2lgct8c48i5traH7OU9O8WIjDEqn3Ti5pfdHS1fibZf865c+FtEidqYCCCAAAIIIIBAoQiwDwQQKAwBGj6FcR/ZBQIIIIAAAggggAACwxI46dzGLbb5c9PANj1dJX6cGG0UNS+paL1R0y39JT/sbm86f21n57hXE47at2DQHaicE/5B3HFmGk8Xv+HCRg5QI18rldI7j5hSPu8N53iBAAIIIIAAAggggAACCCAgNHz4jyBNAcIRQAABBBBAAAEE8lEgWF+/LVC78M+2+dNc4kw4Mi7xgDHyoBHzVlW9IeZtfrQ30jyna0XLex7q7CwdzT3Oqp7/dOXchsuMOseIMQ8ZkR3v9hExPlV5j53LbG0P9K5s/uT69etLRrM2roUAAggUrwA7RwABBBBAAIFcF6Dhk+t3iPoQQAABBBDIBwFqRACBvBaYUV29dVbtwjWDU/pOi4k5RYwTUqPP2EZLh+OYe5+Kb76pO9Jcsa6trWw0N1pZU/+gel5ARb5ir/ucna8PW9vHjSc9m/748I1dHU3//foJniCAAAIIIIAAAggggMDICZA5pwVo+OT07aE4BBBAAAEEEEAAAQRGTyDxkWqn1zb+riJUH6mobfikijlCVH5tKzjJNl2ig6UDv+mONJ3TvXTpftFo1GePj/gIzFv474ra8NWxuHzCXux3dsbtfG3sL2LOcoz8dE2k+aLE3x8yxlb82lm+j7oAF0QAAQQQQAABBBBAAIHsCdDwyZ49V0ag2ATYLwIIIIAAAgjkmUAg0fypCZ/hGd+xqhoyRv6kou3ij/3Cv/HJ1jUdS48zxuhobOv0eeE/DWx3ptsm1KVi5Nk3XlP390Q6Tb/v7p5I8+feeI5XCCCAAAIIIDDKAlwOAQQQQCBLAjR8sgTPZRFAAAEEEEAAgeIUYNf5KFAVmv/HQE3D9QOTD/l8iQy+zajeImpmeyZ+z5qOlj/3dDSfZFx3xH+3CNbXvzCzprHZ5/M+IWIS7zzalfNjqvJdW89PVncufdOuJ3mNAAIIIIAAAggggAACCBSywIj/UpYUHosRQAABBBBAAAEEEEAgZwWCwWD8tNpLX6yqDV95sG/CgWrkTM82XlRk2ZppE37T29HytZ72lo891NlZOlKbsA0dM2POgr8OTN6S+Mi5BlF5apdr+cTIJ33x+KO28XPJ6hXNh9rztkT7lYEAArkjQCUIIIAAAggggAACGReg4ZNxUhIigAACCKQrQDwCCCCAQO4LHF1dPRgIhbs2+CZ+Keb0H+cZc4Ux3kdUvZ4nYy//qmtFU2Akd5H4e0P9kx+8Vjz9mL3OWjs9O3ceU1X0ap/K3V0rW2fufILnCCCAAAIIIIAAArkhQBUIIJBZARo+mfUkGwIIIIAAAggggAACRSVQbRs/s6ovf7qyNnxXRW3jZ+Om5FOqzo8cx7msN9L8cFekpf72jpajou1ueZIw+1weDN4Wrwg1PDkw2TlTVC4XMU/YIGPnjmGMsT0feZ/jeT22lmivrcN13ZIdJ/mCAAIIIIAAAggggAACCBSYAA2fAruhxbMddooAAggggAACCCCQiwKJv/dTUdtw6cB2tc0fqXPEjCkxZqVfy7ttw+VL0dbWsZmuOxis31ZRE15kGzwBVV0zVH7bBTrDiFlz5JTyJWs7mycPtYZjCCCAAAK5KEBNCCCAAAIIIDBcARo+w5ViHQIIIIAAAgjkngAVIYBArgqYYH39C1Wh8M8qasNX23mMiFlsjJzpH+M91N3R3HB75Jp3RNvbM/qun8rQgkcDNQ0VtrEz38I8becbh5GDRWV+3JNf9a5c9smRaD698YK8QgABBBBAAAEEEEAAgYwIkGRYAjR8hsXEIgQQQAABBBBAAAEEEEhHoKK28d6K2oaTYnGZ5RPzZIkpbfDr1vaela21q69vOzid3LvGPrZhS5vG4zNFzWp7btDONw4j7zRe7N6ysd63utoXH/bGk7zKRwFqRgABBBBAAAEEEEAAAREaPvxXgAAChS7A/hBAAAEEEEAghwROnxf+08yaxmhFKByaNHZytRf3Nvlig7d0dzR/q6e95a3rM/A3dlzX9QLzFj4UmBM+Q0Xq7NwyBEGpMfJ5R33/0xNpviwazfxHzQ1xTQ4hgAACCCCAwMgJkBkBBBAoegEaPkX/nwAACCCAAAIIIIBAMQiwx1wUmD579vaqUPhm/2Dp8Z4nK42Y4KbJ42t7I83ndbcvOTLdmlXVBGrDKz2NHyfGdNt8u7/bxx6040r/c969XSuaAutXrRpjXzMQQAABBBBAAAEEEEAAgbwToOGTuGVMBBBAAAEEEEAAAQQQyJrAKXV1/bNC4d9U1IZbJ42ffF1czV2qJf/VE2m6vTfSdGo0GvWlU1xlzcIHB/p9Z3tiLtlDnkT+jzmO3LJp6/PfzfTfFtrDNTmMAALZEOCaCCCAAAIIIIBAAQvQ8Cngm8vWEEAAAQSSE2A1AggggEB2BVTF7HjXT03jhora+u8HasJnGDEvlz33xIU9y5tPss2fw++IXLN/KlUG6+u3VdU2tvrUOcYY+dHQOXSMqJzu1+1/6Yk0X9C9dOl+Q6/jKAIIIIAAAggggEA+C1A7AoUqQMOnUO8s+0IAAQQQQAABBBBAIM8FVNVU1C54IPGxbFt8gw/GYt4LcfX915oVrYF7mprGp7K9GTX1D44tcz5n1KsVMS8OkcMeMm+y55ZrWfz+3uVLjjXGqD3IQAABBBBAAAEEEEAAAQRyWoCGT07fHorLPQEqQgABBBBAAAEEEMiGwNm1l744q27hU4GaBT+fObe+96TGxi2p1nHyBfUvVNYs6PCMzhSVx22emJ27DB1jDxxlHOeeNR3N4d5vLX+zEbtaeCCAAAIIFIcAu0QAAQQQQCD/BGj45N89o2IEEEAAAQQQyLYA10cAgYIQqAqFf+Yv8x9vN/MNMTJ0A0llvBFdYvr77+jpaD7HrmUggAACCCCAAAIIIIBAsQjk2T5p+OTZDaNcBBBAAAEEEEAAAQQQyJzAKV+q21hRG75S1Pmsbfo8ZTN7dg41jlIjN/V2NN+6ekXzoXzM21BExXeMHSOAAAIIIIAAAgggkEsCNHxy6W5QCwIIFJIAe0EAAQQQQACBPBKoqK1/QEQ/ZowsVZF+2cPDng/6HHNPT6SlsXvp0v32sIzDCCCAAAIIIFA8AuwUAQQQyBkBGj45cysoBAEEEEAAAQQQQKDwBNhRPglUhBqefGxj34K4OCfZup+2cw9D36sqi7Qsvn5tZ/PkPSziMAIIIIAAAggggAACCCAwqgI0fEaVe5eL8RIBBBBAAAEEEEAAAQRySsB1Xa+qtv4nKiXT1cjNImbrHgpUe/zIeFye6O1o+Vrv9cum2dcMBBBAYGgBjiKAAAIIIIAAAqMgQMNnFJC5BAIIIIAAAnsT4BwCCCCAQO4JBGov/vPEcX0XiDFf2kvTJ1H4WGPMFWYw9uvVyxfPTBxgIoAAAggggAACCCAwlADHEBhpARo+Iy1MfgQQQAABBBBAAAEEEMhLgemz3e0VoQW3iqMfshu4V1QG7PehRok9eGiJr+QH3e0ty7s7l7zTdd1kf9eyKRgIIIAAAggggAACCCCAQOoC/BKSuh2RCIyiAJdCAAEEEEAAAQQQyJZAxZzw/4zxO2caTxbYGrbbOeQwYsapmrkac+44fGr5F4ZcxEEEEEAAAQT2KsBJBBBAAAEEUheg4ZO6HZEIIIAAAggggMDoCnA1BBDImsDJF9S/UBkKX6tijlGVx/ZaiMr77C9a3+npaL57zfKmtxtjEn/vZ68hnEQAAQQQQAABBBBAAAEEXhdI8Yn9PSTFSMIQQAABBBBAAAEEEEAAgSITCNQ2/k6d2EwjptVufbOdex5GTjI+vcc2fi5Z395evueFnEEgOQFWI4AAAggggAACCCAwlAANn6FUOIYAAgjkrwCVI4AAAggggMAIC8ysvuSJytrGBnH0c8bItr1dzoi8W0Wv3iTbfrimc9Eh9rXubT3nEEAAAQQQQACBYQqwDAEEENhNgIbPbiQcQAABBBBAAAEEEEAg3wWofzQEKuY0rPP5zftt0ycqKgN7vabKR72475e9Hc0Lo21XT9nrWk4igAACCCCAAAIIIIAAAikI0PBJAS3vQ9gAAggggAACCCCAAAIIZERg5oWNf39pY995KqZBRLfKXh/6ZjH6TX+J/4e9kcXv3etSTiKAAAKZECAHAggggAACCBSVAA2forrdbBYBBBBAAIH/CPAMAQQQQCAzArNdd3ugpnGFSPxkEX1A9vowPnv6SBHfo70dzQui7UsOsq8ZCCCAAAIIIIAAAgiMmACJi0eAhk/x3Gt2igACCCCAAAIIIIAAAiMoUFG74AEd2H6Gqrr2MoN27nEYkTGekW/61Xd/V3vrya7rZut3sz3WyAkEEEAAAQQQQAABBBDILwF+qciv+0W1CIyyAJdDAAEEEEAAAQQQSEYgcPHlzz7y7OZviNEviJgnbKxn55BDRUrtmsMcNauPmDbh8sS7fYwx9vCQyzmIAAIIIIDACAqQGgEEEECgEAScQtgEe0AAAQQQQAABBBAYQQFSI4BAUgKu63oVoYZbPeOdbIzcaoPjdu5lmHFqzJV+dbp7OlpO3stCTiGAAAIIIIAAAggggAACexRIu+Gzx8ycQAABBBBAAAEEEEAAAQSKWKAqtPCPZXH/bE/lCjGyZRgUH1GRdV2RlkXR1tYDhrGeJQiMqgAXQwABBBBAAAEEEMhtARo+uX1/qA4BBBDIFwHqRAABBBBAAIEhBE6pq+uvqgkvchwzU4z59RBLdjukYhr9Y8yanpUtp3R2dpbutoADCCCAAAIIIIBA9gS4MgII5LAADZ8cvjmUhgACCCCAAAIIIIBAfglQ7Z4EZtY03v9sycRPGCPfkX08VMT+nmaOFU96psVebo66rn8fIZxGAAEEEEAAAQQQQAABBBK/SKCAwCgJcBkEEEAAAQQQQAABBIpYoLq6enBwSl+1ql5kGZ60cx/DlIpqXdnU8vt6I02n0vjZBxenEUAgdwSoBAEEEEAAAQSyIuBk5apcFAEEEEAAAQSKVoCNI4AAAsUsEAy6A488u/lbnqefMWJ+MhwLI/JxI/qD0mnlS25qaho/nNQJJf0AABAASURBVBjWIIAAAggggAACCCCQbQGuP/oCNHxG35wrIoAAAggggAACCCCAQBELuK7rVc1t+MtYv69KxXRYipfs3NeYoEa+PGG8/rx7Zcvx6123ZF8BOX6e8hBAAAEEEEAAAQQQQCDDAjR8MgxKOgQQyIQAORBAAAEEEEAAgcIXOPmC+hcmbthS5zjOF+1uh/ERbyIqcoR65paXp02IdHU0TRUeCCCAAAII5LUAxSOAAAIIZFLAyWQyciGAAAIIIIAAAgggkDEBEiFQBALTXTc2c059r5aWfEiM/NRuedDOfY3JxpgLVZy7br92ybvXr+fdPsIDAQQQQAABBBBAAAEEJG8bPtw7BBBAAAEEEEAAAQQQQKBQBAIXXvysGecLGNVvqMj24exLjfmgr9T51aY/TXCj7W75cGJYg0A+ClAzAggggAACCCCAwPAEaPgMz4lVCCCAAAK5KUBVCCCAAAIIFIxA5ez5L1XWNHzDGD3eNn2eGc7G7LoDxJjL/VL+27XLm99nbLDwQAABBBBAAAEECk+AHSGAwDAEaPgMA4klCCCAAAIIIIAAAgggkMsChVVbRajhF45Ppttd3WobOjH7fd9D5T0xx/x0zcqW+t5vLZ6w7wBWIIAAAggggAACCCCAQKEJ0PAptDvKfnYX4AgCCCCAAAIIIIAAAnkmMKM6/Cd/zH+eijYakeH8XR9R1SnGk0XS77uvq33xYXm2ZcpFAAEE0hcgAwIIIIAAAkUuQMOnyP8DYPsIIIAAAggUiwD7RAABBPJN4JS6uv6ZtQ3LjGqVqDxu67e9H/t1b0OlxC76kKO+u3rbm8+Odi6atLflnEMAAQQQQAABBBBAoNAEink/NHyK+e6zdwQQQAABBBBAAAEEEMh5gaqahjvM9sGZttBeO4c7DrWNn+/4Y75VvcuWTRtuUBGsY4sIIIAAAggggAACCBSsAA2fgr21bAwBBJIXIAIBBBBAAAEEEMhNgcr5l/6jojZcaYz5qoq8OKwqVUpEtdL4Y7/rjjRXrGtrKxtWHIsQQAABBBAoeAE2iAACCBSmAA2fwryv7AoBBBBAAAEEEEAgVQHiEMhhgQ0lExfFPTlTjDyVRJlTbZPopkFf//LVS696UxJxLEUAAQQQQAABBBBAAIE8EqDhk+TNYjkCCCCAAAIIIIAAAgggkC2B6urqwaq54R8NyNjDROU+W4dn53DGBKN6oeP3P9izoumYaDTqG04QaxAoZgH2jgACCCCAAAII5JsADZ98u2PUiwACCCCQCwLUgAACCCCAQFYFgqFQn8+Rz6nRK20hm+wc1lDVg8WRO/3PPXHl2s7mycMKYhECCCCAAAIIIFC8AuwcgbwSoOGTV7eLYhFAAAEEEEAAAQQQQCB3BLJbyYzq8HMza+uvNGoqbCXD+7s+dqGIHigil8bici9NHyvBQAABBBBAAAEEEECgQARo+BTIjWQbOShASQgggAACCCCAAAIIjLCAqprKmsYfG+M7Toy524gMDvOSqiJHxD35c3dH09xoa+vYYcaxDAEEEEBgVwFeI4AAAgggkCMCNHxy5EZQBgIIIIAAAggUpgC7QgABBEZDoDI0/9ExZb6zjTHXJnU9Iweo0Wb/GNPT097y1qRiWYwAAggggAACCCCAAAKvC+TCExo+uXAXqAEBBBBAAAEEEEAAAQQQSFPg5AvqX6gKNTbaps8FNtWTdg53lImYE1XNfb2RlpnrXbdkuIGsG7YACxFAAAEEEEAAAQQQGHEBGj4jTswFEEAAgX0JcB4BBBBAAAEEEMicwGMbt6yKe17i7/r8PpmsRuTdRsyNm6aWX9d7/bJpycSyFgEEEEAAAQSGI8AaBBBAYGQFaPiMrC/ZEUAAAQQQQAABBBAYngCrEMiQgOu63qy5Cx4emHzIkbaB8z2bdrh/18culf1EZLYZjPX0LG/9wHre7WM5GAgggAACCCCAAAII5IcADZ/8uE9CmQgggAACCCCAAAIIIIBAMgLBYDA+aMbVqDr1Nu4FO5MZH1Enft+mqeULolHXn0wgaxFAID0BohFAAAEEEEAAgVQFaPikKkccAggggAACoy/AFRFAAAEEEEhKIBgK9QVq6lc4Rk62gf+2c9jDqE6xi68qfb78ju6lSxPv/LEvGQgggAACCCCAAAKjIMAlEEhJgIZPSmwEIYAAAggggAACCCCAAALZEkj+ujND4d/E4nK8jbzNzmQ+4k3UyAnqj/+yu6MpaGMZCCCAAAIIIIAAAgggkKMCNHxy9MZQFgIpCxCIAAIIIIAAAggggMAQAqfPC/9pbLmZ7Yk0DXF674dU3qdGb+xub/5WtHPRpL0v5iwCCCCAwKgIcBEEEEAAAQR2EaDhswsILxFAAAEEEEAAgUIQYA8IIIDAUAInndu4pao2fLkYPc+e/6edyYwxqvJFf6z0lp7OZcdEzzjDl0wwaxFAAAEEEEAAAQQQQCDzAjtnpOGzswbPEUAAAQQQQAABBBBAAIEiEHh04+bvqWqliPljktt1RM3J4sV7y6Yfc6ExRpOMZ/noCnA1BBBAAAEEEEAAgSIScIpor2wVAQQQQOANArxAAAEEEEAAgWIVcF3XC9Q0PDJgxn1YRL8vIkn9XR8xZpoR6eiJtHy7d/niN9t4Gj8WgYEAAggggEBuClAVAggUiwANn2K50+wTAQQQQAABBBBAAIGhBDhW1ALBUKjP9DshT7z5FqLfzqSGqnxRHGdtd/uSE4QHAggggAACCCCAAAIIZFWAhk9W+XP/4lSIAAIIIIAAAggggAAChS1QOX/+S1W1C9odcU6yO33azqSGUf2gqnNPz8qW8CrXHZNUMIsRQCBnBCgEAQQQQAABBPJfgIZP/t9DdoAAAggggMBIC5AfAQQQQKAIBGbW1v/EqFNht3qPnckPz1y1/9Ty76xZ0fr+5IOJQAABBBBAAAEEEMgBAUrIcwEnz+unfAQQQAABBBBAAAEEEEAAgQwJVNbUPzh2i5klr/xdH3njY5+v/HbFmZ7j/bi3vfVk+5yBAAIIIIAAAggggAACoyhAw2cUsbkUAgUtwOYQQAABBBBAAAEECkLgpMbGLQMbNs9WMQvshp6xM9kxWdT7fk97y+XRtqunJBvMegQQQACBHBegPAQQQACBnBWg4ZOzt4bCEEAAAQQQQACB/BOgYgQQKAyBoOsOBGobmz1PzlWRpJs+RmR/UfP10pKy23qXL39zYaiwCwQQQAABBBBAAAEEcltgNBs+uS1BdQgggAACCCCAAAIIIIAAAjsLmKq54R/FPPmIiv7KnojbmczwqZhPGV//Y6tXNFWua2srSyaYtXktQPEIIIAAAggggAACWRCg4ZMFdC6JAAIIFLcAu0cAAQQQQACBfBKYNTf8TxnwVRgj302x7sk+R7/TXzLQFG1tHZtiDsIQQAABBBBAIO8EKBgBBEZbgIbPaItzPQQQQAABBBBAAAEEEBDBIK8EAhdf/GxlKDzbiM4Xlc0pFD9RReaVjTU/6o0sfm8K8YQggAACCCCAAAIIIIDAPgRo+OwDiNPZEeCqCCCAAAIIIIAAAgggkHsC+23YvEI8c7at7Gk7kx7GmGON+NZ0t7d8cf369SVJJyAAAQQKToANIYAAAggggEDmBGj4ZM6STAgggAACCCCQWQGyIYAAAgjkmMB0141VhBrXDvhih9nSHrEzlfEeVXPDy398+MqHOjtLU0lADAIIIIAAAggggEBBCbCZDAnQ8MkQJGkQQAABBBBAAAEEEEAAgWIRCFZfssnoYJWofFeMxFLYt8+IufQp7+We3pWtRxtjdM85OIMAAggggAACCCCAAALDEaDhMxwl1iCAQO4KUBkCCCCAAAIIIIBAVgQqay79x8CzfReomstsAf12Jj+MnmI8b013+5LPJB9MBAIIIIBAUQmwWQQQQACBfQrQ8NknEQsQQAABBBBAAAEEcl2A+hBAIDsCQdcdmLhhy1LjOCFj5J8pVvEmx/Gt6Y40X9G1YsWBKeYgDAEEEEAAAQQQQACBohcohoZP0d9kABBAAAEEEEAAAQQQQACBkRKY7rqxyjn13zLGfF6M/CHF64xRla84Tv/3u5de87YUcxCGAAIIIIAAAggggEBRC9DwKerbz+YRQACBYhJgrwgggAACCCAwkgJVcxt/6XOck1Tkfnud5P+ujxG/iDlRy0p/2rOi5RSbg4EAAggggAACCKQgQAgCxStAw6d47z07RwABBBBAAAEEEECg+ATY8YgKzKip/5fX75uloivSuNBbxfFu6ok0X3XPTU3j08hDKAIIIIAAAggggAACRSVAw6eobjeb3ZcA5xFAAAEEEEAAAQQQQCA9gcr5818K1DbMFyMhEbM1tWya+Fs+l23v05vWdjZPTi0HUQgggMCeBTiDAAIIIIBAIQrQ8CnEu8qeEEAAAQQQQCAdAWIRQAABBDIgYJs+HeLJOSryf6mmMyJV8bjc2d2+5ETXdfn9NVVI4hBAAAEEEEAAAQSGEii4Y/zAXHC3lA0hgAACCCCAAAIIIIAAAtkXUFVTMbexx9kqx6iRP6VR0YdVnZ4jp0w4I40cKYQSggACCCCAAAIIIIBAfgnQ8Mmv+0W1CCCQKwLUgQACCCCAAAIIIDAcATMjHH6u3zOn2MW32ZnqGCtqbulub2rvaW95a6pJiEMAAQQQQCBpAQIQQACBPBKg4ZNHN4tSEUAAAQQQQAABBHJLgGoQQGB4AsF5jX8fMH1fEke+JkZikuJD1am2jZ/bbr92ybtTTEEYAggggAACCCCAAAIFK0DDZ+RuLZkRQAABBBBAAAEEEEAAAQReFQiG3L4Xn+lbYl8usPMlO1MYxmeDjikpdX7R095ypjFG7WsGAtkW4PoIIIAAAggggEBOCNDwyYnbQBEIIIAAAoUrwM4QQAABBBBA4DWB2a67fWDKIW2Omln22D/sTHVMFjUdvZHmjnVtbWWpJiEOAQQQQAABBBDInACZEMi+AA2f7N8DKkAAAQQQQAABBBBAAIFCF2B/rwsEg8H4zJrG+x3POc2I/J89Yb/Zr8mP/UW1eqBkILq2o/UtyYcTgQACCCCAAAIIIIBAYQnQ8Cms+8lu8lSAshFAAAEEEEAAAQQQKDaBmXPr/+D5fB8XI6vt3uN2pjpmxo23tqej+aRoNJr4yLdU8xCHAAIIjLgAF0AAAQQQQGAkBWj4jKQuuRFAAAEEEEAAgeELsBIBBBAoOoFZ1fOfHphyyNki2iMinp2pjqNs4+i2kg3/OM91XX7PTVWROAQQQAABBBBAAIHREBixa/CD8IjRkhgBBBBAAAEEEEAAAQQQQGBfAsFgcKCituF0T7TRrn3ezlTHBMfndBw5tXzZne1LDko1SfbjqAABBBBAAAEEEEAAgdQEaPik5kYUAgggkB0BrooAAggggAACCBSoQGzyW681ca0WI1tS3qIRv40NDTrOreva2iba5wwEEEAAAQTyU4CqEUAAgRQEaPitlzveAAAQAElEQVSkgEYIAggggAACCCCAAALZFODaCBSiQDAYjFfOa1gdF5kuqo+nsUfHNo0+OVgy8OeujpbT+Ls+aUgSigACCCCAAAIIIJBXAjR88up2DatYFiGAAAIIIIAAAggggAACeStQVdvwkE9LZhmRn6WzCRt/kGPMjSUb/3lJOnmIRSCHBSgNAQQQQAABBBB4gwANnzdw8AIBBBBAAIFCEWAfCCCAAAII5KeAqpoZc7781/029E23O7jNzridqY4DHNVv9kZabujqaJqaahLiEEAAAQQQQACB3BWgMgT+I0DD5z8WPEMAAQQQQAABBBBAAAEECksgj3cz3XVj430TLlRjrrbbGLAzjWHOc4x293a0HJVGEkIRQAABBBBAAAEEEMhpARo+OX17KA6BkRUgOwIIIIAAAggggAACuSxwQnX1pkCo8asq8mUxsiXVWo1IiY39mDHmR92R5gr+ro/VYCCAQFEJsFkEEEAAgeIQcIpjm+wSAQQQQAABBBBAYA8CHEYAAQRyXqB//a+vt0V+0c6/25nOOFCN3Oh/7okr13Y2T04nEbEIIIAAAggggAACCOSawD4aPrlWLvUggAACCCCAAAIIIIAAAggUm0DwttviFaHw7bG4nCKi/5B0HioTbfil8Zj57nrXTbzzx75kiGCAAAIIIIAAAgggkO8CNHzy/Q5SPwIIIDAaAlwDAQQQQAABBBDIAYHT54X/5Kk3Q0R/LiJxO1MdKqonvzSt/OGeSNNn+Ii3VBmJQwABBBAoOAE2hAACeS1Awyevbx/FI4AAAggggAACCCAwegJcCYFcEKiqafz9QKy/UkRvlTQfauQDdn6/bOOTX0ozFeEIIIAAAggggAACCGRdgIZP1m9BwRTARhBAAAEEEEAAAQQQQACBUREI1l22ccCMqVYxHSqyPZ2LGtUpRs113ZGmlrtvaD0gnVypxPZ0tFSvbm/+UDQa9acSTwwCWRDgkggggAACCCCQowI0fHL0xlAWAggggAAC+SlA1QgggAACCIyOQDAU6pu4YUudZ+QS2/TZku5VVXTetn7vlp72lremmyupeGNO8ams8W984ubejpajkoplMQIIIIAAAgggkDUBLpyLAjR8cvGuUBMCCCCAAAIIIIAAAgggkM8Co1T7dNeNVYbC18bUNNhLvmBnOqNUVU4QMQ90L2/6dDqJkok92DfhdKOywF77v4yYX/VEmr/ds7L5vzo7O0uTycNaBBBAAAEEEEAAAQRo+PDfAAIIjLoAF0QAAQQQQAABBBBAIJMCs2oaO9Xo6SL6R0n3oXKoOnpLT3vzJaPRdDm6unqwsib83bg35pPiaZ0t/yiJy/3TvM3f6u1YeqzruvzeblEYCCCQnwJUjQACCCAwugL84Di63lwNAQQQQAABBBBA4BUBviKAAAIZFQiEGtY7ce9UMfK4qpq0kqtME5VrDopvXrFqlTsmrVzDDK6aO/f5ilBD57O+CR8WMctt2JnGxB84Yur46NqO1rfQ+LEiDAQQQAABBBBAAIG9CuRow2evNXMSAQQQQAABBBBAAAEEEEAAgd0EZs5r/HupeCcaY27f7WQKB2zX6KL9t5VHR/Nv61RXVw9WhBqvUs95v238tKjop+LGe/zIKeMj3R2tH46ecYYvha3kcAilIYAAAggggAACCGRKgIZPpiTJgwACCCCQeQEyIoAAAggggAACSQqcGlrwzMB25zzbKFmWZOiels8Q20AazaZPopBAqP5vkzZsudTnk8NE9C5RvUCNd49/+jErehcvniA8EEAAAQQQKCQB9oIAAhkRoOGTEUaSIIAAAggggAACCCCAwEgJkBeBZAWC9fXbHtmwucEzcqkY2ZJs/K7rjcg7jDH3d7e3fPGem5rG73p+pF5Pd93YjOrwc49u2HxeTMzJovJbu58vyATfP3vbm67sblvyzpG6NnkRQAABBBBAAAEE8k+Ahk/+3TMqfqMArxBAAAEEEEAAAQQQQACB3QRc1/U2lkxoMZ53noo8s9uC5A/sp+q1b+2TpuRD04uwe4mdXtt4r/rjleI4X7CNn6eM6uVOie+HvZGWq6Ptbnl6VyAagbwQoEgEEEAAAQQQ2IcADZ99AHEaAQQQQAABBPJBgBoRQAABBBDYXSDx93Aq5y1Y7cXN58XI33ZfkewRHaeiNd0dTXeuWd709mSj010fOH/h5oqa+u7+Z/uOtrm+YsSU2rnQr+W/7+1o+lxXR9NUe5yBAAIIIIAAAggUsABb25sADZ+96XAOAQQQQAABBBBAAAEEEEAgfwT2UGnlvMYfO8apEJVf7mFJUofV6MmeT2/rjTQdnlRghhYHXXegojZ8dcyLfdamXCSiU4zRG21dd/R2tFwYbW0dKzwQQAABBBBAAAEEik7AKbods2EEEChaATaOAAIIIIAAAgggULwCM+fW/8GLj5mhKj+yCsbOdEbid+n/Z0QfW72iqdK4buJ1OvlSij197iV/sI2fy2OD8SNVzC9V5HBjzHWlY7wHettb37Wura0spcQEIYAAAnkuQPkIIIBAsQpk5YfSYsVm3wgggAACCCCAAAJZF6AABBAoYoGquXOfj233nWcJIrY5ErPf0x6Oozf0Ti2/Iuq6/rSTpZjg9C8v+OumLXKqUXOuGPmF3duRRr3fDZQMfKd3+ZJjU0xLGAIIIIAAAggggECeCdDwecMN4wUCCCCAAAIIIIAAAggggEAhC8yaP//pRzf0XWw8+Zrdp7EzrWGbKwfYBK5/yvju3m8tnmCfZ2Wc29i4pbKmMTrQ73zGiIZtEYmPdfuc8fnW93Q0f+97be5Ee4zxugBPEEAAAQQQQACBwhOg4VN495QdIYAAAgikK0A8AggggAACCBS0gOu6sWdLJzSpkfli5NkMbFZFnZO87SW3d3U0/XcG8qWcIlhfv62ytmGZZ+L/ZZPcYGe/3ePZ5SXlv++NNDWuXtF8qD3GQAABBBBAAIGEABOBAhOg4VNgN5TtIIAAAggggAACCCCAQGYEyFLYAtXV1YOBUPhaVXO+3emLdqY5jM/mOtE2kXq6Iq2fSjNZ2uFVoYV/9Mf8c42Jf8KIecAmfKsRvcbnyL2rVyy5IBqNZu0j6GwtDAQQQAABBBBAAIEREKDhMwKopCwKATaJAAIIIIAAAggggAACBSAQqG28U4yepiJ/tdsxdqY1VPSdjni397Q3zVjX1laWVrI0g0+pq+uvDC14dNBsOUVVEh/z9neb8p0+x+n0P/fEmq4VTR+9qalpvD3GQACBPQtwBgEEEEAAgbwRoOGTN7eKQhFAAAEEEEAg9wSoCAEEEECgEAQqQg2/MHFnlt3Lw3ZmYkwW1dsHfP1fyYV30gRDbl+gJtzieXqqGFkmIol/CzjJceTOSeV6/dqV177bHmMggAACCCCAAAII7FEgP04kfsjLj0qpEgEEEEAAAQQQQAABBBBAAIEREqiYV/+4N37MSUbM/fYScTuHP4Ze6bdNn8tLn3uiuXvV0v2GXjK6R6vmNvylIhSuNyJHi8ovRXSiMfJ5zxt8pKe9+ZI725ccJDwQQAABBBBAAAEE8laAhk/e3joKRwCBfBGgTgQQQAABBBBAAIH8EKg6b+7zJVv1TBX9TqYqVpF5ui1+yx2R1ndkKme6eSprw78dGBwIGE/niZg/2wbQeFX5xoD47uxtb7ow2u6Wp3sN4hFAAIFiFGDPCCCAQLYFaPhk+w5wfQQQQAABBBBAAIFiEGCPCCCQJwIzwuHnArUNF9hyV9lGiGe/Z2KcFBfvnttXLHq/TWZ7QPZrlkew7rKNlXMbOuK+kulizJ12r6pqPmhUryvV8vu6Ojqmuq7Lvxlk+T5xeQQQQAABBBBAIBkBfnhLRmvE1pIYAQQQQAABBBBAAAEEEEAglwQe3dB3gRpdaGvqtzPtYRsq7ypR39297c2VaSfLYIJZ1fOfrgg1nmbUO9Om/YWdYjtSH3bM1r8fMXV8U+8Nre9KHGNmSoA8CCCAAAIIIIDAyAnQ8Bk5WzIjgAACCCCQnACrEUAAAQQQQCBnBFzX9SZt3LxM1XzRFrXNzvSH6sFG9bvdHc0L0k+W2QwVcxZ0aVn8ZNv4qRXRPhEzTkUvlgHvQVtvQzQa9QsPBBBAAAEEEMiMAFkQGCEBGj4jBEtaBBBAAAEEEEAAAQQQQCAVAWJyR2C668YCNY23+ETOslX9284MDGMbKfKN7kjL1atcd0wGEmYkhaqYwPkLNz/27NZOE9PjRfSHItJvRPZXI4tLNz6xrre9ZXou1WzrYyCAAAIIIIAAAgjsJEDDZycMniKQBwKUiAACCCCAAAIIIIAAAqMs8NsNfXc4nm+GveyTdqY/jPhFTPjAqeXf6epompp+wsxlSLyzqbKu/sGx5V6VbQJdqEY32uw++/x4o6Zn/ynlN/QuWzbNHmMggMDICpAdAQQQQACBpAVo+CRNRgACCCCAAAIIIJBtAa6PAAIIIDCaArYJEps5d/7DEndOFSOPZ+LaKlLqiZzpeHJjd8fSt2UiZyZznHRu45ZATfhmGfR9wIh+3+beYudEUTlbSuOP93Y0nx3tXDTJHmMggAACCCCAAAIIjJhAcomd5JazGgEEEEAAAQQQQAABBBBAAIHiFKiYV/+4ilNlmx6/lEw9VE9WE+9d3d78oaRTjkJA4OKLnx2crBd4njnbXu4RO8WomWKMXO+Pl/R0r2g53jbE+LeFBAwTAQQQQAABBBDIsgA/lGX5BnB5BBBAYKQEyIsAAggggAACCCCQeYFAqP5vA97YE43I/RnMfrhPZU1vx9JjjTGawbwZSRUM1m+rmtvYq2XxT6nq9cbINpt4rJ2fVp9Zd8TU8q+va2ubaI/nXO22RgYCCCBQ8AJsEAEEEHhNgIbPaxJ8RwABBBBAAAEEEECg8ATYEQIIjIBAMBTqGzRe4h0vt2Qw/UHGeLeuiTRfEI1GfRnMm7FUgfMXbn7GKQ95as6wSdeLqhEjftvluWKgZOD+NSubz7KNnzJ7joEAAggggAACCCCQBQEaPllAz51LUgkCCCCAAAIIIIAAAggggEAqAsHQgmcGJh9yjoi2GxFPMvIwbzGqy/0b/zE/I+lGIEl1dfXgrNrGOydt6DvReN6VO13i/xkjNw6WDvxwdefSN+10nKc5IUARCCCAAAIIIFAMAjR8iuEus0cEEEAAAQT2JsA5BBBAAAEEEEhJIBgMxgfM5kscMcvESCylJLsHlRl1ru5pb7k82nb1lN1P58aR6a4bqww1usbTz9iKfmxnYviMkU/6vPiD3StaanK5/kSxTAQQQAABBIpOgA0XvAANn4K/xWwQAQQQQAABBBBAAAEEENi3ACtSEwiG3L7+yVsuVWMus02fLalleWOUipSKmq+XlvibVrnumDeeza1XlXMb7iuRwSo1svD1/Rs5WB2z3F/q7719efP7cqtiqkEAAQQQQAABBApXwCncrbEzBBDIoACpEEAAAQQQQAABoWPvHQAAEABJREFUBBBAYA8CwaA70D/10FZV/errTY89rE3isE9Fztt/6vju6LJFhyQRN+pLT6u99MVAKLzEc8xMe/HfGpFB+91nLT5a4tPfdrc3udH2JQfZYwwEEMh9ASpEAAEEEMhjARo+eXzzKB0BBBBAAAEEEBhdAa6GAAIIILAngcTHu/VPfuu1Il6tbdS8vKd1yR/Xk/1lJd9du/LadycfO7oRVTWN9w/EBj4rYr72nyubcbYRdplf9a7ujpZZ61235D/neIYAAggggAACCCCQSYHMNXwyWRW5EEAAAQQQQAABBBBAAAEEEMgzgUTTpyK04CZP5DxbeuaaPkY+GfcGf9Tb3vouI2L7SZLdx16uHqy7bGNlbeM1Eo8dbhs9D9mllkNKRfRIFfP9l6eVL0r8bR9jjAoPBBBAAAEEEEAAgYwK0PDJKCfJEEAAAQQQQAABBBBAAAEEil2gsjbco46cLmKeyKDFoUa8O3val5yQwZwjlqpi3iWPl3jxGbax49qLvGCn5RC/MdLgLy1btybScpY9R9NnBwxfEEAAgfwUoGoEEMg9ARo+uXdPqAgBBBBAAAEEEEAAgXwXoH4Eil4gMCf8IzW+agux2c7MDJX3OOrr7u1oOSofmiWnhhY8Uxlq/IYx3vG22/OEqJodEMYcbVS+17Oy9Y7ookWTdhzjCwIIIIAAAggggEDaAjR80iYkQfICRCCAAAIIIIAAAggggAAChS8QCNXfbTT+GbvTR+zMyDBixhlj7rdNn/Pt97x4h0xlaMGjWuZ9VDxZbjs+m16DUGNOKZtY+vOuSPN5D3V2lr52nO+FJMBeEEAAAQQQQGA0BWj4jKY210IAAQQQQACB/wjwDAEEEEAAgSIQqKxZ+KCn5lwR/Ydk7rGfiizv6Wg9O3MpRzZT4PyF/570X5sbVJzTRaTPzh3DNrDeb/9h4rqnYptXr+1snrzjIF8QQAABBBBAoLAE2M2oCdifq0btWlwIAQQQQAABBBBAAAEEEEAAgTcIFMOLqprG36tKlYj+QTL0MCJjVMx3eyPNV0RbW8dmKO2Ippk+3Y1V1Nbf6/PJ21X0eyrS/+oF/aIyIxaXX3Qvb5l1z01N4189zjcEEEAAAQQQQACBJARo+CSBxVIEEBh1AS6IAAIIIIAAAggggEBBCARqGh6RuH5eMtj0EfswYi73l3lX2ad5M2ZUh5+TslhtXDXxbp8NrxVuG0DvVp/57rY+XRVtby9/7TjfEUCgKATYJAIIIIBABgRo+GQAkRQIIIAAAggggAACIylAbgQQQKAwBCrm1T8e799+ghh9yO7IszMDQ8eIyvzuSNPSH3V2TspAwlFJETh/4eaqmoY7PBP/tIj5ub3ooJ2JkXi30hl+2fZkT0fzSdGo608cZCKAAAIIIIAAAgjsWyD/Gz773iMrEEAAAQQQQAABBBBAAAEEEMgJgVnzL39avVjAFvMjOzM2VDS0Jbb5+nz5eLfXNl4VWvhHzxsM2KbVV+3c9Npx+3w/+/z7/o3lnavbFh9sn4vwBQEEEEAAAQQQQGCvAjR89srDSQQQQACBfBGgTgQQQAABBBBAIF8EAvMW/lsHSs5TkT+LqJHMPEptk+QM/xjTE120KG/e6ZPYetXcy56vqAkv8gadgIo+YY+98u4nIwfYPX3RV+r7cW9Hy1Gu65bYcwwEEEAAgSIXYPsIILBnARo+e7bhDAIIIIAAAggggAACCOSXANUikDcCgYsvfjau5pMq5m5bdKaaPolUx/sn+iKrl171Jvsir0ZVXf1PYrHYsbbo6+z8zzDyTmO8+46cWn517/XLpv3nBM8QQAABBBBAAAEEdhag4bOzBs8LXIDtIYAAAggggAACCCCAAAK5I1BV07hBBvpn24r+YGemhk/E+XxJWdlv8rHpM6tu4VOBDX0h9ZnTVGT7f1B0fxENSyx2z+rr2/iIN+GxdwHOIoAAAgggUJwCNHyK876zawQQQAABBIpXgJ0jgAACCCCQQwKBiy9/ttR4J6hK4m/6vPJRZmnXZxKfE/cWn7/s5p72lremnW6UE6jreoHqxjs9dT4lKvf95/J2X0aOKBkc+F1PR/P8fPt7Rf/ZB88QQAABBBBAYFQEivAiNHyK8KazZQQQQAABBBBAAAEEEECg2AVyaf+nhhY844gzW0V/mdG6VD5tGyb3RDu++RbJw0dlTf2DZrvvdDXGteVvs3PHMCL7i5FrysZ6d3d3LH3bjoN8QQABBBBAAAEEEBAaPvxHgAACCOwuwBEEEEAAAQQQQAABBEZVYEZN/b9i/dvPsE2fn9sLZ+idPqIi5rAyM+aWNcub3m7z5t2onD//pYkbt1xlRC+yxf/NTmNnYpQZI59UE1/f0940Y22nOy5xkIkAAggkKcByBBBAoKAEaPgU1O1kMwgggAACCCCAAAKZEyATAgggMLoCs+Zf/rSjeqa+4WPM0q/BdkiO9Xz6g7UdrXn5Tp/prhurrG34nuM5FSqybheRt4noD7z4hLbeZVdNEx4IIIAAAggggEARCzhFvPf0tk40AggggAACCCCAAAIIIIAAAhkWSLzTp8TzzrVpf2+n7dXYr+kP2yeRY+Ked1fPyub/Sj9ddjLMnFv/h/7tzhnGyLW2gs12vjJUxhsx5xt/2d2J/a133ZJXTmToK2kQQAABBBBAAIE8EaDhkyc3ijIRQAABBHJTgKoQQAABBBBAAIFMCyT+po8O9H/GdmnuFlEjmXqofEA8ua13eevRmUo52nmC9fXbHtvYF1bR8+21/2nnzuNIMXr/y1PHz9/5IM8RQAABBBDIhAA5EMgHARo++XCXqBEBBBBAAAEEEEAAAQRyWYDaEMi4QODiy5+Nq/miivlLhpP/l3G8+3o7Wo7KcN5RS+e6bixQ23DbwMuxI4yYB+yFjZ2vDGOmGdElPZHm+7s6mqa+cpCvCCCAAAIIIIBAcQjQ8CmO+8wusyrAxRFAAAEEEEAAAQQQQACB5AWqaho3yEDJp2zkPXZ6dmZmqEw0nrkxn5s+CYjgJZdsGowNzhIji+3rl+zceUx3jN6zpqPltJ0P8hyBkRUgOwIIIIAAAtkVoOGTXX+ujgACCCCAAALFIsA+EUAAAQQQSEEgcPHFz2o8/iUb+ic7MzdUPmCbPj/O5493S2AE6y7bOGlj31c81S/Y18/ZufM4Mu6ZaE97U9PaTnfczid4jgACCCCAAAIIjJhAFhPT8MkiPpdGAAEEEEAAAQQQQAABBBAoLoFUdhuYt/DfqnqOiP5BMvlQmej5vMia65vensm0o51ruuvGqmoa7ogbOUVEEx/x5smrD1UZK6rz4175jV0dTf/tui7/DvKqDd8QQAABBBBAoPAE+EGn8O4pO0IAgfwVoHIEEEAAAQQQQAABBIYUCNQ0PCJx/bxkuOmjIkebQV29tqP1LZLnj1mh8G88r79SjFm5y1Z8YuR0x2j34VPKK3Y5x0sEEEAgGwJcEwEEEBgRARo+I8JKUgQQQAABBBBAAAEEUhUgDgEEEBhaoGJe/eOq8gUR/Ydk7qFG5Ki48VavWZ7f7/RJkFTNvez5ilBjyKiE7esNdu483uVTublnRfNld9/QesDOJ3iOAAIIIIAAAggUggANn3y7i9SLAAIIIIAAAggggAACCCBQtAKJd/p4jlTYJs3/ZRjhw8anN0U7vpn37/RJuFTUhFtFzNl2/jHx+rVp3caII1du7/du6m5b8s7Xjufkd4pCAAEEEEAAAQSSFKDhkyQYyxFAAAEEEMgFAWpAAAEEEEAAgeIVqJrT8Jgac7EV6LMzUyPxTp+P+83YH/W0t7w1U0mzlUdtp6eitvFe3ewdI6r3iWhc/vPwicqpWuI80hVp/RR/1+c/MDxDAAEEEMg9ASpCIBkBGj7JaLEWAQQQQAABBBBAAAEEEMgdASopYoGKUONaIxIU0Sckow/zPhFzY/eqpftlNG2WkgUWLtw8MNj/ebunxbaEATt3HhNU4rcdMWXC5dH29vKdT/AcAQQQQAABBBDIRwEaPvl416gZgWEJsAgBBBBAAAEEEEAAAQQKWaCyNnyXqrfQ7rHfzkwNFZXpujV+5/pVq8ZkKmk28wTrLtv46Ia+r3iqs2wdL9n5+rCbnaJqvu7X7avviET2f/0ETxDIKwGKRQABBBBA4BUBGj6vOPAVAQQQQAABBBAoTAF2hQACCCBQ0AITn91yuxpZqCIvZ3Sjqh/dtO25b0UXLZqU0bxZSua6rve7Zzev8+JmlrX6zS5l2EPmxEHZendPpPUT0TPO8O1ynpcIIIAAAggggEDuC9gKafhYBAYCCCCAAAIIIIAAAggggAAC+Sgw3XVjj2zsWy5GwyoS29Mekj9ubDo90z/BF422to5NPj73IhJNn6p5jfdLPF5hN3fHrhXaYx8W8bpKpx9z/q7neI0AAggggAACCOSDAA2ffLhL1IgAAgiMrADZEUAAAQQQQAABBPJYwHVdzynZfLOIrrBNiww2fcQnqieWjvEWr+10x0mBPALzFv67zO+cp2I67JY227nzmGwNl/dEmpd0dTRN3fkEzxFAAIECEGALCCBQ4AI0fAr8BrM9BBBAAAEEEEAAAQSGJ8AqBBDIZ4EZ1e5Wx7f5ciOmJdP7sA2QC2Kx8isznTeb+U6+oP6FiRu21Nka6o1In/2+8/DbF2Gf0R/c2d5+kH3OQAABBBBAAAEE8kKAhk9e3KYcKJISEEAAAQQQQAABBBBAAAEEclog0fTRzd5Vtsjb7MzkGKsqDT2RpoUPdXaWZjJxNnNNd91YRW34BhWnUoz8XVVt70deeyReHDco2/7W097ysWg06nvtRMF/Z4MIIIAAAgggkLcCNHzy9tZROAIIIIAAAqMvwBURQAABBBBAILcFAgsXbtbSknm2yl/bmeGhlz0V6/tShpNmPV1Fbf29nmNmimce2K0YlfGiptu/8cn5u53jAAIIIIAAAgUswNbyU4CGT37eN6pGAAEEEEAAAQQQQAABBLIlwHVzXCBw4cXPPuub8AkRfVAy+5homx8ruyKtn7Jp1c6CGVU1jb8fs9WcYjeUeHeUZ7/vPKbafTf1tjffGm1tHbvzCZ4jgAACCCCAAAK5JEDDJ5fuBrUgUBACbAIBBBBAAAEEEEAAAQSyLVBdXT0onldnuzJ/z3QtjnhdPe1Np9m8Nr39WiDjpMbGLS9vMbPFyBK7pX473zCMyun+Md73u9qXHvaGE7xAoGgF2DgCCCCAQK4J0PDJtTtCPQgggAACCCCAQCEIsAcEEEAAgawLVMxtfDDmyXRbyDY7MzkOUNVla5ubD8xk0lzIda5t+hxcMuGrohKw9eza9LH/hqIBR+P39URaP2HPMxBAAAEEEEAAgZwSsD+sjH49XBEBBBBAAAEEEEAAAQQQQAABBEZcwMyaG/6nGjlHRV7M5NWMyDu8cea3PZ2tH9hb3nw8d3R19WBFTfgeNU6Frf9/7dxpGEspbxLxbl+zono89zgAABAASURBVCm4ttMdt9NJniKAAAIIIIAAAlkVcLJ6dS6OAAIIIFDMAuwdAQQQQAABBBBAYBQEnimZsNZTvTzTlzKih0jctH+/uXlypnPnQr5HNr78Q+PzTrK1PGLnrmOq58iqeLzcXbXKHbPrSV4jgAACCLxBgBcIIDBKAjR8RgmayyCAAAIIIIAAAggggMBQAhxDAIGRFkj8PZ/KmoYOe50r7dz1Y8rsoXSG+cS48dIR7Vw0KZ0suRjruq5XWb3gf8f4fKcaIz8S0bi84aGJd/c07r9tfOfqzqVvesMpXiCAAAIIIIAAAlkQoOGTBXQumYQASxFAAAEEEEAAAQQQQAABBDIiMGDGNqmRrowk2zmJkdP98ZLl0dbWA3Y+XCjPT66e/3TZWP/ZKt5yu6ddmj72iOi5vni8qzey7PDEK2aKAoQhgAACCCCAQNoCNHzSJiQBAggggAACCIy0APkRQAABBBBAIH2BYCjU52zsu8Bm+pWqbf3YJxkcXygti1+83nVLMpgzZ1Kd8qW6jf2TDw2rMVfbooZ6l9RHjMTu61rR9FHjuvxbi0ViIIAAAgggkIoAMekJ8ENIen5EI4AAAggggAACCCCAAAIIjI4AV8mAwAzX3erEzVnGmAczkO4NKWwT6ZKXppZ/bW1nZ+Kjzt5wrhBeBIPB+DMlE78hRi9SkWeG2NNkx9E13ZMnfHGIcxxCAAEEEEAAAQRGXICGz4gTcwEEEBgdAa6CAAIIIIAAAggggAACwxGYOa/x70adOrt20M5MjlLbCFngDfZ9LpNJcylX4u8hVYQabvLUfF6MxIaozTZ9zHXdkZbIEOc4hAACGREgCQIIIIDAngRo+OxJhuMIIIAAAggggAAC+SdAxQgggAACwxKorKl/0Kj3ebv4eTszOfzimObe9uazo9GoL5OJcylXZU3jj8WYj9v5kK3L2Lnz8KmYOT2R5uujixZN2vkEzxFAAAEEEEAAgZEUKKqGz0hCkhsBBBBAAAEEEEAAAQQQQACBfBKorFmw2njmm7bmATszNmz3Y39R6Sx97okTM5Y0yUSjsbxibuOvVXyJd/r8VXZ/qD00u2xiyU+jHd98i33OQAABBBBAAAEERlyAhs+IE3MBBBBAAIEcE6AcBBBAAAEEEEAAgVcFBqf6OsWYW159mbFvtukz3nY8Ir2RpsMzljQHEwVC9X/zbew7ypa21s5dP+LNZx0OL/XGruntaEmssUsYCCCAAAKjKMClECg6ARo+RXfL2TACCCCAAAIIIIAAAgiIYIAAAgmBYLB+29gJUmuMdCVeZ3i+zYiu7lne+oEM582pdDNcd6vnjZlt93r9UIWpmg8aY27ribSeNdR5jiGAAAIIIIAAApkSoOGTKUnyFJYAu0EAAQQQQAABBBBAAAEEikTgpHMbt8TVaRSVx0dgy+8Sn3dd7/LFbx6B3DmTsmru3OcraxtqbdOnwxa1zc5dxztFvBWJv21kXJd/i9lVJ5uvuTYCCPx/9u4ETo66TPz/81T3HLkPSJBLDhUUEfC+0XiLhECQWV1PRB1yECUQs7r+d8vdnwokBDaQhNHFuK7r7g5CCCDqesRrvRYPUPHmPnNw5Jyju57/t3MxM+meru7p6q7j06+q6apvfY/neVcgM/2kexBAAIEUCfBNRopuJqkggAACCCCAAAIIINBYAWZDAIGsCLx9/uK7PAsuUJFHIsj5JZbPf/7WlSs7Ipg7VlN2FNouDEQ/WSGoaaZyzU0zJyxdf+2lkyr0oRkBBBBAAAEEEKhbgIJP3XQMFAgQQAABBBBAAAEEEEAAAQRSI3DG/I99vxgEH3JFn74GJ+WJ2WmF/MC/pb3oc9qiRf1z51+0QsT7gJjsKOM40UQ/Lf15f4Pv58tcj2cTUSGAAAIIIIBAIgQo+CTiNhEkAggggAAC8RUgMgQQQAABBBBIj0Bn0PktE7ksiowCkTP72wY/FsXccZtzzvzFX3Qxvd8VfZ5wzyM3NbNFT86c8G+9a1YcPvIi5wgggAACCMRVgLjiL0DBJ/73iAgRQAABBBBAAAEEEEAAgbgLEF9KBErvUBk4ePunTez6CFLqULFPrltz2bwI5o7VlCpiv960/QZX5Jrtij4PHBCcSl5E/7Y9CP69919XTBceCCCAAAIIIIBAAwQo+DQAkSkQQKCaANcRQAABBBBAAAEEEEAgKQJdXf7A1OfseIeLd4Pbze2N20za1XLL169aPtdN6uoi7mtKN9/3g7kLLv6RV9RzXAHtz2XTVJnVNhB844ZVVzzH9ec1mrJINCZLgGgRQAABBFopwDcTrdRnbQQQQAABBBBAIEsC5IoAAgggkBiBWbP8gniyUEwebnzQNt4VQP7lq1dfckLj547fjLMvWPwz9+LL211164/lonPtL/akeMPzpk96SbnrtCGAAAIIIIAAAmEF3PccYbtG24/ZEUAAAQQQQAABBBBAAAEEEEAgPgJnnn/xnYGZK1TopkZGtXsu1SPymv/O+lUrnunOXc3DfU3ppqo2Z/6SO/rVe72I/q+Ue6g8O5cLrl+3csVLNmzw8+W60IYAAggggAACCFQToOBTTYjrCCCAAALNFGAtBBBAAAEEEEAAgRgJzF245CeidqGKbm14WCqHmAZrblm9emrD547hhF3zFj+opu8XlZ+UDU/1MM0HNz/5+wldZa/TiAACCKRLgGwQQCACAQo+EaAyJQIIIIAAAggggAACCIxFgLEIIBAngUe8Sb1mwX+6mMztjd7eUJAdl/f29rY3euI4zjdnweK/5LxJb3CQX68Q30wVvfaGNcte19PT01ahD80IIIAAAggggEBZAQo+ZVlojLUAwSGAAAIIIIAAAggggAACCDRNoLu7e3Bg045FYvKVaBbVc9s23ffPt65c2RHN/PGadXZ3985BCz7govovtx+wuWJQp2f6rUMK2y7KfNHnAB0aEEAAAQQQQGA0AQo+o+lwDQEEEEAAAQRiK0BgCCCAAAIIINA8gS7fH9D2/EWuGPF/UayqKh8dbCucFcXccZyza8HHHhk4+OnvdkW0/6gQn6v5yKdnFrZ2V7hOMwIIIIAAApkRINHwAhR8wlvREwEEEEAAAQQQQAABBBBAIF4CRNNEgTkf+uijnicXi9jjESzbbhZcdePqFW+IYO5YTtnV1VUsFdFccNe5/YBNRTxVvWrd6uU9t65cOfmADjQggAACCCCAAAIjBCj4jADhFAEE0iRALggggAACCCCAAAIIINBIgTnnX/yDnObnujkH3N7o7WCT4F/Xr7n8+Y2eOK7zlYpouq14novvH1Wk4J7LbecO5AeuLHeBNgQQ2CfAMwIIIIBASYCCT0mBHQEEEEAAAQQQQCC9AmSGAAIIINBQgV0HHf5DM/usm9Tc3tDNFT2OcnNftv7aSyc1dOIYTzZn6dJtudz25SJ6tcv/gKKPa2sTkXPXrVq+dv2VVx7ijtkQQAABBBBAAIGyApkv+JRVoREBBBBAAAEEEEAAAQQQQAABBMoKlD6KrKPYscJVe75RtsPYG99gfd5/9a5aNXHsUz01Q5yPZnf7O73ctr93MX5KrPw7fVTlPdZe+Lebe3rGu35sCCCAAAIIIIDAAQIUfA4goQEBBBBAIIMCpIwAAggggAACCCBQg8BpixZtPWv+xaepyO01DAvfVfWtbbbzExt8Px9+ULJ7loo+/Qdvv8yZ/ouJBGWyybm2NwfFbd/hnT5Ogg0BBBCoT4BRCKRagIJPqm8vySGAAAIIIIAAAggggEB4AXoigECtAhZYtxuz2e2N3lQ9nf/kzAldjZ44zvN1dfkD/bLdd0Wf/+fiHHT7AZsrBr3E2gvXfnnlyskHXKQBAQQQQAABBDItQMEn07ef5GsSoDMCCCCAAAIIIIAAAggggMAwgTMXLvmZiV3oGsu9I8U1j2mbIqL/cdPqy18mGXp0LfC3z5l3kSv66HJX3CnnWnot520T8wP/e9NVy47JEE3zUmUlBBBAAAEEEipQ+iYhoaETNgIIIIAAAggg0HwBVkQAAQQQQACB4QJnzV/yZTH9rGsdcHvDt0BszS2rVxzb8IljPKGqWr9t+4x70eZyES37Th8ROTHwvN4bVl36HHfMhgACCCCAAAINFkjidO57hySGTcwIIIAAAggggAACCCCAAAIItEyAhUcIBNZ/hWv6sduj2E4uSvELUUwc5zlL7/SZvHH7J0Ss9PFuxXKxqicv9CT3P9dfvfyoctdpQwABBBBAAIFsCVDwydb9JlsEEGiKAIsggAACCCCAAAIIIJAtgbkLP7ElCLT0+3zuiSBzNdHXrFu9bPU3v7RsQgTzx3bKWb5f2LrDLlexq1yQBbcP28xMReWIvCfrb1iz7MRhFzlBAIEmCLAEAgggEC8BCj7xuh9EgwACCCCAAAIIIJAWAfJAAAEEMiYwd+FFf1IN3u3S3uz2hm8q8r6d27xzGj5xzCd875IlOyaP2/FxC+RTLtQDij6uTVxB7CTP9L/XXfHZo0vn7AgggAACCCCQTQEKPi267yyLAAIIIIAAAggggAACCCCAQNoEfvXozp+Y6cpo8tLxqnbF9Vdf9oJo5o9m1kbMOutcv2/qhO3LVexqN1/R7SM2c/UwOcHraP/WTVdf8twRFzlFAAEEEEAAgYwIUPDJyI0mTQQQQACBWAoQFAIIIIAAAgggkCoB3/cDr7NwpZitiyixqXnPuy6LH19WKvo8uUM+6Vz/SUQHpczDlX2eYZr7Er/TpwwOTQgggEBrBVgdgaYIUPBpCjOLIIAAAggggAACCCCAAAKVBGhHIF0Cc85buu3R/OS/MZFfRJGZm/dYL9DPrF3rd0Yxf5znLH2825SN2z+jYle6OM3twzczNdUX5Dz5xc3XXPas4Rc5QwABBBBAAIG0C1DwSfsdJr/kC5ABAggggAACCCCAAAIIIJAwge7u7kHPdImIbpcIHqry1qk7J36qp6enLYLpYz3lLN8vBP25z5jJf40S6EFB4P3HDVdfftwofbgUNwHiQQABBBBAYIwCFHzGCMhwBBBAAAEEEECgGQKsgQACCCCAQNIE5iy46HtitjSKuE0k74o+S2YWt50bxfxxn/OsCy98YnDG099jol+uFKuJvNjz7Md8vFslIdoRQAABBBCIp8BYovLGMpixCCCAAAIIIIAAAggggAACCCDQNIGkLWRnLrh4tYpe6wIvur3Rm7oJl351zeXPd8+Z27q6uoreQO5il/h1bq+0HZTP6Q03XX3Jcyt1oB0BBBBAAAEE0iNAwSc995JMEEAg8wIAIIAAAggggAACCCAQP4FCoeCLyZ+jiMxVfI7Nm/Xe7Pvjo5g/7nPO+ehHH9VtxfPM5ItS4WEizzev7cZ1V3z26ApdaEYAgcQJEDACCCBQXoCCT3kXWhFAAAEEEEAAAQQQSKYAUSOAAAIxEzh70dIHAg3Od2E97vYotmcGMyd+8ZtfWjYhisnjPuecpUu3qeg/iMonqwk0AAAQAElEQVQPysZqpib2TO1ou3ndysueUbYPjQgggAACCCCQCgEKPqm4jeGToCcCCCCAAAIIIIAAAggggAACzRaYO/9j3zezJarSF8XaJnJ633Z9TxRzJ2HOMxdcdL9J7n0u1h+7ffdW5stzNO+turmnJ5PvhirjQRMCCCCAAAKpE6Dgk7pbSkIIIIAAAghUFaADAggggAACCCDQdIFB2fHfgcmtES08zhV9Vqy/evmprrCkEa0R62nPmnfhPe2F9jOdw/9VCDTn2t8cFLd9Z/2VVx7ijtkQQAABBNIvQIYZE6Dgk7EbTroIIIAAAggggAACCCCAwB4BviLQXIGuBf72onhLXDXmrohWHmcqPetWX/nsiOaP/bSnLVq0KSe6yBk/WClYVxB6ibUVrl1/7aWTKvWhHQEEEEAAAQSSKUDBJ5n3jagRiF6AFRBAAAEEEEAAAQQQQACBBgu8ff7iu8S8N4vJrgZPvWc6lWfnNPhEVt/lU0I4Y/5FP20rtD/fFX3uL52X2T1ReZv1537c29ubK3OdpqwJkC8CCCCAQGoEvNRkQiIIIIAAAggggAACDRdgQgQQQAABBBotMHnT1ntM7DI3b+D2hm9u7r9Zv/rypRt8P9/wyRMyYemdPhbo+a7o8/goIZ/YvuneVb2rVk0cpQ+XEEAAAQQQQCBBAmMp+CQoTUJFAAEEEEAAAQQQQAABBBBAAIE6BRo6bJbvFzqKHZ9VkdsbOvFTk7WJir915qTTnmrK3tGvN2/7RtHkDJd55XdTqZ7Xrn2rXB82BBBAAAEEEEiBAAWfFNxEUkAAAQRaK8DqCCCAAAIIIIAAAgjUJnDaokX9hUDOcqP+6vYotg4T+4cbV11+ZBSTJ2FO3/eDuQsu/pGZznfxbnd7uS0vYu9dt3rZ5b0rVowr14E2BBBA4CkBjhBAIO4CFHzifoeIDwEEEEAAAQQQQACBJAgQIwIIIFCjwNkLL77XVD4lojslmsfzVW3NhrVrO6OZPhmzdhTb/lMC/bvRolXxzm/vsAXCAwEEEEAAAQQSLUDBJ9G3LznBEykCCCCAAAIIIIAAAggggAACIwU2epP+y7V93e1RbJ6JvO3JXVs+1tPT0xbFAkmYs/RuqjMXXrTKFddWu3j73V5ms/Gitmzd6uUXbBjj7z4qMzlNCCCAAAIIINAkAQo+TYJmGQQQQAABBBAQCBBAAAEEEEAAgWEC3d3dg0HQ3y1mtw270NiTBYcUtr+4sVMmb7bBYNxSUfnP0SJXkU9tmzHxnNH6cA0BBBBAAIEQAnRpkQAFnxbBsywCCCCAAAIIIIAAAgggkE0BskZguMDchZ/YkvNyC0zkseFXGnY2U8S+/KVlyyY0bMYETtS1YMH23KPbF6jY/7rwHbf7euA2zVS+cOPqy17tOrj6z4EdaEEAAQQQQACB+ApQ8InvvSEyBLIpQNYIIIAAAggggAACCCCQOYFdB239tWe2KrLEVY6ZPEGv7e25ZEpkayRg4tm+v7MYjJujoj+oFK4r9HSqeP9149WXv84dq/BAICoB5kUAAQQQaLgABZ+GkzIhAggggAACCCCAwFgFGI8AAgggkC2Bri5/oP97P/+UaoQf7WZydkchf3q2ZA/Mdu7ChVvM5D3uyoDby26u0HOY59nnv7Z69dSyHWhEAAEEEEAAgVgKJLHgE0tIgkIAAQQQQAABBBBAAAEEEEAAgfoFuq67rhh4He9Qkbv3ztLYJ5W8ebLshlWXPqexEydvtjMXXHS/BHaqK+zcVSl6d+2YQdn5ra9efclzK/WhHQEEEEAAAQTiJUDBJ173g2gQQAABBEIL0BEBBBBAAAEEEEAgbQK3P/zY3YHIFZHlZXKoJ7kbbrj6MwdFtkZCJj5z4ZKfqXoXu3C3ub3s5opvL8x7bSt6/3XF9LIdaEQAAQSaIsAiCCAQVoCCT1gp+iGAAAIIIIAAAggggED8BIgIAQRSJeD7ftBRaP+cqN4aWWIqx3le29+5tTL/msiZ8xavc9afFNGdUvFhb+roD67+0rJlEyp24QICCCCAAAIIxEIg89/cxOIuEERkAkyMAAIIIIAAAggggAACCCCQLIHTFi3q13zuAy7qO90exeZeC9EPnzRz8qujmDxpc055dNtqNfuUi7vo9rKbqbxzygRd0bvKn1i2QwwaCQEBBBBAAAEERNw3OTAggAACCCCAAAKpFiA5BBBAAAEEEEiYwJwPffRRC+QSF3a/26PYJnsS3HLL6hXHRjF5kuac5fuFzkm2SkT/W0Z5uKLP+9ttwgfM93ktaRQnLiGAAAIItFQg84vzl3Tm/wgAgAACCCCAAAIIIIAAAghkQYAckyYwOOB91cSujzDuiQUL/unmnp7xEa6RiKnf/N4lO7Qtt9gFe6Pby28m7eLpp9fNmHRe+Q60IoAAAggggECrBSj4tPoOsD4CCMRDgCgQQAABBBBAAAEEEEAgVgJdixfvOmv+knepyF2RBabyrsHik2+LbP4ETVx6V1WbBfNcyKN9lN5ET+1f1q++/AzXjw2BZAoQNQIIIJBiAQo+Kb65pIYAAggggAACCCBQmwC9EUAAAQTiJ2AmS11U29weyZYzXfXVNZc/P5LJEzbp2xZ87BE1XWhmm0YJfZy7ful6zEYh4hICCCCAAAKtEaDgE96dnggggAACCCCAAAIIIIAAAggg0GSBKZu236hmX49qWVOd0WbBFevWXjF17xqZfjpj/uLvqclsh1D59yepPNvEblp/1aWHuX5sCCCAAAIIIBATAQo+MbkRhIEAAgggkBQB4kQAAQQQQAABBBBopsAs3y8E4/Pdbs073B7J5oo+L/d2FT4UyeQJm1RVbc6Ci39eemeViQxWDN/kCMnlr73h6qsPqtiHCwgggECiBQgegeQJUPBJ3j0jYgQQQAABBBBAAAEEEGi1AOsjgEBTBc4698InTO0jbtHH3d74zaQ9EP2H61ctf3HjJ0/ejKWiTz6//fPu+YujRW9ib/C8vlWj9eEaAggggAACCDRPgIJP86xZKUMCpIoAAggggAACCCCAAAIIINBYgSO9yf/rZvyK2yPZVGRiTuWLvSs/MyOSBRI26exuf+eZ8y76sIj9j4kEFcLPu/a/uWH15Zf0+n67O87cRsIIIIAAAgjESYCCT5zuBrEggAACCCCAQJoEyAUBBBBAAAEEGijwou7uwWIu92kxe6CB046c6rj2fMdFIxuzfK4SLHIvHv1hNAMVO799xqSzRuvDNQQQQAABBFIsEJvU3N/ZsYmFQBBAAAEEEEAAAQQQQAABBBBImQDpNFLg7O4LHxa1vxWVgUbOO2SuvCtefOSrq5edNKQt04dz5i/9o4qepyI7KkG4a1NU5QvrVl76EtfHnbqvbAgggAACCCDQdAEKPk0nZ0EEEEBgiACHCCCAAAIIIIAAAgggUJPAEbkpP1Wza0XVahoYsrObtDOvesO6NZ89OuSQ1Hc7Y/5FPxXRc0XlManwMLHxmve+eONVK06s0IVmBLItQPYIIIBAEwQo+DQBmSUQQAABBBBAAAEEEBhNgGsIIIAAAuEFSh/tVigEnxGzwfCjauuposd6QdvC3t7eXG0j09t78nO2rbNA/n30DPU5lgtWj96HqwgggAACCCAQlQAFn6hkGzcvMyGAAAIIIIAAAggggAACCCCAwBCBsxctfUCCoPQ7Y/qHNDfs0MzUPDk3t/G+VzZs0uoTxbrHrFl+YaqM+6QL8ia3V9xU5FXrVi2/9ssrV06u2IkLCCCAAAIIIBCJAAWfSFiZFAEEEEAAgUYLMB8CCCCAAAIIIIDAUIEzF37sVhX98tC2hh6bTM95+m+9/7piekPnTfBksxYs2B6ofUhUfjJaGqpy7sT8wEd7e8/hHVKjQXENAQQQKCtAIwL1C1Dwqd+OkQgggAACCCCAAAIIIIBAcwVYDQEEhgkUNbhSxO4b1tjQEzu6fTD451tXruxo6LQJnmzuvCUbPfM+7lJ43O2VNnUXLuzY9PI3umc2BBBAAAEEEGiSAAWfJkGzDALNEGANBBBAAAEEEEAAAQQQQCBLAnc8uuNOT/TTkeZs9s6+fOFlka6RsMlnb9z6Q8/zznVhD7i90jbVNFh706rlr6rUgfb6BRiJAAIIIIBAOQGvXCNtCCCAAAIIIIAAAokVIHAEEEAAAQQyI+D7fnDG/Is/5xL+mqqae45g02k5DVZ/eaXP76TZq6u+cz9/8Xoz+6xrKrq90va0wNMrblx1+ZGVOtCOAAIIIIAAAnULHDCQgs8BJDQggAACCCCAAAIIIIAAAgggkHSBbMVvIv/oig8PR5W1mZwwMT/x0pV8tNsw4o5ixyrX8G23V97MXqBil96KXWUjriCAAAIIINAgAQo+DYJkGgQQQCBRAgSLAAIIIIAAAggggECKBM6af/EvVPTfIk7pXUd5A6dGvEaipj9t0aJNuq14jgv6IbdX2jxTeWd/28CnXVFOK3WiHQEEIhJgWgQQyJQABZ9M3W6SRQABBBBAAAEEEEDgKQGOEEAAgTQJ9FvnZ1xB4ZcR5jRJVP6Bd6oMF56zdOk2C/S9rpLzyPArw8/U5APrr1l+5vBWzhBAAAEEEECgkQIUfBqpma65yAYBBBBAAAEEEEAAAQQQQACBxAh0LViwvahyrpjsiCpoU31lf35gWVTzt2jeMS87+P2ffs9Mr64y0TQ1r2f9tVcdVqUflxFAAAEEEECgTgEKPnXCMQwBBBBAAIFsCJAlAggggAACCCCQHIHxhY4/iicRfrSbK/mYfOCmNctelxyV6CPtuu664uObtl0uJv/tVgvcXnYzsRnW3//19VddStGnrBCNCCCAQCsFWDsNAhR80nAXyQEBBBBAAAEEEEAAAQQQiFKAuRFIiMBpixb1FwfbP+sKD5G9y0dUJgSmi33fzyeEpSlhnuv7fRoUF5vJz6oseKLk8p/s7T0nV6UflxFAAAEEEECgRgEKPjWC0R0BBA4UoAUBBBBAAAEEEEAAAQQQiIvA2YsWPWBq57t4+t0e1fa258+c+MGoJk/qvHMuWPpQzrNPitjOUXLwTOy8js0veacrmvG61ChQcbxETAgggAAC8RbgL9Z43x+iQwABBBBAAAEEkiJAnAgggAACCMRGYPDgn/+nqNwcZUCuaHH59Vdf9oIo10ji3GfMW/JdF/dCtw+6vdLWbiI9J82Y/KZKHWhHAAEEEEAAgdoFmlTwqT0wRiCAAAIIIIAAAggggAACCCCAQNIE4hFvV9d1RVW5ykWzze0RbTo+7+X+7taVKzsiWiCx0/56445/U5G1LgFX13Ffy246PqfBP63//JWHlL1MIwIIIIAAAgjULEDBp2YyBiCAAAII1C3AQAQQQAABBBBAAAEEmiTwq0e2/9hEPx/lcib21sH84JujXCOJc/u+HwQ6WPpdSn8cLX4TebEUClf0+n77aP24hgACCRQgZAQQaIkABZ+WsLMoAggggAACCCCAvMRfwwAAEABJREFUAALZFSBzBBBAoBkCruhQOHPjtiVq8ocI15toZv/2zWXLJkS4RiKnPmvex+8xCd6poqP9Ph8xk3d2zJzgJzJJgkYAAQQQQCBmAhR8YnZDCEcgQAABBBBAAAEEEEAAAQQQQKAhAur7gZvo78Vkh3uOZlOZumuCLuej3Q7kPWvBx37tbsDfi1jfgVdlf1Ng8sH11yx/4/4GDhBAAAEEEECgLgEKPnWxMQgBBBBAAAEEohVgdgQQQAABBBBAoDEC/bL9f9STHzdmtoqzvKPP639BxasZvuB1FK4V0R/JKA9VnWGBfJ53So2CxCUEEEAgtQIk1kgBCj6N1GQuBBBAAAEEEEAAAQQQQACBxgkwEwINEOha4G8PBr1PqsjWBkxXaYqpnif/tHat31mpQ1bb55y3dFtOvfebyL1VDI7aNV6+2ttzyZQq/biMAAIIIIAAAhUEKPhUgKEZAQTiL0CECCCAAAIIIIAAAggggEAYgbMWLf55YLY8TN/6++is6bsmXlz/+PSOnD1v8YN58z7sMnzC7ZU3T1/XPph7X+UOXMmqAHkjgAACCIQToOATzoleCCCAAAIIIIAAAvEUICoEEEAAAQRCCeS93BdU5fZQnevrlHPDFtx09Yrnume2EQK7ZhzxHdf0726vvJm0i6ef+upVy59duRNXEEAAAQQQQKCSQMoLPpXSph0BBBBAAAEEEEAAAQQQQAABBNIjUD2T08+/8CExuaZ6z/p7mMhMy9n59c+Q3pFdXV3F9s72f3ZGo/4+HycwNZ+Tm3tXffaZ7pgNAQQQQAABBGoQoOBTAxZdEUAAAQQSKkDYCCCAAAIIIIAAApkXUFWbM//ia1QifZePZ2YL169aQbGizJ+40z6waJNo7j3u0sNuH217Zoe2Lbmtp6dttE5cQwABBA4QoAGBjAtQ8Mn4HwDSRwABBBBAAAEEEEAgKwLkiQACCJQEApHzTHRT6Tiq3bR4y809yw+Oav4kz3vmo0/epyaXmoi7FZUzMdG/vT/YfkblHlxBAAEEEEAAgZECFHxGinCeVQHyRgABBBBAAAEEEEAAAQQQyIDA1I3bb1e166JNVY8rFu08M9No10ne7Or7Qf+m7WtU5QejR28TJbB/X7fqslNG71fzVQYggAACCCCQWgEKPqm9tSSGAAIIIIAAArULMAIBBBBAAAEE0i4wy/cLFgSfd3k+4faoNnUTn3vT1Zcd6p7ZRgh0+f5AzpNzXPOdbq+4uaLQOBVv+S2rPztNeCCAAAIIINBQgXRORsEnnfeVrBBAAAEEEEAAAQQQQAABBOoVYFzqBW7ftPMOMbk02kT1eMnnlke7RnJnn9198WYz+X8iulNGe6icOij580frwjUEEEAAAQQQ2CNAwWePA18RQACB0AJ0RAABBBBAAAEEEEAAgWQL+L4fnLng4ktcFj93e2SbK2i8c/2qy2dFtkDCJ96Yn/RVl8LX3T7a1qai/9/6VZfiOJoS1yIRYFIEEEAgaQIUfJJ2x4gXAQQQQAABBBBAIA4CxIAAAgggkAKBwGSlVHuHiYzxofbJb/zriuljnCWVw7u7uweDoL9bzG6rkuA409yKdWuuOLpKPy4jgAACCCCQaQEKPpHcfiZFAAEEEEAAAQQQQAABBBBAAIG4CxRk3HpXbPhr/XFWH2mir+7rtzdW75nNHnMXfmKL5vQTLvttbh9tO0UtWGBmOlonriGAAAIIIJBlAQo+Wb775I4AAgggEK0AsyOAAAIIIIAAAgjEWqBrwYLtInq+qAxIZA9rE7VP965ZcXhkSyR84skdB/3Q3YN/r5aGq/TMX7/68rOr9eM6Aggg0HQBFkQgJgIUfGJyIwgDAQQQQAABBBBAAAEE0ilAVgggEG+BMxdc9GMLZE3EUT6j3YKPR7xGYqefde65fe2D7R8Xkz+NloSJjXfFs2vWr1rxzNH6cQ0BBBBAAIGsClDwyeqdJ++4CBAHAggggAACCCCAAAIIIIBAiwU08K51ITzo9ug2k7dfv/ryl0W3QLJnPm3Roq1FLb7PFXU2jZ6JN900+ERvb29u9H6xu0pACCCAAAIIRC5AwSdyYhZAAAEEEEAAAQSqCXAdAQQQQAABBFopMHDIEXe69W90e3SbysycWXd0CyR/5uLBx/yfivcFGfWx+3f4/G37xvvfPGo3LiKAAAIIIBBLgWiDouATrS+zI4AAAggggAACCCCAAAIIIBBOgF4tE+jq6ip6bXa5qD4aYRAqKu9cf/XyUyNcI9FTl+5DLmfLXRJ/dftoW4d4wXXrVy87abROXEMAAQQQQCBrAhR8snbHyRcBBBIrQOAIIIAAAggggAACCCAQncAZH1pyt5hG/Xt2OsyT1TesWTYzukySPfPs7os3F03e6bLY7vZRNh1vKv76ay+dNEonLiGQSAGCRgABBOoVoOBTrxzjEEAAAQQQQAABBBBovgArIoAAAghEKBAE7Te56X/m9ii343Iic6JcIOlzz51/0W0ido3LI3B75c30dOvLn1a5A1cQQAABBBDIlgAFn1Tdb5JBAAEEEEAAAQQQQAABBBBAAIF6Bc5asOAxMflSveNDjmsz0/m39fS0hexfplu6m1TVERVWicrdVTJtE7WV61ZddkqVflxGAAEEEEAgEwIUfDJxm0kSAQQQQCBTAiSLAAIIIIAAAgggUJdAqdAw0O+tdYO3uD3K7ZQHgm0XRblA0uc+a97H7ymavtvlMfq7fERmqnqX3NzTM971ZUMAAQSyJUC2CIwQoOAzAoRTBBBAAAEEEEAAAQQQQCANAuSAAAL1CXQtXrwrCGy2qvTVN0O4UWryjzesuvQ54Xpns9fZ8y/6qZhe7bKvVvQ5tVjc9reuHxsCCCCAAAKZFqDgk+nbT/IZFiB1BBBAAAEEEEAAAQQQQACBCgKFmUf93Ez+p8LlhjSbSGdO8xf18NFuo3p67cGVrkO1j3YbJ2aX9K5aNdH1ZRsuwBkCCCCAQIYEKPhk6GaTKgIIIIAAAgggMFyAMwQQQAABBBAoJ9DV1VUUT3vctV1uj2wLxE6bEWw9PrIFUjDxGR9a4oo9eoVLpeD2ypvqQW1e35e/+aVlEyp34goCCCCAAALpFqhc8El33mSHAAIIIIAAAggggAACCCCAAAIlAfayAu0Dbd8RlR+XvdigRhU51DP95wZNl9ppjshN/JyI9VZL0DN7c982PbNaP64jgAACCCCQVgEKPmm9s+SFAAIINEiAaRBAAAEEEEAAAQQQyKLAaYsW9YvnXehyj/RdPm7+M29as+x17pmtgsCLursHg8D7lJg9UKHL7ubSx+QFKn/35ZX+5N0NfEEAgZoE6IwAAskXoOCT/HtIBggggAACCCCAAAIIRC3A/AgggEAmBc7sXvwbl/h/uT3SLTBvae+KFdMjXSThk9+xedtd5nmfq5aGipw4sW3i6l7fb6/Wl+sIIIAAAgikTYCCT9ruaEvyYdEwAjeuWjF/3apl/oYNfj5Mf/oggAACCCCAAAIIIIAAAgi0XsDL5a4Wk0ejjETFTh3XIS+Kco3GzN26WXzfL+Qf3Xa5uxd/qBaFmvxN5yGT3lStH9cRQAABBBBImwAFn7TdUfKJr4AWz1LV6d//vgTxDZLIEEAAgTEIMBQBBBBAAAEEEEihwGEy/jem+q0oUyt9FFlRgr+7deXKjijXSfrcs31/p3ne+0Rl82i5OM98EASf2LBq1cTR+nENAQQQQKBOAYbFVoCCT2xvDYGlT0Cf5b4p3eH7PgWf9N1cMkIAAQQQQAABBBDYK8ATAmkT2P37Y9raPh51Xurpa/vb+j4Q9TpJn3/woCN+IYF+RVVttFzU8172pO5aNFofriGAAAIIIJA2AQo+abuj5BNLgbVr/U4X2JGeyd3uOcsbuSOAAAIIIIAAAggggAACiRM4+0OLHnDlhcujDNzMXAnD++j1PVccGuU6SZ+7q6urmMvbmsDs8dFy2e0p8v/dsGr5q0brx7XIBJgYAQQQQKAFAhR8WoDOktkTmDow/nCXtRVFNrpnNgQQQAABBDIuQPoIIIAAAggkT8By8gVReSDiyI9pK9hpEa+R+Olnd1/8B1GbVy0RE+n0VP++t+eSKdX6ch0BBBBAAIE0CMSv4JMGVXJAYIRAULQZrsmsaFvdMxsCCCCAAAIIIIAAAggggEDCBB7VSX8Wk0h/l48jaStqcEHvihXj3DHbKAJnzVvS6wo6X6/60W5qr20r5CmijWLJJQQQQACB9AhQ8EnPvSSTGAuo5g8WlUC84OEYh0loCMRKgGAQQAABBBBAAAEEEIiTQHd396AUvSuijklFTm7rLH406nVSMb8FVwY2+j+sNJNO9eSy3n9dMT0VOZMEAikUICUEEGicAAWfxlkyEwIVBXIWHCcmks/bjoqduIAAAggggAACCCAwUoBzBBBAIFYCZ16w+DcuoGvcHummqv71Ky89ItJFUjD5WQs+9j+eyterpmJyRPtAcOVtPT1tVfvSAQEEEEAAgQQLeAmOndAzL5AgAPUmqEjQN+3YBxMUNaEigAACCCCAAAIIIIAAAgiMEPBy+c+KyUMjmht7atLm5XPv932f1212y1b+UhT7iIneVbnH/iuzHxzc9tr9ZxwggAACCCCQQgG+cUjhTSWl+AlYEBzuonqiq6ur6J7ZEEAAAQQaKcBcCCCAAAIIIIBAEwX6ph32oKiui3hJVZF3nHzUlMkRr5P46efOW7LRU/17ExmskszUwLOLzczRVunJZQQQQACBeAoQVVUBCj5VieiAwNgEenv9dvfDwBQxKb31f2yTMRoBBBBAAAEEEEAAAQTKCtCIQLMESv+QzzP7N7detQKD6zKm7bm6K3jXmGbIyOD+wb7vqOhPq6Xr+rzpxlXLzq/Wj+sIIIAAAggkVYCCT1LvHHEnRmDc45J3wY4PPLnTPbO1RoBVEUAAAQQQQAABBBBAAIGGCfxy0/ZfiElvwyasOJEtv+Hqqw+qeJkLuwW6Fn1ik0jwT7tPqn3x9FM3rLriOdW6cT2xAgSOAAIIZFqAgk+mbz/JN0OgLTe5060z0/0wsNk9syGAAAIIIIBAywRYGAEEEEAAgcYI+L4f5PLyURHZ5vYot85crv8jxu/yqWp85vwl31aR0juvRu2r4h2sUux295DXxIQHAggggEDaBPjLbd8d5RmBiAR2DhbzqjLONPh1REswLQIIIIAAAggggAACCCCAQFiBBvWb3X1x6R/1fbVB01WcxszOXj9j0uEVO3Bhv4DnBZ8Wsfv2N5Q9MFWV97/4iIOPLHuZRgQQQAABBBIsQMEnwTeP0JMhkPeKnWIyw0QeT0bERIlAtgXIHgEEEEAAAQQQQACBsAIWFP/D9d3q9ii3E9zkp7mdrYrALx7Z+VcR/bJUf0wZHOi7ccPataVP5Kjemx4IIJBKAZJCII0CFHzSeFfJKV4CXi7nij3jvL6238UrMKJBAAEEEEAAAQQQqCBAM84VC0cAABAASURBVAIIIBBKYHCg7ceu40/cHu2m9g/r1l4xNdpFkj+77/uBFourVKX07qtqCZ3y5K4t767WiesIIIAAAggkSYCCT5LuFrHGRKC2MAb6tENEp5514YVPCA8EEEAAAQQQQAABBBBAAIHUCHQtXrxLxPu0Syhwe5TbYbaruMTMNMpF0jD3nAuWPiSm57lcim4fdTORheuvvPKQyp24ggACCCCAQLIEKPgk634RbQIF8jlvhoo9msDQCRkBBBBAYDQBriGAAAIIIIAAAk7gzPmLf6ii/+MOI91yIu/42porjol0kZRMPnnjtltF9DtS5aEiJxbzg++t0o3LCCCAAAJZF0hQ/hR8EnSzCDWZAqbB0YHYtmRGT9QIIIAAAggggAACCCAwmgDXENgtYIXL3PMut0e3qR5TEHtrdAukZ+ZZvl8QT692GVW7Jzkv5332q6s/e6zry4YAAggggEDiBSj4JP4WkkDcBTQIDhHRTcIjiwLkjAACCCCAAAIIIIAAAhkQ8PK537g0b3d7ZNvej3Nb0Ov77ZEtkqKJB3bKt83kR1VTMsu1ads/3bpyZUfVvnRAoLIAVxBAAIFYCFDwicVtIIhUC6h3tJo9nuocSQ4BBBBAAAEERhHgEgIIIIBA2gVmd1+8xYLgS9Hnace3z5zIR5CFgC79fqVcPv9B17XP7aNuZvK2Pq//BaN24iICCCCAAAIJEPASEGO6QyS71AuY2BQT3ZH6REkQAQQQQAABBBBAAAEEEMiugE2dMGOtqFb+/a2NsSm9jvMPN6xZNrMx06V7ljO6P3qfqvS4LAO3j7ZNVU8/scH386N14hoCCCCAAAJxFyh9oxD3GIkPgUQLuP/IjleRBxOdBMEjgEDkAiyAAAIIIIAAAgggkGyBWeee2yemH488C5NDteidHfk6KVnACt61LpWH3T7q5n5uf+vjMyaeMWonLiKAAAINEGAKBKIUcK9FRzk9cyOAgKl2qieDSCCAAAIIIIAAAgggUEWAywggkHCBYk6/4VL4o9uj21Ty4tls3o0SjvjMCxaXfr/S10P0znkqK279wsoZIfrSBQEEEEAAgVgKUPCJ5W0hqFQJmDzPTO8be07MgAACCCCAAAIIIIAAAgggEGeB6Q8/uUlMvxl1jCryuicOmvCqqNdJy/y5nJTeeXV/1XxUDh3YNXBO1X6Rd2ABBBBAAAEE6hOg4FOfG6MQCCVgrtKzu6NKYfczXxBAAAEEEBirAOMRQAABBBBAILYCs3y/IBZ8xQVobo9y69CcXrX/Z84oV0rB3LO7L94sap9W1dHvi0m7qFzo+z6vl6XgvpMCAgggkHiBOhLgL7A60BiCQFiBm9Ysf577ZnFAJXgy7Bj6IYAAAggggAACCCCAAALVBLgeX4EzFy75mSsuhPkIsbEmceL6nhVvHeskWRlf9PI3uQLZ7SHyfebJMycsDdGPLggggAACCMROgIJP7G4JAaVOwLQg5u1MXV4kFGcBYkMAAQQQQAABBBBAAIEWCngFWeiW73d7pJuavfvWlSs7Il0kJZOf3X3hI2ryRQnxUJFPrl995UkhutIFgVYLsD4CCCAwTICCzzAOThBorICZHOVmDCwoFtwzGwIIIIAAAggg0EQBlkIAAQQQaJXAL7fsuF9UvxP1+u5nztcO5oOjo14nJfPbtmL7Wndf7quWj6o3Tqzw3t7e3ly1vlxHAAEEEEAgTgIUfOJ0N5oZC2s1RcBUpohYv4huER4IIIAAAggggAACCCCAAAKZEPB9vyAq/+32gYgTPjSQwQ+PugYX9wu8e9GirWpywf6GCgdmpubJ38hDdx1eoQvNCCCAAAIIxFKAgk8sbwtBpUdAx7tc3HeKQdE9syGAAAKxEyAgBBBAAAEEEEAAgWgENJf7pphE/o//VLzze1esoDAh4R791vldEf2hVHuYHNHenv9/5vu8dlbNiusIIJAIAYLMhgB/aWXjPpNliwQ8sWeaewSeFloUAssigAACCCCAAAIIIFBNgOsIIBCBwJwPffRRNe2JYOoRU9r49nHB/BGNnFYQ6FqwYIeale5LiH+Yqe+44aDxL68wFc0IIIAAAgjEToCCT+xuCQGlScBEVNXb5QW2URL7IHAEEEAAAQQQQAABBBBAAIG6BLYXVrhxT7g92s3kzN4rL3l6tIukZnZ7bNP2610297u9ymZtOc+7oNf326t0TMll0kAAAQQQSLoABZ+k30Hij7WAih4R6wAJDgEEEEAAgbAC9EMAAQQQQACBmgXmLF26zf1c+MWaB9Y8wI7t6Mi9ouZhGR1wru/3eWrnufQH3T76pvL6zpmTXjB6J64igAACCCAQD4GGFHzikQpRIBA/AROdGr+oiAgBBBBAAAEEEEAAAQQQqE+AUXUIeLbOjXrc7RFu2hkEcm6EC6Ru6jPmLfmuiXw7RGIHF80+EaIfXRBAAAEEEGi5AAWflt8CAkirgL/nFzt6orZzzgVLH0prnuSFwBABDhFAAAEEEEAAAQQQQGCEQNCRu8M1/cntkW6q+qb1PZfPinSRlE1uomvNZFe1tFRl9g1rlr2uWj+uI5AhAVJFAIGYCngxjYuwEEi8wMlTpkwWMbcnPhUSQAABBBBAAAEEahCgKwIIIIDAUIGzzr3wCVW7dmhbZMdF+cfbenraIps/ZRPvLLR9U0X+EiYtzzy/t3fFuDB96YMAAggggECrBCj4tEo+q+tmKO/BSVb676u0ZyhrUkUAAQQQQAABBBBAAAEEEBgp0L8r92UT3TSyvdHnJsGJ9/fveH6j561rvgQMeveiRVvF8/4xXKh2UvuW4NRwfemFAAIIIIBAawR4Mbo17qyaJQGTyN+6nyVOckUAgXQIkAUCCCCAAAIIIJAlga7Fi3ep2NXR56zTvTZ7a/TrpGeFKY9uvdll8yu3V9umiMl51TpxHQEEEEBguABnzRWg4NNcb1bLkEBHv0x36Zb2J90zGwIIIIAAAggggAACCAwX4AyBTAkEVrzOJbzR7VFuamLv6OFj3UIbz/L9gql3iSvmFEIMOufmay4/OUQ/uiCAAAIIINASAQo+LWFnUQQQqC5ADwQQQAABBBBAAAEEEEAgPQJt+an3quhPI8/I5Nkzg61nRb5Oihbw8t73ReU3YVIqBnZN7wp+l08Yq/B96IkAAggg0CgBCj6NkmQeBCoKWMUrXEAAAQQQQACBKgJcRgABBBBAICUCs7u7dwZiX2tGOmp6le/7vOYTEnvOhz76qIl9KVx3OyXXaW8M15deCCCAAAIINFcg0X/5N5eK1RCoTaCYswluxAQzuUd4IIAAAggggAACCCCAAAII1C2QloE7ZbD0sW6bo85HRaY/f+YEfpdPDdCDNv5fXfeH3V5l08682bt6e3tzVTpyGQEEEEAAgaYLUPBpOjkLZkVATTtEpcPlG/VnNLsl2BDItADJI4AAAggggAACCCCQCIF3zf/442JyedTBmoirScicDb6fj3qttMzftWDBdlH9VJh8TPW0/JZ7DwrTlz4IINBQASZDAIEqAl6V61xGAAEEEEAAAQQQQAABBBIgQIgIIIBAUgT0P1ykkb/Lx0TftPXwqRQlHHbYTfv7bnR9f+v2KptN9Eyv5l0+VZi4jAACCCDQdAEKPk0nZ8GWCLAoAggggAACCCCAAAIIIIAAAjEQuK/YtlFVvht1KG6NI2UweEvU68Ru/jEE9KsnBjeJyrdCTjG3ffMDrwjZl24IIIAAAgg0RYCCT1OYWSSLAmoyWUymiOpAFvMnZwQQQCCOAsSEAAIIIIAAAgi0WmDRokX9Fsj3XRyB26PcPJPgst4VK8ZFuUia5vZ9PwjEvqAi/SHyyokE597W09MWoi9dEEAAAQSaLJDV5Sj4ZPXOk3fkAoEVSp+VnMuJ98fIF2MBBBBAAAEEEEAAAQQQCCtAPwRaLqBB8UYRKzQhkJntHcHbmrBOapaYO2/Jb83kq+ESstff6z1xSLi+9EIAAQQQQCB6AS/6JVgBgWwLFFV2ZVsgadkTLwIIIIAAAggggAACCCAQrcCcC5Y+ZKr/He0qe2dXeQ/vQtlrEfIpl5ePisg2t1fZ9OneQP6DVTpxObYCBIYAAgikT4CCT/ruKRkhgAACCCCAAAIIjFWA8QgggAACCEQs4AXeP4noTon4YSInP1jYcVTEy6Rq+tMf3v6YqNwUJilV+/DX1l72tDB96YMAAggggEDUAhR86hBmCAJhBDzJzQzTjz4IIIAAAggggAACCCCAAALxFIgyqjkLFv/FxH4e5RqluT3VpwdafFnpmD2cgPp+IIGV3oEV5hM7Dh3c6b0z3Mz0QgABBBBAIFoBCj7R+jJ7hgXcN+78C58M339Sz4QASSKAAAIIIIAAAgggMCYBFS39rpjimCapMtjM1K2zuKenp61KVy4PERjoyP2vO/2r26tu5um7b1izjH/0WVWKDggkVoDAEUiMAAWfxNwqAkUAAQQQQAABBBBAAIH4CRARAgggUL+AFgs/c6Mfd3vU28lPK2x/VdSLpGn+rg8ufiwwWxkmJ7XgBDV9YZi+9EEAAQQQQCBKAQo+UeoyNwJOwMa3h/oXQa4rGwIIIIAAAggggAACCCCAQIYEHmmferuo/LkJKXumtqi3tzfXhLVSs8TcBUs+75K51+1VNu1UkfdW6cRlBBBAAAEEIheg4BM5MQtkXWDu+xZuyboB+SOAAAJZFyB/BBBAAAEEEECgnEB3d/egmHd1uWuNbjOR53dsvvuZjZ43/fN5XwiZ49z1qy89PmRfuiGAAAIIpFSg1WlR8Gn1HWD91AqoZ3w+cmrvLokhgAACCCCAAAIIIFCzAAMQKCtw5vzFX1GRzWUvNrBRRY8IxHtxA6fMxFTFoHCLS/QRt1fb2gPNfdz3fV5rqybFdQQQQACByAT4SygyWibOvECg/MupzP8hqAWAvggggAACCCCAAAIIIJBVARP7YvS5W05Eu4RHTQLFgfzv3YA/uL3qpiZvfuGhE4+r2pEOGRcgfQQQQCA6AQo+0dkyMwK8w4c/AwgggAACCCBQmwC9EUAAAQQyKaCe3uwS3+X2SDcVmX3L6tXTIl0kZZN3LV68SyVYHTKtmcVBe1PIvnRDAAEEEECg4QIUfBpOGt2EzIwAAggggAACCCCAAAIIIIAAAikUGCz+xWX1Z7fv3qL8UtCd/1+U86dx7rZC500iWnqnj1R5eOp5c6v04TICCCCAAAKRCVDwiYyWiRFAAAEEEIhEgEkRQAABBBBAAAEEUiZwxsKlD4vZz5qSlsk7vrxy5eSmrJWSRU5btKg/sOCKMOmYyKtuvGb5CWH60gcBBBCoIsBlBGoWoOBTMxkDEEAAAQQQQAABBBBAAIFWC7A+AgikSUBVTNT+vRk5qci0CfmB1zVjrTStkZPcBhW9r3pOlrOirOzt7c1V70sPBBBAAAEEGivgNXY6ZkMAgVgIEAQCCCCAAAIIIIAAAggggECiBB7NTfknbj8SAAAQAElEQVSpC/het0e7qXaI2Jt83+c1oRqk24r5+133UO/CUpHXeFvuP8n1j35jBQQQQAABBIYI8Jf7EAwOEUAAAQQQQACBNAmQCwIIIIAAAggkR6C7u3swEFsVdcRm5uoR8toTRPJRr5Wm+Usf61Y0Wx8mJ/U01ybBWXutwwyhDwIIIIAAAmMS2DfY23fAMwIIIIAAAggggAACCCCAAAIIpE6AhBIkkLPcOhPbFHXIKt5x+YMnvkZ41CTQOaX9Zjdgi9tH3XYXekxnfW/16gmjduQiAggggAACDRag4NNgUKZDYL+Ap8/Yf8wBArEVIDAEEEAAAQQQQAABBBCIi0BbMb9RRW+PPh7LaU6W7C5MRL9YalY47d2LtpoGl4VJyERetVUHjw3Tlz4INEeAVRBAIAsCFHyycJfJsTUCgfEveVojz6oIIIAAAgggUKsA/RFAAAEEYiHw1gsu2OYC+bHbI9/U5I03XrWMgkSN0rmCXueGbHZ71c2kuLRqJzoggAACCCDQQAEKPg3ETOtU5IUAAggggAACCCCAAAIIIIAAAtELqLoyjOk3o19pzwpePte152jPV75WF+gbzD0ipj+v3rPUw955/dXLjyodsSOAAAIIINAMAQo+zVBmDQQQQAABBJIvQAYIIIAAAggggAACTRAY2LTtNhO5twlLiYm9/OaenvHNWCsta3QtXrzLU/uGyydwe7VN8zl9f7VOXEcAAQRiJkA4CRag4JPgm0foCCCAAAIIIIAAAggggEBzBVgNAQSiFujy/QEz+Zeo19k7/4sGBrfN2HvMU0iBYiG41XUddHvVzd3L1/euWDG9akc6IIAAAggg0AABCj4NQGQKBBDYK8ATAggggAACCCCAAAIIIIDAmAUK/d6/uUn63R71dmhO9WVRL5K2+c9a9LG/ukLOD8LlFZzQOUGPDtc3Qb0IFQEEEEAglgIUfGJ5WwgKAQQQQAABBBBIrgCRI4AAAggggMDYBGZs3bpVVH42tlnCjrb5YXvS7ymBQOTvnzob7UgPCorF00frwTUEEEAAAQQaJdDsgk+j4mYeBBBAAAEEEEAAAQQQQAABBBCIrwCRjUHgtb5fVNHvq6pJ1A+VU9etuYJ3oNTofPaCi/9PxO4IOeyCXt9vD9mXbggggAACCNQtQMGnbjoGIoAAAgjUL8BIBBBAAAEEEEAAAQQQqCSgrpJgYv9rJrsq9Wlku1rxbxs5X2bmUu/mkLke3DZj4tkh+9INgZQJkA4CCDRTgIJPM7VZCwEEEEAAAQQQQAABBJ4S4AgBBBBAoKJAIPYrV/fZWbFDQy/oW27u6Rnf0CkzMJl5+gNR2RYmVfX0PDPXO0xn+iCAAAIIIFCnAAWfOuEYFr0AKyCAAAIIIIAAAggggAACCCCQVYG585ZsVJXvNid/O7Y48PgzmrPWgasktWWwv+9XYvJwqPhNnnXL55YfH6ovnRBAAAEEEKhTgIJPnXAMQwABBBBAAIGmCLAIAggggAACCCCQXYGgeE2Tkj9Mc20nN2mt1CzTtegTm0z0lnAJ2RHFgr4kXF96IYAAApkUIOkGCFDwaQAiUyCAAAIIIIAAAggggAACCEQpwNwIZFNgzoKlG8TkgSZkr6Ly9iask7olTIO1KlIIkZhnYm8L0Y8uCCCAAAII1C1AwaduOgYigEBsBAgEAQQQQAABBBBAAAEEEEipQCD2tWakZmZvufULK2c0Y600rTF33pLfmuhtYXJyhaG3rf/8lYeE6UufCgI0I4AAAgiMKkDBZ1QeLiIwdoHeFSvGjX0WZkAAAQQQQACBagJcRwABBBBAII0CnuZ+4PIK8w4S121MW8fAwMA5Y5ohq4NNrhdRk2oPlQnB4OAHqnXjOgIIIIAAAvUKZKXgU68P4xAYs0DHOHv2mCdhAgQQQAABBBBAAAEEEEAAgTACqeujUvytmG1sSmKBvmOD7+ebslaKFimKfV/EHguTkop+4OaenvFh+tIHAQQQQACBWgUo+NQqRn8EwgqoWalrINpWemZHAIE4CBADAggggAACCCCAAALJEvByk/8invdQM6JWsWc9+bSJxzVjrTSt0Z6Xu11R7u6QOT1t0LaeHLIv3RBAoG4BBiKQTQEKPtm872TdFAG9vynLsAgCCCCAAAIIIIBAbQL0RgABBBIkMLu7e6eI/bAZIZvINA30uc1YK01rzO6+eLOIhr1H471AThURFR4IIIAAAgg0WICCT4NBmS75Ag3LwOQJ4YEAAggggAACCCCAAAIIIIDAGAVM7KYxThF2eIepvTZs56T3a2T86uWuDzmfey1OX7nB93Mh+9MNAQQQQACB0ALuL5nQfemIAAIIIIAAAghkRYA8EUAAAQQQQACB2AicNW/J91wwD7s9+s10VvSLpG+FOfMu/F8x+UPIzE7dNL19Wsi+dEMAAQQQiFYgVbNT8EnV7SQZBBBAAAEEEEAAAQQQQACBxgkwEwKxEljfnGjsuPWrLz2+OWulbBWT3pAZTWlry789ZF+6IYAAAgggEFqAgk9oKjoiUKdAEDyjzpEMi7sA8SGAAAIIIIAAAggggAACTRJQ80oFn2ITlstZkFvQhHXSt4R5X3VJ7XJ71c0zb8ltPT1tVTvSIR4CRIEAAggkRICCT0JuFGEmWcAOSnL0xI4AAggggAACowtwFQEEEEAAgSYJ/EXEHmzKWp68s3fVqolNWStFiwyMk9L9uT1MSiZyzEO67ZQwfemDAAIIIIBAWAEKPmGl6uvHKAQQQAABBBBAAAEEEEAAAQQQSL9A5BmOzw9sEtW7Il9ozwJT2qXvpD2HfA0rMOOBrVvN5M6w/YsFOcMVfjRsf/ohgAACCCBQTYCCTzUhriOAAAIIIDBmASZAAAEEEEAAAQQQQGBsAm/48NKtEtgdY5sl9Oh8oPKy0L3puFtglu8XXMHnB7tPQnxRsxf8z5eWjQ/RlS4IIJAYAQJFoLUCFHxa68/qaRZQ2bY7PVXd/cwXBBBAAAEEEEAAgWwLkD0CCCAwBgFVVx4ILHQxYQxLlYaqJ8GLe3v99tIJe3iBtpz3bdfb3F59U33urm3e9Ood6YEAAggggEA4AQo+4ZzohUDNAmZyd2mQq/aEeht8qS87AggggAACCCCAAAIIIIAAApUELK8/dNcG3N6ETV/QtmMK7z6pUXr2vMUPisp3Rxs25NpRZsHLh5xziAACCCCAwJgEKPiMiY/BCIQS6AjVi04IIIAAAgiIYIAAAggggAACCFQUmDtvyUYT+VHFDo298Mxghxzb2CmzMVsQyNqwmarnvT1sX/ohgAACCKRKIJJkKPhEwsqkCCCAAAIIIIAAAggggAACCNQrwDgEKgt4ql+tfLWhVzz1gq6GzpiRyQoztl8nKk+GS9dmr7viiqnh+tILAQQQQACB0QUo+Izuw1UExixgJhPGPAkTIDBUgGMEEEAAAQQQQAABBBDIrEAg3tdFZaAZAJ7Ye5qxTvrWOKFogfw8ZF6dXmfxbSH70i1rAuSLAAII1ChAwadGMLojEFZAPRks9XXPJ5Se2RFAAAEEEEAAgUYKMBcCCCCAQDYFBr3+x83kT03K/rCbrr7kuU1aKzXLdHV1BaryE1W1UEkFcobv+7xGFwqLTggggAACownwl8loOsm9RuQxEHDfgN8dgzAIAQEEEEAAAQQQQAABBBBAIEUCE/vH96nI7/amFPlT0cu9MfJF0reAe0lAfmVm/WFSC1SOP2HG+Jlh+tIHAQQQQACB0QQo+IymwzUExiBgFvSVhrtvxIc8lQ7ZEUAAgWYJsA4CCCCAAAIIIIBA2gROW7SoX1R/4/Zw7x4ZI4CKvqanp6dtjNNkbnhRvDtEZWeYxFXkqLzpMWH60gcBBBAoL0ArAnsEKPjsceArApEJWCAdt6z+LL+AMTJhJkYAAQQQQAABBBAYVYCLCCCQOoGiBb8Ws2IzEjOxow+WnQc3Y600rfH2+YvvEpM/h8xpqqq8MGRfuiGAAAIIIFBRgIJPRRouINAgAdVcseiNa9BsDZ+GCRFAAAEEEEAAAQQQQAABBJIlkC8Gv3IRN6Xg44kelS8WZrj12GoVUFsbeoh6s0P3rbMjwxBAAAEE0i/gpT9FMkSgNQI583aKqNuFBwIIIIAAAnEXID4EEEAAAQQQSJDAnAuWPqSqdzYjZBOZZuad0oy10raGFoKbXU4Ft1fdVOzl69ZewaeDVJWiAwIIIIDAaALeaBf3XOMrAgjUIxDkvD5R63PftLVbW45v2upBZAwCCCCAAAIIIIAAAgg0UYClkiQQmH2tWfGa2pxmrZWmdUqFOZdP2MLcJOkrvMn1Z0MAAQQQQKBuAQo+ddMxEIFwAiaS18Hi+HC96YVAjAUIDQEEEEAAAQQQQAABBGIj0Kb2380KRsVm3bpyZUez1kvZOt8Mm4+avitsX/ohEKkAkyOAQGIFvMRGTuAIIIAAAggggAACCCDQdAEWRAABBBCIh8Dp85b8VkUebE40Om0gX3hJc9ZK1yoq+n8uo0G3h9lOXv/5Kw8J05E+CCCAAAIIlBOg4FNOhbZ6BRg3RMAL5DExt4t0BrncjCGXOEQAAQQQQAABBBBAAAEEEEBgzAKBSKmYMOZ5wk0QvGVIPw5DCgRid+19bSDMiCnFwYFnh+lIHwQQQAABBMoJUPApp0IbAg0VUM8TbWvolEyGAAIIxFqA4BBAAAEEEEAAAQSaImB2e1PW2b2IvpqPddsNUdOXfE7uFZXNIQdN8iR3Ysi+dEMAAQRiIEAIcRPw4hYQ8SCQRgENAk1jXuSEAAIIIIAAAggggEBFAS4ggEDkArmc/tFEwn5c2JjiUbHDd+YLh49pkgwOnt198WYx+0XI1HMi9tKQfemGAAIIIIDAAQIUfA4goQGBxggU8rpDVXa4b9bGFzw9tDGzpmcWMkEAAQQQQAABBBBAAAEEEBibQKB2l5thm9sj30xsWnsuOCzyhVK4gIl+o4a0Uve7kmrIna4IIIAAAmMUoOAzRkCGI1BJoJizfjPpr3SddgQQQAABBBAQCBBAAAEEEEBgDAJBIHeLSVMKPiI6NSjas4RHzQJtOr6Wgs+zrv/8yiNqXoQBCCCAAAIIOIEYF3xcdGwIpETA/YfGO3xSci9JAwEEEEAAAQQQQAABBBotwHz1Csydt2SjqjxY7/gax6mIvkJ41Cxw+vz5j4vY70MO9LxC/4dD9qUbAggggAACwwTc69DDzjlBAIEGCcx4YOtWN1Vpd9/XySR3zIYAAvUIMAYBBBBAAAEEEEAAAQQqCqjadypebPgFe1HDp8zKhBb+Y93U9J1ZYSFPBIYJcIIAAmMWoOAzZkImQKC8wCzfL4io2129R61TeCCAAAIIIIAAAgjULcBABBBAAIEKAkX9YYUrETTrKeuvvZR/0FiPbE6/bSJByKFPv+mqZceE7Es3BBBAAAEE9gtQ8NlPwUGCBWIfupo8PfZBEiACCCCAAAIIIIAAAggg5IvEKwAAEABJREFUgEDiBPpnej9yQTft98cW+vQ0t16rtgSva/eI2ZaQCeSsTZ8fsi/dEEAAAQQQ2C9AwWc/BQcINF5AJfhNaVZV5b+1EgQ7AgggEKkAkyOAAAIIIIAAAtkT6OpavEvVfteszD3NndGstdK0jubyW9xrA/eFzCkngVDwCYlFNwQQyKIAOVcS4EXoSjK0I9BAAVM5qoHTMRUCCCCAAAIIIIAAAghUEqAdgQwKWLD7XT5NyVzFXr12rc/Hlteo/Ugw7jE35H63h9oCkRM34BzKik4IIIAAAk8JUPB5yoIjBBouEKi3ozSpmbWVntlbL0AECCCAAAIIIIAAAggggEDaBEzkV03MafKUvgnPbOJ6qViqu7t7UFV/HTYZFTlhx66OcWH70+9AAVoQQACBLApQ8MniXSfn5glY8Nc9i+nRe575igACCCCAAAIxECAEBBBAAAEEUiXgmd0lojulOY92L5BjmrNUulYJilL6fUthkzpyMJebHrYz/RBAAAEEECgJUPApKQzbOUGg8QIqwjt8Gs/KjAgggAACCCCAAAIIIIDAGATSM3RQCltEzO1NyanTPD2uKSulbJGJbRNvqyGlcVrIvaGG/nRFAAEEEEBAPAwQQCBCAc39ad/s669Zfuq+Y54RQCABAoSIAAIIIIAAAggggEBCBNo6Oje7UEu7e4p8UzU7yXyf15RqpH5jd/eTovqb0MM8OSN0XzoigED9AoxEIEUC/OWcoptJKvET8KzYty+qIJAJ+455RgABBBBAAAEEEEiGAFEigAACSRCY/OATpXf3lPYmhavP/Nyhh+aatFiqljGxr4dOyOzUtb7fGbo/HRFAAAEEMi9AwSfzfwQAGINA1aHFCeMeHNLphUOOOUQAAQQQQAABBBBAAAEEEECgIQKzfL+gKr9ryGQhJlGzZx3Z35+l15RCqITr4mmwIVzP3b0mTpsx6QW7j/iCAAIIIIBACAH+cg6BRBcE6hWY+76F+/+Flfvmm1+2WC8k4xBAAIFYCxAcAggggAACCCAQA4FAm1bwMdUZAx0Ffo9PHbfdU+82UXks9FALXhS6Lx0RQAABBCIWiP/0FHzif4+IMOECKrq1lIIGcmLpmR0BBBBAAAEEEEAAAQRSKEBKCLRYwPL602aGYIXCW5u5XlrWCvLFfjP5a9h8VPWVYfvSDwEEEEAAAQo+/BlAIHKB4I+7l1CZufuZL5kUIGkEEEAAAQQQQAABBBBAIEqBgYe3ln72HIhyjaFzq+jrh55zHE6gbce4Ac/k7nC9XS/VQ9ZdccVUd8SWEAHCRAABBFopQMGnlfqsnQkBE91eStRMeLt7CYIdAQQQQACB7AqQOQIIIIAAApEJdPl+qdjTtI91E9HXCY+aBU5btKg/ELlHQj4CsSPbOoyPiA/pRTcEEEAg6wIUfGLzJ4BAUixw5+7cVLxbVq+eJjwQQAABBBBAAAEEEEAAAQQyLBBh6mo/j3D24VOr5NetuuyU4Y2chRLw5LeuX9HtVTcVe1oQFHiHT1UpOiCAAAIIlAQo+JQU2BGIUMBUduydXvukj4LPXgyeEECgggDNCCCAAAIIIIAAAgjUL/Cr+ofWPlK9/DG1j2JEzvTPJhKEk9DxRZWTwvWlFwIIJEqAYBGIQICCTwSoTInAUAENgj1vqTfx8lI4fOg1jhFAAAEEEEAAAQQQKCdAGwIIIFCPQLGY/z83ztUS3NcmbJ4Fz2nCMqlbQnP2F/eCXKh3+JSSV897Q+mZHQEEEEAAgWoC7u+Xal24jgACYxEIvNxju8eruNqPNuJzd3dPxxcEEEAAAQQQQAABBBBAAAEEhgq0WeFxd77nZ1B3EPUWqJzQ09PTFvU6aZt/dvfFm11O97q92rb7uoq8ZPcBXxBAAAEEEKgiQMGnChCXERirQFCwv+ydQz2Vp+095gkBBBBAAIExCjAcAQQQQAABBBAYLjBYGOgTlU3DW6M7s0BmPi3/RKfwqFkgEPtu2EFm8qx1V1zB7/EJC0Y/BBBAIHUC4ROi4BPeip4I1CXQ5nkFEdupex4z6pqEQQgggAACCCCAAAIIIIBAOQHaEBgiUByf2ykmDw9pivZQ7Yj+Pp0Q7SIpnV2979SSmbYXXl1Lf/oigAACCGRTgIJPNu87WTdRQPMDAyL6pJmpqfCNsPBopgBrIYAAAggggAACCCCAQHYEdjzc1y8qW5qVsYoe0Vbk59x6vNtsIPQ7fErzm6evKj2zI1BJgHYEEECgJEDBp6TAjkCEArmCN+C+4X5y9xJmh93G5xvvpuALAggggAACCDRNgIUQQAABBDIicK7v92kgoX83TANYJnmed3gD5sncFKfP//jjIvZQ2MTV5AXm+7yOFxaMfggggEBGBfiLIqM3/qm0OYpaIMh7BRHdLqWH6iEPy8NtpUN2BBBAAAEEEEAAAQQQQAABBBou4FX6SLeGr7R7wqLYS3cf8KUegd+GHaSih95y6MTpYfvTDwEEEEAgmwIUfLJ538m6iQK7Ctv71GzPL80MZGqQH5dr4vIshQACCIQToBcCCCCAAAIIIIBAKgQCkzubmYh6clIz10vVWiZ3h80nEJteKARHhO1PPwQQQKCiABdSLUDBJ9W3l+TiIDBjvBQCkV2lWFRlRq4/yJeO2RFAAAEEEEAAAQQQiJsA8SCAQPIFPLEHm5mFJ/qKZq6XprVM9Pdh81GRiap6cNj+9EMAAQQQyKaAl820yRqB5gnMOtfvc9+YbSytaCIzvc4JSS34lFJgRwABBBBAAAEEEEAAAQQQiLFA3mz3z5/NCtH9nHvsrStXdjRrvTSt4+zuF7G+kDlNUtFm/b6kkCHRDQEEEEAgbgIUfOJ2R4gnrQL7vuGeuH1H/8S0JkleCCCAAAJZECBHBBBAAAEEEIizwNsWfOwRUXmsmTH25QZe3Mz10rJWzss9KqK7PxFEQjwCsVNCdKMLAggggECGBRpb8MkwJKkjMJqAp/KE7H10tOnz9x7yhAACCCCAAAIIIIAAAggkU4CoYy2gIr9tZoDqyTHNXC8tawUiD4rJjrD5eKJPD9uXfggggAAC2RTwspk2WSPQXIHikM9QLgb2jOauzmoINF+AFRFAAAEEEEAAAQQQQKB1Ambym2aurmLHN3O9tKy1Y/DJx0SlP2w+ZvaysH3ph0CzBFgHAQTiJUDBJ173g2jSKqDeln2pqegz9x3zjAACCCCAAAIIpFiA1BBAAAEEWiQQNPsdPqYntyjVRC/77kX+VpfA/W4Pt6l36PpLL50UrjO9EEAAAQSyKEDBJ4t3PRY5ZysI82T/N3DuP7qXZit7skUAAQQQQAABBBBAAAEEEGimQE5zTX2Hj8ttau+qVRV+X627ylZRQMV+XfHiARdMg0m5Vx3QTAMCCCCAAAJ7Bdxrz3uPeEIAgcgEprVNv2/f5CbynH3HPCOAAAKZFwAAAQQQQAABBBBAoOEC/V5/U3+Hj/s5d1q79E1reCIZmNDZ3VFjmi+ssT/dEUAAgXgIEEVTBCj4NIWZRbIuMOvcc/ucwTa3l7b29VddeljpgB0BBBBAAAEEEEAAAQREMEAAgcYKTOwf36eipY8La+zElWebkMvbhMqXuVJJwMx+VelauXYV4R0+5WBoQwABBBDYLUDBZzcDXxBohoDtf5t2IZd/ejNWTMkapIEAAggggAACCCCAAAIIIFCDwPanPWYitrmGIWPtOq1Y0OljnSSL4wf783+sKW+V5/b09LTVNCY5nYkUAQQQQGCMAhR8xgjIcATCCpjo/oJPzuSosOPohwACCCCAAAIlAXYEEEAAAQQQCCsw404JTOSusP0b0G+KmEwVHjULdC1evEtVbg890GzCzGDn4aH70xEBBBBAIFMC6Sj4ZOqWkWxSBVR0/7/aUQ2OTWoexI0AAggggAACCCCAAAIItEyAhUMJbDrhBFORZn6km3ieHREqODqVEdD7yzRWaNK2nFfEuoIOzQgggEDWBSj4ZP1PAPk3TcBy+uf9i6k+b/8xBwgg0DABJkIAAQQQQAABBBBAAAGRO++805xDMz/STYqBHe/WZKtDwILgwRqGtYvJkTX0pysCqRQgKQQQKC9Awae8C60INFygrdj5f/smNZPJa9f6nfvOeUYAAQQQQAABBBBomAATIYAAApkX8H3fTOSRZkKYyjHNXC9Na7l79dsa8slbUWbW0J+uCCCAAAIZEqDgk6GbTaolgdbtXqGwU8027Y3goIMHJk7ce8wTAggggAACCCCAAAIIIIAAAo0UcDUE29nICavNlVM9ulqf5l5Pzmqa82r5fUueK649yxX1eE0vObeYSBFAAIGmCfCXQ9OoWSjrAtsfe8xMvX1vqZ82MCgTsm5C/ggggEDLBFgYAQQQQAABBBBIuUAgWnqHz2Cz0nQVJt7hUyd2ULStYrIj7HA1mXHCCSdo2P70QwABBDItkLHkKfhk7IaTbusEZogEIlb6hts9yVTV4njhgQACCCCAAAIIIIAAAi0TYGEE0iyQ92TA5efqMO5rc7apN/s+P+fWY+3ZE6LyhIR8mMhRjz/+OK/phfSiGwIIIJAlAf5yyNLdJteWCrxWdhd87t8dhMohnuSnCY84CxAbAggggAACCCCAAAIIIJBYAbPcfa4wUCr6NC0HmznppKYtlqKF8vnd7+7ZETollcOmTXuYd/iEBqvakQ4IIIBAagQo+KTmVpJI7AV830T1gX1xBmK83X0fBs8IIIAAAgjEVoDAEEAAAQQQSKaAFQsFVxGwZkZflOCZzVwvLWttD3SbqG2tIZ/DduwQXtOrAYyuCCCAQFYE+MthLHeasQjUILD7G2176hs49eTFNQynKwIIIIAAAggggAACCCCAQKsEErjuQFvxYRd2U9/hoyrT3ZpsNQoc+vD2JyzQJ2sYlps6MPnUGvrTFQEEEEAgIwIUfDJyo0kzHgKeyt0ukn63i2fyjNIzOwIIJF+ADBBAAAEEEEAAAQQQQEBEjX/YKHU8Zvl+wb1esKmWoVq0Z9XSn74IINAYAWZBIO4CFHzifoeIL1UCVtRHxKSwOymV5+9+5gsCCCCAAAIIIIBAGgTIAQEEEIiXwLRjH3QBDbq9aZuZUoSoU9vE9n8EfJgpXP/jw/SjDwIIIIBAtgQo+GTrfpNtywT2LDxoslFUdn/DbSaHr7/20kl7rvAVAQQQQAABBBBAAAEEEEAAgcYJdHV1Fd1sTf0dPu7n3Wnm+xl/rcmp17V599QyzBPeTVWLF30RQACBrAi4vx+ykip5ItB6gYO8cQ+Y2e6CTyma4i7vxNIzOwIIIIBARgRIEwEEEEAAAQQQaK5A6WPFm7lix7pDJhzczAXTspZp8ZFacjGxk2rpT18EEEAAgSYLtGg5Cj4tgmfZbArMWrBgu6ru/0WMmpMXZlOCrBFAAAEEEEAAAQQQyK4AmSPQLAEVqamIMOa4VHJW1HHCo2YBz/TPtQ3S8es/f+UhtY2hNwIIIIBA2u22+osAABAASURBVAUo+KT9DpNf/ARUfrYvKA2Ef5GzD4PnfQI8I4AAAggggAACCCCAAALJFDDpbJPgoGQG39qog/78fbVGYH19M2sdQ/9YCRAMAggg0HABCj4NJ2VCBKoIBPKL/T1UTzIz3X/OAQIIIIAAAgggsFuALwgggAACCIxdIFD58dhnCT+DiXiBaFv4EfTcJ3DWhRc+4fyCfeehnr3c0aH60QkBBBBAIDMCFHySeKuJOdECgQS/35+Ayvivrblk6v5zDhBAAAEEEEAAAQQQQAABBBDYJ5CwZxXtdC80PS1hYccmXOf3x1qCUU+wrgWMvggggEAGBNzfwxnIkhQRiJGADrT9dF84Fti0IOg4bN85zwgggEAtAvRFAAEEEEAAAQQQQACB9AioBNtrysaU3+FTExidEUiuAJEjEFaAgk9YKfoh0CCB0tu0VfXR0nTuebKp8Zm7JQx2BBBAAAEEEEAAgXoEGIMAAghUFAjM/lDxYiQXbHwxZ/yjxjptTfTntQw11SNq6U9fBBBAAIH0C1DwSf89JsMYCpjJX/aGNVFUDt57HMETUyKAAAIIIIAAAggggAACCGRVIGfe41nNPZl5a23v8BGZ2btixbg9ufIVAQQQQAABEQo+/ClAoAUCJrav4OMFJs9uQQgsiQACCCCQJQFyRQABBBBAAAEEmiSg4j1LeNQnYMU7axloZp3SsTVXyxj6IoAAAgikW8BLd3pkh0BMBVR+sz8yDY7bf8wBAggggAACCCCAAAIIIBCRANNmTyCXkx3ZyzrBGedym2uJXkWm5629o5Yx9EUAAQQQSLcA7/BJ9/0lu5gKeKb3udACt4uoPk94INB6ASJAAAEEEEAAAQQQQACBlAnMPv+i25ueUiD8nto60QuDdldNQ1UmdWi+raYxdEZABAMEEEixAAWfFN9cUouxgEnpX+3s/mxeNTs+xpESGgIIIIAAAghkSoBkEUAAAQQQGKOAylThUZdAR1tQdAP73R5uM5nWZ15HuM70QgABBBDIggAFnyzc5UblyDwNE1DTjWKydc+E2rl+zWWv3HPMVwQQQAABBBBAAAEEEEAAAQRaLDCW5c10LMOzPNY06Hd4W2owOCjvFTtr6E9XBBBAAIGUC1DwSfkNJr14ChRyxU3iyd6Cj0gg3sviGSlRIYAAAgcK0IIAAggggAACCCCAQCUBVXlWpWu0jy4w2K+BiQ6M3mvY1XbPy1PwGUbCCQIINFKAuZInQMEnefeMiFMgcMejOzaLybZ9qXgmL913zDMCCCCAAAIIIIAAAgkQIEQEEEAAgQYLtHfk+syCx2qZNjA7sZb+9EUAAQQQSLcABZ9031+yi6mA7/uBmN2xLzxTOfW2np4U/aLFfZnxjAACCCCAAAIIIIAAAggg0GKBvzZzfRMd38z10raWel5QS05Fk0m19G98X2ZEAAEEEIiTAAWfON0NYsmUgHmyv+Djij/tdw1sPSJTACSLAAIIIJB+ATJEAAEEEEAAgZYLqEp/k4M4tMnrpWa5XYVxfWLB5loS8lSOq6U/fRFAAAEE0i3QsoJPulnJDoHqAlaUX+zrpaLtbRocu++cZwQQQAABBBBAAAEEEEAgLQLkkTkBXmuq85aPy28KpLbf4SMiOlF4IIAAAgggsFeAv4T3QvCEQLMFcuOC3+5b00Q6JZfnX+XsA+E5SwLkigACCCCAAAIIIIAAAggg4AQmth8VuNcHCu4w/BbY8eE70xOBlgqwOAIINEGAgk8TkFkCgXICc85buk3Vbtt7Lef+Yyy97V33nvOEAAIIIIAAAghkSIBUEUAAAQTSJLBu1WWnpCmfZuUy69xz+9yLAhtrWU/FeIdPLWD0RQABBFIu4F5jTnmGpJd8gRRnYKZ/2ZdeYMEJvb29/De5D4RnBBBAAAEEEEAAAQQQQACBRAp4OW9yXYEzqGYBU+XTQmpWYwACCCCQXgFeXE7vvSWzRAjoj/aFqeI9+9jHH+e/SeGBAAIIlBegFQEEEEAAAQQQQACBtAuoaF+NOfIOnxrB6I4AAvEXIML6BXhxuX47RiIwZgEN7DduksDtpe2YP/T3jysdsCOAAAIIIIAAAggggEBZARoRQACBlAsE99ea4PqrLj2s1jH0RwABBBBIpwAFn3TeV7JKiEAxZ4+J2ON7wrXx4/N9z99zzNf6BBiFAAIIIIAAAggggAACCCDQaoGgKIe3OoZMrZ/zDs5UvruT5QsCCCCAQDkBCj7lVGhDoEkCuULwmIo+sG85z3Jz9x3zjAACCCCAAAJ1CjAMAQQQQAABBFoq4Kk8o6UBJHjxQHSw1vBVvPHCAwEEEEAAASeQuYKPy5kNgfgIjJdtprJ5f0Bqr99/zAECCCCAAAIIIIAAAggggEDdAgxEIIkCqt7+fxQaNv6i2TFh+9IPAQQQQCDdAhR80n1/yS7mAnPOW7pNzB4cEuZz13/+ykOGnHOIAALRCDArAggggAACCCCAAAIIIBA7gUCs5nf4eKq52CVCQAjER4BIEMiUAAWfTN1uko2ngPfzoXEFhcHnDD3nGAEEEEAAAQQQQCAqAeZFAAEEEEAg+QKmdkTysyADBBBAAIFGCFDwaYQic6RToElZmQzeNXQpT/SFQ885RgABBBBAAAEEEEAAAQQQQACBCAViNHXOAqs5HLODah7DAAQQQACBVAp4qcyKpBBIkIBp7hfDwjU5znyf/zaHoXCCAAIItE6AlRFAAAEEEEAAAQQQaJaABrl7mrUW6yCAAAIIDBdIwxkvKqfhLpJDogXmzluyUUX+uC8JM3nG16dPn7jvnGcEEEAAAQQQQAABBBBouQABIIAAAk0RKLTX/jt8VLyjhAcCCCCAAAJOgIKPQ2BDoNUCpvaD/TGoHDWouyj47AdJwgExIoAAAggggAACCCCAAALxFDCTE5odmYnMbPaaWV7PxCZnOf/m5s5qCCCAQLwFKPjE+/4QXUYEVPT7Q1I9uqh5Cj5DQDhEAAEEEEAgEQIEiQACCCCAAAJ7Bew5ew94QgABBBBAAIEmClDwaRI2yyAwqkB//tvu+qDbS1veywWzSgfsCCCAAAIIIIAAAggggAACyRIgWgTGIhAUtFDH+Fxvb2+ujnEMQQABBBBImQAFn5TdUNJJpsD29l0DKvLUL2Y0fb3wQACBNAqQEwIIIIAAAggggAACCCBQUeChQv7BihcrX5g0uPmvfKxbZR+uINAKAdZEoCUCFHxaws6iCAwXmJzr7w9M9hd8XPHn1b7v89+n8EAAAQQQQAABBNIoQE4IIIBAcwR410dznBu5yqJFi/prnc9EvIPaO7TWcfRHAAEEEEifAC8op++eklECBXZNO6Ff1P6yO3T3xX2z9rQXPm3S89whGwIIIIAAAggggAACCCCAAAJ1CeS33Mvv0qlLrkmDWAYBBBBAAIEGC1DwaTAo0yFQj0BXV1fRM/2jG+tqPe6r2wqBvdQ9sSGAAAIIZFSAtBFAAAEEEEAAgbEKeIHHx3yNFZHxCCCAAAIIRCzQyOkp+DRSk7kQGIOAq/j8xg0vun335om+evcBXxBAAAEEEEAAAQQQQCCrAuSNQEIFdEtCA09k2CoyZftA/9REBk/QCCCAAAINFfAaOhuTIYBA3QJe4P3ZDQ7cvnsztWf09lwyZfcJXxAoK0AjAggggAACCCCAAAIIIFBZwKQ4sfLV6K6Y2e+jm52Zywjk2qyD1/jKwKSniUwQQACBcAL8ZRDOiV4IRC5w5oKL7neLPPWvoEwOyxf0MNfGhgACCCCAAAIIVBbgCgIIIIAAApUEPK8lvxvWU93/6RWVQqMdAQQQQAABBBovQMGn8aaxmpFgkiWgYv85JOLD1PIUfIaAcIgAAggggAACCCCAAAIIIFBegFYEEEAAAQQQQICCD38GEIiRQGC5bw4Jp01zdtKQcw4RQACBegUYhwACCCCAAAIIIJBFgcDGZzFtckYAAQQyLEDqGReg4JPxPwCkHy8Bb/vgT1Rkx/6oTF6//5gDBBBAAAEEEEAAAQTGJMBgBBDImoCnekrWcs5ovp0WyLiM5k7aCCCAAAJDBCj4DMHgEIFWC8xZunSbifz5qThslpnpU+cRHjE1AggggAACCCCAAAIIIIBAqgT4eTJVt3OUZGy8aHH8KB2GX+IMAQQQQCC1AhR8UntrSSypAmbyy6di1/E3XXPlK5465wgBBBBAAIFoBZgdAQQQQAABBNIjYKrHpicbMkEAAQQQQACBagK1FHyqzcV1BBBogICqDin4iARB4c0NmJYpEEAAAQQQQAABBBBAAIGwAvRLiYCKzGxFKoHpA61YlzURQAABBBDIugAFn6z/CSD/2AmoZ39yQW1z++7NFYDetGHDhvzuE74gEAsBgkAAAQQQQAABBBBAAIG4C9zc0zNeVFvyuo+Xs7vi7kN8CCAQRoA+CCCQNIGW/MWfNCTiRaCZAoMS3OPW21/wccdHbPvtbUe6ZzYEEEAAAQQQQCA+AkSCAAIIIBBrgV3y+MFixj8ejPVdIjgEEEAAAQQaK0DBp7GezLZXgKf6BbbolHtUZNP+GVQmB3k9bv85BwgggAACCCCAAAIIIIAAAghUEegotLeLWOSv+1QJg8sIIIAAAggg0EQB/uJvIjZLIRBGoLu7e9BM/nd/X5MJZvqc/eccIIAAAskRIFIEEEAAAQQQQACBVgl4eoiJtrVm+eLO1qzLqggggAACLRJg2ZgIUPCJyY0gDASGCgSmXx9y7qnZi4acc4gAAggggAACCCCAQIIECBUBBFoioMXx2qJ3+Mw5f+ltLcmZRRFAAAEEEMi4AAWfjP8BIP14CuTGFb4vKgP7ojOVV+07Tt0zCSGAAAIIIIAAAggggAACCDRcQEUOFlF+h4/wiI0AgSCAAAIIRC5AwSdyYhZAoHaBOect3WYmv9o30n2jftSNV13yvH3nPCOAAAIIIJA2AfJBAAEEEEAAgcYKWCBT3Iw5t7MhgAACCCCAQEYEklDwycitIE0ERgrYd4e2WC73zqHnHCOAAAIIIIAAAggggAACKRMgnQYKmMh0N10rCj6b3bpsCCCAAAIIINACAQo+LUBnSQTCCGhgP1KRwr6+Kh4FH+GRbQGyRwABBBBAAAEEEEAAgTACvu97onJ4mL6N7qNijzd6TuZDAIGsCZAvAgjUK+DVO5BxCCAQrUA+p/eZyKP7V1E77OZrLnvW/nMOEEAAAQQQQACBLAqQMwIIIIBAVYF/dD3MZIJ7av6mWmz+oulZccNavzM92ZAJAggggECzBSj4NFuc9SIVSNPkA8XBh13B56GnctJcEORe+tQ5RwgggAACCCCAAAIIIIAAAggcKPA9Efd6jx164JXoW9zPsQ9Gv4pIWtd4YmB8S96ZlVZP8kIAAQSyJuC+AchayuSLQDIE5i78xBb3H+hf90drVvrs5eebme5v4wABBBBAoJwAbQgggAACCCCAQKYFJh16qKrozJYgmPS1ZN2ULGpVC5tfAAAQAElEQVSaK/3sn5JsSAMBBBCIXIAFRgi415NHtHCKAAKxEQhMfjo0GBN7wf/8+/LxQ9s4RgABBBBAAAEEEEAAgXICtCGQXYGN/f2eijytFQJmsqMV67ImAggggAACCEjpLb4wIIBAXAVygd00NDYze+6TTwxS8BmKUu8x4xBAAAEEEEAAAQQQQACBlApsLxQ8a1HBRz3hI91S+ucqsWkROAIIIJAhAd7hk6GbTarJEzjjgiV3u6j/5Pbdm6rOaMu3v3L3CV8QQAABBBBAYMwCTIAAAggggEAaBToneie2LC+TQsvWTsPCgYxLQxrkgAACCCDQGgEKPpXduYJATASGv8tHRM8WHggggAACCCCAAAIIIIAAAo0SSN08hYHi81qXlN7burWTv7JXkMOTnwUZIIAAAgi0SoCCT6vkWReBkAJBUb7uugZu372p2NlfWrZswu4TviCAQBMEWAIBBBBAAAEEEEAAgWQJqBe0puCjap7YYLK04hVtkOPXL8TrjhBNtgTIFoHkC3jJT4EMEEi3QKG9+BeX4SNu37eNm9Spp+474RkBBBBAAAEEEECgCQIsgQACCCRIQEVa8pFuatYvGmxJEFUqQjXTrbk2fTIVyZAEAggggMCYBCj4jImPwQjsEYjy6zSR0jdt+3+PT2ktzelrTMR9Dy88EEAAAQQQQAABBBBAAAEEEBguYPry4Q1NOysWJNfftNVasFDUS+YCa691DVUpBAWP351UKxz9EUAAgRQKUPBJ4U0lpXQJPD7tF9tdRr9x+5DNXnjTpZdOHNLAIQIIIIBA6wWIAAEEEEAAAQQQaLnA9T1XHCoqLfkYcFPplyLv8BnjH4Ijxzie4QgggAAC0QvEdgUKPrG9NQSGwB6Brq7riqrysz1n+78+Sya2HbL/jAMEEEAAAQQQQAABBBCIiQBhINBigUE5tGURmATq6UDL1k/Dwmq5NKRBDggggAACrRGg4NMad1ZFoCaBQQ1+PmLAYYEGzxrRxmkSBIgRAQQQQAABBBBAAAEEEIhQwMsVnhnh9KNPrdKnphtH78RVBDIiQJoIIIBACwQo+LQAnSURqFXg7ed/7C9uzG/dvm9rU7Oz9p3wjAACCCCAAALJEiBaBBBAAAEEohLIiR4e1dzV5rVAirm87arWj+ujCrSuYDdqWFxEAAEEEEiCAAWf+N0lIkKgnIC5xv90+1Ob6pyenp62pxo4QgABBBBAAAEEEEAAAQQQSJBAw0M1Mw1En9PwiUNOqCp9s7sv3hyyO93KCJg4xTLtozW5+/5kfzH/5Gh9uIYAAgggkA0BCj7ZuM9kmQKBXE4+NyKNmU8rbH/ViDZOEUAgNQIkggACCCCAAAIIIIBAbQLXXXFFpxtxsNtbs6n8pjULZ3xV1eLk8YVixhVIH4EECxA6Ao0ToODTOEtmQiBSgUNl0pNiw795DjQ4I9JFmRwBBBBAAAEEEECgtQKsjgACCNQgkG/vG29mLftINzXh3T013K+RXTes9TtNZObIds4RQAABBBAIK0DBJ6wU/RBoscAtDz9cFJWfDQ1DRV+z7oorpg5t4xgBBBBAAAEEEEAAAQQQQCCbAhbkxqnIIa3KPhD7Y6vWTsO62wfEc/cvXy4X2hBAAAEEEAgjQMEnjBJ9EIiBgO/7gYj+2u1FeepxuHTacU+dcoQAAgggkEEBUkYAAQQQQAABBHYLtGtuojs4zO0t2dRyf23JwilZdFdBPFGtueCjKls7Hti6NSUMpIEAAgggUFmg6hWvag86IIBAbASCwPulie0aEtBBEtgJQ845RAABBBBAAAEEEEAAgUwKkDQCIsU2e5ZzaHN7S7agjXf4jAV+XH5i6Xcw1f6RbiaFWb5fGMvajEUAAQQQSIcABZ903EeyyIhAZ5D7pfuPdvuQdHOiweuHnHOIQHkBWhFAAAEEEEAAAQQQQCD1AkEgr2xVkqpqcz980Z9atX5q1jXT1ORCIq0RYFUEEMi0gHvtONP5kzwCiRI4bdGifhO5ZWjQanr6rStXdgxt4xgBBBBAAAEEECgnQBsCCCCAQLoFPNEXtixDs3tatnZaFg68DlftmV5HOk/UMYYhCCCAAAIpFPBSmBMp1SfAqIQIeEGwZlioKlP78wNvHdbGCQIIIIAAAggggAACCCCAQBYFXhMi6Ui6BCJ3RzJxhiY1byDn0q35H3SqBQ+4cWwIIIAAAggIBR/+ECCQMIEzFn7sl2Iy7Js5VTk/YWkQLgIIxFaAwBBAAAEEEEAAAQSSKLB+9bKTXNwt+/09qvpntz7bGAQGzOswsZrf4WOqNoZlGYoAApkVIPE0ClDwSeNdJafUC5jKd4YlafLiG1ddfuSwNk4QQAABBBBAAAEEEKhXgHEIIJA4ATPvOa0M2iy4t5Xrp2LtQS8nop1S48NVex6rcQjdEUAAAQRSKkDBJ6U3lrTSLeCJftt9QxcMyXKCefKSIeeRHjI5AggggAACCCCAAAIIIIBAzATUXtnKiMz0j61cPw1rt6nMrCcPT7z76xkXZgx9EEAAAQSSJeAlK1yiRQCBkkAhKN6pIhtLx3v3Dg3kVN/3+W96LwhPCCCAAAKRC7AAAggggAACCMREoLfXbxfR46VlD93uabCpZcunZGHT4OiUpEIaCCCAAAItEojoxeEWZcOyCGREoNgW/NUVfB4emq6pveb0Qw/NDW3jGAEEEEAAAQQQQAABBBCIVoDZYyGwafx0Eavr3SENid9sh2pue0PmyvQkubo+qj0IZNjrA5kmJHkEEEAg4wIUfDL+B4D0kynQ1f13T5roj4dG76kcf3+w8/ChbRwj0HIBAkAAAQQQQAABBBBAAIHIBTzVUrGntEe+VtkFVB8LZODxstdoDC+gdmj4zk/19DzeXfWUBkctE2BhBBCIhQAFn1jcBoJAoHYB0+CrQ0eZSacFhQuHtnGMAAIIIIAAAgjEQYAYEEAAAQSiFcgF3gwRdbu05GFi261o21qyeLoWbeHH8qULkmwQQACBrApQ8MnqnY9P3kRSp8BZ85Z8T0TvkSEPz9N3967yJw5p4hABBBBAAAEEEEAAAQQQQCDlAqr2YhFra1Wa7sWlR+cu/MSWKutzubrAwdW7HNhjzvwldxzYSgsCCCCAQBYF3N/JWUybnBFIh4AFwQ3DMjGZ3i4TZg1r4wQBBBBIhABBIoAAAggggAACCNQtoPKCusc2ZKD+pSHTMMkJECCAAALpFyDDKAUo+ESpy9wIRCzgia53Swy6ff9mnr7e931vfwMHCCCAAAIIIIAAAggkRYA4EUCgXoFX1zuwEeNMAt5hMkbIm3v88W6KdrfXtKnJ72oaQGcEEEAAgVQL8KJwqm8vyaVdQNvy94jKX4fm6b7Ze+nLjpg8dWhbWo7JAwEEEEAAAQQQQAABBBBAYLjA+tWXln7vy9OGtzb3rCjB75u7YvpW6x/sPKaurFR21jUu5oMIDwEEEECgPgEKPvW5MQqBWAj0TXviETEb9q95VOR5fYWgpd/sxwKHIBBAAAEE0ipAXggggAACCCAwTCD/tmGnzT8J2jfu4h0+Y3TPWf7p9UwRiNxZzzjGIIAAAgikUyBlBZ903iSyQqCSQFeXP2AiPxp63Z1PMLOuoW0cI4AAAggggAACCCCAAALpEiCbfQJmwev3HbfiWUX+Otv3eZfJWPFzdlA9Uzj/7fWMYwwCCCCAQDoFKPik876SVYYEgkDXiair88j+h5p+2Mzc9337mzhAIFsCZIsAAggggAACCCCAQAYEbu5ZfrContDKVAORH7dy/bSs7V6gO6meXNzP/n+oZxxjEEiNAIkggMAwAff3ybBzThBAIGECZy+8+F5X7/nhiLAPvXHViteNaOMUAQQQQAABBBDIlADJIoAAAmkXKATesS7HSW5v3aZ2W+sWT9HK6k2tJxtT3VbPOMYggAACCKRTwEtnWmSFQFWBVHWwQK4ZmZDnBe8c2cY5AggggAACCCCAAAIIIIBAegQ8KR4rKi0t+Ggh9/2YiyYjPLMj6gk0J/aresYxBgEEEEAgnQIUfNJ5X8kqYwL5vHzLpbzZ7fs3E33B+is/fcj+Bg4QQAABBMoI0IQAAggggAACCCRXwAI9WUzaW5eBbbE87zAZq39vzyVTTKWed/gEXk4HhAcCCCCAQAiBbHSh4JON+0yWKRfYtcPbIao/H56mHS/5juOHt3GGAAIIIIAAAggggAACBwjQgEBSBVRe2srQTfQBk8LOVsaQhrVznk5yhbvJteaiYlsKQa6v1nH0RwABBBBIrwAFn/TeWzLLkEDX4sW7NLDS2+jtqbR1vKmcKTzGLMAECCCAAAIIIIAAAggggEDcBG5dubLDxfRCt7dyu7uwK7etlQGkYe32Yuc4FRlXcy7qudcCgmLN4xhQUYALCCCAQNIFKPgk/Q4SPwJ7BYo5+6E7LLj9qU1l7lMnHCGAAAIIIIDAGAQYigACCCCAQKwEBtqC17qAan5XiBvTsM0TffjOrVv7GzZhRicy7Z8kom6Xmh5mtqV9XBvv8KlJjc4IIIBAugW8dKfXrOxYB4HWC8w9f8lP1H2zPSKSo9avXva2EW2cIoAAAggggAACCCCAAAII1CUQn0FmhXe1OhrT4A++7wetjiPp6xcHc9NMbFodeTyxfXAnv8OnDjiGIIAAAmkVoOCT1jtLXpkUKIr8y8jETbxFvb29uZHtnCOAQAQCTIkAAggggAACCCCAQBME1l976SQVOaMJS42+hNmvRu/A1VACajNdv7zba922j5Npg7UOoj8CCDRAgCkQiKkABZ+Y3hjCQqAegbM2brvSjdvl9iGbPS+/8f5nDGngEAEEEEAAAQQQQCBCAaZGAAEEohawvvzzTGR81OtUmz+X835frQ/XqwuY2hHVex3YQ0Uent3dvfPAK7QggAACCGRVgIJPVu88ebdKINJ11fcDFf3OsEVUDtKcvGJYGycIIIAAAggggAACCCCAAALJFfCCF6lISz/JQVX+MLv74s3JRYw88tAL5MQ7PnTnIR0Dse1DTjlEAAEEEEBAPAwQQCBdAmb2dZdR4PY9m0m7WPD6PSd8RQABBBCIhwBRIIAAAggggAAC9Qn09PS0mekL3OiWvqbjfva8xcXA1hABO6meaXLmPVzPOMYggAACCDRToLlrtfSbg+amymoIZEOgqPpLE3lChjxUdE7pM56HNHGIAAIIIIAAAggggAACrRZgfQTqEJgmj49XkRfWMbShQwJPbmjohBmezBXPjqwn/aInd9czjjEIIIAAAukVoOCT3ntLZhkVKPbp7Wry4Ij0J9lA7oMj2jiNuQDhIYAAAggggAACCCCAAAIjBfJBrlQcOG5ke5PPH5swXu5o8pqpXO6Gq68+SFSfVk9yZspH6tUDF8MxhIQAAgg0SoCCT6MkmQeBmAh0LV68S1V6R4bjikCfuHXlyo6R7ZwjgAACCCCAQKwFCA4BBBBAAIFhAp7pGa6h3e2t3P50A0SKIwAAEABJREFUz67JA60MIDVrt/U9p95cNFd4oN6xjEMAAQQQSKcABZ9E31eCR6C8gKfeWndl2DffJjK1Pz/wOtfOhgACCCCAAAIIIIAAAgggkCiBp4J1P9u9/6mzlh399uGHHy62bPUULaxFOaHedJ5o3zny0z3qnYpxCCCAAAIpEaDgk5IbSRoIDBWYPW9x6Zu+DUPb3HHeU3mz7/v8d+8w2BBIlQDJIIAAAggggAACCGRC4IY1y05UkWe1ONnAxH7nfrYMWhxHKpZXsVfVmci9557r99U5lmEIIJBUAeJGoIoAL/xWAeIyAkkVMLUvuNgLbt+/mcmsEw7tnLS/gQMEEEAAAQQQQACB1AiQCAIIpF/AM3lbDLLsN/X+EoM4UhGCmh5VTyKq8pt6xjEGAQQQQCDdAhR80n1/yS7DAsVi8Xcu/YfdXtr27Sfmi94p+054RgABBBBAAAEEEEAAAQQQSIZAb29vu4i+TFr+sL58ISj9vNnySJIeQO8Kf7qoHFFPHhbIbyuMoxkBBBBAIMMCXoZzJ3UEUi0QDLTfJWYj/8WP56n38VQnTnIIIIAAAqMIcAkBBBBAAAEEkirQtuWvh7nY6/59L25sQzYV3XjGBUvubshkGZ+ko3PcjEBkXF0M6o38eb+uaRiEAAIIIJAugacKPunKi2wQyLxA1+LFu0zsugMgTN6wfs3lzz+gnQYEEEAAAQQQQAABBBDIhgBZJlIgZx1HqcixrQ9ev976GNIRQSHIHaJWX8GnIPLTdCiQBQIIIIBAIwUo+DRSk7kQiJnAYEf+JhHdLsMfOTM70/d9/vsf7sLZXgGeEEAAAQQQQAABBBBAIH4CRZWzTCTf6siKZte3Ooa0rO/lghmq0llrPu7PweC2jVsfqnUc/REYKcA5AgikT8BLX0pkhAAC+wS6Prj4MTH70r7zIc9vPmF6+0FDzjlEAAEEEEAAAQSGCnCMAAIIIBAjgQ1r13aKFf82BiFt3pSf9LMYxJGSELyjXfGm5oKPijw04QQJUoJAGggggAACDRSg4NNAzOxMRaZJErCCfMHFW3D7kE2f197RFoOPAhgSEocIIIAAAggggAACCCCAAAJlBZ7YteUtKjqj7MVIG4dP7ooTP+3u7h4c3spZvQLuRbkj6xtrf55xp1DwqQ+PUQgggECqBdzfLanOj+QQyLzAuAle6Zdp3jYcwsZLUd8/vI0zBBBAoEYBuiOAAAIIIIAAAgg0RUBFzmjKQlUWUbEfVenC5RoEApPn1dB9SFdv46YTfufqb0OaOEQAAQSiFGDuxAhQ8EnMrSJQBOoTeMsHFz9mJge85d59Z/jh3lWrJtY3K6MQQAABBBBAAAEEENgjwFcEEIhWoHfNisPdCq9we4s33emJ3tHiIFK1vCvkHVFPQqr2wDnn9PIOn3rwGIMAAgikXMBLeX6khwACTsDLyQ3uadjmvrH02r2dHxnW2PgTZkQAAQQQQAABBBBAAAEEEBiDQKcUj1fRQ8cwRYOG2paC5e5p0GSZn2b9pZdOcgjHub2mzUSCILD71VV9ahoYfWdWQAABBBCIgQAFnxjcBEJAIGqBycdv/7GY/OmAdUzffsPVnznogHYaEEAAAQQQaKgAkyGAAAIIIIBAvQJF01miUioO1DtFo8ZtLvQbBZ8GaQYT215ez1QqMqiij9QzljEIIIAAAukXaH3BJ/3GZIhAywVmzfILovapMoEco9JxSpl2mhBAAAEEEEAAAQQQQACBxgowW10CKnK6mbmnuoY3bJCZfKtr8eJdDZsw8xMFr6+TYMCKxfvqHMswBBBAAIGUC3gpz4/0EEBgr8DWHbJeREd+UzjF8+R04YFADAQIAQEEEEAAAQQQQAABBIYL3LByxWtE9HkSh4dnX49DGGmJQT19XX25WEHa2jfWN5ZRCMRDgCgQQCA6AQo+0dkyMwKxErhrx45dovLNkUGZ2Pt6V6wYN7KdcwQQQAABBBBAoAUCLIkAAgggsFeg9K4ery1YKGK5vU2tfNpy1rwl32tlAGla+7aenjYxe25dOZnsOGvehXy0Xl14DEIAAQTSL0DBJ/33OEUZkspYBHzfD0yCb7s5+t0+dJvWNi64YGgDxwgggAACCCCAAAIIIIAAAq0VuO5fLj1STOp8F0hjYzeT9Y2dsdps6b7+YLD9RFGpq5Cnor8XHggggAACCFQQoOBTAYZmBNIoMOgVS+/weXJkbp7pxevWXjF1ZDvnCCCAQCwFCAoBBBBAAAEEEMiAQEdH/tWuKDAxDqmq590ShzjSEoMFwRGumFfXa3KBHPjJHWlxIQ8EEEDgAAEaahao6y+XmldhAAIIxEKgq/vvnjSxLx8YjE3SvsKsA9tpQQABBBBAAAEEEEAgngJEhUCaBXzf98R0lpi0tzpPFXlEBoM/tjqONK2vKs92+dT1Dh9XBLzTjWVDAAEEEECgrAAFn7IsNCKQXoGOQsclLrtdbt+/mUinBHp2b29vfd9w7p8pNgcEggACCCCAAAIIIIAAAggkVuD0Qw8t/Wz2xjgk4H5evCvwOh+NQyxpiGGD7+dN9DiXi6ulua81bkfmJpU+qr3GUanuTnIIIIAAAkMEKPgMweAQgSwInLZo0SaX54Gfv6zyxvGbN09219gQQAABBBBIiQBpIIAAAgggkEyB+we3nmViT49D9C6O2+cuXLglDrGkIYbthx7abibH1JnLgy/q7h6scyzDEEAAAQQyIJDdgk8Gbi4pIlBJQE2uU5G+EddnDsiupSPaOEUAAQQQQAABBBBAAAEEki2QwOjV08/EJWx+f09j70ShfWe7enK01PMwu72eYYxBAAEEEMiOAAWf7NxrMkVgv0De5Bcm8sD+hr0HntnCG9Ysm7n3lCcEMiFAkggggAACCCCAAAIIxEngxlWXv8LF8wy3t34z2WUd3o9bH0iKIuiTqWJS1/018e4SHgggULcAAxHIggAFnyzcZXJEYITA/23efn9g9p0RzSIqE9z/FN4hPBBAAAEEEEAAgWwJkC0CCCAQCwHf9z2V4C2xCKYUhNq6s8698InSIXtjBDwrvqbemdST39Y7lnEIIIAAAtkQcK/tZiNRskSgfoH0jXQ/RARePrfKZVZ0+7DNTN/Su8qfOKyREwQQQAABBBBAAAEEEEAAgcgFTp4yZbKJ1l0QaHCAFoh9rsFzxny66MMzkbrur4rsELF7oo+QFRBAAAEEkixAwSfJd4/YERiDwJndi3/jvlm8ceQU7pvIV7S1TXnmyHbOEUAAgcwLAIAAAggggAACCEQtMEGONpWTo14m3Px2f6Ev735uDNebXuEE3M/cbwrXc3ivwBV8VL0tw1s5QwABBBCIRCDBk1LwSfDNI3QExipggbfGzTHo9qHbFC0W/35oA8cIIIAAAggggAACCCCwR4CvCEQpoMXC211BYEqUa4Se27xf7Ji2dWfo/nSsKnD91cuPMpHDq3Ys00FFt0jOu7/MJZoQQAABBBDYL0DBZz8FBwhkTyBo8+4Usd+NzFxNTv/qVcufPbKd86oCdEAAAQQQQAABBBBAAAEE6hK4deXKyWK6oK7BjR9k4sn3zj3X72v81Nmd0cvZS+vO3mxr2y6P36dUN2DDBzIhAgggEEsBL5ZRERQCCDRF4DcPP/mo+4HiGyMXM5HOtpwsHNnOOQIIIIAAAgiEEaAPAggggAACtQv05wfe4UZNdXsctoJn8vM4BJKmGDSQk+rNx/2c/rvTFi3qr3c84xBAAAEEsiFAwafZ95n1EIiRgO/7gQTeV1xIBbcP28zk9V+7evlRwxo5QQABBBBAAAEEEEAAAQQQCCdQQ68vLVs2wTN9ew1Dou76SN/Gbb+MepEszd/b29suqs+rN2dV+069YxmHAAIIIJAdAQo+2bnXZIpAWYEzL1hc+iWc1x9wUeUZA569+oB2GhBAoCECTIIAAggggAACCCCAwD6BKRPkGaZ24r7zVj+byb90+f5Aq+NI0/oTNt0z3VSPqDcntRzvuKoXj3EItFiA5RFopgAFn2ZqsxYCMRXIefpZURn5zXybis7bsMHPxzRswkIAAQQQQAABBJIuQPwIIIDAbgETr/SP7Q7dfdL6L/3e9uLnWh9GuiLo9/RgtaCuT9FQkb45Cxb/JV0iZIMAAgggEIUABZ8oVJkTgYYINHESnfhnMflBmRVfsfX3E95cpp0mBBBAAAEEEEAAAQQQQACBhgnYBQ2bauwTfXvO0qXbxj4NMwwV8AI5RkSnSdnH6I0m8v3Re3AVAQQQQACBPQIUfPY48BWBTAvM7u7eqWL/4xDc95Hu65DNRP95re93DmniEAEEEECgmQKshQACCCCAAAKpFrh+1fLS7+45Pi5Jup8Bvx2XWNIVh/dSl09dr8OpKR/n5vDYEEAAgdQLNCDBuv6iacC6TIEAAjETKATa60La7vaR2zOmHjzplSMbOUcAAQQQQAABBBBAAIHmCbBSOgV6e/32vMq8uGRnIo/lRH4al3hSFYfaW+rJx92TQDT4WT1jGYMAAgggkD0BCj7Zu+dkjEBZgbkLL77PXfiS20duk1Xlb0Y2ch4rAYJBAAEEEEAAAQQQQACBBAq0bZl8intB/+S4hK6u4KMbt90Rl3jSEsc3ly2b4O7z8+vJp3RPiir31jOWMakUICkEEEBgVAEKPqPycBGB7Ai4byItlxNfRJ6QkQ+1s2/9wsoZI5s5RwABBBBAAIE4CRALAggggEDSBNRslou5rt/r4sY1fDPVL832/Z0NnzjjE+6coG90P3PX+xrc/eblt2SckPQRQAABBEIK1PuXTcjp6RYbAQJBIITA7O6LN6vo9WW6Th/oH7isTDtNCCCAAAIIIIAAAggggAACdQvYe93Qxr424yasdwsG29bWO5ZxlQVcYa+uj3PbM6M9eug0O/AfZu65yFcEEEAAAQSGCcTmm4phUXGCAAItFAjWicmOMgH8be/qS2Pzi0TLxEcTAgiEEKALAggggAACCCCAQDwE1q267E0ukhPcHovNVL519qJFD8QimBQF0btixTjzvBfXm5KJ3PmKrsW76h3POAQQyK4AmWdTgIJPNu87WSNQWaAj+IF4+vsDOpi0tZn3Tt/3+f/GATg0IIAAAggggAACiRIgWAQQaLFAr++3q+rKFocxbHnP5IZhDZw0RKCjQw5Xs7o/ts8T5XcqNeROMAkCCCCQDQEvG2mSJQIIhBWYc97SbRYE17j+5vahm/t5xOt60cyOKUMbOUYAAQQQQAABBBBAAAEEEKhNoG3mxNeL6DMkPo9HAgt+Gp9w0hOJl7Oj3A/Xdf9O3GJefxKdBjMjgAACCKRNgIJP2u4o+SDQAIHBGUf9u4n94cCp7LhByb/twHZaEEAAAQRSJ0BCCCCAAAIIIBCJwAbfz6tI6eeqfCQL1DGpidy5baf+uY6hDKkiUAjsBHe/J1bpVvayqj4698MX/ansRRoRQAABBBAoI1BXwafMPDQhgECKBP1ishAAABAASURBVLq6ugZMveVlUsp5oitv7ukZX+YaTQgggAACCCCAAAIIIJAyAdJpvMCOmR2T3Kynuz02myfeN967ZMmO2ASUokBcsefV9aYTBPa1escyDgEEEEAgmwJeNtMmawQQqCYQaPGHovLXkf1MZFpQ3Hr+yHbOMylA0ggggAACCCCAAAIIIFCjwKDl3+WGHOX2WGyuILHDU/lKLIJJZxCvqjctz/O+Ve9YxiHQYAGmQwCBhAhQ8EnIjSJMBJotEEw/+i4x+Ua5dV3R58zeFSuml7tGGwIIIIAAAghkTYB8EUAAAQTCCrifo8Z56n06bP9m9DPVb8yet/jBZqyVtTVuXH1Z6d09h9aZ90Ahn/9RnWMZhgACCCCQUQEKPhm98U1Lm4USK9DV1VUsBsEXXAL9bh+2qeqLOzrkJcMaOUEAAQQQQAABBBBAAAEEEBhVoKMzeJ+JTR61UxMvmsigBLKiIUsySRkB75wyjeGaVP44Odi5LVxneiGAAAIIILBHgILPHge+IoBAGYGzF37sl655rduHbWbSaVL852GNnCCAAAKjCHAJAQQQQAABBBDIukBvzyVTApO3x8lBTW/P5e1PcYopLbHc1tPT5nJ5q9vr20x+9/i0vl31DWYUAggg0DoBVm6tAAWf1vqzOgKxF7BCsNwFeeC/KlJ90Q2rlpc+e9pdZkMAAQQQQAABBBBAoKoAHRDItEDecieoyitihaD2s188vP2xWMWUkmAesG3Pcqkc7Pa6NhX5S1eXP1DXYAYhgAACCGRWgIJPZm89iSMQTiDfsfNhMflmud7uh5WPfGX58rq/gR0+J2cIIIAAAggggAACCCCAQHoFvEAWuuzGuT02mwW6zvf9IDYBpSgQK8rJLp3xbq9nK4rJr+oZmIwxRIkAAgggEJUABZ+oZJkXgZQIzO72d4rpAR/rVkrP/Q/kpIkT7ZWlY3YEEEAAAQQaIsAkCCCAAAIIpFBg/TUrXiSifysxeqjI3WctvOg7MQopNaGYmYonp4hIu9vr2YrabhR86pFjDAIIIJBxAfd6bXIEiBQBBFojkGub+D238u/cPmwzkY4g0PcPa+QEAQQQQAABBBBAAAEEEBijQJqGl36XSxDYR2KXk3qfiF1MKQnoe5/6VE5NXlxvOqpy7xkfWnJ3veMZhwACCCCQXQEKPtm992SOQGiB2d3dO11x530VBpx+/arldX8jW2FOmhEYTYBrCCCAAAIIIIAAAggkRuD+4raT1OyN8QrY7uvfJevjFVN6otl0wgmemLyk3oxcgfC/6h3LOARSJkA6CCBQowAFnxrB6I5AVgVu37j9dlG9tUz++ZzaFTf39NT72cRlpqQJAQQQQAABBBCoJsB1BBBAIBkCavoWUTkkVtGa3nrn1q39sYopRcG0bb7vNHfPJ9Sbkknwn/WOZRwCCCCAQLYFKPhk+/6nN3sya7iA7/sFMVvnJh50+4hNX1AsbH39iEZOEUAAAQQQQAABBBBAAIFMC3xz2bIJojY/XgjWJzm71f2MF8QrrjqjieEwT+yjYwjr/rkLlv5+DOMZigACCCCQYQEKPhm++aSOQK0C2pa/2Y150O0jt3Gi+p7e3t7cyAucI4AAAq0UYG0EEEAAAQQQQKBVAq6g4u0YL76IHOb22Gwq+tBAcfyG2ASUskBuXr78YBN9Td1pqfys7rEMRAABBDIsQOp7BCj47HHgKwIIhBCY86GPPqqq/1yh6+ntmx+YVeEazQgggAACCCCAAAIItEqAdRFoicDJh0x5uqf63pYsPuqidk3XggXbR+3CxboFihO8V9c92A0MzH7untgQQAABBBCoS4CCT11sDEIguwJz5l30BZf9r9w+chunEnzxtp6etpEX4n1OdAgggAACCCCAAAIIIIBA4wW8oDhHRA+SGD1U5PE585csi1FIaQtF3c/Fdb+7x92fHRIYH+cW2Z8KJkYAAQTSL0DBJ/33mAwRaLiAWbDSTdrv9mGbiRz+QHHHu4c1coIAAggggEASBIgRAQQQQACBBgqU/iGcqbxfxGL1sdfuZ7Z/FR6RCXx55cpJQSAn1ruAuz9bRXJ/qnc84xBAAAEEEKDgE+LPAF0QQGC4gNfe/nURvUvKPEyCd/decsmUMpdoQgABBBBAAAEEEEAAAQRiLdCo4O4b3P4eVT25UfM1aJ7H1ZNbGjQX05QRmOYNTFOVuu+7mj541sKL/lxmapoQQAABBBAIJUDBJxQTnRBAYKhA6Xf5eGJrhrbtO1aRV7ZN8l6675xnBFIkQCoIIIAAAggggAACCFQVWP/5Kw/xcrbMzNyPR1W7N6+DyR+krVju47mbF0PKVxrw5PkuxYPdXtcWuIKc+0NjdQ1mEAIINFKAuRBIrAAFn8TeOgJHoLUCW8Zt/7yq3Fkmig5PvRU3+/74MtdoQgABBBBAAAEEEi5A+AgggEAVgcHiB8RkepVeTb+snq2dc97SbU1fOEMLquq5Y0nXvUh301jGMxYBBBBAAAH3dwkICCDQMIEMTXTuuX6fiP2zS3nA7cM2E3luccak+bH7F23DouQEAQQQQAABBBBAAAEEEGisQO/Kz8wITN7e2FkbMtv9/btyX27ITEyyR2DE13Vrr5gqZm8c0VzL6V/nzLuId2DVIkZfBBBAAIEDBCj4HEBCAwIIhBUoinzXFXduL9tf7V23XHPFYWWv0YgAAgikXID0EEAAAQQQQCCbAu35ttM9tZPilr37uW1Z1+LFu+IWV6ri2Vk42+Uzzu31babfrW8goxBAAAEEWikQt7Up+MTtjhAPAgkSmDtvyUY1+c9yIavIicXAXl/uGm0IIIAAAggggAACCGRAgBQzJvClZcsmiOglrriSl3g97pZCcGu8QkpXNL7ve6ryhjFkFXimXxvDeIYigAACCCCwW4CCz24GviCAQL0CeR38oivu3DVy/O4fctQ+tftt7SMvci4iICCAAAIIIIAAAggggECaBCaP9z7q8pnp9pht+pPBx3beH7OgUhXOCVM7jxDRk6TOh/uZemNRC/fWOZxhsRcgQAQQQKB5Al7zlmIlBBBIo8Dp8z/+eCBykcvN1Xjc1+Hb0bqr+InhTZwhgAACCCCAwH4BDhBAAAEEUiHQe9WyY9Szd8czGb2my/cP+N2r8Yw1mVHl2/JPd5Ef6fa6NvfD9H1tOpGCT116DEIAAQQQGCpAwWeoRsyOCQeBpAhMtXHfdrH+xO0HbibvvelzK5574AVaEEAAAQQQQAABBBBAAIF0CLR5ek5gcly92UQ3Tn945vzFP4xufmYuCXgqp7rnSW6vbzP91enz5z9e32BGIYAAAggg8JQABZ+nLDhCAIE6BWYtWLBD1Uq/yyc4YAqVmUGh+J4D2mlAAIGwAvRDAAEEEEAAAQQQiLFA76pVE0VlqYrE7jUWLchHYkyXntBMxvQzb1GDm9ODQSYIIDAGAYYiMGaB2H0zMuaMmAABBFohYJ0TZK1b+M9uH7mpqL533Zorjh55gXMEEEAAAQQQQACBsAL0QwCBOAps2LAh3y67/klFpscvPt3QOTX4U/ziSldEX1297CRReXa9Wbk/O1uLuck/qnc84xBAAAEEEBgqQMFnqAbHCCRVIAZxv/m9S3aI6QfKhmJyqFrxC2Wv0YgAAggggAACCCCAAAIIJFTgiT/86gXuxf53xS18EwlE7Cvu57SdcYstbfHkxHvHWHIKxG7q6u5+MvQcdEQAAQQQQGAUAW+Ua1xCAAEEahI4c8FFPzazW1XV/XwxfKiKvPqGNZefPryVMwQQQACBRgowFwIIIIAAAgg0V0DNznErznR7rDb389djA+p93QV1wM9mro2tQQJfXrlysvvxt2sM07kfoe0/xjCeoQgggAACGRWolDYFn0oytCOAQF0CmvNWue9Yt40c7H7KyHtm521Yu7Zz5DXOEUAAAQQQQAABBBBAoGECTNQkgRtWXfockeDcJi1X0zKmwT90zVv8YE2D6FyzwPiOgZPExvRxfg/l8+131rwwAxBAAAEEEKggQMGnAgzNCCBQn8DAI9u+LaK/kfKPM5/o2/yy8pdobY4AqyCAAAIIIIAAAggggMBYBXp7e3M59daI6EESs4eK3HXWvI+52GIWWArD0YK8wqU1ze11be5e3dFXaHusrsEMQqCqAB0QQCCLAhR8snjXyRmBCAW6fH9ATD4motulzEMDXXPDmmUzy1yiCQEEEEAAAQSaJcA6CCCAAAJjEuh87N7TTfRVY5okisGqxUBkbRRTM2dZgTeUbQ3bqHrbOfPn7wjbnX4IIIAAAghUE6DgU00og9dJGYGxCuz9XT7Xlp1H5dnufzwfKnuNRgQQQAABBBBAAAEEEEAg5gK9K1aMKwb6QRdmzu3x2sw2mRWvDxsU/eoX6L3kkimqMqaCj1nwA1W1+qNgJAIIIIAAAsMF3Ouuwxs4QwABBBohYEUt/auyh8vOFei7b+q58ullr9GIAAJxESAOBBBAAAEEEEAAgTIC+fbim9TkLWUutb7JtHfugqW/b30g6Y+gbXL+Apelur2uzVV5Hhs3UX5S12AGIYAAAo0VYLYUCVDwSdHNJBUE4iRwx2Pbfidm68rGpHJcUBwsfXNc9jKNCCCAAAIIIIAAAnERIA4EEBgq0PuvK6Z7qleJSn5oe0yOd+n2widjEkuqw7h15coOV+n5yFiSdC/IrX7ze5fwcW5jQWQsAggggMABAu7vlwPaaEAAAQTCCYzSy/f9gtcuy0X10TLd3P97dOENa5adWOYaTQgggAACCCCAAAIIIIBA7AQ2+H6+fSD4iKgcGbvgRMxMVs9ZunRbDGNLXUiF/MDrXFJT3V7vNmie/Ge9g1syjkURQAABBBIh4F50TUScBIkAAgkUOONDS+4W049XCL1TA13Ru8qfWOE6zQgggAACCREgTAQQQAABBLIgsGPm5KeryLtjmutDIsGXYxpbqsLyfd8zkVkuqbrf5aUqdw48sv0vbg42BBBAAAEEGioQdcGnocEyGQIIJE8gCNpvclH/zO0HbKr68g4dV/qXUQdcowEBBBBAAAEEEEAAAQQSJZDqYEsv8hfEPupe6D82lomafG/qpp2/jWVsKQvq5cdOGGeiLxtLWkEQfPucf/zHwbHMwVgEEEAAAQTKCVDwKadCGwIINEzgrAULHhOTL5Wf0CaK5j/Wu2LFuPLXaU2PAJkggAACCCCAAAIIIJBcgZMPmXCqi/48t8duU5G+wLNLZvl+IXbBpTCgHTu9Z4rYi8aQ2oDn6W2qamOYg6EIxFiA0BBAoJUCFHxaqc/aCGRAoPRN7JkLLl6tIneVS9fMXtneWVxU7hptCCCAAAIIIJAyAdJBAAEEEijQu2rVRDXv/7kX+cfHMXz3M9Xn5s5bwrt7mnRzcoFc4Jaq/x8tmuwcVPuFm4MNAQQQQACBhgtQ8Gk4KRPWK8C4dAsEljvbZfiE28tsuviGay4/ucwFmhBAAAEEEEAAAQTm7uD1AAAQAElEQVQQQACBlgp05nbNFrNTWhpExcXtPsvbyoqXY3ohqWF9pWf5wSb29jHFr/Kzt5//sT+PaQ4GI4AAAgggUEGAgk8FGJoRQKCxArdvevIO90PSf5ebVVVnqMkHS5+LXe46bQggkCkBkkUAAQQQQAABBGIlYEX5B1GZEKug9gajptfd/vDOu/ee8hSxwLiCzXFLTHF73ZuJXFP3YAYigAAC6RIgmwgEKPhEgMqUCCBwoIAr5gTm5b7gflB6bORVM1PP7NxTDup87shrnCOAAAIIIIAAAghkUYCcEWi9QO855+RuXLV8hak8u/XRlIvAdhZNP1f6WavcVdoaK3DrypUd6ulbxjSryQNnzb/4xjHNwWAEEEAAAQRGEaDgMwoOlxBAoLECgwcd8QsJ7AvlZjWRCZLL/1fpm+hy14e1cYIAAggggAACCCCAAAIIRCyQf+1LXy4qH4h4mfqnD3T53IUX/en/Z+9O4Nus6z+Af79P0nRHNxB2gFyKyCkCiqAg6ESODbYkHYQbmYBdk62wNtkGiEbl2pJ2o2vSlWvcSNnaZIMNBB0gconcCiqHICJs49jasTXN83z/32eI/wnr1iNprk9ev1+TPMfv9/29n5zPt8+T/jeANfsi8LEzvQsLf6Mv63x2WYvk3s9Ow30IQAACEIBAJgWQ8MmkJtqCAAS2KuDz+UxPIBQi4pdpy5f9U46UX8JhvDZt2QdTIdBXASwPAQhAAAIQgAAEINAPgdbWVofBVKOrDuj0Xbp+dgrTay7LdWV2GkerWxJwivUNIdlzS/N6Oa3LaRj39HJZLAYBCECgrwJYHgKbBLBTdRMD/kAAAoMpwCxXaH8btH6+sFS17bzd2M/PwBQIQAACEIAABCAAgf4JYC0IQKCvAs5Vb56k69hVr/KupMmi2PiamlTeRVbEAen32GkDHN6/U2z+dYBtYHUIQAACEIDAVgWQ8NkqD2ZCoAQEcjDELiN9jxC9uOWueR+nZc4K4yifLfNgKgQgAAEIQAACEIAABCCQVYHWhoYdDINv1U6Gas27wkRrHIbRqtf6tSrvwivKgBbHI18X4u8NZHC6vf588tSZfx9IGwNeFw1AAAIQgEDRCyDhU/SbGAOEQP4J+KpmrzXYUauRbfE/0kSo+pAxI/L1v+k0bBQIQAACxSeAEUEAAhCAAAQgQPR0S0uZa4h5sVqM0JqXRUgumVhd+6+8DK5Ig3ISXzTQoVlEsYG2gfUhAAEIQAAC2xLoTcJnW21gPgQgAIE+C7irZ/xBV2rRuqXi0i8xF98Tj39hSzMxDQIQgAAEIAABCEAAAhDIikDJN/quuX43Ir6A8vQiQo+6q4M35Wl4RRlWe/O8L+nAjtLa/yL0nqe67r7+N4A1IQABCEAAAr0TQMKnd05YCgIQyIKAYco8bfZVrZ8rQvRNkz4+9XMzMCGHAugaAhCAAAQgAAEIQAACxSvQ2towtFushTrC7bTmY+lwOIwoM+vXpXwMr0hjEvNgIvnigEbHdAu224AEsfKgC6BDCECgUAWQ8CnULYe4IVAEAhPfX/+mCF23paEwUZl+i5mTvG7+2C3NxzQIQAACEIAABHIkgG4hAAEIFKmA633rQmY6Jm+HJ/TiRnPdb/M2vuINrJKIh1H/Lx2G0N39Xx1rQgACEIAABHovYPR+USwJgW0LYAkI9EWAw2Hro9WdjbrOC1q3VEZKuvvG+yOR4VuaiWkQgAAEIAABCEAAAhCAAAQyIdDWVL83C/1Y28rX/SRdYhozfIFwp8aYF6UUgljWEh2lScBJAxzrnzud9MYA28DqEIAABCAAgV4J5OsHmV4Fj4UgAIHCF5gSDm9k5nN1JB9p/XwRHrdxKE38/AxMgQAE8lgAoUEAAhCAAAQgAIGCEjAMqRGivfI1aCGJeWtqn8rX+Io1LtOiOhIa0Cn+mPixv/2784NiNcK4IACBkhcAQJ4JIOGTZxsE4UCgFAXeNSpe0i9XrT2MfagYPGtZS3ggh9D30DQmQwACEIAABCAAAQhkTwAtQ6AwBJLxyIkaaUAra83DIm+Zhti/LZSHsRVvSG3NkTH6gDh/oCMUy2oNh8PWQNvB+hCAAAQgAIHeCCDh0xslLAMBCGReYLMWq6qquk2T5pHQus0mb37zYNMaMX/zCbgNAQhAAAIQgAAEIAABCEBgoAJLmqJ7CHH9QNvJ7vp8k7XDl17Pbh9o/bMChmWME6ERn53ex/t/2m7N+j/1cZ3iWxwjggAEIACBQRNAwmfQqNERBCCwNYGTpwdfEcOaTcRCW7qITEksiB6/pVmYBgEIQAAChSuAyCEAAQhAAAK5FHAaXKX976M1X8uHDseIOT6fz8zXAIsxLgmHdX+Z2KcWLx/I+CyiBePC4fRA2sC6EIAABCAAgb4I6BtYXxYf1GXRGQQgUGIC3uqZzSTW/T0M20kGzbolEhnew3xMhgAEIAABCEAAAhCAAAQKUyAnUSdi9UcIiT8nnfeu0y6D+ZyJVVUf925xLJUpgXt2rthBmI4dWHv8j2EuY9nA2sDaEIAABCAAgb4JIOHTNy8sDQEIZFmAncZc7eIjrZ8vTEePqOCpn5+BKcUtgNFBAAIQgAAEIAABCEAgswIPtLRsRyxLtdXttOZnYb7H2V32QH4GV9xRdaelionGDGSUuv5vy99e19NpywfSNNaFQBELYGgQgMBABZDwGagg1ocABDIqMPLfHb8npjt6aNTBQr9qWxj5Tg/zMRkCEIAABCAAgWIVwLggAAEIZEggHA4716fXhbS5HbTmZdFkQVqYmifU1HTlZYBFHFRbU9OODjYuGcgQhcgikZXjcDq3gTBiXQhAAAIQ6IcAEj79QMMq+SeAiIpHwP5AnDLS+uFaXuthVEMNiy+9rbFxZA/zMRkCEIAABCAAAQhAAAIQgECPAl8bNXIf4k2/3cM9LpTjGabIDdu/2/FwjsPIy+6zHZSDN1QKybCB9KMPrHRXl7FiIG1gXQhAAAIQgEB/BJDw6Y8a1oEABLIq4KuavZbJqCWiTq1bKscPL0u5tzQD0yAAgZIWwOAhAAEIQAACEIDAVgXa583bvsxh3akLjdKal0WTBX9P07DgOBwdMujb5/5IZLgwD/y7JlODr7b2g0EfADqEAAQgUDoCGGkPAkj49ACDyRCAQG4F1q63fksk9/cQhZNE6tti8/brYT4mQwACEIAABCAAAQiUrAAGDoEtC7S0tJRxuTVbhA7c8hL5MFVSGkWDLxDo6Z/fdDZKtgTWD3Purm0foXUgpdNV7moYSANYFwIQgAAEINBfASR8+iuH9SAAgawKnBMKrTctrtNONmj9XGHi0Q42r70lEhn+uZlbm4B5EIAABCAAAQhAAAIQgEBJCuxidnydSc7L68EL/7VLht6W1zEWcXDM6Z/o8L6gtd9FiB6c8OOa1f1uACtmTgAtQQACEChBASR8SnCjY8gQKBSBydOCbzLzhRpvl9bPFf0gfejICuOsz83ABAhAAAIQgMA2BDAbAhCAAARKS2BZS3SUyXyNfofI21O5EXGnME3B0T2Uk8vSlvm7M/H5A+w8RczJAbaB1SEAAQhAAAL9FkDC5/N0mAIBCOSRwJDh1h3M9EAPIQ0hkcjyxsaRPczHZAhAAAIQgAAEIAABCEAAAmSmKSIiR36GIq/uskFXev3BP+VVUCUUjJVOV+twK7QOpKwxhR8ZSANYFwIQgAAEIDAQASR8BqKHdSEAgawLHH+OfWo3mqMdpbRuqYzocnYtbW25erstzcQ0CPRfAGtCAAIQgAAEIAABCBSDwJJ45EQdh0dr/hbmF9NpuSN/AyzuyJLXzR9LTMcPdJQidN/J/trXB9oO1ocABAZbAP1BoHgEkPApnm2JkUCgaAW8/ro/kCWhngbIxEeWpx1n9zQf0yEAAQhAAAIQgEC/BbAiBCBQ0AKtsViFk/gK3Zm/fT4PRCyzYfK04Fv5HGMxx8Zp81skdOBAx2g6KTLQNrA+BCAAAQhAYCACSPgMRA/rlrwAAAZHgJlluzXr49rbg1q3VJzCRmhJ45xdtzQT0yAAAQhAAAIQgAAEIACB0hNYuWjRkHJjQ5MQHZTno7/LG5h5k8aooepflEEXMC2p0aSgc2sdb2uebrx7Tq4KvrKt5TAfAhCAAAQgkE0BJHyyqYu2IQCBjAmMC4fTllj1RPLxlhuV3R1Ox13LGxvLtzwfUyEAAQhkTQANQwACEIAABCCQhwJrN6ypFKHT8jC0/4akSYK/pw3rsv9OwI1BF0jE6o9gph8MsOOUPtYWDbANrA4BCEAAAvkvkPcRIuGT95sIAUIAAp8KVAZm3sfEt+h9S+uWyhEpZ9dFra2nOLY0E9MgAAEIQAACEIAABCCQPQG0nE8Cy1qio4T4lxpTXv9DmO6UueWldz9+TeNEyYHAynDYySxztOuBfYcUep2N7me0HRQIQAACEIBATgX0s0VO+0fnEIAABPok0CVDQ0z0WM8r8XTXh9/Zv+f5OZqDbiEAAQhAAAIQgAAEIACBQRG4/5bIcNOk2/R7w1cGpcP+dsL00DBHekE4HO7pH9r62zLW66XAhzsN/5YQDfz7I9MD27/X9XYvu8VixS6A8UEAAhDIoQASPjnER9cQgEDfBXyBQKfBYp/yYG0Pa+/Clnlj6yk4yqcHH0yGAAQgAIEcCqBrCEAAAhDIugBv6OQ67eV4rXlbNBm13iI59diq2T19r8nb2IspMIdFE3U8O2jtf2EWMtPXjQuH0/1vBGtCAAIQgAAEMiOAhE9mHDPRCtqAAAR6KbDhvfWPMdNN1MNFhA91ff/wy1tbw64eFsFkCEAAAhCAAAQgAAEIQKAIBRJNkcN0WD/Rms/FtITneKcGV+dzkMUeW2vL1dsJGWcOeJwi93imz35xwO2gAQhAAAIQgEAGBJDwyQAimoAABAZXwBcOp0YO6ZytSZ+eP1SzVA19f+TBgxsZeoNAJgTQBgQgAAEIQAACEIBAfwSWtbQMI4Nv1nV30ZrP5Z/dHd2NbB8Zks9RFnls5WZZmEh2H9AwmVLUzVcPqA2sDAEIlLAAhg6BzAsg4ZN5U7QIAQgMgsC4KeGNRI5q7WqN1i0U/oJpmbG2pit33MJMTIIABCAAAQhAAAL5LYDoIACBPgncEokMT6c7FuhK+2jN38L0gYjl9c2ejVO55XArJWL1uwnJuQMOQfhJGWn8ZcDtoAEIQAACEIBAhgSQ8MkQJJqBwGAKoK9PBHYxhj3FxLd9cm8Lf5kPdRjlDS0tLWVbmItJEIAABCAAAQhAAAIQgECRCIwcJicxky+/h8OmWDTHG5j5XH7HWdzRiQiTIfap3LajAV60rXs8516U1eTdAEPE6hCAAAQgUGICSPiU2AbHcCFQTAKHVlV1jxy6w8Uk1OOp3YTo5J2sjjz/4ldMWwVjgQAEBlEAXUEAAhCAAAQgoALLFl7zVSJuIKIKrXlc5GkxpMffIs3jwIsqtKU3zq1g+vzQZgAAEABJREFUIbcOirX2u+jKXd3O9K8Zp+brtyFWhAAEIACBXgv0ekEkfHpNhQUhAIF8FBg3ZcpGy5AzNLZ3tW6hyDCx6GfLWqKjtjATkyAAAQhAAAIQgAAEIFDgAqUd/vIbG0eb0n0tMX8xnyU0ObDRJL6osjq0Kp/jLIXYrC7HMUL0zYGO1WJa6Kua/dZA28H6EIAABCAAgUwKIOGTSU20BQEI5ETAOzX4Z+24Wat+bte/ny1Me1sm/aa1Nez67Kyiv48BQgACEIAABCAAAQhAoIgFuru6/SR0dF4Pkdm0hGZP9tc9kddxlkBwreGwS5NvcR3qQE/73SEkV2o7KBDIHwFEAgEIQEAFkPBRBBQIQKCwBexD6KXL0aijeFjrFotmgg5yra6obW1tdWxxAUyEAAQgAAEIFLEAhgYBCECgGAUSC+sniEidji3P923IQ04n3a5xouRYwDVmxAUaws5aB1i4Pb3jU+8PsBGsDgEIQAACEMi4QJ5/KMr4eNHg5wUwBQJFIeCdMeMjyxpyMjF90MOADE0MXVa++u0v9zAfkyEAAQhAAAIQgAAEIACBAhFoi83bjyxZrOGO0JrfxTBmTKwKrsmDIEs6hE2n+RY5c+AIstEkWuLz3a1XA28NLUAAAhCAAAQyKYCETyY10RYEIJBTgcpp094n05qlQWzU+rkiJMOEJbG05erdPzcTEyBQ8gIAgAAEIAABCEAAAoUh0NrQMNTB1lyNdqjWfC4bmNnvqap9MZ+DLJXYLKFDiPmggY+XX3WWp1cOvB20AAEIQCBXAui3mAWQ8CnmrYuxQaAEBbYb/vFtJPJIz0OXAyzTMcf+ktjzMpgDAQhAAAIQgAAESlQAw4ZAAQi4yuVqIRlfAKHe07WBbyqAOEsiRLHoYiIZNtDBitCV7vNmdQy0HawPAQhAAAIQyIYAEj7ZUEWbEChSgUIY1rgp4Y1WxdAzWOiVnuJlZk/5EMvX03xMhwAEIAABCEAAAhCAAATyT6C1tdWRiNWfQyw1Gl2+/zbnKv3ecZWvtnaDxoqSY4FkvH6ShjBO60DLS95A8M6BNlII6yNGCEAAAhAoTAGjMMNG1BCAAAR6Fqj80bT39UtgUJf4SOvniggNsYgj7Y0Nh31uJiZAAAIQgMC2BDAfAhCAAAQgkBMB13tv7y8sP89J533rNMUkP3ZX1z3bt9WwdDYE2ufN294iCWWg7W4RmZ+BdtAEBCAAAQhAIGsCGU74ZC1ONAwBCECgTwIjV62/n4Vv62kl/QI22iiT5tbmhl16WgbTIQABCEAAAhCAAAQgAIGeBAZ3+m2N4ZHklBuZaM/B7blvvQmRpWtc4/aH7tVrlDwQMMrTR+rj5uAMhPK2iPH7DLSDJiAAAQhAAAJZE0DCJ2u0aBgCEMilwLhwOG1KV1hjeEjrFouIfN0l1sVbnImJAxPA2hCAAAQgAAEIQAACEMiQQPKGOSMqnBVNJHJohprMWjMs/IzhcDZlrQM03A8BnqorVWgdaFnsXdPx6kAbwfoQKDoBDAgCEMgrASR88mpzIBgIQCCTApXTLnlfuHuKtrlK65aKUycGkrHomXrNWlEgAAEIQAACEMigAJqCAAQgkAkB6So7Wds5Q2u+F5M5fdakqoveyvdASyW+RCwyUYhOGuh4tQ2rTIY2cDhsDbQtrA8BCEAAAhDIpgASPtnURdtbE8A8CAyKQPeOz/xTmO0jfXruj2l+sil6VM8LYA4EIAABCEAAAhCAAAQgkAuBRDzyQxKrQft2aM3jIh8LW9Pd/ll/zeMgcxVaTvpd3tg4mgyel5nOec6JgcC7mWkLrUAAAhCAAASyJ4CET/Zs0TIEIJAHAj7f3eb2+3ZcJyRLegpHiEaRQVe0tLSU9bQMpkMAAtkSQLsQgAAEIAABCEBgywJtsXn7EfGtxLQ95fmFxXike4PzpjwPs6TCS7vSk0hojwEPmvktgxw3D7gdNAABCECg5AUAMBgCSPgMhjL6gAAEciowblw43e0wz9MgntK6xaJJn++OtToWLWsJD9viApgIAQhAAAIQgAAEIJA9AbQMgc8ItDY0DDXYvJKIx1KeX/S7xN/Z6ajy1dZuyPNQSya8lSvDTsuSH+mAnVoHViz5fVna+MfAGsHaEIAABCAAgcERMAanG/QCAQhAoP8CmVjTVzV7rX4RCxPJxz22J3SmZVVUh8NhvDb2iIQZEIAABCAAAQhAAAIQyL5AebllHy0zST+/c/Z7G1APayzic/C7PQMyzPjKH70y9HQm+U4mGjactHBCTU1XJtpCG9sWwBIQgAAEIDAwAezUHJgf1oYABApIwOsPrhChCAmlewpb588+cMyIw3qaj+kQgAAEIJAzAXQMAQhAAAIlINDa2upIxOqDwuTT4eb9PgsRbnxxVUePZxLQMaAMssC9sbk7seVoFqIBH90jJG2TqoKPDvIQ0B0EIAABCECg3wJGv9fMqxURDAQgAIHeCaxyjrxCl7xNa09llEFyS1tT/d49LYDpEIAABCAAAQhAAAIQgEB2BFyr/3k4sYR6bj2P5oi0G0PS88PhsJVHUZV0KLotjDQb5xPT8IFDyPtOB1868HbQAgQgAAEIQGDwBJDwGTxr9AQBCOSBQFVVVbc4rcuJ5K89hcNEXzUMibW2XL1dT8tgep4KICwIQAACEIAABCAAgYIVWDJv3s76Of03OoAxWvO9vLSrc+Sp7vNmdeR7oKUU3/5jR+4sxGdkYsxCdM/ONOK1TLSFNiAAgSwIoEkIQGCLAkj4bJEFEyEAgWIW8FbNfI2YLySmrX05O9qVLiuM/yws5o2FsUEAAhCAAAT6IYBVIACBwhNILpjzRecQ89f6GT0DR2Zke/zcycI1h1ZVdWe7J7TfN4FysaZo0nC/vq31+aWZKO1gugXb+PM2mAIBCEAAAvktgIRPfm8fRJd5AbQIgU0Cnurg/ZZpXbTpzpb/uIjl4vZ45Kwtz8ZUCEAAAhCAAAQgAAEIQCBTApbDcaUQH5Wp9rLajsgsd6Duoaz2gcb7LLB0QeTLwhzebMUB3JRHJk4NrhxAA1gVAhCAAAQgkBMBJHxywo5OIQCBfBBIl1lLmKl1K7EYTDw/2Tz3yK0sg1kQgEBBCiBoCEAAAhCAAATyQWDRovCQZHP9ZUz0IxLRq3yIqscY0jon5gkE43otWlHyRGB5Y2O5ZfCv9DHkyEBIa7sNmcrM2MYZwEQTEIAABHIvUFoRIOFTWtsbo4UABDYT8FXNXttFRq1+q3x1s8mfvbkjiRH77ETchwAEIAABCEAAAhAoAgEMIecCO2wc7hFLZuU8kF4EoAmAF1JsXNWLRbHIIAtYztTXmOn4jHTL3Hry1Jl/z0hbaAQCEIAABCAwyAJI+AwyOLqDAATyS8BXXfuvtGWdqlG9o/V/yqd3hOig9nh0+T3xq77w6TRcQwACEIAABCAAAQhAAAIDE0g0RQ4X4QUF8bs9TG9Lms+1vz8MbNRYO9MCK8Nhpyk0U4hGZaDttULWHRloB00UmADChQAEIFAsAkj4FMuWxDggAIF+C5gP//F5IY5oA5bWLRYmOiFNzlkrV4adW1wAEyEAAQhAoFgFMC4IQAACEMiCQLK5/hAx+C5tOhM76bWZbBZ5X1s/3zO99kW9RskzgbWjhk8UpskZCUvkD+Xd5Y9npC00AgEIQAACEMiBABI+A0LHyhCAQDEI+O6+2/T66+brWJZqFa1bKprz4Rlr/zJ8fDgcxmvnloQwDQIQgAAEIAABCEAAAr0QaL2+YQdLaJ5+wN6jF4vnehGLxbgmtePuD+Y6EPT/eYHWxsbRZBi/0jmZ+O2erjTTxRNqarq0PRQIQAACEIBAQQpgp2VBbjYEDQEIZEOAO8xztN3faO2puIjp5oPGVGTm3NA99YLphSeAiCEAAQhAAAIQgAAEeiXQ1nTljq4uq4VJvterFXK/0I00JD3f5/OZuQ8FEXxWwFXWdTqRfPWz0/tzX0huO9kfeqE/62IdCECghAQwVAjkuQASPnm+gRAeBCAweALuWbM6LJag9vhvrT0U/gITRZc0RQvhvxF7GAMmQwACEIAABCCQDQG0CQEIbF2gpaWlzODynxHTyVtfMj/mMsnDKemc4T5vVkd+RIQoNhdobW11kPB0nebSOrDC9J7BRmxgjWBtCEAAAhCAQO4FkPDJ/TZABKUhgFEWiEBldeglJr5Qw/1Ia09lf4dBLa0NDTv0tACmQwACEIAABCAAAQhAAAL/KzDG7JhKLBf879Q8vSf0jsWOmb5AuDNPIyzpsFaGw07XmreaFGEvrQMuYtG97xoVLw24oU8awF8IQAACEIBAzgSQ8MkZPTqGAATyVWBSde1iEvqlxpfW2lM5zjXEWmT/l2JPC2A6BCAAgc8LYAoEIAABCECgNAUS8cgZTBTR0Q/VmtdF49xoOXiCp7r2j3kdaAkHt26niiOY6VzK1MVw/Kqqqqo7U82hHQhAAAIQgABRbgyQ8MmNO3qFAATyWICZJeVM30gki7cSpn4PpOPHpjvqtrIMZkEAAhCAAAQgAAEIQODzAiU2pT029zgSbtBhl2vN97JBiKZXTq17Xj/w6818D7f04lu0KDxELPaL0JAMjN4i5iu81TP+kYG20AQEIAABCEAg5wJI+OR8EyAACEAgHwV8VbPXOhw8XT/8P72V+Mo1OXRxWyx65laW6fMsrAABCEAAAhCAAAQgAIFiEVgcv2pPZmMhMY0tiDExX5faaNxeELGWaJBf2DD8u0TiztDwX0kRN2eoLTQDgT4LYAUIQAACmRZAwifTomgPAhAoGoGJVcE1lkl2Mue1ngYlJCMN5oXtTfXH9LQMpkMAAhCAAAT6IYBVIAABCBS8QHvL3K84pexhHciXteZ7MYn4bk913YW+2toNhEteCrTPm7c9EdsJuUwc3UNC1PaX99b9m3CBAAQgAAEIFIkAEj4FuSERNAQgMFgC6TFPvEbCl269P6lgQ65Jxhr22vpymAsBCEAAAhCAAAQgAIHSEGi9+urtDHPTkT1fLIQRM9EzhsMRzL9YEdGnAhIOGzzEsrfRmE+nDeSamdYYqa6mcDhsDaQdrAsBCEAAAhDIJwEkfPJpayAWCEAg7wR8vrtNT6DuLhIKaHDdWnsqBwiZS5e1REf1tACmQyDjAmgQAhCAAAQgAAEI5KFAa0PD0LKRjhuE6IcaXt7vd9Bkz7tpi06ZVHXRWxovSp4KJHeo2FdDO1trJopJwue5L7r0vUw0hjYgAAEIZF0AHUCglwJ5/8Grl+PAYhCAAASyKpAa/WSLfiG4Ub+09vzfX8z7pU1qSd4wZ0RWg0HjEIAABCAAAQhAYDMB3IRAPgncEokMLxtizWfiyfkU11ZiedNkOXPytOCbW1kGs/JAQBz0UxLZPTOh8G9HrupYnpm20AoEIAABCEAgfwSQ8MmfbYFIIJANAbSZIQH7SJ91H1t1TPTG1prU+V5ro+NXW1sG8yAAAZj3+PoAABAASURBVAhAAAIQgAAEIFCsAiOGcUA/E59fKOMTkV9VVodWFkq8pRpnIh6ZwkynZWj8XRbR9ePC4XSG2suXZhAHBCAAAQhAgJDwwYMAAhCAQC8FzgmF1rNpHk1Cz1HPF2amCxOxyKXLGxvLe14McyAAAQgMpgD6ggAEIAABCGRX4OmWlrK2pkhIPwvP0Z4KYF+DfMxEl3kDoRs0XtGKkqcCS5qiexAZdRoeax1wEaFH0hv5ngE3hAYgAAEIQAACeShgUB4GhZAgAAEI5KuAe/qsd5i4VuNbo7Xnwjy7y5Gq7HkBzIEABCAAAQhAAAIQgMAgC2Sxu39Z6yYbzD/NYheZbFoTPBwbuarz6kw2irayI+B08Lnasv37PXo14LLR4XSe76ut3TDgltAABCAAAQhAIA8FCuC/bvJQDSFBAAIlLeAO1K0UJk36yMdbgagwmG5si0W/Gw6HC+K1ditjwSwIQAACEIAABCAAAQhsUcD+rLu0KeIm4UXENHKLC+XdRGmTLseV43BKr7zbMp8NaHFTwwEiMoNIHJ+d14/7lq6zYFLVRW/pNQoESloAg4cABIpXADshi3fbYmQQgEAWBZ5/r/NOFprFRD2e91mIhmjS546DR4/4dhZDQdMQgAAEIACBTAqgLQhAAAJ9EjhkVMUxYnDM/uzbpxVzt/C9KRl2rnfGjI9yFwJ67o1A+7x52zsN60ZddjutAy76GP2nZfH1A24IDUAAAhCAAATyWAAJnzzeOPkXGiKCAAQ+FQiHw+muLscNltAtn07r4Xo3YondG5u7Uw/zMRkCEIAABCAAAQhAAAIFJyAinFjQcCAZdIvuSN+lEAbAzM+YaXOqLxDoLIR4cxtj7nt3lJtnaxTf0JqRojvAbq2cVve3jDSGRiAAAQhAAAJ5KqDvd3kaGcKCAAQgkOcC9nmfDcu8jEiWbSPUg7vZeGBpy/zdt7EcZkOgMAQQJQQgAAEIQAACJS+wNFb/Q3JYD2qypyD+sUnjfMkS+cnkmllvl/zGKwCA1tjcnSyiGg3VqXXARbf/nwzHiKsG3BAagAAEIFBqAhhvwQkg4VNwmwwBQwAC+STgnj7rnZTDtP/z7LltxPU1K93dcv8tkeHbWA6zIQABCEAAAhCAQEEIIMjSFVjWEh0lBs1TgTFa878w/VvE9Hn9wT/lf7CI0D56zMW8WCX20jrgwkRdTnYEJ1ZVfTzgxtAABCAAAQhAIM8FkPDJ8w2E8CBQoAIlFbavavZaEg7ooN/R2nNhPuHjDm5sbbk6I+eg7rkjzIEABCAAAQhAAAIQgEB2BJLN9YeYJv1WWz9AayGUNQ4h/wurN/y1EIIt9RjtZM/S5vpziPhIytSFqc01PP3HTDWHdj4ngAkQgAAEIJBHAkj45NHGQCgQgEDhCrgDdY9bBk9goo1bGwUzTXGlHY3LWsLDtrYc5kEAAhAoDgGMAgIQgAAEikmgvfmqL+kOefs3LL9eIONKicWnnVRdlwyHw1aBxFzSYbZdO38nIbo4kwhsWNHjzwmtz2SbaAsCEIAABCCQrwK5S/jkqwjiggAEINAPAU30SOXUuudFrCpdfWtfJpiYT7WsiuqV4XBGzket/aFAAAIQgAAEIAABCEAgqwJLmxoOYClr006+prVvJTdLdxFxbfeY3R5iZiFc8l5gpX4/cljmTzXQfbQOuAiRJRZdNqlq5jMDbgwNQAACEIAABApEAAmfAtlQCBMCECgMAZc55C4Sumwb0ZbrMpd3jB0RXqlfaraxbNHPxgAhAAEIQAACEIAABPJbwE72WA65U6M8RGtBFLbk3NSqjut8Pp9ZEAEjSPpo7Ai3MpyvNSOFiZ6m4Y6mjDSGRiAAgYwIoBEIQCD7Akj4ZN8YPUAAAiUkMKGmpssTCM4T4huIKdXT0IVoiIhctHb0sDN6WgbTIQABCEAAAiUkgKFCAAJ5KBAOh417r63f2zKsW0nkwDwM8XMh6efsbiG+yj0t9GtfONzj5/HPrYgJORVY2jJ/dxYJk5ArE4EIkUVixbxTZnyUifbQBgQgAAEIQKBQBJDwKZQtVdJxYvAQKDyBCkdFnX5ZuW9rkeuXkOFCHG2LR3+0teUwDwIQgAAEIAABCEAAArkQOGT0yOO609YD2nfhHNnDPNcoT1+lMaMUkIBpdl+o4e5HpH8zUJjodyn62D4FYQZaQxMQgAAEIACBwhFAwqdwthUihQAECkjg2KqqtQ7HiNM16fPk1s4ZrvNG6wvxwrZ4/SkFNDyECoHcCKBXCEAAAhCAAAQGRUBEePGC6L5kWDcR8e5UGBdTiC73VNf91H3erI7CCBlRqgC3L6w/holr9bZDaybKh660a7IvEO7MRGNoAwIQgAAEciCALvstoPsZ+70uVoQABCAAga0ITKyq+tg0zZPFsv60lcXsWUMMkisTTZHD7TuoEIAABCAAAQhAAAI9C2BOdgXsZE8yFhnvMOQRERqb3d4y17owtYqVmp+5FtHSYAi0NdV/lS2JZ6ovTfp1M8lVE2pq1mWqTbQDAQhAAAIQKCQBJHwKaWshVghAYFsCeTd/cs2st1MW+XoR2F5k8O+R9OmFFBaBAAQgAAEIQAACEMiaQLJp3tfIMBbZR6JnrZPMN7z0+fc6z6mcdsn7mW8aLWZTwDCoRtvfW2tGChP/qyxdflNGGkMj+S6A+CAAAQhAYAsCSPhsAQWTIAABCGRSwDc99AaRcbQQvb6NdsuE+ZZErP6IbSyH2RCAAAQgsFUBzIQABCAAgb4KPN3SUpaMRSvZYf1G1x2jtVDKr1OO9DnhcDhdKAEjzk8EkvH6SULyk0/uZeTvBhGzakJNzeqMtIZGIAABCEAAAgUoUHoJnwLcSAgZAhAofAGPv/b3LHIRkXy8tdEw097ClFjcXH/I1pbDPAhAAAIQgAAEIAABCGRS4F/WuslCtEjrTplsN8ttLdVkz1Rf1ey1W+wHE/NWYHFTwwEWySImKstckNL4/OqPH8xce2gJAhCAAAQgUHgCRuGFjIghAAEIFKaAJxBaxsR1xPTB1kbAJKOdIte1NdVn7NQGW+uvVOdh3BCAAAQgAAEIQAACRMsbG8vbY9HTSXiRfk4dWQgmmpSyNM67nlvVORnJHpUosGI/5pyGXMJEO2QqdH1M/D1tyA3hcNh+bGSqWbQDAQgUiQCGAYFSEkDCp5S2NsYKAQjkXMDtDy4kiy7TQLq0bq18wzDkjkSsfretLYR5EIAABCAAAQgMSAArQ6DkBVKOriAzXStEQwoFg4WTrrRrejiM07gVyjbbPM6NztRpRFbl5tMGepstmju5KvTqQNvB+hCAAAQgAIFCF0DCp9C3IOLPogCahkB2BN5zjriOhOLElNpKD6zzvkkkDyZjDXvpbRQIQAACEIAABCAAAQhkTGDRovCQ9lh0JjFfro1WaC2EYhLTYk+grhK/01IIm+tzMXKysf4Q3RF1ExFnKsEoJLLcMy14PTNr3pL6ecFqEIAABCAAgeIQ0PfZ4hgIRgEBCECgUASqqqq6Nekzi4mv1JhNrT0Xpq8KWzcvaZyza88LYQ4EIJBVATQOAQhAAAIQKDKB1oaGodtvqJjLTFcV0tA03iUWSaCQYkas/y+wrCW6I5XJnP+fMvBbTPSqw+G6aOAtoQUIQAACEIAAERUBAhI+RbARMQQIQKDwBOykj2FURDTyNq1bK/odho5wOB3PJnB6t605YR4EIAABCEAAAhDIqkCxNL4yHHaWDTFv1Q+Z03VMhbJPQIQ56a4OnlpZHVqlcaMUoIBp0k9E6NhMhs4k8YlTL/x7JttEWxCAAAQgAIFCFiiUD3eFbIzYIQCB4hfo1wgnVlV97KTuKhK6iYi2fqQP0ShiunPpgsiXdVkUCEAAAhCAAAQgAAEI9FnA/geidWNHLGbiyX1eObcr3CVm13m5DQG9D0QgEYtM1PV/rjVjRUQe3+gwF2WsQTQEgd4JYCkIQAACeS2AhE9ebx4EBwEIFLvASf6LP0xR53QhSm5rrMx0hDiMhxKxy3fb1rKYDwEIQAACuRBAnxCAAATyVyA5f/5YJqtNd5LbO97zN9DPR7bU4eg8r3LaJe9/fhamFILA4gXRfYl5nsbq0pqRot+N3hPpnuirmr02Iw2iEQhAAAIQgECRCCDhM1gbEv1AAAIQ6EHAFwh3OsokSMR/oK1c9Ms5C8nuxEPubmuq33sri2IWBCAAAQhAAAIQgAAE/ivQ3jznMHKlHxbmQ3VioewHEI3115rsOX1iVfhjvV04BZH+V6ClpaXMadAsnfAVrZkqabGsqDdw8QeZahDtQAACEIAABIpFoFA+6BWLN8YBAQhAYIsCky4IveFwiIeEl29xgf+deJjBstg+Jcf/Tsa9QhBAjBCAAAQgAAEIQGAwBRLxhh+yOBYTc0H9w5Amp5ZaVmoakj2D+WjJfF9j0usu1VbP0pqxwkR/4iHSwsySsUbREAQgAIEsCKBJCORCAAmfXKijTwhAAAJbEJhYFVxjOB3VIvT4FmZvPomJ6UAiuRdH+mzOgtsQgAAEIACBghFAoBDIuoB9dHh7U8RHZNqnDt7Nvp/1TjPQge7B7xbiq7zVdZ5KnMYtA6K5a6I9Hh3PTCH97uLMVBRC9EE3dZ/hPm9WR6baRDsQgAAEIACBYhJAwqeYtibGUiQCGEYpC0yquugtyzR9+qXoxW06MH3NMOQW/KbPNqWwAAQgAAEIQAACECgpgdbWVleyOTqTDV5IxMOogC7MPNcoT19VQCEj1C0ItF599Xa6w+kKyuzjr4uFLjvZf/HrVDQXDAQCEIAABCCQWQF9/81sg2gNAhCAAAQGJjC5ZtbblmWeKkR/30ZLrPMPJx7y+JKmud/Q2ygQgEAxCWAsEIAABCAAgX4ILGsJDytf86YmTPhqXf0LWgujMKVE5Fee6rqf4uiNwthkPUXZ2hp2uUaWter3mUN6WqZf04UeTTnTt/drXawEAQhAAAIQyGeBDMaGhE8GMdEUBCAAgUwJVAZmvUxsnEXEf6ZtX3ZxOozbE02Rw7e9KJaAAAQgAAEIQAACECgkgb7EuqQpuodpjrhOiC/sy3q5XpaJusiUUMfHNCfXsaD/gQmsDIed5WuG1xHJcQNr6bNryzsWmdN9VbPXfnYO7kMAAhCAAAQg8P8CSPj8vwVuQQACEMgrAW917VOpVPcE6flIn//GK0L7ksG/R9LnvyS4AQEIQAACEIAABEpKILlgzhcdBrXrjvYzdOAOrYVSUhZbZ7oDwQXnhELrCyVoxLllgXVjtt9fiGdteW6/p3ZbwtM3/VNcv5vAihAoeAEMAAIQgECvBJDw6RUTFoIABCCQGwHfRbPfchCfI71I+miEZcJ8y9J4w/f0NgoEIAABCJSMAAYKAQiUskDrKac4EvGGo8ThfFAdMnsKLW0wm0U/434gQuduv+/HSWbWu9nsDW1nW2DZwrlfFU7fpf1spzVjhYnvKnOOuC9jDaIhCEBFZ9hoAAAQAElEQVQAAhCAQBELIOFTxBt309DwBwIQKHiBSf66J7pT6R9SL07vxkx7W2QtScQjUwgXCEAAAhCAAAQgAIGiFyj/wXdOEbIWE8l+hTRYFlmt8R7n8df9ety4cFpvowxUIIfrt7ZcvZ1lORpJaN9MhsFE7xrMsydWVX2cyXbRFgQgAAEIQKBYBZDwKdYti3FBAAJFJWAf6SPMP5beHemzow4+0havP0WvUSCwSQB/IAABCEAAAhAoLoHljY0jk/HoVBHrZt0pPqaQRmd/pjWJK73+4J8YR/YU0qbrMdZyq+wiITm2xwX6N2MtO43TJlbX/qt/q2MtCEAAAqUpgFGXtgASPqW9/TF6CECggAS81bVPiZhuYnpx22HzjgZZzcnm6MyWlpaybS+PJSAAAQhAAAIQKAEBDLFIBJa1hId1OVONmjiJ65BcWgumaMyP2p9pKwPBRwsmaAS6VYFNZxcQmqkLObRmqggztYx4Z90fMtUg2oEABCAAAQiUggASPqWwlTFGCPRKAAsVgkBlYNbLLM6zNNa/ad1G4R1F6Fdj0h01Eg7j9X4bWpgNAQhAAAIQgAAE8l0grJ/pli6IfDltVtzPRD/SePVK/xZGsfSz6eNW2jzd/kxbGCEjym0JtDfOOUzImCMkw7a1bF/ms9BfTZL6ceEwTvfXF7heL4sFIQABCECgWAWwA7BYtyzGBQEIFK2A23/RC0J0htaXejFIFxP9IjlmxJX2ebV7sTwWgQAESl0A44cABCAAgbwVOGT0iO9ZTiOpn+++m7dBbjkwU2O+3uF0nja5ZtbbW14EUwtNoLWhYSg7HI1MMjqjsTO9bRpySmV1aFVG20VjEIAABCAAgRIQ6FPCpwQ8MEQIQAACBSFgn+/cJMOtwb6qdeuFaTiRzCo3nXOXNzaWb31hzIUABCAAAQhAAAIQyDcB+8ie9njkLGH5HYkcOBjxZbAP0ZhbDMeIGZOqLnorg+2iqRwKtLae4igvNx8hpsMzGgZTiol/rsme3vxzW0a7RmMQgAAEIACBYhBAwqcYtiLGAAEIlKTAyf7a103is0nolV4C/DhVlrqudf7Vu/dy+Z4Ww3QIQAACEIAABCAAgUESuK2xceQhoyvmsvDCQeoyY90I8WqN+xep1etnTKyq+jhjDaOhnArYvxHqWnP4L4X5GxkPRCjZ0V22OOPtokEIQKC/AlgPAhAoMAEkfApsgyFcCEAAApsLTPbXPUHEx/Um6SNETl3ubJfLeUNbU9OOhAsEIAABCEBgQAJYGQIQyLbAsuaGXUaUda8Upoto01HbVEAXNpmsWV2jd7vcFw6nCihwhLoNgZ1o3XG6SFCroTWDRV52OEace1ZNzboMNoqmIAABCEAAAiUlkOE355Kyw2C3JoB5EIDAoAl4AnX/NFwygYj/QL27/NAwNj6wtKnhgN4tjqUgAAEIQAACEIAABAZToLW11ZGI1R+RJnOpiNhHUTgGs/8B9cUsuv7fiHicxx9a5PP5TMKlKAT0scjJpuixYvLdOiCX1k9KBv4KyWoS43wcCZYBTDQBAQhAAAIlLYCET0lvfgweAhAoFoFJF4TecDjEQ8LLezmmQyy2Eu0LIt/v5fJYDAL9EsBKEIAABCAAAQj0TaA1HHaVr3nzQmJJsmThlFl9C6fPS7PQa5bBPo+/9vd9Xhkr5LXAsmuv2U0MimqQQ7VmtLDI3O1WdzyV0UbRGAQgAAEIDKoAOssPASR88mM7IAoIQAACAxaYWBVcYzgd1SL0eK8aY9rLcPCdbbHod+3zcPdqHSwEAQhAAAIQgAAE+i6ANXopsKwlOso1puJyIb5aVxmltZBKtyZ7Hli73jq4cmrd84UUOGLdtkD7onnbW2b6Tl3y61ozWUSTPa2ewMzouHA4ncmG0RYEIAABCECgFAWQ8CnFrY4xQyCvBBBMJgUmVV30lmWaPmK6lYi3efoMIdrJYFqxk9lxnn2KBsIFAhCAAAQgAAEIQCAnAvbpdk2T7B3qIQ2gTGuhlWu7TNeZ54RC6wstcMS7dYHltzWO5A1WTJc6QmtGi34fedpJcmFGG0VjeSyA0CAAAQhAINsCSPhkWxjtQwACEBhkgck1s95OWUP9RFZCu9bvUPp366VCF2pOxOfVLm9sLN/6opgLAQhAIEsCaBYCEIBAiQqsXBl2Llkw90jLEPt0Vj8sQIYNZPGFHn9wmq+mZnUBxo+QtyJg/1NYd0e3JmTk1K0s1r9ZTCmx6NITAzPf7V8DWAsCEIAABCAAgc8KFETC57NB4z4EIAABCGxdwBcIdEqX83xd6gat2zzSR5chZiuacqTmJ2+YM8K+jwoBCEAAAhCAAAQgkF2BlYsWDVn7yvCww8G/IZJh2e0t860z0bvCcu5zazrimWod7eSPwMpw2Lk0Hg2Q0GyNyqE1k2WDQVxTOS34QCYbRVsQgAAEIACBUhcwSh0A44cABCBQrALeGTM+es8xws+WzO31GJmqqMvx6P2RyPBerzN4C6InCEAAAhCAAAQgUDQCS+ZdsfO6De8/TcKXEHHBJXs05peNjcah3urQ3eEwfnuFivDy0ZiKY4n5aslGMlJk0cT3Oq4rQjYMCQIQyIwAWoEABPopgIRPP+GwGgQgAIFCEKiqquruWrM+rLFeSSQf6/W2CgvR1zcM5wfbmxsO29bCmA8BCEAAAhAYfAH0CIHCFlgZDjsTzRGvY0j574ToAB0Nay2kktZg701JatLE2tp/6W0dhv5FKSqBtubI1/SBuUA3bsb/EUzb/KPDcFzJ4bBVVGgYDAQgAAEIQCAPBJDwyYONgBAyKICmIACBzwn4wuFUatTuPxNx1DDTxs8tsIUJzHw4i7UsEW8oxPPIb2FEmAQBCEAAAhCAAARyL9Da0DB03eiKq8niW0lo39xH1McImFIsclVn2nWGL3Dxq31cG4sXiMCylui+hrB9qrWvZDxkoXcobZ0+sXpTsnBgzWNtCEAAAhCAAAQ+J4CEz+dIMAECEIBA8Qn4fD7TG6i9QXcszND63rZGaP84qy4zRshqb4tFLlgZDjv1PgoECkYAgUIAAhCAAATySSAcDhuLF0T3LRti3SFMdcSU8aMmBmG87xJJaOTq9b88q6Zm3SD0hy5yILCsuWEXy6JG7XonrZku60hkmrdm5muZbhjtQQACEIBA6Qpg5P8rgITP/3rgHgQgAIGiFnD7gwuZjHOJ6N9at1mYqMJgrl83ZnhjayxWsc0VsAAEIAABCEAAAhDIH4G8ieSQsRWnOxx0r3628uRNUH0L5AU26FRPdahxXBi/19M3usJZeuWiRUNMseIidExWohaZmxqz/t6stI1GIQABCEAAAhDYJGBs+os/EIAABEpOoHQH7A7U3meQcToTv0rM0guJEUJcXW5suHZ5Y+PoXiyPRSAAAQhAAAIQgAAEVKD1+oYd2mPROboD/TYm2lMnFVrp1oAfS/HGCe6pwUf0NkqRCtj/3LVu4/s36vAmac3wviI2hehWTyB0hc8XTmn7KBAYZAF0BwEIQKB0BDL8Jl46cBgpBCAAgUIWmOSvfZitbg9b1rO9HYfuqDg95exuTy6MHt3bdbAcBCAAgbwXQIAQgAAEsiTQHo9+s7zbamemYJa6yHazlsY+j8vNE3zVP/1XtjtD+7kVcBkbZ+vn/crsRCFPWmnzkuy0jVYhAAEIQAACENhcAAmfzTU+cxt3IQABCBSzwKRps/9sOEceRSLPce+O9FEOOZIsWdwWi373P7/zo9NQIAABCEAAAhCAAAQ+FWhpaSlLxKJ+Jnpad6Db/yhTiN+7O5hkkrs6OMt93qyOT8dWzNelOjb7M317c/0c/U5wqRqUa81w4W5LzPMn18x6O8MNozkIQAACEIAABLYgUIgfPLcwDEyCAAQgAIH+CEysqvo41eU4Riy5Q9cXrdssQjzaMGh5Mt5Ql7xhzohtrlD4C2AEEIAABCAAAQhAoFcCS5saDhhjrruOmBp6tUJeLsR/MMiY6PaH8Fsrebl9MhvUsvi8H7OIP7OtftKafm9YbbF1QmVg1sufTMFfCEAAAnkvgAAhUPACSPgU/CbEACAAAQgMTMBXW/vBh8M6zxeWhb1uSWgEsVwpXY5rer0OFoQABCAAAQgUtACCh8DWBRJN9RMsw7qfiX+kS2bhSAltNfvlVi5Pj5/kr8Xv9WTfOuc9JGLzTtaEzAINpEJrpot+vZAG79Tgykw3jPYgAAEIQAACEOhZAAmfnm0wBwK9F8CSEChwgSlTwhu91SG/ZclM3UmxrpfDKdPlprTH6x9atrD+IL3NWlEgAAEIQAACEIBASQksaZyza6K5/hoypE0HvovWwivM7zHTrNRGo+o/p3CTwhsEIu6tQDgcNhIL504gNu/UdYZqzXQxienm1OrOBmYuvsdSprXQHgQgAAEIQCCDAkj4ZBATTUEAAhAodIEhVnmjaVnn6Dg2au1VYZKjTUuWtDfV/6BXK2AhCBSxAIYGAQhAAAKlJZCIzz3K4XAsJ6GAjrwwj+oResUyLW/X756s99XWbtBxoBS5wIGjK75JJrfoMJ1as1A44TBGBHzhcIpwgQAEIAABCBSpQL4OCwmffN0yiAsCEIBADgQm1NR0VU4LJc00j9PuX9Pam2If2fMVNuTBZDwSWtYSHtablbAMBCAAAQhAAAIQKFSB+65v2CERi1xOZDxETAcSiWOzsRTKzS5NVD2ScqaP189/j/vuvtsslMARZ/8EJBw22uJzv+dkWknMu/avlW2sJfSiaUndxKqqj7exJGZDAAIQgAAEIJAFASMLbaJJCEAAAhDoUaAwZrz4QcdTzHyKEP2xLxEL8S9Mc8R1yflXjO3LelgWAhCAAAQgAAEIFIKA2DvMmyM/2NgtCd1hPlNjLsjv1Ey0kcT6qct0Heermv2WjgOlBATaxw7f3yDjBiEano3hart/t0w+e/K04JvZaB9tQqDwBBAxBCAAgcEXKMgPp4PPhB4hAAEIlJZAOBy23NV1z65Pu36oI1+qVbT2pgwlkjPENWRlYmF0fxHR/Qm9WQ3LQAACECgxAQwXAhAoNAG+JRIZ3j5m+EWGGMtI5CgdQJnWQiuWfjh7lcg82BOYGbWP7i60ASDefgnwsoaGXQyL7c/1X+lXC9tcSd43hKsqa+qe3+aiWAACEIAABCAAgawJIOGTNdr+N4w1IQABCOSLwFk1NesslguYZJ7G1Idzust+ZNG9S5vrq5a1tAzTdVEgAAEIQAACEIBAwQq0NUfGjajgdoO4nkgK+bPNzVwmx7n9s/5asBujyAIfjOEk45EDrSHWvcT05Wz0p0nELhbj4mdXdzycjfbRJgQgAAEIQAACvRcwer8oloQABCAAgVIUqKwOrXp21foQWTKbhNJ9MPiSEDemzc5f9WEdLPr/ArgFAQhAAAIQgECOBZY3Npa3xyJhQ/h+Fjo2x+EMpPuPmOX01KgnL5h0QeiNgTSEdQtLYHlj40ghuRmDlAAAEABJREFUatN6ULYit0hmT/LXXm+fJSBbfaBdCEAAAkUugOFBIGMCSPhkjBINQQACECheAfvL23YHHBon4rOY6HXq9UXKmKS2PRb9TXs8+k2c4q3XcFgQAhCAAAQg8B8BXOVCYGU47EzEG47qLkstY+bLNAan1kIspga9ktlx0rPvrW/1+e627+sklFIQWNZYf1DK2fUEEWfpNG5kX2LdGx0t+jwR+w4qBCAAAQhAAAK5FUDCJ7f+6B0CAxPA2hAYRIFx48alPYG6u9KWdYp2+xetvS7MdKwmipYmY1FPr1fCghCAAAQgAAEIQCAHAvZv9awdW3ENkZWUT47qKdTvzZZ+Bqt30rDJ7uoZf7D/gScHnOgyRwJtTVfuaJbJrczGvlkMYSmXmxf7amv7cOrnLEZT7E1jfBCAAAQgAIFeCBTqB9deDA2LQAACEIBANgQmT5v5jION45hohbbfrbW35YtkcFuiOXrVspboqN6uhOUgAIFtC2AJCEAAAhAYuMCicHhIe/O8748czo+SkF9b/ILWQiyWxv+KJqvOclcHZ53k939YiINAzP0W4KVNDQc4DNcf9XFwYJaOsBf9LvC77fbrnOw+b1ZHvyPFihCAAAQgAAEI9FlgWysg4bMtIcyHAAQgAIHPCUysrv2X1eU4Q0hin5u5rQlCdVaa2hMLGg7c1qKYDwEIQAACEIAABAZDoO3mph13HFMRZzHbtb+DtRZi2RSz7om/hcmY6A0E7yRcSk5gcbzhy5Zh3SpEX87i4J+30tZPxo0Lp7PYB5qGAAQgAAEIQKAfAkj49AMNq0AAAhAoPIHMR+ydMeMjrz80g4R/REIfUe8vZboj4rvksH6XiEUmLm9sLO/9qlgSAhCAAAQgAAEIZE5gWUt42NKFEbexfuPzFtEUbXl7rYVZhN/Tz2QBb3VwijtQ+2phDgJRD0CANdmzp1PMB7WNQ7RmvDCz5pH4rXS35fPWzHwt4x2gQQhAIEMCaAYCEChlASR8SnnrY+wQgAAEMiDw3OqO2wxDJhPxP6hvl1Fk8O0pR/c1rc0Nu/RtVSwNAQhAAAL9EsBKEIDAJgH7NFdLmuZ+I21W3G6ZfLtOLNjPIkyUJuF2g2Tic6s7F+pYUEpQYGlTw/5OshYTc9aO7BGSf1mWddrJF878ewkSY8gQgAAEIACBghBAwqcgNtPgBIleIAABCPRHIBwOW5OqQ7/z+Ou+rF8Cf69fMqXX7QiNIJYql8gDy5obdrF3vvR6XSwIAQhAAAIQgAAE+iGwcmXYmWyuP89hGI9pssRDTMP70Ux+rCKU1s9P4fecFadOCgT/aH8uy4/AEMUgCnAyHvm6ZZhPaZ+9PrJHl+1r0cca/aRyWujxvq6I5SEAAQhAAAIQGDwBJHwGzxo9QQACECh6ge5092QRa54OtFtrH4rsZ4r1kn5ZrWttaBjahxWxaOYF0CIEIAABCECgKAVaw2GXfTrZdS+PsE95dZ0OspBPK2sR8W/YQcd4AqErqqqq+vjZi3ApEoFkU/SHQnwfEQ+j7F3eEaJTvP7giux1gZYhAAEIQCAHAuiyCAWQ8CnCjYohQQACEMiVgK/mktXbr1o/y7CMszSGTq19KdsTG1e6hlgPtjY2ju7LilgWAhCAAAQgAIFMCxRXe8taoqNcY0fcQcx3Ccn3Cn10lmVdvm69VemeGnyk0MeC+PsvkGiM7i8G3aEt7Kw1a8Uirn9+VefSrHWAhiEAAQhAAAIQyJgAEj4Zo0RDECghAQwVAlsRGBcOpydNq20lEi8TPa+LWlp7W8p0wSNcjtRj7c0RX0tLi31fJ6FAAAIQgAAEIACBvgu0Nl45Otlc/+O0SU+S2L85SAV9JLF+tnpUP2MdWzlt5s/PCYXW910EaxSDQGtrqyMRj5zBTrZPrzYqW2MSorUkHKr01zXgdIHZUi6AdhEiBCAAAQgUlAASPgW1uRAsBCAAgcIR8PhDD1rc7WGhu/ocNdNe+uXyhp3Njhb7P3L7vD5WgAAEBkUAnUAAAhDIZ4H25jmHlTtdS4WkWRMle+ZzrL2IrUPHcYnJMtn+jNWL5bFIEQuUrX7Lp5+VY/qYGJmtYWqyxyLicGr0bvbpmgkXCEAAAhCAAAQKQyBbCZ/CGD2ihAAEIACBrAp4qy/+R5npmiIiv9COPtTa66I7Zir0W+YU0+TEPc2Rr9nn3e/1ylgQAhCAAAQgAIGSFGg95RRHMtawVyIevY7F8aTutP42CbkKF0NSGvtfLFM8Xn/oqsrq0Cq9n28F8QySwKJweEgyXl/LTHcQ0/aUvUuKRW7z+uvm+3w+M3vdoGUIQAACEIAABDItgIRPpkXRHgQgAAEIbCZANKGmpsvjD/7CYD5HZ7yptY9FjkwLP+waO/xnyxsby/u4MhaHAAQgAAEIQKBEBFobGnYo/8G3f2qxtVyHfL7WQi+dFtFPXenU9yunh35X6INB/AMX2H5MxaUi8suBt7TVFrpZaMGuzpHF8Bza6kAxEwIQyLQA2oMABPJBAAmffNgKiAECEIBAkQsws0yqrruHO8wDhem3Oty+/qfgDiR8aXdZ16OLF17z1XA4jPcvRUSBAAQgUDACCBQCWRRY3thYnmiOHu8aYj6qO8PDTPTVLHaX9aY1/rR28pRZ5tqv0h+KTKi5ZLXeRylhgeScOSOS8egSfWz8lJiGZ5HCZJG7ulZ3XnJoVVV3FvtB0xCAAAQgAAEIZEkAO8yyBItmey+AJSEAgdIRcM+a1dFdZvh0Z8wv9MtqR19HLsKHOq30g18fXXGhvXOnr+tjeQhAAAIQgAAEikugrTnygy5HahEJJYl4Pyr4C79lEdUOcRnjJ19Q83bBDwcDGLBAcv78sTTCGReiiQNubOsNdDHxNV2j9zjPFw7bpxLc+tL9nIvVIAABCEAAAhDIrgASPtn1ResQgAAEIPAZAd/5tR94/MHLLVOO11nvaO1jkd0Npmi3M/VQa3PDLn1cGYvnrwAigwAEIAABCPRaoLWhYWgiFl1kCN/HTKfrioV/2lfm5SkxD/f6gwtO0M9LOiaUEhfQhOYYcqUfJqYzlaJMa9YKC91eli67xOfzIdmTNWU0DAEIQAAC/xHAVRYFkPDJIi6ahgAEIACBLQsws1ROCz1usSZ9RJbpl9i+frE0hOjbLrH+kIhHz29tuXq7LfeEqRCAAAQgAAEIFJbA1qO9Nxbbqb05Wlc+xHpJPz+cq0tndSe4tp/1wkQviMj5ru6ySl9g5rtZ7xAdFITA4ub6Q9gyVuhn3n308aEPk+yErQ1vZOGmMtPlt397Mzu9oFUIQAACEIAABAZLAAmfwZJGPxCAwMAF0ELRCVRWh14aOoJOJ4t/qYOztPa17KErxMvSzrtbGxp20NsoEIAABCAAAQgUoUBLS0tZIlZ/ajd//CQJXaU7wfcs9GHqjvYuIomYLMd6/MEbsbO90Ldo5uJvj0c9TpH7mOUbmWt1yy1ZIteP7uKZePxt2QdTcyiAriEAAQhAoF8CSPj0iw0rQQACEIBApgSOPye03hOou4LJ9GqbL2jta+KnjJmOdQ0x/5mIR6a0xsIV2gYKBCBQxAIYGgQgUDoCyTlzRrTFot8da3b8RljuIOLdNVFS2Ef1MKV0HL83xfB4/KFZldWhVax79gmXkhdobW11JeORs/Qxfr1ijNGazdIlQjeWm+XBI2prN2SzI7QNAQhAAAIQgMDgCRRbwmfw5NATBCAAAQhkVMDtn7WUxZgsTLf0r2EeRsSxMqpoa4vN249wgQAEIAABCECgoAWSzfWHyAjH7QbTCh3I93UneDF8f13DxBfJUGNSZaD2Ph2XaEXpn0BRrbWsJTysfPVbV4rwQh3YjlqzWUwhiZXjNG7ZNEbbEIAABCAAgZwIFMMH5pzAoVMIQAACEMi8gDtQ+6q3OjiFhAJMsrofPQxlpmMNNn+fiEfOwG/79EMQq0AAAhCAAARyKBAOh53JWMNe+j5+o4g8o6FM1Fr4R+8ydTBz0jXEtb+7uq7ZO2XGRzouFAhsErgnftUXTLPiGmK6UOvwTROz96ebRe7sHrXHxRNqarqy1w1ahgAEIDBYAugHAhDYXAAJn801cBsCEIAABPJC4LnVnQtFDA+R2P/52p+YdiThm12m865ErP6I/jSAdSAAAQhAoAgEMISCEljWEt334NEj6oWt3xDxFCqaizxIlpxZ1l126oQf1/TnH1qKRgID+bxAW3PkayaX3aVzzhcip15ns6RYqLFr9frzfD5fKpsdoW0IQAACEIAABHIjYOSmW/QKgdwLIAIIQCB/BcLhsOUJ1D3mSpd7SCSqkZpa+1Z40xfm44nlwfZYJLwyHM72F+i+xYelIQABCEAAAhDYJNAai1W0x6J1pkkv6/t2jU78staCLvzJb/J0EVNtatQeJ3gCoWU4mqKgN2nGgxci1mTPGIfwfSJ0LGX5ov1Z+rn6+l2cIy72hcMll+zJMi+ahwAEIAABCOSNABI+ebMpEAgEIAABCHxWwN4x8p5z5CWGIZN13p/+s/NEb/apDGXD+NnaMRW/WRKPnNjS0lLYP/Tcp6Fj4V4IYBEIQAACEMiNALe3zP1KIl4/y0UbnmCmSG7CyEqva0XkBksch3iqg/N8Pp+ZlV7QaMEKrAyHnUub66cYFr8uRLtkeyDax1oirtPEY+DQqqpuwgUCEIAABCBQmgIlMWokfEpiM2OQEIAABApXoEq/lE6aGkqm0qnxuvNkcb9GIsK63jhD+O6drM5Y8oY5I/Q+CgQgAAEIQAACORBYFg4Pa4tHL+O08QciuZKYDtAw7PdqvcpVyUy/umP9T+Qwjkqt6gxUBma8nJlW0UqxCawdPTyun2vjxJTt3+vZRCckV3SP2m3Bpjv4AwEIQAACEIBAUQsg4VPUmxeDgwAEMiKARvJCwFdzyWqPP+hj4rM1oFe19rkw01D9cn2BdDmfTDQ1eJH46TMhVoAABCAAAQj0WyC5YM4XE7Go3xxT8YJ+Ef2F7uweq43pTf1b2MVioueJ5cJu6fy+p6r2RZwyq7A3aLaiX7og8uX2eHQZMV+gfZRrzWrRBOS/hdlf6Q9FcKRZVqnReDEJYCwQgAAEClygGD5cF/gmQPgQgAAEINAXgUmrOu5wknE8kdyh66W19qPIfsTW7dLluHtx/Ko9+9EAVoEABEpQAEOGAAT6J3B/JDJcd3JPF6fzPmGaT0Rf0VpERS5Jp82TPNWhRl8g3FlEA8NQMiiwZMHcIy0H/0aTgydmsNmtNWV/TvY//15Hy9YWwjwIQAACEIAABIpLAAmfzGxPtAIBCEAAAoMkwOGwdZK/9vVdHSPPZabZ2u2/tfa9MA3VlY53UtmfE83RGW3NkTF6HwUCEIAABCAAgQwIhMNhIxGr3609Fpm2YTj/g4kaSeRAvS7LQPP50ESHELWR8O4ef2jO5JpZb+dDUIhhUAT61Elra6urPV5/lsMw7tEV99KqTwP9m6XCzJ18iy0AABAASURBVPrQpNfEpElefzChz0UrS12hWQhAAAIQgAAE8lAACZ883CgICQIQgAAEti1g/+CsuzpYr99oJ+rSCa16U//2vQzRnTURFr5naXP9ZP1S7uh7E5+ugWsIQAACEIAABOx/ojhoTMUviOU+ZsM+omdU0agIpUnoXrHY63SMONsTqPtn0YwNA8m4wLKW6Kiy1W81GyQLiWl7GoSLiPVPg/gs7/TgikHoDl1AAAIQKGEBDB0C+Slg5GdYiAoCEIAABCDQOwGvP/gnjz/oFZJaXaPjP//VqDf7UsTBRN+yRBa71rx53ZLGxl1bTzkFiZ++EGJZCEAAAhD4f4ESvNXaeopjeWPj6PZY9ELD4tf1ffWnyrA/kRTL+6lJxG9ZZJ33nnOE1zut7rcTq6o+JlwgsAUBEWE78Wma0sZMPxai4VtYLNOTtBt6rmzosMMn+eueyHTjaA8CEIAABCAAgcIQMAojTEQJgeIRwEggAIHsCHj9ofmG0DEk0j6wHniK4Uw9Wj7u8IvtL+oDawtrQwACEIAABIpfILGg4cDy9w+f0+VMPaE7txuIB2Xn9mDC/o3ZmGWx9a3KwMxbqqqqugezc/RVWAJPt7SUJeMNZxvCTxPxUTR4l2WStk4+cUrg3cHrEj1tSwDzIQABCEAAAoMtgITPYIujPwhAAAIQyJrApEDwj12jdvexxedpJx1a+1WYaA8h+qVD+HlN+vygX41gJQhsXQBzIQABCBS8wNLrIl9ONEfvFIf1JxGq0/fPPXVQxfQd0yKSOSnp/Ka7urahsjq0SseHAoGtCvwz3REhpht1od20DlZZut2qzsnempmvDVaH6AcCEIAABCAAgV4LDOqCxfRhfFDh0BkEIAABCOSngM/nM93T6m4kS47VCH+tO2r6e7oV1qTPTix8XyIevbFtYeQ7Eg7jfVNRUSAAAQhAoHQFWhsahi6NR8droidmpflpEjpNEz1lxSTCxKu13sAkh3j8odm+QLhTx6cfC/RvxgsaLBaB9mvnHZyMRX/DTBfq589BO5WhkDQ4HCNOHxcOp4vFEuOAAAQgAAEIQKD/Akb/V8WaEIAABCCQVQE0PiABz7TQk6mNhn3O9CptyN5Ro1d9L0xk78SaYlh8z9IxI+pbr2/Yoe+tYA0IQAACEIBAYQu0tLSUJWL1p7qGWr+1iFtJyK+1qN4T9T0/TcLtbPG4rlEdfrc/9EJhbzVEP1gCmug5k9Pm/WTwDwerT328doklp3ZvdPwUvyc1WOroBwJZFEDTEIAABDIkYGSoHTQDAQhAAAIQyDsBX23tBq8/dFuKjX01uLuJZKNe97fsICQXubqsx3WH1zn2D1P3tyGsBwEIQKAvAlgWAjkU4CVN0T0S8YYzxpodjwjLHST0HX0/rchhTJnvmqlDG9Wd9TQhNXq3UyZNq/2zzxdO6TQUCGxVoK05MqY9Fp1vMS3SBceIiOZh9FaWi/azmoTO8wSCd9ufd7PcHZqHAAQgAAEIQKCABJDwKaCNtYVQMQkCEIAABHoh4Kuu/de69TKFLGMyMb3Yi1V6XoRpb2K5NuXsXpKMz5nU84KYAwEIQAACEChcgbbYvP2SsWjEYcgKfd+7RUfybd2TXXTfH4XodyJ0qsMxotI9NfiAfWpYHSsKBLYqoAkXXto87weGRfcy8zR9bthHhG91nQzM/KQJ/SzrID7x2dWdd2rf+hD+ZDL+QgACEIAABCAAAVug6D6w24NChQAEIAABCHxW4JxQaL1nWt1yy0yNY2J7x9VHn12mD/fLieQoIUeyPV5/e2JhdP/W1lZHH9bP8KJoDgIQgAAEIDBwgVsikeFt10S+loxHb3Kw+UdhqiPi/UikyN7j+GMd159NYrenOvhDrz+4AqfEIlx6KZC8Yc6IZDxytiVmkpgP1c+Eg/X8sLS/px1sTZ4UCP4xHA5bvQwZi0EAAhCAQFEJYDAQ2LoAEj5b98FcCEAAAhAoMoHKaZe8/66j4nwR61Ri+u1Ah8ckZ5BFv3GtfqspGZ+/z0Dbw/oQgAAEIACBfgv0c8W2pqYdNckzdcRw/rVRxo8K0Y+0Du9nc3m9mo5rhe4lPzclQ7492V+3lPWNPK8DRnB5JWD/k4+10biV2LhZAxvMUxuaJHydYTgmT5w68+/aNwoEIAABCEAAAhDYogASPltkwUQIFJ8ARgQBCPy/QFVVVbc3MPM39n/1atLnYiLupIFddtF2pgqln07E6wMtLS32aT14YE1ibQhAAAIQgED2BCQcNlqvvnq7tqa5vzAcG/+miZBmfeM6SXvcTmuRFTZ1QH/VHeZHev3BCZX+urt9gcBA3/u1SZRSEWhtPcXRHo+cRSY9xczuwR33psdvQ2r0boFJVRe9Nbh9o7dCFUDcEIAABCBQugJI+JTutsfIIQABCEBABdzVwTnMdLSQ3KZ3N2gdSKkgkqadzI4/LI1HL7BP+TGQxrAuBLIggCYhAIESF2ifN2/7pQsb3MkxFdeXj3S+YhjGz0hohyJlESZawSw/Gloh3/QE6h4r0nFiWFkUaI/NPdi15rAbmfh6YhrUI980EfumRXJealXnT/H7UlncyGgaAhCAAAQgUEQCmyV8imhUGAoEIAABCECglwKsGRp3dd2z3avWn8cGuUnon71ctcfF9Mv5t0yiJkk5nm1rrrf/W7rHZTEDAhCAAAQgMBgCy1pahrXForPZZT5nWdavtc8p+n61k14XZdGx/YkN47CuUcZkd3Xw9uPPCa0vyoH2e1BYcVsCIsKJeGQKs/EAEZ9NROVaB68wf+AgPs1bXXeLLxxODV7H6AkCEIAABCAAgUIWQMKnkLceYocABCCQDYESbdP+Iu2eGnwgVW4crAQRYv63Xve7aCKpTJNHXzFEliRj0bvaYw3HrQyHnf1uECtCAAIQgAAE+ijQGotVJGP149qbo/NNs+NvBtNVxLSHNjNEazEW+0jdh0R3zndvNI5yT6192uertacV41gxpiwJtLae4kg21x+SjNffSsQtRDRKq36007+DU9LazVLTlG9M8tc9wcyi91EgAAEIZEcArUIAAkUnYBTdiDAgCEAAAhCAwAAEfOfXfvCeY8Sl+q3+RN0ptngATX26qkuYfMxW69oxFQl7B8KnM3ANAQhAIJ8FEFvhCrQ1R8ZooufnLt7we2FJ6O7iC3U0u2gt1tKtY2xl0zo25Uh7vP6623y1SPQU68bO9rjK1xxWKyT36ufAM7Uv+3cZ9WrwCjM1pDYaUyZPC745eL2iJwhAAAIQgAAEikUACZ9i2ZKDOw70BgEIQKCoBaqqqrrt07xt917n6YbI+UT8siaA7P+2pAFcttN1TxSxHmuPR1uS8Tn7tLS0DPpOBI0BBQIQgAAEikxARHh5Y+PoRLzhqGS8/npDjDc00RPWYdpHrY7U66IrzJriIVrFxA/rWI97dnXn6e7pM//gq5q9tugGiwFlXaC1tdWRXNhwaCIeeVSI55LQzlnv9PMdvKuTLnBXB2dpwvIDvZ0vBXFAAAIQgAAEIFBAAkj4FNDGQqgQgAAEIDC4AuPC4fSkQOiGlJg/IOKfMdGHNOALD9F2fiLk+O1Ys2Ne27X1e/enSQmHjbam+r3bmuYca/8uQ3/aGPg6aAECEIAABHIt0B6PfjPZHJ3b5Uzdw2z9RkjOI5JhuY4ry/13WJY0Stqc2DVqt+O81aGHwuGwleU+0XyRCtjJUteat+aJZSWI+EjKwUWI/sgWnZoatfuiHHSPLiEAAQhAAAK9EMAihSKAhE+hbCnECQEIQAACORPwBWa+6/bXXUXl5V/TIJZq7dI60GKfWifAaXkpEa+/ellLdJTurOr1b/xwOGxVTqv72xBr6HOm1Xm+7vBrTDZFj7ZP42MngLQtvMcPdAthfQhAAAJ5KGAfHdq+aN72bU1zT9LX/ieZ6GkiDur1YSKUm9/moUG5mNrLR8QSdzhoT28geJG3ZtZTPp8vpdNRINBngdbWsMs+qqfbmXpCV56u1f5spleDWuzHdWJ92vVD97TgI/p4tu8PagDoDAIQgAAEIACB4hLAzqDi2p4YDQTyTgABQaCYBNznTX/H4RhxurBln9P9QSIe8Jdy3UFXRiSzTJOeOWh0xdWJBVcfSH24TKipWe2prmssT7tC7BAni3FG2uqsO2RMxS+SzQ2nJeNz9ulDc1gUAhCAAATyVCA5f/7YxMLoyWPSHdfyBvNJwzCW6XvIYXkabsbC0jHap1R9gdmYlXbQdzzVocDEquCajHWAhkpSQJ9L+5etqbhWLOtJIdozFwja7yq25GIuN885q6ZmXS5iQJ8QyLQA2oMABCAAgdwLIOGT+22ACCAAAQhAoIAEJlZVfeytnrnElXadZFn2aXMyFvxubHCtOJx/SsajzffE41/oS8ua+OmaVB36nSZ/rtl+346rRPhayzL3FXI8lGyOvpyIR3+2eOE1X+1Lm1gWAhkUQFMQgEA/BZKxhr30NbxJytKvkEW/ZqZziahfpwPV9QqqaLLnDbHEp++5h7mraxtOrgq+UlADQLB5J9Bq/1ZPvCFEQs/q4+tHGmBO9olosqeTJe11TwtF3efN6tA4UCAAAQhAAAIQgEBGBHLy4eZ/I8c9CEAAAhCAQOEJ2AmWymnBmx1s7MrE85lk9YBHoVkaJirTnQBTTfr4xURz5PJlC+sP6ku7uiNQxo0Lpz2Bun96A6Hw0ArZS0Sma3xfcFqpG3Sn4YuJeP3NWgPa9jFLW+bvbu/86EsfWBYCEIAABLInsLyxcWR7c+T7mqyvS8SjK4Wtv2hvAWLanogcWou7ML3HQq0kdIrbH9zTMy3Ubr/n6qD17VH/ohS4QG7Cb21oGJqMzT3BtebN+4Ssq/Tx5cpNJNRFxHcZprmPJzD7MSKNRP+gQAACEIAABCAAgUwJGJlqCO1AAAIQgAAEBiRQoCtPrK791y6OipkWpw8j4ruJyNI64KJ7tXYh4YtNS36TiEUXJWL1u/Wn0ePPCa33+EMPTlq1vk6GOic5WU63xHxZE0B12nabme7+Q/matx5KNNdfujge+Xo4HMZng/5AYx0IQAACAxRIXjd/bHs8cnHKmXpcX/8TIjRXm/y+1jKtRV+YaD0JXc1ifm/ksB1/5AkEFxf9oDHAQRFojcUqyoZaNwgb+jmNf6id5ixxygbNGlphneeePusdjQMFAhCAQOkKYOQQgEDWBLBTJ2u0aBgCEIAABEpF4NCqqm5v9cX/eM9RcaZhSaXupHuUmTZmYPz2+/QYYjqX2fpTYmH0Z1r3XxkOO6mPFw6HLe+UGR+dVB16qTIw8+p3HSP20dzUSbqDbYUQDSWRmU7i5w8ZU/GPRHP0lvZY/blL4/Xfbm25eveV/eivj+FhcQhAAAL/FSiVG/ffEhme1ES7JvTPScSj91jd6X8y8ZU6/v2ZaDu9tt8D9KqYC3fqWP8oRJcZDvqSJnkudvtn/XXclCmZeA8tZjiMrRcCbU1NOybbdFI4AAAQAElEQVSaIzUu3vAmC52uq1RozU0RetEg6/vuqcFrjj8ntD43QaBXCEAAAhCAAARKQaAEvkSUwmYsmTFioBCAAATyWqBKEz+TpoWSIkM8lkU/1mD/pjUjRYhHk0W/IEtWrB09vCkZa9hrIA3bsXr8M3/v9oeqUunUeBIeL0yztL5GQmczyyJLZIXLdK5YO2b4ivZYJLykKXq0JoDsnZAD6RrrQgACEChpgbaF9QclY5Ffbug0NOHOK4jlZgU5URMfJXEkj47VLl1CdJeO/WTTSo33+oOXT6wKrrFnoEJgoALhcNiZWDjvZIM33EfCUW1vB625Kt1M3JxmwzOxOvRIroIo0H4RNgQgAAEIQAAC/RBAwqcfaFgFAhCAAAQgsDWBymnT3vcGgnduN3THg/RL/lW67LvEbOp1Bgrvrm1ViWH9ORGP3rj0usiXlzc2lve3YWYSX80lqz2Buse81cG5nurgOGHHl0XkV8Rk73wbI8Q/YOafOwx6WBNA/9Z+H2iPR6e3x+Ye3NrcsMttjeGR/e2/f+thLQhAAAKFIfB0S0tZa2Pj6MXXzP2qvnb+LBGv/4thyXPCfBmRHKWj+KLWkihC1K0D/afW6820uZcmeU7T95z7K6dd8r5OQ4HAgAVWaqKnLTZvv4PGDL+ZLPNuYj5UG81lInUVCV3UNeqJ6Sf7a1/Xz1Ki8aBAAAIQgAAEINAnASzcVwEkfPoqhuUhAAEIQAACvRSwT0nj9tddYonjByTSoKut1ZqZImT/2PAUq5v+1OVMtSyJ109qDYftaQNu31s94x/eQOhn69bLwWya4x1i/ESEWonpPW18qNYfMlEjs/FHF1kPVziHL0k01y9sj0XOSy5sOHQgCShtGwUCEIBAwQssWzj3q8nmyLS3zc6bXM7U/c4y43kd1C80ybOfXpda2aA7upNMUkXCR3r8wQsm18x6OyMIaAQC/xFob573pbVjK+Y6DGslE5/xn8m5urL/yedew+EY7wkE4z7f3fb9XMWCfiEAAQhAAAIQKDEBJHxKbINjuBAoFQGMEwL5JFAZmPGy7uCa6Uq7dte4lmpNa81Q4S8w0Y8cJMnyMSN+t2xBdN+V4b7/xs+WgjknFFrvnj7r6UmB2hu8geCpnurgTkI0QZNXv9GdlildR/ff0VeI+Ic6rYqZrxfL+mPKmVrdHqtPtMXqz2ltvnwXOxHV2trqICINlXCBAAQgUFQCIsItLT/ZdCRPeyw6MxGL/t20jL/p5AX6WmnveD5EB2wny/WqZIqlI01pgqfFKJMD3NV1Ho8/tMgTqLOP8NFZKBDIjMBK/czT3lx/Lov5IgnN0Ofj2My03O9W9DMex1Ojdq+cVDXjmX63ghUhAIE+CWBhCEAAAhD4fwEkfP7fArcgAAEIQAACWRWYUFOzLrWq8xQR40Tt6Ne6I/Bjvc5YEZIjTQe9vHbMiHuT8fqzlrTM2zljjf+nIa8/uMITCB3P5UO+bAn5dPIC3cFin5N+8x/YHsEsboPlZpcMecM1tuIvZWvevCvZXP+Ltnj0R20LI99pbWjI5fn0NWyUEhHAMCGQNYFlLdF9EwvrT03E6+eNtfZZWeZM/YuZ5hDTXlnrNN8bZurQEJcRywwS3ksTPFMnXRB6Q6ehQCCjAi0tLWWaYD19rX7mYZFF2niF1pwWIXqULZrg8dfV+Hw++x9jchoPOocABCAAAQhAoDQFSjjhU5obHKOGAAQgAIHcCvjC4ZQ3UPub1KjOH1nCx2ti5OnMRyTHCVk3OCzzqWQ8Upv59onc501/pzIQbHtuVedFQ0fIBItlDyL5sfb1lNbNSxkJfYWJJ4vIZfrB4zq2+DeuIdZfE/HII4mF0Z8tjdd/W+fx5ivhNgQgAIF8FEjOnz82EauvSjRHnzFNepws6xZN8lxIIkfqi1gufyskx1zyob4HRGWj4+upjcapnupQoyZ7cDRPjrdKsXbfHpt78E5Wx5P63NNEjxzXu3FmcSkmTe7I7G4ZOt49LfhAFntC0xCAAAQgAAEIQGCbArrfZZvLYAEIQAACEIBA8QrkaGQ+XzilCZNHR763/jtMfDax7jgke4dBpgJilyZadhXiet0x+a4mV2bZO0jC4bAzUz3Y7Wh71vHnhNZXVodWbTpdjz94uGHKnprM+omO6zYhel53Am5+JFMZE9n/hTuKiI8ii35hkTy+tLmhMxGP/kF3pF6j1+cnY/Xj2mJz9muNxexlCRcIQAACgy2wrCU8LBmfs4++hh7f3lx/mb42/UFc6TeJZaG+vtqnadueSF9rqWQv/1aHZRbxNMvq/qq+B4S8M2b8w1dbu6FkRTDwrAms1M8vS5rmfkOfh03MxsMiZD8Hy7PWYW8athM9TA9pLJ7nVq2P+AKBzt6shmUgAAEIQCCHAugaAiUggIRPCWxkDBECEIAABPJXYFw4nHb7625zGDSJhU5nplcyHq3QWCK+kthYftDoEYvbFtYfRFm8TJoeeqMyUHdd16jdzjVMc4JhyVG6g/RCIfpdT90KyTCdd4QuV6PXLcKSMNi4z8Ubfp+IRdramqOzE02Rw1cuWjRE56NAAAIQyLiA3eDyxsaR+pozMdFcf41pVqwUctyvr81LWOSXOv8IrbndwawB5L7wy5YmeRwO+oHD2Xlapb8uVjntkvdzHxciKFYB+8i6j8ZUxByGca+OMaB1pNZcl40iMmu4kfZ4/cEV9j/A5Dog9A8BCEAAAhCAAARsASR8bAVUCGxdAHMhAAEIZF1gYlVwjTsQbHNXB/cj4ana4V+I2KTMXQwm2pnt39ax5LlEPHpfW1P02Lamph11J0VWPg/4fD7TPX3WO5OmzXzGPr2P7hA5xkndO+gOkvOJZAl/ktz6SIdoad282PHozhzeXSceTMxeQ+gqMviJtRve70jEI3/R+JsSsfpzkgvmHJqMNey1vLFxdGtr2KXLo0AAAhDYpoC+ZpTf1zJv58TC6P6JxsgP25siV2qi57GUM7WWmJeSiJ18Pkwb2kOT1cP1upTLRhJ6Q1+z7zRYjvH46/av1CSPvm+9MrEqvPkRnKVshLFnWMD+bJKI1e/WHotME1f6Jf0M8xPtYietuS4pYnqEHMZhXn9o/rFVs9fmOiD0n3EBNAgBCEAAAhAoaAF7h0pBDwDBQwACEIAABIpNwBOoaxHuPlF3rk1nycIRP5+AHW8YtMwwNi49ZMzwWcnr5o/9ZHJ2/57kv/hDbyB0g3vVel/acPzAIsujO1Ortde7dQfKv/V6W8VJxPsRUYBYbhaH41Fh87e6k/Ye15qKu5PxSL3uHDqvvXnOYa0NDUN1uQwWNAUBCBSyQHtL41famiOnJWLRq/Q14+6NprmcLX6InPwAG3wxMX+nkMeXhdg/IKabTEvOSJFxnLs6eMak6lCPR2pmoX80WaIC9ukUDx49olbf5+9jNuYrwyit+VD+YSeDU0Z6kqeq9sV8CAgxQAACEIAABCCQLYHCbdco3NAROQQgAAEIQKB4BbzVF//DXV3X3NVlfINIZhPxvzUx8tkjYWiAF/vUREcI8ZXSnX63PW7/h3v9bq2trVk/UobDYWty1Yx/V/pnPuz1B6/1+IO+1HudXzLI+L6OaSEzv6XX64SoW6+3VnQMbB8JZP8n/iQhrtV1r2dxPOkaYnUm4pFXErFIJBFvmJKI1e9mH9GUvGHOCPu/+8PhsLG1hjEPAhAoPAERYTvZ2z5v3vZLmqJ7JBZGT9bXgTsT8ej7bKZeNYTvJCZ9TaWJOrqDhWS0XqN8IiB61cFEfxamYEqG7uGpDk6ZPC3U7gvUvqrzUD4VwHVWBFbGYhXtTRGfZVa8psmeiHayv34Gcuh1rkuXBnCvxXK4JxBq8eGoHuVAgQAEIAABCEAgXwWMfA0McUEAAhAoRAHEDIFMC/hqazd4/KE5wsYRBtNM3Rv3vPaR6cSPNkm6D5Qv1h0sz5atfuumZHP0zOW3NY6kQbz4wuHUJH/twx5/sHptp7W/aVnjNKjzNIQFOu5HSWi93u5L0c85vA8xB4msG3VsbxnGxr9Il+OBlDN16yFjRtS3x6PTtXqWNjUc0Npy9XZ9aRzLQgAC+SFg/7ZXe2zuwZrYmZKM19e7hph3c7n1mMOgl8miu4n4NCLaQSvKFgQ0wbNRJz9ITJeQJcd2jer8hrc6WO8LBDp1OgoEsi5wW2PjSPtzx1recD8bfLu+5+fDqduImTUUekIMmuJwjPBVVodWZR0DHUAAAgUlgGAhAAEI5KOA7gjJx7AQEwQgAAEIQAACmwt4q2f8w6074DrWy5EicmE/kh+bN7e12zsy0+kifHNqXer1xMKof2sLZ2veOaHQ+snTZj6jOx1vfW5V50Xb79c5zmW6dtSdkZW6c9L+0eb+dj1GVzxc6ylCcpG2NV/rYtOwnnWZzvcSscjz7c31N7Q3RX+SXNhwqC6HAoH+CGCdLAssa2kZps/VyYl4/eK1G97/gNh4SoivJ6YZRHwikdinfhxKuGxNwN55fanh6Nxxu1Wd4z3Vwas900JP+nzh1NZWwjwIZFKgrSX63Qpn6jH7c4e2e4RWp9a8KKZp/oo7zOO8U4N3Tqyqwu9V5cVWQRAQgAAEIAABCGxLAAmfbQllfD4ahAAEIAABCPRfwE6EeAOhpjKy9tKkz8WarHiUmLKwc07sU6hogoViiXh0dXs8Ut/WFD02OWfOiP5H3781w+GwNW5cOD2hpqZLd0a2u/3Bk7YbuuNQi6zvi1iziPgOEnmaiNZq7WuxPws51LFMVywn5q+zyI/ZoBaxrD8m49FOHf9ftd7T3hydn4jVBxOx6MntC+uPsY8Kujc2d6fW1lbbSldHgQAEMiWwMhx2Lo437LkkFv1WMl4/qT0e/YkmZCN6vSQRr/+LaXZ8qM/VxZrYmax9DrWfw1rt57PeRelBYK0IPa7z7KMmJ3j8wbFar5xYFf54XDic1ukoEBgUgXviV33Bfi9NxqPLDZMe0U4PINr0uUNv5rgI2c+FZYZ+xqicNvPn7lmzOgYWEdaGAAQgAAEIQAACgyuAL0WD643eIAABCEAAAp8IDPDviYGZ73oCwasd1D2JTDmNme3fvBlgqz2uPoqJZzgMXkwjHA/bR7/cEokM73HpQZgxbsqUjZt+/ycwc+6ujopzHU4e7yTjGxqnT0hu0xD6k/zR1f63CJE9zr116oksdCGxRJjpVrakzWLrt91sPOFa89afdcfVbYnm+suT8fpTFjddfcBK3Vmt66BAAAK9FFjaMn/3ZHPkNE3qXLq0uf7etaMr/uwk6xHNxi4XojsN5oXEHGSiSt0xvJ82m/XfGtM+iqKo30sWSZ1TXyO7u4yT7KMmvf7giqIYHAZRcALJ+JxJJrt+Q0y36GNzvA5An9b6Nz/KOxrMqdxhnjnJP/Ph/AgJUUAAAhCAQFEIYBAQGEQBJHwGERtdQQACEIAABDItcJL/4g8900Lt7uq6PUiMwKYjXZiy8d+o3h2rWAAAEABJREFUrImUkbpz5hA2qGXkcP5bIh695J549Ju5OOpnc8dDq6q6J1YF15zkr33d7a+72+sPne3xB7c3hA4TTVTpzps2Zn5G13lXdzAN+GgoIRqibY3Utsbq9R5a99HbZ6r9pWrU6jScL60dU9GdjEefa49Hl6pTc3s8clEyHjmxLRb9btvC+oPsIxeWNzaOtn97RNdHgUDRCrS0tJS1NUfGtLfM/Yo+H76ZiEd+mIxFz9TnxRVa79T6tFbLMtNvivCdxHy5JTKBmOxE6y4KM0oTPMNEZ+rtoiyZHJS+Plna3r+1PqY1YhJ/x+sPHljpDzXYr5G+2toP7KMmdR4KBAZNoH3RvO3bmutP0vfF3wo5kvp8tk+ZmjenXGTi1fqaEze7ug51B4JtbhzVM2iPDXQEAQhAAAIQgEDmBZDwybwpWoRApgTQDgQgAIE+CXgCtXHuLjuJLcunK96vNZvli9r4FWmi+2SEM5mIRf23NTaO1Gl5UyYFgn/0+uvmu/3BySZZ40Ws8cTs1R2ilxPx77V2UhYv2s9BTDRRu5jKxPOE+B6DaYVhyQonWStSztSKtRvfX5Fojt6tO8EjtqHuCK+0jxBa1hIepuuhQKCgBJLxOfskm+ceqQnOs5KxuVFN5LSOtTpWOMhYYZhaiVeQVmGyj8K7hIhO0/pNrawVZQACCrhOhNpYrCmWweNTjvQETXzPnOyve2IAzWJVCAxIQJOLRnu8/iLeYN5rCN0pRD8YUINZWFljWqbPHc9273VeOHnGpXayNAu9oEkI9EoAC0EAAhCAAAQyImBkpBU0AgEIQAACEIBAXgi4L7roPXdg5n0ef/AEy6DjiOkhIlqnNVvF/u/7cdpPrMKZ+rvu4L2i7ZrI11bGYhXZ6rA/7VZWh1Z5AzOf80ytW+71By/z+OuOTm3kMRr3CbqjZ65e/0VE3ta2P9Jqas1WsV121sb31vpNEvq+1pOJOKgxxHRH+BL7CCHTrFifiEc2JOORpxLxyM2aDLqqvbn+3KXNkR8sXhDdt7153pdamxt2WdYSHdXacvV2doKoFb8lRLhkVmB5Y2P5spaWYfbjbMm8K3Zub77qS0k7qdMUPToRm3uOPt+btCY/eZxG9ankeEXEeJSJbxU26jSaU/TxfYw+t76hO1W/KiSjdZpTK8oABJhZXypovTbxDjEvF9Ykz1DHHt5AcLInMPOWyql1z/uqZmfktJbaBwoE+iQQDoeN1usbdmhvivgOHlPxNpPM0waOIBL7/U9v5kUx9XXqdSLjTE910O0J1D02LozfscqLLYMgIAABCEAAAiUvMHAAJHwGbogWIAABCEAAAnkpUDk1+MCHQzrHi8WVulPwOg0ym4kfbZ7G6J9LjDJ+dC1vWNwei9a1Loh8WaflZfHV1m7QHT33ewPBWXp9gMNpHskWuXWn1AUsVC9CD2jgOdxpykOE+FtEfA4xzWaRRZbwb50OetkQ66kysR4xLV7hMp3tmiC60/X+W9frzvdm3fl+sdbatub6k9pjc49ru7Z+70Ssfjd7JxzhAoHNBESEl8ybt7P9GFkSqx9nP2bsx057LBJONNcv7C5L3WKaHb+2H2eOIeW/M8T5lJDjz2LQw8TGzdpUQOukTx6negslywL8sXbwmGVZP2fm01iM76V23G2St3rmTd4pM+xktc5GKWqBPB/cksbGXQ8ZPeJnrpR1LxtsH8ln/4NDfkUt9B4TXyZC3/f4a+9gzUjlV4CIBgIQgAAEIAABCAxMAAmfgflhbQhAAAJ5IYAgINCTwJQp4Y3eaXW/9VTX/cSVdu2m+zVu0GU7iTWloTeyVLbTdo/XnShRl4Nfb4tFbl7cXH/IypVh+z/7WeflZZlUNfst97TgIx5/aJE7EAxqIug4jz+4vYh1iAZ8qVb7NzG6SCitty2tOSv2kRIKuSeJ2L+DME4DmaRxnavXU3Xn+5Va6w2RZczG/UZa/kosbx08psJMxCPrNSn0pF4/0B6PzNPbv0gsjJ7cromh1thVey1aFB6yvLGxvLU17GoNh132NlsZDjvto4fshJFdtQ+UPBEQEba3iV3t7WTXp1tayuztZ29He3vaCR17+7Y11f84EYtc3h6v18Rg5BHd9v9INtdbjnLzHfsx4mDRhI4sE+J6Zv65PraqRMg+PeREvX2oPr721Xn2EToOwmWQBNjUBHSKmJ/WDi9wOGQPfU060hsI/WpSdd097kDtqz6fT5fRuSgQyJGA/TrU1nTljposDjmcXX8Vlp9rKN/WWqY1n4opwskUDd3L7a+7yhOo+2c+BYdYIAABCPRFAMtCAAIQ2JoAEj5b08E8CEAAAhCAQBEJTKipWef2h85Pm/Qt3UFzhQ7tOa1ZLwbzOWUkj617efiDmmSYnWiKHG4nE7LecYY62HQqOH/wSntHa0o6RxFbPxDD+InuAL9au7hL60uafNmo1wVQ2P5toMOI+IdMfBER/Ywsups1MeTisr9/YUPFhpQj9aFr9fBXXGMq/rz25RG/+2h0xX1la9686+DRwxdq0ijW3lx/WVssOjvRHKnRxNEZdtVpk3Xad+3a3jjnsPbmeV9a2nL17nbVPlD6IGCfOs12W9IU3aM9Hv2mbWrXRKz+1E3Wsfpz9f5suyab6+ds2i66bT7S7fTR6Ir73jY7nra3X7cztcrennZCx96+hiE3EPOlmvQ9j4iPIqI9tKLkmwDTB0L0O2a6hojPMcpoX03Yf0tff66fWBVcQ7hAIE8E7H8ESMTqj0jG6680jPJnhHguEdvvMZRnly4museyZHK5WXaqLxDozLP4EA4EIAABCEAAAhDIqAASPhnlzOfGEBsEIAABCEDgE4GTpwdfeX5V589dadf3SMQ+MuSVT+Zk768I2acn+x4TX04GP+AaPeIPbc2R07LXY3Za9gXCnR7/zN97p9be4PbXXaKGP0o50t81WfYgphO01yv1+kW9to8C0qsCLExDidk+Fd9eRHIUMx2j222yTrtARzOVRX5pMF1FwvN02iK76rTbddoKu7LT8SBL+hnLdD5r10Q8+u9PazIefUVrMhmLtP2n3pWIzQ1uXtuaIm57J+Lm1U58rAxvOkJMQ8jP0trQsMOS+Jxvbx63fbs9Hv3J/4wvFon8Z+ybDNTmD1r/a+QoL3/RdnM46BnWHf+2qV010XjLJmuWa/X+VXZViZBOu8Cum7aTbiud9nW9/2UhGqm3UQpH4C6DeaLDoH061sukrh2frLNPNzXpgtAbhTMERFoqAm1N875TvubNpLDcT0yz9b1i97wcu9BHJHRW10bDVzktlJxQU9NFJXPBQCEAAQhAAAIQKFUBJHxKdctj3BCAAAQgUJoC/xl1OBy2dMfHOk8gtGzoCDlUiM/Wncv3av3wP4tk68r+7DGCWA41hO/UHd3vJOP183Sn+HhNAI0R0l1HVBgXZhY17PJVzV5bWR1a5akO3u/xBy/V669rEmiUZTiO0HFO1dHESGS5Xr+gO57eU+PCTQbpIDYrho7HtakSlev0iv/UEUT8BSLa4T91J73eVHX77qN1kjB7/1N9xEZk82oYnFC3P2xemejptWMquvXxIj3XyF8S8WzXaFdP/buGWO87yPH45nHbtzX2lv8ZH3PwP2PfZKA2R2jd5POf6x31egd1tf3spM1/XPlT6zKdj1K4Ah0a+p+13qv1SjaM8c+t6nToa8dp9mna7KN4zgmF1vt8d+NUbQqEkj8C98bm7rS0uX6yvgYmDcNcKcQn6uub/fqUP0F+GgnTa3rzlw7niF08geBi+zf79D4KBCAAAQhAoPQEMOKSFDBKctQYNAQgAAEIQAAC/xU4/pzQeq+/7rYuGXqaOIzvMcl83Ymz7r8LZPfGzkJykfa52BBemYxHFyQWNByY3S6z3/qmJNDUGY97qkMtuiN32nbDRk1OsTHBInOclTaP1PHWCdHNzGQfDZT9gEqiB96PKNuVXIQLBPoqILSeiH9jEdcZQse4ylwnbDd0x5P1teFS99Ta++wEPOXggi4h0BuB5HXzx7bHojO7yVgpIrfpOpO02kl+vcqvYn92EZKr0mIclxq1+y8nVlV9nF8RIhoIQAACEIAABCCQfQEkfLJvjB4gUGgCiBcCEChRAfu89p6q2hfd/tAMg439hWmuUvxNd6AMwilQNp33f3/tL0AO69lEc/SxRDwyJRmfs8+ylpZ8/E0ADbX3ZdyUKRt91bX/qgzMetlbM+spNW7w+oPnuquDX+dycySRcbR6B0noJmJ+mon+TkTvaEJoo16jQAAChSOwTpO5rzPxHzTkK4UcE3iIubPHX3d8pb+uYVIg+McJF9S8bb8m6HwUCOSlwPLGxvJlLdF925vqr6Tu9Ev6XjSHmPbVx/aQfAxY4/qAiVaIaXzX6w9dcrK/9nWfz4ej5PJxYyGmfBRATBCAAAQgUGQCSPgU2QbFcCAAAQhAAAKZEJioyQlPdXC2WeY6hg3jVG3TPv3QYJ2KzKGJj+8Q8fW6s/S3ltmxOBGvDyQXzPkiFeHFfd6sDo+/9vfe6mC9JxCcktqx40h2pH/oMHiCSXyKiHG+7my7Rodub4M39drSOggFXUAAAr0Q6NbXK/t30K4n4R+xsMck49h3HRXj7CN4vP4ZK+zneC/awSIQyLlAa0PD0MTC6MldztRi06SVbMjFmkwZlfPAeg5An3/SbgifvItjhNszvRZHzfZshTkQgAAEIAABCJSIQP8SPiWCg2FCAAIQgAAESlmAiWTyBTVvT5pam9QdlycxmV9Tj4RW+z/YByPpYH9O2UV3No0nkiZxOP6VjEeXL1s47zutLVdvtzIcdmosRVd8vnBqUtXstyZOrXu+srruHm+g9gZ3dfAiexto/dLQ9TIyTXKsCF1EREt1O/1diOz/brZPw2cfEWTqdBQIQCCzAml9HbJPD/UhCb2hz7mbxeSTHQ76oiZq99Pn5gWeQN0t7kDdSvvogqqqqu7Mdo/WIJAdgdbWVkf7onnbJ+INU1xDrJfJorv1feUk7W0nrZ+UfPvLlNLn4Yts0Q89gVCl/bw7FM+5fNtKiAcCEIAABCAAgRwJ2DtSctQ1uoUABCAAgUIXQPylJeD2z/prauWTJ6fT/H0mvkRH/yetg1p0J+t40zIfc1nO368bPWJhIh45Y3lj466DGkSOOzs+FFp/sj/0oDcQvEZ3Mrvd/uDeLHywZuB+YBlyGhNNI5YrdOf0IvX6nd5/Q0PeoBUFAhDopYA+d7qJ6Vld/G6tEd0JXi2GMUkc1rc8geCeXn/wXO/0uiUTq4JrCBcIFKDAynDY2R6be5zr/bca+WPzSSLrBh3GHlrzvawU4iqX6fqWe1rwkXwPFvFBAAIQKCYBjAUCECgMASR8CmM7IUoIQAACEIBAXgj47r7bPLmm7lmPv27ue44R3xGiQzWwQU/8kNCBwnIekXFLypl6rT0eXbKkKXq0hMMl+dnGE6j7p+6A/lPl1FBSE0ALPRWYKZUAABAASURBVNWhy9yr1p+//arO47tGde7rSru+YFrWN5npLGGyTw/3FJHYRyvo5kOBwIAFiqGBTn1uPKDPi9lsGN/6aGjnyF2NEYenRu1+uru6bpZnWvB679S633qrZr5WDIPFGEpXwD6iJxGLTFw7tuIVZuNefT/1E9PeKsJa87jwPyx2HLPdqs7jvNV1N02oqRmE3xfMYw6EBgEIQAACEIAABHoQKMmdIj1YYHJWBNAoBCAAAQgUqYDYpyyykwx24sdM83dIuJGYXxzc8YpD+3PpXqpKh0EPJ8dW/DkZq1/Q3lw/eXG8Yc/WU06x5+siJVeEw2FrXDictk8RZ+8Ymzxt5jPu6uDt3k9OD3e4xx8arttsd61HWswTWWgWCzcx8W2q9SAzP6PX9m8Gdeo1CgQKXEA+JKbXtD4iJEuIOEosF1osxzCZ+3r8wRH63DjO4w/NcU+tfXrKlPBG+xRRPp/P1OeCEC4QKGCB1nDYlYjPPao9Hv1V2Zq3niPmpST0FR1Sfp8alfVdieUZYrp4OxlyYGX1jN+N0/c1jRslbwUQGAQgAAEIQAACuRYwch0A+ocABCAAAQhAoLAF7MTP5Jq6J7Zb3VHHXRuPtezkAdEf/2dUg3VHaF9hmcYitzrJesQ17vC2tqYG9/LGxvLBCqGQ+rGPDNL6WGV13T3uQHCuO1A3/V1HxY87052Tu7q7TjDT5nfFYR1sH/HATGfprrdfiVCr+j7DRPZvBhXScBFr6QhsIJHH9bF6kzCdQ2QcbZj0zRQZ35ONDvdHQ9ef5fHXhTzVocbK6tDv7NNVlg4NRlpKAuFw2GiPR85yja54msSwf/PtUiayf4+vEBj+IWKd09XdfYJ7at2ccYEA/vmgELYaYoQABCAAAQjYAqg5FUDCJ6f86BwCEIAABCBQPALjwuG0+6JL39uUPPAHD7MMOUJHt4hI/qrX3VoHswzVznbROskwrETK2f1aIh5tbIvNPaG9Ze5XkABSmR6KncA7qya8zldzyerJNbPetk9h5Z5a+7R9dJAmhH7mDQRPdQdC33T7g9ul1qW3Z5KDLKGzSChAxHM0MfRr3eYPEtFTWl8QkteI+T1i+kDvo0BgIAIb9PG0mon+ro08q4+ph7Qu1sdbVETOt8j4vlEme3r8wWGeQOgIfaxO8VYHb/X4a38/aXroDV917b+8M2Z8ZB+9o+uj5EgA3WZXoH3RvO3bmiLfaYvXX33wmIp/M/Gt+jw5UOv22jNrzedif1Z4SYO8zLJSh3r9odvs9yJmlnwOGrFBAAIQgAAEIACBfBJAwieftgZigUBpC2D0EIBAkQlUTg09nhq1+wXCzhNE6Ec6vHu15qiInfyZ7jCMdjaN+1LOrkQyHp3a2tg4OkcBFUW3vtmz17r9oRcqA8HbPYFg3OOvm62JodNTo/Y4IeUyxrNpjjfEcYLuvBsvZIy3xBqvO+fP1MfDLGaq1533d+j935OQfSrAjqJAwSAGLKCPlze0kT9pvUsfK/VEPI0sPtHSx5DD4TzBcljjOdU1frshO473VAdP8fhDIW8gdEOlv/bhSReE7HUJFwiUmkAiVr9bIha51Nhg3WMYvMwgmaUGY7QWSnlOA/WbZeZ4tz94eeW0S97X+ygQgEDxCmBkEIAABCCQJQEkfLIEi2YhAAEIQAACECCyf//CWz3jH95A8E6PP3iSJY791eUurf/UOug/uCxCQ7TfvYj4BCFqLnOm3k00Rx9ub547eUlTdI/ljY0jCZcBC9jb3Xd+7Qfu6bPecQdqX3VX1z3rra59qjIw8z6PP3SHPh7mamIo6PWHztT7R2uy6Osef3CkVrZYDhQ2DrdIfiwi04UprgHdqvUJYnpFr18l4rc+qbSGaFNdS8Qff1LJIlzyQODT7SEfajBrNInzL9q03ehVezvq/Xv1+iZN+l3yyXY2Djdd9CX7MaA7e+2jdA7V26fpYyWoicSYZ1rd8ko7oVM145lNR51ddOl746ZM2Ui4QKBEBfR5w8taoqOWxKLf0mTPImLR5xZfrs+pI5VkR615X5hoo74Xv85MZ223X+e39Dl//eQLZr1NuEAAAhCAAAQgAAEI9FugsBI+/R4mVoQABCAAAQhAIB8EKgMzXtYdOqeR8JFi0QUidCcx5exUX7qzySCho1mMxQ6mJ7ucqfZEc/3l7bGG41YuWmQnh/KBraRiqKwOveS1k0P+0CJvINTkrQ4G9DFzjtbveKqD+zkcIw5iM/2dT6q56SgiU9ir2/J0uxpi/EQzPtVkyYUkNI/sSnS97lS8h0TuVcwHdYfo3+2qy7+q9zdoRemdQIftZldd/IlNnmqq9+fbzmLJVba9XdV20/YgMU5i0xzvIONo1u22br0cbG9HTeqcpNdTvP7QVZ9s59qnJp8ffFPbRYEABLYi0NoadrU1R36QbK6/Jp2W++33Lk32nKuruLQWTmF6yCK+oNuR/oa7Onj7uHHh9OeCxwQIQAACEIAABCAAgT4LGH1eAytAAAIQgAAEciyA7gtfwBOo+6d3WvBWbyB4hgxxfIWI52ji599EZGrNTWEaqzupf6A7sS9ltu5fu+GD9xPxaFPbtfV7t4bDLgmH8bkpN1vmf3qdWFX18aYjh+yjh6bPelpvPz05ULfS7a9batdJgdobKv3BhZ5poUZPIFi7qfqDF3j9wYmeQOgkTRwd6/WH9rarJh2+qveHaeVPKxv0vc2rJoou+3yVZhZ6YEtVg7WPOtlWtY9uS+mymax2mz32y8Kr+bMxk9xniUQ3H58+B87dfPz27zR9aqPXI203u+rt72zyVFO9P8Oj1t5poUtse7va28Ku+lx/zN5GJ/lrX9frd84JhdbruFEgAIE+CLS2tjruice/sCQ+93zX6oq3DOHf6urTmfkbeq1PW/1bGMXUYF8whQ7ThO84r7/uNl/V7LWFETqihAAEIACBXAmgXwhAoG8CRt8Wx9IQgAAEIAABCEAgswLeKTM+8vjrZjul+wAmrtSEy3VM9PfM9tKf1mSYrhVwmPSKa0zFn5Njhl+vCaDzFy+Yc6idANJ5KEUo4J4afGTz6vUHL/98DfndgeBxW6qaCBm6repKu8akydgvk9XhGLHD1vp1B+rGfC5ef2h8ZSAU2nx8bn/w5s3Hb/9OUx5vZoQGgaIWSMbn7JOMR6e61rx1W5o+fsVBxnXENLYAB23/RtutxMYpZWnXYZMDwT8W4BgQMgQgAAEIQAACECgIAaMgokSQEOizAFaAAAQgAIFCEzjJf/GH9hEBz61e7++k7sMtg47TMTymNafF/p0EDcD+3Z8pet1c5nD+1jWm4q/t8Ui9vTNOp6FAoE8CE2pq1p3sr309k9U+8qlPQWBhCEAgbwUSsejJWh8UcjwhRAs00NO0jtFaaMVioRtJ+IDUqs7zPdW17fr6Zx+NWGjjQLx5L4AAIQABCEAAAhD4VAAJn08lcA0BCEAAAhCAQF4IhMPh9Jma/KmcGnzA4w8eaf+AvwjN1fq4BrhOa+9L5pd0CslIbfZLTFwr5PhLMl7/ku6Ya9DrUxY3XX1AayxcofNRIAABCEAAAr0SWNpy9e7t8ej49lg0mojXv0NMd2s9RlfeXqtTa0EVZnqFmZssMb/mDgTP8wTq/ukLh+1TWBbUOBAsBCAAAQhAAAIFJoBwNwkg4bOJAX8gAAEIQAACEMhXAW917VPPr+68WGTIRHLIcSLyK431fa35UAxNAB2gO+ZmCMttTsO5wsUVDybikUiiKXJ4S0tLWT4EiRggAAEIlLpAvo0/HA47EwsjE5Px6BIxnQ8y8WJmqiOSnfMt1l7HI/SqWHRO2qQTunbc7aLKwKyXe70uFoQABCAAAQhAAAIQyIgAEj4ZYUQjEIBAAQsgdAhAoAAEdMeYVTlt2vueqtCT3kDoZ9sN7dyVxDqNie7R8P+pNa01t0XIpQHspvVwIg6SwU+MNTveTsQi1yYW1k9Y3BLdt33evO11LPj8RbhAAAIQKC0B+x8AljTO2TXZPPfIRHO04eAxFf8ii5cKUaXWr2qiZ1iBinSQ0OOW0FmeQPCr3mnBWydPC77p8/nMAh0PwoYABIpbAKODAAQgUPQC2OFQ9JsYA4QABCAAAQgUn8C4KeGNnsDMu7pGPekhg07QHU2nCvESHelGrflUxhDzBWLJMqdJv2OXmTx47IiFyXj9KUvmzSvc/+LOJ+GMxYKGIAABCGRewH6tT8Sj5481O281nI4VIvygJkhmaE9jtBZyWavBxxwGe3mIeXxlIHi73keBAAQgAAEIQAACEMixABI+vdkAWAYCEIAABCAAgbwU8PnuNj1Tg3/RHU1tXn/dySkZOpqIp2n9MxF1arW05rwwaVqKaGdiOppELhCSVke5+U4yHnmoPR6dfm9s7k7LGxtHPo1TwOV8WyEACEAAAv0VECHW1/LyZS3RUYnmBm+iOXq3vta/oe1dRySnMtHXiHgIFe6lW0N/l4jncIe5m8cfnDZxat1v3efN6qBiumAsEIAABCAAAQhAoIAFkPAp4I2H0CEAAQhAYHAF0Fv+C/gCgU6Pvy62q6PiEEvS4zWx8lNNsCzXyPNyZ5TuG/ye7gBs7GbjHyln6qF/mutuTMTqg4nGuUctv61xpMaNAgEIQAACeS6wrKVlWHtzw2HJ5ujFKWf37WmTniax2kjoZA29XGuhly4RSeog/CR8mL7PznbPQpJHPVAgAAEIQKCIBTA0CBSqABI+hbrlEDcEIAABCEAAAj0KHFpV1V0ZmP2o1x+6+rnV690Wy15CVMMkb/W4Um5n2DsED2His4hlLjmM36XWdf8rEY/ek4xFz2xfNG/73IaH3iEAgc0EcBMCmwTaYvP2S8Qjc02z41UW61GdeDmRTGaiPfR2MRQhoZuMlHPv7tF7TPb4g9d7AnX27+YVw9gwBghAAAIQgAAEIFCUAkj4FOVmxaByJ4CeIQABCEAgzwQkHA6nK6tDq7z+4II30+V7G8TfMZivEKEHdMfch3kWrx0OE5NTY6vQOycK0228wXynPR59ShNAc+0E0JJY9FsPtLRsp/NRIAABCEBgEASWNzaWJxY0HNjeHD1bX4ubtL5kkPkCEYeIaGetZVpZa6GXDTqAhzTTc0nasPbxBIJTJl100Vs+n8/U6SgQgMD/COAOBCAAAQhAIP8EjPwLCRFBAAIQgAAEIACB7AjU1NR0TfLXPTFxau1lxhBzMovjMGKZqr39RWvmSuZbGspE39JmQ2LQjQ6Dln9sdjyTjEdbdafj+YlY/W46DwUCEIAABDIssCnJE4v8stuZeoqc8oC+Fl+vXQS0HvBJcl5vFUsRbmHTPDrlSHs81cGrT5468+/FMjSMAwIQgAAEIAABCGRNIM8aRsInzzYIwoEABCAAAQhAIPsCzCzu82Z1uAO1r3qqQy0ef/AAJjmIRKLa+xNa39Wan0XIRUKjhGhPradokNdp0uqtRLz+L4l4tKm9OeJb0jTvG3YdloHBAAAQAElEQVQS6OmWFvs/znURFAhAAAIQ2JbAAy1Xb3dPc+RryXjkxERzZKEm1V8nh/WCvmdcpq+3X9f3iLH6+uuiPlzyfNF1Oq4/6lviLyyWsZ5A3VT39FlP+6pmr9Ux66w8jx7hQQACEIAABCAAAQh8TgAJn8+RYAIEIACBQRFAJxCAQJ4JuP2hFzyBUGi4I32CiDWeic/WvV2JPAtzK+HIfjozQMJ3OgxzhSaBVvzL7Ei2N9dfpkmg769cGXbqfBQIQAACENhM4P5IZLgmd7xar11vOu9LC99HxAl9La3S94AvU3FeVpEYV1tkTBIrNd5dHQrbpz4tzqFiVBCAAATyQgBBQAACEBg0ASR8Bo0aHUEAAhCAAAQgUAgCx1bNXusNzHzO7a+7zesPeqXL8QXdMRZg4j+Q0Hs6hi6teVuYyP58N0YDPECIxrPIL1l45dqXK7qT8ciKRCzqTzbWH5JcMOeLyxsbR0o4bC+vi6PkRgC9QgACgyWwaFF4SFtzZEwy1rBXIh49X+vvNgznDhJu03qBxvFtrbvoa2cxJsjt36x7gYnrXGnXVz2B2osr/bUPV0675H0dMwoEIAABCEAAAhCAQJEI4At+Pm9IxAYBCEAAAhCAQM4FvDNmfKQ7xuKaAPquZcgPdWfZ2STSSEyv5Ty4PgYgxCdo3DFxylPicDyccqTalo6paE5oEijRFDm8tTVcTKcq6qMOFocABIpRoPX6hh2SsYYTks2Rn2+/YfhthvADwtYLOtbrtI7TylqLstinZdP6jNaw5aBJqY3Gt/W9rGFCTc26ohxwoQ8K8UMAAhCAAAQgAIEMCCDhkwFENAEBCEAAAhDIpgDazh+ByurQS7qz7G5PIHShpzq4l+XkfYSkmYQ2aJRpYha9LoTi1CD3IqZjNOCf6HWMDH7CtaaiK9EcuTfRXF+1ON6wp50AWhkOO0WkaHeIqgMKBCBQJAKtrac47N8ua21o2KEtPjeQjEcedaWs9zXBs0JfxsJMPFmH+nWtQ7UWa7F0YBs1yfOApLsPclfXfVPrLyqrgo/6amvt9yqdjQIBCEAAAhCAQL4KIC4IDFQACZ+BCmJ9CEAAAhCAAARKVqDyJ3V/8/pD/u2G7bgDkTGeRH5KzMsV5N9aC7MIT9BxLHSy/M31/oi/rhtbsTzZXD8n0RQ9vy0W/e6y5oZdCnNgiBoCBS+AAXxGwE5IL75m7lfb41FPIlYfLFtz2E1vmx3PuoZY7xtkNAnxkZ9ZpZjv2qdmu5uIa1iMAzXJc5xn+uwXCRcIQAACEIAABCAAgZISQMKnpDY3Blu8AhgZBCAAAQjkUmDclCkbPf7aBz3+4JWpDXyyZaUOFHbYpwq6K5dxDahvEYcmfr4kQsdqOyEyqNlgWpEW64VkPPpcIh65OhFv+OFtjY0jdT4KBCAAgUERWNYSHpaMNZyQaI7G1o6ueK6szHiSie5kg+Yy8VkaxAFaS6Yw0b+EeYrpcBzoSrvO9vjrYu5A7aslA4CBQqAkBTBoCEAAAhCAQM8CSPj0bIM5EIAABCAAAQhAoM8C9ilz7B/B9lbPeEgTQKelZOgIMflkIbqWmB7RBldpzU7Jbqv2aeAqdOfiDjqWg4h4FpH1wAhn6p1EPPq01usSsfqq5MKGExY31x/SdnPTjhIO47Mm4QIBCPRHwE7sLI5ftad9ZGF7c8TX3hydn2iuf9QyKzadoo2E/PqaeoC+Hn1B2x9SMqeeFFqv431Mxz5PX4OPnlRdt5u3uu6myVUz/j2hpqZL56FAAAIQgAAEIAABCJSCQA9jxJfwHmAwGQIQgAAEIAABCGRCwBcIdHqn1y3x+oNV66XbQ2kaZwlN1p2Vt2vyxN5xl4luctaG7mwdrp1/U+v5xLJQLFniFLnXWL/x4aVjK+5LLKy/OhGLTGyfN297XQYFAhCAQI8CrQ0Nu7THoqcn45HrTbNipYPKHjAMSrLwr1noQhI5Ul9zhvTYQDHPEHqDmK9gg4+yrNQkT3Ww1uOf+Xvu4bfjipkCY4MABCAAAQhAAAIQ6FkACZ+ebTAHAhCAQDEKYEwQgEAOBc70X/yhpyb4l8pAsM0TCJ717KrO7cmkE3Qn5i0k9KLW9zS8bq0FXGSYBr+z1gM2nQ7Oklm6k3Ipl5sfJuLRdxLxyJ2J5vqa9ubI99tic/ZLLpjzxeU4LZxyoUCgNARaw2FX8rr5Y5Px+fskm+cd2d48tzrRHL070Vz/pmuI9TYz3SHE56nGYUy0p74u7qC39ab+LZHCmsRh4nU63L9qXURkHKvvGXt6qut+6q6ue9Y+ilSno0AAAhCAAAS2JYD5EIBACQog4VOCGx1DhgAEIAABCEAgPwTC4XDaMz14vycQ+tF67v5e2jJP0iTJj4gprvWl/Igyo1FoIohP0wTXNSy80iDHSsvhWJ5yphKaDLpOk0GzkvHIiUtb5u+e0V7R2BYEMAkCgyPQ0tJSlozP2actHv1RsjkaLR87olW60/cKpX8nYq5kMeIkdLK+LuB5T2zqVnnOErmC2fKm2DjG4w/+2OOvfVCno0AAAhCAAAQgAAEIQGCbAkj4bJOoBBfAkCEAAQhAAAIQGHQB++ifk6fPetobCN7pqQ4GtB5oWMbXyD6FD9ELGtBHWrvs//zW6+IoTGOZ6CAdzDit5xPx1UJ8j2Wm39QE0MeJWOTe9nj0p0uaokffG5u7U/uiedvff0tkuL0DmYh0VcIFAhDIA4HW1laH/Zs77fPmbd/WHBmTjM09QZ/DlyTj0cfHmh0dQo5X9IvnTZrQrhMRt4Zsnwbyi3pdprWUi0UkH+uL2Rv6ijaPDf62JngO8fqDl02qDv3OV137r1LGwdgHSQDdQAACEIAABCBQVAL6ubuoxoPBQAACEIAABCCQIQE0k3uBSdNq/2yfwufZVZ3fdIrjCCY+W4TmMtMDGt0arcVchhLzBCb6lcOgh7vZeJM2pJ/asJ7vGWuuu153Jl+eiM89v013LLe3zP3KspaWYcWMgbFBIJ8E7KTOklj0W+3NEV8yVv9z1+p/xkyroo1d5uOG0JvCxgqN9woh+rZel2tF2VxA6CNNfCXV5+eWwR4qNw/SJH+te2rt05svhtsQgAAEIAABCEBgsATQT/EIIOFTPNsSI4EABCAAAQhAoEgF7FO/nRSY8bLbX3e3u7r24pHvdU5wpV27mhZ9j0ju0GFbWou9uJj4qyT0fSI+h4guITJaDDaWsWX8xTQ7PkjEI4+2N9ff0BaLnplc2HCoLoMCAQgMXICWxuu/3RaPTtXn2GJNtv7DEH7LwfQHFr6DDPo5sVSR0PHEtC8RDyFctiigCZ5HTbIuSHUZX+kevcdkrz94ReXU4APu82Z1bHEFTIQABCAAAQhAAAIQgEAfBZDw6SMYFocABDYXwG0IQAACEBhsAWaWceFwekJNTdfkacFHPP7QmR5/0GEZcoSINYtId8CKPK07X+1TwFGRX+zPsk4dq0vHWU7ER7LIjw2m28Sy/piMRzt15/Rf2+OR+xPN9dckYvXB9lj0dE0GndAem3vwkpZ5O7c2NAwlXCBQwgL282BZS3TftnjD95Lx+lP0uVKjz5vGRHPk3mQ8+rdEvH69RfK4PtmaiXgyEe2hVZ9vZJ+OzSEirPdRPisgtF4n2afjXCRinO8k4yvPr+r83mT/zOt9tbUf+Hw++/d6NAekS6FAAAIQKAgBBAkBCEAAAoUgoJ/bCyFMxAgBCEAAAhCAAAQgsDWByqmhx72BmXN3dVSc63DyeCbjW0zsE5LbNAmymrJ5ydO2dU/qcA1tb3U4jkRqiCXCBt2kyaC7ifg3DjP9hGuI9UIiHv2dVnsHd017c+T7rS1Xb0e4QKAIBRILo/u3Ndef1BaPhJLN0Ts0ofO8/TwwTVppkJXQ14tb9blyjQ59OglP0OfQV4kEp0tUkD6U54R4BrPzCIvl2O1Wdf7EG6i94SR/7evhcNjqQztYFAIQgAAEIAABCEAAAn0WyHrCp88RYQUIQAACEIAABCAAgX4LHFpV1T2xKrjGHah91T4FnNcfOnsX58hdDKHDdMftbE1+3ENCL+rt9/vdSSGvKGQfDVTBzKOJeHci2kvrOK3TSfgaFl7pMp0faQJoYyIWfUHrbYnmaEN7LDqzLTb3hESs/oilTXO/kYw17NV6fcMOt0QidlJJV0eBQG4EVobDzmUt0VGL4w173tMc+dqyhZHvJJrmTrBPwdYer69PxOrbNLHznP2YJov+bIgsM4jnitDpQvR1+uR5sBMRbU9E9pE7eoXSOwHuZKZXdNl7RZM8ljj29/iDh3j9dfPd/oteqKwOrRoXDqd1fskUDBQCEIAABCAAAQhAILcCRm67R+8QgAAEIFAiAhgmBCCQQwE7CTQpEPyjxx+a8+yqDi8PKT+BDccJliWnk8h1mvyxTzuUwwjzsutyYjpQ65kkNEN36s4x2FjBLCssw1ghbK1wpawVI4cbK5Lx+hWJWGRhe3N9uD0eOSvZPPfIttic/VpaWsrycmQIqiAFWmPhiqXXNhzQ3jx3ciJeH0jEI5FkPHrnR6Mr7jMtWeEka0Va+D7T5PvIMO7VL3rNTFJLLF4hOkgHXa4VZeACXdrEQ8RUa4mMt6h7/K6OEV47yVMZmPGyzkOBAAQgAAEIlLoAxg8BCORQQL8H5LB3dA0BCEAAAhCAAAQgMKgC4XA47T5v+jvuqbVPV04L/doTCP1EE0EHWSxjTcu6QINZqvUNJrZPA5fS2yibCeiO85F6d4zWvbTaR00dJSQnEHMVi/xc3W4VMR412PGXsWZHKhmvX5uMR55qj0db2mKRSCIePT8Zi1YuXhDdd/HCuV9d2nL17v/5DZVRtzU2jlzWEh7W2trq0LaLtGBY4XDYsH876v5IZPiyluiotubIGPtxkIw17KW3v5ZcGK20HyefHFlWn7AfP3o/5eKKDittvcRiLNYkbRMRB/XxeJomI48h4UOJaG+tuxCT/RjVmygDF2BT2/hQhN7U5/bdYtE569bLjh5/cJynOjivMhB81Ft98T/spLouhwIBCEAAAhCAAAQgAIGcCyDhk/NNgAD+K4AbEIAABCAAAQjkTMA+9dDkaTOv1x2ZbstKfSttmSfoTuRzNKArtS7TukorSh8FNBk0Uoi/xUQ/MZiDuvp1wrTE6aCXyyzjBTGdjxtp8yHT4hUVztQS06y407X6ret1B3+z1l/ozv7a9ub6c+3fXVnaHPmBJgj2tU/d1djYiKM1FDMfi26jUW3X1u+dbK4/xN5ubfH6U5bGIxe1xyMX67QFB40Zfq1riHXHhuF8l73dDYsftB8HwtYLhvCLmlRYouO6jjYdWSZu+/Gj93G0mCIMYvmzJnluJLIuYHZMFEMOc/vrfN5pwVvPCYXWD2Ic6AoCxSuAkUEAAhCAAAQgkBUBJHyywopGIQABCEAAAhDorwDWy71A5bRL3tfkzzOeQN1dmgC6VOskrWMtgw/W6H6uj9knqwAAEABJREFU9SWt9mmN7N+mEL2N0g8BhRui9YvMtDeJ2Edo/FCbmURM5xLRVK0/E+J6Fllk/+6KJfxb06SXnWS9trsztVETQqL1jUQ88kiiOXJveyw6JxGLXN4ei5zXHpt7nF3txMOiReEhdl2uSaLW1rDLrk+3tJStDIedn1b7qCL7yJNPq4hGoQEUa/l0nPa1hMPGys0sbBvbyK62mW1n12R8/j62aXs8Oj4Rqw/a1urflGyOPrxpG8Tr1+t90W202kjLX0XkGXu7GSStFvE8Jr5Sp03T6/PU1aP1xE3bnelAIfqi3h+qFWVwBZSe7NcxfT2TP1hkTXPSsB309e5r3kDwPI8/tMhdPeMPdkJ8cMNCbxCAAAQgAAEIQKA0BDDKzAsg4ZN5U7QIAQhAAAIQgAAEilKgcmrd8x5/8JdaD7RYdteUwEkk1kxNDtxIQo8w0TtFOfD8HtSXiPgoEp6giaOZxHwpM1/PbNxvVzvx8IUNFRvs2u1M/du1evgrdn3b6vjTR6Mr7vu0lq1+846DRw9f+GlNNNdf0RaLzt68ajLjfE1snPH5OvcoXe6726r2aezsU5f1pS5piu6xrXY3zY83fG9pc8T32diSseiZCU3O6DL/HUuyuf7nn47Tvk6Oqbjpo80s3jY7nrWN7Jpypt617ewqlH7FNtXH+XJiiZBaE1FAH/9Hk70NSIYRLpkUyFJbYp+q8lkhuU3Emm1ZNMHhoF09/tB3K/0zYyf5/R9mqWM0CwEIQAACEIAABCAAgawLIOGTdWJ0AAEIZF4ALUIAAhCAQK4F7P9491QH7/cEZka337+zaugImWBaqa8L0aFaL2ORZ4jJ3rGa61DR/38EdLt8gZi/vKkKHchMx/x/ZZ9Ov+DTyiQXG0xXbV61mWadv+hzlRzLdbkV26pOBz1umc5n+1J1R/wz22p303yx7rWEb/lsbGLQjWTQXF3mv2MRkbAu99+x6rjO/n8HOkbvH6DzP3Ei2p5wKQaBTiK+yyI6l1Op3V1p1/d3c4z8sTcwc27ltOADE6uCawgXCEAAAhDIUwGEBQEIQAACfRFAwqcvWlgWAhCAAAQgAAEIQOBzAuPGhdPHnxNab58KzusP/knr5e5A6JvbWUN3FFPGCVENE99GTA8R0ataO7QOvKCFwRZwkpDrc5WkQgPpTbWTJzvosr2vQvay226babi2W/652DbFK6zzUEpDIMXEr2t9WF93bmaiamHz8NSo3bf3+OtOq/QHb3ZfdOl7E2pq1h1aVdVdGiQYJQQgAAEIQAACEIBAKQkUbcKnlDYixgoBCEAAAhCAAATyUWBcINDpnR56SBNAC9z+urOHG2lPypTjRKyjRegMEWnSuJ/Sqvtm9S8KBCAAgb4KCL2nLyBtQjKDDfNIB/GxVpfh6R61+3luf3Cht3rWUz6fz+xrs1i+sAQQLQQgAAEIQAACEIDAJwJI+HzigL8QgAAEIFCcAhgVBCCQRwLHVs1e65seesMbmPmcNxC80xsITff4g4drNdjBPyCS2SzUpiG/QMxvMRF+S0MxUCAAAVtA7NeDf+it5/S14tfCPCVtGV9zB4I7a1J5stcfmu+eOuvpk/y1r3tnzPgISR6VQoEABCAAAQiUlgBGCwEIqIChFQUCEIAABCAAAQhAAAI5FXBX1a30+ENzdOftZOlyfM+y0ieQRR4ROkNIrtLg7tb6plZLKwoE+iiAxQtQ4AN97j+scS/Q67MNB09Kd1vHcbl5tL5WnO6trrvp5Gm1f9bEsOgyKBCAAAQgAAEIQAACEICACiDhowgoJS6A4UMAAhCAAAQgkFcC9n/nVwZmveyeFnzEax8J5A9d4vEHfVq/xCnnF4npBEukkYntncGrNPi1mhjaoNc4bZMioECggATSRNxJ9tF8Qu/p9a0Wy4XM/A19vu/o9Ye+r9c1en3bpKrgoydfOPPv7vNm4TfAFAoFAhDopwBWgwAEIAABCBS5ABI+Rb6BMTwIQAACEIAABHongKUKQ8B90UXveaqD91cGQhe6/XXfT0nnV3QH8XcNsipJJKCj+KWQLNHrJ7V+oBUFAhDIEwEmWqOhPEfEdzDxVSziJzInsBiHPbe6c1dN7pxTWR1qdFfXPUu4QAACEIAABCAAAQhAIEsCxdwsEj7FvHUxNghAAAIQgAAEIFDkAr5AuFN3EL/kDsy8zxMItegO43D3qD1Ofc8x4ihX2vVFs8vxRU0Anb3piCCRZ5ioq8hJMDwI5JPAm0Ryh0VUnWb+RlnateuujhGHpUY9cc6k6tpL3YHQdR7/zN+7A7WvhsPhdJ4EjjAgAAEIQAACEIAABCBQsAJI+BTspkPgEIDA4AugRwhAAAIQKAAB8fl8ZlVVVfeEmpquyTNm/NvrD9226YigQOibbn9wCBl0ABt0HBlGQBNAEWK6XetvdWwvaLWPQLD0GgUCENi6gDBvOmLnT0T8G03s3MLEV1li/YgN+l4q7RqjCdgvefyhMyv9wYUnV9c9az8nD9Xnps93t8nM+O0dwgUCEIAABPJXAJFBAAIQKEwBJHwKc7shaghAAAIQgAAEIACBfgp4pgb/4p4afMAztTauCaCZ7xkjpri6XZUWy7HCjm8xOffXPdlTdG/05SKcZKLXtSu9q3/tggqB0hT4gESWa2InqvVMfZ7sZ5HjWw4HncDl6ZO3W7X+PLe/7pLKwMxb9Pn1iK+mZnVpMmHUEIAABCAAAQhAAAIQyJ0AEj4ZtkdzEIAABCAAAQhAAAKFJfCfo4HWVVaHVnmrZ/zD7b/or97qupu8/uBl3kCdx+0PfsXjDxpMcpAlNJmFLtIk0LVEdL/Wx0joRd0B/pYQ2b8ZZOo0FAgUkkBaRFbr4/d1rc8LycPMnNTbl+tj/SwSPjK1Lr29Pgd29ARCJ3r8oZDWOz55nsz4x8Sq4Br3ebM6xoVxSrZC2uiINTMCaAUCEIAABCAAAQjkmwASPvm2RRAPBCAAAQgUgwDGAAEIFKGA2x96oTIQbHMHgte4/cEqd3VwfGfaNT5lGOOd4jzBIXSCZdF4Tf78mFh+SkI3EdGDzPSaXltaUSCQYwF5jUSe1Mfm7RbJTGY5XR+v4x1O5wlOwzrBJdYJ2w8ddYK7us5jJzz1sX67J1D3mG/27LU5DhzdQwACEIAABCAAgXwVQFwQyCsBJHzyanMgGAhAAAIQgAAEIACBQhHQRI6cVVOzzldd+6+TAjNenhQI/rFyWvABjz+0yFMdusITCE7x+IPHamJoL712ONjY1RTzByIynUnm6/p3MtELQvJ3In5Lp9tHWXygO+PX6074jYRLEQhkbwis2RptfYMQder1Gn38vK3X/9D6V338/IaYr9Np0y22Jgobh+tjkD3+0F6eQOjbnkDwrEp/KOKuDv1apz04qWrGMxOnzvz7iYGZ746bMgWPPUVEgQAEIAABCEAAAhCAQCEKGIUYNGKGQFEIYBAQgAAEIAABCJSUwERNDE0OzFrpDYSa3P7QDHd18Ay3P3hQ96g9vsZm+ju6k/44i8wTycE+Fj7TIqomZvtIoXm64z6p8+9TsJc0IfSGXqe0ohS9AGs+h+wkzgskci8R36Hbf559dI4lMpVYzhQxTmHTHO9wmkem0qnDnlvVub8mcY73VNf9xH6sVVbPvMdbXfsU4QIBCEAAArkTQM8QgAAEIACBQRJAwmeQoNENBCAAAQhAAAIQ2JIApkHA5/Ol3NNnveMNzHxusn/WE56pdcvdgWBbpT+40FNdZx8pVKs77j26E3+8xx880BMI7qnX5alRuzsdBh/MBn2PhAKaGbhMr2/XFMEDmhx4QWU3MpF9tIadHLJrt05L67S0Xms+ieyqq+k9lGwI2L5a2f5dJ9s8TUz2drBrl3Zob593meRB3SZtev+XIhTUZU6wDDmCO8yRHn+dodv6y1oP8gRCJ+n9Mz2BYG2lPxTx+oPXeqpD7ZWB2vv08fP0pKrZb/lqLlkdDoe1T20NBQIQgAAEIAABCEAAAhDIK4HBCMYYjE7QBwQgAAEIQAACEIAABCCQWQFNFJkTp9Y9754afESTAHFNAFyu12dpsug4TyB0kCYJhk6qrhuWJmM/u1qWfI9I7N8Y8uiXgGq7aoLoEk0wXL2pktxCxHdsqiL3aRLiUbsS0bO63lvMvKnq7Q91WqmVNf8/fnpDiJ6ybexKIu30qRvRgk8s6Upd5qJNxmSdY1k0Qd3GW5bjYHtbOGnYzvb2cfuDO7v9oWPd/uBkvf9zbyBY76kO3l85NfS4e9asDsKllAQwVghAAAIQgAAEIAABCAxYQL+DDLgNNAABCEAAAlkVQOMQgAAEIACB/glokkJO9te+btfKaaHHPf7Qg25/6N5J/uC1dvUEgldrguFiu77nGHl+alTHFLuOGe2o7JKh4+3qSru+n3I5Dukq403V4eC9U2Lt/Gm1LN7HEpq8eWWms0SofktVR5LQJMnjg1mFZMmWYrGnafznbR67fZvF+Oqn47OvHQ7a79PxO6n7m0a5+UPbxq4frl5/hm1m1+dWdV5kW3r8wUu9/uCCTcb+0B2Vn/y204OVgRkv29viJL+/FJNmuulRIAABCEAAAhDYugDmQgACEBiYABI+A/PD2hCAAAQgAAEIQAACEBgcgSz3UlVV1e3zhVN2PcJXu8EXCHTadUJNzTrf+bUffFonVgXX+AIz3/20Vk6r+1ulfQq6zaq7Oni7NxAMbqlqMsTrCYSOGMzq9YdO3lIs9jSN/8bPxR+offXT8dnXm8b8H4OT/Bd/6D5vVodtY9cp4fBG28yuOJ1alh+kaB4CEIAABCAAAQhAAAIQ2KoAEj5b5SmcmYgUAhCAAAQgAAEIQAACEIAABCAAgeIXwAghAAEIQAACEIBATwJI+PQkg+kQgAAEIACBwhNAxBCAAAQgAAEIQAACEIAABCAAAQgUvwBGCIEtCiDhs0UWTIQABCAAAQhAAAIQgAAEIFCoAogbAhCAAAQgAAEIQAACEChFASR8SnGrY8ylLYDRQwACEIAABCAAAQhAAAIQgAAEIFD8AhghBCAAAQiUnAASPiW3yTFgCEAAAhCAAAQgQAQDCEAAAhCAAAQgAAEIQAACEIAABIpLYEsJn+IaIUYDAQhAAAIQgAAEIAABCEAAAhCAwJYEMA0CEIAABCAAAQhAoIgEkPApoo2JoUAAAhDIrABagwAEIAABCEAAAhCAAAQgAAEIQKD4BTBCCECgWASQ8CmWLYlxQAACEIAABCAAAQhAIBsCaBMCEIAABCAAAQhAAAIQgAAECkIACZ+C2Ez5GyQigwAEIAABCEAAAhCAAAQgAAEIQKD4BTBCCEAAAhCAAATyXwAJn/zfRogQAhCAAAQgkO8CiA8CEIAABCAAAQhAAAIQgAAEIACB4hfACPNcAAmfPN9ACA8CEIAABCAAAQhAAAIQgEBhCCBKCEAAAhCAAAQgAAEIQCCXAkj45FIffUOglAQwVghAAAIQgCCeXFgAABAASURBVAAEIAABCEAAAhCAAASKXwAjhAAEIACBnAkg4ZMzenQMAQhAAAIQgAAESk8AI4YABCAAAQhAAAIQgAAEIAABCEAgOwL5lPDJzgjRKgQgAAEIQAACEIAABCAAAQhAAAL5JIBYIAABCEAAAhCAAASyIICETxZQ0SQEIAABCAxEAOtCAAIQgAAEIAABCEAAAhCAAAQgUPwCGCEEIJBpASR8Mi2K9iAAAQhAAAIQgAAEIACBgQugBQhAAAIQgAAEIAABCEAAAhDokwASPn3iwsL5IoA4IAABCEAAAhCAAAQgAAEIQAACECh+AYwQAhCAAAQgAIHeCyDh03srLAkBCEAAAhCAQH4JIBoIQAACEIAABCAAAQhAAAIQgAAEil8AI+ylABI+vYTCYhCAAAQgAAEIQAACEIAABCCQjwKICQIQgAAEIAABCEAAAhCwBZDwsRVQIQCB4hXAyCAAAQhAAAIQgAAEIAABCEAAAhAofgGMEAIQgAAECAkfPAggAAEIQAACEIAABIpeAAOEAAQgAAEIQAACEIAABCAAAQgUuwASPkTFvo0xPghAAAIQgAAEIAABCEAAAhCAAASIYAABCEAAAhCAAASKWgAJn6LevBgcBCAAAQj0XgBLQgACEIAABCAAAQhAAAIQgAAEIFD8AhghBIpXAAmf4t22GBkEIAABCEAAAhCAAAQg0FcBLA8BCEAAAhCAAAQgAAEIQKBABZDwKdANh7BzI4BeIQABCEAAAhCAAAQgAAEIQAACECh+AYwQAhCAAAQgUIgCSPgU4lZDzBCAAAQg8H/s3Ql8HGX9+PHvd3ZztE1bjlJADgXFAxVR8Fa0XihamrQQ/XugFbE0KbW0CaCirvoTKTkKbZM0gIJ4B2iSllPQIt6Cird4gyj3UXom2Z3n/520Sbc0aXd3Nsnu7Gdfz5OdmZ3n+L4nmczMszuLAAIIIIAAAggggAACCCCAAAIIRF+ACBFAIAsBBnyywGJVBBBAAAEEEEAAAQQQKCQB+oIAAggggAACCCCAAAIIIDAkwIDPkATP0RMgIgQQQAABBBBAAAEEEEAAAQQQiL4AESKAAAIIIIDAoAADPoMM/EAAAQQQQACBqAoQFwIIIIAAAggggAACCCCAAAIIRF+ACEUY8OG3AAEEEEAAAQQQQAABBBBAIOoCxIcAAggggAACCCCAQOQFGPCJ/CYmQAQQ2LcAayCAAAIIIIAAAggggAACCCCAQPQFiBABBBCItgADPtHevkSHAAIIIIAAAgggkKkA6yGAAAIIIIAAAggggAACCCBQxAIM+GS48VgNAQQQQAABBBBAAAEEEEAAAQSiL0CECCCAAAIIIIBAsQow4FOsW45+I4AAAghMhABtIoAAAggggAACCCCAAAIIIIBA9AWIEIGiFGDApyg3G51GAAEEEEAAAQQQQACBiROgZQQQQAABBBBAAAEEEECg8AQY8Cm8bUKPil2A/iOAAAIIIIAAAggggAACCCCAQPQFiBABBBBAAIECE2DAp8A2CN1BAAEEEEAAgWgIEAUCCCCAAAIIIIAAAggggAACCERfoJAiZMCnkLYGfUEAAQQQQAABBBBAAAEEEIiSALEggAACCCCAAAIIIDBuAgz4jBs1DSGAAALPFGAeAQQQQAABBBBAAAEEEEAAAQSiL0CECCCAwPgIMOAzPs60ggACCCCAAAIIIIDAyAIsRQABBBBAAAEEEEAAAQQQQCAPAgz45AFxLKugbgQQQAABBBBAAAEEEEAAAQQQiL4AESKAAAIIIIAAAmEFGPAJK0h5BBBAAAEExl6AFhBAAAEEEEAAAQQQQAABBBBAIPoCRIhAKAEGfELxURgBBBBAAAEEEEAAAQQQGC8B2kEAAQQQQAABBBBAAAEERhdgwGd0G15BoLgE6C0CCCCAAAIIIIAAAggggAACCERfgAgRQAABBBAYRYABn1FgWIwAAggggAACCBSjAH1GAAEEEEAAAQQQQAABBBBAAIHoC4wUIQM+I6mwDAEEEEAAAQQQQAABBBBAAIHiFaDnCCCAAAIIIIAAAiUowIBPCW50QkYAgVIXIH4EEEAAAQQQQAABBBBAAAEEEIi+ABEigECpCTDgU2pbnHgRQAABBBBAAAEEEAgEyAgggAACCCCAAAIIIIAAApESYMAnUpszf8FQEwIIIIAAAggggAACCCCAAAIIRF+ACBFAAAEEEEAgOgIM+ERnWxIJAggggAAC+RagPgQQQAABBBBAAAEEEEAAAQQQiL4AEUZEgAGfiGxIwkAAAQQQQAABBBBAAAEExkaAWhFAAAEEEEAAAQQQQKAYBBjwKYatRB8RKGQB+oYAAggggAACCCCAAAIIIIAAAtEXIEIEEEAAgYIXYMCn4DcRHUQAAQQQQAABBApfgB4igAACCCCAAAIIIIAAAggggMDECozHgM/ERkjrCCCAAAIIIIAAAggggAACCCAwHgK0gQACCCCAAAIIIDCBAgz4TCA+TSOAAAKlJUC0CCCAAAIIIIAAAggggAACCCAQfQEiRACBiRJgwGei5GkXAQQQQAABBBBAAIFSFCBmBBBAAAEEEEAAAQQQQACBMRFgwGdMWKk0VwHKIYAAAggggAACCCCAAAIIIIBA9AWIEAEEEEAAAQTyL8CAT/5NqREBBBBAAAEEwglQGgEEEEAAAQQQQAABBBBAAAEEoi9AhHkWYMAnz6BUhwACCCCAAAIIIIAAAgggkA8B6kAAAQQQQAABBBBAAIFsBBjwyUaLdRFAoHAE6AkCCCCAAAIIIIAAAggggAACCERfgAgRQAABBDIWYMAnYypWRAABBBBAAAEEECg0AfqDAAIIIIAAAggggAACCCCAAAI7BKI84LMjQn4igAACCCCAAAIIIIAAAggggECUBYgNAQQQQAABBBBAwAQY8DEEEgIIIIBAlAWIDQEEEEAAAQQQQAABBBBAAAEEoi9AhAggwIAPvwMIIIAAAggggAACCCAQfQEiRAABBBBAAAEEEEAAAQQiLsCAT8Q3MOFlJsBaCCCAAAIIIIAAAggggAACCCAQfQEiRAABBBBAIMoCDPhEeesSGwIIIIAAAghkI8C6CCCAAAIIIIAAAggggAACCCAQfYHIRsiAT2Q3LYEhgAACCCCAAAIIIIAAAghkL0AJBBBAAAEEEEAAAQSKU4ABn+LcbvQaAQQmSoB2EUAAAQQQQAABBBBAAAEEEEAg+gJEiAACCBShAAM+RbjR6DICCCCAAAIIIIDAxArQOgIIIIAAAggggAACCCCAAAKFJsCAT/63CDUigAACCCCAAAIIIIAAAggggED0BYgQAQQQQAABBBAoKAEGfApqc9AZBBBAAIHoCBAJAggggAACCCCAAAIIIIAAAghEX4AIESgcAQZ8Cmdb0BMEEEAAAQQQQAABBBCImgDxIIAAAggggAACCCCAAALjJMCAzzhB0wwCIwmwDAEEEEAAAQQQQAABBBBAAAEEoi9AhAgggAACCIyHAAM+46FMGwgggAACCCCAwOgCvIIAAggggAACCCCAAAIIIIAAAtEXGPMIGfAZc2IaQAABBBBAAAEEEEAAAQQQQGBfAryOAAIIIIAAAggggEA4AQZ8wvlRGgEEEBgfAVpBAAEEEEAAAQQQQAABBBBAAIHoCxAhAgggEEKAAZ8QeBRFAAEEEEAAAQQQQGA8BWgLAQQQQAABBBBAAAEEEEAAgdEEGPAZTab4ltNjBBBAAAEEEEAAAQQQQAABBBCIvgARIoAAAggggAACIwow4DMiCwsRQAABBBAoVgH6jQACCCCAAAIIIIAAAggggAAC0RcgQgT2FGDAZ08TliCAAAIIIIAAAggggAACxS1A7xFAAAEEEEAAAQQQQKDkBBjwKblNTsAIiGCAAAIIIIAAAggggAACCCCAAALRFyBCBBBAAIHSEmDAp7S2N9EigAACCCCAAAJDAjwjgAACCCCAAAIIIIAAAggggECEBEYZ8IlQhISCAAIIIIAAAggggAACCCCAAAKjCLAYAQQQQAABBBBAICoCDPhEZUsSBwIIIDAWAtSJAAIIIIAAAggggAACCCCAAALRFyBCBBCIhAADPpHYjASBAAIIIIAAAggggMDYCVAzAggggAACCCCAAAIIIIBA4Qsw4FP426jQe0j/EEAAAQQQQAABBBBAAAEEEEAg+gJEiAACCCCAAAIFLsCAT4FvILqHAAIIIIBAcQjQSwQQQAABBBBAAAEEEEAAAQQQiL4AERayAAM+hbx16BsCCCCAAAIIIIAAAgggUEwC9BUBBBBAAAEEEEAAAQQmTIABnwmjp2EESk+AiBFAAAEEEEAAAQQQQAABBBBAIPoCRIgAAgggMDECDPhMjDutIoAAAggggAACpSpA3AgggAACCCCAAAIIIIAAAgggMAYCBTbgMwYRUiUCCCCAAAIIIIAAAggggAACCBSYAN1BAAEEEEAAAQQQyLcAAz75FqU+BBBAAIHwAtSAAAIIIIAAAggggAACCCCAAALRFyBCBBDIqwADPnnlpDIEEEAAAQQQQAABBBDIlwD1IIAAAggggAACCCCAAAIIZC7AgE/mVqxZWAL0BgEEEEAAAQQQQAABBBBAAAEEoi9AhAgggAACCCCQoQADPhlCsRoCCCCAAAIIFKIAfUIAAQQQQAABBBBAAAEEEEAAgegLEGEmAgz4ZKLEOggggAACCCCAAAIIIIAAAoUrQM8QQAABBBBAAAEEEEBAGPDhlwABBCIvQIAIIIAAAggggAACCCCAAAIIIBB9ASJEAAEESl2AAZ9S/w0gfgQQQAABBBBAoDQEiBIBBBBAAAEEEEAAAQQQQACBSAsw4DO4efmBAAIIIIAAAggggAACCCCAAALRFyBCBBBAAAEEEEAgugIM+ER32xIZAggggEC2AqyPAAIIIIAAAggggAACCCCAAALRFyBCBCIqwIBPRDcsYSGAAAIIIIAAAggggEBuApRCAAEEEEAAAQQQQAABBIpRgAGfYtxq9HkiBWgbAQQQQAABBBBAAAEEEEAAAQSiL0CECCCAAAIIFJ0AAz5Ft8noMAIIIIAAAghMvAA9QAABBBBAAAEEEEAAAQQQQACB6AsUV4QM+BTX9qK3CCCAAAIIIIAAAggggAAChSJAPxBAAAEEEEAAAQQQKCABBnwKaGPQFQQQiJYA0SCAAAIIIIAAAggggAACCCCAQPQFiBABBBAoFAEGfAplS9APBBBAAAEEEEAAgSgKEBMCCCCAAAIIIIAAAggggAAC4yLAgM+4MI/WCMsRQAABBBBAAAEEEEAAAQQQQCD6AkSIAAIIIIAAAgiMvQADPmNvTAsIIIAAAgjsXYBXEUAAAQQQQAABBBBAAAEEEEAg+gJEiMAYCzDgM8bAVI8AAggggAACCCCAAAIIZCLAOggggAACCCCAAAIIIIBAGAEGfMLoURaB8ROgJQQQQAABBBBAAAEEEEAAAQQQiL4AESKYf2REAAAQAElEQVSAAAIIIJCzAAM+OdNREAEEEEAAAQQQGG8B2kMAAQQQQAABBBBAAAEEEEAAgegL5BYhAz65uVEKAQQQQAABBBBAAAEEEEAAgYkRoFUEEEAAAQQQQAABBEYQYMBnBBQWIYAAAsUsQN8RQAABBBBAAAEEEEAAAQQQQCD6AkSIAAIIPFOAAZ9nijCPAAIIIIAAAggggEDxCxABAggggAACCCCAAAIIIIBAiQkw4FNiG3xHuPxEAAEEEEAAAQQQQAABBBBAAIHoCxAhAggggAACCJSSAAM+pbS1iRUBBBBAAIF0AaYRQAABBBBAAAEEEEAAAQQQQCD6AkRYMgIM+JTMpiZQBBBAAAEEEEAAAQQQQGBPAZYggAACCCCAAAIIIIBANAQY8InGdiQKBMZKgHoRQAABBBBAAAEEEEAAAQQQQCD6AkSIAAIIIBABAQZ8IrARCQEBBBBAAAEEEBhbAWpHAAEEEEAAAQQQQAABBBBAAIFCFwg/4FPoEdI/BBBAAAEEEEAAAQQQQAABBBAIL0ANCCCAAAIIIIAAAgUtwIBPQW8eOocAAggUjwA9RQABBBBAAAEEEEAAAQQQQACB6AsQIQIIFK4AAz6Fu23oGQIIIIAAAggggAACxSZAfxFAAAEEEEAAAQQQQAABBCZIgAGfCYIvzWaJGgEEEEAAAQQQQAABBBBAAAEEoi9AhAgggAACCCAwEQIM+EyEOm0igAACCCBQygLEjgACCCCAAAIIIIAAAggggAAC0RcgwnEXYMBn3MlpEAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBDIrwADPvn1pDYEEMiPALUggAACCCCAAAIIIIAAAggggED0BYgQAQQQQCCPAgz45BGTqhBAAAEEEEAAAQTyKUBdCCCAAAIIIIAAAggggAACCCCQqUDxDvhkGiHrIYAAAggggAACCCCAAAIIIIBA8QrQcwQQQAABBBBAAIGMBBjwyYiJlRBAAAEEClWAfiGAAAIIIIAAAggggAACCCCAQPQFiBABBPYtwIDPvo1YAwEEEEAAAQQQQAABBApbgN4hgAACCCCAAAIIIIAAAiUvwIBPyf8KlAIAMSKAAAIIIIAAAggggAACCCCAQPQFiBABBBBAAIHSFmDAp7S3P9EjgAACCCBQOgJEigACCCCAAAIIIIAAAggggAAC0Rco4QgZ8CnhjU/oCCCAAAIIIIAAAggggECpCRAvAggggAACCCCAAAJRFWDAJ6pblrgQQCAXAcoggAACCCCAAAIIIIAAAggggED0BYgQAQQQiKQAAz6R3KwEhQACCCCAAAIIIJC7ACURQAABBBBAAAEEEEBgogXWdjTN7G5vrr6t8+LpE90X2kegWAQY8Ml2S7E+AggggAACCCCAAAIIIIAAAghEX4AIEUAAAQQmVECdNqvIt7am4jesW9V01IR2hsYRKBIBBnyKZEPRTQQQQACBwhKgNwgggAACCCCAAAIIIIAAAgggkH+B3uXLp3a3NX3BBns+ZLVPciJvcHHvjp7VLadc09Q0xZaNa6IxBIpJgAGfYtpa9BUBBBBAAAEEEEAAAQQKSYC+IIAAAggggAACCORRwDmnUhX7qKhekF6tLT9SPHf9tMnS0nUxt3hLt2EagXQBBnzSNZhGIK8CVIYAAggggAACCCCAAAIIIIAAAtEXIEIEEMiHgA3qaE9Hyxwb8lmuImUj1FlpA0ELyqfGf9mzuunVXV1dsRHWYRECJS3glXT0BI8AAggggAACCIy1APUjgAACCCCAAAIIIIAAAgjsVSAY7Olta662gZ6v24oVlkdPKs+3gZ/eisf/c+FNK1fufd3Ra+EVBPIvUAA1MuBTABuBLiCAAAIIIIAAAggggAACCERbgOgQQAABBBBAYHSB6zsuPko8bbM1qizvO6kcbINEiYF4/01dV7YesO8CrIFAaQgw4FMa25koEUCgsAXoHQIIIIAAAggggAACCCCAAAIIRF+ACEcQ6G675Pi4lK+zlw61nFlS6ReVdX7KffH0B55+KrNCrIVA9AUY8In+NiZCBBBAAAEEEEAAgaIQoJMIIIAAAggggAACCJSWwI1tlxyi4q0RcS+WLB6+06VPb3bvrzmn8Q5NJPwsirIqApEWYMCnWDYv/UQAAQQQQAABBBBAAAEEEEAAgegLECECCCBQIgI3rVw5rV9ia0Tl1RmGnFSRdUlxL5tbt6ztjMbGLRmWYzUESkaAAZ+S2dQEigACCCAQBQFiQAABBBBAAAEEEEAAAQQQQKDYBbo6L57eHx/4qqibnUksNtDzkDj9oFSkPnhaXePvMilT7OvQfwRyEWDAJxc1yiCAAAIIIIAAAggggAACEydAywgggAACCCCAQNEKdHV1xcqSsXNF3BwbyNnr9Wl7fYuK3uIn/TdU1y/77pwzz99UtIHTcQTGQWCvf1Dj0D5NIIBA3gWoEAEEEEAAAQQQQAABBBBAAAEEoi9AhAgUp0DF4/ddqOo1Wu/jlkdPTv7qnJ7Zt13n1iw+7x+jr8grCCAwJMCAz5AEzwgggAACCCCAQJQEiAUBBBBAAAEEEEAAAQQQKCABZ6M3ve3NH7anz4i4yaN1TUW2W77Rd5WvCz7VU7t06bbR1mU5AgiISBoCAz5pGEwigAACCCCAAAIIIIAAAgggECUBYkEAAQQQQKBQBNa2t77ZqXzZ+hOzPGJyIn/wfffhaS/aXD130aLHR1yJhQggMKoAAz6j0vACAgggEHkBAkQAAQQQQAABBBBAAAEEEEAAgegLTHiEPSsveWNM5VZxcugonfFFpf2I2NRX1Cxq7Jo1K5EcZT0WI4DAXgQY8NkLDi8hgAACCCCAAAIIIBB9ASJEAAEEEEAAAQQQQGDsBHrWNB8rcW+FiCsboZWUiP5EPJ09/eHNnzhxwYIB4YEAAjkLMOCTM12JFCRMBBBAAAEEEEAAAQQQQAABBBCIvgARIoAAAmMgsL6zc7L47tui+oqRqld1F/Uny2qqz15206wEn+oZyYhlCGQjwIBPNlqsiwACCCCAQIkKEDYCCCCAAAIIIIAAAggggAAC2Qh0dV48PZXc9FUb7DlcxD0pKk8MZ5E7fPHfPGdh42drFy9+NJt6WXdsBai9uAUY8Cnu7UfvEUAAAQQQQAABBBBAAIHxEqAdBBBAAAEEEEAgY4HtT8eS6ulyJ967npl9de+dW3feDzOujBURQCAjAQZ8MmJiJQQQ2LcAayCAAAIIIIAAAggggAACCCCAQPQFiBCBzATOaGzcMmfhst/ULFz6y2fmuQsbH8msFtZCAIFsBBjwyUaLdRFAAAEEEEAAAQT2LsCrCCCAAAIIIIAAAggggAACCCAwIQLjOuAzIRHSKAIIIIAAAggggAACCCCAAAIIjKsAjSGAAAIIIIAAAgiMvwADPuNvTosIIIBAqQsQPwIIIIAAAggggAACCCCAAAIIRF+ACBFAYJwFGPAZZ3CaQwABBBBAAAEEEEAAgUCAjAACCCCAAAIIIIAAAgggkE8BBnzyqUld+ROgJgQQQAABBBBAAAEEEEAAAQQQiL4AESKAAAIIIIBA3gQY8MkbJRUhgAACCCCAQL4FqA8BBBBAAAEEEEAAAQQQQAABBKIvQIT5ESioAZ9EIuHd0P7l/bs7Vjxn/ZqWl63raHpLd3vzx3vami7rbmu6sru95c6e9uZf75E7mm5c2958RU9H06fXtjXP7W675Ph1nZceub6zc3J+mKgFAQQQQAABBBBAAAEEEEBgggRoFgEEEEAAAQQQQAABBDIQmPABH2eDPGtXtzy/u735nONnTrkqKeW94lLfS/nuR77T76tIp6guVtUzVdwbLaaX75GdnmKBfEyc/p+ncr2q9yM/mbw1ldp8fW9Hyxd6Vje9ekMiEbdyJAQQiJwAASGAAAIIIIAAAggggAACCCCAQPQFiBABBBBAYF8CNk6yr1Xy//qGq66qvLHtkkN61jTX9c6c+hPPc/fawM5KET1DbFDHpo8RkamWc01VovJCq+udzrnPiKc/f2pm1c9tUKm6q/Pi6U7sVeGBAAKFKHB954pD165pmhN8Wm+sc4KB4EL8FaBPJShwTVPTlOB/9Fj/zQf1r+9MlPSnf6+/YvnhgcNE5N5Vq541pr/eVI5AkQv0rlp+4nj8bfa2tcyyY6AJOQ8s8k1E9xHIq8B4Hv+Mxb7Fjt1O6LLrOsP5ytYDules2K+rLVF108qVFXYtRvMKRmUIILBPgXWXXnrkWPy9R73O4NioK5Eo3ycwKyBQJALjeqC/vrNzcndby0c2bnv82wPq/UZ8abNBmddkY6Uq2239f4tz/9ot28LRUrDcjjRO8FTXVqTiP+xpa7lwbUfTzGA5GQEECksgnvJf6fnetzyV68c6H3/IlHcVVvT0BoHSFJg8JXaw/Z/+7lj/zQf1J5NTV956TdOU0pQW0aT3hsBhInLK68vqmE94IFBiAi4WWzwef5u+uitfMnPac0qMl3BLSKBYQh3P45+x2LfYsdvd5eo9OJQrBtxvtDz1s3KpurEv3vfNno7m1p62Sxrs+eTr2luP3sCb7YQHAmMtkKpIvmks/t6jXqcdGy2fdvi0qrHePtSPwHgJjMuAT2dnZ1l3R8vCVGrTE6LuKxZcteVDLO8z2UHEv5xKi1P/NO2PH/LEw5v375+x+QX9B2154W55hjfZOf/ltm6DqHzfKh6wvFtyzqkTeZkNGn3eE/1VMIK72wrMIIBASQmorx8pqYAJFgEERNXN375Jg+MQNBBAAIGSFFCRw8rVHVuSwRM0AgiMmYBdbzlSgjutqJykovMsLxH1LhEnN8TF//PGmVV/725vaeld03rimHWCihFAAIFdAkwhULIC3lhG3vuV5VN72pvef3Bq053qXLu1VaEi+2rzQTsguM5WWpD0/Of3zTjymJqFDQ01C8+7fs6SJQ/PTyS219Ym+vfMS7fV1J93j63bUr2w4W1lzj/S2SCRiLtKRf9pAz2+tb8z2bCQk8Oduh90tzVfFXyH0M4XeEIAgdISeOm6zouPLK2QiRaBkhfw7CjgK+vam/mEX8n/KgBQugIlH3mF7/tvL3kFABBAYDwE1BqJWw5ulfRsFbfU+f5dPW3N/+7paL6qt73lg9etvvjFXV1dMVuHhAACCCCAAAJ5ELBxlTzUMkIVwUd2/e3eehUNPtGzz1t4qMp259xnnQ68rr/PO+PUuobLTzv7vL/V1tamRqh+n4veXX/eQzU2SHR4bNoC5+TNIrJERDZb3i1Zu2fEPLm5p731jbu9wExpChD1hAvY3+tvRPyzxPkftlHahdahtiDboO0PxLkHbDpvyYkelkrFX5y3CqkIAQRyEjjQVTzixJ0p9ncfZKda51Qus8rabPn1qu5uFemz+XylCtu/rOpZ01xy73BXif88MB7Kvrjlhjq4nxVxP7Lpxy3nmh6xCzl3WeGh+pqH2gme4wPxu+01EgIIjCKgQmltMQAAEABJREFU6ncGfytBtr/NZbZamzhpdyI/tuk97l5gy3JPqjW5F6YkAgjkQ+CZxz+q+nF10mJ1Dx7/iMv78Y9VvTPtPOaSHJ/tOCq4U8IXrDb7n68/t+d+y5knlWeLk4/Ycd5X4xr/fsWj993Qu7r5pA2JRDA4lHk9YdekPAIREyhz3k/S/65V3RctRPs7lTZRucPOqf4rY/FQ+X16uwUxLe4CC7VNVb5tz/+2TEKgZATyPuDT1do6qbet6ay4+L9R1Tc5kcp9aG5WlW/ahZ0Tauobv1iz8JP/rl26dNs+ymT88okLFgxU1y/7T01dw6ryZPlhIq7ZCj9ieSh5dpBxtC2/pbe9+cM26GT7v6GXeEYAgfEWCP5eq+sav1Vdf941c+sa1lTXNSwKsv0Nv7W6vvGIlC/PsT/SYCBog4S+AOwm24lGMCBsVZEQQGCiBGbV12+uqWv8RvB3H+Sahcs6ahY2LNnxt9942pyFja88LDZ1qv3DfpUNCgcXQvJxwP5c8eXLXW1tI96reaIsxrrdmoXn/jswHspz6xovCJx35MaT7HmGOu8YUf2E9eUXdhy3t4vM22x/bBeidZG6gWOs7MFz6hpfZc+LduTGxqF2gudTlyy53+okIYDAKAJzFp73k+BvJcj2t9k6+HdU31BfU9fwRpsu92L+CSr6ZSv+B8s5vSnOyg2lI3ram942NMMzAgiMv8Azj3/mLFx2xZz6hgb7e19UU9d4mp37vHLjFndgyulbRCW4Y8pD+eplsJ8Jk+fWNXzN+vk5y/Y/f9lr7blC1X+D9e8iEf2JiGTa1zKL7WCn+k7nyQ+emlm1oaet5b1dbZdk9BUA1g4JAQTSBN5Tt/Sf6X/bdh71Wfv7tL9Tu66ysGHWnLqGw2PqHe6c9zErtkFFtttz+OTkf+ntFsR0XePyIPY5Cxveb89HaSr1Sgv0u5aTlkkI7CYQtZm8DvjceNUlh1RUuu+I6kqDmmZ578m5/6noBzZudguqz274095XDv/qKYsXPz39RVs+mfL9d1ltt9pFDN+edyY32eZX9nY0n7dzwfDTNU1NU7pXXTKvu73pg0Hu6Wg+efhFJhBAYFwF5i1quM8OUtbYAG61/c022oBxqAMU9WTeuAZAYwggkJNA8AaOU+sb7vrto5vPS6bkXfb3H3ySJKe6dhXSd5d721bd3dlZtmsZU3Pql/69euGylXEZeJcdKF4+ikifDZj9nz8pNru6blnbnPpP/n2U9ViMAAJ5Ejh1wXm/nlO37FNeLP5uq/Imy2FT8CmisHVEvTzxITChAmc0Nm6ZV79sQ/+BRy52zq5j2DWUCe3QXhofHLSua/j0dFf5zpin71R159jq2RwfxFTkDaLuG+Xq3dzd3rKk1N6YY14kBMZcYPbCpf+tqV/6lf7t3rvtomiznVft7Q1eY96f8Wpgzjnn320xz7f2gk892RMJgegK2Hl8foLraWs5on9b7DtO3Km2s6jcV632j/yu/oHUa+2kZV1wELOv9fP1+qxZieS8Ref9un+GV6NOV4to+m3ebJBKL17b3rJ0Q9pHifebljrQi3krVfTrQRbffU54IIDAhAoEA7h+MtXtnGRzErFnn508d+3qptfu+cK+lvA6AghMhEAikfBPO6fhLxrzzlSRJ8P1wcXEyQceSG38uNVj1dlP0rDAe+o++eS0SQc2qOiet35Q/b0v/Z018899argAEwggMC4Cpy5Ycr/tu64J35i+quvSi48MXw81IIDAWAsEt7qvqT/vHnHeWU6koC/Ozqqv3zz77GW/nbOwcbVWpF7hnH7WfOxYQjP9ZGLc1j9exa0o97b9LLjV2/rOxGRbRkJgAgWi13Rwd6VNW9zFKhJ8cjh6AY4QURCz64sFH1L46wgvswiByAjkZcCnd03zSapuvf1DflNmMm59Kq4frF1ywYTd2qO2dum2h+NVDSL+Auvz/ywPJ0/cZzbOnFI7vIAJBBAoSIGyCmd/rhKcEITqn6fSGKoCCiOAwLgLuHL9j3Py+zw0XCbiXXh9W/OJeagrclXMmj9/e0r8y/YIzHffmrvoU2G+72ePKot2AR1HYAIEnKdVoZtVqSovj70hdD1UgAAC4yaQGvB+oyJFc3F2zpnnb6qpX/ZFr8y9UcR9waCetpx5cvISF5PbfL/q8utWNb8w84KsiQACmQgMvgHf00szWTcq6+y3ceNmUf1hVOIhDgRGEgg94NO98pLn+r5c6UReNlIDIyy7pz+W+tDcjy+b8NHUBQsWDFTXNX5LxHufiKa/S2Y/m/9mT3urHZRIzg8KIoDA2Aok+8r2F5Xw93dWOYn7RI/ttqJ2BPItEHyyRD35b57qPSSucnv3ii8/J0/1RaqajZO2rHpmQK7MD75H7ZmLmUcAgXESUOeODd2Uk3IbOH9tIpEIfU4Yui9UgEAEBMYjhNRhhz1if7f/Go+28tnGqWc1/qu6ruELKsHAj2R3LWjHvuoDcU/uDm6x79hn5XPTUBcCohuT3aXEMCuRSDrngjcO+qUUN7GWlkCog/vgNm4S9y5XkWMyZHvcqbegdsEFGzNcf1xWq65b+iNf9O3W2D8s70rOb+vuWMHFn10iTCFQUAJemR98qtAGaMN2S6sqNMYAb1hGyo8mwPIxEnC++2e+qnYi07Q83nrTypXT8lVnVOo5eNMBxiOPpcdT8/Hz7kmfZxoBBMZPoKvz4umi8sp8tKiqb7eRo9Cfls5HX6gDAQT2LRDc2k1VHtz3moW5xpy6xt95Ze6d1rurLPdZzjypTFHRy3tnVq1c39k8I/OCrIkAAnsTmHP++ZtsAOTRva0TtddiqsHAuT9GcVEtAhMukPOAz/rOzsmqrlNF3pJxFM7Nr1649K6M1x/HFWvqlt4pTr8gknZfWZWXqJ/8lPBAAIHCFHB6Vp46VuGL/xo7yLFdWp5qpBoEEBh7AdX+vDaiempfrP/Tea0zApVtPuQJJ85tSgvlkbRpJhFAIGOB/KwY92NH2N/kS/NTmxwTmzH5JXmqi2oQQGB8BIr6/3DwaZ/yZPlC8WW5cWV7wXWSlVnop+T269pbj7ZpEgII5EHAUy3ageRcwk/6LvgeUpdLWcogUAwCOQ/4pJKbPmJ/GZkN9qjaqu6a6vrG9XY11aYLjyboV3X9smtEXHDQMfRlgiqqZ7lkbL51+lmF12t6FBkBAslaYOcBfh4vUOg7fnX55fGsO0IBBBCIkkBMVc7raW/+WFdXVyxKgeU5lnzdSi/P3aI6BEpDwEvKcSJ6oOTn4cVisQvzUxW1IIAAApkJnLJ4cV//Y5u/ZFeKmkV0q2T38Oz6zMvizv/W+jWXZHq3mexaGOu1qR8BBCZUwNeB/1kHsh1wtiIkBIpDIKcBn+vav3y0U/mihVhhed/JuY22fvCR3X2vO8FrlCfLv2CDPhvSu+FUz0+fZxoBBCZeICb++9N7oSLB7Ybs2D99aebTtjN84f3+0y/IvARrIoBAZAWcfD7+yH2vmoj4aBMBBBDYp0BMn3kM9Pd9ltnLCurcKWs7mmbuZRVeQgABBPIuUJtI9PcddOSnxMlFopL9p7ZVXu37sVt6VrXm6xOPeY+RChFAAAEEENibwFi9Ztc4s6t6fWdiclzLgu/tOSCLkr94xJv2kyzWn7BVg3ea2ElPi3Vgs+WhFHxseGiaZwQQmGCB9cEtJUXmpnVjm01fZjlpOadkI0VxT/SCnApTCAEECkXgpzb4uyV0Z1SepZ5e1rXyooNC10UFCCCAQB4Feq+49GCr7t2WB5Mdv/zKV/3S4EyOP6yOChXvFOFRSAL0BYGSEAi+kygWr1ohvt6YS8BO3NHOc1evW9V0VC7lKYMAAggggEAUBbxsg0q5qlPEyRuyKue7zy1YsGAgqzITuHJfX/yH1nxRDFBZP0kIlJxAX+rp51nQMy0Ppa1JX75uM8EX79lTjsm5mrWrL8rXLVJy7MS+ivE6AgiMJqDibvCdax3t9WyW28DRK8vj5Vfd0P7l/bMpx7oIIIDAWAqkBpI1u9fvfjTgV15ny56wnHNS507q7Owsy7kCCiKAAAI5CsxesGCr7/rOssHnH+dShap7RSomV/Ve+qVgQDyXKiiDQAEL0DUEEEAge4GsBnwG72fvy4esmcxu5WYrisqd1YsafxFMFkuuXbp0m5NY8GkBv1j6TD8RKCWBMpVjLd5DLA8muzD783mLGu6zg/3mwQU5/9DJnld2cs7FKYgAAhMt0FdT3/hZu2DQYx2xJ/sZLr0rpeWLw1VBaQTGSIBqS06gq+v0WEy0dihw28kNxFR/XVtfv9mp3Dq0PMfnV++f3MibXnLEoxgCCIQTmLvoU4/7vv8Jq+URy1knFX2TlJdfctVVicqsC1MAAQRKTiCmlb4dRwV3hthswW9WJ9uS/ZW2yOZICERAIKsBn0lP3n+Mqrwjq7h9XZ/V+gWyck3duTeL6M+kCB90GYGoCzin1RZjzPJgSonXFEz0eakue95oOeekdrKwIZGI51wBBRFAYOIFNHauOPlDHjriOeeW9bY1p99CMg/VUgUCCCCQvUD5E69+gRMXfMp5sLCK27w96QbfER9zcoeIJC3nllSeV+HJc3MrTCkEEJhIgai0fcCLt/5OxF2TazxOtHr69inBeWKuVVAOAQRKROCpyo0PqdPZNurzriA78T8x5UWPbCqR8AmzBASyGvBJpuQC5ySLd0y47c7z7y5eR/8rxdt3eo5ApAVmDUWn4u6vWXjuncF87YILNjpxtwfTuWYn8ponD56SzXeU5doU5RAYa4GSrd/2Cf/24v5H8gQw1al8s7ej5eV5qo9qEEAAgZwEPKdHW8Fdt7R1ek/tOY2Dt7NNesngjgq539bNSbkv3sesfhICCCAwIQKzZiWS5cmKL1rjD1rOJU2LOW3pXb58ai6FKYMAAqUjMH9+Ynt1/bKfzq1v+HGQa+rPuyfYBxW5AN1HYFgg4wGfnraWI1Tkw8MlM5t4xPnxhzNbtfDWUvXusV7l9JFiK0dCAIExEFi7ummOVTt8scN3eruqOls2mFS8DSKSspxrekHc12fnWphyCCBQGAKnLjjv16ryQetNPt6pVen7bmVXayuDwQZKQgCBiRHwff/t1vLwrbV9la/Z/GDaWLH9XjtXu29wZo8fmS1QJ9U3rVw5LbO1WQsBBBDIv8Apixc/7Xy3xGoesJx1ciLP8qfG2u7mO8mytqMAAggggEB0BLxMQ3Hi3pDpurvW00eTqW2P7ZovrqmY6/+39XjwXXP2TEIgegJFGFHMk3OHu63Sbxc3bh6etwlNDb7D9UmbzDVVpDzJ1ycDhAcCCEycQN+BR14rzl2Vjx7Y4NHryytS385HXdSBAAII5CSgWpNW7snKZPl3huaDd6o68YcHgIaWZ/m8X19Zf/DGmiyLsToCCCCQP4F4mf7Aavud5ZySnR+++/6Bp0/MqXDUCxEfAggggEBJCGQ04OOcU/XkldmL6PaKKWbH/GIAABAASURBVLHt2ZcrjBLvqfvkk07kL4XRG3qBAAK9q5Y/y4m+ZEjC+fKIV+b9eWg+eO47uOyPTuS/wXSuWZ28d31nYnKu5SmHAAKFIVBbW9sfi2twa5Cf5qFHKqrv6G1vvrArkSjPQ30FVQWdQQCBwhbYeVvJI3b1Um8/ZfHivl3zIv6Uyd+xHdXW9GXZTqvIqRv4LsNs2VgfAQTyKPCrBzc/4Xz9XogqD9CYvjdEeYoigAACCCBQ1AL7GvAZDO6Gyy+fJE6eNziT3Y9Nc848Px+3Usmu1XyurfL9fFZHXQggEEIgpq+30lWWB5Oq3vd42dP/GJzZ+aO2duk2T9w3d87m+nRgylWdkmthyiGAQOEIzF7Q8FhMvVrr0Z8sh05OZEn5gVXD3yMWukIqQAABBDIQcL5bNrSa7Yd85/xbh+aHnud+eNHjvvi7ffJ56LWMn528dNOBU9IGljIuyYrRECAKBCZcIJFI+BLTnjAdUScfvrWpaUqYOiiLAAIIIIBAsQpkNOAT6+sL/lEeXqxBhum351K/DFOesgggkB8B55yKxF5ntQ3fu96p6w5uYWLLdk9lZdc4kZzu+zxcke/m2clGRvvI4TKRniA4BIpXYPbCpf8V5y6wCPLxJpQDJSbfuK699Wirj4QAAgiMuUDXypUHicrJQw3ZwckjonrP0Pxuz06vt3nfcq7pOSnPHZNrYcohgAAC+RCoWbj0l6qh7ray37bJEnwXkPBAAIFcBCiDAALFLGDnC/vufn9soNIulBy07zWjt8acuvPvVZGHohcZESFQXAKXX3553Il7TXqvfS/2rfT5oek5Zy152P5uw9wGwKrS447dr7IkB7oteBICkRPoP+jZN9lA8KfzFNiMuPO/0dPWwrvg8wRKNUUkQFfHXaCsIvlyER2+1aztyx6cXOVGvO20xuS3Eu7WthXixWZbHSQEEEBgQgWcr18J1QHVuvWdncP7zlB1URgBBBBAAIEiEshowMd3MklUZ2Ydl7qyzs7OsqzLFV6B+wqvS4XXI3qEwFgKHNL/VDDovGvAR+WOeQvOfXDUNp12jfpaRi+4oydVxI7OaFVWQgCBgheora1N1dQ1rLKOtqmqXS+1qTBJ5bWqsnTHpw/DVERZBBBAYK8Cqin/9SJu+KKlL/q9k89o3DJSqf6t3r9s+W63u7X5rJI6V8u+LSsyVkagJAXGOmjf86+x61C5H7M5mZlKbTxhrPtJ/QgggAACCBSaQIYDPi5Yrzz7zuv0Z8mm6dmXK6wSKef/tLB6RG8QKD0BPx7/RHrU6uuIn+4ZWkfVD2518r+h+eyftXLAybuzL0cJBEpeoLABnC63C5l35aOTTlz9+o7mTyQSiXg+6qMOBBBA4JkCGxKJmIi+UdIevvijHgPVLl26TcXdlLZ6LpMz13W08imfXOQogwACeRN41Jv2pDh/xE8zZtSIiufEO154IIAAAgiMpQB1F6CAN5Z9sgsq05N9ftEP+IgnfxhLJ+pGAIF9C6hzHx1aS0Uei3n+z4bmR3qurJJ/iKhlyfnhqb4v58IURACBghSorl/2H9/XD9l+ZMR3x2fZ6TJf9AsvP3T68HdrZFme1RFAAIG9Cmw74ICYOPeqoZVU5ffzFjb8fmh+pOeysopvj7Q8m2VO/IXZrD/yuixFAAEEchfYf//9fRH9p+T+8Ox47zgbOOeNObkbUhIBBBBAoAgFxnTAR0UPlTI9oghddutyXPTfuy1gBgEEwglkWbp7VdObrcgMy4PJqd4bL4vt9dM7O2514m4fLJDrDyeH97Q3vS3X4pRDAIHCFJi7aNlfRfT9IvKk5bBpqp9KXdzdseI5YSuiPAIIIPBMgb74wEJRmTK03Dn5jureb0t5ylmLH1CRcMdAoi9dt6rpqKF2eUYAAQTGW+D000/3ncrfw7Rr+8xnbz700BzuVhOmVcruIcACBBBAAIFxFRjTAR8RVyW+F1yoHdeg8t1Yf1L3emE53+1RHwII7C6gcW/3QRfnfv3zB55+ave19pzrd96otzzZc+1RlqhXN8orLEYAgSIWOCxWdbNdRO3MRwh2YfUl6qe6uzovLv5PNecDJIs6WBUBBPYh4NyStDU2eU5uS5sfdTLlpGPUFzN4QVUO9D3luy8ysGIVBBAYGwG1wW07xnooTO2qcpSmnqgIUwdlEUAAAQQQKDYBL5MOe6q+rZe0nH1SN6+rK5HtOyqyb2cMS5R5nsXuto5hE1SNAAKjCFzT1DRFxb0s/WWXkpsTiUSwX0pfvMd0bf3Sv4tze7312x6FnrnAuROvX7n88GcuZh4BBIpb4MQFCwamVx74ebuQcKNFss/9ia2z96RyfHkyftFNK1dyUWHvUryKAAIZCqxtW/4iu1j57LTV/xyfVJ7RnQc80btE5YG0sllNOieVIm637w7KqgJWRiA7AdZGYEQB9d3j9oJdj7GfuSQnU/v9qV4uRSmDAAIIIIBAsQpk9I/PiesTJ8E/2qzjtAspL4k/PvWDWRcsoAIa7+9X0X1+mqCAukxXEIiMwJRJOsP2PyemBfTEpu3uzrT5vU9qbPXeV9jnqzO8eCy9/X0WYIV8ClAXAmMnMGv+/O3JZOpsa+GXlsMnlQ/1x/uCW8WFr4saEECg5AVi6r0nHcGJ/PmX9z+R0a0o+/v0Mee7X6WXz3ra03dnXYYCCCCAQB4FNKabrbrc35ijcnBSt5ZZHSQEECgKATqJAAL5EMhowEcG+vrFk4xOLkbqVMy5C9euXn3gSK+xDAEEENibQEz919gFjkPS1vnmGY2NW9Lm9zpZ5vs/EScP73Wlvb84yVN57d5X4VUEEChWgXmLz39APfmsiObjk7xTrZ6vXt9xyeudExUeCCCQP4ESq6mrtXWS7Ud2P/5wcmsikcjone61S5du80R/GorNyXN7Vje9OlQdFEYAAQQQQAABBBBAAIFxFfAyaS01ObbVLpg+mMm6I63jRA6PxbYtGuk1liEQVoDyERdQb/5QhHb1NOmru3xoPpPnx7e5x+yy692ZrDvaOs7p7NFeYzkCCBS/wJyzG25TcXWSn0EfiTm9oufyS44WHggggECuApPkAKf6Mtn16BuIJ2/aNbvvqZTE1u97rX2sEQsGxPexDi8jgAACYyTgO2+7nQP66dUzjQACCCCAAAJ7F8howEf2P3qzc3Lf3qva66tlztfGnlUXv3Sva/EiAgggkCawtqNjps2+w/Jgsv3QvUkv9Z/BmQx/BJ8Gcs79IsPVR1xNVV7I/mtEGhYiUEgCofoyp67ha+LcylCVDBfWF2lSw95Ocrg2JhBAoPQE4pJ6gad61HDkKutrF1ywcXg+g4m59ef+xVb7g+Xck9O3Xr/iS4fmXgElEUAAgdwFnO9XOpHMrlvl3gwlEUAAAQSKT4Ae70Ugo3+ctbW1Kc8LeQ9olSkSi69bt/qSV+ylP7yEAAIIDAvE3Ja5NqOWB5N6+tODnr8949u5DRayHy7mrbOnnJMNGKnE45/NuQIKIoBAUQhoefxSUblD8vFQfefatqamq65KVOajOupAAIHSEvCcfGTw+GNH2ClPXMeOyax+Ol/0C1mVeMbKdqG1LFZe9vZnLC7wWbqHAAJREYjFohIJcSCAAAIIIDB+AhkN+ATdUV9DvUM+qMPyc2zk6LLe5cun2nTRJC81bVNK5GoRaQuyqnedPZMQQGAMBTYkEnEnMvxlxTbt2+MXs2Zldu/69K4lDzjiD+Lkr5K+MNtpX961tqMp+MRRtiVZHwEEikRgzllLHnYSm2+jzFl9knC08DzVcw7cXnX6aK+zHAEEEBhJYH0iMdmWp+87/uO5Kb+xZVmnpNt0szr3aNYFdxaw/aGdL+rrNthx2c5FPCGAAALjJmAD38F3QcdDNLi5alKlXc4JUQNFi1eAniOAAAIlKmAH8JlFfmp9w112wfTvma09+lp20vAGNy12w/pVzS+0f942O/q6hfLKe+rqnpxb1/Dp6rqGRUGeU7estVD6Rj8QiKrApsOmHOGcHDMUn6okPS378dB8Ns/BpxR9lYuyKbPHuiqVMYm9ZY/lLEAAgUgJ1Cw899++8z5mQT1hOWyq8J209rZf+oKwFVE+vwLUhkAhC/gzp75bRNM/HXiXl0xulVweBx27zal+P5eiQ2WcyklPTZ9eNTTPMwIIIDBeAr4vM6wtz3JOyS44PeJv35LMqTCFEEAAAQQQKFKBrP5x+up/Ki9xOjkp5cl161avOCEv9eWvEmpCAIECEXC+9xwb5HnOUHec05+d+shTfxuaz/ZZ+2K9VibMBdyY77vXd3V1cWMBgyQhEGWBR+JTNohz+XpzxwwnyRuuu+yS4QHsKNsRGwIIhBdw6oJb2g5V5IvoD09ZvLhPcngEb3pR9X5iRXN+h7uKHiOV7vlWBwmBqAkQTwELdHWdHlNPXxymi070v1td30CYOiiLAAIIIIBAsQl42XQ4+chWu2Dq/pxNmVHXVXmxi7kfXt/ecupNK1dWjLoeLyCAQEkKuJR7lwVebnlHUrlaEwm76CE5PQYOO2yTiNuQU+GdhVTdSfLkP3mH606PaD8RXSkLLFiwYKC6vvFLTuXb5pDzRVIrO5SeF497n+tqbZ00tIBnBBBAYCSB3lXLnyVOjh16zYmkkuL/aGg+l+fUQH9QfnMuZXeWiYv4S3ZO84QAAgiMi8CTT77Nc05eFq4x/19Pxg/NacA8XLuURgCB4hKgtwhESyCrAZ/TP/e5AXGy1gh8y3lIbnLMuW/1x/svHTy5yUONVIEAAtEQsAsc84YiUZEnvaeT1w/N5/IcvMNVVH8iorlfvFV5odfnjhYeCCBQEgJeX/xcFZfTrST3APLk9PKK1Kf3WM4CBBAobIFx7p3z4sGnm48aataOge6fnKy4d2g+l+fkIduDN+z9K5eyQ2XUl1PXrr4o+C6NoUU8I4AAAmMqcJD/9AtsHxjm3MuJc78P3sgzph2lcgQQQAABBApMIKsBH1W1a7Bep8UQ5rZIVjwtqUyxubNdLH5vb1vLrEQikVWfrCwJgQkRoNGxE+hd0/x2FRk+uPedu23O+edvCtuic3KnXbzdknM9TspjsbJFOZenIAIIFJXAnCVLHna+nG+dzn2g2AoPJtt/2KDzp9d2tHzU5m0XZz9JCCCAwDMEnA5+wnnq8GJPWnO9ndtQHbW1iX7n3Oqh+ZyeVaZorGJ2TmUphAACCOQg4Dnvk1YszO20kyKxn1odeUlUggACCCCAQLEIZD24Ul2/7D/i5HMimuf7oLoqO8HpffnMqZd3t11yvJ2UqPBAAIHSFPDltKHAbZTZF0+CW5EMLcr5+alJm//oRB7IuQIrqCrzujovnm6TJAQQKAGB6kWNvxD1TrdQn7I8UspqmTr36e725ldkVYiVEUCgZATs5OzktGC3uYrYt9Lmc56sik+7Tpw8nXMFVlDFva2zs7PMJkkIIIDAmAp0dbQeZvucuSEbeai/T38Tsg6KI4DbIrXsAAAQAElEQVQAAgggkC5QFNN2TpF9P/sPOrLTLlh0Z19ynyWmOnFnqnq39bY3f3F9Z+fkfZZgBQQQiJRAV2vrARbQWywPJhv5fdpP6e8GZ0L+mD8/sd1XF3xKMUxN08uS8VPCVEBZBBAoLoE5Z5/bo05XWa9tzNh+hki2TzvaDr6uuLWpKfiEc4iaKIoAAlETuO6yS46xncwJQ3HZedHdNfPPzctg89sXLNgo6m4aqjuXZ+fcK/bf9uShuZQtjTJEiQAC+RIoc8m5tj+sDFWf0y/VLl26LVQdFEYAAQQQQKAIBeyaQ/a9Dr4Lw8W9/7OS91keizRDVD+dSm767drVLR+9fuXyw8eiEepEAIHCE5g02b3cDu5npvXsgfiWVP7emZWa9E274Lolrf7sJ1VOTiQS8YwLsiICCBS1gKq6vvhAi13svC0fgdg+7uXbpnhf4dOC+dCkDgSiI1AW9xZYNEPnZ744vcHm85ac8261Y6BkrhWq6NFlFbGjcy1POQQQQCATgRvav7y/J15tJuuOvo7+Oxav+rrwQGAiBGgTAQQQmGCBoROKrLsx5+Pn/kHUnZt1wWwKqDzP89yaWDx2a09bS0M2RVkXAQSKU8D35WXW8yrLg8k5vSMf398zWJn9mLto0eN2sTXURVt18opjD552sFVHQgCBEhGoXXDBRucmvd/CzdMAtKspT8XOtvpIJSRAqAiMJrC+s3Oy8/Qdaa9vcp67O20+9KSn/q+tkoct55oq1Jf35VqYcggggEAmAgNS9ian8qpM1h1lHRswlytnL1iwdZTXWYwAAggggECkBXIe8Ane7Vq9sLFbnXeOiI7lP9LgPtHH2uBSU0978wO97S0fXNd58ZEukci571J4D3qEAAI7BZzz326Tg3/fNjDj++Kusfm8Jt+5m4K6c65U3TEVknxOzuUpiAACRSkQDBh7Gmtwzj2ahwDKVTTR3bHizYkExzTCA4ESF0j6T71EnP+sNIYnnBf/c9p86Mm+7bG/2fFPuDs0qJ624apEuNsshY6EChAoegECGEWgd/nyqZ7Kl8RJ+Sir7Huxk4ck5sbiKwj23TZrIIDAhAoE51XBfuSmlSunBfkabqM9oduDxidOYPCiapjmvfjTX7WLp2G/EyPTLhzmxH3VT5Xd0jtz6kXdnZc8N9OCrIcAAoUvsL6zeYaod9JQT1Xkt/PqG+4ams/Xs12s/ZXV/Uju9WmlE29e7uUpicBoAiwvdIGpD2+8U1U/lY9+2oXXSvWTX3/5gdNekY/6qAMBBIpXIOZirxbx9kuL4I55C859MG0+9OTgd1moXBeyogM3bp08J2QdFEcAAQT2EOjq6orJtPgy5+TYPV7MYoEdX7XOeWjzX7IowqoIIBARgeMOnjLDTY19ZSDe3x3k6ZPl4sIOjd4hMDYCXthqZy9IbJ1b37BUVK8Qlf6w9WVQvkzEvcjy+Zry/t7d1rIqGPixkduKDMqyCgIIFLBAKiXV9rc9WXY+nNMxeWdWedn0v6jIf3Y2k9uTkw8k+B6f3OwohUARC8xKJJLVdQ1XinMrRTUVOhTVw/24f9H6zsTwvi90nVSAAAJFJ+CLvsaOgWJDHVdPrpYxeGhf/FtWbbh9l3rBMVDo80jrBwkBBBAYFih79N8v9X3/zOEFOUyoyE9r6htaNJHwcyhOEQQQKHIBz/eCa8OvdyJvGcyenFDkIdF9BHISyNuBev/DmxbZxY/PiuTh4odk/lB1izSlv+iP93+tu6Nl3vrOTi6YZM7HmkUoENUud3Z2lonKJ3bFp5ttB/XjXfP5mwru5+yc6w1Z48zjD5nyrpB1UBwBBIpUIBbXL6pz38tH99XJ21OpKR0cw+RDkzoQKD6BDVddVWmDPW/b1XO9v++AI3++az5/U3OWLHnYarvJcs7JLqC8+CUzp3Fr25wFKYgAAs8UuGnlygrV2HJVPfyZr2U8r/KAqC7KeP0iWZFuIoAAAgggkK2AXU/NtsjI69cmEv33PLKlScR/p62xzfI4Jj3QGnuvXXj5rp98+t/dHU21gxePbSEJAQSKQ2DGwMaXipMX7Oqt+3cylfzbrvn8TsW8WOh3zqqvH8lvr6gNAQSKRWD2gobH/KR/jvV3k+U8JD0j5W9anEVFrIoAAhEReHLr48FtYmcOhePEX1tbWztmd05wql8baiuXZxU5rFxdqFsu5dIuZRBAILoCA2X97SLuHWEidL5+Zs7CZfeEqYOyCCCAAAIIFKhAVt3K24BP0GoikfCr6xpvd86vFufuDpaNc47ZCcxB6vS7B6c2/bK3vamxp7P1pePcB5pDAIEcBMo870QrFrO8M+m9qUOOyuu963dWPPg0e+HS/9oA0/cHZ3L/8dJ1nRcfmXtxSiKAQDEL1Cw+7x+icroT92he4vBlSfeqpjfnpS4qQQCBohGIefrhoc46kYGYaF4+PThU5zOf45r6nare/8zlWcxX+L7/9izWZ9UxFaByBIpbYG1789nOyf/LNQobhN4uTi+sqV8WvKHPdqO51kQ5BBAodoEy5zwVLSv2OOg/AmEF8jrgM9QZG/S5rXxSxSk2f6WKJO15ItLxTvTLkvJv72lvuW7dqqajJqITtIkAAvsW6OpKlKdUgoucw/skVdddW1ubkjF8+CJXhane9jGHpVLxF4epY0zLUjkCCIy5wD0Pb75NnGu2hmyXYj/DJJWDJeZ19bS1HBGmGsoigEDxCPS2tT7POffGoR7budN9zg2M2SecB9vRrf91vv+nwelcf6jW5FqUcggggMCQQG97y6l2AnixzU+ynFtyeuXMPm3NrTClEIiQAKFIn2iFExfcBQoNBEpawP635j9+tSu1p3x08aP9M46sd04+ISr/sFbCXwixSrJMMVt/poib58f0Lz3tTV/rXXXJ67vaElW2nIQAAgUiMPBYxRR18srh7jjZstkNhLq//HBde5nwffmVvRziU0RusjgJBqqEBwIIlKZA8OnmgUe3XmqDPrfkQ0DFHWSHUd9a39w8Ix/1UQcCgQC5cAVS6r/eiZSn9fDevoOeG+bTN2lVjTw5e0Fiq52f3THyqxkvPcLOrdK+dyjjcqyIAAIIiEskvJ62lvfahdnrjWO65VxSn51DfrUsVdbwuqVLt+VSAWUQQCBaAr4MBJ/uGZNr3dGSIpqoC4zpH0FtbW1/dX1Du++nZqvoNyYY006k9AwX83rLtOrm7o6WeXzPj0zwJqF5BHYITNaKY2zqOZZ3JJXvf6Duk0/umBm7n7436QGn8ocwLagnwX33w1RBWQQQKHKB2kSiXyv991kYt1sOnezi72tSU+RToSuiAgQQKGiBrq6umDo9UUWGz8nUuVuCc6ix7ri6WHCRNWwzy8JWQHkEEBhXgYJprPugqmon/irrUNxyDsn1i7jP9R105MJTFi/uy6ECiiCAQAQFPI2/IIJhERICWQsMn1xkXTKLAnPrz//znLplHxaVd1qxP1qeiE/7WLOD6UAVeYOdTF03M7X5tp62ltd1tbXxiZ9BGn4gMFEC/hJreehg37eLnWtsfsxTbX39Zs93PwnVkJPnrl3d9NpQdVAYgQkXoANhBeacef6mlOhnRDTEpwZl6BEXJ+f2trWc1WUXhIcW8owAAhETePKfVarupLSokk683rT5MZucU7/073ZO9PNwDeirui7luwzDGVIagdIS6GptndSzpqXBU7leVQ/KNnorY6eK8rjvewur6xqXj8cAebZ9ZH0EEJg4Ac/Jyyau9WJqmb5GXWBcBnyGEKsXNtyaSqbeKU7Pt//SY3tv6qFG9/Ks4t4k6n+/Qrd1BfeO3bBhw9AF572U4iUEEMinwNrVFx2ovpyaVuf9fjL1+7T5MZ10Mb02bAN2wtIYtg7KI4BA8QukNvz8LrsQsdQi6bech+R/qfyx+2bloSKqQACBAhTw+tzRovLCoa7Z+dGd1fXL/jM0P+bPnjTt0UY2C1Sqystjb8imCOsigEDpCnR1Xnxk+SS/XXz3hdwV3I/setKpcxct+2rudVASAQQiK+Dtdm0psmESGAL7EhjXAZ+gM/MWn/+Ancg0V1SWv95OcK62ZQN2ccTOb2xqQpJWWuPvcuJ6Nv7p7vW9q5Y/K5FIjLvLhIROowhkITBWq8a8stfYvmDKUP22P/htecW2J4bmx/q5+uyGP4mTcANMKid1tV1yyFj3lfoRQKCwBWqvvTY1Z+HS71gvv2TZDi/sZ4jkBt/5qh0bNiR4Q0oIR4oiUKgCsVh8jh2DlO/qn7tq1/TYT6WSlT+09h/OuSUn5c7Jazl3ylmQggiUhEDwfT29bS2zKlLxX9g+5yMW9CTL2aZtIm75nIUNb7LrST/NtjDrZy9ACQSKTWD9mkuOsT4fb5mEQMkLTNjAxikfXfxo9cKG+XY15LX2Tz94d8amCd4aKqrvdLHYH4+fWXXxulVNR01wf2gegcgL7LhVkVeTHqgNvv588MuE0xeO8bR6sjxcE1pVobE3hquD0gggEBUB3+9vs8GadXmK53kb/1J12/rO5hl5qi9sNZRHAIE8CKzv7JzseXr2UFXOuUdFkz8emh+P50rf36yqd4Zpy8q//VgRBqXDIFIWgYgK2LUeDW6h3zuzqlPUrbf5XN4g12fl1ibFnTr9kS0XRpSKsBBAIKTAhra2qpQfS4SshuIIREbAy18kudVUU9fwq75HNtWJ0xc7J2vFjgRkYh/72QHFMj8mv1rb0fLRDQneVTuxm4PWoyxQ8b+/zXDq73aPVVXv9nGPua8vaPOxEO1W+OK/xi7WaIg6KIoAAhERmLvoU4878T9uO4SH8hKSkzf5SbmAY5K8aFIJAgUhMDDw1Ovt3Ofgoc7YwMlvtwxMGbdPOAftnrLji86D7/FxwXyO+ZjYjMkvybEsxYpagM4jMLrAdatbX7yuranbLu/cavu3M20nM3xHh9FL7fHKferL7Ipk+ftPq2u8fVYikdxjDRYggEDJC3TZYM/TuvUSca625DEAQGCnwIQP+AT9qE0k+qvrl/2npr5hnoi+SZ10qch/ZYIe1ra56P6euI6NB1dd0bum9cTgY8gT1B2aRSC6AhWVzxLRo2XX439zzl56967Z8Zl6YvrARmsp5Ltq9R2/uvxy3uFqkEJGAAGZu7DxERWtESf/ywOHHRrJWU/PnLrbJyLzUC9VIIDABAgEbxDxYrG37Na0yt0fXLz46d2WjcOMS+ltdiE2zEVUCyXGu+7HYVvRBAKFKhB8F/L1nSsOXbum6bU97c0f62lrujHupe52qnOsz1XBPs+eM01POdEfiriPVtc1PGfOoobbdg5OZ1qe9RBAYLwFgvacO3BdR9NbxiN3d7TMW9vR9L7utubzetpbvlau2+6z/cZCUT5xHGwKMgKBgA1sBE+Fk6vrlv6or8/7iEjqrU7cl1Vk3E98hjWclNuFmo+I73rWz6z62PByJhBAID8CTt9mf2MHDFXmnFw2ND2ez/PnJ/rspCLUO1w9jHr4nwAAEABJREFUkRfe7z/9gvHsN20hgEBhC2yfccRd6nlfzksvVabZcdHla1c17X6ROC+VUwkCYyNArSML3Nhx8X7i9PXpr9rAS/Bp4/RF4zI9/fGn/6xO/hqmMXXuFLvwMjNMHZRFAIHxFehtb2rPV37qz7/6acxP/cDzZb1F0Smqp4hopWT10K02QLTaE33XwHadW13XOK7faZZVV1kZAQT2FFA93jntHo+szn3Xc/pt1eDW/O4M68zwNSWbJiGAgAl4lgsu1S5dum1O3fn31tQ1fkqcd4I4uVpE/i0T9LALLIf5Ip09bU1rbuSL2fOxFagDgUEBJ/57Byd2/Ni2bZsE3+e1Y258fzov5m6zJpOWc0pOJO6JXpBTYQohgEAkBWpra1NzFi5drU66LEA7lLCf4dJ+Xkxbrl/d/Oxw1VAaAQQmUiDplR3qxKW/SeTJCr8s5CeNc4toViKRdOouzq30jlJ2DFSh4tkFXuGBAAJFIuBEF+Yrq8gr7ZrNC0X0QBHxLD8z7TGvIttF9H4n8oOUyFmx2KaDahYuO+fUumU/t+tB43p7S+GBAAL5EIjb3/O08cjW2ZhlEgII7EUgo3/Geyk/5i/NqV/693se3XxmzPPfoZ4ssQOJf8kEPdTzPj6gXs/ajibuUz1B24BmoyOwtm3Fiyya4e/vsQODXxy6efNTtmxC0vYHt/7BGg63f3GuZu3qi4ITHauKhAAC+xYojTV2fHJZbs5TtMfFPGnacNVVWb5zNk+tUw0CCIQWcCl9lV3snLGrInflKTu+T2fXonGc2rRFuq25UBdY1bmTOjs7y6weEgIIIDCagJ3r6S3i9EIRd1os5k6uXrjsbfPqGq6cvSCxdbRCLEcAAQQQiIoAcYyXQMEP+AQQiUTCn332eX+bc3bDZeWp8heJk3pRecBey/nd+FY267Tz3rOv9pz+fl1Hy3v4Xp+sCSmAwLCAaur9NjP8nTd24eOnb/7c51K2bEJSbSLRr+qawzWukz2v7ORwdVAaAQSiJlC7dOk25/wLncgjeYgtOHY7/altT3zWjo+G96F5qJcqEEBgnATseOMD1lTwt2ynNeKri11u8xOWzmhs3OJUbg3ZgVfvn9yY+5teQjZOcQQQyFJApd+uqYTLNmqTcauq96voh7UiWXvPo5u+PKeu8cbZCxr+orZDzLgOVkQAgUIWuFec3zimWdwFtt+6Wp3rDrJh3GvnV8EbVvpsmoQAAmkCgycaafMFPxm8+626vqFdk6lXO+fOtT/uX4poSsb54fvuyp6DptSNc7M0h0AkBLraElV2wP+OtGC2ie//ZKQD/rR1xnyyz0sFt13aGKYhi+tNGxIJLsKGQaQsAhEUqKk/7x7n65ni5CnJw0PF1R1/0NR5eaiKKhBAYBwFujpaD3Mibxpq0i5Y/Pqh+JT7huYn6jnm5A4Ryf3NdCrPq/DkuVYHCQEEikHAufkSIqvIR8XJMlHttHCD7wGzXZtNjZacO9KJ6/X7Yre/fGbVp3qvuPTg0VZleWkLEH3RCvy7uv685jHNdY3Lqxc2zJ9T3zg3yNV1DS+Mq3ecU/8Ddi3pBtsJ+UWrR8cRyLNA0Q34DMU/55zz/1dT37h6v0kHvskGX8605Zssj19SOdgObi7rbm/55Pg1SksIREPA86YeI+KO2BWN26oV5b/aNT8xU7ULLthoJyKhvjTZDjJe8+TBU/jSwInZhLSKQEELzF207AY7drjQOpmPN6pMF3VXXH/FysOtvlJIxIhAJATKfP80u1C669Znqj978MEH87FPCOWT9JK/sAqCd8naUw7JSbkv3sdyKEkRBBCYAIHqusZvhclzFjZ8s7q+YcU9D2+q639k80ud773PwtjnJ5lt//cqJ/IFN5C8t6e96f3OOVtkJUkIIIBADgKzFy79b83C8673K70P2SB2cCyTQy0UQSB6AkU74DO0KWbNn7997qKGr7m+2JHOSYMdPNxlRwzJodfH8tnaMT/3qe625k+MZTvUjUDUBOK+vNRiOsjyjuTkzjlnLXl4x8zE/lTxNohImAsvL4j7+myrg4QAAgjsIeAmed9UJ9fv8UJuC6bG+vtvWdd56ZG5FacUAgiMp8BNK1dWeCqnDrep0i/ifp5IJCb8HakbK7bfa+c2oT5pZPu2aotx2nB8TCAwJgJUWkgCwf4ruDV2zaKlXalk+QnWtzbLA5b3lmx3I9NF9OqejpYbe9paXtfV1RUTHggggECOAjXzz31KfPlUjsUphkDkBGzAIhox1Zx77lPVdctanV/5Lifehy2qJy2PebIjlSpVvah7dVPtmDdGAwhEREBV3m6hDN/2zHfSZPMFkTQ1+A7XMPuPipQnHxEe4y9AiwgUgUCNnYz4/bEFonp3Xrqrcmwqmfps1+mnc6EkL6BUgsDYCWzV/qOcyHOHW3Cyub8/9ePh+QmcmD8/sd2J/7WQXdivr6x/Tsg6KI4AAkUqMG/x4gfKk+XLPF/nSma3sC2z6ynvEs+tL3/s/k8Xadh0GwEEJkrgGe3+9vEtP7Z9yj+fsZhZBEpSIDIDPsHWU1U3d9Gix6vrln7Ln1J5jIg2i8iDlsc4ucnW9ld7OppPHuOGqB6BohfYcNVVlU5c2vf36INzFzX+rFAC6zu47I92Mea/YfqjTt67vjMxOUwdlEUAgegK1Jx77lMxlY+JuPvzEKUdgrgzy2e98uwu3h2bB06qiIJAocZQ5smx1rdDLA+lX9cuuSAf+4Gh+kI9+1Mmf0dFt4apREVO3cB3GYYhpCwCRS1wyuLFfb9+bNNNTvxzLZDMbrvvJLgd9ud725uv7+5Y8RwrR0IAAQSyFkgkEkmnckvWBSmAQAQFIjXgk7595n540eMPx6o+FfP0XXZB5TviQnwJaXrFo02rTLGXmr755S/vb8+kwhSgVwUgsHH7Y/Y3KTN3dcXduGt64qdqa5du88R9M2RPDky5qlNC1kFxBBCIsMC2A474gzjvM/kL0bu04vH7g/vn569KakIAgbwK2EWIN1uFFZYHk81fMzhRID+C8ydf/JtDdcfJSzcdOOWIUHVQGAEEilrALrr6A3fc9XXxNTguyfi7wZxIjbrUDcEt3vIEQDUIIFBiAr7v7imxkAkXgREFIjvgE0S7YMGCgdlnL/vtPY9s+YBz7gO27D+iGua7OayKvSQ7wZkyvezqm1auHD6R28vavIRAyQnY36Gq06Vpgfer6Pq0+cKYLCu7xons697Te++r7+bZyU6k97F7B+BVBApZYOL7Vltbm6quX3aNqFxkvcnHsUncOfns2tUtz7f6SAggUGACLpHwxMm8tG49UbOw4etp84Ux6TT4jjE/RGeek/LcMSHKUxQBBCIgUHvttanqRctusv3eZyxn+h3LaqG/WNTd1N3eXG3TJAQQQCArgZj6d2ZVgJVLRKD0wvRKIeREIuHXLGrsSpWVv84ONtqdhLyQu3e0U/tifWcFF7b3vhqvIlB6AtdetvwI+/sLbmcyFPzDznN/H5oplOc5Zy152M42vheuP3rcsftVHh6uDkojgEDUBfq3ef9nMeZr4Pv5nror1nc2z7A6SQggUEACvftPfY0N8D5ruEtObhueLqAJjclvrTthbm1bIV5sttVRHIleIoDAmAr093lXOXXZfj/YdHWypre95YNj2jkqRwABBBBAIKICJTHgM7Tt5p21+IHqumWLxXnvsWUbLY9NUl187ZoVu07oxqYVakWg6ATKK+Ovsk4Htz+0J7HxV3nwcJ36t8GZAvshTrvCdckdPakidnS4OiiNAAJRF6hdunRbqq+vzuLcYjl8UjkplZLVXYlEefjKqAEBBPIl4Mrd2UN1BV+8JepuHZovpOf+rd6/rD//sJxzUudqefNbznwURCBSAsFxTk1d48csqF9YzjypHOxUru5pb3p/5oVYE4HcBSgZDQFf/T5x7vFoREMUCOQuUFIDPkNMNfVLv2cnWrOcyA+GluXzWUWOqRB/cT7rpC4Eil0gOPF3Tt5gcey65aF6Xz9xwYJwt06zCsciqfrBvV//l3vdWjng5N25l6ckAgiUisC8cz/9oLjkO8RJiH1OmpaTU8sOqlqYtoTJ3AUoiUBogbUdTTPVSfAdhoN1+c49ZMdFvxmcKbAfwcVZFXdTyG7NXNfRyqd8QiJSHIEoCajTT1o8GX+fj60rdtE2Jk5bezqaagbn+YEAAgjsQ0D98pSo9u1jNV5GIPICJTngE2zVOQuX/WbAbZ4jTlYE89nnvZewC9vn9qxpTr911d4L8CoCERe4/PLL4+LktelhDnjeuvT5QpqurJJ/iKhlyfnhqb4v58IURACBkhKorr/gp6ryRQs6/AmKyiSra3lPe+sbrT4SAghMsIAn+nIRnSy7Ho94lS7UMcauqvI/VVZW8e2wtTrxGXQOi0j5AhOgO2EE+g464k67RtKTdR0qBztfv7l2zYrdziOzrocCCCCAAAIIlJCAV0Kx7hFqbX1i86Sp7jM2+vslEc33pwzKxJeGzs7OMuGBAAJyWGrLESpiFzx2YKi4H9YuWHL/jrnC+3nyGY1bRNztoXrm5PCe9qa3haqDwoUvQA8RyJNA33bva6Ia+kLrzu5UiPjX9KxqfenOeZ4QQGACBOwCpzrfvd6anmR5MHlObp1z5vmbBmcK8McpZy1+wI7Zwh0Dib503aqmowowPLqEAAITIFBbW5uSybFl1nTWn2ZWlUmen2rvaWs5wsqTEEAAgYkVoHUEikCgpAd8gu0TXNQtHyj7ol18XuxE8jroo6JvOmhgMyc6ATS55AUGJBXcu7lsCMJ53leHpgv1ud953wrdN/WC7+YIXQ0VIIBA9AWCWyn1ewNLLNJ8fbfHkRJzl1h9JAQQGAeBkZq44/OJmA3k2oCP0+HXNVXwx0ApJx3D/c1hwi7QHuh7ekIORSmCAAIRFaiZf+5TIl6jhZe0nG16mahbmW0h1kcAAQQQQKAUBUp+wCfY6KcsXtz3m0c2X6ki/2fzvuW8JCfu2TaQ9Oq8VEYlxSxQ8n3v6kqUq9OPDkHY39qTdvGjIO9dP9TH4Lm2funfxbmfBdM5Z+dOvH7l8sNzLk9BBBAoKYHaBRdsTKZkiRP5Wx4Ct+M8986e9uaOrtbW4U8X5KFeqkAAgQwFtsysmGqDH69MW/2eOXXn35s2X5CTnuhdovJArp1zTipFHLeVzBWQcghEVED7t33fQvu15WyTnUJKdXd784WJRCKebeFxXp/mEEBgggSq65f9p7qu4TDLOpgXNr5ugrpCswhMqIA3oa0XUON20JDsjyUvs5OTq/PYrZh6cnoe66MqBIpSIP74lDfYRYOD0zr/x/4t8t+0+cKd1NjqkJ2b4cVjJ4asg+IIIBAJgcyC+MPjm/9qa55nebvl0MkGjz5eMUnOtGMdjvtCa1IBAtkJDGjZR8XJ1F2l3Hd2TRfuVH+fPuZ896tQPfT03aHKUxgBBCIncOonPvWIOsn5Lgo26n0SEVQAABAASURBVHPOSw+qGr5NeOSACAgBBBBAIEICExcKJ/5p9sG7amvqG860CyM/SFscdnL22tUXHRi2EsojUMwCnvPesVv/Vf8s00S6rmw9oNCzc8k/2T7hid36n93MJE+FLxnNzoy1EShpARuY8WvqGnqcr580iFxue2LFdiW7OOI553/uuAOm8n0+u1iYQmDMBexv2fOcnLurIbfVk9jPC/3YJ+ifHadNsn3HH3b1PYcpJ8/tWd3E3Q5GomMZAiUqoKrOe3TzFRZ+rm9qmRkXaXAu7TaZVhkJAQQQQAABBHYJMOCzy2J4SsVPhLzAO1xXMKGxitnBMxmBUhToaktUOXHHpcfunKutGHC/KYas6t2gKlXp/c922s5HMt4HZFs36yOAQHQFBnTTlRbddZbzkWZ4Mfed3vblL8hHZdSBAAL7Fjju4CnH2jnFYUNrOtFKX/1vF8PxT9BHOwb6+FDfc36OyWdzLktBBBCIpMDsRGKrL9qQa3BOtaa3vWVeruUph0AhCdAXBBBAYCwEGPAZQXVO3Xk/FnWXjvBSTovU90/NqSCFEIiAQJk3fYaKpN+7Pohqug36HFkM2Tp7mDgpt+eckw0YvbBn1cW8sz5nQQoiUJoCtfWJzbop9XHbhz6dFwGVF/outuobKxPT8lIflYylAHVHQMBL6W7nAPa37NkxxaHFcPwz2EdxB4XeDE7fev2KLx0auh4qQACBSAlMLtdvW0D/sZxDcmV2frWqq/Pi6TkUpggCCCCAAAKRF2DAZ4RNbCdjbr/KGU12QvbHEV7OfpHqS69papqSfcGRSrAMgSIT8FPB7cxmFFmv89pdu2iiEo/zDte8qlIZAqUhMOf88zep773Oor3PcuhkF0jeUhWrCm4VF7ouKkAAgdEFulpbJ4m3xxteRi8Q0VecSFmsvOztEQ2PsBAYB4FoNjEjNWWTRXa75ZySL3JgeSp+ek6FKYQAAggggEDEBbyIx5dzeLPmz9+uqhfb4E8y50p2FZw8eap71q5ZphAoIQGV/7d7tO4eFXdXsWWLYbPl3JMv71rb0TQz9wooicAzBJgtGYFTFy39k6p82nKu97tPt4rZReilvR0tC9MXMo0AAvkVqCgb2N+JvDi91mI79hnsr7q77XyoLz2ObKatrCeir9uQSMSFBwIIILBT4MQFCwbEyU02m7KcdbJ9S5mIntHZ2WnPwgMBBBCIvgARIpCFgB2AZ7F2ia1aVlZ2h3Nybx7CnlTmhAu9eYCkiuISuH7l8sPtYDz9+2vuKU9WvGlOXeOrii37IotC6atUxiT2llB1UBgBBEpVwB3mTe1yvvuqiOZ0YUTSH07KnXOfWbumKfgEZvorTCOAQL4EvLLj7BjomKHqnOg3xurYZyzr7Tvw2a9xIt1DceTy7FROemr69KpcylIGAQSiK1BZ4f1ARZ/IPUL3xpmyZVbu5SmJAAIIIIBANAW80cIKvtS3t73puCD3rGk+tqurddJo60Z1+ebpP3pQPP1++Pi0QlzswPD1UAMCWQlM+MpePHbKbp1w7q5fPvHE1t2WFcmM9sV6rashTkgk5vvu9V1dXTGrh4QAAghkJRC8E7ZfJp8v4tZmVXD0lQ/1Utq5vrNz8uir8AoCCOQq4Kv/vvSyfiq1Jn2+WKZra2tTqt5PrL85DzbbBd1jpNI93+ogIYAAAsMC7/zY0id88a8cXpDDhKZc3r57OYfmC60I/UEAAQQQQGBQYNQBH6exHif62yCLLz+seHhgt1sSDJaO+I/a2mtTdoH22vBhunJfHV8oGB6SGopIIJFIxNXJe9K67Nv0r2x50p6LLg0cdtgmu9C6IUzHVd1J8uQ/eYdrGETKIlDCArX19Ztjnv9pUflLdgyjrK3y0lRq023XNDVNGWUNFiOAQA4Cwff32EnWabuKun9UxFJ/2jVfXFOpgf4fWY83W841xUX8JbkWphwCCERXwEtVrhYnIc4P3Yt621r4lE90f0WIDAEEEEAgawEROxfJoVQJFXk0PvUXKvJQyJDjzgkXU0IiUry4BF5+0LTn2EXJF6X1OhnX2G1p80U1GbzDVVR/IqI5v8NVVF7o9bmjhQcCCCCQo8Dss8/7mzh3jhV/2nI+0qumTdHzbDCeY8J8aFIHAiZQVpma52TXsb9T/eXWGX1b7KWiTMlDtv/ZOv4vyzkn9eXUtasv4o4HOQvmqSDVIFBgAnPOOed/dlXqp2G65au8h7sohBGkLAIIIIBA1AQ4ud/HFl2wYMGAL3LrPlbjZQQQeKaA84+yRc+xPJhs4PTX76lb+s/BmSL9YQO3d6q43C/YOCmPxcoWFWL49AkBBIpHoLqu8Xb13QLrcZ/lsClu++fzXn7w5NeGrYjyCCCwQ8ATrdkxNfjTjzn5WW1ton9wrgh/BH13zq0O1XWVKRqrSP9ex1DVURgBBKIjEJxjhYlG1b122tMPcEeVMIiULTkBAkYAgWgLeBmGV+bHvZK9DZETCXUbpwyNWQ2BSAmkPPcOCyhueTClfHfZ4EQR/3hq0uY/2v7ggTAhqMq8rs6LOSEJg0hZBBCQymmy3jn9Rj4obL9W6Zx3Q09by+vyUR91FLUAnQ8p0Ltq+bPsb+p5Q9XYdCrl/OCWaEOLivK5Kj7tOnES6pOFKu5tnZ2dZUUJQKcRQGDMBJxqcFeVMG+qe+FAyp85Zh2kYgQQQAABBIpMIMMBHy3znDetyGLLX3fV/Sp/lRVrTfQbgewEPNX3DZVQkSf3f/GW64bmi/V5/vzEdl9dZ8j+Ty9Lxk8JWQfFEUCgxAVOPqNxSzy+abHtX+/NE8V+om7F+s7mGXmqj2oQKEkBF9Pn2t/lc4eCV5X7qx/d+ruh+WJ9fvuCBRttH3FTmP47516x/7YnDw1TB2URQGC8BMavHfVSf3ZONoZocf9kUt4dojxFEUAAAQQQiJRAhgM+kYo562DUc9us0CbLJAQQyECgt+OS14uTw4dW9UU2zJqVSA7NF/VzatI37UJO7u9AC4JXOTmRSAx/+ilYREagaAToaMEIzF6Q2CqpirdYh/5hOR/pVamkXtTVlijZT3XnA5E6Sl3Ae6MTSf/uzjZNJOxQqPhdnPNutWOgnI/nVPTosorY0cUvQQQIIJBPgZoF5/1DVP4tIR6qbk6I4hRFAAEEEBhNgOVFKZDRgI+K81SlrCgjzEOnY+IPqAgDPnmwpIrSEHBOz0yL1FfRH6TNF/Xk3EWLHncit4UJQp284tiDpx0cpg7KIoAAAoHAqYsWPejUP9+mU5bDJ5WPlsmUBgalhQcCuQqcllawb/PA5q+kzRf1pKf+ry2Ahy0Pphx+VKgvw58Az6E8RRBAIKICdn71nVChqb6668rWA0LVQWEEEEAAAQQiIpDRgI/9861MOndQRGKegDB0a0z0fxPQME0iMO4C6zubZ4joLBl6qDwlTn4jEXr4zt1k+8Xc362r7pgKST4nQiSEggACEySgqq5m4XnXq3gJEem3HDK5mNW5+PhDpgbfwxayLoojUFoCPWuaj7WIX255R1L58QcXJ0J9782OigrjZ9/22N/s+Oe+UL1RPW3DVYnKUHVQGAEEoifQN7De9i+5n185Ka/cLm+MHkxRREQnEUAAAQQKTMDLtD+eU27vkSnWHuu5lOy4Ldwer7AAgagJJAf0ZRbTrndXOXli0lT/t7YsMsk59ysVeST3gLTSiTcv9/KURAABBHYXOCw2Zbk4F7w71t/9lZzm9ncp1762o+klOZUeLsQEAiUm4Lv5aRH74ustafNFP1m7dOk2UQn7nYwHbtw6mVsvFf1vAwEgkF+BmnM/+W8VvTdMrb6m+B6fMICURQABBBCIjEDGAz4ak8PyFnWJVWQHLtuTSf/xEgubcEtVQN0JFvo0yzuSyvqTz2gM9503O2oqmJ/lZdP/oiL/CdUhJx/glkmhBCmMAAJpAicuWDAg4l1oi/5mOXRSlWd7Tr/dtfIiPuEdWpMKSkFgfSIxWUSrZedDRTeL6j07ZyPzpH3xb1kw4W4hqV5wDJTxeai1Ryp2AfqPQAYCzvnfz2C10VdRPa57xYr9Rl+BVxBAAAEEECgNgYwPtF3KHV4aJGMRpdusMjnc7Q/GolvUicDYCLxtt2qT3lW7zUdgZvaCBVudc70hQ5l5/CFT3hWyjqIvTgAIIJA/ger6Zf9xIh9QkYfyVOuLyuJln89TXVSDQKQF3Mypx9nf3/AnnH3nnvQ19buoBT1nyZLgO3xuChOXOb34JTOncWvbMIiURSCCAp56wfekDuQamnPu6FjZwNG5lqccAgiMvQAtIIDA+AhkPOAjKs8bny4VXivqvArr1YGWc0rO6eNzFy3iEz456VGo2ARUJX3A5xfV5yz9fbHFkEl/Y17s6kzW29s66utH9vY6ryGAAALZCtTUNfwq5buzRdz2bMuOsH5MRReUPVq1cITXWIRAPgWKvi7f+S9TkeEBHzseunnuwsYQt38tXBKn+rUwvTOnw8rVBd93FKYayiKAQMQEUs4LPqX8v1zDUtWDfI1xO9pcASmHAAIIIBAZgYwHfOzA/Jiurq7yyESeRSBJ35vmRIJBnyxK7VrVeXLDrjmmshNg7WIS6G5vPsf6a7sL+7kj3brjKXo/Zy9c+l9xEu62AyIvXdd58ZHR0yEiBBCYSIH9p2y5VUVX5akPnqpcKqp80lt4ILAXAfXemv6q8zTsd92kV1dQ03FN/U5V7w/RqQrf998eojxFEUAgggL7T974LxX5U6jQ1NWGKk9hBBBAAAEEIiCQ8YCPDXhMKX/kvpdHIOasQ1BxL8i6UFoBQ16XNsskApEVUJFPDAfnZItTt2F4PoITvkio29U50cNSqfiLI0hDSAjkX4AaMxaYNT+xfeMWF9yK7faMC+17xbJ9r8IaCJSwgHPDAxh2PPSf/V6w6YeR1dCt/3W+H/KirNZE1ofAEEAgJ4FZdvzii34vp8I7CzmRd/RecenBO2d5QgABBBAoVgH6HUrAxiIyL6+elOS7JZzoazJX2mPNv85ZuOw3eyxlAQIRE+htbwruXZ/+aZV/euX+XyMW5m7h+L78yhY8aDnH5CaLkzcLDwQQQCDPAmc0Nm5JxWJnWLXhLspaBSQEENi7QM+a5tNEZfiLwp24786alUhKRB+zFyS2Wrx3hAzviJ72pvTbAGdcHSsigEB0Bfy+7d+16Pos55RswL3MHxj4aE6FKYQAAggggEBEBLIa8LGBj//XlUiU3G3d7KDhdSG29zdDlKUoAkUj4MR7o/2txIY77Mm90/6z7ZHh+bGfGPcWfG/SA07lD2EatoH0eWHKUxYBBBAYTWDux5c8ZBdll472OssRQCA/AurLrk84i/Tb8VDYwZD8dGwMa1EXuz4P1S/LQx1UgQACERKYd+6nHxQbNA8Tkop+8KaVK6eFqYOyRSFAJxFAAAEERhHIcsBHZlQcPLWkbj+0dvVFB5rdCZazTirytDjN5+1Usu4DBRAYD4Gz9rhQAAAQAElEQVSuwYFgPxgYHd6nOJF1sxLRfXdr4FpbX7/Z891Pgumcs5Pnrl3d9Nqcy1MQAQQQGEVAVV31woZbnXMfs1VyfreslS2yRHcRGD+BdVc0HWXHPK8aatGm/yMudu/QfFSf59Qv/buK/DxcfPqqrkv5LsNwhpRGIHoCftJrFSdbQkR2xPbY9uDcNEQVFEUAAQQQQKB4BYYvzmYSgh3Ux33fvcUuHNhkJiUKbJ1cuuNVvCWXYkEZO+H705T4wB+DaTICURaYPLNiiku79aHtILZXDJT3RjnmodhcTK8dms712VNpzLUs5RBAAIF9CQzc8curReUrIpoSHgggkFcBf0De7ETiw5U694fD4lPuG56P8oQnTaHCU6kqL4+9IVQdFEZgbwK8VpQCsSnJf9p+9achOl/lib41RHmKIoAAAgggUNQCXpa9V7sw+dZrV6yozLJc0a7uqZuda+ed6HffvuCCjbmWpxwCxSKQjE16vg3yHD3UX1/kplMWL356aD7Kz9VnN/xJnPw+VIwqJ3W1XXJIqDoonJUAKyNQSgK1116b8sV9XsT9o5TiJlYExlqgq6srZscAr7ZjoOFzKjtZ+uGJCxYMjHXbhVB/Kln5Q4v/4Zz74qTcOXltIpEY9su5LgoigEBkBOacef4mUXdTiIBUPP0o+xbhgQACOwV4QqDUBLI+uLZBjDdWTHIvLAWo669Yfrj48oocY/3rgKu8MseyFEOgqATUT6bfuz64sPjVogogZGfVk+XhqtCqCo29MVwdlEYAAQRGF5i7sPGRfkmd6kT+OfpavIJAyQmEC/jJf1aJavptWftTKVkbrtLiKV3p+5tV9c4wPbbybz9W0j4hFaYyyiKAQGQE4jH9hgXzH8u5JScHHH9w1Xm5FaYUAggggAACxS3gZd99V+V8f0n25YqvRLw/foyoHJN1zzX4sla3NPh+j6zLUqBABOhGpgLrE4nJzsnpu9bXf8VT/m92zZfAVF9f8F1dj4WItMIX/zUldbvMEFgURQCB3ARq686/V51bYoM+m3OrgVIIIJAu4G33Ztr8SyzvSE5vn7eooTRu52YRn7J4cfDdYMH3+NhuxRbklo6JzZi8yzC3OiiFAAIRE5i9oOEx56fmhwrLyad7L7304MzqYC0EEEAAAQSiI5DDgI8Fr3pGd0fTm20q0smp1FuA5ZazSurke1Lh35lVIVZGoEgFUgdPO9m6PnzvehX5y8btXkndyvCJ6QNBvD82hxBJ3/Gryy8fdgxREUURQCCfAhGr655Ht9zsObciYmERDgITIuCVxc60hofPp3wn19t8SSWX0ttstCcZImgvFotdGKI8RRFAIKICAzOPusNCW69qV1hsIoc02S8bOJ031eUgRxEESkjglitbD1jb0fSSodxl8yUUPqE+UyAi88MnKNnGo04/cWtT05RsyxXL+uvaW98k4k7Nqb/qXzx439mcClMIgeIR6Orqiqnz56T32HnywzMaG7emL4v69Pz5iT7bX4R6h6vtjF94v//0C6JuRXwIIDCxAolEIjlt8paLrBdXWSYhgECOAhuuuqrSE7cgrfiDcedvSJsvicnpjz/9Z3Xy1zDBqnOn2EWW4NNSYaoZ87I0gAAC4ytQW1ubSonrdM7flmPLnnreh7+56vNTcyxPMQQQKAGBbX3JUz3Rm4dy2YD/7hIImxAjLuBlGJ+vovfvvq575/Yp3im7L4vG3PrOxGRf/IstmjLLGScnMuCLO2/OwvN+knEhVkSgiAWqNj90gP3evyg9hGS/fN/mbbH9LI0UROm8mLvNJnJ+h6uBxT3RC6wOEgIIIDCmArPmJ7bH1PuM7Xd+NaYNUTkCERZ4avtjr7Hw9rM8mJzo791WP8ztXQfrKbYfs2wQ2akLzpty7roTqVCJ5nml8EAAgVAC8+oab1SRb+dciXMnVsWnfijn8hREYE8BlkRMQDU2RZwcPpzFr4pYiIRTggJehjH3OfUvUid/2bW+VjqV5rVtK3a72Lvr9eKdSg5MeY/1/mWWs0jq1ElXcsazW7MoxKoIFLXAwHb/UAtg+FMpKu7+/0nZn2xZyaXtD279gwX9L8u5J+dq1q6+6MDcK6AkAgggkJnA7IVL/6vin2tr5/quWStK2l2AuVISUOft9u5PFffb32zbtqWUDIZi3bRFum36Ccs5J3XupM7OzqzebJdzYxREAIGiEuiLpZZZh39hOadk++dE98pLnptTYQohgAACCCBQhAIZDvioDWZ4D/rx8mAgZONwnM4dGVP/q12trQcMLyvyCYtlknreZy2MSZazSO6+mOedH3zseI9CLEAgogK+JIPbHk4fCs8XbV68eHHf0HwpPdcmEv2qrjlczDrZ88pODlcHpRFAAIHMBKrrzvuRxtzptna/ZRICCGQosHb16gNF3OvSV1dPbkgkEn76slKZPqOxcYtTuTVkvK/eP7nRXEPWQnEECkGAPuRVoHbBBRt9Jw1OJKeBZSs3Q8tiF3Z1Jcrz2jEqQwCBaAj4fiwagRAFArsEMhzwcQO++k9Xf/ycf9o/2uAj+wNDVThxJ5SXp5qvSiQqh5YV6/M3ViamlVf4V9kJ3IuzjOFe38VOCd4tm2U5VkegqAVU9P1pAWyykeHvps2X3GSfl+qyoHcNittMtslM33HTypUV2ZZj/eIQoJcIFJrAQzLte9anyyzb9RD7SUIAgX0KlMe2BZ9wfuHQiiryUN9W766h+VJ8jjm5Q0RyvrWtqDyvUr2XWx0kBBBAYA+B5B2/+JldkU3YCzm+ScWdGn908lusPAkBBBDYXUBl+K41u78Qfo4aEJgogQwHfGTAS/qbVdWVPbp5pTr307QOl4mnH9n/oCm9xXyR0jmnU2NVZ9nJRvBO17Tw9jn5mKp/5tz6c/+8zzVZAYEICfS0X/JGGxxNv6Xj7x/1pj0ZoRCzDiV495kTd3vWBdMK2BXXk1JlyRlpi5hEAAEExkxgwYIFA5O2uM+Lk1+PWSNUjEDEBJK+904L6QDLg8mprK1dujSb2yMOlovSj6SXDG63lNO77wcdnJSnVILbTA7O8gMBBBBIF6i99trU7IXLVqtoS/ryjKedHOB53hVdbW18N0fGaKyIQGkIqAr7hdLY1CUVZaYDPsMosxOJrX19sXc5J8EXlNu1ycGX7P+u99aB+MCVazuaZg4uKbIfPR0tc+xk7XPW7cxNgu808vTDcxae9xMrR0IgDwLFUcWGDRviorGzn9Hb3zz44IOpZywruVlVudOC9i3nmo5Kqft/uRamHAKlJKDi9k+P14kekz7PdGYCJzc2bkmlUtW29j2WSQggsBeB9Z2dk53nPp6+ip0XfTV9vhSnN1Zsv9fi/p/lnJM6eXtvW8usnCugIAIlIvDM459cwu7taCm6T9SpqpvmKi8S51bmErM4ObxMtl3evWLFfjmVH5NCVIpAwQgcWDA9GeeO2Dnk88e5SZpDYMwFMh/cSOvK4DvYvIGPq0jahQEXc+I+oL7+srttxfFSRI/utub/Z7FcY12eajnT9DuJybzqs5fdlGkB1kMgKgJP/emul9iBdvoJubOLHf9KJBJhBjoiweOc3m+B9FnOPfn+53vbl/Ox4twFKVkCAl1dXXbcIUc8I9T9I3N/9mcENtaz8xaf/4AT+ZS1s9EyCQEERhFIpjadaQMTw4PLdg7RF49NLflP+s+fn9iuKqEdnLrPdHVePPz9kKNsBhYjULICoxz/ZO2Rcu64rAsVQIFZ9fWbY/Etn7SuXGQ562T7qdN0kv+xrAtSAIEIC9za1DTFzgMOi3CIo4bWfdWK/Sz2ovzgwqhB8UJxCuS516MO+FQvbHhRdV2D7swHzTnn/LvT265Z+Ml/e+rNtpOcn9vylOUgqao8W73ULT1tLWcEfzjBwkLN19hOzfq5QFUvtz5mOtgT3DP2di8Wn119dsOfrBwJgZITUNGzLOjg/vX2JGL/IJOeuocHZ0r8R9yLPSwqIW/ropOdxFavb27m1m4l/vtE+KMLxB+/70Db+Tx7tzWcPCf+SHmm/893K8qMSE1dw822/wq+qzE41oEEAQSeIdDd8eXnqLhPpC+2Y6CHtu3/YDJ9WalOO+d+m4fYX1+eLAuOM/NQVTSqIAoE0gVGPP5JXyHDaU/0HRmuWnCrzV6Q2No/48jP23HgCjtuyfaYpUx89389bZecwZuECm7T0qEJEthaJe+eoKYnvtmtA3Zsxy3dJn5D0IN8C3hhKpy9cOl/bdDnNPtH271bPU4OFnWX6zb/271rWk/c7bUCmelqu+SQ6VO0TdRvtcvVGd2v0U7ofCcusTlZPu/UBUuCd/EXSDR0A4HxE+htbz5bVOent6gicad6UPqyUp1OJpNH2D5xSh7if7M/WVatTyQmj1IXixEoaQHPxY6zfdGLd0NQOS6mFcfttoyZrASmP7y52fZhbVkVYmUESkXAL/uciD5Hdn8csuVP4u2+qFTn9PV5iLxcVT7f29F8XmdnZ1ke6qMKBCIlMOLxT04RunesXd1StLcxqq2t7e+XSZ91vquz8B+znE2qENWOssem1NlAtWZTkHURmECBMWm6q7V1kuf0nDGpvAgqVY293nYCBxRBV+kiAlkJhD45CQZ9qusbTncql1nLmywPpQoR907n+3eubW/+UteqpqNcIhG6vaHKc33ecFWisrvtkuPLPe82G8D5sIhmcDFVU6Lye8/zXl1T1/jlDy5e/LTwQKDEBLpXrNivu61pkf0trLDQJ1lOT2oXCE8NBlLTF5bSdHCyEHyHmXoSDIbZ/i909HHbR73Pn1n103XtLa9Z38nAT2hRKoiEQFfX6bEdFyj8Ky2gZ+6LJjnxv9Lb1vq8rq6umL1OylJgViKR1IH4chX5cZZFWX3CBGh4rAWuX9387O72lq/bQMRHrK1n7lsq9p855QvrOzszOKew0hFMwTleT3vT2yy011kOnZy4yc7Jlw72N13a09ZyxN0M/IQ2pYLiF+ja+/FPLgEe6Hmu8Yb2L+/2fYi5VDRRZWrr6zfX1Dd+RX2ZZ30I7r7i23OGSSer6AobXF6+vrN5hp13aYYFWQ2ByAjctHJlRUWlW2j/d18VmaCyCOTGtksOEXWL7O8/nkUxVkWgKATyNgCz38ObG1T0TIv6PsvpaZI18slyT7+/7qCpl/V2rHh9YoIGfoK2n9425QpPvB/bxemXpHdytGkV+a8T/zOpgdQpc85euttt7UYrUzDL6QgCeRDo6Wx9aW9701Kp8HtUtdlOwCtHqfbNZaI39rQ1193Q3nr0KOtEcnHPmuZjeztaz1On3xPRd0oeH07kZb64W5L+1G91tzV/oru9+QS7kF2exyaoCoGiEAjefbau7dJXVjz+mgs9dbdYp3e/nZstGEyqR4n6N5c/ft/ne9oveWNXWyKjT/EOluXHoMCcJUseTiV1kR0DPTS4gB8IlKBAcKufdR1Nb7Hjmi/HVG5RcR8YnUEbU/6mr/W0u5pndQAAEABJREFUNc0OLhyOvl60XrFzuvja9tY3Bed4Inq1iOTzC5/jdr5WJ+p+9p/kpjU97U3vD44vrU07tbSWSAiUiMDQ8U/ZY6/64l6PfwKP7LLa6vNTUt7d09G0eG1HU0bXR6xMwaU5ixrujKn3DnXuS9a5xy1nkWz/nXQ397Y1L/zGypXTsijIqggUrcDajo6Za9ua5/bF+q5xzn1BREvq+sLdnZ1lPW0t7x1Q7/t2rPFC4YFABAXydsA8K5FIzqlbdm11XUNwm4Pv2kXKgTQvFZWjXDBy6lI/Pn7mlJ/2rG45JTh4Cd4RlrZevid1w4ZEvHvlyuf2tDd3O2vbiX7Qqez7dktOkipys6RSrwo+1RN8mXG+O0d9CEykwPqO1sO62y55R5B7OppPDg707ULF/w3m9uav2vNddnK9TVL+7+zvpsUudLzJ+rvXT66o6ivsb70tKf4/rOwTPe0tN1s9g3V2dzQvC9oKsg0gFdUtl4J37Qb9DnJPW/NpQzFZfLf2tDc/Kb78UcRdbPuMl5nRWKTpdgIzR1UutTbuLn/s/s3W7t097S3fGepLd1vTmd07t2fvquXPEh4IpAkU+mRwPNBzedPbhn6Hu+33efh3u735attn/Li80t/qa/KXdlKSsP3MUXuLyYk8T5x+WsS7s1yrNtn+6E7L3xyus63lI91Dfy+dLbM2XHVV5d7qK8XX5i5e9tuUeO+z2LdbJiEQKYHrVre+eHgf0N5yavfqS744vH9ob7qut735L+WPVfX5Tr8vKhdYDi4G6F4RnJwmqutSKXm0p73593ZsdW1QZ3d78xfXtjd/eKi92zovnr7XegrsxbWrVx841PfejpazgpjsWKjVYvzZ8TOrBjzx73B2jmfdPszyWKTD7PjnoyL6zeD48viDqp62/fkGa3/1jr40/d/aNZe8c7iPy5fzPW7Co1gE9jj+aW/65NDvdXdb03ftd334+EdFPyl2TSXPscWcuDfZMdNlntPf29/V07bv+mlPR8tlQ/2wc8QF3TuPmYJ9Z57bz1t1wZ1n5tQ3ftbXKcfaeetPrOKk5cyS6olm21YV73+gp73lm7bfPmcw5vbmEzKrgLUQKByBWzpXHDr4+2t/tz1rmmbb/+7PDf092+/2TXZe9YjntjzsqVyvqrX2u7/v66OZhTdjqN1Ce75+dVNNd1vLZ9a2NTVZ/Dc/kNrUL+q+Y2EdazmSiaAQyNuATzplebL8w87J+1RswETcCBcK9NXiuRvt4s0fe2dOvaq3rWnR9W3LZ63taJqZXk+u0zsuZLe+o6e99TMb/1T1fS/e/0erq9pyJulpW+nKlJO3zqlrOGXOOef/z+ZJCEROIOX8d6l6twZZnNwiTi8TtQukQRaZL8GBr2iIi6C6vw2CvNPq+XSQ1Umz7mzPiZ2wFJHogG4+fKjvonKt6JCTC77sdL8JCKXM2rQTEPfeob6o6pU65OtpcFsVW4WEQHEIeJVyqCT1xqHf4eD3WXb+ndmxxIdtnxHyeyH0jSL6/uE61V2lQ38vKXfdpv6H83L8IRF7HBmb8lOnelHEwiIcBCSmqXOH9wHietXzLpThfY7OcyIvCMn0EnGDA0Cftn3YhXbCdbXu3Oc8nSp7Uci6wxTPuqzq1hOG+m4D7pfLoJOcaxW9xvL4JxW7MKVvtobrZbAv+mnP927Wnb4y1dvrGwKsHAmBghHY4/hH7H/uzt9rOxaqFdGQxz+S7WOq7bteK84tlp39EKdrdOffV5nngr/9bOsc1/XnLlz4yGGxabPUk1NEtdMav88sbbduU/tOU+389f0qslKDmMVdvO8irIFAYQls81NvG/z9td9h8XWd/e9OyM6/Z/vdfpcTPWiMejx8vKDWdiHlmKdrVd0XPNUGi/+dYxQ/1SJQUAJ2/pH//pyyeHHf3PqGtX0zvHniWRZ3zyit2AG5O8OpXhrT2HrP6R972pvv7ulobu1e1fTB69qbjtuQSMRlH4+etv87Yt3lrW/qaW9q6m5v/mXS+b+zP+ZuEd92bHKSE9nrpxJ2Vt8nnnxBy+LPPzw2tW7eooY7dy7nCYESECBEBBBAAAEEdhc4ccGCgYEDNy13Krft/gpzCCCAAAIIIIBAYQoExy9zzm64rf/AI+r7t3uvsGtDH3DifmS9TVkmDQrwAwEEEEAgygJjMuAzBFZbu3Rb9dnLbipPVrzGqXuvLb/R8oOWbQzGfu5KMZucYnmG5RPEybka06/HRX+7cWbVgA3k9Fn+0x65rfmfNkDkRCvv95P+HSLaYCPWr7R8gIgLvjjVJmXEh70QfMT33zba3Wvt1ft+5WHVZzd8bs5ZSx4ODhBGLMRCBBBAAAEEEEAgygLPiK22NtE/4CVPF5WfPeMlZhFAAAEEEEAAgYIVqK2tTdUuXfrEqWc3fLumrvGk/pQ7xqmcYdeCLhfR74nIb+z45gF73ig2KmTPJAQQQAABBCIhkPGAT5hog0/81Cxs7Hpy0ubTkil5i9X1cXHyMyeS/j0/tni0pOUi+qI9sspRku3DycP2D/5rIjrPxfy37Td5y/uq6xva5y5alOWX+wkPBIpawFe3LiX62onISc//bDHh7V92wP0T4ZRrm/2p5M3F5EtfEZicjP83pt4bc/2dD1NOvdTJ8b7JD7MVRheoXXDBRs+Lv09i7jWBtaS8D4++Nq8gUPgCKY1dFPwuT0h2lX8ofKFdPayK+7+YEKccj1G92LS/7+o9U2EEKDv2AhN5/JPL33UsuOXc2LOMWQu15zT+q2Zhw9fn1DUsmFTlz031xd7tx/StKu4k8fzh82LPyftFvJN85y8es85QMQJjJBD35OZc/r4ps+vamNdXvnaMNg/VIjBuAuMy4DMUzfz5ie2nndPwl+q6hittkOV16vS5zskSHfyuH/2ziATflxN8h45NhkrBp3c2iej9IvInJ+6HovJJsX/a5anyZ9s/+I/MqVu2rmbBef+YZX2ydUgIlJzA3IWNj8yrW/bzicinnX3e34oJfNb8+dsnwinXNmsXf+rRMfSlagTyLnDK4sV9sxcu/WWuv/Nhys05+/y7g/bzHlTEKjx1wZL7qxc0/iKwrj5n6e8jFh7hlJjAaXVL/xn8Lk9Erq2v31xM3G+3Ad+JcMq1zdkLFmwtJl/6WtoCwfHHRB3/5PI39h7bd0Zli518RuOWeeee++Dcjy/765y6xt8NHeMELqfWN3y7um7pj+bWnx9co4pKyMRRIgKzFzQ8Fvwe5zFPyDWjiez/nCVLeDNgify9RDnMcR3weSZkdf2y/9TUN1w2p67hlH6Xeovv6Sm+uhon+iGn7rM2SNNugzXXW7nbRZz9sx0hq/5k5zrfdc590YksFnW1ztca3yXfWZ4sf3NNXeObqxc2XBz80z7FLipZfSQEEEAAAQQQQAABBBDIWYCCCCCAAAIIIIAAAggggAAChSYwoQM+6Ri19ec9NPfsZb+du7DxBzV1y75Rs7DxizZIU2+DNadV1zW8vbqu8dgR88Jlb9i5zvtq6hs/W1PXsKp6YWN3zaJl359bf/6fbYCHd7qnQ4/HNG0ggAACCCCAAAIIIIAAAggggED0BYgQAQQQQAABBApKoGAGfApKhc4ggAACCCCAQGgBKkAAAQQQQAABBBBAAAEEEEAAgegLEGHhCDDgUzjbgp4ggAACCCCAAAIIIIAAAlETIB4EEEAAAQQQQAABBBAYJwEGfMYJmmYQQGAkAZYhgAACCCCAAAIIIIAAAggggED0BYgQAQQQQGA8BBjwGQ9l2kAAAQQQQAABBBAYXYBXEEAAAQQQQAABBBBAAAEEEEAgtEDBD/iEjpAKEEAAAQQQQAABBBBAAAEEEECg4AXoIAIIIIAAAggggEA4AQZ8wvlRGgEEEEBgfARoBQEEEEAAAQQQQAABBBBAAAEEoi9AhAggEEKAAZ8QeBRFAAEEEEAAAQQQQACB8RSgLQQQQAABBBBAAAEEEEAAgdEEGPAZTYblxSdAjxFAAAEEEEAAAQQQQAABBBBAIPoCRIgAAggggAACIwow4DMiCwsRQAABBBBAoFgF6DcCCCCAAAIIIIAAAggggAACCERfgAj3FGDAZ08TliCAAAIIIIAAAggggAACCBS3AL1HAAEEEEAAAQQQQKDkBBjwKblNTsAIICCCAQIIIIAAAggggAACCCCAAAIIRF+ACBFAAIHSEmDAp7S2N9EigAACCCCAAAIIDAnwjAACCCCAAAIIIIAAAggggECEBBjwGWVjshgBBBBAAAEEEEAAAQQQQAABBKIvQIQIIIAAAggggEBUBBjwicqWJA4EEEAAgbEQoE4EEEAAAQQQQAABBBBAAAEEEIi+ABEiEAkBBnwisRkJAgEEEEAAAQQQQAABBMZOgJoRQAABBBBAAAEEEEAAgcIXYMCn8LcRPSx0AfqHAAIIIIAAAggggAACCCCAAALRFyBCBBBAAAEEClyAAZ8C30B0DwEEEEAAAQSKQ4BeIoAAAggggAACCCCAAAIIIIBA9AUKOUIGfAp569A3BBBAAAEEEEAAAQQQQACBYhKgrwgggAACCCCAAAIITJgAAz4TRk/DCCBQegJEjAACCCCAAAIIIIAAAggggAAC0RcgQgQQQGBiBBjwmRh3WkUAAQQQQAABBBAoVQHiRgABBBBAAAEEEEAAAQQQQGAMBBjwGQPUMFVSFgEEEEAAAQQQQAABBBBAAAEEoi9AhAgggAACCCCAQL4FGPDJtyj1IYAAAgggEF6AGhBAAAEEEEAAAQQQQAABBBBAIPoCRIhAXgUY8MkrJ5UhgAACCCCAAAIIIIAAAvkSoB4EEEAAAQQQQAABBBBAIHMBBnwyt2JNBApLgN4ggAACCCCAAAIIIIAAAggggED0BYgQAQQQQACBDAUY8MkQitUQQAABBBBAAIFCFKBPCCCAAAIIIIAAAggggAACCCAQfYFMImTAJxMl1kEAAQQQQAABBBBAAAEEEECgcAXoGQIIIIAAAggggAACwoAPvwQIIIBA5AUIEAEEEEAAAQQQQAABBBBAAAEEoi9AhAggUOoCDPiU+m8A8SOAAAIIIIAAAgiUhgBRIoAAAggggAACCCCAAAIIRFqAAZ9Ib97Mg2NNBBBAAAEEEEAAAQQQQAABBBCIvgARIoAAAggggEB0BRjwie62JTIEEEAAAQSyFWB9BBBAAAEEEEAAAQQQQAABBBCIvgARRlSAAZ+IbljCQgABBBBAAAEEEEAAAQRyE6AUAggggAACCCCAAAIIFKMAAz7FuNXoMwITKUDbCCCAAAIIIIAAAggggAACCCAQfQEiRAABBBAoOgEGfIpuk9FhBBBAAAEEEEBg4gXoAQIIIIAAAggggAACCCCAAAIIFJbAWAz4FFaE9AYBBBBAAAEEEEAAAQQQQAABBMZCgDoRQAABBBBAAAEECkiAAZ8C2hh0BQEEEIiWANEggAACCCCAAAIIIIAAAggggED0BYgQAQQKRRY0fN4AABAASURBVIABn0LZEvQDAQQQQAABBBBAAIEoChATAggggAACCCCAAAIIIIDAuAgw4DMuzDQymgDLEUAAAQQQQAABBBBAAAEEEEAg+gJEiAACCCCAAAJjL8CAz9gb0wICCCCAAAII7F2AVxFAAAEEEEAAAQQQQAABBBBAIPoCRDjGAgz4jDEw1SOAAAIIIIAAAggggAACCGQiwDoIIIAAAggggAACCCAQRoABnzB6lEUAgfEToCUEEEAAAQQQQAABBBBAAAEEEIi+ABEigAACCOQswIBPznQURAABBBBAAAEEEBhvAdpDAAEEEEAAAQQQQAABBBBAAIGRBaI04DNyhCxFAAEEEEAAAQQQQAABBBBAAIEoCRALAggggAACCCCAwAgCDPiMgMIiBBBAAIFiFqDvCCCAAAIIIIAAAggggAACCCAQfQEiRACBZwow4PNMEeYRQAABBBBAAAEEEECg+AWIAAEEEEAAAQQQQAABBBAoMQEGfEpsgxPuDgF+IoAAAggggAACCCCAAAIIIIBA9AWIEAEEEEAAgVISYMCnlLY2sSKAAAIIIIBAugDTCCCAAAIIIIAAAggggAACCCAQfYGSiZABn5LZ1ASKAAIIIIAAAggggAACCCCwpwBLEEAAAQQQQAABBBCIhgADPtHYjkSBAAJjJUC9CCCAAAIIIIAAAggggAACCCAQfQEiRAABBCIgwIBPBDYiISCAAAIIIIAAAgiMrQC1I4AAAggggAACCCCAAAIIIFDoAgz4hN9C1IAAAggggAACCCCAAAIIIIAAAtEXIEIEEEAAAQQQQKCgBRjwKejNQ+cQQAABBIpHgJ4igAACCCCAAAIIIIAAAggggED0BYgQgcIVYMCncLcNPUMAAQQQQAABBBBAAIFiE6C/CCCAAAIIIIAAAggggMAECTDgM0HwNFuaAkSNAAIIIIAAAggggAACCCCAAALRFyBCBBBAAAEEJkKAAZ+JUKdNBBBAAAEEEChlAWJHAAEEEEAAAQQQQAABBBBAAIHoC4x7hAz4jDs5DSKAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAAC+RVgwCe/ntSGAAII5EeAWhBAAAEEEEAAAQQQQAABBBBAIPoCRIgAAgjkUYABnzxiUhUCCCCAAAIIIIAAAvkUoC4EEEAAAQQQQAABBBBAAAEEMhVgwCdTqcJbjx4hgAACCCCAAAIIIIAAAggggED0BYgQAQQQQAABBBDISIABn4yYWAkBBBBAAIFCFaBfCCCAAAIIIIAAAggggAACCCAQfQEiRGDfAgz47NuINRBAAAEEEEAAAQQQQACBwhagdwgggAACCCCAAAIIIFDyAgz4lPyvAAClIECMCCCAAAIIIIAAAggggAACCCAQfQEiRAABBBAobQEGfEp7+xM9AggggAACCJSOAJEigAACCCCAAAIIIIAAAggggECEBXYO+EQ4QkJDAAEEEEAAAQQQQAABBBBAAIGdAjwhgAACCCCAAAIIRFWAAZ+oblniQgABBHIRoAwCCCCAAAIIIIAAAggggAACCERfgAgRQCCSAgz4RHKzEhQCCCCAAAIIIIAAArkLUBIBBBBAAAEEEEAAAQQQQKD4BBjwKb5tNtE9pn0EEEAAAQQQQAABBBBAAAEEEIi+ABEigAACCCCAQJEJMOBTZBuM7iKAAAIIIFAYAvQCAQQQQAABBBBAAAEEEEAAAQSiL0CExSTAgE8xbS36igACCCCAAAIIIIAAAggUkgB9QQABBBBAAAEEEEAAgYIRYMCnYDYFHUEgegJEhAACCCCAAAIIIIAAAggggAAC0RcgQgQQQACBwhBgwKcwtgO9QAABBBBAAAEEoipAXAgggAACCCCAAAIIIIAAAgggMA4CEzzgMw4R0gQCCCCAAAIIIIAAAggggAACCEywAM0jgAACCCCAAAIIjLUAAz5jLUz9CCCAAAL7FmANBBBAAAEEEEAAAQQQQAABBBCIvgARIoDAmAow4DOmvFSOAAIIIIAAAggggAACmQqwHgIIIIAAAggggAACCCCAQO4CDPjkbkfJ8RWgNQQQQAABBBBAAAEEEEAAAQQQiL4AESKAAAIIIIBAjgIM+OQIRzEEEEAAAQQQmAgB2kQAAQQQQAABBBBAAAEEEEAAgegLEGEuAgz45KJGGQQQQAABBBBAAAEEEEAAgYkToGUEEEAAAQQQQAABBBDYQ4ABnz1IWIAAAsUuQP8RQAABBBBAAAEEEEAAAQQQQCD6AkSIAAIIILC7AAM+u3swhwACCCCAAAIIIBANAaJAAAEEEEAAAQQQQAABBBBAoKQESnTAp6S2McEigAACCCCAAAIIIIAAAgggUKIChI0AAggggAACCJSOAAM+pbOtiRQBBBBA4JkCzCOAAAIIIIAAAggggAACCCCAQPQFiBCBEhFgwKdENjRhIoAAAggggAACCCCAwMgCLEUAAQQQQAABBBBAAAEEoiDAgE8UtiIxjKUAdSOAAAIIIIAAAggggAACCCCAQPQFiBABBBBAAIGiF2DAp+g3IQEggAACCCCAwNgL0AICCCCAAAIIIIAAAggggAACCERfoLgjZMCnuLcfvUcAAQQQQAABBBBAAAEEEBgvAdpBAAEEEEAAAQQQQKCABRjwKeCNQ9cQQKC4BOgtAggggAACCCCAAAIIIIAAAghEX4AIEUAAgUIVYMCnULcM/UIAAQQQQAABBBAoRgH6jAACCCCAAAIIIIAAAggggMCECDDgM67sNIYAAggggAACCCCAAAIIIIAAAtEXIEIEEEAAAQQQQGD8BRjwGX9zWkSgJAS6V6zYr2dN6+yetuZz13a0vKertXVSSQROkAhkIsA6CCCAAAIIIIAAAggggEAGAj1tLUd0tzX/v56OpsU2/boMirAKAggUkgB9QWCcBRjwGWdwmkOgFASua286TitS94rvrxOVVs+59eWV/u/t4PSIUoifGBFAAAEEEEAAgUwEWAcBBBBAAIHRBJxz2tvW/AFV+Yvlb4nTy0TdT3ram9at7+ycPFo5liOAAAIIlLYAAz6lvf2JvnAFirZn3e3NJ8RFb7AAZlpOT89Vdav5pE86CdMIIIAAAggggAACCCCAAAIlLjBS+Nrb3jLPqV7uxD1jcEdPSaWe/mwikeCa3khyLEMAAQRKXIB/DiX+C0D4CORbQEVXqurhI9XrRN4dK9cXjfQayxBAAAEERhJgGQIIIIAAAggggECpCXStvGiGqFwmewz2DErE7Nz6o6864ICywTl+IIAAAghERCA/YTDgkx9HakGg5AWCT+70tDd92w5IXxd89HwUkJhq6jmjvMZiBBBAAAEEEEAAAQQQGEmAZQggUDICvZd+6eCKWPmdFvCzLI+YVPSgh6c+oSO+yEIEEEAAgZIWYMCnpDc/wSOQP4GKytQ8Ee/0fdUY82IP72sdXs9OgLURQAABBBBAAAEEEEAAAQSKX2BDIhF35ZXnOpUX7i0aFXns4E0HuL2tw2vRFCAqBBBAYF8CDPjsS4jXEUBgnwK3NjVNceJ9VMTF9rqy6i83DWz8/V7X4UUEEEAAAQQQyEWAMggggAACCCBQ5AJPHHbAISL+/9tHGM6Ju2nzIT9K7mM9XkYAAQQQKEEBBnxKYqMTJAJjK7ClSqbYQemr99aKijzti//JD5zzuU17W4/XEEAAAQQQQAABBBBAAAEEchWgXDELxAf6XiaiR8reH38s870v1dZem9r7aryKAAIIIFCKAgz4lOJWJ2YE8izg97vpqt6kUar1bfkfkmXlL567sPEHqsrHzg2EhMCECNAoAggggAACCCCAAAIIFKyAr97ogz1Ogk/0rNdNqde9e9GyvxZsEHQMAQQKQ4BelKwAAz4lu+kJHIH8CVSWpR5zzv1zzxp1s6qsiKn3znlnLX5gz9dZggACCCCAAAIIIDDeArSHAAIIIFCgAgPJXwV3xxihd/+z5Q2uL3bGnPPP564ZIwCxCAEEEEBghwADPjsc+IkAAjsEcvp59yN9Gz1xq61w8GkeewqSu1+cnPybhzefN3vh0v8GS8gIIIAAAggggAACCCCAAAIIIDCywH5Tt/3OiXTt9qrKz1K+vO7U+oaVNeee+9Rur4WboTQCCCCAQAQFGPCJ4EYdi5CuuipR2dt+6Qu6O5re3NPWfNra9uazg9zd3rSkp73588H0UO5tb3p3z+qmV6/vaD1sQyIRH4v+jFednZ2dZT1tTbO725vPsbjP7W1rntvV1lY1Xu0XSzvHVlZO9UX3V9HHgz6ryENO9BOHx6vuSiQSfrBsInNXW6Kqt73l9N62pkW9HU1fCLbjrdc0TZnIPu2r7d6Olpfb39bHgt+7nvaW+nVrmv/fDe1f3n9f5cbz9a7W1knr2pvfZX1duK69ZUlvR/MH1q5efeB49mE827q+c8Whti84YX17c/W6ttYzh/Z53W3NzUH8Q/PB79fajqa3rF3d8vxC/z0baz/nnPZ0tr601/5nDP4ut7W897r21qPHul3qDyfQu6b57d3tzR+3bdaaS7a/ky8O/z20t3ywx/6P9rY3HXdbZ+f0cD0rjtJ3B8cOHc0n2/+bRT3tTZfkYjg2ZVoa1ttxXFciUV4ckoXfS9vXv6S3o+WjPe3Nnxp8Xtl8bKH0uqurK9bT1vK6wf1v0L+2prMKff+73s4dbN/x4Z6OlsXdq5uWdHe0fOTG1c3PLhTToB9r25a/qLet5ayejqb/62lrzmkfmddy7c2ftfOxD0708VfX6afHetpb32jb7+ze9tZGOwb66LrOS0e/LVWAOU45+Fvo7WyZ1WPH02Z/rvXz/V32uzZOzee9mQ12fn3dmkuOWWfHmr0dduxtx1jdHc3LetubLwz8g7yuo+U969qaX9m7fPnUvHdgnCrsveLSg4P41g2eY7Qs7LH/qzetXFkxTs2PWzPBPm6dbct1a1rP7G5rSvS0N1+zceuU60QGv8Nnm9jDzq2fdL5s9jx3vm3nz/QG231102vtf9BMezkSqfuqFfvZMdP7e4L9f1vT53pWNZ9cyIEF+5V17a1vsv4uCPYrvR0tC3vbm94dnB8Xcr/pGwIIlI5A9gM+pWNT8pEGB5O9q5tPsgs3K/ffVvUrJ8kNatfuVOXr9ovTEWQVXWFQnw2mh7KIflc8vTHl/J9tPKjqTjsouXB9ER5UB/EfnHz6c6LyHRVZac+tTuWb5brtOv6Ry26Psmnxy2zBp524g+xZnMgh9vvQ9lBq03HB/ETmRCLhVcjU86xvX3eqq+z682ecum9u3aQrJ7Jfe2v7Orsw6jv/Vlvn8uD3TsSt9p1cPSBlF3d1Fc6FunilW+iLdtlF/XZf3Arn5Cr1tl99Q4ENTJljzunGtksOCQ7ie9pa7oql/J+ryC0pkW/56l9uv+M79oMqy4L4h+aD3y/PabfnuTu2b9G7bUDoK71tLbNy7kQRF1zXcdnzJeVfa/uEjsHfZXVfi4n/7a5LLy4PHRHkAAAQAElEQVSIi0BFTDtmXV/b3rLULipc76musW12bi7Z/k4uHP57cO4qq+M7TvS2ralNv+5tb1nfvbr5Q9c0Ffagexjg4H+f2j7bOV0loo0Wf06O+S/nmlJ2HFc2s+ojwiO0QHAx1fP1dt+5K6yyLzl71rh8v6e96W02P+Fp8uP3vUg9WetEOqwzX7JjoDWFvP8NLlwmnb/W9h1fEecuU09XqHNXDnhyR29b6/MshglPdrF5miexNfZ/fo04/XT+/0Yl+32FyOdV9Kuet71tzC7uZyA/adarZzvxr7Pt12HPl6jnrvBTyRsnsk9D3a549P73+SlnF9DdalFpFfGvrnD+dcX2Jr7g929te/PZTx889Y64793h27Gms2PvwFydNNvf+heD6SDb/ug7vrqb3dTYr3vami4r9MHeoW019Bz83riBpJ23yVXBMbbF026xXtcX728cWqeYn4NrCT1tLe+1wZ1bBmLy42Bb+r5/uap+zuL6kKi+W8S9w6YnWRbbtvurytvtb32hzX/eLOycS29QX39pdfR2r2l564YNiaJ9o+3dnZ1lsi31dSd6tQT7f9WExOXa7vbmL1q8BZnKHv33W1Pi91p/g+Pl1h2/o/rdeKX/4YLsMJ1CAIGSE7DjgZKLmYD3IrAhkYjf0NH0EjtZPX/jzKm/c578UEXOsSLBOxYPtefpTqTSnkdN9nrwyYngXf5HiMprbf6LNvjzT/uHfX1PR/PJG4rkEzJPHzTtOaL6XhGdLLseQewnV0xKzdm1iCn7HZlnCjHLw8m2+7OS4t43vGCCJk44VCrtxPxl1nzaO8K00g6aP9rd3nLlbQX4jvOYk5NUNBg8U+v3juSk3GZeJ09WDh7471g4sT9tg19gJyNVab0osz6+Z0Djb09bVlSTwQDhehugXtvWPLe7vXn9gHoPikqrqDvRYg0GKWZYQME22Mv/Tw32E9NsvUOdkxcGv2v2O/gDOyH7w7r25o93rWo6KmjHXo988t1ArQX5AstDqcJ+R15VXhFvMYP40EKeC0Ogd9XyZ9kv9iesN1PtxNU2lU2FTWqn7DL4f3Sm/V842ol7j3pyzdQp+pD9jXXa39obujovnh62mUIqP+BccOxzSCH1Ka0v023DXnbTypXBPiptMZPZCth+fb79fzjYPO3PZrC0Z7/jtt31i7cVwO900nevsL/jgwd7tuOHZ319VVl5/Lruzkueu2NR4fyMJf0jrX9HW49ilodSMH2E76VeMbRgIp/7ypIvtH3Yi6wPQ9vcJgsilVkv3utP895lzxOSfNF5tv2GP21g04HRS2zA4RsT0qGdjXZ1dcV8kfnWnwN2Lgqeyuxv9TXlumVxMFPoOfh77W5vWjJQ1vd7Q+2wv+vXW5+fZTnYjwfb3iZ3TxafnY9rcD7+PFFdHBf/Hz3tLVdc397ymqI4/qoqC/atp1hUw/HZNqyy/MXrVre+2JYXXQretNfb3nRc8Gms8kr/z6LuOxbEyTaac7g9B9vSNq9NZZbKzOIAO8cIPgF5qvru9o1/rrqrt6PlrN4CGSDPLIwda/23/6mDLJ6XWh7e3uYy1eY/ZdePLthQgINZqmoDcLL78avKFBV3+o6oovmTqBBAoHgEsvmnUjxR0dOcBOwA4eVPHzS1K+n0FhH9sl3cDE5oJE+P4GL1XKvr2o26/ZZ1a1rnBB/9t/miTM7p84uy42PUaTsY+/OIVTsNBglHfKkQFqq6D21ObWoohL6k98GL6b3p82nTz6/YlgoGE9IWTeSke2Lk1vV1Iy8v/KUvO2jKZ2yA+ia7KvZt+71+T557/GK76NBZHtObjz946heCd/fluf6Cq84u7B8xYqec1Bw3Y/orR3yNhSUhYH9fwYWbj9vf2s3lyfi6taubI/OOSBWvgPbTMtKjclvF9ueN9EKOy0qymB0LbhwpcLvQeuDmPi94c8BIL0/4Mvvbe6WmYl+7fuXy4CLjhPdnqANa6QW3Be4bmk97jtkJa/DGs7RFTI4sMHHHX774m0buk7xllOUTvlidnjjhndhLB2xgvqJnTXOdl/JuVtEW2+cEbzzaS4l9veQ+Zn9L614+s6qtq+0SG5ze1/oT97rvadL2pYO3M3tmL2IxV3THj10rVx5U/vjUlU70ZnXSbDEFAzX2lNd0vA0Gtjv1b+5d3XTR2tUXBQN+eW1gAiqzX1n51JN/rvrABLS91yZ9dX8eaQV1+tqRlrMMAQQQGG+BYAc63m3SXgEJ2EGB3vTVlQcFn+ix6Tuduhrr3mGW1XLINEJxJ1NtIOn1fsq/rnzWq6640Q42ncjYtCU8xkvAfneS49VWXttxg5+aubC7rfkTwUlVXusOUZnvvBEvIlmV5X1lwRu6bKoAkv3tbh2pG+qCd/SP9EphLgu2fU9H8H0bLfdpcAsBkeBWhGP5HRcvEOc+XV7p/25tR9NbXCIRyf/FwS271On7R9nqsZiXOrer6/Tg3dujrMLiEhGosqOAkzxPru7taFlvF7eOLYp3H+9l4/iS+sNeXi6El/yY87YXQkeKug8qI16MtINa9WJxeyrk6NzrY/FY0zcK6JNebrvfJ6IpGeHhRNM+pT3CCuO0yElqq3pq/RynBrNrxqm4R7Mrkr+17f/9aPuUeP5aKZ2aru9ccWh/vP9q8aXNiRxjkeflWNF+Rw6y+j5ept66npXNx9o5XJ73VdbTPKSY1+dbx/pHqkqdK5rfqVuvaZoSvKGlPN73bzv2X2DxBJ/MsqcxS4HN85ynn/S88p+sbW99U9G/wczJVPvlv3pte8vpwSf2xkwuy4o90SdHLKIS3AlixJdYiAACCIyngDeejdFW4QnYhZXT+7f33yyiF4tIleXxSRpcENb5A+rdvr6j5d3j0yitIDCygKost5OqDzlnlx1HXoWlERWwAZeX9Jf1XyFOrrOT3pDvnMwa6Xkxp9f1HjRledeVrQdkXbrAC0yrkjOdyJTBbo7ww147seLR1x41wkssKlEB+xt8j13c2vCyg6Zc2L1ixX4lyjDmYavt76rPbvjTmDdEA4Uu8L6qeH9n71eWTy30jtK/TAT0L84bvEVUJiuzTgELrG1b8aJYMtUtomN2aygbTHmlnY3f0rum5R0inP/IGDzWda54xfYt+h3Pk04RTb9FvIzT4wUx8W8pn5S67JYInGd44i6LP/bvN4yTHc0ggEBYAcpPuAADPhO+CSamA8E7Pbo7Wi9Vp9+1HpxgOdNk1+gk+Ij1gBUI3nVj2VmWoZwU0RHfnScjP17sO7e+u73lg1F9l/vIYbO0wASC7xVZtW7NJUV7K7IC8yz47jjndF17y2s8p7faYM+HrMNZDHgP7uPS9oHSZ+UH94G2gwyWB/tAm7Sl+0i20v6i2lDW719x1VWJQr8N1D6i2fXy+s5OO7HVebuWjDh1pKh7+YivsLAQBez/uwTv4M4k7/ib0MFjg6Ccn0VAM1X1c1KRuj4ityN5ZuiBTSaGY7OOc1dsSm0+65mdYr5kBd4rfV7CHuN2ThhZaSfBvm5s/m5l7/teu3j/NxX/fTULzvtHZH1LJLDgkz2epr4lKq8WcbF9hG2HkfZ7p4P/awePQ61cvx3XBufqmfzfPUKdXH39yuXB3T320RQvZyoQnGPc0N58gp9Kfc85CW4Pvc9PKNpxj7O/42Sw/ex5u22X24IsoteqSlcwbcvvsrwlWMeWB+casq+H/YJUitOz+vr93+38bh+rYl+lCvb1Qz3n3dizpplbfBbsJqJjCCBQSAIc3BfS1hinvqzvbJ5RXul/TZxfl2GTwQHFb5y4Ditznh1kvEdT3glJ8V5UXlb+3FQs/pxgOsjO13c68T+i6r4oqjdZ/Q9a3mdScV/tnjn1IgZ99kkV1RUmPK7ggNg574Z1wS22XHDMPeFdogNjJBAMrPS2tyxx4tZbE8+yvO/k5GENTrqc+6KIf4b47o3BPi/IT29xBwbPQbZ95KvspKxWPTlXVL5uFf/OnoOTcJscPanI3P23Vf20Z9XFLx19reJ5xfc3v0B8ecE+ehyzbRCZ723ZR6zF/7JKc3Vdw6RMsuuLHRL8PfgxfWnK/X/2zgQ+rqr64+e8N5k0bdqCtAWUxV0BRRAUBQSrIGubpSWKC1hA0iQlNlsLKDpuSJs0raVJCQj9yx8U05KlCFRRquJfRXZZXEEBWdqytE26JJn3zv/c0GKauW+StJPJLL/53Dsz75z77j3n+7a7vHef9xkSKSehpUTyCxLaOhwYekx8ynHCv21rXnzqcNKnTRqHPjwchqOWpqLu0i9WRoa1DdKGKQzdFwJ6yeKyY6ZMmLd+/XozFdC+5JXV62rbZ+GoHbdDnHsLymvfW1Be9+es3gAZ4rzred9TV8zUwvoTGLZoU6WThBf44s8Qxz/SZeedOWF6L+c4RxH7n9Lr7qXMfIPm8KTGwKDtn4NCIfeB9pWNHw1MBMWwCbS2RsLaxiiLEv2frjSMd+hwt6ZbT0LXaB2pUJzwkS+7EycVVNR+xsTC8pqSgrLaz5r/BeW1H82Jhg/wffcYMm0R4mt13fs16mbU7zhBE7xN94u7OlY2mCe64qRMcRXTBGV1m5mOMMUthXkgAAIgMOYExm7AZ8xdz04DzGCP7/PPiXi2dqbkUPyP1lXopyLu8eFo+JN9Uw6/rLBiQUNhWe3PCy+rfnx2efUzZ3+l8j+zSqteMv9NLJpX86ui8rpbCsrqvtG7g2f7fu8HhbhKL8wb4hdFOQ5J9doDJ7SZp4+GSAs1CIwWgf18cVa0Xb/soNEqAPmOPYH9to2fQyxXC9GUIa0Rep7ZOd+XcUflRHO+VFBR943C8rofF86ru9+c80y8oK5um/k1sahiwaMFFbVtBXNrf3CIM/HiXjd6ik9yFpGYBtlQxR1LbmhNZ/OyoQZKhspnzPXi09nk8LRhGHJG543XDm/QbRiZIUlqECiqqtpsjofiS2v+Pqti4frCirqWRzd117rutiJP6Ghi/p7WQbYNw9ojHXLW4G7OYZBCEhDYewJ5ekwu2fzUw1/c+yywJggMgwCSxCXQtmLJRZrgAo2BfTTC3CnsHrPf+K7PFVbUNBRXLFhnnuyaUVb9wjmX1D5bcEn1PwvLF9xXVFF346T3d5VLnnsyMV2hMfDmI60PH8TkX92+aimmUlX4+xLCm8Z/TtsY9ZpHrsYhAt/MTKds3SYzHtnY9fWC8ro7i0orny4tLTWzBVjXPbuysqe4ouovpi1SsLFrPud6p7PjfFTzuVdX8DUGBt3O7yHhNR3NjacFJkoHhdAHJMTN6WAqbAQBEACBsSQQWJkYS6NQ9ugQ+HFDwxTPoxtE6FjtfNS+Fns5TGxe+Pm/5DkfLiyv/VxRRdWjWrnYWlJS4tnXsEtLqqt3FM+78tWi8pplXsg9lkW+pZWRv2pqrW/od2zIEeGC3Dz/xp81N+8fq4YEBJJBQI5wPK/z9uWLDklGaSiDKFkMzJM97SsWl2nDaBkRB0+fT6ZsEAAAEABJREFUJhTVk9TvWAd6CitqDysoq76teN68V/U82EMj+ByvDbaS0su3FJfV3VtQVvtxYqdYz6/rNIt4+bxXJHrv2qaGkyORSFpeo1taWnKE5UISYfV1qBCSnp7Lh0oEffoT0P3Zn1Ea2T5rXu2zhWU1X+/Z6ejAJi8i5ueG8G4K+/SHjub60zSPtDwmhvAPahAYewJMIe2kvLqjacmJY28MLACB7CNw+4qGwx1HrlDPXY22sEWEavt28PlFZVX/nj4nYqYPtKV7UzZ9eiRaNKdqc2FZ7TWOufmI6XFVahVXvwcHoU87O/2vDhZjeXgE7lq+PLe9qf5iYud6ivu+HjHbrcN35MTC8poLC8pqHjE3jmn9Ju5gDVk+HIn4BRcv7CqYW/3gpA3dZ2j/zpdE5A+aNHBwT9PkC/m3tjc1pvOTPswkp3Y0N6xtx/sedXOnZ4DVIAACo08ADefRZ5wSJbStrJ82Po9+psbM1At9vE64Rx3HKQhHw18xT/Fo+oQE8xRQQUVdhHxnhmb4PxoDg1Zmz+uTHd8OTAAFCIwyAT1APuKE3Ou18j51lItC9kkiICK8//Z8HezhRi0yrDEovOILl+ZGw8Uz51b9NCjRSOXMLIVl1e2UGy3R/2Y6zVcD82B6q8903bFTJ70zME0KKw6Mbj1Tj6H3jMDE87ST8dARpEfSDCBQUl39QsHGriupT84SoZ+oS6LRGlQxiYRWfXi//Q6xJoAwUwjAjzEkoOftg3XQ57b25Y2Y2mkMtwOKzk4COuL6afX8cI2WIK/rdfD8wk3dS/XaucOSYEjRzLK6e6NRKtFr6RNBiUVkYUdLY0ZMLRzk42jJ+5yeImZnmeafqzEoPM/kXJC3Tb5YPLfODMxQoj7TI5FoYXndj0X6ZjCxGTgMzJqJpjnsX7em+ftp2c4Y4NjZFPYira3nBQ2SDkiKvyAAAiCQfQSc7HM5+zxetSoyzhUnQkwnqPeORlvo0Yrk9b1TDjt+xtyqP4z0TnZbhjZZQYV5zLz2Ii2rkt94ksiWLKR9o/M6muq/Fum/w92WBDIQGF0CTPSZ3lDvfDMX8+iWhNyTQeCOlY0nMNOVRIFP9viq+wuzX1g8r+YmPQduYmY9VVFCP/134pXV3KR5n6772GMazdSZtjKOEse/Md32v9ZIJEzMI3tih+kt7NKpNgiQZTYBc3dqYWXtU7leeA4Tf02jecLY7jTzIX5O9Nedy5YdaE8AKQiAQAIIHMohf/nalmWHJSAvZAECIDBMAsJylia1TbeuKlrx2Mbue8w1U9PsdZh9We1fmb3zNIMXNNpCHnl+kU2RfFn6lGjOl+LwD4gkP8Bqn4Uf9Hy/sKC8ZvUZdXXDmdI2IKv4YjO7ipbRyOyfLCT/CEqtDZx3hCTnzjubFqfzNOYuM5XlvnLCF9dHIqEgXyEHARAAgWwlENT5n608MtLvyTvHf14v+GY+4CD/upi5KuROrCoZ4bRtQRkOJe/b2N0iUf/zTPRyYFqHzzny4HETA/VQgMA+EmDirSIS1MHoMtGC8Cv5l6MSuY+gx3j1tpX1H/BJbpfgd/aomto81/l0QdmC/0uGuWYKh6hPBWqTefLSXqTQKeHXJ73PrkxNqXNA3tFq2Xs1Dj8IhcWn0yUSGbpOMvxckTKNCOgAa492UHxfSOsF8aZ4Y3qH5ESX/Pzm+glp5B5MBYFUJPBIHKM+Kr63HO/UjEMIKhBINAGmU2xZalvkJSfEyyORSNSmH6msoHzh33Rg4stB7R8WwewGI4CqbYxpnhe9U1cJeG8la1WfVkdDzsxZ8xY8rOmSEmaWLfg99fH5whxYpjC9t5fdujSofz+v0IKmqQsr4Bu2TpvwOT1G0I5QUAggkHEE4NBeE8BJca/RpceKa5ob3+n4znK1NqhzZAuTnK+djytnlJZu13RJCSWRSG9hZd0vtQo0Uwt8SWNsEHJpWxiP6MaSgSRBBITkKcfhRZqdtRGlFUhzt9DlXQflm7vhNBlCuhG4a/nyXId4gdr9Vo2WoGchkc6wF/6imXrSkmDUROZdJu7G7i9ow9sMMvm2gryoP84mT1WZ64ZOVtveojEm6PH0gPoacJ2RgrWH5gVdp2LygiAzCRSW1/2yr9c7TTu4gm8GYS7Z0eV+KjMJwCsQSA6BnBB/Ts/HQe/P0j5fMe/U/J9Ufso0OaRQCgiMPoH+p6OJptlKEpZvzyitfcWm21tZ75TD1+t19npdX6tm+r0rqOzlkHDDrkX8DEHADJQ45FQqt6PsSfvbGPe+vrH7y8luY6hNUvTV2ocOdfI/pud66zR+msbRfqCK9ikT3223P0WkTLc6RLeqNZ5GW8gR3W+PP3DCkTYlZCAAAiCQrQT03Jmtrme+361NTfkh8RqIaUKAt726A1zVs/5P5iXiAUlGV/zwpu6HWJyLmGnD4JJE6Gk6ZGv3YDmWQSAOgRGrXnYm6oCofF0rvdZBH80wz/eooW1lPToYFUa6hd6c3k+SUND0FDrIYgZ7cs83TxiMhW8zIpHtIYrO0MZYO7E2DAcYofvkyyy9zwwQpfxftXm2GqmXFv3eM3iO0DUibAa39tS8sTRZekLm3UZvLOE7awnM/uqCf4gvhQrgXxotQXKI/abWlY1vsyghAgEQGAaBB17s+ieTcxkR9Wi0BhEqME85W5UQggAIJIxA7kGmU96enVZU2+2avZeWlJR4vSGvnoSvJab+wSQm/o3vyfnnzKt9du9zzq4173jbhMPF9y9Ur1ljTBCRX/qOfH5OJLIzRpkkwfGlpX0SdS/W4sxTMvoTE3Idh+68o6VhSowmhQShaLhM99eb1CQ9JPR7z0C6Hx/YJ9y2dsU1AYNvhA8IgAAIZB0BW6dM1kHIVIdzZceHiZ0z4vj3rRllNStKVq8OulsizqqJUUUiEb+gonpdnzgnao6/17g7dIv0RkpKIr27BfgFgdEgUKoV4d6N25Zq3qYSqT+WwPRWR/hnnSuXHGvRQpTCBJjY3MGYbzNRiJ523NBXx2qwZ7dN55Zf8XqvjP+ykOjgI+1+GW+UmL9t5uLenS7Vf80c5mqjOZfrT0yIOqGJ65j978RodgmYZCGmENoFI8t/CufV3a/HZ0UcDIeGyTcvR46TBCoQAIEgAv317/KaO4ipQNMEDfrk6nH4zY7mxs9rGgQQAIExIFBcVrdxNIotKb18y6ObuqrCfeFDXs/rzpt0RNdpRZfV/Xo0ysrUPL0+57vMfIjNP63Tb/IcXjha289WZpCsqLL6T9FonznXBySRd0c9+WKAMiXEpq3mS88VTPSnIINU9x7fCd2ibQncEBQECXIQAIGsIpB9Az5ZtHnFoVoiGR/g8s99v7dFKynalgtIkUTx7PLqZwrLa0/SyLviRO3o/HsSTUBRWUygJBLpjbpuRITuiYMhz/dleUfTkkPjpIEqhQh0NDWWi8hhASZtIZ/LZpbOD5rSJmC10RGXVFR0F5XVztfz33iN5jyYY6baHJ3SRidX34teq9ccbW/F5q+DOVeZaUMLyxfcJyzW+cT1YrR/ONc/J3ZtSLKRQFF57d3i01Xqe5/G2ODTJ9qbG46LVUACAiAwTAIy+f3dvyJhMxDv29bRE7q2Ff0frV255NwI3rNmQwRZOhBIcRujvhd4g2Nb09IjRst8PaZ905E+Z05k5/TpkeholZOJ+XasqD9B67b2wXChKItTO7usJt670pKKZXblFcaWr+kgv3VfY+LPrvtho3VK5qQaGqcw7Rt6tc/xL9AkD2kMCsfkjPOuubX5+/sHJYAcBEAABLKFgFbis8XV7PKzo7nxNPX4bI3W4DvyLXPRtCohBIEsJGDmVu7ripp39Twa5D4znaQd2j9qbWzMC0oDeWoQ6Fy27EAib06gNcz1RfNqfhWoh2JEBNauaDyKiT4TsNJmx93WtFvnCN22+//gX2YuwDsjBlPJ4uU+d4UOxP/WSoBpGhN/zqqDEARAYFgEpmsn7+vju5Zo4ts1BoWQL7LsmKkTcdd0ECHIQWAfCORF80xnvDUHl/1LrQoIx4xAa2urS44TPA0xy5pHN3XdMmYGBhScI/5NJPJ0gPr4nVE/5acvnz13wT+Y+Ss6cPWfAD9UxZ/Pl5yG1kgkHJQG8uwlAM9BIJsIONnkbLb4+mBLSw6T/1X119VoCbyoeG7dHywKiEAgqwmUXH75Fu2MNg2rZwNAaP8iTQ/netfd0RIZH5AG4hQg4IWiR5PD77OaIvS4S/w/Vh2EIyagHfIcdb1PC5G9YcWyekZpZPvujH3ie0ko5r1tRu+TnEivTppq/iOCQFFV1WYK0YoAEqwD8BeY9xUG6CEGgeESyOp05u7+wvLaEmHuVBC+Rlt4F7Hc17rsmqCnZm3rQAYCIDAMAuYpG032N40xQUTmdV676PgYBQRjRmDclmf1PCgnBRjwqiPcaJ6eCtCPmficigUvCzuLAwwIkU9VrWYwKyBBqogLymoeYeFqtadboy04PtOXcqdNMP1hNj1kIAACIJAVBDDgk4Gb+fnolqO04+2jAa79m72oeU9EgBri/xLAv2wk8PCm7od8oS+q75s12gPzeV5f/ny7EtJUIMCOfFYHFSbabNFGwJqHNmx9yaaDbOQE/rC6cZzj01m6pq1OsUPI+bnq3gyb87qfJKbH3xQM+KM9+G8PCwU9KTQgJf5mC4FDaeKdWqe5N8DfaWHaOTdABzEIgMAICIQ9MZ1jf46zyuHh3JyVd7Q0TImTBioQAIG9I3CfdTWmkLhu0+1Llx5s1UOYYAJDZ+f18Yc01ds12sJ9r27qttZxbYmTLcvty/kJEQe9B+dEd9NzH6Y0+PRMObSNPb5I2w3bbOaqPEeIr1zb1HC+TQ8ZCIAACGQDAVvnTDb4ndE+MvOx6qB9Dlah9p4DH7TeWa3rIIBA1hMwd2QVV9T+ToTMo/pBdw7lkUPfa29a8uXW1vPcrIeWYgDMlGBMXGg1S2hbNOysMNvZqodwxARe2eAdRMwnW1cUejlE/MeBOnM3ObPcOFA24L9D7Ffp9gkNkI39X1gwZgSOLy3t88j5ChPttBkhLGUtLS05Nh1kIAACwydwzrzaZ6PkzNI1gp5yJhI5O+rxtzFVjlJCAIEEEhDmdUHXOS3mo6Fc77drfrD4PRKJOLqMMLYELtLibe0/3xdaMicSsdZXdJ0xD/1Pkzn0LTXE0xgTXKYvqVB3Rf1O4VBSUuJNerWrXU1cqlE02sJ+PtPN5lUHmiDlfbI5ABkIgMAYEsiAolFhyICNONgFIT5VZbGdZUJRn53OkpLV1gu8roMAAiCwi0CuF27Tjo1rdi1af7TTuj782sfOsCohHDMC7sYJ52jhB2iMDQ4vK7mk+rVYBSR7S8B3HTM4mm9bXzvj22eUVb8wWOc4k9YK0z8Gy/uXhT74oQMn2AeQ+hPgK9sI+FMOeVaY77b5rS34qQfJtg/ZdJCBAAiMjMDs8upn9Lz9ZT2uYs7bu3NikkPpoe4AABAASURBVLLwtPxvZuvUtrs54BcEEkpgp/MrIQqccl117w7lOPd0Ts2fe9fy5bkJLRuZDZtAa8s1k5n407YVmOihTaGJ99t0KSXz+p+yt04hSEzH39NyzaSUsjfAmOmRSLQr2l0vwjcFJDHiEIm/rHN5wxFmAREEQAAEsokABnwycGszkX1OWeZNxeXVv8lAl+ESCCScgLkDqrCi7nvCZCqR2s6yFjGFfX9l24oV9sEF6yoQjjYBl9ncoWwrZqdPPqa0tJHZS9n6piYd6JHagNXFyR23xKabUVq6nX2+3qYzMiY2d0+y+Y8IAuZOThb5hZKIvWFFKI9EjlYdAgiAQAIIFJXV/VorPRFijj3e3sxf5kvfhHPfXMQfEACBfSJg3lnH5JVpxWdrnIwOJ6amXrfvgc7mZe9rTYP3rcTxJS1Vob6cTxDJeJvxPvOq0tLSPpsulWS9Uw99kYmftNok9NaeaO5brboUFH6xMrK1qKLmEiI2dUSyfpiOopCs0YHSRA9kWYuDEARAAARShQAGfFJlSyTIjraV9dM0q3drtAS5ziKECARAIA4BJ+zN144P88i4NZUQH+Y6O3/V3rL4XdYEECaVQGtjY542hk+wF8oPRf3x2+06SPeGwFZn+5eD1mOiOwouvuzFIH1U+u5m4k02PRN9TI+pd9p0kGUnARZ6SD3frnHPwNqMJ3mPiA7P76kZoyUUCwLpT6CwvPaHeswtUE92aLQEHu87fG1Hc/1pFiVEIAACe0GgoHzh3/RSdqm2Lax1ozezZPkgUfSh8KZnV+sxOOfOpsUHvanDn1El4Lr+RwMK6CbHCx50CFhpLMTmJhqtM/3aWrbQNJ/F9CdZ1akqlKhXrm2HOO+g4yN6c3pvbF+1dL9U9QF2gQAIgECiCWDAJ9FEg/JLklyEPhJUVNQxL+kL0kIOAiBgI1Bw8cKukEulJPIXm97IhPlox3eubsWddgbHmMYJYX+aDviMsxnBJE8+tWlTys6rbbM5lWVmOh8RPjPAxqg43BKg6xf708LPEMmD/QuDvkToXeQ52qExSIHFrCXAoYnmblR757PQkatXr0adNmv3Djg+GgRyojlNOujTHCfvadoxfWt70+Jj4qSBCgSyl8BeeN776z+ucUTmDrWqEE0g5iIhbulj54mO5obb1qxoPGqo9aDfNwIiHDTg84++nujWfcs9eWtHWX5nLY0pz2M+zKpLYWFR5YKnZQebp07jvIOOiniHV5fCbsA0EAABEEgoATSOE4pz7DNzhYPee/Dq7Llftb8vYezNhgUgkNIEZpTWvsLkziQi0+GoP4OC1v5FqCS86bnlphN8kBaLSSTgOXywbgvbVAsqlmcikUg0ieZYi8oUoUeT3kVCxwf48/de7nsiQNcvLimpNp33a/sXYr8cJrokVgxJthIw0wAK0Z9s/gvLIa+//jrqtDY4kIHAXhIwU9t60vt9XT3oPE16np7G7DS1Lr96qqZDAAEQ2EcCJatXewUVtW16vStiCph2a0AZTJSji2Zq6c+GHP+JzuaGhzualtTevmLxh/ufelclQmIIrIpEzA1lU2y56fZ6mdxeU6+1qVNONj6aa3+Hj1rqUPQ9+pN2obCm5nlic5MmbQgw3lX5le1NDQtaI5Gw/kcAgaQRQEEgMBYEnLEoFGWOHgFm+oA1d5F/WeUQggAIDItAQUX1P8XnrxJxNwV9tJIZjU5YsD4SCQUlgXx0CQj5B2jj1/YyW1+Enxvd0rMs96icoQ2raVavhf701Es7/2PVDRB2RcM/1u21bYBo4N/PdFzXcORAAf5nNwEhesBGgH3af//9X9JdyaaFDARSlkDKG1Y878pXw9Hwl/TYuzeOsR8Lu+E7WluumRwnDVQgAAIjIPDYxu61IV/O0VVWaRx20GP1WGKpdx3nzvA4/67O5sXn3bV8ua1ePOw8kfANApMPnGDeAZP3xtKgb6GXzttE2wdJU3bRDOhrHf5xm4G+8Ntt8nSQ9R5w2C+F+PJ4tmp/2ZW50yYWxEsDHQiAAAhkAgEM+GTCVhzog1BQhS7oToeBa+N/ShCAEalKoGheza901GAuEwc9su8y8/zN0/LNI+Wp6kaG2+W4RMwU+xFmiT8neuw6kAQQeLClJUc7FCpVbWHNnsPcEolEfNXHDV+srNwqTNcGJMphn+eJjtQF6CHOMgJM8ozVZea3bXuKUKe1woEQBPaNgHYMbpUoV5NQ0M1jDjGdEI66i/BEwb6xxtogsJuAqUOdM6/22cLy2otJ6DyVP6pxJE+QHKTpPynktPaG+h5pa2r4wrqWpQdrvo7KERJMQFsevTyMem9wsWOg8cV6EyPrTjMG1iSkSPN+oqKKmv/Ra9IVmmHQ8TKZSJabp+A0DQIIgAAIZCwBXPAzbdM6ZH3MONPchD8gMFYEiitqbxXfv0rLD6xEag/4jZ3NS81deZoMIZkERLw87RTWQZ9klpp9Zb0gXTPU60M1xgaRP03c2GV9N09sYiL2nRu1M8M6iKqDPWe2Xbv4bZStH/i9BwEWxz7gQxSmw/dImsIL8i7z5NpoxrUty9Ju/v0U3mAwTQkUV9Y85ok/W/++oNEemC/IyZVauzILpMwHjuZxbfLOAopwMZaAFFbUrnFdOp0cukDVgVMsqi4gyBEO0y07Pe+uYw7M/+r6VavGBSSEOA4B13eDn/Ahei3OqlAlmcDkcQcsI5HAp+OE6CCXnTUY9EnyhkFxIAACQxNIYAoM+CQQZkpkJfReqx2O87RVDiEIgMCICWzImbRSB3X+V1fU+qJ+x4a3CHnL2poWHRGrgmQ0CTjsTNaNEvukI5PvOhL8Is/RNCrD8m5tbXXFp8sC3PJ98a+eHhn+u5Imjd//P0y83pof01tzXPcTVh2EIJCOBHxeSz49OZrR96LPdjTXP7W2ecnHcDd3Ou4kqWnzrHkLHmaSUrVui0ZbyGOWb7c1NRRn434nQgtG87g2eXc2N2xqa264UPli6mDbHpjBshmlta8Uzq1dU1heWxDd2fcudfWnGl/X2KdxuOEYEmrcsv3VP7WtrP+AiPBwV0Q6InF9896XoGOvB4xSh8D0OXN29va4tSz0W9ILk9Uypne4Di9qbYrkW/UQggAIgECaE8CAT5pvwMHma0fnk4Nl/cu+byqG/X/xBQIgsG8ESktL+3okr0ZzuYWIPbJ/3u1wqEkbVPZ3nNjXGakU6QcR8B16jZl2DhJrK40cz+fDY+QQjJhAzqZ/f1CvNe+zrajs/y59fQ/ZdEEybZT1kMO/VL2vcXDI1W161mAhlkEABIYiwEcISftxB004YaiU0IPAcAm8zZ30Cxb6pqbv1WgNDtOKY6fmnWpVQrhPBPTaO0V76G/40NT8in3KCCunNYHZ1Vc8owM/nwuRc7xWnL6i+8SP6I0pF3UXGYZrTB90hO/pXLnkqvalS/cbxhpIogR8kVf0p0ujLRxsE0I2dgRKqqt35OY6RTqwuZ5Yr1xWU/i0MOf/MM3eQWf1BEIQAAEQGEwAAz6DiaT5sl7Kgu66S3PPYD4IpBaBkoqKbs4J1WmH2sPBlsl0x+e1ra2t5o6w4GTQJIwA+9wrwtr+TViWyGgQAWb3JIfZzA0/SEMkPv3Re9t7NsYo4gtEKyPtunbUlkyva8U2OWRZSIDlyCz0epguxybTnr+Doj6fHauBBAT2jsDxpaV9M8trljPxkjg5HCzstncuWjQxThqo9pIAE+Vo3+VF6KjfS4AZtNq55dXPFJfX/mjmxu6Leqd2v1/P+edovHeYLpp6XMQJe82tra3uMNdBMhBIKwJnXlL9mjZOakjEOnX0Lmc+G/ZC35FIxNm1jB8QAAEQyAgCOKllxGYc4ATTnned7FYxv3X3X/yCAAgkhkDBV+ZvCDk5X9Dc4k2ZeFzupueu1jQISSDgk/TpwIFlwEe7R4hM4zYJVmR6EfJ50VE1m5c++T81L0y16eLJZpRVv8DCt9jSaOfFhPbmhu/YdJBlFwHd7w6xeizyrwkTyHLcW1NnlZBJYqe4zCoCcDbRBFgvpz1u3yK91v44Tt6TZaK7fu219e+IkwaqvSbAbmi8FzS11F7nihXTkwBHIn5JSaS3qLz27r4ph33Gcd3jhKRRvXlCY7ygVS86P/zKc//X2bzI+uR2vJWzTeeG/R1CpO0Mq+eH/vzm+glWTQoK10ciIWL+uNU0lpes8jQVFlUseFSIPq0x2C+hi9ZOm3RpmroIs0EABEDASgADPlYs6SvUC1lQxe7d6esVLAeB1CUwY+5X/+G6dK4ee/b3wzCFhGlee1PDgtT1IoMsY+dV7YSKmUebmfR6x2+nLP4kwvWO5kbzPp0TAvJ6KTp1+3DvLI3JIup534wR7hLoxqu465blk3Yt4idLCTjMH7W6zrzx9dcP1tOwVZvNwl4m+nM2A4Dvo0OgpPTyLZIXqtCD7ndxSjjWD/HiOHqo9pKAHtdP7dj/fvP+lr3MAatlKgFz083M0qqHH9u4rY57Q6ex0HzdX+I93UD6OUHIvabzRjyVpywCQ8HFC7u0PqrtDGuSKdu29o2zalJQ+OpB498RZJaI+9cgXbrKdTD0IWangpjss+EwTRDylrStrP9cuvoIu0HARgCy7Cag16zsBpBp3vs+BTW8JrY3LT0m0/yFPyCQCgTOvbTmbyy8UG2JGWhQmQm5DtP32lcumRWJ4HFxA2S0IvvmrjTePjh/EWEWeldLS0vOYB2Wh0fgjX3Xv0xTuxpjgk90hbnDNEYxTMGsyoX/IZF1tuTaqTipb0vvaTYdZNlBYP2qVeN0PzguwNuN+++/v+6CAdpsFL/xxPdPc6K5a7PRffgcl0BClEVzqjb7PW4JMz8ckKFDQrPbmxoW3dESGR+QBuKRETDvTvq9w05VSclqb2SrInU2EdA6m18wf/6GgoraH/T50RP1+tmm/u/QGBQKpTe0ENO7BeF5Qy4k1vOd8n1PSHImvZEq9b9zfOfEACv7mD37TYwBK6SLePKGrXeQL/Vqb8C5k8c74nz/9qaGj2gaBBAAARBIewIY8En7TbinA26e98c9Jf9d0ov35/+7hH8gMJgAlveWgHZ2SMGmrtU6qFCheZjGuP7sGbQhEGLxG489cOKH9tRgKZEEDgnlv6z5WRu0wnTUQaHNaXP3HaXY5wMH5L9XTTpdoyXwc1E32mFRjEjEjmM6p20NMVe337kPYsBuRDwzKfHrPa8cS0x5Vp+EnjzvvPPSYsBHrwWlvvhnjXZk8s/Ky5eysysrh7qz24oUQhAYDoFZVVUvsZCp+9jvmtZMmKnW9yZUZHxHssgNo31c+yxnaSwy06AqWgQQGBaB2fMuf3K/vAO+oNef+bpC4LFKIrW5rzx/jqZBCCAgPj1gUzHRWyTkBj0Bb1tlzGTmXTUi9Enq/8R8bSTP3RAjzQDB9Egk+uimbYvUFROj+msJ8naX6YcdTUsOtSghAgEQAIG0IoABn7TaXEMbax411g7IyWEeAAAQAElEQVSRx20pmWjOXcuXYy53GxzIQGAfCZj5s4sq6m7UbL6nMaASyYdpY+qu21c0HK5p9JDUb4SEEjAvlFaw1mnFVP6hvp6cqQktMIsyy8mhM7SzwHr3opCsp+hEz9zFvS9Rcf6RhF7R35igZX/qJeqaHKOAIPEEUjBHl/ijIhQzP77uF30qf4rNM3wpaPdgk9ih3xVXLFg32rGgbMH/nXFB3bbB5WMZBBJNYGZ5zR9ZuEjzDepIdoT4G+Ne+c/JkQx+ypmZ/jrax3VxWd29GjcqawQQGBGB6XPm7Cwqr73eIaeASIKmA8zV+twVrS3XoK4VQDd3fO567WvptalFZE46nONWTx0/Tc/JR9t80HbqS27YD37XjXWl9BHq9on2Svf3Wcg88RZk+NHEsuaOloYpQQkgBwEQAIF0IDCiAZ90cAg2KgGh3+p3TBCi/XpCvZ+KUUAAAiCQMALS4y4XptVBGepxeJDLtKptZT0GHoIg7avcoZ8EZBEOkVQH6CCOQ0AbSCHx6XQdNIupN7B2tKv8uDDvuNXz8n+yL1FEvqNm5GuMCVrG4Z4nn4lRQJDxBOLuf0Q7fPKfzHgIcBAEUphAQUXNejWvVjuSY6ZUVbkJ+T557R+aMnG6WUBMHwLDtpTF2gmu6zM6TpVCioSZ5dW/8X2ao8eq9V00Wtf6YNgLY0qrgO119kWVm1R1n0ZLkOkfmDbhAxZFSolyHH6/Vt2PsBrF/OBDL3W/ZtVliLCkItIdDbnztU0e9CoE4+lx0SgtMn8QQQAEQCBdCcR03KSrI7B7IAH5vV7A+gZKdv0PacdcQWtrq7trGT8gAAIJJlBUVbW5qKz280S8joI+TNPZ50USSdv3+QR5lhLygrm1v9UGq5nazWKPVLQ2LT7IooAoDoGPHTx5qjL9tC2JDtKoikwDd6bq9zWeQ0wxT3Fovv2BiRfvKq9/GV/ZQeDISZMOVE/P0RgTWOjFWfMWPByjgAAEQCCpBArLa38oxI1aqGi0BN6fHVm+6ylnix6itCbAzr9s9uvO4EifY87hNvWoy975+uuOw/ROW0HCvNkmz3RZdNrhPyOhVTY/dXtNEBLr9daWPhtl7NvZKYsc7WSpU4as/1MyGNvU/oVqXJ7GmCA+r4lEIn6MIsMEs0qrXsqNhs1+/miAay4zXdTeVK840F7fxQg/IAACaUYAAz5ptsGGY67ryANayzB3n8QkZ5GCcRuePSxGAQEIgEBCCTC5Zp7sRyjgo5XIL3dOy79m1arIuIAkEO8LAeabg1YPs1uDge8gOnb5zmj0m0I05vuq2vC29ub6M+xWQpqJBNavXx8K53o/DPSN6QeBOiiSQABFgMB/CWgH2ndJ+HqVBExtS0c6Dt3U2tj4Fk2DkEEEmPwtxBTzlI+2SR2fffvTBEnwf2NOz34iZH0fh9Yp/pgEE1KuiJKSEs93qF4Ne0VjTGChk2OEELxJIJTDD5DIi28KBvxh5k+2r6w/aoAopf62Ny0+g5jPDDDq732vdAU8vRSwRhqLz6qs7HJYatQF69NuKidlddWHpuVfgps0CR8QAIE0JIABnzTcaEOZfG5p3T+ZKWhat4N8l68aKo991iMDEMhyAgXl8//mR6NzSCjeOxQq99s2fk6WoxoV98WnTs3YeuemkBTkvPqCtfGv6yAMIvCz5ub9ifhiSpGPI04JBuxSZGMkwYwtTz08i5jPCCjqtbe5E8270wLUEIMACCSTwNmVlT2+9HxNr7P/F1SuDgB8Kpwrt+I9IUGE0lPODv8noM7rEssJY/V0bs/OnZ8jppCVqvh/ssqzQGjeBaXH6Q1WV1mOtcqHEmaJftuLXf/WwcIH7O7y25j4ErtubKXmnOuw860gK5i5oSQSiRm0DUqf7nImkhlldevZp2L9v9Pmj8odjYs7p40/yaaHDARAAARSmQAGfFJ56+ylbXqxFr1wNTKT9cKl2c7puG7J2fqLAAIgMIoEiisvf4yIzTtHgl6wm8uO8+2OFTgeKcGf3h7+qzbw/2zLVivu73HIM09g2dSQDSLQxzuCO0sGpbUtJlomLB8Lb3r+rYnOF/mlHoH2pUv3I0fK1TI9bPV7QNDOFl+Ylx1fWto3QIy/IAACY0ygeN6Vrzq9vZ9VM6zXYJWTDgBMz/VCtYRPxhDYGfX/qc5s1WgJzsdXNzcHTtdqWSEhos4bF010iIP2s5eLKhYETeeUkPJTPRMRfjDARjdADrESMIMi4jj2J48VKgvNbWtqSLmnpHL9nM+r+R/SGBuEnqSQuzZWkdkSrVxKwbza37LIPPV0h0ZbmEzi/Lh9ZeNHbUrIQAAEYglAkhoEnNQwA1YkmsDMitoHxJfWwHx9uer2lqUHB+rHSNF+/eJjWluuOWyMikexIJBwAr1TD71fK5Ffj5PxFO3QXHX7tYtx51AcSCNVlVRXvyY+XRe4nlBp28r6zwXqx0hhXmx8e8viD49R8THF3tESGa/7rxm0jNGNlcBhfo84HhpdY7UBklguj/PqSOhEW5HaSH/B8/rabDrIQAAExpZAwfyvbSCHztfj968DLBn4N1cHbes6VjZUDRTif/oSOK+8bgOJ/M3ugf+RMG//mF03elK/lz8jxEHtyntGr+SR56zt38n9NzmMfFWsMQYENjn5P9dif6nRFnK1k+2GzqbGd9uUYyFb0/z9d/oi39WyczXGBCFZM/OFzdZXAsQkzkDBxPFTbtVzxbJA15gOYfGbb1++6JDANFCAAAiAQIoR0GtRilkEcxJGQBy3iZheC8jwY47nXbF+1di/P8TMidretPgzHc0N/+So80jYC/2zo3nJClPxDbAd4owikNnOmHmyCyrqblAvvy1EQXeiT3NdXpSKg7Bqd9qGooran2in8AM2B3RbjHOEr+lsrj/apk+2rPPaRW/taG7o9Dza5HrOQx1NDU90Xtt4fLLtGFyeH51knqQ5YbB81/IW/f3j6EWx3nkrRCESvlTLRchQAq2trW77ivoSErpSXbROxcPMP5s97/InVY8AAiCQggQK59Y+RS7XEMn2APNydYDgu53NS2aqXi/X+o2QtgT0nKyXZ1phd4DDqm9sbWzMs+sTL13f1JTP4nwlIOcokbMuQJdU8doVjUd1rFxyq7Z/n+Nc7/WOlQ3r17YsCxqkSqhtrkNJ2x4JNTwFMistLe1zQs58NaVLY2xger+wd+UdLS3jY5XJlXQ0LTk0JDl3MlHQu9Ne7wt5N3Ek4ifPstQqafqcOTuLymtMnXOVWuZptIXj3JDb0L5q6X42JWQgAAIgkGoEnFQzCPYkjsDmcVv/zCI/C8pRL/plm3dM+N5dy5db7/QIWi+RcjPY0zltwoXMjnka6V278s7RxmFFbjR0len02SXDDwikNYHe9fd/m4XMwE9AJZJPcqPebW0rrj4grR1NMeM9X76q57rXA8w6TIivb1uxYkyZdy5bdiCF3J9oZ8iMN+1kOkpc/8Zkdo68WfaAP0L+bF0Mehr0+sLy2o+PVuyVbZ8gIftLcYk/1blyCeaY142TUWGXM6FN/z5dj4eluxZtP//Oyc35pk0BGQiAQOoQKJxbc5fju3P0XG59px4Rj/dJlnY2Ne5uAxA+6UtgQ2jSOmJ63OaBCH0wJ9cvN20/mz7Rsq3OzhLN8xSNsUHoeXGj98cqkisxT1F77DXqwKeZamtSf+lCp/pRL97MAP3JEvIl9AVrPkxbrHII9yDwkkz4OzH9r9ZXZA/Fmwt8ged3NbVGIuE3RUn+s359JMQsN6md7w0ouo/EubCk9PLnAvRZJebe0BXqcNCTW6qizzo7/Iab6+uTPkWlKRwRBEAABEZCIC0GfEbiENL+l8CcOZGdPdHcWhbe8F/pHv9CqivrDfV8fn0kYr2Ddo/UCV4QEe6Yln8GEZtOnck06CNMn6Ct/4mRD0qGRRBICwIlq1d73V7YVCIfJWIh24fpFNfJXSYSzbOpIRs5gU05kx4k5lsD1tSxIDrBdXZ03tHQMCUgzaiK+wd7wtHfiNAp5pw4qLCjc/Log4NkSVtc399IpK8GFOhFqS94yryAlUYiLqmIdIsj1weso9cvKbcwC0gOcToQiEQiTvvSpW932LmOmMzTZbFmC+3QE2j52RdVZu3UI7FQIAGB1CUwo6JqNTu8jISiNiuZ6J3C/sMSzj2UdcGWBrL0IGCeetDr8k1qrfVJAd0PKjsPmHSU6ocM+5JgTXP90eLLcs3DWp/W/eyeotIFT6t+TAN7ubmO47x/kBGszYSvtF2/JKiDflDyvVu8fUXD4XotPcu+Nv/ZLod0IAGzv3seLdZ9PmBAm1w9712Ye2D+4rEYIGhdfvXULX+Z8Dvdzqep3TH9fszaHhXpfHTT1rtVj6AECubP39AbDX9Jt9t/+vmobHAQki9PzOe5+hvDdHBaLIMACIDAWBLASWos6Seh7JLKyk1Rjpqpb163FsfmUW6nZcu0Cd/XTpakPZ5q7nTpaG68kElMR2zQoI6f07XV2mCw+gIhCKQ4gS9WVm51XTqTRf4vyFStPM5icTGnvR3QiKWlpaV9UU8aiPgvFPRh50RvPHe0rRjdxvXg4jubl72PcqOt2hB732Dd7mXh3p7d/5P9u/mv4wvUtoPs5UrH7PIrnrHrEicVz/mJ9nxYO/b14nBKZ3Mj5tJOHO4xz+mYAycUcK5n7ro+PNAYptvG58tvA/VQgAAIpBQB02m2pdtv0N8b4hg2kX2vWTtOk9YWiWMLVPtCgEMdRPIPaxYih5HrX9e6svFtVn0ChGuvrX9HiPgGYgq4A19eFOHvJqCofc6ir2ec7vKy05aR48kNdzYtDqiD2dYYvuznN9dPcB2+OnANkXWBOij2IDBrXu2zLDxLhUFPRWmzj+ZNnMBNa5ob36npkhLamhYdkRsK30bEQdMyk36ed8SN6Mc6GK/6rAym/8x35CwRsp/HiFz26RuOOObJvKxklGSnURwIgMBeEsCAz16CS6fVvCnvuFPtXakxIEgOEddwOPqT9Ul60idnWv5V7EiLlrs/BXyY6NGiqkjQHTMBa0EMAqlNYEZp7SviUqk2hoMenc9jloLU9iK9rDONMXcnn67nlJdtlmtrW1VykuPK4x0rFp9tS5NoWUfz4k8IRf9AxJ+ggI8a9a+i0oVjcpeluRbowKO5WcBqnYgb9OSNNf3eCnNy8v/jk5gBAFsWhzsOfcimgCz9CHQ0NVxOwmZ612mB1ov8pTsann/GBXXbAtNAkSUE4GY6Ebigrm5bz5RDL9NOeHOjl9V0vRZ/WBVvTGulfxDSk0BRWdW/yeHlcaw/MSx+6103LZ8aJ81eqToXLZrouc6PdOWPagwKXy+sqHk+SJlMea7r7tDr3pO2Mlnrh33iBA/K2FYapmznVpqh7RAzSGFbo8sRwk0VNjIBsoKKmvUs9E0h8gOSuEx0oUv+us7m0X936O3Ni2Y6jvuo2vOpAHuIhHZQX2/hzHnV1v0vcL0scqHXSgAAEABJREFUURSX1T0h4l0W6C7TJOVbHKiHAgRAAARSgAAGfFJgI4y2Ceal8SHqM3e4/zhOWUzMZ26Zlv+XjubGz9+yfHnCG1zakOP2lfWf7GiqNy8N/LpWNMI2e/Ti6WvaTselq2z6uDIoQSANCBTOrX2KHKdMTX1FI0ISCJxbVf2innNqtagdGu1BKKzb5ccdK5d8t7N50fsikUjCr5EdTUsObW9u+A6RY96vtr+e69huDD2rA3+XsH4F6EdVvOWg/Pdqa/CIgEL+7IzLeSJAl1DxjNLS7SwUNNVErkeCu+sSSjy5ma2PREK3X7v4pM7mhtuJyXRsheJY8IRP/izzpGScNFCBAAikKAHTHumNiqnbBw3ip6jlMGukBMK94Ru1chN07TbZndi7o3dNW1PDya2tra4R7GvsXLn4JJro3scknwjKi5nucV2+I0ifbPnZlZU97MjtRBzzfs/++qFDczqaG24y069RAj6dNy6a2NG8pEIc/h/NLlejLTzk9bpJqePZCt8rWQqs1EPdN5JwczxTmOg9Qnxfe1N9ZM21De+Pl3akugdbWnLaVtR/XAeUfhgi98dk2jTBmWwlh6sKKq94JDgJNEUVC36hx+Elut22ggYIgAAIpCOBhHdmpSOEbLD53PIrXs/b5pu7tX8+hL/vFvF/mO/2/q5zRcMp67UzZoj0w1K3r1z69rXXLflfFm4j5rh30LPQA34oVGaehBhW5kgEAmlIwLzImHznUlQik7PxtJEvj2zq/in5fPkQJU4mkSt8cX55zNSJ1T+vT8xLOc3gUfvKxWVqx691m1+hNsQfVBde+PCGbb/WdGMSxJOPa8H2KVdY7p/5/KvWp6V0nYSHcbnObUGZ6vWiqLWpKd+mhyy1Cdy+fPkhW6bl3+S6zlohMndJ6qERaHNUByCriisW/jUwBRQgAAIpT6Dksrp/Ral/GpxnU95YGLjXBMxARh/1zdMM/q7RHphOcVg6cl99riYS2fsbbO5avjzX3Egj4nTqteRD9sJUKrSN+nihti9f1aWUCa+N675dB6niPWUxx3VkbWfLkun7YvSdTU0H+b2h/9Vr6RLNJ2iwh8jh+qKqKsywoZBGEsx7J/cb/5Y6ETKDaRTnM4mZrwq5dG/7yoaGzmsX2d9XGCeDwarOG6996wt+1y3s8M+E+GIhCpjO8I012eeqQ5z8m95Ywnc8AoXltTeJ8GJNE9WIAAIgkOIEYN6eBDDgsyePjF46o65um7A7VysB95LlTiLa9WGmPGL6oDh079ap+Xe1NzWc33Fdw5HmrqBdSYb8Wa8DRWaQp/O6htM7mxtaHPEeE6Ev6IqBU7ipziehX/nkzplVWvWSLiOAQEYT6P3NH0xHp2l4oRKZhC2tHQrRwnk1y5m4RosLmmtbVdrcZT6EWOp3jOenO5rqv9bRtOTEzhuWHSgibBIMFU0687LUtS1LP6zr1h47Lf+fLE6zkJj5u+PdzfosCX+usKLmp2pv0NQQQxW/T/r1ev5mcuYSkbWO4JH8iCORpNl25iXVr4mQaWypSTFBx4O2L4iRQpByBFpbI+HWlmsO61jZcIbWK5rcUK+ZG/1LauhbNFoDMwsTPyM+n1lYXvdLTSQaEUAABNKYwOzy6mc83y8moReT5AaKGQMC5j1/TP7XtegujQGBD9Dr+6JjpuU/pu3FCzubGt/d2tpqnQFiYAYtLS05d1y3+D0dzY2f7wv1/oGJTDkHDEwz6P+reh25sKCyxjzRkFLXkTlzIjvZk0IRsb6v8A0/+Gjx5N6O5oa15hpq3oGknOLVJftXM233zub6o9ub66/o4x1PsIiZMjposMcX5pX9N6T1r42vkRKYPmfOTpFxtbo/Xq8xXtvO1K8PZqEacd3HdbveoIOWhWuvbzyqbcXVB7S2nhe4bc12b1tZP629afExWpc6X/eH1dLT87wIlWiZb4lns+74pu3zlYJ5NTcdX1raFy8tdG8QMPXQQ0L5i3VbtRHFPolH+IAACIBAChMwF5sUNg+mJZpA/7zKee4svWit1LyHutC7wnQ6M91CPq2TntDdnc1LftjetOTLbdct0oGc+qNNJfLNeF3j8Z1NDV/QSuWSLdPyf+aQd7eu166Vi0s1xr+bnUjUpjXS684urqj6i9qW2oHpwDf91op0sv+vbVl2WGoDSgfrxt7GktWrvd6dTr0eY41jb032WNAzpWsFCV2ip53Xh/Raj3Vi/i6x3C190bs7Vy5p04bZle0rF8+yHfdtTYvPbG9ecsXa5iW3hUPhu/2od5euu0jPge8YsiyS7Q7LRY9u6lo9dNrRS7F1Sv6JavOxthLUj4e8A7Y/YNONpswPucuIuJssHyGeYxq/FhVECSQgPk3rbB503R9iub254biOpiWf7Wiurw+/kr827IXu1mOvXc955WraOI3xg9BT5PBni+bV/Cp+wvTRar3qvSPlmKj0rddcMzl9SMHSTCbgTXv7Y0RcTfhkNIGeKW9vY5Lz1cnXNMYLH1DlD4X9deFXnmvTtuZVbc2Lzxt87utoqp/R2VQfOdDvujvqO+uI/FuFyFpf0fx2B98nvrrvwEM7dgtS7XfmZXX/0uviQu2w3zaEbTNIpC3s+3fnbnruR1on/UrndQ2n7MFJ2+NtTUsuUFY/kB53nRDfzeq/5htvQIy0/F+FHPmGpkPYBwLF8+a96rjdVcJcw0TDmQrMDNJom4RavT5vHTvhu3M2nXC3tjVW6HZdvGdsaNHjY51Lzt3MJpKZum22mutoHCLwdteXC3undN88RMIMV4/cPTM41kN5F+uA6e0jXxtrgAAIgMDYERjGxWHsjEPJo0OgaE7V5pdD+dV60bpGSxjOI9tmPzmUSE4SkouZZZXju7/QCuRje0Tff0B0cIjfaMCdIULvF6K4jxRr+Rp4u3YA/ZjGeZcUpcsj5ELlQryn/0lc9r3os50rG57UxtCp8e4CUrgIKU6gpLp6x2sbur+px8tPUtzUjDGvpCTSW1hRu4aJPklMj9PwPmbQ2nQqFGry77E4a2znAMc0wEiu1nNhiaY7TvM/UH/NOVR/AoOo5lHh0FEzy+ruHasne9QG0rIdceky/e9q3COokb4QLzL89lAkYeHxl7ZsIvJ/YyuKhaa4Pp9s00GWOALaGXSRbv8RXff0GHtQBw9vI2Lz/qwziOhIjXka4wemXu3UWjdum39CwdzqB+MnToA2iVmwR+0j5Zio9OFJoc3aCdiGm0aSuMFRlJVASUmJZ55kFeE5mqBHI0IGEjDbuaC87k69TlcKUdxBH9Wbd7i9SzGcwyzfdshplUFtK2JeK8zfJKFP6/XFPDFNQ3y26CDSvOLymkZjyxBpx1RdWF63yiP+hvq1Lb4hPJ6YPihMXxCR68Wn3+zBSdvjDsuPiLlS8zlR43CmDHvZ990FM0pr8W5RBbavYUZpZPujG7pWEPEluj1fINI9Vr/iBU2Xw8yH6O9HmOl0TVuh27Vuz0hmev7TdLt/WPUHaRwyMLNooj9FPTlu5ry6zrGow2v5aR9KKiq6o55Xo+wfTntn4AAIgEDWEBiqEyprQNgczWRZaWlpX0FF3TdE/M8S8X00dp8XWfz5vZu6Lyq4eGGcR/7HzsBULVmEjtTG0K25r33cdEKnqpmwaxgE5kQiO8nzr6KxPRYp2z7aCfHnqDiFOpBtnrAaq/NPr7bEbo6SM6v/Ccwx3gjHHZz/Xm2WWgdPtMLw9A7qNdNqJd1KHYiKsuP+TG2LxhTOnKsdG6dpGjUxRgtBmhHQzo6XyZO63pD3OTMVbZqZn/rmMheJ592c+obCwmwg0De168dC3KS+ikaEDCXQM/Ww2xyXzZMIjyTLRb2WvEAiXyoqW2BmtRh2sWOZ0AxM6YEwX21I0nuGWLQ9eQ9F6dNFFVWParkICSKgdVK/oLxmtR/1T9V2xnVkbmRJUN4jyGaj7/vf9aLerNmX1eIdiCMAZ0s6q3Lhf4jZzFzzhE0PGQiAAAikGgF0jqTaFkmyPUUVC35RWF5zCjFdoUV377oLRP+ObtDKrE8k9+dI3nE68HRDSSTSO7olZmzubxPf+3TGepdFjhVVLni6d2vfDHX53xoRkkTAvEugqLyuhiR6phb5IhF7FPtJvIRZT4PyKjn0haLy2i8bOxJfyMhz9D3+oK5lfdeaMN2TM+Vdw5meQrMYheDRL5VXTPnaW6H9OnLmkUdSaBRKRZbJIxDVDXm3S31HFs6rW15SermZaz55pWdRSdr5dOrtLYvNHcJZ5HX2uSqOo9eZ1Pbb3G2+X95bvsbEv09WGyS1iWSmdebpmoLSmvXhceEztP23johHra6lO72v7drfUpd3RGFF3R2UZp/C8tofesTnqtlm0Efd0X+jEzwmWZPrhWcUVtY+NTpFINcibd8VldeVe8KnKg0zqObp72iHqB4Df/B9/kRRRd03+gcqRrvELMm/qLz2IT/KX1F3zfGpPwgZTACugUDaE8CAT9pvwsQ4UFBWu8j16CPacfZ9Evq75jpaFcwezf9+LWduXj59+pyKipe1rJQMUa9vp0LYmZLGDTBKhIZ8uemA5KPzl+kVa8ZMw5kykEbzk/8SmcHEtOg4LLn88i0++V9moqDjwssNh3W3HE1iI8rbsI1ZwRffKo9JmEKCworLfz8574B3aeP3Yj2m7lHThnrHmSbZ2yDPkS/Loh6fXDi3ds3e5jIq64m/n+ZrO6d4LPxz02mj+jEJBRXV/9Trx522wrUDOy//5bfooWPTQjZcAk54Pz1nS5KPX+5m4ltE/HNedicWnFt+xdDv1hquQ2OUjol8LdpE/UHILAL/9YZJgq4Tfh/37wP/TTwG/1ictLiBZPqcOTsn5b3lND0HmGuvvY7jSzI6SYfcSr5Et2sdIcnnyCHNSpsEZ19UuSkczS0UFjOV3/oEG272kd8zOZf0+nnnFCxM35kjZpXX/NF16f3EfDURPa8xsYHpV0x8fkF5bcnZlZUpOaWiH83RQ43MNo31PQ3bGWab9kr3J0j4C+pQh57oRqNt+pJu11tccc4pLKs9sXhejenT0eJSP3TJDvOezmjqW0r0+GtdfxLhWrU16FoQVDfQVRBAAARAIHkEnOQVhZJSmQATyYzLav9aUFbzdRnvnkDkXKwVkYcSaTMT/c73aQaP804vKq/94RkX1A0xR3EiSx95Xt5rOzY6xMNrLI88+8SsIbTDdZykTY8QbLRbr7rBlR7tOPR/qvIxDdMjkajuyw/YjGCH/2iTj6Xszxu33+c5dEGADY/n7HB2BOiSLhah2HeqMPU6jvPzpBuTgAJNp5M2fm8OhSYWug5/RLQTOgHZvpkFE71AxJf3ht1jJ2/qXpCK0yuI67xAQttp0IeJX3vZzb97kDjpi66T8x1rocz/ej4317fqIBw2gRmlpdsV4q+HvcK+JdzsEy/y2X9Xz5RDLy6qWPALM93svmWZGmuL624gYo2Ukh8m2vYKTR7u+8tS0q9aQxEAABAASURBVIdUMEqIrHUL0rrjxHxv7Le/iKnDWjqLU6/uY66/4ko5Eb2ocXDwyHET2iYZXMBwl5/Y2PNvPX6etaUX5idtcsj2JHC2DjAUldXesnWbzNCBn+mqNU896M8+BJG/MEnBZMk7o7C8epV538Y+5JYSq5r36Ty6oSuiAz8f9kW+rkYl4ibER1mcs7Z2S0FBeU1q3XCkDg4M0ut0EdO/BsrMfz3+tnnixLY/jDLZcYTllVREugsran76el73+a4bOprJWSDEz9C+fnT/1/PPnF7xP/xsNOeSGRXVv9jXLJO9/hcrI1uJ+d7B5QqRVhWdlBq4ikQift/UQ/9XmZcOttcsC9GYTH9tykYEARAAgYEEnIEL+A8CZjqFojlVm01luW/KYSeIuOb9MF/TylWbXrz+REL/0v9D3X27UUn+U6Oml3YWfyE5dJR2pH6ieF7tPeZdPaYc1ad0MNPMicdXksiDJBRNQWNfZ5aWzd1+ou+QG7GrvVMO+T0LzxMR8yLDJ3RfeYBFFvROefvvR5zZKKywn+StYuLVmvVWjbo5aYdWKu/yc51vmeVUiqYSWTy39h5leYnaZaZY2KG/JjztEn3rrMsu6zILqRCdvlCjbusOIt51J5NsF+EVrtM9lu8Fo338iOn0njG35rGi8pov+X7vFBK+UPNcJSS/IabHmegVjfHOCa8Riem0+rMI3aOdEMt88c8aly/vKyyvWVRySfVr0yOReOtrcWMTeEv0PnboTiYaaN+L2inzpVTojJ8x96v/UKaLle/Ajo/XdT9cqfYNtHlsABJRuhccDTsLifgXzDSQMe3Dx5yzTL3gETL5Ei8jh8+ZnHfAwcXlNZcXl9VtLCkpGXzDAKXzJ/qWLtP5eKP6oOcC/U6loPU4ErpAj5dd5+1UMi69bCksr/ulMNUqzzcGd0TPm6bO6HHtGSlwU1Pv1ENf1HOjuSHHXI92w33UEbdy90Iq/RaVLnjaESpSm8zNOLvaGmKmzWns3bD1TpWPeTB1NF/cCjXkfuL+J8iJmDfo+fIHhWW1aXmzC43NRy6oq9tWVFb3696N3eZGw1P0WFosWmdSc/725jGlCwMD99dN+veJp/rTMi0l8k/RNqa2M+vunF5RYZ4SGLhKWv/X/S1qBn6KK+q+527sPkDroV/SeAsx/UEde16j9SkR3R/N9ftlTacD+7JO011NwicVltceW1BRvc6wV5meHvQ7RUNRVdVm9eMqIjOQ+uYUgC/4xHNnzau1DrpSmnzmzInsnFk6/7mC8ur6vo1dR+iGOJ6I5xHJzcR8FxGZ9rN5T8zg+Gdi+q3q72ThFb7wpb64RxZW1B1VVFbzPyUVC16u1AFV1adl6N3Bl1N/PfHN+udmFvpJ3nivlVLso/VWr29D14+1vf4dPS+ZQbvd9dj7SfwrU8xcmAMCIDDKBFI1ewz4pOqWSQG7zIWsqKLqUa0cXt0zpfv83Gj4XPH808V1TvWIPx4UyaHpTo58xmeZMXnTtpKCigWLC+em59zAhZdVP+47dI4eKCcG+TtWcvKcUyflbbtiV6V9TPcYs688sqnrxj6Sc7yod5awnFtQUXeDkY+pYbsKn64NwNfyui7wo3yK2V6+758c7ss5v0gHN3clSbmf/TZt+5E2zs501FZjc5Sczzy0sXst6yhfqhhbMH/+hrywc7EjcpKn5wRm5+SQm3/VjNJIzBMiqWLzSO0onnflq4UVNTfrefCifNcrcMk5i33nk37U6/fZ+D04hlhOZfI/xbneWX3UXVxQXldVXLFg3Rkp0AE4lP9mCpQeJ3qp4/CZPtHVur9dzBT6VCp1ZHVtl287wqfrwNR8Jq4h1zl1ozPxNvVN28z6jbBPBMyApPQ4n/WFTh68b+/Nsoh/CkVputfjnpOX7+vxUFNVOLfmLnNH/z4ZmsIrm/eSvLax+3vmXLA3zEZzHVOP65l6WGcK40sr0/oOuH+ZT+50s80cohN9rTOaumMqOGHqYPtt7F5pzuHGvv4Y9WY8vGlzSjwtY2M0s6L2AdelGea8bux1Qu6pvVMOu6IkEtndmWZbLamy4oqqv/RGe2cwOyeRKx8L+c70SRu6zfQ+g+3A8jAImG1bWF59X1FZ7UJTZ/J8OsMnr/+Y8rRuOTBq5++JPtMnTf24j/KKtW5SXVi+4D6tqwhl+GdGJLK9qLzulr4ph3/ZdWim6/ifZpL+ds1ARua/uX7rcTTd1Tqr606aVVhe+7XCihoziJBWlArm1v6WhLRdyf3tcD/En9pvY5ep76WVH/GMNft/UXntQ4XlNU2F5XUX6qDHbN/vnWna04NjLztnyzi3YHJe9+yCiprLiitqbjDnI80/I/b/kurq1/rrn/RG/TNKcmrYC1+cqu0ns+1yvdzv6XF2OntvtAv1t1i342O6TRBAAARAYMwJOGNuAQxICwKm8+LsyspN5sWDhaXVj88qr/ljUDSDOzO/Uvev4rK6jdMjkbS/49r4YRqgQf6Oldx0KEyfE9mZKjtQJBLxzZ1F5sWQhlmq2LXbDnM3VXFlzWP922vegod1f+5/2me3Pnm/wyvJHDvaOHt+ptpqbJ5dXv2MYTy8tZOX6sxLql/bfXwUlNU8Yp6OSV7pyS3p9NLLt8woq35h5rzqJ4sqF/7JbBdbPLes7omC8oV/K7h44Ytm+obkWrnvpZUYP+fW/KpYOwgKympuKiif/7d9zzVxOZhBbt3nfqcdAT8oKK9pNNckPK2QOL4mp6Kqqs2mA8K2f49UVlSx4NHCytqnZlVVvXRGGgx6Gv8TEedEIjvP1XPBSHmNdvqiygVPm4GARPiIPIhKSlZ7xRVVfzHbTc9LD6Ra/cfUJcw53NjXHysX/icV6xID9yXzRIM5rxt7Z15a/WQq7q8llVduKphb/WBhad395+r2N5wH+oD/e0fA1JnM0xvFFQv7jymzDwyMM3VAUI+xJworap7PhGnb9oaSOR7MMTJj7oJ/FJTX/Xkgn93/zfVb0/zV1FnTvV5utnVRWXV/nbv40pq/Z/qxpoMeO8zNZqY9PTiWaBukaE7V5lRq/+/NPhxvnaIB9c/Zun+fneJPLBn7ztU2esFlCx80x5/+vsisQ9MxTkIAAiAAAskngAGf5DNHiSAAAiAAAiAAAiAAAtlOAP6DAAiAAAiAAAiAAAiAAAiAAAiAQIIJYMAnwUATkR3yAAEQAAEQAAEQAAEQAAEQAAEQAAEQyHwC8BAEQAAEQAAEQAAEEkkAAz6JpIm8QAAEQAAEQCBxBJATCIAACIAACIAACIAACIAACIAACIBA5hOAhyCQMAIY8EkYSmQEAiAAAiAAAiAAAiAAAiAAAokmgPxAAARAAARAAARAAARAAARAYHgEMOAzPE5IBQKpSQBWgQAIgAAIgAAIgAAIgAAIgAAIgAAIZD4BeAgCIAACIAACwyCAAZ9hQEISEAABEAABEAABEEhlArANBEAABEAABEAABEAABEAABEAABEAg8wkM5SEGfIYiBD0IgAAIgAAIgAAIgAAIgAAIgAAIpD4BWAgCIAACIAACIAACIJDlBDDgk+U7ANwHARDIFgLwEwRAAARAAARAAARAAARAAARAAARAIPMJwEMQAIFsJoABn2ze+vAdBEAABEAABEAABEAguwjAWxAAARAAARAAARAAARAAARAAgYwlgAGfjN20I3cMa4AACIAACIAACIAACIAACIAACIAACGQ+AXgIAiAAAiAAAiCQmQQw4JOZ2xVegQAIgAAIgMDeEsB6IAACIAACIAACIAACIAACIAACIAACmU8AHmYgAQz4ZOBGhUsgAAIgAAIgAAIgAAIgAAIgsG8EsDYIgAAIgAAIgAAIgAAIgEC6EcCAT7ptMdgLAqlAADaAAAiAAAiAAAiAAAiAAAiAAAiAAAhkPgF4CAIgAAIgkFYEMOCTVpsLxoIACIAACIAACIBA6hCAJSAAAiAAAiAAAiAAAiAAAiAAAiAAAqlDYLQGfFLHQ1gCAiAAAiAAAiAAAiAAAiAAAiAAAiAwWgSQLwiAAAiAAAiAAAiAQIoQwIBPimwImAECIAACmUkAXoEACIAACIAACIAACIAACIAACIAACGQ+AXgIAiCQCgQw4JMKWwE2gAAIgAAIgAAIgAAIgEAmE4BvIAACIAACIAACIAACIAACIAACo04AAz6jjhgFDEUAehAAARAAARAAARAAARAAARAAARAAgcwnAA9BAARAAARAAARGlwAGfEaXL3IHARAAARAAARAYHgGkAgEQAAEQAAEQAAEQAAEQAAEQAAEQyHwC8HAUCWDAZxThImsQAAEQAAEQAAEQAAEQAAEQAIGREEBaEAABEAABEAABEAABEACBvSWAAZ+9JYf1QAAEkk8AJYIACIAACIAACIAACIAACIAACIAACGQ+AXgIAiAAAiCwVwQw4LNX2LASCIAACIAACIAACIDAWBFAuSAAAiAAAiAAAiAAAiAAAiAAAiAAArEEMm3AJ9ZDSEAABEAABEAABEAABEAABEAABEAABDKNAPwBARAAARAAARAAARAYRAADPoOAYBEEQAAEQCATCMAHEAABEAABEAABEAABEAABEAABEACBzCcAD0EABAYSwIDPQBr4DwIgAAIgAAIgAAIgAAIgkDkE4AkIgAAIgAAIgAAIgAAIgAAIZBEBDPhk0caGq3sSwBIIgAAIgAAIgAAIgAAIgAAIgAAIgEDmE4CHIAACIAACIJAtBDDgky1bGn6CAAiAAAiAAAjYCEAGAiAAAiAAAiAAAiAAAiAAAiAAAiCQ+QSywkMM+GTFZoaTIAACIAACIAACIAACIAACIAACwQSgAQEQAAEQAAEQAAEQAIH0J4ABn/TfhvAABEBgtAkgfxAAARAAARAAARAAARAAARAAARAAgcwnAA9BAARAIM0JYMAnzTcgzAcBEAABEAABEAABEEgOAZQCAiAAAiAAAiAAAiAAAiAAAiAAAqlMAAM+idk6yAUEQAAEQAAEQAAEQAAEQAAEQAAEQCDzCcBDEAABEAABEAABEEhZAhjwSdlNA8NAAARAAATSjwAsBgEQAAEQAAEQAAEQAAEQAAEQAAEQyHwC8BAEUpMABnxSc7vAKhAAARAAARAAARAAARAAgXQlALtBAARAAARAAARAAARAAARAYAwIYMBnDKCjyOwmAO9BAARAAARAAARAAARAAARAAARAAAQynwA8BAEQAAEQAIFkE8CAT7KJozwQAAEQAAEQAAEQIAIDEAABEAABEAABEAABEAABEAABEACBzCeQVA8x4JNU3CgMBEAABEAABEAABEAABEAABEAABHYTwC8IgAAIgAAIgAAIgAAIJI4ABnwSxxI5gQAIgEBiCSA3EAABEAABEAABEAABEAABEAABEACBzCcAD0EABEAgQQQw4JMgkMgGBEAABEAABEAABEAABEaDAPIEARAAARAAARAAARAAARAAARAAgeEQwIDPcCilbhpYBgIclCBVAAABmUlEQVQgAAIgAAIgAAIgAAIgAAIgAAIgkPkE4CEIgAAIgAAIgAAIDEkAAz5DIkICEAABEAABEEh1ArAPBEAABEAABEAABEAABEAABEAABEAg8wnAQxCITwADPvH5QAsCIAACIAACIAACIAACIAAC6UEAVoIACIAACIAACIAACIAACGQ1AQz4ZPXmh/PZRAC+ggAIgAAIgAAIgAAIgAAIgAAIgAAIZD4BeAgCIAACIJC9BDDgk73bHp6DAAiAAAiAAAhkHwF4DAIgAAIgAAIgAAIgAAIgAAIgAAIgkKEEBgz4ZKiHcAsEQAAEQAAEQAAEQAAEQAAEQAAEQGAAAfwFARAAARAAARAAARDIRAIY8MnErQqfQAAEQGBfCGBdEAABEAABEAABEAABEAABEAABEACBzCcAD0EABDKOAAZ8Mm6TwiEQAAEQAAEQAAEQAAEQ2HcCyAEEQAAEQAAEQAAEQAAEQAAEQCC9CGDAJ722V6pYCztAAARAAARAAARAAARAAARAAARAAAQynwA8BAEQAAEQAAEQSCMC/w8AAP//lSifGgAAAAZJREFUAwDmWSKoWaQNTwAAAABJRU5ErkJggg==" alt="Sanaré" style="max-height:100px;margin-bottom:8px;" /></div>`
      : "";

  const html = `
  <div class="factura-pdf">
    <div class="factura-pdf-header">
      <div class="emisor">
        ${logoHtml}
        <h2>Datos del cliente</h2>
        <div class="factura-pdf-datos">
          <strong>${escapeXml(EMISOR.nombre)}</strong><br/>
          RFC: ${escapeXml(EMISOR.rfc)}<br/>
          ${escapeXml(EMISOR.direccion)}<br/>
          Régimen fiscal: ${escapeXml(formatearClaveDescripcion("regimenFiscal", EMISOR.regimenFiscal))}<br/>
          Lugar de expedición: ${escapeXml(EMISOR.cp)}
        </div>
      </div>

      <div class="factura-pdf-header-bottom">
        <div class="factura-pdf-comprobante">
          <h2>Comprobante fiscal digital</h2>
          <div class="factura-pdf-datos">
            Serie: ${escapeXml(datosFactura.serie)} Folio: ${escapeXml(datosFactura.folio)}<br/>
            Fecha y hora: ${escapeXml(datosFactura.fecha)}<br/>
            Forma de pago: ${escapeXml(formatearClaveDescripcion("formaPago", datosFactura.formaPago))}<br/>
            Método de pago: ${escapeXml(formatearClaveDescripcion("metodoPago", datosFactura.metodoPago))}<br/>
            Moneda: MXN - Tipo de comprobante: ${escapeXml(formatearTipoComprobante(datosFactura.tipoComprobante || "I"))}
          </div>
        </div>

        <div class="receptor">
          <h2>Receptor</h2>
          <div class="factura-pdf-datos">
            <strong>${escapeXml(cliente.nombre)}</strong><br/>
            RFC: ${escapeXml(cliente.rfc)}<br/>
            CP: ${escapeXml(cliente.cp)}<br/>
            Uso CFDI: ${escapeXml(formatearClaveDescripcion("usoCFDI", cliente.usoCfdi))}<br/>
            Régimen fiscal: ${escapeXml(formatearClaveDescripcion("regimenFiscal", cliente.regimen))}<br/>
            Dirección: ${escapeXml(cliente.direccion)}
          </div>
        </div>
      </div>
    </div>

    <div class="factura-pdf-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Clave</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>P/U</th>
            <th>Importe</th>
            <th>Coaseguro</th>
            <th>Deducible</th>
            <th>IVA</th>
          </tr>
        </thead>
        <tbody>
          ${conceptosHtml}
        </tbody>
      </table>
    </div>

    <div class="factura-pdf-notas">
      <strong>Notas:</strong>
      <div class="factura-pdf-notas-cuerpo">${escapeXml(datosFactura.notas || "")}</div>
    </div>

    <div class="factura-pdf-totales">
      Subtotal: ${formatoMonedaBonito(datosFactura.subtotalBase ?? datosFactura.subtotal)}<br/>
      Descuento: ${formatoMonedaBonito(datosFactura.descuentoTotal || 0)}<br/>
      IVA 16%: ${formatoMonedaBonito(datosFactura.ivaTotal)}<br/>
      Total coaseguro: ${formatoMonedaBonito(datosFactura.coaseguroTotal || 0)}<br/>
      Total deducible: ${formatoMonedaBonito(datosFactura.deducibleTotal || 0)}<br/>
      Total CFDI: ${formatoMonedaBonito(datosFactura.total)}<br/>
      <strong>Total paciente: ${formatoMonedaBonito(datosFactura.totalPaciente != null ? datosFactura.totalPaciente : datosFactura.total)}</strong>
    </div>

    <div class="factura-pdf-sellos">
      <strong>Sellos y cadena original</strong><br/>
      (Aquí puedes imprimir el sello del CFDI, sello SAT y cadena original una vez timbrado)
    </div>
  </div>`;

  preview.innerHTML = html;

  // también para el área de impresión
  document.getElementById("print-area").innerHTML = html;
}

function verImpresion() {
  const clienteId = document.getElementById("fac-cliente").value;
  const cliente = clientes.find((c) => c.id === clienteId);
  if (!cliente) {
    alert("Selecciona un cliente antes de imprimir.");
    return;
  }
  conceptosFactura = leerConceptosFactura();
  let subtotalBase = 0;
  let descuentoTotal = 0;
  let ivaTotal = 0;
  let coaseguroTotal = 0;
  let deducibleTotal = 0;
  conceptosFactura.forEach((c) => {
    const base = c.importeBase != null ? c.importeBase : c.importe || 0;
    const desc = c.descuentoMonto || 0;
    subtotalBase += base;
    descuentoTotal += desc;
    ivaTotal += c.iva || 0;
    coaseguroTotal += c.coaseguro || 0;
    deducibleTotal += c.deducible || 0;
  });
  const subtotalNeto = subtotalBase - descuentoTotal;
  const totalCfdi = subtotalNeto + ivaTotal;
  const totalPaciente = totalCfdi - coaseguroTotal - deducibleTotal;
  const notasInput = document.getElementById("fac-notas");
  const notas = notasInput ? notasInput.value.trim() : "";
  const datosFactura = {
    serie: document.getElementById("fac-serie").value.trim(),
    folio: document.getElementById("fac-folio").value.trim(),
    fecha: document.getElementById("fac-fecha").value.trim() || hoyIso(),
    formaPago: document.getElementById("fac-forma-pago").value,
    metodoPago: document.getElementById("fac-metodo-pago").value,
    tipoComprobante: (document.getElementById("fac-tipo-comp")?.value || "I"),
    subtotal: subtotalNeto,
    subtotalBase,
    descuentoTotal,
    ivaTotal,
    total: totalCfdi,
    coaseguroTotal,
    deducibleTotal,
    totalPaciente,
    notas
  };
  actualizarVistaImpresion(cliente, datosFactura);
  registrarFacturaEnHistorico(cliente, datosFactura, conceptosFactura);
  guardarFolioUsado(datosFactura.folio);
  window.print();
}




function buildHistoricoAccionesMenuHtml(f, estatus) {
  const disabled = (cond) => cond ? "" : ' disabled';
  const cls = (cond) => cond ? "" : " disabled";

  const canCancel = estatus !== "CANCELADA";
  const isPPD = (f.metodoPago || "") === "PPD";
  const canPagos = canCancel; // permitir administrar pagos en VIGENTE (PPD recomendado)
// Botón y menú
  return `
    <div class="dropdown" data-id="${f.id}">
      <button type="button" class="btn small btn-actions-menu" aria-haspopup="true" aria-expanded="false" title="Acciones">Acciones ▾</button>
      <div class="dropdown-menu hidden" role="menu">
        <button type="button" class="dropdown-item" data-action="detalle" data-id="${f.id}">
          <span class="icon">🧾</span><span>Ver detalle</span>
        </button>
        <button type="button" class="dropdown-item" data-action="pdf" data-id="${f.id}">
          <span class="icon">📄</span><span>Descargar PDF</span>
        </button>
        <button type="button" class="dropdown-item" data-action="xml" data-id="${f.id}">
          <span class="icon">🧩</span><span>Descargar XML</span>
        </button>
        <button type="button" class="dropdown-item" data-action="correo" data-id="${f.id}">
          <span class="icon">✉️</span><span>Enviar por correo</span>
        </button>
        <div class="dropdown-divider"></div>
        <button type="button" class="dropdown-item${cls(canPagos)}" data-action="pagos" data-id="${f.id}">
          <span class="icon">💳</span><span>Administrar pagos</span>
        </button>
        <button type="button" class="dropdown-item${cls(canCancel)}" data-action="duplicar" data-id="${f.id}">
          <span class="icon">📋</span><span>Duplicar</span>
        </button>
        <button type="button" class="dropdown-item${cls(canCancel)}" data-action="cancelar" data-id="${f.id}">
          <span class="icon">✖️</span><span>Cancelar</span>
        </button>
      </div>
    </div>
  `;
}


function posicionarMenuAcciones(menuEl, anchorBtn) {
  try {
    const rect = anchorBtn.getBoundingClientRect();
    // Hacer visible para medir dimensiones reales
    menuEl.style.visibility = "hidden";
    menuEl.style.display = "block";
    const menuW = menuEl.offsetWidth || 220;
    const menuH = menuEl.offsetHeight || 260;

    const margin = 8;

    // Preferimos abrir a la DERECHA del botón
    let left = rect.right + margin;
    let top = rect.top;

    // Si se sale por la derecha, abrir a la izquierda
    if (left + menuW > window.innerWidth - margin) {
      left = rect.left - menuW - margin;
    }
    // Si aún se sale, pegar al borde
    left = Math.max(margin, Math.min(left, window.innerWidth - menuW - margin));

    // Ajuste vertical para que no se salga por abajo
    if (top + menuH > window.innerHeight - margin) {
      top = window.innerHeight - menuH - margin;
    }
    top = Math.max(margin, top);

    menuEl.style.left = `${left}px`;
    menuEl.style.top = `${top}px`;
  } finally {
    menuEl.style.visibility = "visible";
  }
}

function initHistoricoAccionesDelegation() {
  // Delegación global (más robusta): funciona aunque se re-renderice la tabla.
  if (window.__histActionsBound) return;
  window.__histActionsBound = true;

  const closeAll = () => {
    document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.add("hidden"));
    document.querySelectorAll(".btn-actions-menu").forEach(b => b.setAttribute("aria-expanded", "false"));
  };

  // Cerrar al hacer click fuera
  document.addEventListener("click", () => closeAll());

  
  window.addEventListener("scroll", closeAll, true);
  window.addEventListener("resize", closeAll);
// Manejo de clicks en botón/menú (capturamos para evitar conflictos)
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".btn-actions-menu");
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();

      const wrap = toggle.closest(".dropdown");
      const menu = wrap ? wrap.querySelector(".dropdown-menu") : null;
      if (!menu) return;

      const willOpen = menu.classList.contains("hidden");
      closeAll();

      if (willOpen) {
        menu.classList.remove("hidden");
        toggle.setAttribute("aria-expanded", "true");
        // Abrir como ventanita al lado derecho del botón
        requestAnimationFrame(() => posicionarMenuAcciones(menu, toggle));
      }
      return;
    }

    const item = e.target.closest(".dropdown-item");
    if (item) {
      e.preventDefault();
      e.stopPropagation();
      if (item.classList.contains("disabled")) return;

      const action = item.dataset.action;
      const facturaId = item.dataset.id;
      closeAll();
      ejecutarAccionHistorico(action, facturaId);
    }
  }, true);
}

function ejecutarAccionHistorico(action, facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return alert("No se encontró la factura.");

  switch (action) {
    case "detalle":
      verDetalleFacturaHistorico(facturaId);
      break;
    case "pdf":
      imprimirFacturaDesdeHistorico(facturaId);
      break;
    case "xml":
      descargarXmlDesdeHistorico(facturaId);
      break;
    case "correo":
      enviarFacturaPorCorreo(facturaId);
      break;    case "pagos":
      if ((f.estatus || "") === "CANCELADA") return alert("No puedes administrar pagos en una factura CANCELADA.");
      abrirAdminPagos(facturaId);
      break;
    case "duplicar":
      duplicarFacturaDesdeHistorico(facturaId);
      break;
    case "cancelar":
      abrirModalCancelacion(facturaId);
      break;
    default:
      console.warn("Acción no soportada:", action);
  }
}


// ========================= ADMINISTRAR PAGOS (drawer) =========================
let __adminPagosRestore = null;

function initAdminPagosDrawer() {
  if (document.getElementById("admin-pagos-drawer")) return;

  const overlay = document.createElement("div");
  overlay.id = "admin-pagos-drawer";
  overlay.className = "drawer-overlay hidden";
  overlay.innerHTML = `
    <div class="drawer-panel" role="dialog" aria-modal="true">
      <div class="drawer-header">
        <div>
          <div class="drawer-title">Administrar pagos</div>
          <div class="drawer-subtitle" id="drawer-pagos-subtitle"></div>
        </div>
        <button type="button" class="drawer-close" id="btn-cerrar-drawer-pagos" aria-label="Cerrar">×</button>
      </div>

      <div class="drawer-body">
        <div class="card" id="drawer-factura-resumen">
          <h3>Factura original</h3>
          <div class="grid-3 small">
            <div><div class="muted">Versión</div><div id="dp-version">4.0</div></div>
            <div><div class="muted">RFC</div><div id="dp-rfc">—</div></div>
            <div><div class="muted">Razón social</div><div id="dp-razon">—</div></div>
            <div><div class="muted">Serie/Folio</div><div id="dp-seriefolio">—</div></div>
            <div><div class="muted">Monto pagado</div><div id="dp-pagado">—</div></div>
            <div><div class="muted">Monto pendiente</div><div id="dp-pendiente">—</div></div>
          </div>
          <div class="grid-3 small" style="margin-top:10px;">
            <div><div class="muted">Moneda</div><div id="dp-moneda">MXN</div></div>
            <div><div class="muted">Tipo cambio</div><div id="dp-tc">1.00</div></div>
            <div><div class="muted">Método</div><div id="dp-metodo">—</div></div>
          </div>
          <p class="help" id="dp-help" style="margin-top:10px;"></p>
        </div>

        <div id="drawer-pagos-content"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnClose = document.getElementById("btn-cerrar-drawer-pagos");
  if (btnClose) btnClose.addEventListener("click", cerrarAdminPagos);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarAdminPagos();
  });

  document.addEventListener("keydown", (e) => {
    const el = document.getElementById("admin-pagos-drawer");
    if (!el || el.classList.contains("hidden")) return;
    if (e.key === "Escape") cerrarAdminPagos();
  });
}

function initPagosTablaAcciones() {
  const table = document.getElementById("tabla-pagos");
  if (!table || table.dataset.bound === "1") return;
  table.dataset.bound = "1";

  table.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains("pago-edit")) {
      cargarPagoEnForm(id);
      return;
    }
    if (btn.classList.contains("pago-del")) {
      eliminarPago(id);
      return;
    }
  });
}

function abrirAdminPagos(facturaId) {
  initAdminPagosDrawer();
  const overlay = document.getElementById("admin-pagos-drawer");
  const content = document.getElementById("drawer-pagos-content");
  if (!overlay || !content) return;

  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return alert("No se encontró la factura.");

  // Activar filtro de pagos para esta factura
  window.__pagosFacturaFilterId = facturaId;

  // Guardar para restaurar DOM cuando se cierre
  const formPago = document.getElementById("form-pago");
  const cardTabla = document.getElementById("tabla-pagos") ? document.getElementById("tabla-pagos").closest(".card") : null;

  const restore = [];
  if (formPago) {
    restore.push({ el: formPago, parent: formPago.parentNode, next: formPago.nextSibling, wasHidden: formPago.classList.contains("hidden") });
  }
  if (cardTabla) {
    restore.push({ el: cardTabla, parent: cardTabla.parentNode, next: cardTabla.nextSibling, wasHidden: false });
  }
  __adminPagosRestore = restore;

  // Mover dentro del drawer
  content.innerHTML = "";
  if (formPago) {
    formPago.classList.remove("hidden");
    content.appendChild(formPago);
  }
  if (cardTabla) {
    content.appendChild(cardTabla);
  }

  // Prefill del formulario
  if (formPago) {
    formPago.dataset.facturaId = facturaId;
    const selCli = document.getElementById("pag-cliente");
    if (selCli) selCli.value = f.clienteId || "";
    const factRel = document.getElementById("pag-facturas");
    if (factRel) factRel.value = `${(f.serie || "").trim()}-${String(f.folio || "").trim()}`;
    const monto = document.getElementById("pag-monto");
    if (monto) {
      const info = calcularPagoResumenFactura(facturaId);
      monto.value = Number(info.pendiente || 0).toFixed(2);
    }
    const fecha = document.getElementById("pag-fecha");
    if (fecha && !fecha.value) fecha.value = hoyIso();
  }

  // Actualizar resumen
  actualizarResumenFacturaPagos(facturaId);
  renderTablaPagos();

  // Mostrar overlay
  overlay.classList.remove("hidden");
}

function cerrarAdminPagos() {
  const overlay = document.getElementById("admin-pagos-drawer");
  if (overlay) overlay.classList.add("hidden");

  // Quitar filtro
  window.__pagosFacturaFilterId = "";

  // Restaurar DOM original
  if (Array.isArray(__adminPagosRestore)) {
    __adminPagosRestore.forEach((r) => {
      if (!r || !r.el || !r.parent) return;
      if (r.next) r.parent.insertBefore(r.el, r.next);
      else r.parent.appendChild(r.el);
      if (r.el && r.el.id === "form-pago") {
        if (r.wasHidden) r.el.classList.add("hidden");
        r.el.dataset.facturaId = "";
      }
    });
  }
  __adminPagosRestore = null;

  // Re-render sin filtro
  renderTablaPagos();
}

function calcularPagoResumenFactura(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  const total = Number((f && f.total) || 0);
  const lista = (Array.isArray(pagos) ? pagos : []).filter(p => (p.facturaId || "") === facturaId);
  const pagado = lista.reduce((acc, p) => acc + Number(p.monto || 0), 0);
  const pendiente = Math.max(0, total - pagado);
  return { total, pagado, pendiente, pagos: lista.length };
}

function actualizarResumenFacturaPagos(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return;

  const cliente = clientes.find(c => c.id === f.clienteId) || {};
  const info = calcularPagoResumenFactura(facturaId);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("dp-rfc", cliente.rfc || "—");
  set("dp-razon", cliente.nombre || "—");
  set("dp-seriefolio", `${(f.serie || "").trim()}-${String(f.folio || "").trim()}`);
  set("dp-pagado", formatoMoneda(info.pagado || 0));
  set("dp-pendiente", formatoMoneda(info.pendiente || 0));
  set("dp-moneda", (f.moneda || "MXN"));
  set("dp-tc", Number(f.tipoCambio || 1).toFixed(2));
  set("dp-metodo", (f.metodoPago || "—"));

  const help = document.getElementById("dp-help");
  if (help) {
    if ((f.metodoPago || "") !== "PPD") {
      help.textContent = "Nota: Esta factura es PUE. El complemento de pago no es obligatorio, pero puedes registrar/editar pagos internos aquí.";
    } else {
      help.textContent = "Factura PPD: aquí puedes registrar pagos y generar la maqueta del complemento de pago.";
    }
  }
}

function sincronizarSaldoFacturaConPagos(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return;

  const info = calcularPagoResumenFactura(facturaId);
  f.montoPagado = info.pagado;
  f.montoPendiente = info.pendiente;

  // Guardar y actualizar histórico si está visible
  guardarFacturasEnLocalStorage();
  renderHistoricoFacturacion();
}

function cargarPagoEnForm(pagoId) {
  const p = (pagos || []).find(x => x && x.id === pagoId);
  if (!p) return;

  const form = document.getElementById("form-pago");
  if (!form) return;

  // Si el drawer está cerrado y el pago tiene facturaId, abrirlo
  if (p.facturaId && document.getElementById("admin-pagos-drawer") && document.getElementById("admin-pagos-drawer").classList.contains("hidden")) {
    abrirAdminPagos(p.facturaId);
  }

  form.dataset.editId = p.id || "";
  if (p.facturaId) form.dataset.facturaId = p.facturaId;

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal("pag-cliente", p.clienteId || "");
  setVal("pag-fecha", p.fechaPago || hoyIso());
  setVal("pag-serie", p.serie || "CP");
  setVal("pag-folio", p.folio || "");
  setVal("pag-forma-pago", p.formaPago || "01");
  setVal("pag-monto", Number(p.monto || 0).toFixed(2));
  setVal("pag-facturas", p.facturasRel || "");
  setVal("pag-notas", p.notas || "");

  // Actualizar JSON mostrado
  const jsonArea = document.getElementById("pag-json");
  if (jsonArea) jsonArea.value = "";
}

function eliminarPago(pagoId) {
  const idx = (pagos || []).findIndex(x => x && x.id === pagoId);
  if (idx < 0) return;

  const fid = (pagos[idx].facturaId || "");
  if (!confirm("¿Eliminar este pago?")) return;

  pagos.splice(idx, 1);
  guardarEnLocalStorage();
  renderTablaPagos();

  if (fid) {
    actualizarResumenFacturaPagos(fid);
    sincronizarSaldoFacturaConPagos(fid);
  }
}
}

function irASeccion(section) {
  const btn = document.querySelector(`.nav-btn[data-section="${section}"]`);
  if (btn) btn.click();
}

function verDetalleFacturaHistorico(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return;

  const lineas = (f.conceptos || []).map((c, i) => {
    const desc = (c.descripcion || "").toString();
    const cant = Number(c.cantidad || 0).toFixed(2);
    const imp = formatoMonedaBonito(Number(c.importe || 0));
    return `${i + 1}. ${desc} | Cant: ${cant} | Importe: ${imp}`;
  }).join("\n");

  const contenido = [
    `Serie/Folio: ${(f.serie || "")}${f.folio ? "-" + f.folio : ""}`,
    `Fecha: ${f.fecha || ""}`,
    `Cliente: ${f.clienteNombre || ""}`,
    `RFC: ${f.clienteRfc || ""}`,
    `Forma/Método: ${(f.formaPago || "")} / ${(f.metodoPago || "")}`,
    `Tipo: ${f.tipoComprobante || "I"}`,
    `Total: ${formatoMonedaBonito(Number(f.total || 0))}`,
    "",
    "Conceptos:",
    lineas || "(sin conceptos)",
    "",
    `Notas: ${f.notas || ""}`
  ].join("\n");

  // Ventana simple (no bloquea la app)
  const w = window.open("", "_blank", "width=720,height=720");
  if (!w) return alert(contenido);
  w.document.write(`<pre style="white-space:pre-wrap;font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial; padding:16px">${escapeHtml(contenido)}</pre>`);
  w.document.close();
}

function imprimirFacturaDesdeHistorico(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return alert("No se encontró la factura.");

  const cliente = clientes.find(c => c.id === f.clienteId) || {
    id: f.clienteId,
    nombre: f.clienteNombre || "",
    rfc: f.clienteRfc || "",
    regimen: f.clienteRegimen || "",
    usoCfdi: f.clienteUsoCfdi || "",
    cp: f.clienteCp || "",
    direccion: f.clienteDireccion || ""
  };

  conceptosFactura = Array.isArray(f.conceptos) ? f.conceptos : [];
  const datosFactura = {
    serie: f.serie || "",
    folio: f.folio || "",
    fecha: f.fecha || hoyIso(),
    formaPago: f.formaPago || "",
    metodoPago: f.metodoPago || "",
    tipoComprobante: f.tipoComprobante || "I",
    subtotal: Number(f.subtotal || 0),
    ivaTotal: Number(f.ivaTotal || 0),
    total: Number(f.total || 0),
    totalPaciente: Number(f.total || 0),
    notas: f.notas || ""
  };

  actualizarVistaImpresion(cliente, datosFactura);
  window.print();
}

function construirXmlDesdeFactura(cliente, f) {
  const serie = (f.serie || "").trim();
  const folio = String(f.folio || "").trim();
  const formaPago = f.formaPago || "";
  const metodoPago = f.metodoPago || "";
  const moneda = f.moneda || "MXN";
  const lugarExp = f.lugarExp || EMISOR.cp;
  const tipoComp = f.tipoComprobante || "I";
  const fecha = f.fecha || hoyIso();

  const conceptos = Array.isArray(f.conceptos) ? f.conceptos : [];
  let subtotal = 0;
  let ivaTotal = 0;

  const conceptosXml = conceptos.map((c) => {
    const base = Number(c.importe || 0);
    const importeIva = Number(c.iva || 0);
    subtotal += base;
    ivaTotal += importeIva;

    return `
  <cfdi:Concepto ObjetoImp="02"
    ClaveProdServ="${escapeXml(c.claveProdServ || "01010101")}"
    Cantidad="${Number(c.cantidad || 0).toFixed(4)}"
    ClaveUnidad="${escapeXml(c.claveUnidad || "E48")}"
    Unidad="${escapeXml(c.unidad || "SERV")}"
    Descripcion="${escapeXml(c.descripcion || "")}"
    ValorUnitario="${Number(c.valorUnitario || 0).toFixed(6)}"
    Importe="${base.toFixed(2)}">
    <cfdi:Impuestos>
      <cfdi:Traslados>
        <cfdi:Traslado Base="${base.toFixed(2)}"
          Impuesto="002"
          TipoFactor="Tasa"
          TasaOCuota="0.160000"
          Importe="${importeIva.toFixed(2)}" />
      </cfdi:Traslados>
    </cfdi:Impuestos>
  </cfdi:Concepto>`;
  }).join("");

  const total = subtotal + ivaTotal;

  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  Version="4.0"
  Serie="${escapeXml(serie)}"
  Folio="${escapeXml(folio)}"
  Fecha="${fecha}"
  Moneda="${escapeXml(moneda)}"
  Exportacion="01"
  TipoDeComprobante="${escapeXml(tipoComp)}"
  LugarExpedicion="${escapeXml(lugarExp)}"
  SubTotal="${subtotal.toFixed(2)}"
  Total="${total.toFixed(2)}"
  FormaPago="${escapeXml(formaPago)}"
  MetodoPago="${escapeXml(metodoPago)}"
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd">
  <cfdi:Emisor Rfc="${escapeXml(EMISOR.rfc)}" Nombre="${escapeXml(EMISOR.nombre)}" RegimenFiscal="${escapeXml(EMISOR.regimenFiscalClave)}" />
  <cfdi:Receptor Rfc="${escapeXml(cliente.rfc || "")}"
    Nombre="${escapeXml(cliente.nombre || "")}"
    DomicilioFiscalReceptor="${escapeXml(cliente.cp || "")}"
    RegimenFiscalReceptor="${escapeXml((cliente.regimen || "").split(" - ")[0] || "")}"
    UsoCFDI="${escapeXml((cliente.usoCfdi || "").split(" - ")[0] || "G03")}" />
  <cfdi:Conceptos>${conceptosXml}
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${ivaTotal.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${ivaTotal.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
</cfdi:Comprobante>`;
}

function descargarXmlDesdeHistorico(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return alert("No se encontró la factura.");
  const cliente = clientes.find(c => c.id === f.clienteId) || { nombre: f.clienteNombre || "", rfc: f.clienteRfc || "", cp: "" };

  const xml = construirXmlDesdeFactura(cliente, f);
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const a = document.createElement("a");
  const nombre = `CFDI_${(f.serie || "")}${f.folio ? "-" + f.folio : ""}.xml`.replace(/[^a-z0-9\-_.]/gi, "_");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

function enviarFacturaPorCorreo(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return alert("No se encontró la factura.");
  const subject = encodeURIComponent(`Factura ${(f.serie || "")}${f.folio ? "-" + f.folio : ""} - ${f.clienteNombre || ""}`);
  const body = encodeURIComponent(
    `Hola,\n\nTe comparto la información de tu factura.\n\n` +
    `Serie/Folio: ${(f.serie || "")}${f.folio ? "-" + f.folio : ""}\n` +
    `Fecha: ${f.fecha || ""}\n` +
    `Cliente: ${f.clienteNombre || ""}\n` +
    `Total: ${formatoMonedaBonito(Number(f.total || 0))}\n\n` +
    `Nota: En este demo local no se adjuntan archivos automáticamente. Puedes usar "Descargar PDF" y "Descargar XML" y adjuntarlos en tu correo.\n`
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function duplicarFacturaDesdeHistorico(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return alert("No se encontró la factura.");

  irASeccion("facturacion");

  // Cliente y campos base
  const selCli = document.getElementById("fac-cliente");
  if (selCli) selCli.value = f.clienteId || "";

  const serie = document.getElementById("fac-serie");
  if (serie) serie.value = f.serie || "";

  // Folio NO lo copiamos para evitar duplicados; lo dejamos como está o vacío
  const folio = document.getElementById("fac-folio");
  if (folio) folio.value = "";

  const forma = document.getElementById("fac-forma-pago");
  if (forma) forma.value = f.formaPago || (forma.value || "");

  const metodo = document.getElementById("fac-metodo-pago");
  if (metodo) metodo.value = f.metodoPago || (metodo.value || "");

  const tipo = document.getElementById("fac-tipo-comp");
  if (tipo) tipo.value = f.tipoComprobante || "I";

  const notas = document.getElementById("fac-notas");
  if (notas) notas.value = f.notas || "";

  // Conceptos: limpiamos y recreamos filas
  const tbody = document.getElementById("fac-conceptos-body");
  if (tbody) tbody.innerHTML = "";

  (Array.isArray(f.conceptos) ? f.conceptos : []).forEach((c) => {
    agregarConcepto();
    const rows = Array.from(document.querySelectorAll("#fac-conceptos-body tr"));
    const tr = rows[rows.length - 1];
    if (!tr) return;

    tr.querySelector(".fac-clave-interna").value = c.claveInterna || "";
    tr.querySelector(".fac-descripcion").value = c.descripcion || "";
    tr.querySelector(".fac-cantidad").value = c.cantidad != null ? c.cantidad : 1;
    tr.querySelector(".fac-clave-prodserv").value = c.claveProdServ || "";
    tr.querySelector(".fac-clave-unidad").value = c.claveUnidad || "";
    tr.querySelector(".fac-unidad").value = c.unidad || "";
    tr.querySelector(".fac-precio").value = c.valorUnitario != null ? c.valorUnitario : 0;
    const desc = tr.querySelector(".fac-descuento");
    if (desc) desc.value = c.descuentoPorcentaje != null ? c.descuentoPorcentaje : 0;
    tr.querySelector(".fac-iva").value = c.iva != null ? c.iva : 0;
    const co = tr.querySelector(".fac-coaseguro");
    if (co) co.value = c.coaseguro != null ? c.coaseguro : 0;
    const de = tr.querySelector(".fac-deducible");
    if (de) de.value = c.deducible != null ? c.deducible : 0;
  });

  recalcularTotales();
}

// ========================= HISTÓRICO DE FACTURACIÓN =========================
function obtenerClaveFacturasActual() {
  return empresaActual === "sanare" ? LS_KEYS.facturasSanare : LS_KEYS.facturasNomad;
}

function guardarFacturasEnLocalStorage() {
  try {
    localStorage.setItem(obtenerClaveFacturasActual(), JSON.stringify(facturas || []));
  } catch (e) {
    console.warn("No se pudo guardar facturas en localStorage", e);
  }
}

function registrarFacturaEnHistorico(cliente, datosFactura, conceptos) {
  if (!cliente || !datosFactura) return;

  const serie = (datosFactura.serie || "").trim();
  const folio = String(datosFactura.folio || "").trim();
  const keyMatch = `${serie}::${folio}`;

  const registro = {
    id: uid(),
    keyMatch,
    empresa: empresaActual,
    serie,
    folio,
    fecha: datosFactura.fecha || hoyIso(),
    clienteId: cliente.id || "",
    clienteNombre: cliente.nombre || "",
    clienteRfc: cliente.rfc || "",
    total: Number(datosFactura.total || 0),
    subtotal: Number(datosFactura.subtotal || 0),
    ivaTotal: Number(datosFactura.ivaTotal || 0),
    formaPago: datosFactura.formaPago || "",
    metodoPago: datosFactura.metodoPago || "",
    tipoComprobante: datosFactura.tipoComprobante || "I",
    notas: datosFactura.notas || "",
    conceptos: Array.isArray(conceptos) ? conceptos : [],
    estatus: "VIGENTE",
    cancelacion: null,
    complementoHabilitado: false,
    createdAt: new Date().toISOString()
  };

  // Si ya existe una factura con el mismo Serie/Folio, la actualizamos (sin duplicar)
  const idx = (facturas || []).findIndex(f => (f && f.keyMatch) === keyMatch);
  if (idx >= 0) {
    const anterior = facturas[idx] || {};
    registro.id = anterior.id || registro.id;
    registro.estatus = anterior.estatus || registro.estatus;
    registro.cancelacion = anterior.cancelacion || null;
    registro.complementoHabilitado = !!anterior.complementoHabilitado;
    facturas[idx] = registro;
    ultimaFacturaId = registro.id;
  } else {
    facturas.push(registro);
    ultimaFacturaId = registro.id;
  }

  guardarFacturasEnLocalStorage();
  renderHistoricoFacturacion();
  try { if (typeof renderClientesEnPago === "function") renderClientesEnPago(); } catch (_) {}
}

function renderHistoricoFacturacion() {
  const tbl = document.getElementById("tbl-historico-facturas");
  if (!tbl) return;
  const tbody = tbl.querySelector("tbody");
  if (!tbody) return;

  const items = Array.isArray(facturas) ? facturas.slice().reverse() : [];
  tbody.innerHTML = "";

  if (items.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="muted">Aún no hay facturas registradas.</td>`;
    tbody.appendChild(tr);
    return;
  }

  items.forEach((f) => {
    const tr = document.createElement("tr");
    const serieFolio = `${escapeHtml(f.serie || "")}${f.folio ? "-" + escapeHtml(String(f.folio)) : ""}`;
    const metodo = escapeHtml(f.metodoPago || "");
    const estatus = f.estatus === "CANCELADA" ? "CANCELADA" : "VIGENTE";

    
const menuHtml = buildHistoricoAccionesMenuHtml(f, estatus);

tr.innerHTML = `
  <td>${serieFolio}</td>
  <td>${escapeHtml(f.fecha || "")}</td>
  <td>${escapeHtml(f.clienteNombre || "")}</td>
  <td>${formatoMonedaBonito(Number(f.total || 0))}</td>
  <td>${metodo}</td>
  <td>${estatus}</td>
  <td class="actions">${menuHtml}</td>
`;
    tbody.appendChild(tr);
  });

  }


function initHistoricoFacturacion() {
  renderHistoricoFacturacion();
  initHistoricoAccionesDelegation();
  initModalCancelacion();
}

function habilitarComplementoPago(facturaId) {
  const f = (facturas || []).find(x => x && x.id === facturaId);
  if (!f) return alert("No se encontró la factura.");
  if ((f.metodoPago || "") !== "PPD") return alert("Solo aplica para facturas con método PPD.");

  f.complementoHabilitado = true;
  guardarFacturasEnLocalStorage();
  renderHistoricoFacturacion();

  const formPago = document.getElementById("form-pago");
  if (formPago) formPago.classList.remove("hidden");

  const selCli = document.getElementById("pag-cliente");
  if (selCli) selCli.value = f.clienteId || "";
  const monto = document.getElementById("pag-monto");
  if (monto) monto.value = Number(f.total || 0).toFixed(2);
  const facturasTxt = document.getElementById("pag-facturas");
  if (facturasTxt) facturasTxt.value = `${f.serie || ""}-${f.folio || ""}`.trim();
  const fecha = document.getElementById("pag-fecha");
  if (fecha && !fecha.value) fecha.value = hoyIso();
}

function initModalCancelacion() {
  const modal = document.getElementById("modal-cancelar");
  if (!modal) return;

  const motivoSel = document.getElementById("cancel-motivo");
  const uuidWrap = document.getElementById("cancel-uuid-wrap");
  const uuidInp = document.getElementById("cancel-uuid");
  const obsInp = document.getElementById("cancel-obs");
  const btnOk = document.getElementById("btn-confirmar-cancelacion");
  const btnCerrar = document.getElementById("btn-cerrar-cancelacion");

  if (motivoSel && !motivoSel.dataset.bound) {
    motivoSel.dataset.bound = "1";
    motivoSel.addEventListener("change", () => {
      const mot = motivoSel.value;
      if (uuidWrap) {
        if (mot === "01") uuidWrap.classList.remove("hidden");
        else uuidWrap.classList.add("hidden");
      }
    });
  }

  if (btnCerrar && !btnCerrar.dataset.bound) {
    btnCerrar.dataset.bound = "1";
    btnCerrar.addEventListener("click", () => cerrarModalCancelacion());
  }

  if (btnOk && !btnOk.dataset.bound) {
    btnOk.dataset.bound = "1";
    btnOk.addEventListener("click", () => {
      const motivo = motivoSel ? motivoSel.value : "02";
      const uuidSustituye = uuidInp ? uuidInp.value.trim() : "";
      if (motivo === "01" && !uuidSustituye) {
        alert("Para motivo 01 debes capturar el UUID que sustituye.");
        return;
      }
      const obs = obsInp ? obsInp.value.trim() : "";
      confirmarCancelacionFactura(motivo, uuidSustituye, obs);
    });
  }
}

function abrirModalCancelacion(facturaId) {
  const modal = document.getElementById("modal-cancelar");
  if (!modal) return;
  facturaEnCancelacionId = facturaId;

  const motivoSel = document.getElementById("cancel-motivo");
  const uuidWrap = document.getElementById("cancel-uuid-wrap");
  const uuidInp = document.getElementById("cancel-uuid");
  const obsInp = document.getElementById("cancel-obs");
  if (motivoSel) motivoSel.value = "02";
  if (uuidInp) uuidInp.value = "";
  if (obsInp) obsInp.value = "";
  if (uuidWrap) uuidWrap.classList.add("hidden");

  modal.classList.remove("hidden");
}

function cerrarModalCancelacion() {
  const modal = document.getElementById("modal-cancelar");
  if (!modal) return;
  modal.classList.add("hidden");
  facturaEnCancelacionId = null;
}

function confirmarCancelacionFactura(motivo, uuidSustituye, observaciones) {
  const id = facturaEnCancelacionId;
  if (!id) return;
  const f = (facturas || []).find(x => x && x.id === id);
  if (!f) return alert("No se encontró la factura a cancelar.");

  f.estatus = "CANCELADA";
  f.cancelacion = {
    motivo,
    uuidSustituye: uuidSustituye || "",
    observaciones: observaciones || "",
    fecha: new Date().toISOString()
  };

  guardarFacturasEnLocalStorage();
  renderHistoricoFacturacion();
  cerrarModalCancelacion();
  alert("Factura marcada como CANCELADA (maqueta local).");
}

// Escape básico para HTML (evita romper la tabla)
function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ========================= COMPRAS (ESTILO SAE) =========================
function initCompras() {
  const tipoEl = document.getElementById("comp-tipo");
  if (!tipoEl) return;

  document
    .getElementById("btn-agregar-partida")
    .addEventListener("click", agregarPartidaCompra);

  document
    .getElementById("btn-nueva-compra")
    .addEventListener("click", () => nuevaCompra(true));

  document
    .getElementById("btn-guardar-compra")
    .addEventListener("click", guardarCompraActual);

  document
    .getElementById("compras-detalle-body")
    .addEventListener("input", (e) => {
      if (e.target.classList.contains("cmp-cant") ||
          e.target.classList.contains("cmp-costo")) {
        recalcularSubtotalesCompras();
      }
    });

  document
    .getElementById("compras-detalle-body")
    .addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-del-partida")) {
        const tr = e.target.closest("tr");
        tr.remove();
        recalcularSubtotalesCompras();
      }
    });

  // cargar compras de esta empresa
  cargarComprasDesdeLocalStorage();
  nuevaCompra(false);
  renderHistorialCompras();
}

function cargarComprasDesdeLocalStorage() {
  try {
    const key = empresaActual === "sanare" ? LS_KEYS.comprasSanare : LS_KEYS.comprasNomad;
    const str = localStorage.getItem(key);
    compras = str ? JSON.parse(str) : [];
  } catch (e) {
    console.warn("Error leyendo compras de localStorage", e);
    compras = [];
  }
}

function guardarComprasEnLocalStorage() {
  try {
    const key = empresaActual === "sanare" ? LS_KEYS.comprasSanare : LS_KEYS.comprasNomad;
    localStorage.setItem(key, JSON.stringify(compras));
  } catch (e) {
    console.warn("No se pudieron guardar las compras", e);
  }
}

function nuevaCompra(incrementarConsecutivo) {
  const numeroInput = document.getElementById("comp-numero");

  let nuevoNumero = 1;
  if (compras.length) {
    const nums = compras
      .map((c) => parseInt(c.numero || "0", 10) || 0);
    const max = Math.max.apply(null, nums);
    nuevoNumero = max + 1;
  }

  if (!incrementarConsecutivo && numeroInput.value) {
    const limpio = numeroInput.value.replace(/^0+/, "") || "1";
    nuevoNumero = parseInt(limpio, 10);
  }

  numeroInput.value = nuevoNumero.toString().padStart(8, "0");

  const ids = [
    "comp-fecha",
    "comp-proveedor",
    "comp-rfc",
    "comp-nombre",
    "comp-ref-prov",
    "comp-esquema",
    "comp-calle",
    "comp-num-ext",
    "comp-num-int",
    "comp-colonia",
    "comp-cp",
    "comp-poblacion",
    "comp-pais",
    "comp-entregar-a",
    "comp-fecha-rec",
    "comp-descuento",
    "comp-desc-fin",
    "comp-gastos-ind",
    "comp-almacen",
    "comp-descripcion",
    "comp-fact-unidades",
    "comp-total-partida"
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const hoy = new Date().toISOString().slice(0, 10);
  const fechaEl = document.getElementById("comp-fecha");
  if (fechaEl && !fechaEl.value) fechaEl.value = hoy;
  const fechaRecEl = document.getElementById("comp-fecha-rec");
  if (fechaRecEl && !fechaRecEl.value) fechaRecEl.value = hoy;

  const tbody = document.getElementById("compras-detalle-body");
  tbody.innerHTML = "";
  agregarPartidaCompra();
  recalcularSubtotalesCompras();
}

function agregarPartidaCompra() {
  const tbody = document.getElementById("compras-detalle-body");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="number" min="0" step="0.01" class="cmp-cant" value="1" /></td>
    <td><input type="text" class="cmp-prod" /></td>
    <td><input type="text" class="cmp-unidad" /></td>
    <td><input type="number" step="0.01" class="cmp-desc" /></td>
    <td><input type="number" step="0.01" class="cmp-ieps" /></td>
    <td><input type="number" step="0.01" class="cmp-coaseguro" /></td>
    <td><input type="number" step="0.01" class="cmp-deducible" /></td>
    <td><input type="number" step="0.01" class="cmp-iva" /></td>
    <td><input type="number" min="0" step="0.01" class="cmp-costo" /></td>
    <td class="compras-total-sub">0.00</td>
    <td><button type="button" class="btn-del-partida">✕</button></td>
  `;
  tbody.appendChild(tr);
  recalcularSubtotalesCompras();
}

function recalcularSubtotalesCompras() {
  const tbody = document.getElementById("compras-detalle-body");
  const filas = Array.from(tbody.querySelectorAll("tr"));
  let total = 0;
  filas.forEach((tr) => {
    const cant = parseFloat(tr.querySelector(".cmp-cant")?.value || "0");
    const costo = parseFloat(tr.querySelector(".cmp-costo")?.value || "0");
    const subtotal = Math.round((cant * costo + Number.EPSILON) * 100) / 100;
    total += subtotal;
    const celdaSub = tr.querySelector(".compras-total-sub");
    if (celdaSub) celdaSub.textContent = subtotal.toFixed(2);
  });
  const totalInput = document.getElementById("comp-total-partida");
  if (totalInput) totalInput.value = total.toFixed(2);
}

function guardarCompraActual() {
  const numero = document.getElementById("comp-numero").value;
  const tipo = document.getElementById("comp-tipo").value;
  const fecha = document.getElementById("comp-fecha").value || new Date().toISOString().slice(0, 10);
  const proveedor = document.getElementById("comp-proveedor").value;
  const descripcion = document.getElementById("comp-descripcion").value;
  const total = parseFloat(document.getElementById("comp-total-partida").value || "0");

  const tbody = document.getElementById("compras-detalle-body");
  const filas = Array.from(tbody.querySelectorAll("tr"));

  if (!filas.length) {
    alert("Agrega al menos una partida.");
    return;
  }

  const partidas = filas.map((tr) => ({
    cantidad: parseFloat(tr.querySelector(".cmp-cant")?.value || "0"),
    producto: tr.querySelector(".cmp-prod")?.value || "",
    unidad: tr.querySelector(".cmp-unidad")?.value || "",
    descuento: tr.querySelector(".cmp-desc")?.value || "",
    ieps: tr.querySelector(".cmp-ieps")?.value || "",
    coaseguro: tr.querySelector(".cmp-coaseguro")?.value || "",
    deducible: tr.querySelector(".cmp-deducible")?.value || "",
    iva: tr.querySelector(".cmp-iva")?.value || "",
    costo: tr.querySelector(".cmp-costo")?.value || "",
    subtotal: parseFloat(tr.querySelector(".compras-total-sub")?.textContent || "0")
  }));

  const compra = {
    numero,
    tipo,
    fecha,
    proveedor,
    descripcion,
    total,
    partidas
  };

  const idx = compras.findIndex((c) => c.numero === numero);
  if (idx >= 0) {
    compras[idx] = compra;
  } else {
    compras.push(compra);
  }

  guardarComprasEnLocalStorage();
  renderHistorialCompras();
  alert("Compra guardada.");
}

function renderHistorialCompras() {
  const tbody = document.querySelector("#tabla-compras tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  compras
    .slice()
    .sort((a, b) => (a.numero || "").localeCompare(b.numero || ""))
    .forEach((c) => {
      const tr = document.createElement("tr");
      const concepto = c.descripcion || (c.partidas && c.partidas[0]?.producto) || "";
      tr.innerHTML = `
        <td>${c.fecha || ""}</td>
        <td>${c.proveedor || ""}</td>
        <td>${concepto}</td>
        <td style="text-align:right;">${(c.total || 0).toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
}
