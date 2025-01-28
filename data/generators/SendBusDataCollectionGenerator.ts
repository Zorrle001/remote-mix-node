import fs from "fs";
import path from "path";
import {
    SendBusID,
    SendBusType,
    type SendBusDataCollection,
} from "../../types/SendBusTypes";

const generateSendBusDataCollection = (): SendBusDataCollection => {
    const sendBusDataCollection: Partial<SendBusDataCollection> = {};

    Object.values(SendBusID).forEach((id) => {
        switch (id) {
            case SendBusID.LR:
                sendBusDataCollection[id] = {
                    name: "Main LR",
                    id: SendBusID.LR,
                    type: SendBusType.LR,
                    master: {
                        enabled: true,
                        value: 1,
                        eq: {
                            /* EQ data */
                        },
                        dyn2: {
                            /* Dynamic data */
                        },
                        graphicEQ: {
                            /* GraphicEQ data */
                        },
                        pan: 0.5,
                    },
                    sendsFrom: {
                        /* SendsFromCollection data */
                    },
                    sendsTo: {
                        /* SendsToCollection data */
                    },
                };
                break;
            case SendBusID.MONO:
                sendBusDataCollection[id] = {
                    name: "Mono Bus",
                    id: SendBusID.MONO,
                    type: SendBusType.MONO,
                    master: {
                        enabled: true,
                        value: 1,
                        eq: {
                            /* EQ data */
                        },
                        dyn2: {
                            /* Dynamic data */
                        },
                        graphicEQ: {
                            /* GraphicEQ data */
                        },
                        delay: 0,
                    },
                    sendsTo: {
                        /* SendsToCollection data */
                    },
                };
                break;
            case SendBusID.MTX1:
            case SendBusID.MTX2:
            case SendBusID.MTX3:
            case SendBusID.MTX4:
                sendBusDataCollection[id] = {
                    name: `Matrix ${id}`,
                    id,
                    type: SendBusType.MTX,
                    master: {
                        enabled: true,
                        value: 1,
                        eq: {
                            /* EQ data */
                        },
                        dyn2: {
                            /* Dynamic data */
                        },
                        graphicEQ: {
                            /* GraphicEQ data */
                        },
                        delay: 0,
                    },
                    sendsFrom: {
                        /* SendsFromCollection data */
                    },
                };
                break;
            case SendBusID.FX1:
            case SendBusID.FX2:
            case SendBusID.FX3:
            case SendBusID.FX4:
                sendBusDataCollection[id] = {
                    name: `FX ${id}`,
                    id,
                    type: SendBusType.FX,
                    sendsFrom: {
                        /* SendsFromCollection data */
                    },
                    sendsTo: {
                        /* SendsToCollection data */
                    },
                };
                break;
            default:
                sendBusDataCollection[id] = {
                    name: `Mix ${id}`,
                    id,
                    type: SendBusType.MIX,
                    stereo: false,
                    postFader: false,
                    master: {
                        enabled: true,
                        value: 1,
                        hpf: {
                            /* HPF data */
                        },
                        phaseInversion: false,
                        eq: {
                            /* EQ data */
                        },
                        dyn2: {
                            /* Dynamic data */
                        },
                        graphicEQ: {
                            /* GraphicEQ data */
                        },
                        delay: 0,
                        pan: 0.5,
                        grandMasterSends: {
                            [SendBusID.LR]: true,
                            [SendBusID.MONO]: true,
                        },
                    },
                    sendsFrom: {
                        /* SendsFromCollection data */
                    },
                    sendsTo: {
                        /* SendsToCollection data */
                    },
                };
                break;
        }
    });

    return sendBusDataCollection as SendBusDataCollection;
};

const saveSendBusDataCollection = (
    data: SendBusDataCollection,
    filePath: string
) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const filePath = path.join(__dirname, "SendBusDataCollection.json");
const sendBusDataCollection = generateSendBusDataCollection();
saveSendBusDataCollection(sendBusDataCollection, filePath);
console.log(`SendBusDataCollection.json has been generated at ${filePath}`);
