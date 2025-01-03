import type { InputChannelID, SendsToCollection } from "./InputChannelTypes";
import type { Dynamic, DynamicID } from "./master/DynamicTypes";
import type { EQ } from "./master/EQTypes";
import type { GraphicEQ } from "./master/GraphicEQTypes";
import type { HPF } from "./master/HPFTypes";

export type SendBusDataCollection = {
    [ID in SendBusID]: SendBusData<ID>;
};

export type SendBusData<ID extends SendBusID> = ID extends SendBusID.LR
    ? // LR könnte mit MTX zusammengeführt werden via SendBusTypeGenerator
      {
          name: string;
          id: ID;
          type: SendBusType.LR;
          master: SendBusMasterData<SendBusType.LR>;
          sendsFrom: SendsFromCollection<SendBusType.LR>;
          // EIG FALSCH WEGEN L & R split send
          sendsTo: SendsToCollection<SendBusType.LR>;
      }
    : ID extends SendBusID.MONO
    ? {
          name: string;
          id: ID;
          type: SendBusType.MONO;
          master: SendBusMasterData<SendBusType.MONO>;
          // SENDS FROM ON LR BUS
          sendsTo: SendsToCollection<SendBusType.MONO>;
      }
    : ID extends
          | SendBusID.MTX1
          | SendBusID.MTX2
          | SendBusID.MTX3
          | SendBusID.MTX4
    ? {
          name: string;
          id: ID;
          type: SendBusType.MTX;
          master: SendBusMasterData<SendBusType.MTX>;
          sendsFrom: SendsFromCollection<SendBusType.MTX>;
          // NO SENDS TO
      }
    : ID extends SendBusID.FX1 | SendBusID.FX2 | SendBusID.FX3 | SendBusID.FX4
    ? {
          name: string;
          id: ID;
          type: SendBusType.FX;
          sendsFrom: SendsFromCollection<SendBusType.FX>;
          sendsTo: SendsToCollection<SendBusType.FX>;
          // NO MASTER! Masters are FX Returns -> Input Channels
      }
    : // MUST BE MIX
      {
          name: string;
          id: ID;
          type: SendBusType.MIX;
          stereo: boolean;
          postFader: boolean;
          master: SendBusMasterData<SendBusType.MIX>;
          sendsFrom: SendsFromCollection<SendBusType.MIX>;
          sendsTo: SendsToCollection<SendBusType.MIX>;
      };

export type SendBusMasterData<T extends Exclude<SendBusType, SendBusType.FX>> =
    T extends SendBusType.LR
        ? {
              enabled: boolean; // MUTED -> false // ON -> true
              value: number; // 0 - 1
              eq: EQ;
              dyn2: Dynamic<DynamicID.DYN2>;
              graphicEQ: GraphicEQ;
              pan: number;
              // DELAY NOT AVAILABLE ?!?!?!
          }
        : T extends SendBusType.MONO | SendBusType.MTX
        ? {
              enabled: boolean; // MUTED -> false // ON -> true
              value: number; // 0 - 1
              eq: EQ;
              dyn2: Dynamic<DynamicID.DYN2>;
              graphicEQ: GraphicEQ;
              delay: number;
              // NO PAN AVAILABLE ?!?!?!
          }
        : {
              enabled: boolean; // MUTED -> false // ON -> true
              value: number; // 0 - 1
              hpf: HPF;
              phaseInversion: boolean;
              eq: EQ;
              dyn2: Dynamic<DynamicID.DYN2>;
              graphicEQ: GraphicEQ;
              delay: number;
              pan: number;
              grandMasterSends: GrandMasterSends;
          };

export enum SendBusID {
    LR = "lr",
    MONO = "mono",
    MIX1 = "mix1",
    MIX2 = "mix2",
    MIX3 = "mix3",
    MIX4 = "mix4",
    MIX5 = "mix5",
    MIX6 = "mix6",
    MIX7 = "mix7",
    MIX8 = "mix8",
    MIX9 = "mix9",
    MIX10 = "mix10",
    MIX11 = "mix11",
    MIX12 = "mix12",
    MIX13 = "mix13",
    MIX14 = "mix14",
    MTX1 = "mtx1",
    MTX2 = "mtx2",
    MTX3 = "mtx3",
    MTX4 = "mtx4",
    FX1 = "fx1",
    FX2 = "fx2",
    FX3 = "fx3",
    FX4 = "fx4",
}

export enum MixSendBusID {
    MIX1 = "mix1",
    MIX2 = "mix2",
    MIX3 = "mix3",
    MIX4 = "mix4",
    MIX5 = "mix5",
    MIX6 = "mix6",
    MIX7 = "mix7",
    MIX8 = "mix8",
    MIX9 = "mix9",
    MIX10 = "mix10",
    MIX11 = "mix11",
    MIX12 = "mix12",
    MIX13 = "mix13",
    MIX14 = "mix14",
}

export enum MTXSendBusID {
    MTX1 = "mtx1",
    MTX2 = "mtx2",
    MTX3 = "mtx3",
    MTX4 = "mtx4",
}

export enum MtxLRSendBusID {
    L = "l",
    R = "r",
}

export enum SendBusType {
    LR = "lr",
    MONO = "mono",
    MIX = "mix",
    MTX = "mtx",
    FX = "fx",
}

export type GrandMasterSends = {
    [SendBusID.LR]: boolean;
    [SendBusID.MONO]: boolean;
};

export type SendsFromCollection<T extends SendBusType> =
    T extends SendBusType.MTX
        ? {
              [sendBusID in
                  | MixSendBusID
                  | SendBusID.MONO
                  | SendBusID.LR]?: sendBusID extends SendBusID.LR
                  ? SendMTXFromLRData
                  : SendFromData;
          }
        : {
              [channelID in InputChannelID]?: SendFromData;
          };

export type SendFromData = {
    enabled: boolean;
    value: number;
};

export type SendMTXFromLRData = {
    [sendBus in MtxLRSendBusID]: SendFromData;
};
