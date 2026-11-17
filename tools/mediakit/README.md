# Media kit Xperience (HTML)

- `mk_xp_template.html`: láminas del media kit; `<!--PAQUETES-->` marca dónde van los paquetes.
- `build_mk.py`: datos de paquetes (cines y malls) y numeración de láminas. Ejecutar desde la raíz del repo:
  `python3 tools/mediakit/build_mk.py` → escribe `mediakit-xperience.html`.
- `iso.py`: dibuja los tres stands isométricos (SVG). Si los cambias, pega el SVG nuevo en el template.
