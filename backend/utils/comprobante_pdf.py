from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def generar_comprobante_pago_pdf(
    comprobante: dict
) -> BytesIO:

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=A4
    )

    _, alto = A4

    # =========================
    # ENCABEZADO
    # =========================

    pdf.setFont(
        "Helvetica-Bold",
        22
    )

    pdf.drawString(
        25 * mm,
        alto - 30 * mm,
        "MINILOOP"
    )

    pdf.setFont(
        "Helvetica-Bold",
        15
    )

    pdf.drawString(
        25 * mm,
        alto - 42 * mm,
        "Comprobante de pago"
    )

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        25 * mm,
        alto - 50 * mm,
        "Comprobante emitido por el sistema MiniLoop"
    )

    # =========================
    # LÍNEA
    # =========================

    pdf.line(
        25 * mm,
        alto - 57 * mm,
        185 * mm,
        alto - 57 * mm
    )

    # =========================
    # DATOS
    # =========================

    y = alto - 72 * mm

    datos = [
        (
            "N.º de comprobante",
            str(
                comprobante[
                    "comprobante_id"
                ]
            )
        ),
        (
            "Consorcio",
            str(
                comprobante[
                    "consorcio_nombre"
                ]
            )
        ),
        (
            "Unidad",
            str(
                comprobante[
                    "unidad_identificador"
                ]
            )
        ),
        (
            "Período",
            (
                f'{comprobante["mes"]}/'
                f'{comprobante["anio"]}'
            )
        ),
        (
            "Importe",
            (
                f'$ {float(comprobante["monto"]):,.2f}'
            )
        ),
        (
            "Fecha de pago",
            str(
                comprobante[
                    "fecha_pago"
                ]
            )
        ),
        (
            "Estado",
            str(
                comprobante[
                    "estado"
                ]
            )
        ),
    ]

    for etiqueta, valor in datos:

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            25 * mm,
            y,
            etiqueta
        )

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            80 * mm,
            y,
            valor
        )

        y -= 10 * mm

    # =========================
    # ACLARACIÓN
    # =========================

    y -= 10 * mm

    pdf.setFont(
        "Helvetica",
        9
    )

    pdf.drawString(
        25 * mm,
        y,
        (
            "Este documento acredita el registro "
            "del pago dentro de MiniLoop."
        )
    )

    y -= 6 * mm

    pdf.drawString(
        25 * mm,
        y,
        (
            "No constituye una factura ni "
            "un comprobante fiscal."
        )
    )

    # =========================
    # FINALIZAR
    # =========================

    pdf.showPage()
    pdf.save()

    buffer.seek(0)

    return buffer