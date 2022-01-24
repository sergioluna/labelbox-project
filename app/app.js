const axios = require('axios');
const db = require('./database');

const express = require('express')
const app = express()
const port = 3000

const getAPOD = async () => {
    try {
        const resp = await axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
        return resp.data;
    } catch (err) {
        console.error(err);
        return null;
    }
}


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/NASA-APOD', async (req, res) => {
    data = await getAPOD();
    if (!data) {
        res.status(500).json({status: "error", message: "Unexpected error from NASA api"});
    }

    image = { title: data.title, url: data.url };

    db.run('INSERT INTO images (title, url) VALUES (?, ?)',
        [image.title, image.url],
        function (err) {
            if (err && err.message.includes("UNIQUE constraint failed")) {
                res.status(409).json({status: "error", message: "Image with that title already exists"});
            } else if (err) {
                res.status(500).json({status: "error", message: "An unexpected error has ocurred"})
            } else {
                res.json({status: "success", message: {id: this.lastID, ...image}});
            }
        }
    );
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});