# Ticketing Platform

A comprehensive, enterprise-grade ticketing platform built with Next.js, Prisma, and Tailwind CSS.

## Features

- **Event Management**: Browse and view details of events.
- **Ticket Sales**: Select ticket types and quantities.
- **Responsive Design**: Works on desktop and mobile.
- **Database**: SQLite with Prisma ORM.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Database**:
    ```bash
    export DATABASE_URL="file:./dev.db"
    npx prisma generate
    npx prisma db push
    npx tsx prisma/seed.ts
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `app/events`: Event listing and detail pages.
- `app/components`: Reusable UI components.
- `app/lib`: Utilities and Prisma client.
- `prisma`: Database schema and seed script.

## Tech Stack

- Next.js 16
- Prisma (ORM)
- SQLite (Database)
- Tailwind CSS (Styling)
- Lucide React (Icons)
