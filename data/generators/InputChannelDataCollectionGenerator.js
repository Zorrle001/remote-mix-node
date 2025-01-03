import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const InputChannelID = {
    CH1: "ch1",
    CH2: "ch2",
    CH3: "ch3",
    CH4: "ch4",
    CH5: "ch5",
    CH6: "ch6",
    CH7: "ch7",
    CH8: "ch8",
    CH9: "ch9",
    CH10: "ch10",
    CH11: "ch11",
    CH12: "ch12",
    CH13: "ch13",
    CH14: "ch14",
    CH15: "ch15",
    CH16: "ch16",
    CH17: "ch17",
    CH18: "ch18",
    CH19: "ch19",
    CH20: "ch20",
    CH21: "ch21",
    CH22: "ch22",
    CH23: "ch23",
    CH24: "ch24",
    CH25: "ch25",
    CH26: "ch26",
    CH27: "ch27",
    CH28: "ch28",
    CH29: "ch29",
    CH30: "ch30",
    CH31: "ch31",
    CH32: "ch32",
    CH33: "ch33",
    CH34: "ch34",
    CH35: "ch35",
    CH36: "ch36",
    CH37: "ch37",
    CH38: "ch38",
    CH39: "ch39",
    CH40: "ch40",
    CH41: "ch41",
    CH42: "ch42",
    CH43: "ch43",
    CH44: "ch44",
    CH45: "ch45",
    CH46: "ch46",
    CH47: "ch47",
    CH48: "ch48",
    CH49: "ch49",
    CH50: "ch50",
    CH51: "ch51",
    CH52: "ch52",
    CH53: "ch53",
    CH54: "ch54",
    ST1: "sr1",
    ST2: "sr2",
    FXRT1: "fxrt1",
    FXRT2: "fxrt2",
    FXRT3: "fxrt3",
    FXRT4: "fxrt4",
};

const defaultChannelData = {
    name: "",
    id: "",
    type: "CH",
    master: {
        enabled: false,
        value: 0,
        gain: 0,
        hpf: {
            enabled: false,
            frequency: 0,
        },
        phaseInversion: false,
        phantomPower: false,
        eq: {
            enabled: false,
            bands: [],
        },
        dyn1: {
            id: "dyn1",
            enabled: false,
            threshold: 0,
            ratio: 0,
            attack: 0,
            release: 0,
            gain: 0,
        },
        dyn2: {
            id: "dyn2",
            enabled: false,
            threshold: 0,
            ratio: 0,
            attack: 0,
            release: 0,
            gain: 0,
        },
        delay: 0,
        pan: 0,
        grandMasterSends: {
            lr: {
                enabled: false,
                value: 0,
            },
            mono: {
                enabled: false,
                value: 0,
            },
        },
    },
    sendsTo: {},
};

const inputChannelDataCollection = {};

Object.values(InputChannelID).forEach((id) => {
    const channelData = {
        ...defaultChannelData,
        id,
        name: `Channel ${id.toUpperCase()}`,
        master: {
            ...defaultChannelData.master,
            phantomPower: id.startsWith("st") || id.startsWith("fxrt"),
        },
    };
    inputChannelDataCollection[id] = channelData;
});

const filePath = path.join(__dirname, "../", "InputChannelDataCollection.json");
fs.writeFileSync(filePath, JSON.stringify(inputChannelDataCollection, null, 4));

console.log("InputChannelDataCollection.json has been generated.");
