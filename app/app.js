const commands = require('./commands');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000

app.use(bodyParser.json());


app.get('/api/NASAImage', async (req, res) => {
    data = await commands.fetchNASAImage(req.body.api_key);
    if (!data) {
        res.status(500).json({
            status: "error",
            message: "unexpected error"
        });
        return;
    }
    const handleSuccess = (image) => {
        res.json({
            status: "success",
            image: image
        });
    }
    const handleFailure = (error) => {
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
    commands.saveNASAImage(image, handleSuccess, handleFailure)
});


app.post('/api/user', (req, res) => {
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
    if (!req.params.user_id){
        res.status(400).json({
            status: "error",
            message: "invalid request"
        });
        return;
    }
    const handleSuccess = () => {
        res.json({
            status: "success",
            message: "user deleted"
        });
    }
    const handleFailure = (error) => {
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
    commands.deleteUser(user_id, handleSuccess, handleFailure);
});


app.post('/api/rating', (req, res) => {
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
    const handleSuccess = (rating) => {
        res.json({
            status: "success",
            rating: rating
        });
    }
    const handleFailure = (error) => {
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
    commands.createRating(rating, handleSuccess, handleFailure);
});


app.put('/api/rating/:rating_id', (req, res) => {
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
    const handleSuccess = (rating) => {
        res.json({
            status: "success",
            rating: rating
        });
    };
    const handleFailure = (error) => {
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
        id: req.params.rating_id,
        value: req.body.value
    }
    commands.updateRating(rating, handleSuccess, handleFailure);
});


app.delete('/api/rating/:rating_id', (req, res) => {
    if (!req.params.rating_id) {
        res.status(400).json({
            status: "error",
            message: "invalid request"
        });
        return;
    }
    const handleSuccess = () => {
        res.json({
            status: "success",
            message: "rating deleted"
        });
    }
    const handleFailure = (error) => {
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
    commands.deleteRating(rating, handleSuccess, handleFailure);
});


app.get('/api/user/:user_id/ratings', (req, res) => {
    if (!req.params.user_id) {
        res.status(400).json({
            status: "error",
            message: "invalid request"
        });
        return;
    }
    const handleSuccess = (rows) => {
        res.json({
            status: "success",
            ratings: rows
        });
    }
    const handleFailure = (error) => {
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

    let user = {
        id: req.params.user_id
    };
    commands.getUserRatings(user, handleSuccess, handleFailure);
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});