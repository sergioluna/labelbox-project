const sql_create_images_table = `CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL
);`;

const sql_create_users_table = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL
);`;

const sql_create_ratings_table = `CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    value INTEGER NOW NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (image_id) REFERENCES images(id)
);`;

const sqlite3 = require('sqlite3').verbose();
const databaseName = 'db.sqlite3';

const db = new sqlite3.Database(databaseName, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log(`Connected to database: ${databaseName}`);
        db.run(sql_create_images_table, (err) => {
            if (err) {
                console.error(err.message);
                throw err;
            }
            console.log('images table created');
        });
        db.run(sql_create_users_table, (err) => {
            if (err) {
                console.error(err.message);
                throw err;
            }
            console.log('users table created');
        });
        db.run(sql_create_ratings_table, (err) => {
            if (err) {
                console.error(err.message);
                throw err;
            }
            console.log('ratings table created');
        });
    }
});

export default db;