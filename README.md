# StegoShield

This project is a simple full‑stack steganography tool built with Node.js, Express, and a lightweight frontend. It allows users to hide and extract secret messages inside images.

---

## 📁 Project Structure

```
stego-tool/
│
├── api/                # API-related scripts (if any)
├── backend.js         # Backend logic for steganography
├── database.js        # MongoDB connection setup
├── frontend.js        # Frontend interaction logic
├── server.js          # Main Express server file
├── main.js            # Image encoding/decoding logic
├── main-new.js        # Updated version of image logic
├── index.html         # Frontend UI
├── styles.css         # Styling for UI
├── .env.local         # Environment variables (MongoDB URL, API keys, etc.)
├── node_modules/      # Dependencies
├── package.json       # Dependencies and scripts
└── package-lock.json
```

---

## 🚀 How to Run the Project

### **1. Install Dependencies**
Make sure you have Node.js installed.

```
npm install
```

### **2. Set Up Environment Variables**
Inside `.env.local`, add your MongoDB connection string:

```
MONGO_URI=your_mongodb_url_here
```

### **3. Start the Server**

```
node server.js
```

Server will start on:
```
http://localhost:3000
```

---

## 🧩 Features

- Hide secret text inside images  
- Extract hidden text from images  
- MongoDB used for storing logs or user data  
- Simple clean UI built using HTML, CSS, JS  
- Fully local processing for steganography logic  

---

## 📦 Scripts From package.json

```
npm start       → Runs server.js
npm install     → Installs all dependencies
```

---

## 🛠 Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB**
- **Vanilla HTML/CSS/JS**

---

## 📸 How Stego Logic Works

- Image pixels are modified slightly to hide text (LSB steganography approach).
- Hidden message can later be retrieved by reversing the process.
- The project includes two versions of logic: `main.js` and `main-new.js`.

---

## 🤝 Contribution

Feel free to add new encoding/decoding methods or improve the UI.

---

## 🧑‍💻 Author Notes

This README is written in a natural human style and summarizes the actual contents of your uploaded project.
