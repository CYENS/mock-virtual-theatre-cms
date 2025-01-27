﻿-- Drop existing tables if they exist
DROP TABLE IF EXISTS userAttendance;
DROP TABLE IF EXISTS sessionStates;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS avatars;
DROP TABLE IF EXISTS scenesPerformances;
DROP TABLE IF EXISTS xrLives;
DROP TABLE IF EXISTS performances;
DROP TABLE IF EXISTS performanceAvatars;
DROP TABLE IF EXISTS performanceMembership;
DROP TABLE IF EXISTS usdScenes;
DROP TABLE IF EXISTS usdSceneMembership;
DROP TABLE IF EXISTS usdAssetLibrary;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS usdScene_Member;
DROP TABLE IF EXISTS propMotionData;
DROP TABLE IF EXISTS avatarMotionData;
DROP TABLE IF EXISTS faceData;
DROP TABLE IF EXISTS audioData;
DROP TABLE IF EXISTS lightData;

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

CREATE TABLE IF NOT EXISTS usdAssetLibrary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    assetLibraryJson TEXT DEFAULT '{}'
);

-- Scenes Table
CREATE TABLE IF NOT EXISTS usdScenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    title TEXT NOT NULL,
    ownerId INTEGER NOT NULL,
    template INTEGER DEFAULT 0,
    public INTEGER DEFAULT 0,
    FOREIGN KEY (ownerId) REFERENCES users (id)
);

CREATE TABLE usdSceneMembership (
    userId INTEGER NOT NULL,
    usdSceneId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (usdSceneId) REFERENCES usdScenes (id)
);
    
CREATE TABLE IF NOT EXISTS xrLives
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    streamingUrl TEXT DEFAULT NULL
);
    
CREATE TABLE IF NOT EXISTS performances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    about TEXT NOT NULL,
    ownerId INTEGER NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS performanceMembership (
    userId INTEGER NOT NULL,
    performanceId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES usdScenes (id),
    FOREIGN KEY (performanceId) REFERENCES performances (id),
    PRIMARY KEY (userId, performanceId)
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

-- Represents the avatars that the performance will have
CREATE TABLE IF NOT EXISTS performanceAvatars (
    performanceId INTEGER NOT NULL,
    avatarId INTEGER NOT NULL,
    FOREIGN KEY (performanceId) REFERENCES performances (id),
    FOREIGN KEY (avatarId) REFERENCES avatars (id),
    PRIMARY KEY (performanceId, avatarId)
);

-- Prop Motion Data Table
CREATE TABLE IF NOT EXISTS propMotionData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    sessionId INTEGER DEFAULT NULL,
    propId INTEGER NOT NULL,
    initialPosition TEXT NOT NULL,
    initialRotation TEXT NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id)
);

-- Avatar Motion Data Table
CREATE TABLE IF NOT EXISTS avatarMotionData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    sessionId INTEGER DEFAULT NULL,
    avatarId INTEGER NOT NULL,
    initialPosition TEXT NOT NULL,
    initialRotation TEXT NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Face Data Table
CREATE TABLE IF NOT EXISTS faceData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    sessionId INTEGER DEFAULT NULL,
    avatarId INTEGER NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Audio Data Table
CREATE TABLE IF NOT EXISTS audioData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    sessionId INTEGER DEFAULT NULL,
    avatarId INTEGER NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    FOREIGN KEY (avatarId) REFERENCES avatars (id)
);

-- Light Data Table
CREATE TABLE IF NOT EXISTS lightData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pCloudFileId INTEGER NOT NULL,
    fileUrl TEXT NOT NULL,
    sessionId INTEGER DEFAULT NULL,
    lightId INTEGER NOT NULL,
    position TEXT NOT NULL,
    initialPosition TEXT NOT NULL,
    initialRotation TEXT NOT NULL,
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
    xrLiveId INTEGER DEFAULT NULL,
    title TEXT NOT NULL DEFAULT '',
    ownerId INTEGER NOT NULL,
    sessionStateId INTEGER NOT NULL,
    performanceId INTEGER NOT NULL,
    streamingUrl TEXT DEFAULT NULL,
    FOREIGN KEY (ownerId) REFERENCES users (id),
    FOREIGN KEY (sessionStateId) REFERENCES sessionStates (id) ON DELETE CASCADE,
    FOREIGN KEY (performanceId) REFERENCES performances (id),
    FOREIGN KEY (xrLiveId) REFERENCES xrLives (id)
);

-- User Attendance Table
CREATE TABLE IF NOT EXISTS userAttendance (
    userId INTEGER NOT NULL,
    sessionId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (sessionId) REFERENCES sessions (id),
    PRIMARY KEY (userId, sessionId)
);

-- Insert Mock Data
INSERT INTO users (name, email, eosId) VALUES
    ('Alice', 'alice@example.com', 'EOS123'),
    ('Bob', 'bob@example.com', 'EOS456'),
    ('Charlie', 'charlie@example.com', 'EOS789'),
    ('Tom', 'tom@example.com', 'EOS789Tom');

INSERT INTO userAttendance (userId, sessionId) VALUES
    (1, 1),
    (2, 1),
    (3, 1),
    (1, 2),
    (2, 2),
    (1, 3);

INSERT INTO usdScenes (title, ownerId, pCloudFileId, fileUrl)VALUES
    ('Beach Scene', 1, 1001, 'https://example.com/beach.usd'),
    ('City Scene', 2, 1002, 'https://example.com/city.usd'),
    ('Forest Scene', 3, 1003, 'https://example.com/forest.usd'),
    ('Mountain Scene', 4, 1004, 'https://example.com/mountain.usd'),
    ('Volcano Scene', 3, 1004, 'https://example.com/volcano.usd');

INSERT INTO usdSceneMembership (userId, usdSceneId) VALUES 
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 3),
    (3, 2),
    (3, 4);

INSERT INTO usdAssetLibrary (pCloudFileId, fileUrl) VALUES
    (1, 'https://example.com/asset1.usd'),
    (2, 'https://example.com/asset2.usd');
                                                        
INSERT INTO xrLives (streamingUrl) VALUES 
    ('https://example.com/watch/stream/1'),
    ('https://example.com/watch/stream/2'),
    ('https://example.com/watch/stream/3');

INSERT INTO performances (ownerId, title, about) VALUES
    (1, 'Othello', 'Shakespear wrote that'),
    (2, 'Interstellar', 'Interstellar description'),
    (3, 'Performance 3', 'Performance 3 description'),
    (4, 'No Membership Performance', 'No Membership Performance 3 description');

INSERT INTO performanceAvatars (performanceId, avatarId) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 1),
    (2, 2);

INSERT INTO performanceMembership (userId, performanceId)  VALUES
    (1, 1),
    (2, 1),
    (3, 1),
    (1, 2),
    (2, 2),
    (2, 3);

INSERT INTO scenesPerformances (sceneId, performanceId) VALUES
    (1, 1),
    (2, 1),
    (3, 1),
    (2, 2),
    (3, 3),
    (1, 3);

INSERT INTO avatars (name, userId) VALUES
    ('Avatar1', 1),
    ('Avatar2', 2),
    ('Avatar3', 3);

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

INSERT INTO lightData (sessionId, pCloudFileId, fileUrl, lightId, position, lightType, lightCharacteristicsJson, initialPosition, initialRotation) VALUES
    (1, 7001, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}', '',''),
    (2, 7002, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}', '', ''),
    (3, 7003, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}', '', ''),
    (3, 7004, 'https://example.com/light.json', 1, '{"x":0,"y":10,"z":0}', 'Spotlight', '{"intensity":100,"color":"#ffffff"}', '', '');

INSERT INTO sessionStates (name) VALUES ('inactive'), ('active');

INSERT INTO sessions (title, sessionStateId, ownerId, performanceId, streamingUrl, xrLiveId)VALUES
    ('Morning Session', 1, 1, 1, 'https://streaming.example.com/session1', 1),
    ('Midday Session', 1, 1, 1, 'https://streaming.example.com/session1', 1),
    ('Night Session', 1, 2, 1, 'https://streaming.example.com/session1', 2),
    ('Active Session', 2, 3, 1, 'https://streaming.example.com/session1', 2);
