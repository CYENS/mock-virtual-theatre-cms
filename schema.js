import { gql } from 'graphql-tag';

export const typeDefs = gql`
  """
  Represents a user of the system.
  """
  type User {
    id: ID!
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
  type USDSceneObject {
    id: ID!
    pCloudFileId: Int
    fileUrl: String
    title: String
    owner: User
    members: [User]
    template: Boolean
    public: Boolean
    performances: [Performance]
  }

  type USDAssetLibrary {
    pCloudFileId: Int
    assetLibraryJson: String
  }

  type XR_Live {
    id: ID!
  }
  
  """
  A performance, which belongs to a user and can contain multiple usdScenes and avatars.
  """
  type Performance {
    id: ID!
    title: String
    about: String
    owner: User
    members: [User]
    usdScenes: [USDSceneObject]
    sessions: [Session]
    avatars: [Avatar]
    xrLive: XR_Live
  }

  """
  An avatar belongs to exactly one user and can appear in multiple performances.
  """
  type Avatar {
    id: ID!
    name: String
  }

  """
  A prop in the scene, with its own transform (position, rotation, scale).
  """
  type Prop {
    id: ID!
    session: Session
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
    id: ID!
    session: Session
    pCloudFileId: Int
    fileUrl: String
    initialPositionX: Float
    initialPositionY: Float
    initialPositionZ: Float
    initialRotationX: Float
    initialRotationY: Float
    initialRotationZ: Float
    prop: Prop
  }

  """
  Motion data for a particular avatar.
  """
  type AvatarMotionData {
    id: ID!
    session: Session
    pCloudFileId: Int
    fileUrl: String
    initialPositionX: Float
    initialPositionY: Float
    initialPositionZ: Float
    initialRotationX: Float
    initialRotationY: Float
    initialRotationZ: Float
    avatar: Avatar
  }

  """
  Face data for a particular avatar.
  """
  type FaceData {
    id: ID!
    session: Session
    pCloudFileId: Int
    fileUrl: String
    avatar: Avatar
  }

  """
  Audio data for a particular avatar.
  """
  type AudioData {
    id: ID!
    session: Session
    pCloudFileId: Int
    fileUrl: String
    avatar: Avatar
  }

  """
  Light data for a scene, containing position, type, and other light characteristics.
  """
  type LightData {
    id: ID!
    session: Session
    pCloudFileId: Int
    fileUrl: String
    lightId: Int
    initialPositionX: Float
    initialPositionY: Float
    initialPositionZ: Float
    initialRotationX: Float
    initialRotationY: Float
    initialRotationZ: Float
    lightType: String
    lightCharacteristicsJson: String
  }
  
  
  """
  A Session is a live/recorded session that references a user (owner),
  a performance, and various data IDs for motion, face, light, audio, and props.
  """
  type Session {
    id: ID!
    eosSessionId: String
    title: String
    state: String
    owner: User
    performance: Performance
    motionData: [AvatarMotionData]
    faceData: [FaceData]
    lightData: [LightData]
    audioData: [AudioData]
    propData: [Prop]
    streamingUrl: String
    attendees: [User]
  }
  
  type SessionState {
    id: ID!
    name: String
  }

  type Query {
    # Users
    users: [User]
    userById(id: ID): User

    # Scenes
    usdScenes: [USDSceneObject]
    sceneById(id: ID): USDSceneObject

    xrLives: [XR_Live]
    
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
    sessionByState(state: String): [Session]
  }
  
  type Mutation {
    createSession(
      title: String!
      ownerId: ID!
      performanceId: ID!
      state: String!
      eosSessionId: String = ""
      motionDataId: ID
      faceDataId: ID
      lightDataId: ID
      audioDataId: ID
      propDataId: ID
      streamingUrl: String
    ): Session
  }
`;
