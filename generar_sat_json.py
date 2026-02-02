import pandas as pd
import json

EXCEL_PATH = "calves sat.xlsx"          # ajusta si el nombre es distinto
OUTPUT_JSON = "sat_catalogs.json"

xls = pd.ExcelFile(EXCEL_PATH)

def find_header_row(df, code_col):
  col0 = df.iloc[:,0].astype(str).str.strip()
  return col0[col0 == code_col].index[0]

def load_catalog(sheet, code_col, desc_col):
  df = xls.parse(sheet, header=None)
  header_row = find_header_row(df, code_col)
  header = df.iloc[header_row]
  data = df.iloc[header_row + 1:].copy()
  data.columns = header
  data = data[[code_col, desc_col]]
  data = data[data[code_col].notna()]
  return [
      {
          "clave": str(row[code_col]).strip(),
          "descripcion": str(row[desc_col]).strip()
      }
      for _, row in data.iterrows()
  ]

def load_clave_unidad():
  df = xls.parse("c_ClaveUnidad", header=None)
  header_row = find_header_row(df, "c_ClaveUnidad")
  header = df.iloc[header_row]
  data = df.iloc[header_row + 1:].copy()
  data.columns = header
  data = data[["c_ClaveUnidad", "Nombre", "Símbolo"]]
  data = data[data["c_ClaveUnidad"].notna()]
  out = []
  for _, row in data.iterrows():
      out.append({
          "clave": str(row["c_ClaveUnidad"]).strip(),
          "nombre": str(row["Nombre"]).strip(),
          "simbolo": "" if pd.isna(row["Símbolo"]) else str(row["Símbolo"]).strip()
      })
  return out

def load_regimen_fiscal():
  df = xls.parse("c_RegimenFiscal", header=None)
  header_row = find_header_row(df, "c_RegimenFiscal")
  header = df.iloc[header_row]
  data = df.iloc[header_row + 1:].copy()
  data.columns = header
  data = data[["c_RegimenFiscal", "Descripción", "Física", "Moral"]]
  data = data[data["c_RegimenFiscal"].notna()]
  out = []
  for _, row in data.iterrows():
      out.append({
          "clave": str(row["c_RegimenFiscal"]).strip(),
          "descripcion": str(row["Descripción"]).strip(),
          "fisica": "" if pd.isna(row["Física"]) else str(row["Física"]).strip(),
          "moral": "" if pd.isna(row["Moral"]) else str(row["Moral"]).strip(),
      })
  return out

def load_uso_cfdi():
  df = xls.parse("c_UsoCFDI", header=None)
  header_row = find_header_row(df, "c_UsoCFDI")
  header = df.iloc[header_row]
  data = df.iloc[header_row + 1:].copy()
  data.columns = header
  data = data[["c_UsoCFDI", "Descripción", "Aplica para tipo persona"]]
  data = data[data["c_UsoCFDI"].notna()]
  out = []
  for _, row in data.iterrows():
      out.append({
          "clave": str(row["c_UsoCFDI"]).strip(),
          "descripcion": str(row["Descripción"]).strip(),
          "tipo_persona": "" if pd.isna(row["Aplica para tipo persona"]) else str(row["Aplica para tipo persona"]).strip(),
      })
  return out

catalogs = {
  "prodServ": load_catalog("c_ClaveProdServSAT", "c_ClaveProdServ", "Descripción"),
  "formaPago": load_catalog("c_FormaPago", "c_FormaPago", "Descripción"),
  "metodoPago": load_catalog("c_MetodoPago", "c_MetodoPago", "Descripción"),
  "regimenFiscal": load_regimen_fiscal(),
  "usoCFDI": load_uso_cfdi(),
  "claveUnidad": load_clave_unidad(),
}

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
  json.dump(catalogs, f, ensure_ascii=False, indent=2)

print("Listo:", OUTPUT_JSON)
