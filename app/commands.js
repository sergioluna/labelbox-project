const db = require('./database');
const axios = require('axios');

const fetchNASAImage = async (apiKey, onSuccess, onFailure) => {
    if (!apiKey) {
        apiKey = "DEMO_KEY";
    }

    try {
        url = "https://api.nasa.gov/planetary/apod?api_key=".concat(apiKey);
        const resp = await axios.get(url);
        return resp.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const createUser = (user, onSuccess, onFailure) => {
    sql = 'INSERT INTO users (email) VALUES (?)';
    values = [user.email];
    
    db.run(sql, values, function(error) {
        if (error) {
            onFailure(error);
        } else {
            user = {
                id: this.lastID,
                ...user
            };
            onSuccess(user);
        }
    });
}

const deleteUser = (user_id, onSuccess, onFailure) => {
    sql = 'DELETE FROM users WHERE id = (?)';
    values = [user_id];

    db.run(sql, values, function(error) {
        if (error) {
            onFailure(error);
        } else if (this.changes === 0) {
            const error = {message: "not found"};
            onFailure(error);
        } else {
            onSuccess();
        }
    });
}

const createRating = (rating, onSuccess, onFailure) => {
    sql = 'INSERT INTO ratings (user_id, image_id, value) VALUES (?, ?, ?)';
    values = [rating.user_id, rating.image_id, rating.value];

    db.run(sql, values, function(error) {
        if (error){
            onFailure(error);
        } else {
            rating = {
                id: this.lastID,
                ...rating
            };
            onSuccess(rating);
        }
    });
}

const updateRating = (rating, onSuccess, onFailure) => {
    sql = 'UPDATE ratings SET value = (?) WHERE id = (?)';
    values = [rating.value, rating.id];

    db.run(sql, values, function(error) {
        if (error) {
            onFailure(error);
        } else if (this.changes === 0) {
            const error = {message: "not found"};
            onFailure(error);
        } else {
            onSuccess(rating);
        }
    });
}

const deleteRating = (rating, onSuccess, onFailure) => {
    sql = 'DELETE FROM users WHERE id = (?)';
    values = [rating.id];

    db.run(sql, values, function(error) {
        if (error) {
            onFailure(error);
        } else if (this.changes === 0) {
            const error = {message: "not found"};
            onFailure(error);
        } else {
            onSuccess();
        }
    });
}

const getUserRatings = (user, onSuccess, onFailure) => {
    sql = 'SELECT * FROM users WHERE id = (?)';
    values = [user.id];

    db.get(sql, values, function(error, row) {
        if (error) {
            onFailure(error);
        } else if (!row) {
            const error = {message: "not found"}
            onFailure(error);
        } else {
            sql = 'SELECT * FROM rating WHERE user_id = (?)';
            values = [user.id]

            db.run(sql, values, function(error, rows) {
                if (error) {
                    onFailure(error);
                } else {
                    onSuccess(rows);
                }
            });
        }
    });
}


module.exports = {
    fetchNASAImage,
    createUser,
    deleteUser,
    createRating,
    updateRating,
    deleteRating,
    getUserRatings
}
