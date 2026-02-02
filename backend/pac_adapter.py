
"""
PAC Adapter (Plantilla)

Este módulo define una interfaz mínima para timbrar. Cada PAC tiene endpoints y formatos distintos
(SOAP o REST). Aquí dejamos un "demo adapter" para pruebas y un punto único para que metas tu PAC.

IMPORTANTE: Para timbrado REAL necesitas:
- URL (WSDL o endpoint REST)
- Usuario / contraseña / token del PAC
- Certificados del PAC (si aplica)
"""

from typing import Dict, Any
import os, uuid, datetime

def timbrar_demo(xml_str: str) -> Dict[str, Any]:
    """
    Devuelve un timbre simulado para que el facturador pueda:
    - insertar TimbreFiscalDigital
    - mostrar UUID / sellos en el PDF
    - generar QR
    """
    now = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    return {
        "uuid": str(uuid.uuid4()).upper(),
        "fechaTimbrado": now,
        "rfcProvCertif": "AAA010101AAA",
        "selloCFD": "SELLOCFD_DEMO",
        "noCertificadoSAT": "00001000000504465028",
        "selloSAT": "SELLOSAT_DEMO",
        "version": "1.1",
    }

def timbrar_real(xml_str: str) -> Dict[str, Any]:
    """
    TODO: Implementa aquí tu PAC.

    Recomendación:
    - Lee env vars PAC_URL, PAC_USER, PAC_PASSWORD, etc.
    - Envía el XML (string) al PAC.
    - Devuelve un dict con las llaves del timbre:
      uuid, fechaTimbrado, rfcProvCertif, selloCFD, noCertificadoSAT, selloSAT, version

    Nota:
    - Muchos PAC devuelven también el XML timbrado completo. En ese caso,
      puedes devolver también "xmlTimbrado" para usarlo tal cual.
    """
    raise NotImplementedError("Configura tu PAC en backend/pac_adapter.py (timbrar_real).")

def timbrar(xml_str: str) -> Dict[str, Any]:
    mode = os.getenv("PAC_MODE", "demo").lower().strip()
    if mode == "demo":
        return timbrar_demo(xml_str)
    return timbrar_real(xml_str)
