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
            }
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
            error = {message: "not found"};
            onFailure(error);
        } else {
            onSuccess();
        }
    });
}

module.exports = {
    createUser,
    deleteUser
}
