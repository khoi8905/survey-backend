const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Gunakan port yang berbeda dari aplikasi React Anda (misalnya, 3000 untuk React, 3001 untuk backend)
const PORT = 3001; 

// Path ke file JSON data survei
// Pastikan file ini berada di direktori yang sama dengan server.js, atau sesuaikan path-nya.
const parentDataFilePath = path.join(__dirname, 'datasurveyortu.json');
const studentDataFilePath = path.join(__dirname, 'datasurveysiswa.json');
const unitDataFilePath = path.join(__dirname, 'unit.json'); // Asumsi unit.json juga akan dilayani dari backend
const userDataFilePath = path.join(__dirname, 'user.json'); // Path untuk user.json

// Middleware
// Mengizinkan permintaan dari domain lain (misalnya, aplikasi React Anda yang berjalan di localhost:3000)
app.use(cors({
  origin: "*", // atau sebaiknya ganti dengan domain frontend kamu untuk keamanan
  // origin: "https://frontendmu.alabidin.sch.id"
}));

// Untuk mengurai body permintaan JSON
app.use(bodyParser.json()); 

// --- Helper function to read/write JSON files ---
const readJsonFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // File not found, return empty array/object based on common use case
                    resolve([]); 
                } else {
                    reject(err);
                }
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
};

const writeJsonFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// --- API Endpoints ---

// Endpoint untuk mendapatkan data unit
app.get('/unit.json', async (req, res) => {
    try {
        const data = await readJsonFile(unitDataFilePath);
        res.json(data);
    } catch (error) {
        console.error("Error fetching unit data:", error);
        res.status(500).send('Error fetching unit data');
    }
});

// Endpoint untuk MENYIMPAN data unit (POST)
// Ini akan menerima SELURUH array unit yang diperbarui dari frontend
app.post('/unit.json', async (req, res) => {
    const updatedUnits = req.body; // Menerima seluruh array unit dari frontend

    try {
        await writeJsonFile(unitDataFilePath, updatedUnits);
        res.status(200).send('Unit data saved successfully');
    } catch (error) {
        console.error("Error saving unit data:", error);
        res.status(500).send('Error saving unit data');
    }
});


// Endpoint untuk mendapatkan data user (login)
app.get('/user.json', async (req, res) => {
    try {
        const data = await readJsonFile(userDataFilePath);
        res.json(data);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send('Error fetching user data');
    }
});


// Endpoint untuk mendapatkan data survei orang tua
app.get('/datasurveyortu.json', async (req, res) => {
    try {
        const data = await readJsonFile(parentDataFilePath);
        res.json(data);
    } catch (error) {
        console.error("Error fetching parent survey data:", error);
        res.status(500).send('Error fetching parent survey data');
    }
});

// Endpoint untuk menyimpan data survei orang tua
app.post('/datasurveyortu.json', async (req, res) => {
    const newData = req.body; // Data yang dikirim dari frontend

    try {
        let existingData = await readJsonFile(parentDataFilePath);
        // Tambahkan data baru
        const updatedData = [...existingData, newData];
        // Tulis kembali data yang diperbarui ke file
        await writeJsonFile(parentDataFilePath, updatedData);
        res.status(200).send('Parent survey data saved successfully');
    } catch (error) {
        console.error("Error saving parent survey data:", error);
        res.status(500).send('Error saving parent survey data');
    }
});

// Endpoint untuk mendapatkan data survei siswa
app.get('/datasurveysiswa.json', async (req, res) => {
    try {
        const data = await readJsonFile(studentDataFilePath);
        res.json(data);
    } catch (error) {
        console.error("Error fetching student survey data:", error);
        res.status(500).send('Error fetching student survey data');
    }
});

// Endpoint untuk menyimpan data survei siswa (jika ada form untuk siswa)
app.post('/datasurveysiswa.json', async (req, res) => {
    const newData = req.body;

    try {
        let existingData = await readJsonFile(studentDataFilePath);
        const updatedData = [...existingData, newData];
        await writeJsonFile(studentDataFilePath, updatedData);
        res.status(200).send('Student survey data saved successfully');
    } catch (error) {
        console.error("Error saving student survey data:", error);
        res.status(500).send('Error saving student survey data');
    }
});


// Mulai server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
