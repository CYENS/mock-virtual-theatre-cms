import { gql } from 'graphql-tag';

export const typeDefs = gql`
  """
  Represents a user of the system.
  """
  type User {
    id: ID
    name: String
    email: String
    eosId: String
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
    pCloudFileId: Int
    fileUrl: String
    title: String
    owner: User
    members: [User]
    template: Boolean
    public: Boolean
    performances: [Performance]
  }

  """
  A performance, which belongs to a user and can contain multiple scenes and avatars.
  """
  type Performance {
    id: ID
    title: String
    description: String
    owner: User
    scenes: [Scene]
    sessions: [Session]
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
    pCloudFileId: Int
    fileUrl: String
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
    pCloudFileId: Int
    fileUrl: String
    initialPosition: String
    initialRotation: String
    prop: Prop
  }

  """
  Motion data for a particular avatar.
  """
  type AvatarMotionData {
    id: ID
    pCloudFileId: Int
    fileUrl: String
    initialPosition: String
    initialRotation: String
    avatar: Avatar
  }

  """
  Face data for a particular avatar.
  """
  type FaceData {
    id: ID
    pCloudFileId: Int
    fileUrl: String
    avatar: Avatar
  }

  """
  Audio data for a particular avatar.
  """
  type AudioData {
    id: ID
    pCloudFileId: Int
    fileUrl: String
    avatar: Avatar
  }

  """
  Light data for a scene, containing position, type, and other light characteristics.
  """
  type LightData {
    id: ID
    pCloudFileId: Int
    fileUrl: String
    lightId: Int
    position: String
    lightType: String
    lightCharacteristicsJson: String
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
    motionData: AvatarMotionData
    faceData: FaceData
    lightData: LightData
    audioData: AudioData
    propData: Prop
    streamingUrl: String
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
