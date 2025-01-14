-- schema_and_data.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_attendance;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS performance_cast;
DROP TABLE IF EXISTS avatars;
DROP TABLE IF EXISTS scenes_performances;
DROP TABLE IF EXISTS performances;
DROP TABLE IF EXISTS scenes;
DROP TABLE IF EXISTS users;
   
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    eos_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    pcloud_file_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS performances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    owner INTEGER NOT NULL,
    about TEXT,
    FOREIGN KEY (owner) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS scenes_performances (
    scene_id INTEGER NOT NULL,
    performance_id INTEGER NOT NULL,
    FOREIGN KEY (scene_id) REFERENCES scenes (id),
    FOREIGN KEY (performance_id) REFERENCES performances (id),
    PRIMARY KEY (scene_id, performance_id)
);

CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS performance_cast (
    avatar_id INTEGER NOT NULL,
    performance_id INTEGER NOT NULL,
    FOREIGN KEY (avatar_id) REFERENCES avatars (id),
    FOREIGN KEY (performance_id) REFERENCES performances (id),
    PRIMARY KEY (avatar_id, performance_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    performance_id INTEGER NOT NULL,
    motion_data TEXT,
    face_data TEXT,
    light_data TEXT,
    prop_data TEXT,
    streaming_url TEXT,
    FOREIGN KEY (performance_id) REFERENCES performances (id)
);

CREATE TABLE IF NOT EXISTS user_attendance (
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    PRIMARY KEY (session_id, user_id)
);

-- Insert Mock Data
INSERT INTO users (name, email, eos_id) VALUES
    ('Alice', 'alice@example.com', 'EOS123'),
    ('Bob', 'bob@example.com', 'EOS456'),
    ('Charlie', 'charlie@example.com', 'EOS789');

INSERT INTO scenes (name, pcloud_file_id) VALUES
    ('Beach Scene', 1001),
    ('City Scene', 1002),
    ('Forest Scene', 1003);

INSERT INTO performances (title, owner, about) VALUES
    ('Morning Show', 1, 'A relaxing morning show at the beach.'),
    ('Evening Drama', 2, 'A thrilling city drama.'),
    ('Nature Escape', 3, 'A peaceful escape into the forest.');

INSERT INTO scenes_performances (scene_id, performance_id) VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (1, 3);

INSERT INTO avatars (name, user_id) VALUES
    ('Avatar1', 1),
    ('Avatar2', 2),
    ('Avatar3', 3);

INSERT INTO performance_cast (avatar_id, performance_id) VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (1, 3);

INSERT INTO sessions (title, performance_id, motion_data, face_data, light_data, prop_data, streaming_url) VALUES
    ('Session1', 1, 'motion1.bvh', 'face1.csv', 'light1.json', 'prop1.csv', 'http://stream1.com'),
    ('Session2', 2, 'motion2.bvh', 'face2.csv', 'light2.json', 'prop2.csv', 'http://stream2.com');

INSERT INTO user_attendance (session_id, user_id) VALUES
    (1, 1),
    (1, 2),
    (2, 3);
