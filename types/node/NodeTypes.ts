import { InputChannelID } from "../InputChannelTypes";
import { SendBusID } from "../SendBusTypes";
export enum WSSubscription {
    GENERAL = "general",
    DEFAULT_SESSION = "default-session-subscription",
}

export type MixerRouting = {
    ip: string;
    name: string;
    protocol: MixerProtocol;
    model: MixerModel;
    hiqnetadress?: number;
    port: number;
    uuid: string;
    autoConnect: boolean;
    connected?: boolean;
    localSimulation?: boolean;
};

export type SessionData = {
    uuid: string;
    name: string;
    inputChannelBanks: Array<Array<InputChannelID | null>>;
    selectedChannel: InputChannelID | SendBusID;
    activeInputChannelBank: number;
};

export enum NodeMessageType {
    MixerConnectionsUpdate = "MixerConnectionsUpdate",
    GetAndSubscribeMixerData = "GetAndSubscribeMixerData",
    UnsubscribeMixerData = "UnsubscribeMixerData",
    MixerDataUpdate = "MixerDataUpdate",
    GetMixerRoutings = "GetMixerRoutings",
    SessionData = "SessionData",
    SessionDataUpdate = "SessionDataUpdate",
}

export type NodeMessage = {
    type: NodeMessageType;
    error?: boolean;
    details?: string;
    status?: number;
    data: any;
};

export enum MixerProtocol {
    HiQNet = "HiQNet",
    YamahaRemote = "Yamaha Remote",
}

export enum MixerModel {
    SoundcraftSiExpression3 = "Soundcraft Si Expression 3",
    YamahaDM3 = "Yamaha DM3",
}
