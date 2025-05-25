# Movie Explorer

## Prezentare

Movie Explorer este o aplicație web interactivă pentru explorarea și descoperirea filmelor, bazată pe API-ul TMDB (The Movie Database). Aplicația permite utilizatorilor să caute filme, să vizualizeze detalii, să adauge filme la o listă de urmărire personală și să scrie recenzii.



## Cuprins

- [Descrierea problemei](#descrierea-problemei)
- [Descriere API](#descriere-api)
- [Flux de date](#flux-de-date)
- [Tehnologii utilizate](#tehnologii-utilizate)
- [Instalare și configurare](#instalare-și-configurare)
- [Funcționalități](#funcționalități)
- [Structura proiectului](#structura-proiectului)
- [Capturi ecran](#capturi-ecran)
- [Referințe](#referințe)

## Descrierea problemei

În era digitală, există un număr enorm de filme disponibile pe diverse platforme de streaming și cinematografe. Pentru iubitorii de film, poate fi dificil să țină evidența filmelor pe care doresc să le vizioneze sau să descopere filme noi bazate pe preferințele lor.

Movie Explorer rezolvă această problemă prin:
- Oferirea unei interfețe intuitive pentru căutarea și descoperirea filmelor
- Permiterea utilizatorilor să salveze filme într-o listă personală de urmărire
- Facilitarea discuțiilor despre filme prin sistemul de recenzii
- Furnizarea de informații detaliate despre filme (distribuție, regizor, rating, gen, etc.)

Aplicația se adresează cinefilor care doresc să descopere filme noi și să-și organizeze experiența de vizionare.

## Descriere API

Aplicația utilizează două servicii cloud principale:

1. **TMDB (The Movie Database) API**
   - API RESTful pentru accesarea unei baze de date cuprinzătoare de filme
   - Furnizează informații despre filme, actori, recenzii și multe alte detalii
   - Acceptă căutări și filtrări complexe
   - Documentație oficială: [TMDB API](https://developers.themoviedb.org/3/getting-started/introduction)

2. **Firebase**
   - Serviciu cloud de la Google folosit pentru:
     - Autentificarea utilizatorilor (Firebase Authentication)
     - Stocarea datelor generate de utilizatori (Firestore Database)
     - Analitică și monitorizare (Firebase Analytics)
   - Documentație oficială: [Firebase](https://firebase.google.com/docs)

## Flux de date

### Exemple de request / response

#### Obținerea filmelor populare:
```
GET /api/movies/category/popular
```

Răspuns:
```json
{
  "page": 1,
  "results": [
    {
      "id": 12345,
      "title": "Exemplu de Film",
      "poster_path": "/calea/catre/poster.jpg",
      "overview": "Descrierea filmului...",
      "vote_average": 7.5,
      "release_date": "2023-01-15"
    },
    // ... alte filme
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

#### Adăugarea unui film la lista de urmărire:
```
POST /watchlist
```

Cerere:
```json
{
  "userId": "userID123",
  "movieId": 12345,
  "title": "Exemplu de Film",
  "posterPath": "/calea/catre/poster.jpg",
  "releaseDate": "2023-01-15",
  "overview": "Descrierea filmului...",
  "voteAverage": 7.5
}
```

### Metode HTTP

- **GET**: Pentru obținerea informațiilor despre filme și a datelor utilizatorului
- **POST**: Pentru adăugarea de recenzii și filme în lista de urmărire
- **PUT/PATCH**: Pentru actualizarea recenziilor
- **DELETE**: Pentru ștergerea recenziilor și a filmelor din lista de urmărire

### Autentificare și autorizare

- **Autentificare utilizator**: Realizată prin Firebase Authentication cu suport pentru login cu Google
- **Autorizare API TMDB**: Realizată prin chei API securizate transmise prin server-ul backend pentru a proteja credențialele

## Tehnologii utilizate

### Frontend
- **React**: Biblioteca JavaScript pentru construirea interfeței utilizator
- **Vite**: Instrument de dezvoltare pentru configurare rapidă
- **React Router**: Pentru navigarea între pagini
- **Tailwind CSS**: Framework CSS pentru design responsive
- **Axios**: Pentru cereri HTTP
- **Firebase SDK**: Pentru integrarea cu serviciile Firebase
- **React Hot Toast**: Pentru notificări utilizator

### Backend
- **Node.js**: Mediul de execuție JavaScript
- **Express**: Framework web pentru Node.js
- **Firebase Admin SDK**: Pentru interacțiunea sigură cu serviciile Firebase
- **Axios**: Pentru cereri HTTP către API-ul TMDB

### Servicii Cloud
- **Firebase Authentication**: Pentru gestiunea utilizatorilor
- **Firebase Firestore**: Bază de date NoSQL pentru stocarea datelor utilizatorilor
- **Firebase Analytics**: Pentru analiza comportamentului utilizatorilor
- **TMDB API**: Pentru datele despre filme

## Instalare și configurare

### Cerințe preliminare
- Node.js (v14 sau mai recent)
- npm sau yarn
- Cont Firebase
- Cheie API TMDB

### Configurare Backend
1. Clonați repository-ul
```bash
cd movie-explorer/backend
```

2. Instalați dependențele
```bash
npm install
```

3. Creați un fișier `.env` cu următoarele variabile:
```
PORT=5000
TMDB_API_KEY=your_tmdb_api_key
```

4. Porniți serverul
```bash
npm run dev
```

### Configurare Frontend
1. Navigați în directorul frontend
```bash
cd ../frontend
```

2. Instalați dependențele
```bash
npm install
```

3. Creați un fișier `.env` cu următoarele variabile:
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Porniți aplicația frontend
```bash
npm run dev
```

## Funcționalități

### Explorarea filmelor
- Vizualizarea filmelor populare, apreciate și noi
- Căutarea filmelor după titlu
- Vizualizarea filmelor similare

### Detalii film
- Informații detaliate despre filme (titlu, descriere, rating)
- Distribuție și echipă (actori, regizor)
- Genuri și durata filmului

### Gestionarea listei de urmărire
- Adăugarea/eliminarea filmelor din lista personală
- Vizualizarea listei de urmărire
- Organizarea filmelor salvate

### Sistem de recenzii
- Publicarea recenziilor cu rating (1-5 stele)
- Editarea și ștergerea recenziilor proprii
- Vizualizarea recenziilor altor utilizatori

### Autentificare
- Înregistrare și autentificare cu cont Google
- Profiluri de utilizator
- Securitate bazată pe Firebase

## Structura proiectului

```
movie-explorer/
├── backend/
│   ├── index.js           # Server Express și rutele API
│   ├── package.json       # Dependențe backend
│   └── .env               # Variabile de mediu (negit)
│
└── frontend/
    ├── public/            # Fișiere statice
    ├── src/
    │   ├── components/    # Componente reutilizabile
    │   ├── contexts/      # Context React pentru state global
    │   ├── pages/         # Pagini principale
    │   ├── services/      # Servicii pentru API și Firebase
    │   ├── App.jsx        # Componenta principală
    │   ├── firebase.js    # Configurare Firebase
    │   └── main.jsx       # Punct de intrare
    ├── package.json       # Dependențe frontend
    └── .env               # Variabile de mediu (negit)
```

## Referințe

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/guide/)