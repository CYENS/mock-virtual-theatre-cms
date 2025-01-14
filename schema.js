import { gql } from 'graphql-tag';

export const typeDefs = gql`
  """
  Represents a user of the system.
  """
  type User {
    id: ID
    name: String
    email: String
    eos_id: String
    performances: [Performance]
    avatars: [Avatar]
    sessionsOwned: [Session]
    sessionsAttending: [Session]
  }

  """
  A scene that can be linked to one or multiple performances.
  """
  type Scene {
    id: ID
    name: String
    pcloud_file_id: Int
    performances: [Performance]
  }

  """
  A performance, which belongs to a user and can contain multiple scenes and avatars.
  """
  type Performance {
    id: ID
    title: String
    owner: User
    about: String
    scenes: [Scene]
    avatars: [Avatar]
  }

  """
  An avatar belongs to exactly one user and can appear in multiple performances.
  """
  type Avatar {
    id: ID
    name: String
    user: User
    performances: [Performance]
    avatarMotionData: [AvatarMotionData]
    faceData: [FaceData]
    audioData: [AudioData]
  }

  """
  A prop in the scene, with its own transform (position, rotation, scale).
  """
  type Prop {
    id: ID
    name: String
    pcloud_file_id: Int
    file_url: String
    position: String
    rotation: String
    scale: String
    propMotionData: [PropMotionData]
  }

  """
  Motion data for a particular prop.
  """
  type PropMotionData {
    id: ID
    pcloud_file_id: Int
    file_url: String
    initial_position: String
    initial_rotation: String
    prop: Prop
  }

  """
  Motion data for a particular avatar.
  """
  type AvatarMotionData {
    id: ID
    pcloud_file_id: Int
    file_url: String
    initial_position: String
    initial_rotation: String
    avatar: Avatar
  }

  """
  Face data for a particular avatar.
  """
  type FaceData {
    id: ID
    pcloud_file_id: Int
    file_url: String
    avatar: Avatar
  }

  """
  Audio data for a particular avatar.
  """
  type AudioData {
    id: ID
    pcloud_file_id: Int
    file_url: String
    avatar: Avatar
  }

  """
  Light data for a scene, containing position, type, and other light characteristics.
  """
  type LightData {
    id: ID
    pcloud_file_id: Int
    file_url: String
    light_id: Int
    position: String
    light_type: String
    light_characteristics_json: String
  }

  """
  A Session is a live/recorded session that references a user (owner),
  a performance, and various data IDs for motion, face, light, audio, and props.
  """
  type Session {
    id: ID
    title: String
    owner: User
    performance: Performance
    motion_data: AvatarMotionData
    face_data: FaceData
    light_data: LightData
    audio_data: AudioData
    prop_data: Prop
    streaming_url: String
    attendees: [User]
  }

  type Query {
    # Users
    users: [User]
    userById(id: ID): User

    # Scenes
    scenes: [Scene]
    sceneById(id: ID): Scene

    # Performances
    performances: [Performance]
    performanceById(id: ID): Performance

    # Avatars
    avatars: [Avatar]
    avatarById(id: ID): Avatar

    # Props
    props: [Prop]
    propById(id: ID): Prop

    # Sessions
    sessions: [Session]
    sessionById(id: ID): Session
  }
`;
