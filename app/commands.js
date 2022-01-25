const db = require('./database');


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


module.exports = {
    createUser,
    deleteUser,
    createRating,
    updateRating
}
