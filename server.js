const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const session = require('express-session');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(bodyParser.json());
require('dotenv').config();


const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};
app.use(cors(corsOptions));

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'codeslime'
});

// Function to execute SQL queries
function executeQuery(sql, params) {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) reject(error);
            connection.query(sql, params, (error, results) => {
                connection.release();
                if (error) reject(error);
                else resolve(results);
            });
        });
    });
}



// Function to create a new database if it doesn't exist
async function createDatabaseIfNotExists() {
    try {
        // Get a connection from the pool
        const connection = await new Promise((resolve, reject) => {
            pool.getConnection((error, connection) => {
                if (error) reject(error);
                else resolve(connection);
            });
        });

        // Create the database if it doesn't exist
        await new Promise((resolve, reject) => {
            connection.query('CREATE DATABASE IF NOT EXISTS codeslime', (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        console.log('Database created or already exists.');

        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Error creating database:', error);
    }
}

// Switch to the new database for subsequent operations
async function switchToDatabase() {
    try {
        // Get a connection from the pool
        const connection = await new Promise((resolve, reject) => {
            pool.getConnection((error, connection) => {
                if (error) reject(error);
                else resolve(connection);
            });
        });

        // Switch to the new database
        await new Promise((resolve, reject) => {
            connection.query('USE codeslime', (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        console.log('Switched to the new database.');

        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Error switching to the new database:', error);
    }
}

// Function to create tables if they don't exist
async function createTablesIfNotExists() {
    try {
        // Get a connection from the pool
        const connection = await new Promise((resolve, reject) => {
            pool.getConnection((error, connection) => {
                if (error) reject(error);
                else resolve(connection);
            });
        });

        // Create the channels table if it doesn't exist
        await new Promise((resolve, reject) => {
            const sql = `
                CREATE TABLE IF NOT EXISTS channels (
                    id INT AUTO_INCREMENT,
                    name VARCHAR(255),
                    description TEXT,
                    PRIMARY KEY(id)
                )
            `;
            connection.query(sql, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        console.log('Channels table created or already exists.');

        // Create the messages table if it doesn't exist
        await new Promise((resolve, reject) => {
            const sql = `
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT,
                channel_id INT,
                author VARCHAR(255),
                image_url VARCHAR(255),
                content TEXT,
                time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reply_to INT,
                PRIMARY KEY(id),
                FOREIGN KEY(channel_id) REFERENCES channels(id),
                FOREIGN KEY(reply_to) REFERENCES messages(id)
            )
            `;
            connection.query(sql, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
        console.log('Messages table created or already exists.');


        await new Promise((resolve, reject) => {
            const sql = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT,
                    display_name VARCHAR(255),
                    username VARCHAR(255) UNIQUE,
                    password VARCHAR(255),
                    PRIMARY KEY(id)
                )
            `;
            connection.query(sql, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
        console.log('Users table created or already exists.');



        await new Promise((resolve, reject) => {
            const sql = `
                CREATE TABLE IF NOT EXISTS user_channels (
                    id INT AUTO_INCREMENT,
                    user_id INT,
                    channel_id INT,
                    PRIMARY KEY(id),
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(channel_id) REFERENCES channels(id)
                )
            `;
            connection.query(sql, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
        console.log('User channels table created or already exists.');


        await new Promise((resolve, reject) => {
            const sql = `
                CREATE TABLE IF NOT EXISTS reactions (
                    id INT AUTO_INCREMENT,
                    channel_id INT,
                    user_id INT,
                    message_id INT,
                    type ENUM('like', 'dislike'),
                    PRIMARY KEY(id),
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(message_id) REFERENCES messages(id)
                )
            `;
            connection.query(sql, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
        console.log('Reactions table created or already exists.');

        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}


async function main() {
    // Call the functions to create and switch to the database
    await createDatabaseIfNotExists();
    await switchToDatabase();
    await createTablesIfNotExists();

    

    // Middleware to check if the user is authenticated
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        req.user = req.session.user;
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
};

    // Create an admin user if it doesn't exist
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const salt = await bcrypt.genSalt(10);
const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);

const sqlCheck = 'SELECT * FROM users WHERE username = ?';
const userExists = await executeQuery(sqlCheck, [adminUsername]);

if (!userExists.length) {
    const sqlInsert = 'INSERT INTO users (username, password) VALUES (?, ?)';
    await executeQuery(sqlInsert, [adminUsername, hashedAdminPassword]);
    console.log('Admin user created.');
} else {
    console.log('Admin user already exists.');
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true } // Set secure to true if using HTTPS
}));
    

app.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Retrieve the user from your database
    const sql = 'SELECT * FROM users WHERE username = ?';
    const users = await executeQuery(sql, [username]);
    const user = users[0];

    if (!user) {
        return res.status(400).json({ error: 'Invalid username' });
    }

    // Verify the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
    }

    // Check if the user is the admin
    const isAdmin = username === process.env.ADMIN_USERNAME;

    // Store user data in session
    req.session.user = { id: user.id, username: user.username, isAdmin: isAdmin };

    // Send response back to client
    res.json({ message: 'Logged in successfully', isAdmin: isAdmin });
    console.log(isAdmin);
}));


    
    // Create a table for channels and messages in your MySQL database
    app.post('/channels', asyncHandler (async (req, res) => {
    // Implement logic to create a new channel
    const { name, description } = req.body; // Get the name of the channel from the request body
    if (!name) {
        // If the name is missing, return an error
        return res.status(400).json({ error: "Channel name is required" });
    }
    // Create a SQL query to insert a new channel into the channels table
    const sql = "INSERT INTO channels (name, description) VALUES (?, ?)";
    // Get a connection from the pool and execute the query with the name as a parameter
    pool.getConnection((error, connection) => {
        if (error) {
            // If there is an error, return a server error
            return res.status(500).json({ error: error.message });
        }
        connection.query(sql, [name, description], (error, results) => {
            if (error) {
                // If there is an error, return a server error
                return res.status(500).json({ error: error.message });
            }
            // If the query is successful, return the inserted channel with the generated id
            res.json({ id: results.insertId, name, description });
            // Release the connection back to the pool
            connection.release();
        });
    });
}));


app.get('/channels', checkAuthenticated, asyncHandler (async (req, res) => {
    // Implement logic to retrieve all channels
    // Create a SQL query to select all channels from the channels table
    const sql = "SELECT * FROM channels";
    // Get a connection from the pool and execute the query
    pool.getConnection((error, connection) => {
        if (error) {
            // If there is an error, return a server error
            return res.status(500).json({ error: error.message });
        }
        connection.query(sql, (error, results) => {
            if (error) {
                // If there is an error, return a server error
                return res.status(500).json({ error: error.message });
            }
            // If the query is successful, return the results as an array of channels
            res.json(results);
            // Release the connection back to the pool
            connection.release();
        });
    });
}));


app.post('/messages', checkAuthenticated, asyncHandler(async (req, res) => {
    const { channel_id, content, reply_to } = req.body;
    const author = req.user.id;

    if (!channel_id || !author || !content) {
        return res.status(400).json({ error: "Channel id, author, and content are required" });
    }

    const sql = "INSERT INTO messages (channel_id, author, content, reply_to) VALUES (?, ?, ?, ?)";
    pool.getConnection((error, connection) => {
        if (error) {
            console.error('Error getting connection from pool:', error);
            return res.status(500).json({ error: 'Error getting connection from pool: ' + error.message });
        }
        connection.query(sql, [channel_id, author, content, reply_to], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ error: 'Error executing query: ' + error.message });
            }
            res.json({ id: results.insertId, channel_id, author, content, reply_to });
            connection.release();
        });
    });
}));



app.get('/messages/:channelId', checkAuthenticated, asyncHandler (async (req, res) => {
    // Implement logic to retrieve messages for a specific channel
    const { channelId } = req.params; // Get the channel id from the request parameters
    if (!channelId) {
        // If the channel id is missing, return an error
        return res.status(400).json({ error: "Channel id is required" });
    }
    // Create a SQL query to select all messages from the messages table where the channel id matches the parameter
    const sql = `
    SELECT m.*, u.display_name as authorDisplayName
    FROM messages m
    JOIN users u ON m.author = u.id
    WHERE m.channel_id = ?`;
    // Get a connection from the pool and execute the query with the channel id as a parameter
    pool.getConnection((error, connection) => {
        if (error) {
            // If there is an error, return a server error
            return res.status(500).json({ error: error.message });
        }
        connection.query(sql, [channelId], (error, results) => {
            if (error) {
                // If there is an error, return a server error
                return res.status(500).json({ error: error.message });
            }
            // Nest replies
            const messages = results.map(msg => ({ ...msg, replies: [] }));
            messages.forEach(msg => {
                if (msg.reply_to) {
                    const parentMsg = messages.find(m => m.id === msg.reply_to);
                    if (parentMsg) {
                        parentMsg.replies.push(msg);
                    }
                }
            });

            // Filter out top-level messages
            const topLevelMessages = messages.filter(msg => !msg.reply_to);

            connection.release();
            res.json(topLevelMessages);
        });
    });
}));


app.get('/messages', checkAuthenticated, asyncHandler(async (req, res) => {
    // SQL query to select all messages
    const sql = "SELECT * FROM messages";
    try {
        const messages = await executeQuery(sql);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));





// Function to save image URL to the database
const saveImageUrlToDatabase = async (imageUrl, messageId) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE messages SET image_url = ? WHERE id = ?';
        pool.query(query, [imageUrl, messageId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// Endpoint to handle image upload
app.post('/upload', checkAuthenticated, upload.single('image'), async (req, res) => {
    const file = req.file;
    console.log('File uploaded:', file);
    const messageId = req.body.messageId; 
    console.log('Message ID:', messageId);
    console.log('Request body:', req.body);

    if (!file || !messageId) {
        return res.status(400).send('File and messageId are required.');
    }

    const imageUrl = `/uploads/${file.filename}`;

    try {
        await saveImageUrlToDatabase(imageUrl, messageId);
        res.send('File uploaded and URL saved successfully.');
    } catch (error) {
        console.error('Error saving file URL to database:', error);
        res.status(500).send('Error saving file information.');
    }
});




app.post('/signup', asyncHandler(async (req, res) => {
    const { username, display_name, password } = req.body;

    if (!username || !display_name || !password) {
        return res.status(400).json({ error: 'Username, display name, and password are required' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store the user data in your database
    const sql = 'INSERT INTO users (username, display_name, password) VALUES (?, ?, ?)';
    const result = await executeQuery(sql, [username, display_name, hashedPassword]);

    res.json({ id: result.insertId, username, display_name });
}));





app.get('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Retrieve the user from your database
        const sql = 'SELECT * FROM users WHERE username = ?';
        const users = await executeQuery(sql, [username]);
        const user = users[0];

        if (!user) {
            console.error(`User with username ${username} not found`);
            return res.status(400).json({ error: 'Invalid username' });
        }

        // Do not send password back to the client
        delete user.password;

        res.json(user);
    } catch (error) {
        console.error(`Error retrieving user with username ${username}: ${error}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// POST route to like a channel
app.post('/channels/:id/like', checkAuthenticated, asyncHandler(async (req, res) => {
    const channelId = req.params.id;
    const userId = req.user.id;

    // Check if the user has already reacted to this channel
    const checkSql = 'SELECT * FROM reactions WHERE user_id = ? AND channel_id = ?';
    const existingReaction = await executeQuery(checkSql, [userId, channelId]);

    if (existingReaction.length > 0) {
        // Update the existing reaction
        const updateSql = 'UPDATE reactions SET type = "like" WHERE user_id = ? AND channel_id = ?';
        await executeQuery(updateSql, [userId, channelId]);
    } else {
        // Insert a new like
        const insertSql = 'INSERT INTO reactions (user_id, channel_id, type) VALUES (?, ?, "like")';
        await executeQuery(insertSql, [userId, channelId]);
    }

    res.json({ message: 'Channel liked successfully' });
}));


// POST route to dislike a channel
app.post('/channels/:id/dislike', checkAuthenticated, asyncHandler(async (req, res) => {
    const channelId = req.params.id;
    const userId = req.user.id;

    // Check if the user has already reacted to this channel
    const checkSql = 'SELECT * FROM reactions WHERE user_id = ? AND channel_id = ?';
    const existingReaction = await executeQuery(checkSql, [userId, channelId]);

    if (existingReaction.length > 0) {
        // Update the existing reaction
        const updateSql = 'UPDATE reactions SET type = "dislike" WHERE user_id = ? AND channel_id = ?';
        await executeQuery(updateSql, [userId, channelId]);
    } else {
        // Insert a new dislike
        const insertSql = 'INSERT INTO reactions (user_id, channel_id, type) VALUES (?, ?, "dislike")';
        await executeQuery(insertSql, [userId, channelId]);
    }

    res.json({ message: 'Channel disliked successfully' });
}));

// GET route to fetch the user's reaction to a specific channel
app.get('/channels/:id/reaction', checkAuthenticated, asyncHandler(async (req, res) => {
    const channelId = req.params.id;
    const userId = req.user.id;

    // SQL to check the user's reaction
    const sql = 'SELECT type FROM reactions WHERE user_id = ? AND channel_id = ?';
    const results = await executeQuery(sql, [userId, channelId]);

    if (results.length > 0) {
        // User has a reaction to this channel
        res.json({ reaction: results[0].type });
    } else {
        // User has no reaction to this channel
        res.json({ reaction: null });
    }
}));

app.get('/users', checkAuthenticated, asyncHandler(async (req, res) => {
    // Check if the logged-in user is the admin
    if (req.session.user.username !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    // Retrieve all users from your database
    const sql = 'SELECT * FROM users';
    try {
        const users = await executeQuery(sql);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));



app.get('/channels/:id', asyncHandler(async (req, res) => {
    const channelId = req.params.id;
    // SQL query to get channel details along with like and dislike counts
    const sql = `
        SELECT c.*, 
            (SELECT COUNT(*) FROM reactions WHERE channel_id = c.id AND type = 'like') AS likesCount,
            (SELECT COUNT(*) FROM reactions WHERE channel_id = c.id AND type = 'dislike') AS dislikesCount
        FROM channels c
        WHERE c.id = ?`;

    const channel = await executeQuery(sql, [channelId]);
    res.json(channel);
}));

app.post('/search', asyncHandler(async (req, res) => {
    const { searchTerm } = req.body;
    console.log('Search term:', searchTerm);
    const searchQuery = `
    SELECT id, name, description, 'channel' as type FROM channels 
    WHERE name LIKE ? OR description LIKE ?
    UNION
    SELECT id, content, NULL as description, 'message' as type FROM messages 
    WHERE content LIKE ?
    `;

    console.log('Search query:', searchQuery);

    const searchWildcard = `%${searchTerm}%`;

    console.log('Search wildcard:', searchWildcard);
    const results = await executeQuery(searchQuery, [searchWildcard, searchWildcard, searchWildcard]);
    res.json(results);
}));



app.delete('/users/:id', checkAuthenticated, asyncHandler(async (req, res) => {
    const { id } = req.params;

    //check if user is logged in
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }

    // Check if the logged-in user is the admin
    if (req.session.user.username !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    // Delete the user
    const sql = 'DELETE FROM users WHERE id = ?';
    await executeQuery(sql, [id]);

    res.json({ message: 'User deleted successfully' });
}));

app.delete('/channels/:id', checkAuthenticated, asyncHandler(async (req, res) => {
    const { id } = req.params;

    //check if user is logged in
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }

    // Check if the logged-in user is the admin
    if (req.session.user.username !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    // Delete the channel
    const sql = 'DELETE FROM channels WHERE id = ?';
    await executeQuery(sql, [id]);

    res.json({ message: 'Channel deleted successfully' });
}));

app.delete('/messages/:id', checkAuthenticated, asyncHandler(async (req, res) => {
    const { id } = req.params;

    //check if user is logged in
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }

    // Check if the logged-in user is the admin
    if (req.session.user.username !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    // Delete the message
    const sql = 'DELETE FROM messages WHERE id = ?';
    await executeQuery(sql, [id]);

    res.json({ message: 'Message deleted successfully' });
}));


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({ error: 'Could not log out.' });
        } else {
            res.clearCookie('session-id');
            return res.json({ message: 'Successfully logged out.' });
        }
    });
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`Something went wrong! Error: ${err.message}`);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
}

main();
