# MultiShop: Setup Guide

A multi-shop e-commerce system with a shared product catalog.
Backend: Laravel (API). Frontend: Next.js.

## Requirements

- PHP 8.3 or newer, and [Composer](https://getcomposer.org)
- Node.js 20 or newer, and npm
- MySQL 8 or newer, running locally

## 1. Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Create an empty database:

```bash
mysql -u root -e "CREATE DATABASE multishop_db"
```

Open `backend/.env` and check the database settings. The defaults are:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=multishop_db
DB_USERNAME=root
DB_PASSWORD=
```

Change `DB_USERNAME` and `DB_PASSWORD` if your MySQL uses different ones. Then create the tables, load the demo data and start the API:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

The API now runs at http://localhost:8000. Keep this terminal open.

## 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:3000.

`frontend/.env.local` must point at the backend. The default already does:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000
```

If you run the backend on another port, change both values and restart `npm run dev`.

## 3. Test accounts

Sign in at http://localhost:3000/login. All accounts use the password `password`.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `password` |
| Shop owner (Fashion House) | `owner1@example.com` | `password` |
| Shop owner (Tech Store) | `owner2@example.com` | `password` |

Public shop pages (no sign-in needed):

- http://localhost:3000/store/fashion-house
- http://localhost:3000/store/tech-store

## 4. Reset the demo data

To wipe the database and load the demo data again:

```bash
cd backend
php artisan migrate:fresh --seed
```

## 5. Run the backend tests (optional)

```bash
cd backend
php artisan test
```

## Troubleshooting

- **Login or pages fail with a network error:** make sure `php artisan serve` is running and `frontend/.env.local` points at it. Restart `npm run dev` after editing `.env.local`.
- **Database connection refused:** start MySQL and check the `DB_*` values in `backend/.env`.
- **Port 3000 is busy:** Next.js picks the next free port (for example 3001) and prints it. The app works on that port too.
- **Product images are missing:** run `php artisan storage:link` again and confirm the backend is on port 8000.

Product photos in the demo data are from [Unsplash](https://unsplash.com).
