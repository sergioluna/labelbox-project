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

module.exports = {createUser}
