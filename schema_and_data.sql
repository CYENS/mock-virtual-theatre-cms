-- Drop existing tables if they exist
DROP TABLE IF EXISTS userAttendance;
DROP TABLE IF EXISTS sessionStates;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS performanceCast;
DROP TABLE IF EXISTS avatars;
DROP TABLE IF EXISTS scenesPerformances;
DROP TABLE IF EXISTS xrLives;
DROP TABLE IF EXISTS performances;
DROP TABLE IF EXISTS usdScenes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS usdScene_Member;
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
    eosId TEXT UNIQUE DEFAULT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    userRole TEXT NOT NULL DEFAULT 'Read',
    isAdmin INTEGER NOT NULL DEFAULT 0,
    isSuperAdmin INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenes Table
CREATE TABLE IF NOT EXISTS usdScenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    owner INTEGER NOT NULL,
    template INTEGER DEFAULT 0,
    public INTEGER DEFAULT 0,
    FOREIGN KEY (owner) REFERENCES users (id)
);
    
-- usdScene_Member Table
CREATE TABLE IF NOT EXISTS usdScene_Member (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   sceneId INTEGER NOT NULL,
   userId INTEGER NOT NULL,
   FOREIGN KEY (sceneId) REFERENCES usdScenes (id) ON DELETE CASCADE,
   FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
   UNIQUE(sceneId, userId)
);

CREATE TABLE IF NOT EXISTS xrLives
(
    id INTEGER PRIMARY KEY AUTOINCREMENT
);
    
CREATE TABLE IF NOT EXISTS performances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    xrLiveId INTEGER default NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    owner INTEGER NOT NULL,
    FOREIGN KEY (xrLiveId) REFERENCES xrLives (id),
    FOREIGN KEY (owner) REFERENCES users (id)
);

-- Scenes-Performances Table
CREATE TABLE IF NOT EXISTS scenesPerformances (
    sceneId INTEGER NOT NULL,
    performanceId INTEGER NOT NULL,
    FOREIGN KEY (sceneId) REFERENCES usdScenes (id),
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
    sessionId INTEGER DEFAULT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    propId INTEGER NOT NULL,
    initialPosition TEXT NOT NULL,
    initialRotation TEXT NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (propId) REFERENCES props (id)
);

-- Avatar Motion Data Table
CREATE TABLE IF NOT EXISTS avatarMotionData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER DEFAULT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    avatarId INTEGER NOT NULL,
    initialPosition TEXT NOT NULL,
    initialRotation TEXT NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Face Data Table
CREATE TABLE IF NOT EXISTS faceData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER DEFAULT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    avatarId INTEGER NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Audio Data Table
CREATE TABLE IF NOT EXISTS audioData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER DEFAULT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    avatarId INTEGER NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Light Data Table
CREATE TABLE IF NOT EXISTS lightData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER DEFAULT NULL,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    lightId INTEGER NOT NULL,
    position TEXT NOT NULL,
    lightType TEXT NOT NULL,
    lightCharacteristicsJson TEXT NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id)
);

-- Session States
CREATE TABLE IF NOT EXISTS sessionStates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eosSessionId TEXT UNIQUE DEFAULT NULL,
    title TEXT NOT NULL DEFAULT '',
    owner INTEGER NOT NULL,
    stateId INTEGER NOT NULL,
    performanceId INTEGER NOT NULL,
    streamingUrl TEXT DEFAULT NULL,
    FOREIGN KEY (owner) REFERENCES users (id),
    FOREIGN KEY (stateId) REFERENCES sessionStates (id) ON DELETE CASCADE,
    FOREIGN KEY (performanceId) REFERENCES performances (id)
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
    ('Charlie', 'charlie@example.com', 'EOS789'),
    ('Tom', 'tom@example.com', 'EOS789Tom');

INSERT INTO usdScenes (title, owner, pCloudFileId, fileUrl) VALUES
    ('Beach Scene', 1, 1001, 'https://example.com/beach.usd'),
    ('City Scene', 2, 1002, 'https://example.com/city.usd'),
    ('Forest Scene', 3, 1003, 'https://example.com/forest.usd'),
    ('Mountain Scene', 4, 1004, 'https://example.com/mountain.usd');

INSERT INTO usdScene_Member (sceneId, userId)VALUES 
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 3),
    (3, 2),
    (3, 4);

INSERT INTO xrLives DEFAULT VALUES;
INSERT INTO xrLives DEFAULT VALUES;
INSERT INTO xrLives DEFAULT VALUES;

INSERT INTO performances (owner, title, description, xrLiveId) VALUES
    (1, 'Othello', 'Shakespear wrote that', 1),
    (2, 'Interstellar', 'Interstellar description', 2),
    (3, 'Performance 3', 'Performance 3 description', 3);

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

INSERT INTO propMotionData (sessionId, pCloudFileId, fileUrl, propId, initialPosition, initialRotation) VALUES
    (1, 3001, 'https://example.com/prop_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}'),
    (2, 3002, 'https://example.com/prop_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}'),
    (3, 3003, 'https://example.com/prop_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}'),
    (4, 3004, 'https://example.com/prop_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}');

INSERT INTO avatarMotionData (sessionId, pCloudFileId, fileUrl, avatarId, initialPosition, initialRotation) VALUES
    (1, 4001, 'https://example.com/avatar_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}'),
    (2, 4002, 'https://example.com/avatar_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}'),
    (3, 4003, 'https://example.com/avatar_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}'),
    (3, 4004, 'https://example.com/avatar_motion.bvh', 1, '{"x":0,"y":0,"z":0}', '{"x":0,"y":0,"z":0}');

INSERT INTO faceData (sessionId, pCloudFileId, fileUrl, avatarId) VALUES
    (1, 5001, 'https://example.com/face.json', 1),
    (2, 5002, 'https://example.com/face.json', 1),
    (3, 5003, 'https://example.com/face.json', 1),
    (3, 5004, 'https://example.com/face.json', 1);

INSERT INTO audioData (sessionId, pCloudFileId, fileUrl, avatarId) VALUES
    (1, 6001, 'https://example.com/audio.wav', 1),
    (2, 6002, 'https://example.com/audio.wav', 1),
    (3, 6003, 'https://example.com/audio.wav', 1),
    (3, 6004, 'https://example.com/audio.wav', 1);

INSERT INTO lightData (sessionId, pCloudFileId, fileUrl, lightId, position, lightType, lightCharacteristicsJson) VALUES
    (1, 7001, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}'),
    (2, 7002, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}'),
    (3, 7003, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}'),
    (3, 7004, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}');

INSERT INTO sessionStates (name) VALUES ('inactive'), ('active');

INSERT INTO sessions (title, stateId, owner, performanceId, streamingUrl) VALUES
    ('Morning Session', 1, 1, 1, 'https://streaming.example.com/session1'),
    ('Midday Session', 1, 1, 1, 'https://streaming.example.com/session1'),
    ('Night Session', 1, 1, 1, 'https://streaming.example.com/session1'),
    ('Active Session', 2, 1, 1, 'https://streaming.example.com/session1');
