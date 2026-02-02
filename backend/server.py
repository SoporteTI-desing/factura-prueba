
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

import qrcode
from io import BytesIO
import base64
from lxml import etree

from cfdi_sign import (
    generar_cadena_original,
    certificado_base64_desde_cer,
    no_certificado_desde_cer,
    sello_desde_pfx,
    insertar_atributos_firma,
    agregar_timbre_fiscal,
)
from pac_adapter import timbrar

app = Flask(__name__)

def _qr_url_from_xml(xml_str: str, uuid: str, sello_cfd: str) -> str:
    """
    Construye la URL de QR de verificación SAT.
    Nota: el SAT utiliza parámetros: id, re, rr, tt, fe (últimos 8 del sello CFD).
    """
    root = etree.fromstring(xml_str.encode("utf-8"))
    # atributos en Comprobante
    total = root.get("Total", "0")
    # normalizar total a 6 decimales (SAT suele requerir 6)
    try:
        total_f = float(total)
        tt = f"{total_f:.6f}"
    except Exception:
        tt = total
    # RFC emisor/receptor
    ns = {"cfdi": "http://www.sat.gob.mx/cfd/4"}
    emisor = root.find("cfdi:Emisor", namespaces=ns)
    receptor = root.find("cfdi:Receptor", namespaces=ns)
    re_rfc = emisor.get("Rfc") if emisor is not None else ""
    rr_rfc = receptor.get("Rfc") if receptor is not None else ""
    fe = (sello_cfd or "")[-8:]
    return f"https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id={uuid}&re={re_rfc}&rr={rr_rfc}&tt={tt}&fe={fe}"

def _qr_png_data_url(url: str) -> str:
    img = qrcode.make(url)
    buf = BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{b64}"
CORS(app)

XSLT_PATH = os.path.join(os.path.dirname(__file__), "xslt", "cadenaoriginal.xslt")

CER_PATH = os.getenv("CSD_CER_PATH", "")
PFX_PATH = os.getenv("CSD_PFX_PATH", "")
PFX_PASSWORD = os.getenv("CSD_PFX_PASSWORD", "")

NO_CERTIFICADO_OVERRIDE = os.getenv("NO_CERTIFICADO", "").strip()

@app.get("/api/health")
def health():
    return jsonify({"ok": True})

@app.post("/api/firmar")
def firmar():
    data = request.get_json(force=True)
    xml = data.get("xml", "")
    if not xml:
        return jsonify({"error": "Falta 'xml'"}), 400
    if not CER_PATH or not PFX_PATH:
        return jsonify({"error": "Configura CSD_CER_PATH y CSD_PFX_PATH en backend/.env"}), 400

    cert_b64 = certificado_base64_desde_cer(CER_PATH)
    no_cert = NO_CERTIFICADO_OVERRIDE or no_certificado_desde_cer(CER_PATH)

    # 1) poner sello vacío temporal para cadena original estable
    xml_tmp = insertar_atributos_firma(xml, cert_b64, no_cert, "")
    # 2) generar cadena original
    cadena = generar_cadena_original(xml_tmp, XSLT_PATH)
    # 3) firmar con PFX
    sello = sello_desde_pfx(cadena, PFX_PATH, PFX_PASSWORD)
    # 4) insertar sello real
    xml_firmado = insertar_atributos_firma(xml, cert_b64, no_cert, sello)

    return jsonify({
        "xmlFirmado": xml_firmado,
        "noCertificado": no_cert,
        "certificadoB64": cert_b64,
        "selloCFD": sello,
        "cadenaOriginal": cadena,
    })

@app.post("/api/timbrar")
def api_timbrar():
    data = request.get_json(force=True)
    xml = data.get("xml", "")
    if not xml:
        return jsonify({"error": "Falta 'xml'"}), 400

    t = timbrar(xml)

    # si el PAC devuelve el XML timbrado completo
    xml_timbrado = t.get("xmlTimbrado")
    if not xml_timbrado:
        xml_timbrado = agregar_timbre_fiscal(xml, t)

    qr_url = _qr_url_from_xml(xml_timbrado, t.get("uuid",""), t.get("selloCFD",""))
    qr_png = _qr_png_data_url(qr_url)

    return jsonify({
        "timbre": t,
        "xmlTimbrado": xml_timbrado,
        "qrUrl": qr_url,
        "qrPngDataUrl": qr_png,
    })

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8787"))
    app.run(host="127.0.0.1", port=port, debug=True)
