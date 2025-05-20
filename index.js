const express = require('express');
const path = require('path'); // Moduł do pracy ze ścieżkami plików
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_KEY = process.env.ACCESS_KEY;
console.log(ACCESS_KEY)

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware do obsługi CORS (zezwolenie na wszystkie źródła)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Zezwól na żądania z dowolnej domeny
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

let isRoomOpen = false;

app.get('/', (req, res) => {
  let backgroundColor;
  let message;
  let pageTitle;

  if (isRoomOpen) {
    backgroundColor = 'green';
    message = 'OTWARTE';
    pageTitle = 'Status: Otwarte';
  } else {
    backgroundColor = 'red';
    message = 'ZAMKNIĘTE';
    pageTitle = 'Status: Zamknięte';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageTitle}</title>
        <style>
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                overflow: hidden; /* Aby uniknąć pasków przewijania */
                font-family: Arial, sans-serif; /* Domyślna czcionka */
            }
            body {
                background-color: ${backgroundColor};
                color: white;
                display: flex;
                justify-content: center; /* Wyśrodkowanie w poziomie */
                align-items: center;    /* Wyśrodkowanie w pionie */
                text-align: center;
                font-size: 10vw;
                font-weight: bold;
                text-transform: uppercase; /* Wielkie litery */
            }
        </style>
    </head>
    <body>
        ${message}
    </body>
    </html>
    `;

  res.setHeader('Content-Type', 'text/html');
  res.send(htmlContent);
});

// Endpoint API do zmiany statusu pokoju
app.post('/api/changeStatus', (req, res) => {
  const { newStatus, apiKey } = req.body;

  if (apiKey !== ACCESS_KEY) {
    return res.status(403).json({ error: 'Nieautoryzowany dostęp - nieprawidłowy klucz API.' });
  }

  if (typeof newStatus !== "boolean") {
    return res.status(400).json({ error: 'Nieprawidłowy status. Dozwolone wartości: "otwarty" lub "zamknięty".' });
  }

  isRoomOpen = newStatus;

  res.json({
    message: `Status pokoju pomyślnie zmieniony na "${isRoomOpen}".`,
  });
});



// ---- Uruchomienie serwera ----
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
