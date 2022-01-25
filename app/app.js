const axios = require('axios');
const db = require('./database');
const commands = require('./commands');

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
        res.status(500).json({status: "error", message: "unexpected error from NASA api"});
    }

    image = { title: data.title, url: data.url };

    db.run('INSERT INTO images (title, url) VALUES (?, ?)',
        [image.title, image.url],
        function (err) {
            if (err && err.message.includes("UNIQUE constraint failed")) {
                res.status(409).json({status: "error", message: "image with that title already exists"});
            } else if (err) {
                res.status(500).json({status: "error", message: "an unexpected error has ocurred"});
            } else {
                res.json({status: "success", message: {id: this.lastID, ...image}});
            }
        }
    );
});

app.get('/api/NASAImage/:api_key', (req, res) => {
    data = await commands.fetchNASAImage(req.params.api_key);
    if (!data) {
        res.status(500).json({
            status: "error",
            message: "unexpected error"
        });
        return;
    }
    const onSuccess = (image) => {
        res.json({
            status: "success",
            image: image
        });
    }
    const onFailure = (error) => {
        if (error.message.includes("UNIQUE constraint failed")) {
            res.status(409).json({
                status: "error",
                message: "image already exists"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "unexpected error"
            });
        }
    }

    image = {
        title: data.title,
        url: data.url
    };
    commands.saveNASAImage(image, onSuccess, onFailure)
});

app.post('/api/user', (req, res) => {
    if (!req.body.email) {
        res.status(400).json({status: "error", message: "email field is required in request body"});
    }

    user = { email: req.body.email };

    db.run('INSERT INTO users (email) VALUES (?)',
        [user.email],
        function(err) {
            if (err && err.message.includes("UNIQUE constraint failed")) {
                res.status(409).json({status: "error", message: "user with that email already exists"});
            } else if (err) {
                res.status(500).json({status: "error", message: "an unexpected error has ocurred"});
            } else {
                res.json({status: "success", message: {id: this.lastID, ...user}});
            }
        }
    );
});


app.post('/api/user/v2', (req, res) => {
    if (!req.body.email) {
        res.status(400).json({
            status: "error",
            message: "invalid request"
        });
        return;
    }
    const handleSuccess = (user) => {
        res.json({
            status: "success",
            user: user
        });
    }
    const handleFailure = (error) => {
        if (error.message.includes("UNIQUE constraint failed")) {
            res.status(409).json({
                status: "error",
                message: "user already exists"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "unexpected error"
            });
        }
    }

    let user = { email: req.body.email };
    commands.createUser(user, handleSuccess, handleFailure);
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
            } else if (this.changes === 0) {
                res.status(404).json({status: "error", message: `user with id of ${user_id} was not found`});
            } else {
                res.json({status: "success", message: `user with id of ${user_id} no longer in database`});
            }
        }
    );
});


app.delete('/api/user/:user_id/v2', (req, res) => {
    if (!req.params.user_id){
        res.status(400).json({
            status: "error",
            message: "invalid request"
        });
        return;
    }
    const onSuccess = () => {
        res.json({
            status: "success",
            message: "user deleted"
        });
    }
    const onFailure = (error) => {
        if (error.message.includes("not found")) {
            res.status(404).json({
                status: "error",
                message: "user not found"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "unexpected error"
            });
        }
    }

    const user_id = req.params.user_id;
    commands.deleteUser(user_id, onSuccess, onFailure);
});



app.post('/api/rating', (req, res) => {
    if (!req.body.user_id || !req.body.image_id || !req.body.value ) {
        res.status(400).json({status: "error", message: "request body must contain user_id, image_id and value"});
    } else if (![1, 2, 3, 4, 5].includes(req.body.value)) {
        res.status(400).json({status: "error", message: "rating value must be either 1, 2, 3, 4, or 5"});
    }

    rating = { user_id: req.body.user_id, 
        image_id: req.body.image_id, 
        value: req.body.value 
    }

    db.run('INSERT INTO ratings (user_id, image_id, value) VALUES (?, ?, ?)',
        [rating.user_id, rating.image_id, rating.value],
        function (err) {
            if (err && err.message.includes("UNIQUE constraint failed")) {
                res.status(409).json({status: "error", message: "rating for that image_id by user_id already exists"});
            } else if (err && err.message.includes("FOREIGN KEY constraint failed")) {
                res.status(400).json({status: "error", message: "user_id or image_id do not exist in database"});
            } else if (err) {
                res.status(500).json({status: "error", message: err.message});
            } else {
                res.json({status: "success", message: {id: this.lastID, ...rating}});
            }
        }
    );
});

app.post('api/rating/v2', (req, res) => {
    if (
        !req.body.user_id ||
        !req.body.image_id ||
        !req.body.value ||
        ![1, 2, 3, 4, 5].includes(req.body.value) 
    ) {
            res.status(400).json({
                status: "error",
                message: "invalid request"
            });
            return;
    }
    const onSuccess = (rating) => {
        res.json({
            status: "success",
            rating: rating
        });
    }
    const onFailure = (error) => {
        if (error.message.includes("UNIQUE constraint failed")) {
            res.status(409).json({
                status: "error",
                message: "rating already exists"
            });
        } else if (error.message.includes("FOREIGN KEY constraint failed")) {
            res.status(404).json({
                status: "error",
                message: "user or image not found"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "unexpected error"
            });
        }
    }

    let rating = {
        user_id: req.body.user_id,
        image_id: req.body.image_id,
        value: req.body.value
    };
    commands.createRating(rating, onSuccess, onFailure);
});


app.put('/api/rating/:rating_id', (req, res) => {
    if (!req.params.rating_id) {
        res.status(400).json({status: "error", message: "rating_id param is required in url (/api/rating/{rating_id})"});
    }
    if (!req.body.value) {
        res.status(400).json({status: "error", message: "request body must contain value"});
    } else if (![1, 2, 3, 4, 5].includes(req.body.value)) {
        res.status(400).json({status: "error", message: "value must be either 1, 2, 3, 4, or 5"});
    }

    rating = {id: req.params.rating_id, value: req.body.value};

    db.run('UPDATE ratings SET value = (?) WHERE id = (?)',
        [rating.value, rating.id],
        function (err) {
            if (err) {
                res.status(500).json({status: "error", message: err.message});
            } else if (this.changes === 0) {
                res.status(400).json({status: "error", message: "rating with id rating_id not found"});
            } else {
                res.json({status: "success", message: rating});
            }
        }
    );
});

app.put('/api/rating/:rating_id/v2', (req, res) => {
    if (
        !req.params.rating_id ||
        !req.body.value ||
        ![1, 2, 3, 4, 5].includes(req.body.value)
    ) {
            res.status(400).json({
                status: "error",
                message: "invalid request"
            });
            return;
    }
    const onSuccess = (rating) => {
        res.json({
            status: "success",
            rating: rating
        });
    };
    const onFailure = (error) => {
        if (error.message.includes("not found")) {
            res.status(404).json({
                status: "error",
                message: "rating not found"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "unexpected error"
            });
        }    
    }

    rating = {
        id = req.params.rating_id,
        value = req.body.value
    }
    commands.updateRating(rating, onSuccess, onFailure);
});


app.delete('/api/rating/:rating_id', (req, res) => {
    if (!req.params.rating_id) {
        res.status(400).json({status: "error", message: "rating_id param is required in url (/api/rating/{rating_id})"});
    }

    rating_id = req.params.rating_id;

    db.run('DELETE FROM ratings WHERE id = (?)',
        [rating_id],
        function(err) {
            if (err) {
                res.status(500).json({status: "error", message: err.message});
            } else if (this.changes === 0) {
                res.status(404).json({status: "error", message: `rating with id of ${rating_id} was not found`});
            } else {
                res.json({status: "success", message: `rating with id of ${rating_id} no longer in database`});
            }
        }
    );
});

app.delete('/api/rating/:rating_id/v2', (req, res) => {
    if (!req.params.rating_id) {
        res.status(400).json({
            status: "error",
            message: "invalid request"
        });
        return;
    }
    const onSuccess = () => {
        res.json({
            status: "success",
            message: "rating deleted"
        });
    }
    const onFailure = (error) => {
        if (error.message.includes("not found")) {
            res.status(404).json({
                status: "error",
                message: "rating not found"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "unexpected error"
            });
        }   
    }

    let rating = {
        id: req.params.rating_id
    };
    commands.deleteRating(rating, onSuccess, onFailure);
});

app.get('/api/user/:user_id/ratings', (req, res) => {
    if (!req.params.user_id) {
        res.status(400).json({status: "error", message: "user_id param is required in url (/api/users/{user_id})"});
    }

    user_id = req.params.user_id;

    db.get('SELECT * FROM users WHERE id = (?)',
        [user_id],
        function(err, row) {
            if (err) {
                res.status(500).json({status: "error", message: err.message});
            } else if (!row) {
                res.status(404).json({status: "error", message: "user not found"})
            } else {
                db.all('SELECT * FROM ratings WHERE user_id = (?)',
                    [user_id],
                    function(err, rows) {
                        if (err) {
                            res.status(500).json({status: "error", message: err.message});
                        } else {
                            res.json({status: "success", ratings: rows})
                        }
                    }
                );
            }
        }
    );
});

app.get('/api/user/:user_id/ratings/v2', (req, res) => {
    if (!req.params.user_id) {
        res.status(400).json({
            status: "error",
            message: "invalid request"
        });
        return;
    }
    const onSuccess = (rows) => {
        res.json({
            status: "success",
            ratings: rows
        });
    }
    const onFailure = (error) => {
        if (error.message.includes("not found")) {
            res.status(404).json({
                status: "error",
                message: "rating not found"
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "unexpected error"
            });
        }
    }

    let user = {
        id: req.params.user_id
    };
    commands.getUserRatings(user, onSuccess, onFailure);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});