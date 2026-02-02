
import os
import base64
from dataclasses import dataclass
from typing import Optional, Dict, Any

from lxml import etree
from cryptography import x509
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding

# -----------------------------
# CFDI 4.0: cadena original + sello
# -----------------------------

def _read_bytes(path: str) -> bytes:
    with open(path, "rb") as f:
        return f.read()

def _load_xml(xml_str: str) -> etree._ElementTree:
    parser = etree.XMLParser(remove_blank_text=False, recover=False, encoding="utf-8")
    return etree.fromstring(xml_str.encode("utf-8"), parser=parser)

def generar_cadena_original(xml_str: str, ruta_xslt: str) -> str:
    """
    Genera la cadena original aplicando el XSLT local del SAT.
    """
    xml = etree.fromstring(xml_str.encode("utf-8"))
    xslt_doc = etree.parse(ruta_xslt)
    transform = etree.XSLT(xslt_doc)
    cadena = str(transform(xml))
    # El XSLT suele devolver con salto final; normalizamos
    return cadena.strip()

def certificado_base64_desde_cer(ruta_cer: str) -> str:
    cer_der = _read_bytes(ruta_cer)
    # .cer del SAT suele venir en DER. Si viniera en PEM, esto fallaría; en ese caso conviértelo a DER.
    try:
        cert = x509.load_der_x509_certificate(cer_der)
    except ValueError:
        cert = x509.load_pem_x509_certificate(cer_der)
    # Base64 del contenido binario del certificado (DER)
    return base64.b64encode(cert.public_bytes(serialization.Encoding.DER)).decode("ascii")

def no_certificado_desde_cer(ruta_cer: str) -> str:
    cer_der = _read_bytes(ruta_cer)
    try:
        cert = x509.load_der_x509_certificate(cer_der)
    except ValueError:
        cert = x509.load_pem_x509_certificate(cer_der)
    # En CFDI, NoCertificado es el serial en decimal con padding a 20? (SAT usa string sin 0x)
    # La práctica común: serial en hexadecimal -> a string decimal? En CFDI se usa el "Número de certificado" como aparece en el .cer (20 dígitos).
    # Para evitar discrepancias, lo más robusto es leerlo desde tu sistema/config ya validada.
    # Aquí intentamos formato hexadecimal sin separadores, uppercase, y si es impar, rellenar con 0.
    serial_int = cert.serial_number
    serial_hex = format(serial_int, "x").upper()
    if len(serial_hex) % 2 == 1:
        serial_hex = "0" + serial_hex
    # Muchos PAC esperan el NoCertificado en formato hexadecimal convertido a decimal string? En CFDI generalmente es el "número de certificado" (20 dígitos) que SAT publica.
    # Fallback: devolver hex; tú puedes sobreescribirlo vía ENV NO_CERTIFICADO.
    return serial_hex

def sello_desde_pfx(cadena_original: str, ruta_pfx: str, password: str) -> str:
    pfx_data = _read_bytes(ruta_pfx)
    private_key, certificate, additional_certs = pkcs12.load_key_and_certificates(
        pfx_data, password.encode("utf-8") if password else None
    )
    if private_key is None:
        raise ValueError("No se encontró llave privada en el PFX.")
    signature = private_key.sign(
        data=cadena_original.encode("utf-8"),
        padding=padding.PKCS1v15(),
        algorithm=hashes.SHA256(),
    )
    return base64.b64encode(signature).decode("ascii")

def insertar_atributos_firma(xml_str: str, certificado_b64: str, no_certificado: str, sello_b64: str) -> str:
    """
    Inserta Certificado, NoCertificado y Sello en el nodo Comprobante.
    """
    root = etree.fromstring(xml_str.encode("utf-8"))
    # root tag should be cfdi:Comprobante
    root.set("Certificado", certificado_b64)
    root.set("NoCertificado", no_certificado)
    root.set("Sello", sello_b64)
    # return pretty as original (sin reformat agresivo)
    return etree.tostring(root, encoding="utf-8", xml_declaration=True, pretty_print=False).decode("utf-8")

def agregar_timbre_fiscal(xml_str: str, timbre: Dict[str, Any]) -> str:
    """
    Agrega cfdi:Complemento/tfd:TimbreFiscalDigital con datos de timbrado.
    Espera claves: uuid, fechaTimbrado, rfcProvCertif, selloCFD, noCertificadoSAT, selloSAT, version (opcional)
    """
    NS_CFDI = "http://www.sat.gob.mx/cfd/4"
    NS_TFD = "http://www.sat.gob.mx/TimbreFiscalDigital"
    NS_XSI = "http://www.w3.org/2001/XMLSchema-instance"

    root = etree.fromstring(xml_str.encode("utf-8"))
    nsmap = root.nsmap.copy()
    if None in nsmap:
        nsmap.pop(None, None)

    if "tfd" not in nsmap.values() and "tfd" not in nsmap:
        nsmap["tfd"] = NS_TFD

    # asegurar xmlns:tfd
    # lxml no permite setear nsmap directo; reconstruimos si hace falta
    if "tfd" not in root.nsmap:
        # recrear root preservando atributos
        new_root = etree.Element(root.tag, nsmap={**root.nsmap, "tfd": NS_TFD})
        for k, v in root.attrib.items():
            new_root.set(k, v)
        # mover hijos
        for child in list(root):
            root.remove(child)
            new_root.append(child)
        root = new_root

    # buscar o crear Complemento
    complemento = root.find(f"{{{NS_CFDI}}}Complemento")
    if complemento is None:
        complemento = etree.SubElement(root, f"{{{NS_CFDI}}}Complemento")

    # crear TimbreFiscalDigital
    tfd = etree.SubElement(complemento, f"{{{NS_TFD}}}TimbreFiscalDigital")
    tfd.set("Version", timbre.get("version", "1.1"))
    tfd.set("UUID", timbre["uuid"])
    tfd.set("FechaTimbrado", timbre["fechaTimbrado"])
    tfd.set("RfcProvCertif", timbre.get("rfcProvCertif", ""))
    tfd.set("SelloCFD", timbre.get("selloCFD", ""))
    tfd.set("NoCertificadoSAT", timbre.get("noCertificadoSAT", ""))
    tfd.set("SelloSAT", timbre.get("selloSAT", ""))

    return etree.tostring(root, encoding="utf-8", xml_declaration=True, pretty_print=False).decode("utf-8")
