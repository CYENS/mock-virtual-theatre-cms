-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_attendance;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS performance_cast;
DROP TABLE IF EXISTS avatars;
DROP TABLE IF EXISTS scenes_performances;
DROP TABLE IF EXISTS performances;
DROP TABLE IF EXISTS scenes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS prop_motion_data;
DROP TABLE IF EXISTS avatar_motion_data;
DROP TABLE IF EXISTS face_data;
DROP TABLE IF EXISTS audio_data;
DROP TABLE IF EXISTS light_data;
DROP TABLE IF EXISTS props;

-- Create Tables

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    eos_id TEXT NOT NULL
);

-- Scenes Table
CREATE TABLE IF NOT EXISTS scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    pcloud_file_id INTEGER NOT NULL
);

-- Performances Table
CREATE TABLE IF NOT EXISTS performances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    owner INTEGER NOT NULL,
    about TEXT,
    FOREIGN KEY (owner) REFERENCES users (id)
);

-- Scenes-Performances Table
CREATE TABLE IF NOT EXISTS scenes_performances (
    scene_id INTEGER NOT NULL,
    performance_id INTEGER NOT NULL,
    FOREIGN KEY (scene_id) REFERENCES scenes (id),
    FOREIGN KEY (performance_id) REFERENCES performances (id),
    PRIMARY KEY (scene_id, performance_id)
);

-- Avatars Table
CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Performance Cast Table
CREATE TABLE IF NOT EXISTS performance_cast (
    avatar_id INTEGER NOT NULL,
    performance_id INTEGER NOT NULL,
    FOREIGN KEY (avatar_id) REFERENCES avatars (id),
    FOREIGN KEY (performance_id) REFERENCES performances (id),
    PRIMARY KEY (avatar_id, performance_id)
);

-- Props Table
CREATE TABLE IF NOT EXISTS props (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    pcloud_file_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    position TEXT NOT NULL,
    rotation TEXT NOT NULL,
    scale TEXT NOT NULL
);

-- Prop Motion Data Table
CREATE TABLE IF NOT EXISTS prop_motion_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pcloud_file_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    prop_id INTEGER NOT NULL,
    initial_position TEXT NOT NULL,
    initial_rotation TEXT NOT NULL,
    FOREIGN KEY (prop_id) REFERENCES props (id)
);

-- Avatar Motion Data Table
CREATE TABLE IF NOT EXISTS avatar_motion_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pcloud_file_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    avatar_id INTEGER NOT NULL,
    initial_position TEXT NOT NULL,
    initial_rotation TEXT NOT NULL,
    FOREIGN KEY (avatar_id) REFERENCES avatars (id)
);

-- Face Data Table
CREATE TABLE IF NOT EXISTS face_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pcloud_file_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    avatar_id INTEGER NOT NULL,
    FOREIGN KEY (avatar_id) REFERENCES avatars (id)
);

-- Audio Data Table
CREATE TABLE IF NOT EXISTS audio_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pcloud_file_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    avatar_id INTEGER NOT NULL,
    FOREIGN KEY (avatar_id) REFERENCES avatars (id)
);

-- Light Data Table
CREATE TABLE IF NOT EXISTS light_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pcloud_file_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    light_id INTEGER NOT NULL,
    position TEXT NOT NULL,
    light_type TEXT NOT NULL,
    light_characteristics_json TEXT NOT NULL
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    owner INTEGER NOT NULL,
    performance_id INTEGER NOT NULL,
    motion_data INTEGER NOT NULL,
    face_data INTEGER NOT NULL,
    light_data INTEGER NOT NULL,
    audio_data INTEGER NOT NULL,
    prop_data INTEGER NOT NULL,
    streaming_url TEXT NOT NULL,
    FOREIGN KEY (owner) REFERENCES users (id),
    FOREIGN KEY (performance_id) REFERENCES performances (id),
    FOREIGN KEY (motion_data) REFERENCES avatar_motion_data (id),
    FOREIGN KEY (face_data) REFERENCES face_data (id),
    FOREIGN KEY (light_data) REFERENCES light_data (id),
    FOREIGN KEY (audio_data) REFERENCES audio_data (id),
    FOREIGN KEY (prop_data) REFERENCES props (id)
);

-- User Attendance Table
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
    (3, 3);

INSERT INTO props (name, pcloud_file_id, file_url, position, rotation, scale) VALUES
    ('Chair', 2001, 'https://example.com/chair.usd', '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}', '{"x":1,"y":1,"z":1}');

INSERT INTO prop_motion_data (pcloud_file_id, file_url, prop_id, initial_position, initial_rotation) VALUES
    (3001, 'https://example.com/prop_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}');

INSERT INTO avatar_motion_data (pcloud_file_id, file_url, avatar_id, initial_position, initial_rotation) VALUES
    (4001, 'https://example.com/avatar_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}');

INSERT INTO face_data (pcloud_file_id, file_url, avatar_id) VALUES
    (5001, 'https://example.com/face.json', 1);

INSERT INTO audio_data (pcloud_file_id, file_url, avatar_id) VALUES
    (6001, 'https://example.com/audio.wav', 1);

INSERT INTO light_data (pcloud_file_id, file_url, light_id, position, light_type, light_characteristics_json) VALUES
    (7001, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}');

INSERT INTO sessions (title, owner, performance_id, motion_data, face_data, light_data, audio_data, prop_data, streaming_url) VALUES
    ('Morning Session', 1, 1, 1, 1, 1, 1, 1, 'https://streaming.example.com/session1');
