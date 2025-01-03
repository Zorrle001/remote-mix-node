export enum WSSubscription {
    GENERAL = "general",
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
};

export enum NodeMessageType {
    MixerConnectionsUpdate = "MixerConnectionsUpdate",
    GetAndSubscribeMixerData = "GetAndSubscribeMixerData",
    UnsubscribeMixerData = "UnsubscribeMixerData",
    MixerDataUpdate = "MixerDataUpdate",
    GetMixerRoutings = "GetMixerRoutings",
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
