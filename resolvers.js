async function getStateIdFromState(getSingleRow, state) {
    const stateRow = await getSingleRow("SELECT id FROM sessionStates WHERE name = ?", [state]);
    return stateRow.id;
}

export function createResolvers(db) {
    // Helper to get multiple rows
    const getAllRows = (query, params = []) =>
        new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

    // Helper to get a single row
    const getSingleRow = (query, params = []) =>
        new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

    return {
        Query: {
            // Users
            users: async () => {
                return getAllRows("SELECT * FROM users");
            },
            userById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [id]);
            },

            // Scenes
            scenes: async () => {
                return getAllRows("SELECT * FROM scenes");
            },
            sceneById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM scenes WHERE id = ?", [id]);
            },

            // Performances
            performances: async () => {
                return getAllRows("SELECT * FROM performances");
            },
            performanceById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM performances WHERE id = ?", [id]);
            },

            // Avatars
            avatars: async () => {
                return getAllRows("SELECT * FROM avatars");
            },
            avatarById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [id]);
            },

            // Props
            props: async () => {
                return getAllRows("SELECT * FROM props");
            },
            propById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM props WHERE id = ?", [id]);
            },

            // Sessions
            sessions: async () => {
                return getAllRows("SELECT * FROM sessions");
            },
            sessionById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [id]);
            },
        },
        
        Mutation: {
            createSession: async (_, args, { dataSources }) => {
                // Insert the new session into the database
                const {
                    title,
                    ownerId,
                    performanceId,
                    state = "inactive",
                    motionDataId = null,
                    faceDataId = null,
                    lightDataId = null,
                    audioDataId = null,
                    propDataId = null,
                    streamingUrl = null,
                } = args;

                const stateId = await getStateIdFromState(getSingleRow, state);
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT INTO sessions 
                        (title, owner, stateId, performanceId, motionData, faceData, lightData, audioData, propData, streamingUrl) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    const params = [
                        title,
                        ownerId,
                        stateId,
                        performanceId,
                        motionDataId,
                        faceDataId,
                        lightDataId,
                        audioDataId,
                        propDataId,
                        streamingUrl,
                    ];

                    db.run(query, params, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        // Retrieve the newly created session using the last inserted ID
                        db.get(
                            "SELECT * FROM sessions WHERE id = ?",
                            [this.lastID],
                            (err, newSession) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(newSession);
                            }
                        );
                    });
                });
            },
        },

        // Field resolvers
        User: {
            performances: async (parent) => {
                return getAllRows("SELECT * FROM performances WHERE owner = ?", [
                    parent.id,
                ]);
            },
            avatars: async (parent) => {
                return getAllRows("SELECT * FROM avatars WHERE userId = ?", [
                    parent.id,
                ]);
            },
            sessionsOwned: async (parent) => {
                return getAllRows("SELECT * FROM sessions WHERE owner = ?", [
                    parent.id,
                ]);
            },
            sessionsAttending: async (parent) => {
                const query = `
          SELECT s.*
          FROM sessions s
          JOIN userAttendance ua ON ua.sessionId = s.id
          WHERE ua.userId = ?
        `;
                return getAllRows(query, [parent.id]);
            },
        },

        Scene: {
            owner: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [
                    parent.owner,
                ]);
            },
            performances: async (parent) => {
                const query = `
          SELECT p.*
          FROM performances p
          JOIN scenesPerformances sp ON sp.performanceId = p.id
          WHERE sp.sceneId = ?
        `;
                return getAllRows(query, [parent.id]);
            },
        },

        Performance: {
            owner: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [
                    parent.owner,
                ]);
            },
            scenes: async (parent) => {
                const query = `
          SELECT s.*
          FROM scenes s
          JOIN scenesPerformances sp ON sp.sceneId = s.id
          WHERE sp.performanceId = ?
        `;
                return getAllRows(query, [parent.id]);
            },
            avatars: async (parent) => {
                const query = `
          SELECT a.*
          FROM avatars a
          JOIN performanceCast pc ON pc.avatarId = a.id
          WHERE pc.performanceId = ?
        `;
                return getAllRows(query, [parent.id]);
            },
            sessions: async (parent) => {
                const query = `
                    SELECT s.*
                    FROM sessions s
                    WHERE s.performanceId = ?
                `;
                return getAllRows(query, [parent.id]);
            },
        },

        Avatar: {
            user: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [
                    parent.userId,
                ]);
            },
            performances: async (parent) => {
                const query = `
          SELECT p.*
          FROM performances p
          JOIN performanceCast pc ON pc.performanceId = p.id
          WHERE pc.avatarId = ?
        `;
                return getAllRows(query, [parent.id]);
            },
            avatarMotionData: async (parent) => {
                return getAllRows(
                    "SELECT * FROM avatarMotionData WHERE avatarId = ?",
                    [parent.id]
                );
            },
            faceData: async (parent) => {
                return getAllRows("SELECT * FROM faceData WHERE avatarId = ?", [
                    parent.id,
                ]);
            },
            audioData: async (parent) => {
                return getAllRows("SELECT * FROM audioData WHERE avatarId = ?", [
                    parent.id,
                ]);
            },
        },

        Prop: {
            propMotionData: async (parent) => {
                return getAllRows("SELECT * FROM propMotionData WHERE propId = ?", [
                    parent.id,
                ]);
            },
        },

        PropMotionData: {
            prop: async (parent) => {
                return getSingleRow("SELECT * FROM props WHERE id = ?", [
                    parent.propId,
                ]);
            },
        },

        AvatarMotionData: {
            avatar: async (parent) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [
                    parent.avatarId,
                ]);
            },
        },

        FaceData: {
            avatar: async (parent) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [
                    parent.avatarId,
                ]);
            },
        },

        AudioData: {
            avatar: async (parent) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [
                    parent.avatarId,
                ]);
            },
        },

        Session: {
            owner: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [
                    parent.owner,
                ]);
            },
            state: async (parent) => {
                const row = await  getSingleRow("SELECT * FROM sessionStates WHERE id = ?", [parent.stateId])
                return row.name;
            },
            performance: async (parent) => {
                return getSingleRow("SELECT * FROM performances WHERE id = ?", [
                    parent.performanceId,
                ]);
            },
            motionData: async (parent) => {
                return getSingleRow("SELECT * FROM avatarMotionData WHERE id = ?", [
                    parent.motionData,
                ]);
            },
            faceData: async (parent) => {
                return getSingleRow("SELECT * FROM faceData WHERE id = ?", [
                    parent.faceData,
                ]);
            },
            lightData: async (parent) => {
                return getSingleRow("SELECT * FROM lightData WHERE id = ?", [
                    parent.lightData,
                ]);
            },
            audioData: async (parent) => {
                return getSingleRow("SELECT * FROM audioData WHERE id = ?", [
                    parent.audioData,
                ]);
            },
            propData: async (parent) => {
                return getSingleRow("SELECT * FROM props WHERE id = ?", [
                    parent.propData,
                ]);
            },
            attendees: async (parent) => {
                const query = `
          SELECT u.*
          FROM users u
          JOIN userAttendance ua ON ua.userId = u.id
          WHERE ua.sessionId = ?
        `;
                return getAllRows(query, [parent.id]);
            },
        },
    };
}
