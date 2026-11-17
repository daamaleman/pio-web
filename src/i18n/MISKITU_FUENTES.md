# Fuentes Miskitu

## Fuente 2 — Diccionario URACCAN (2006)

Scott Lackwood, Ernesto (2006). *Diccionario Bilingüe Términos de Medicina Tradicional en Lengua Miskita (Miskito–Español)*. URACCAN-Kamla / IMTRADEC, Bilwi. Revisado por Serafina Espinoza, Marcos Padilla, Avelino Cox y Miguel Urbina.

Es un diccionario de salud y medicina tradicional, así que sirve para palabras sueltas y no para frases de interfaz. Las entradas están en `glossary.miq.json` y se aplican con `npm run i18n:glossary`.

| Español | Miskitu | Entrada del diccionario |
|---|---|---|
| Sí / No | Ao / Apia | Ao: Sí · Apia: No |
| Hablar | Aisaya | Aisaya: Hablar |
| Vamos | Kaisa | Kaisa, kaia maka: Vamos, vámonos |
| Cuidado | Kaiki bas | Kaiki bas: Cuidado, mucho cuidado |
| Ver | Kaikaia | Kaikaia: Ver |
| Pensar | Wâri | Wâri: Pensar |
| Comenzar / Iniciar | Ta krikanka | Ta krikanka: Iniciar, comenzar algo |
| Finalizar / Terminar | Tnata alkan | Tnata alkan: Finalizar algo |
| Salir | Takaia | Takaia: Salir |
| Enseñar | Smalkaia | Smalkaia: Enseñar, educar |
| Observación | Laki kaikanka | Laki kaikanka: Observación |
| Examen / Comparación | Praki kaikanka | Praki kaikanka: Examen, comparación |
| Mes | Kâti | Kâti: Mes |
| Sentimiento | Amninka | Amninka, lukanka: Sentimiento |
| Crecimiento / Desarrollo | Pawanka / Pawanka laka | Pawanka: Crecimiento · Pawanka laka: Desarrollo |
| Corazón | Kupya | Kupya: Corazón |
| Preocupación | Kupya warî | Kupya warî: Preocupación |
| Valentía | Kupya karni ra | Kupya karni ra: Coraje, valentía |
| Vergüenza | Swira | Swira: Pena, vergüenza |
| Cansado | Suapan | Suapan: Cansado |
| Dormir / Descansar | Yapaia / Res briaia | Yapaia, res briaia: Dormir, descansar |
| Tristeza | Sari laka | Kupya sari, sari laka: Tristeza |
| Enojo (persona enojada) | Kupia babaikra | Ai kupia bábaikra: persona enojada |
| Calma | Sap takaia * | Sap takaia: Estar en silencio, calmo |
| Mujer / Hombre / Persona | Mairin / Waitna / Upla | entradas homónimas |
| Niño | Tuktan | aparece en "Tuktan swap lupya nani…: niños recién nacidos" |
| Hijo | Luhpa | Luhpa unhsak: Hijo único |

\* = forma derivada o adaptada (plurales con `nani`, "Progreso" = Pawanka, "Emociones" = Amninka nani, "Calma" como verbo). Pendiente de revisión por un hablante nativo.

Conflicto: para Tristeza el diccionario da *Sari laka*; `miq.json` ya tenía *Sari lukanka*. El script no lo cambia; usa `--force-keys` para aplicar la forma del diccionario.
