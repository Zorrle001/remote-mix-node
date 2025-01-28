import type { Dynamic, DynamicID } from "./master/DynamicTypes";
import type { EQ } from "./master/EQTypes";
import type { HPF } from "./master/HPFTypes";
import {
    MtxLRSendBusID,
    MTXSendBusID,
    SendBusID,
    SendBusType,
} from "./SendBusTypes";

import type { GrandMasterSends } from "./SendBusTypes";

export enum InputChannelID {
    CH1 = "ch1",
    CH2 = "ch2",
    CH3 = "ch3",
    CH4 = "ch4",
    CH5 = "ch5",
    CH6 = "ch6",
    CH7 = "ch7",
    CH8 = "ch8",
    CH9 = "ch9",
    CH10 = "ch10",
    CH11 = "ch11",
    CH12 = "ch12",
    CH13 = "ch13",
    CH14 = "ch14",
    CH15 = "ch15",
    CH16 = "ch16",
    CH17 = "ch17",
    CH18 = "ch18",
    CH19 = "ch19",
    CH20 = "ch20",
    CH21 = "ch21",
    CH22 = "ch22",
    CH23 = "ch23",
    CH24 = "ch24",
    CH25 = "ch25",
    CH26 = "ch26",
    CH27 = "ch27",
    CH28 = "ch28",
    CH29 = "ch29",
    CH30 = "ch30",
    CH31 = "ch31",
    CH32 = "ch32",
    CH33 = "ch33",
    CH34 = "ch34",
    CH35 = "ch35",
    CH36 = "ch36",
    CH37 = "ch37",
    CH38 = "ch38",
    CH39 = "ch39",
    CH40 = "ch40",
    CH41 = "ch41",
    CH42 = "ch42",
    CH43 = "ch43",
    CH44 = "ch44",
    CH45 = "ch45",
    CH46 = "ch46",
    CH47 = "ch47",
    CH48 = "ch48",
    CH49 = "ch49",
    CH50 = "ch50",
    CH51 = "ch51",
    CH52 = "ch52",
    CH53 = "ch53",
    CH54 = "ch54",
    ST1 = "sr1",
    ST2 = "sr2",
    FXRT1 = "fxrt1",
    FXRT2 = "fxrt2",
    FXRT3 = "fxrt3",
    FXRT4 = "fxrt4",
}

export enum InputChannelType {
    CH = "CH",
    ST = "ST",
    FXRT = "FXRT",
}

export type InputChannelTypeGenerator<ID extends InputChannelID> = ID extends
    | InputChannelID.ST1
    | InputChannelID.ST2
    ? InputChannelType.ST
    : ID extends
          | InputChannelID.FXRT1
          | InputChannelID.FXRT2
          | InputChannelID.FXRT3
          | InputChannelID.FXRT4
    ? InputChannelType.FXRT
    : InputChannelType.CH;

export type InputChannelDataCollection = {
    [ID in InputChannelID]: InputChannelData<ID>;
};

export type InputChannelData<ID extends InputChannelID> = {
    name: string;
    id: ID;
    type: InputChannelTypeGenerator<ID>;
    master: InputChannelMasterData<InputChannelTypeGenerator<ID>>;
    sendsTo: SendsToCollection<ID>;
};

export type InputChannelMasterData<T extends InputChannelType> =
    T extends InputChannelType.CH
        ? {
              enabled: boolean; // MUTED -> false // ON -> true
              value: number; // 0 - 1
              gain: number;
              hpf: HPF;
              phaseInversion: boolean;
              phantomPower: boolean;
              eq: EQ;
              dyn1: Dynamic<DynamicID.DYN1>;
              dyn2: Dynamic<DynamicID.DYN2>;
              delay: number;
              pan: number;
              grandMasterSends: GrandMasterSends;
          }
        : {
              enabled: boolean; // MUTED -> false // ON -> true
              value: number; // 0 - 1
              gain: number;
              hpf: HPF;
              phaseInversion: boolean;
              // SAME BUT NO PHANTOM POWER
              eq: EQ;
              dyn1: Dynamic<DynamicID.DYN1>;
              dyn2: Dynamic<DynamicID.DYN2>;
              delay: number;
              pan: number;
              grandMasterSends: GrandMasterSends;
          };

export type SendsToCollection<TYPE extends SendBusType | InputChannelID> =
    TYPE extends SendBusType.LR
        ? // ONLY Matrix SEND POSSIBLE
          {
              [sendMTXBusID in MTXSendBusID]?: SendLRToMTXData;
          }
        : TYPE extends SendBusType.MIX | SendBusType.MONO
        ? // ONLY Matrix SEND POSSIBLE
          {
              [sendMTXBusID in MTXSendBusID]?: SendToData;
          }
        : {
              [sendBusID in Exclude<SendBusID, MTXSendBusID>]?: SendToData;
          };

export type SendToData = {
    enabled: boolean;
    value: number;
};

export type SendLRToMTXData = {
    [sendBus in MtxLRSendBusID]: SendToData;
};
