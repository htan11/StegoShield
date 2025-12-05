# StegoShield

This project is a simple full‑stack steganography tool built with Node.js, Express, and a lightweight frontend. It allows users to hide and extract secret messages inside images.

---

## How to Run the Project

### 1. Install Dependencies

Make sure you have Node.js 18+ installed.


### 2. Set Up Environment Variables

Add the following environment variables (via Vercel dashboard or .env.local):


### 3. Run Database Migrations

Execute the SQL scripts in the `/scripts` folder to set up your database tables.

### 4. Start the Development Server


Server will start on:
http://localhost:3000


---

## Features

- User Authentication (Login/Register with role-based access)
- Admin Console with user approval system
- End-to-End Encrypted Private Messaging
- Steganography Encoding (hide messages in images)
- Steganography Decoding (extract hidden messages)
- AI-Powered Steganalysis Tool
- Public Gallery for encoded images
- Responsive mobile-first design
- Glass morphism UI with dark theme

---

## Database Schema

### Users Table
- id (UUID, Primary Key)
- username (Unique)
- password
- role (user/admin)
- isVerified (Boolean)
- created_at

### Private Messages Table
- id (UUID, Primary Key)
- chatId
- text
- sender
- timestamp
- type (text/image)
- imageUrl
- created_at

### Gallery Table
- id (UUID, Primary Key)
- imageUrl
- title
- timestamp
- created_at

### Settings Table
- id (UUID, Primary Key)
- decodePassword
- created_at

---

## Scripts From package.json
npm run dev      → Starts development server
npm run build    → Builds for production
npm start        → Runs production build
npm install      → Installs all dependencies

---

## Technologies Used

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Component library)
- **Neon/Supabase** (PostgreSQL Database)
- **Lucide React** (Icons)
- **Vercel** (Deployment)

---

## How Steganography Works

- Image pixels are modified using LSB (Least Significant Bit) technique to hide text
- Hidden messages can be extracted by reversing the encoding process
- AI steganalysis tool detects potential hidden content in images
- Secure password protection for decoding operations

---

## Default Admin Credentials
Username: admin
Password: admin123


---

## Deployment

Deploy to Vercel with one click or use the CLI:

---

## Contribution

Feel free to add new encoding/decoding methods, improve the AI classifier, or enhance the UI.

---

## Author Notes

This is a secure communication platform focused on privacy and steganography. Built with modern web technologies and best practices for security and performance.


