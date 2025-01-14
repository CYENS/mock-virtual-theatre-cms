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
                return getAllRows('SELECT * FROM users');
            },
            userById: async (_, { id }) => {
                return getSingleRow('SELECT * FROM users WHERE id = ?', [id]);
            },

            // Scenes
            scenes: async () => {
                return getAllRows('SELECT * FROM scenes');
            },
            sceneById: async (_, { id }) => {
                return getSingleRow('SELECT * FROM scenes WHERE id = ?', [id]);
            },

            // Performances
            performances: async () => {
                return getAllRows('SELECT * FROM performances');
            },
            performanceById: async (_, { id }) => {
                return getSingleRow('SELECT * FROM performances WHERE id = ?', [id]);
            },

            // Avatars
            avatars: async () => {
                return getAllRows('SELECT * FROM avatars');
            },
            avatarById: async (_, { id }) => {
                return getSingleRow('SELECT * FROM avatars WHERE id = ?', [id]);
            },

            // Props
            props: async () => {
                return getAllRows('SELECT * FROM props');
            },
            propById: async (_, { id }) => {
                return getSingleRow('SELECT * FROM props WHERE id = ?', [id]);
            },

            // Sessions
            sessions: async () => {
                return getAllRows('SELECT * FROM sessions');
            },
            sessionById: async (_, { id }) => {
                return getSingleRow('SELECT * FROM sessions WHERE id = ?', [id]);
            },
        },

        // Field resolvers
        User: {
            performances: async (parent) => {
                return getAllRows('SELECT * FROM performances WHERE owner = ?', [parent.id]);
            },
            avatars: async (parent) => {
                return getAllRows('SELECT * FROM avatars WHERE user_id = ?', [parent.id]);
            },
            sessionsOwned: async (parent) => {
                return getAllRows('SELECT * FROM sessions WHERE owner = ?', [parent.id]);
            },
            sessionsAttending: async (parent) => {
                const query = `
          SELECT s.*
          FROM sessions s
          JOIN user_attendance ua ON ua.session_id = s.id
          WHERE ua.user_id = ?
        `;
                return getAllRows(query, [parent.id]);
            },
        },

        Scene: {
            owner: async (parent) => {
                return getSingleRow("SELECT * FROM users WHERE id = ?", [parent.owner]);
            },
            performances: async (parent) => {
                const query = `
          SELECT p.*
          FROM performances p
          JOIN scenes_performances sp ON sp.performance_id = p.id
          WHERE sp.scene_id = ?
        `;
                return getAllRows(query, [parent.id]);
            },
        },

        Performance: {
            owner: async (parent) => {
                return getSingleRow('SELECT * FROM users WHERE id = ?', [parent.owner]);
            },
            scenes: async (parent) => {
                const query = `
          SELECT s.*
          FROM scenes s
          JOIN scenes_performances sp ON sp.scene_id = s.id
          WHERE sp.performance_id = ?
        `;
                return getAllRows(query, [parent.id]);
            },
            avatars: async (parent) => {
                const query = `
          SELECT a.*
          FROM avatars a
          JOIN performance_cast pc ON pc.avatar_id = a.id
          WHERE pc.performance_id = ?
        `;
                return getAllRows(query, [parent.id]);
            },
            sessions: async (parent) => {
                const query = `
                    SELECT s.*
                    FROM sessions s
                    WHERE s.performance_id = ?
                `;
                return getAllRows(query, [parent.id]);
            },
        },

        Avatar: {
            user: async (parent) => {
                return getSingleRow('SELECT * FROM users WHERE id = ?', [parent.user_id]);
            },
            performances: async (parent) => {
                const query = `
          SELECT p.*
          FROM performances p
          JOIN performance_cast pc ON pc.performance_id = p.id
          WHERE pc.avatar_id = ?
        `;
                return getAllRows(query, [parent.id]);
            },
            avatarMotionData: async (parent) => {
                return getAllRows('SELECT * FROM avatar_motion_data WHERE avatar_id = ?', [parent.id]);
            },
            faceData: async (parent) => {
                return getAllRows('SELECT * FROM face_data WHERE avatar_id = ?', [parent.id]);
            },
            audioData: async (parent) => {
                return getAllRows('SELECT * FROM audio_data WHERE avatar_id = ?', [parent.id]);
            },
        },

        Prop: {
            propMotionData: async (parent) => {
                return getAllRows('SELECT * FROM prop_motion_data WHERE prop_id = ?', [parent.id]);
            },
        },

        PropMotionData: {
            prop: async (parent) => {
                return getSingleRow('SELECT * FROM props WHERE id = ?', [parent.prop_id]);
            },
        },

        AvatarMotionData: {
            avatar: async (parent) => {
                return getSingleRow('SELECT * FROM avatars WHERE id = ?', [parent.avatar_id]);
            },
        },

        FaceData: {
            avatar: async (parent) => {
                return getSingleRow('SELECT * FROM avatars WHERE id = ?', [parent.avatar_id]);
            },
        },

        AudioData: {
            avatar: async (parent) => {
                return getSingleRow('SELECT * FROM avatars WHERE id = ?', [parent.avatar_id]);
            },
        },

        Session: {
            owner: async (parent) => {
                return getSingleRow('SELECT * FROM users WHERE id = ?', [parent.owner]);
            },
            performance: async (parent) => {
                return getSingleRow('SELECT * FROM performances WHERE id = ?', [parent.performance_id]);
            },
            motion_data: async (parent) => {
                return getSingleRow('SELECT * FROM avatar_motion_data WHERE id = ?', [
                    parent.motion_data,
                ]);
            },
            face_data: async (parent) => {
                return getSingleRow('SELECT * FROM face_data WHERE id = ?', [parent.face_data]);
            },
            light_data: async (parent) => {
                return getSingleRow('SELECT * FROM light_data WHERE id = ?', [parent.light_data]);
            },
            audio_data: async (parent) => {
                return getSingleRow('SELECT * FROM audio_data WHERE id = ?', [parent.audio_data]);
            },
            prop_data: async (parent) => {
                return getSingleRow('SELECT * FROM props WHERE id = ?', [parent.prop_data]);
            },
            attendees: async (parent) => {
                const query = `
          SELECT u.*
          FROM users u
          JOIN user_attendance ua ON ua.user_id = u.id
          WHERE ua.session_id = ?
        `;
                return getAllRows(query, [parent.id]);
            },
        },
    };
}
