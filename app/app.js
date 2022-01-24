const axios = require('axios');
const db = require('./database');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000

app.use(bodyParser.json());

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
                res.status(500).json({status: "error", message: "An unexpected error has ocurred"});
            } else {
                res.json({status: "success", message: {id: this.lastID, ...image}});
            }
        }
    );
});

app.post('/api/user', (req, res) => {
    if (!req.body.email) {
        res.status(400).json({status: "error", message: "Email field is required in request body"});
    }

    user = { email: req.body.email };

    db.run('INSERT INTO users (email) VALUES (?)',
        [user.email],
        function(err) {
            if (err && err.message.includes("UNIQUE constraint failed")) {
                res.status(409).json({status: "error", message: "User with that email already exists"});
            } else if (err) {
                res.status(500).json({status: "error", message: "An unexpected error has ocurred"});
            } else {
                res.json({status: "success", message: {id: this.lastID, ...user}});
            }
        }
    );
});

app.delete('/api/user/:user_id', (req, res) => {
    if (!req.params.user_id) {
        res.status(400).json({status: "error", message: "user_id param is required in url (/api/users/{user_id})"});
    }

    user_id = req.params.user_id;

    db.run('DELETE FROM users WHERE id = (?)',
        [user_id],
        function(err) {
            if (err) {
                res.status(500).json({status: "error", message: err.message});
            } else {
                res.json({status: "success", message: `User with id of ${user_id} no longer in database.`});
            }
        }
    );
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});