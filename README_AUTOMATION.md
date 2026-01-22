
# Infraestructura de Automatización - GPS Process Discovery

Este repositorio contiene la suite de pruebas automatizadas diseñada para garantizar la estabilidad de la plataforma mediante validaciones factuales.

## Requisitos Previos
- Java JDK 11 o superior.
- Maven 3.8+.
- Google Chrome estable.
- Jenkins (para ejecución de pipeline).

## Estructura de Pruebas
1. **Smoke Tests**: Validación de carga de recursos críticos.
2. **Functional Tests**: Verificación de navegación y generación de gráficos SVG.
3. **Responsive Tests**: Evaluación de comportamiento en dimensiones de dispositivos móviles.

## Ejecución Local
Para ejecutar la suite completa:
```bash
mvn test
```

Para ejecutar solo pruebas de humo (Smoke):
```bash
mvn test -Dgroups=smoke
```

## Reportes
Los resultados se generan en formato HTML en el directorio `target/surefire-reports/emailable-report.html`.
