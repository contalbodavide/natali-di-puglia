# Natali di Puglia — Portale Statico Ufficiale

Pagine HTML statiche generate per la campagna natalizia **"Segui le stelle, festeggia in Puglia"** (6 dicembre – 6 gennaio), promossa da **Regione Puglia** in collaborazione con **Puglia Culture**.

## Struttura dei File Pronti per il Deposito / Deploy

- `index.html`: Portale regionale principale (Tutta la Puglia, filtri completi e ricerca dinamica)
- `bari.html`: Pagina dedicata alla Città Metropolitana di Bari
- `bat.html`: Pagina dedicata alla Provincia di Barletta-Andria-Trani
- `brindisi.html`: Pagina dedicata alla Provincia di Brindisi
- `foggia.html`: Pagina dedicata alla Provincia di Foggia (Gargano & Monti Dauni)
- `lecce.html`: Pagina dedicata alla Provincia di Lecce (Salento)
- `taranto.html`: Pagina dedicata alla Provincia di Taranto (Terra Ionica)
- `assets/css/natali_puglia.css`: Foglio di stile editoriale (Stile Tutta la Rossani)
- `assets/js/natali_puglia.js`: Script di navigazione, filtri e calendario (.ics)
- `assets/js/dati_eventi.js`: Database statico JSON degli eventi
- `assets/img/Puglia.svg`: Logo ufficiale vettoriale Regione Puglia
- `assets/img/natali_puglia_hero.jpg`: Grafica ufficiale della campagna

## Come depositare nel Repository Git / Codice

Puoi caricare l'intero contenuto di questa cartella nel tuo repository Git:

```bash
git init
git add .
git commit -m "Deploy portale statico Natali di Puglia"
git push origin main
```

Le pagine sono **100% statiche**: funzionano su qualsiasi hosting web (Aruba, Apache, Nginx, GitHub Pages, Netlify, Vercel, AWS S3) senza bisogno di database o server backend.
