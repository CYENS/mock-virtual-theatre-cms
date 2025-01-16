-- Drop existing tables if they exist
DROP TABLE IF EXISTS userAttendance;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS performanceCast;
DROP TABLE IF EXISTS avatars;
DROP TABLE IF EXISTS scenesPerformances;
DROP TABLE IF EXISTS performances;
DROP TABLE IF EXISTS scenes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS propMotionData;
DROP TABLE IF EXISTS avatarMotionData;
DROP TABLE IF EXISTS faceData;
DROP TABLE IF EXISTS audioData;
DROP TABLE IF EXISTS lightData;
DROP TABLE IF EXISTS props;

-- Create Tables

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    eosId TEXT NOT NULL
);

-- Scenes Table
CREATE TABLE IF NOT EXISTS scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    owner INTEGER NOT NULL,
    template INTEGER DEFAULT 0,
    public INTEGER DEFAULT 0,
    FOREIGN KEY (owner) REFERENCES users (id)
);

-- Performances Table
CREATE TABLE IF NOT EXISTS performances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    owner INTEGER NOT NULL,
    FOREIGN KEY (owner) REFERENCES users (id)
);

-- Scenes-Performances Table
CREATE TABLE IF NOT EXISTS scenesPerformances (
    sceneId INTEGER NOT NULL,
    performanceId INTEGER NOT NULL,
    FOREIGN KEY (sceneId) REFERENCES scenes (id),
    FOREIGN KEY (performanceId) REFERENCES performances (id),
    PRIMARY KEY (sceneId, performanceId)
);

-- Avatars Table
CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id)
);

-- Performance Cast Table
CREATE TABLE IF NOT EXISTS performanceCast (
    avatarId INTEGER NOT NULL,
    performanceId INTEGER NOT NULL,
    FOREIGN KEY (avatarId) REFERENCES avatars (id),
    FOREIGN KEY (performanceId) REFERENCES performances (id),
    PRIMARY KEY (avatarId, performanceId)
);

-- Props Table
CREATE TABLE IF NOT EXISTS props (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    position TEXT NOT NULL,
    rotation TEXT NOT NULL,
    scale TEXT NOT NULL
);

-- Prop Motion Data Table
CREATE TABLE IF NOT EXISTS propMotionData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    propId INTEGER NOT NULL,
    initialPosition TEXT NOT NULL,
    initialRotation TEXT NOT NULL,
    FOREIGN KEY (propId) REFERENCES props (id)
);

-- Avatar Motion Data Table
CREATE TABLE IF NOT EXISTS avatarMotionData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    avatarId INTEGER NOT NULL,
    initialPosition TEXT NOT NULL,
    initialRotation TEXT NOT NULL,
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Face Data Table
CREATE TABLE IF NOT EXISTS faceData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    avatarId INTEGER NOT NULL,
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Audio Data Table
CREATE TABLE IF NOT EXISTS audioData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    avatarId INTEGER NOT NULL,
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Light Data Table
CREATE TABLE IF NOT EXISTS lightData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    lightId INTEGER NOT NULL,
    position TEXT NOT NULL,
    lightType TEXT NOT NULL,
    lightCharacteristicsJson TEXT NOT NULL
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    owner INTEGER NOT NULL,
    performanceId INTEGER NOT NULL,
    motionData INTEGER DEFAULT NULL,
    faceData INTEGER DEFAULT NULL,
    lightData INTEGER DEFAULT NULL,
    audioData INTEGER DEFAULT NULL,
    propData INTEGER DEFAULT NULL,
    streamingUrl TEXT DEFAULT NULL,
    FOREIGN KEY (owner) REFERENCES users (id),
    FOREIGN KEY (performanceId) REFERENCES performances (id),
    FOREIGN KEY (motionData) REFERENCES avatarMotionData (id),
    FOREIGN KEY (faceData) REFERENCES faceData (id),
    FOREIGN KEY (lightData) REFERENCES lightData (id),
    FOREIGN KEY (audioData) REFERENCES audioData (id),
    FOREIGN KEY (propData) REFERENCES props (id)
);

-- User Attendance Table
CREATE TABLE IF NOT EXISTS userAttendance (
    sessionId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (userId) REFERENCES users (id),
    PRIMARY KEY (sessionId, userId)
);

-- Insert Mock Data
INSERT INTO users (name, email, eosId) VALUES
    ('Alice', 'alice@example.com', 'EOS123'),
    ('Bob', 'bob@example.com', 'EOS456'),
    ('Charlie', 'charlie@example.com', 'EOS789');

INSERT INTO scenes (title, owner, pCloudFileId, fileUrl) VALUES
    ('Beach Scene', 1, 1001, 'https://example.com/chair.usd'),
    ('City Scene', 2, 1002, 'https://example.com/chair.usd'),
    ('Forest Scene', 3, 1003, 'https://example.com/chair.usd');

INSERT INTO performances (owner, title, description) VALUES
    (1, 'Othello', 'Shakespear wrote that'),
    (2, 'Interstellar', 'Interstellar description'),
    (3, 'Performance 3', 'Performance 3 description');

INSERT INTO scenesPerformances (sceneId, performanceId) VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (1, 3);

INSERT INTO avatars (name, userId) VALUES
    ('Avatar1', 1),
    ('Avatar2', 2),
    ('Avatar3', 3);

INSERT INTO performanceCast (avatarId, performanceId) VALUES
    (1, 1),
    (2, 2),
    (3, 3);

INSERT INTO props (name, pCloudFileId, fileUrl, position, rotation, scale) VALUES
    ('Chair', 2001, 'https://example.com/chair.usd', '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}', '{"x":1,"y":1,"z":1}');

INSERT INTO propMotionData (pCloudFileId, fileUrl, propId, initialPosition, initialRotation) VALUES
    (3001, 'https://example.com/prop_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}');

INSERT INTO avatarMotionData (pCloudFileId, fileUrl, avatarId, initialPosition, initialRotation) VALUES
    (4001, 'https://example.com/avatar_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}');

INSERT INTO faceData (pCloudFileId, fileUrl, avatarId) VALUES
    (5001, 'https://example.com/face.json', 1);

INSERT INTO audioData (pCloudFileId, fileUrl, avatarId) VALUES
    (6001, 'https://example.com/audio.wav', 1);

INSERT INTO lightData (pCloudFileId, fileUrl, lightId, position, lightType, lightCharacteristicsJson) VALUES
    (7001, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}');

INSERT INTO sessions (title, owner, performanceId, motionData, faceData, lightData, audioData, propData, streamingUrl) VALUES
    ('Morning Session', 1, 1, 1, 1, 1, 1, 1, 'https://streaming.example.com/session1'),
    ('Midday Session', 1, 1, 1, 1, 1, 1, 1, 'https://streaming.example.com/session1'),
    ('Night Session', 1, 1, 1, 1, 1, 1, 1, 'https://streaming.example.com/session1');
