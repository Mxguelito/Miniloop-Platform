import subprocess


def ejecutar_comando(comando: list[str]) -> str:
    resultado = subprocess.run(
        comando,
        capture_output=True,
        text=True,
        check=True,
    )

    return resultado.stdout.strip()


def obtener_revision(salida: str) -> str:
    for linea in salida.splitlines():
        linea = linea.strip()

        if linea and not linea.startswith("INFO"):
            return linea.split()[0]

    return "desconocida"


def main() -> None:
    print()
    print("=" * 50)
    print("        MINILOOP - ESTADO DE MIGRACIONES")
    print("=" * 50)

    try:
        current_output = ejecutar_comando(
            ["alembic", "current"]
        )

        heads_output = ejecutar_comando(
            ["alembic", "heads"]
        )

        current = obtener_revision(current_output)
        head = obtener_revision(heads_output)

        print()
        print(f"Version actual : {current}")
        print(f"Ultima version : {head}")
        print()

        if current == head:
            print("ESTADO: BASE ACTUALIZADA")
            print("No hay migraciones pendientes.")
        else:
            print("ESTADO: HAY MIGRACIONES PENDIENTES")
            print("Ejecutar: alembic upgrade head")

        print()
        print("=" * 50)

    except subprocess.CalledProcessError as error:
        print()
        print("ERROR AL CONSULTAR ALEMBIC")
        print(error.stderr)


if __name__ == "__main__":
    main()