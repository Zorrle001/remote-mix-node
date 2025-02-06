import lodash from "lodash";
import {
    InputChannelID,
    type InputChannelDataCollection,
} from "./types/InputChannelTypes";
import {
    MixerModel,
    MixerProtocol,
    NodeMessageType,
    WSSubscription,
} from "./types/node/NodeTypes";

import type {
    MixerRouting,
    NodeMessage,
    SessionData,
} from "./types/node/NodeTypes";
import type { SendBusDataCollection } from "./types/SendBusTypes";

const ConnectedMixers = new Map<string, MixerRouting>();

const InputChannelDataCollections = new Map<
    string,
    InputChannelDataCollection
>();

const SendBusDataCollections = new Map<string, SendBusDataCollection>();

// PUT IN FILE
const MixerRoutings: MixerRouting[] = [
    {
        ip: "localhost",
        name: "Si Expression 3",
        protocol: MixerProtocol.HiQNet,
        model: MixerModel.SoundcraftSiExpression3,
        port: 32000,
        uuid: "4acd33e1-1e0d-43cb-b691-e94b34fc12de",
        autoConnect: true,
        connected: false,
        localSimulation: true,
    },
    {
        ip: "127.0.0.0",
        name: "DM3",
        protocol: MixerProtocol.YamahaRemote,
        model: MixerModel.YamahaDM3,
        port: 80,
        uuid: crypto.randomUUID(),
        autoConnect: true,
        connected: false,
    },
];

const Sessions: SessionData[] = [
    {
        uuid: "default-session",
        name: "Default Session",
        inputChannelBanks: [
            [
                InputChannelID.CH1,
                InputChannelID.CH2,
                InputChannelID.CH3,
                InputChannelID.CH4,
                InputChannelID.CH5,
                InputChannelID.CH6,
                InputChannelID.CH7,
                InputChannelID.CH8,
            ],
            [
                InputChannelID.CH9,
                InputChannelID.CH10,
                InputChannelID.CH11,
                InputChannelID.CH12,
                InputChannelID.CH13,
                InputChannelID.CH14,
                InputChannelID.CH15,
                InputChannelID.CH16,
            ],
            [
                InputChannelID.CH17,
                InputChannelID.CH18,
                InputChannelID.CH19,
                InputChannelID.CH20,
                InputChannelID.CH21,
                InputChannelID.CH22,
                InputChannelID.CH23,
                InputChannelID.CH24,
            ],
            [
                InputChannelID.CH25,
                InputChannelID.CH26,
                InputChannelID.CH27,
                InputChannelID.CH28,
                InputChannelID.CH29,
                InputChannelID.CH30,
                InputChannelID.CH31,
                InputChannelID.CH32,
            ],
            [
                InputChannelID.CH33,
                InputChannelID.CH34,
                InputChannelID.CH35,
                InputChannelID.CH36,
                InputChannelID.CH37,
                InputChannelID.CH38,
                InputChannelID.CH39,
                InputChannelID.CH40,
            ],
            [
                InputChannelID.CH41,
                InputChannelID.CH42,
                InputChannelID.CH43,
                InputChannelID.CH44,
                InputChannelID.CH45,
                InputChannelID.CH46,
                InputChannelID.CH47,
                InputChannelID.CH48,
            ],
            [
                InputChannelID.CH49,
                InputChannelID.CH50,
                InputChannelID.CH51,
                InputChannelID.CH52,
                InputChannelID.CH53,
                InputChannelID.CH54,
                null,
                null,
            ],
            [
                InputChannelID.ST1,
                InputChannelID.ST2,
                InputChannelID.FXRT1,
                InputChannelID.FXRT2,
                InputChannelID.FXRT3,
                InputChannelID.FXRT4,
                null,
                null,
            ],
        ],
        selectedChannel: InputChannelID.CH1,
        activeInputChannelBank: 0,
    },
];

// 1. Setup WebSocket Server
const server = Bun.serve({
    port: 80,
    fetch(req, server) {
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
            return; // do not return a Response
        }
        return new Response("WebSocket upgrade failed", { status: 500 });
    },
    websocket: {
        async open(ws) {
            console.log("Opened connection");

            ws.subscribe(WSSubscription.GENERAL);
            ws.subscribe(WSSubscription.DEFAULT_SESSION);

            ws.send(
                JSON.stringify({
                    type: NodeMessageType.GetMixerRoutings,
                    data: MixerRoutings,
                } as NodeMessage)
            );

            ws.send(
                JSON.stringify({
                    type: NodeMessageType.SessionData,
                    data: Sessions.find((s) => s.uuid === "default-session"),
                } as NodeMessage)
            );
        },
        async close(ws, code, reason) {
            console.log(`Closed connection: ${code} ${reason}`);

            ws.unsubscribe(WSSubscription.GENERAL);
            ws.unsubscribe(WSSubscription.DEFAULT_SESSION);
        },
        async message(ws, message) {
            console.log(`Received ${message}`);
            // send back a message
            //ws.send(`You said: ${message}`);

            if (typeof message !== "string") return;

            try {
                const msg: NodeMessage = JSON.parse(message);

                if (msg.type === NodeMessageType.GetMixerRoutings) {
                    ws.send(
                        JSON.stringify({
                            type: NodeMessageType.GetMixerRoutings,
                            data: MixerRoutings,
                        } as NodeMessage)
                    );
                } else if (
                    msg.type === NodeMessageType.GetAndSubscribeMixerData
                ) {
                    const uuid = msg.data;
                    console.log("GetAndSubscribeMixerData", uuid);

                    ws.subscribe(`MixerDataUpdate-${uuid}`);

                    const InputChannelDataCollection =
                        InputChannelDataCollections.get(uuid);

                    const SendBusDataCollection =
                        SendBusDataCollections.get(uuid);

                    ws.send(
                        JSON.stringify({
                            type: NodeMessageType.GetAndSubscribeMixerData,
                            data: {
                                uuid: uuid,
                                inputChannelDataCollection:
                                    InputChannelDataCollection,
                                sendBusDataCollection: SendBusDataCollection,
                            },
                        } as NodeMessage)
                    );
                } else if (msg.type === NodeMessageType.UnsubscribeMixerData) {
                    const uuid = msg.data.uuid;

                    ws.unsubscribe(`MixerDataUpdate-${uuid}`);

                    // NO RESPONSE
                } else if (msg.type === NodeMessageType.MixerDataUpdate) {
                    const uuid = msg.data.uuid;

                    if (
                        ConnectedMixers.has(uuid) === false ||
                        ConnectedMixers.get(uuid) == undefined
                    ) {
                        ws.send(
                            JSON.stringify({
                                type: NodeMessageType.MixerDataUpdate,
                                error: true,
                                status: 400,
                                details: "Mixer with UUID not connected",
                                data: undefined,
                            } as NodeMessage)
                        );
                        return;
                    }

                    // SEND TO ALL OTHER SUBSCRIBERS
                    ws.publish(`MixerDataUpdate-${uuid}`, JSON.stringify(msg));

                    // MERGE IN NODE STATE
                    /*const prevInputChannelDataCollection =
                        msg.data.inputChannelDataCollection;*/

                    const prevInputChannelDataCollection =
                        InputChannelDataCollections.get(uuid);
                    const prevSendBusDataCollection =
                        SendBusDataCollections.get(uuid);

                    const inputChannelDataCollectionPartial: Partial<InputChannelDataCollection> =
                        msg.data.inputChannelDataCollectionPartial;
                    const sendBusDataCollectionPartial: Partial<SendBusDataCollection> =
                        msg.data.sendBusDataCollectionPartial;

                    const mergedInputChannelDataCollection: InputChannelDataCollection =
                        lodash.merge(
                            prevInputChannelDataCollection,
                            inputChannelDataCollectionPartial
                        );

                    const mergedSendBusDataCollection = lodash.merge(
                        prevSendBusDataCollection,
                        sendBusDataCollectionPartial
                    );

                    InputChannelDataCollections.set(
                        uuid,
                        mergedInputChannelDataCollection
                    );

                    SendBusDataCollections.set(
                        uuid,
                        mergedSendBusDataCollection
                    );

                    // CANT BE UNDEFINED BECAUSE OF CHECK ABOVE
                    const mixer = ConnectedMixers.get(uuid) as MixerRouting;

                    updateMixerInputChannelCollection(
                        mixer,
                        mergedInputChannelDataCollection,
                        inputChannelDataCollectionPartial
                    );

                    // NO RESPONSE
                    /*ws.send(
                        JSON.stringify({
                            type: NodeMessageType.MixerDataUpdate,
                            status: 200,
                            data: undefined,
                        } as NodeMessage)
                    );*/
                } else if (msg.type === NodeMessageType.SessionDataUpdate) {
                    const uuid = msg.data.uuid;
                    const partial: Partial<SessionData> = msg.data.partial;

                    let prevSessionData = Sessions.find((s) => s.uuid === uuid);
                    if (!prevSessionData) {
                        ws.send(
                            JSON.stringify({
                                type: NodeMessageType.SessionDataUpdate,
                                error: true,
                                status: 400,
                                details: "Session with UUID not found",
                                data: undefined,
                            } as NodeMessage)
                        );
                        return;
                    }

                    // TODO: REPLACE WITH UUID SESSION
                    ws.publish(
                        WSSubscription.DEFAULT_SESSION,
                        JSON.stringify(msg)
                    );

                    prevSessionData = lodash.merge(prevSessionData, partial);
                    console.log("Updated Session Data", prevSessionData);
                }
            } catch (error) {
                console.error("Invalid JSON Message");
                return;
            }
        },
    },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

// 2. Connect to Mixer
for (const mixer of MixerRoutings) {
    if (!mixer.autoConnect) {
        continue;
    }
    if (!mixer.localSimulation) {
        console.error(
            mixer.name,
            "\n" + mixer.uuid,
            "\nNon-simulated consoles are not yet supported - No connection established!"
        );
        continue;
    }
    mixer.connected = true;
    ConnectedMixers.set(mixer.uuid, mixer);
}
// -> SKIP

// 3. Download Mixer Data
for (const mixer of ConnectedMixers.values()) {
    const file = Bun.file(
        `data/inputChannelDataCollections/${mixer.uuid}.json`
    );
    const InputChannelDataCollection: InputChannelDataCollection = await file
        .json()
        .catch((err) => {
            console.error("Mixer InputChannelDataCollection download failed");
            return undefined;
        });
    if (InputChannelDataCollection) {
        InputChannelDataCollections.set(mixer.uuid, InputChannelDataCollection);
        console.log(
            "Mixer " + mixer.uuid + " InputChannelDataCollection downloaded"
        );
    }

    const file2 = Bun.file(`data/sendBusDataCollections/${mixer.uuid}.json`);
    const SendBusDataCollection: SendBusDataCollection = await file2
        .json()
        .catch((err) => {
            console.error("Mixer SendBusDataCollection download failed");
            return undefined;
        });
    if (SendBusDataCollection) {
        SendBusDataCollections.set(mixer.uuid, SendBusDataCollection);
        console.log(
            "Mixer " + mixer.uuid + " SendBusDataCollection downloaded"
        );
    }
}

// 4. Send Mixer Updates to WebSocket Clients
server.publish(
    WSSubscription.GENERAL,
    JSON.stringify({
        type: NodeMessageType.MixerConnectionsUpdate,
        data: Array.from(ConnectedMixers.values()),
    } as NodeMessage)
);

function updateMixerInputChannelCollection(
    mixer: MixerRouting,
    newColl: InputChannelDataCollection,
    partialColl: Partial<InputChannelDataCollection>
) {
    if (!mixer.localSimulation) {
        console.error(
            mixer.name,
            "\n" + mixer.uuid,
            "\nNon-simulated console InputChannelCollection Updates are not yet supported"
        );
        return;
    }

    Bun.write(
        `data/inputChannelDataCollections/${mixer.uuid}.json`,
        JSON.stringify(newColl, null, "\t")
    );
}
