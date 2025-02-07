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
    
    const runQuery = async (query, params) => {
        await new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(true);
            });
        });
    }
    
    async function getStateIdFromState(state) {
        const stateRow = await getSingleRow("SELECT id FROM sessionStates WHERE name = ?", [state]);
        return stateRow.id;
    }

    return {
        Query: {
            persons: async (parent) => {
                return getAllRows("SELECT * FROM people");
            },
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
            usdSceneById: async (_, { id }) => {
                return getSingleRow("SELECT * FROM usdScenes WHERE id = ?", [id]);
            },
            usdScene: async (_, { where }) => {
                const { id, pCloudFileId } = where
                const params = {$id: id, $pCloudFileId: pCloudFileId};
                // const params = [id, id, pCloudFileId];
                const query = `
                    SELECT * FROM usdScenes
                    WHERE
                        CASE
                            WHEN $id IS NOT NULL THEN id = $id
                            ELSE pCloudFileId = $pCloudFileId
                        END
                `;
                const retrievedRow = await getSingleRow(query, params)
                return retrievedRow;
            },
            
            usdAssetLibraries: async () => {
                return getAllRows("SELECT * FROM usdAssetLibrary")
            },
            
            sessionCasts: async () => {
                return getAllRows("SELECT * FROM sessionCasts")
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
            performance: async (_,  { where } ) => {
                const { id } = where;
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
            createPerformance: async (_, args) => {
                const {
                    ownerId,
                    title,
                    about = "" 
                } = args.data;

                return new Promise((resolve, reject) => {
                    const params = [
                        title,
                        about,
                        ownerId,
                    ];

                    const query = `
                        INSERT INTO performances (title, about, ownerId) VALUES (?, ?, ?)
                    `;

                    db.run(query, params, function (err) {
                        if (err) {
                            return reject(err);
                        }

                        // Retrieve the newly created session using the last inserted ID
                        db.get(
                            "SELECT * FROM performances WHERE id = ?",
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
            },
            deletePerformance: async (_, { where }) => {
                const { id } = where
                const params = [ id ];
                const query = `
                    DELETE FROM performances WHERE id = ? RETURNING *;
                `;
                const deletedRow = await getSingleRow(query, params)
                return deletedRow;
            },
            updatePerformance: async (_, { where, data }) => {
                const { id } = where
                const { title, about } = data

                const params = [ title, about, id ];
                const query = `
                    UPDATE performances SET title = ?, about = ? WHERE id = ? RETURNING *;
                `;
                const updatedRow = await getSingleRow(query, params)
                return updatedRow;
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
            },

            createSessionState: async (_, { name }) => {
                return new Promise((resolve, reject) => {
                    const query = `
                      INSERT INTO sessionStates (name)
                      VALUES (?);
                    `;
                    db.run(query, [name], function (err) {
                        if (err) {
                            return reject(err);
                        }
                        db.get(
                            "SELECT * FROM sessionStates WHERE id = ?",
                            [this.lastID],
                            (err, createdRow) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(createdRow);
                            }
                        );
                    });
                });
            },
            updateSessionState: async (_, { id, name }) => {
                return new Promise((resolve, reject) => {
                    const query = `
                      UPDATE sessionStates
                      SET name = ?
                      WHERE id = ?;
                    `;
                    db.run(query, [name, id], function (err) {
                        if (err) {
                            return reject(err);
                        }
                        db.get(
                            "SELECT * FROM sessionStates WHERE id = ?",
                            [id],
                            (err, updatedRow) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(updatedRow);
                            }
                        );
                    });
                });
            },
            deleteSessionState: async (_, { id }) => {
                return new Promise((resolve, reject) => {
                    const query = `
                      DELETE FROM sessionStates
                      WHERE id = ?;
                    `;
                    db.run(query, [id], function (err) {
                        if (err) {
                            return reject(err);
                        }
                        // If this.changes > 0, a row was actually deleted
                        resolve(this.changes > 0);
                    });
                });
            },

            createUsdScene: async (_, { data }) => {
                const {
                    pCloudFileId,
                    fileUrl,
                    title,
                    ownerId,
                    template,
                } = data;
                const isPublic = data.public;
                const params = [
                    pCloudFileId,
                    fileUrl,
                    title,
                    ownerId,
                    template,
                    isPublic,
                ];
                const query = `
                    INSERT INTO usdScenes (pCloudFileId, fileUrl, title, ownerId, template, public) 
                    VALUES (?, ?, ?, ?, ?, ?) RETURNING *;
                `;
                const insertedRow = await getSingleRow(query, params)
                return insertedRow;
            },
            deleteUsdScene: async (_, { where }) => {
                const { id, pCloudFileId } = where
                const params = {$id: id, $pCloudFileId: pCloudFileId};
                // const params = [id, id, pCloudFileId];
                const query = `
                    DELETE FROM usdScenes
                    WHERE
                        CASE
                            WHEN $id IS NOT NULL THEN id = $id
                            ELSE pCloudFileId = $pCloudFileId
                        END
                    RETURNING *;
                `;
                const deletedRow = await getSingleRow(query, params)
                return deletedRow;
            },
            updateUsdScene: async (_, { where, data }) => {
                const { pCloudFileId, fileUrl, title, ownerId, template, public: isPublic } = data;
                const params = {
                    $whereId: where.id, 
                    $wherePCloudFileId: where.pCloudFileId,
                    $pCloudFileId: pCloudFileId,
                    $fileUrl: fileUrl,
                    $title: title,
                    $ownerId: ownerId,
                    $template: template,
                    $public: isPublic,
                };

                const query = `
                    UPDATE usdScenes SET 
                        pCloudFileId = coalesce($pCloudFileId, pCloudFileId),
                        fileUrl = coalesce($fileUrl, fileUrl),
                        title = coalesce($title, title),
                        ownerId = coalesce($ownerId, ownerId),
                        template = coalesce($template, template),
                        public = coalesce($public, public)
                    WHERE
                        CASE
                            WHEN $whereId IS NOT NULL THEN id = $whereId
                            ELSE pCloudFileId = $wherePCloudFileId
                        END
                    RETURNING *;
                `;
                const updatedRow = await getSingleRow(query, params)
                return updatedRow;
            },
            removeUsdSceneFromPerformance: async (_, { where } ) => {
                const { usdSceneId, performanceId } = where;
                const existingRecord = await getSingleRow(
                    "SELECT * FROM scenesPerformances WHERE performanceId = ? AND sceneId = ?",
                    [performanceId, usdSceneId]
                );
                if (!existingRecord) {
                    throw new Error('Scene or Performance not found, or no existing relationship to remove.');
                }

                await runQuery(`
                  DELETE FROM scenesPerformances
                  WHERE performanceId = ?
                  AND sceneId = ?
                `, [performanceId, usdSceneId])

                const updatedPerformance = await getSingleRow(
                    "SELECT * FROM performances WHERE id = ?",
                    [performanceId]
                );
                return updatedPerformance;
            },
            addUsdSceneToPerformance: async (_, { where } ) => {
                const { usdSceneId, performanceId } = where;

                await runQuery(`
                    INSERT INTO scenesPerformances
                    (sceneId, performanceId)
                    VALUES (?, ?);
                `, [usdSceneId, performanceId])

                const updatedPerformance = await getSingleRow(
                    "SELECT * FROM performances WHERE id = ?",
                    [performanceId]
                );
                return updatedPerformance;
            }
        },

        // Field resolvers
        User: {
            person: async (parent) => {
                return getSingleRow("SELECT * FROM people WHERE id = ?", [parent.personId]);
            },
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
                return getAllRows("SELECT * FROM sessions WHERE ownerId = ?", [parent.id]);
            },
            sessionAttendance: async (parent) => {
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
                  JOIN performanceAvatars pa ON pa.avatarId = a.id
                  WHERE pa.performanceId = ?
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
        },
        
        SessionCast: {
            session: async (parent) => {
                return getSingleRow("SELECT * FROM sessions WHERE id = ?", [parent.sessionId]);
            },
            
            user: async (parent) => {   
                return getSingleRow("SELECT * FROM users WHERE id = ?", [parent.userId]);
            },
            
            avatar: async (parent) => {
                return getSingleRow("SELECT * FROM avatars WHERE id = ?", [parent.avatarId]);
            },
        },

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
                return getSingleRow("SELECT * FROM performances WHERE id = ?", [parent.performanceId]);
            },
            scene: async (parent) => {
                return getSingleRow("SELECT * FROM usdScenes WHERE id = ?", [parent.sceneId]);
            },
            xrLive: async (parent) => {
                return getSingleRow("SELECT * FROM xrLives WHERE id = ?", [parent.xrLiveId]);
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
            castAvatars : async (parent) => {
                const query = `
                  SELECT sc.*
                  FROM sessionCasts sc WHERE sessionId = ?
                `;
                return getAllRows(query, [parent.id]);
            },

        },
    };
}
