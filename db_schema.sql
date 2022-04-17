CREATE TABLE users (
    id INTEGER PRIMARY KEY, 
    username TEXT NOT NULL, 
    password TEXT NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    email TEXT NOT NULL
);

CREATE TABLE user_settings ( 
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL, 
    account_public BOOLEAN DEFAULT true,
    email TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE images (
    id INTEGER PRIMARY KEY, 
    title TEXT NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    user_id INTEGER REFERENCES users(id), 
    url TEXT NOT NULL
);

CREATE TABLE comments (
    id INTEGER PRIMARY KEY, 
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    user_id INTEGER REFERENCES users(id), 
    image_id INTEGER REFERENCES images(id)
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    sender INTEGER REFERENCES users(id),
    receiver INTEGER REFERENCES users(id),
    message TEXT,
    sent_on DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    unread INTEGER DEFAULT 1,
    deleted_by_sender INTEGER DEFAULT 0,
    deleted_by_receiver INTEGER DEFAULT 0
);
