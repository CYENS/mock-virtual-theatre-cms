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
    
    async function getStateIdFromState(state) {
        const stateRow = await getSingleRow("SELECT id FROM sessionStates WHERE name = ?", [state]);
        return stateRow.id;
    }

    return {
        Query: {
            // Users
            users: async () => {
                return getAllRows("SELECT * FROM users");
            },
            userById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [id]);
            },
            user: async (_, { id = null, eosId = null, email = null }) => {
                const query = `
                  SELECT *
                  FROM users
                  WHERE ($idValue IS NULL OR id = $idValue)
                    AND ($eosIdValue IS NULL OR eosId = $eosIdValue)
                    AND ($emailValue IS NULL OR email = $emailValue)
                `;

                // Note: The keys ($idValue, $eosIdValue, $emailValue) must match the placeholders in the query.
                const params = {
                    $idValue: id,
                    $eosIdValue: eosId,
                    $emailValue: email,
                };
                return getSingleRow(query, params);
            },
            
            userAttendances: async () => {
                return getAllRows("SELECT * FROM userAttendance");
            },

            // Scenes
            usdScenes: async () => {
                return getAllRows("SELECT * FROM usdScenes");
            },
            sceneById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM usdScenes WHERE id = ?", [id]);
            },
            
            usdAssetLibraries: async () => {
                return getAllRows("SELECT * FROM usdAssetLibrary")
            },
            
            xrLives: async () => {
                return getAllRows("SELECT * FROM xrLives")
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


            // Sessions
            sessions: async () => {
                return getAllRows("SELECT * FROM sessions");
            },
            sessionById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [id]);
            },
            sessionByState: async (_, { state } ) => {
                const stateId = await getStateIdFromState(state);
                return getAllRows("SELECT * FROM sessions WHERE sessionStateId = ?", [stateId]);
            },

            avatarMotionData: async () => {
                return getAllRows("SELECT * FROM avatarMotionData");
            },
            faceData: async () => {
                return getAllRows("SELECT * FROM faceData");
            },
            lightData: async () => {
                return getAllRows("SELECT * FROM lightData");
            },
            audioData: async () => {
                return getAllRows("SELECT * FROM audioData");
            },
            propMotionData: async () => {
                return getAllRows("SELECT * FROM propMotionData");
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
                    eosSessionId = null,
                    streamingUrl = null,
                } = args;

                const stateId = await getStateIdFromState(state);
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT INTO sessions 
                        (eosSessionId, title, ownerId, sessionStateId, performanceId, streamingUrl) 
                        VALUES (?, ?, ?, ?, ?, ?);
                    `;
                    const params = [
                        eosSessionId,
                        title,
                        ownerId,
                        stateId,
                        performanceId,
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
            createUser: async (_, args, { dataSources }) => {
                const {
                    eosId = "",
                    name,
                    email,
                    password,
                    userRole,
                    isAdmin = false,
                    isSuperAdmin = false,
                    createdAt
                } = args.data;
                
                return new Promise((resolve, reject) => {
                    const params = [
                        eosId,
                        name,
                        email,
                        userRole,
                        isAdmin,
                        isSuperAdmin,
                    ];
                    
                    const query = `
                        INSERT INTO users (eosId, name, email, userRole, isAdmin, isSuperAdmin) VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    
                    db.run(query, params, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        
                        // Retrieve the newly created session using the last inserted ID
                        db.get(
                            "SELECT * FROM users WHERE id = ?",
                            [this.lastID],
                            (err, newSession) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(newSession);
                            }
                        );
                    })
                    
                });
            }
        },

        // Field resolvers
        User: {
            performances: async (parent) => {
                return getAllRows("SELECT * FROM performances WHERE ownerId = ?", [
                    parent.id,
                ]);
            },
            avatars: async (parent) => {
                return getAllRows("SELECT * FROM avatars WHERE userId = ?", [
                    parent.id,
                ]);
            },
            sessionsOwned: async (parent) => {
                return getAllRows("SELECT * FROM sessions WHERE ownerId = ?", [
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
        
        UserAttendance: {
            user: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [parent.userId])
                
            },
            session: async (parent) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [parent.sessionId])
            }
        },

        USDScene: {
            owner: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [
                    parent.ownerId,
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
            members: async (parent) => {
                const query = `
                    SELECT u.*
                    FROM users u
                    JOIN usdSceneMembership usm ON usm.userId = u.id
                    WHERE usm.usdSceneId = ?
                `;
                return getAllRows(query, [parent.id]);
            },
        },

        Performance: {
            owner: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [
                    parent.ownerId,
                ]);
            },
            members: async (parent) => {
                const query = `
                    SELECT u.*
                    FROM users u
                    JOIN performanceMembership usm ON usm.userId = u.id
                    WHERE usm.performanceId = ?
                `;
                return getAllRows(query, [parent.id]);
            },
            usdScenes: async (parent) => {
                const query = `
                  SELECT s.*
                  FROM usdScenes s
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
        //     user: async (parent) => {
        //         return getSingleRow("SELECT * FROM users WHERE id = ?", [
        //             parent.userId,
        //         ]);
        //     },
        //     performances: async (parent) => {
        //         const query = `
        //   SELECT p.*
        //   FROM performances p
        //   JOIN performanceCast pc ON pc.performanceId = p.id
        //   WHERE pc.avatarId = ?
        // `;
        //         return getAllRows(query, [parent.id]);
        //     },
        //     avatarMotionData: async (parent) => {
        //         return getAllRows(
        //             "SELECT * FROM avatarMotionData WHERE avatarId = ?",
        //             [parent.id]
        //         );
        //     },
        //     faceData: async (parent) => {
        //         return getAllRows("SELECT * FROM faceData WHERE avatarId = ?", [
        //             parent.id,
        //         ]);
        //     },
        //     audioData: async (parent) => {
        //         return getAllRows("SELECT * FROM audioData WHERE avatarId = ?", [
        //             parent.id,
        //         ]);
        //     },
        },

        // lightData: [LightData]
        // audioData: [AudioData]
        // propMotionData: [PropMotionData]

        AvatarMotionData: {
            avatar: async (parent) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [parent.avatarId]);
            },
            session: async (parent) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [parent.sessionId]);
            }
        },

        FaceData: {
            avatar: async (parent) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [parent.avatarId,]);
            },
            session: async (parent) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [parent.sessionId]);
            }
        },

        AudioData: {
            avatar: async (parent) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [parent.avatarId,]);
            },
            session: async (parent) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [parent.sessionId]);
            }
        },
        
        LightData: {
            session: async (parent) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [parent.sessionId]);
            },
        },
        
        PropMotionData: {
            session: async (parent) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [parent.sessionId]);
            },
        },

        Session: {
            owner: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [
                    parent.ownerId,
                ]);
            },
            state: async (parent) => {
                const row = await  getSingleRow("SELECT * FROM sessionStates WHERE id = ?", [parent.sessionStateId])
                return row.name;
            },
            performance: async (parent) => {
                return getSingleRow("SELECT * FROM performances WHERE id = ?", [
                    parent.performanceId,
                ]);
            },
            motionData: async (parent) => {
                return getAllRows("SELECT * FROM avatarMotionData WHERE sessionId = ?", [parent.id])
            },
            faceData: async (parent) => {
                return getAllRows("SELECT * FROM faceData WHERE sessionId = ?", [parent.id])
            },
            lightData: async (parent) => {
                return getAllRows("SELECT * FROM lightData WHERE sessionId = ?", [parent.id])
            },
            audioData: async (parent) => {
                return getAllRows("SELECT * FROM audioData WHERE sessionId = ?", [parent.id])
            },
            propMotionData: async (parent) => {
                return getAllRows("SELECT * FROM propMotionData WHERE sessionId = ?", [parent.id])
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
