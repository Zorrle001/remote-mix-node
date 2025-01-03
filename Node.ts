import type { InputChannelDataCollection } from "./types/InputChannelTypes";
import {
    MixerModel,
    MixerProtocol,
    NodeMessageType,
    WSSubscription,
} from "./types/node/NodeTypes";

import type { MixerRouting, NodeMessage } from "./types/node/NodeTypes";
import type { SendBusDataCollection } from "./types/SendBusTypes";

const ConnectedMixers = new Map<string, MixerRouting>();

const InputChannelDataCollections = new Map<
    string,
    InputChannelDataCollection
>();

// PUT IN FILE
const MixerRoutings: MixerRouting[] = [
    {
        ip: "localhost",
        name: "Si Expression 3",
        protocol: MixerProtocol.HiQNet,
        model: MixerModel.SoundcraftSiExpression3,
        port: 32000,
        uuid: crypto.randomUUID(),
        autoConnect: true,
        connected: false,
    },
    {
        ip: "127.0.0.0",
        name: "DM3",
        protocol: MixerProtocol.YamahaRemote,
        model: MixerModel.YamahaDM3,
        port: 80,
        uuid: crypto.randomUUID(),
        autoConnect: false,
        connected: false,
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

            ws.send(
                JSON.stringify({
                    type: NodeMessageType.GetMixerRoutings,
                    data: MixerRoutings,
                } as NodeMessage)
            );
        },
        async close(ws, code, reason) {
            console.log(`Closed connection: ${code} ${reason}`);

            ws.unsubscribe(WSSubscription.GENERAL);
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

                    ws.send(
                        JSON.stringify({
                            type: NodeMessageType.GetAndSubscribeMixerData,
                            data: {
                                inputChannelDataCollection:
                                    InputChannelDataCollection,
                                sendBusDataCollection: null,
                            },
                        } as NodeMessage)
                    );
                } else if (msg.type === NodeMessageType.UnsubscribeMixerData) {
                    const uuid = msg.data.uuid;

                    ws.unsubscribe(`MixerDataUpdate-${uuid}`);

                    // NO RESPONSE
                } else if (msg.type === NodeMessageType.MixerDataUpdate) {
                    const uuid = msg.data.uuid;

                    if (ConnectedMixers.has(uuid) === false) {
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
                    const prevInputChannelDataCollection =
                        msg.data.inputChannelDataCollection;

                    const inputChannelDataCollectionPartial: Partial<InputChannelDataCollection> =
                        msg.data.inputChannelDataCollectionPartial;
                    const sendBusDataCollectionPartial: Partial<SendBusDataCollection> =
                        msg.data.sendBusDataCollectionPartial;

                    const mergedInputChannelDataCollection =
                        {} as InputChannelDataCollection;

                    InputChannelDataCollections.set(
                        uuid,
                        mergedInputChannelDataCollection
                    );

                    // NO RESPONSE
                    /*ws.send(
                        JSON.stringify({
                            type: NodeMessageType.MixerDataUpdate,
                            status: 200,
                            data: undefined,
                        } as NodeMessage)
                    );*/
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
    mixer.connected = true;
    ConnectedMixers.set(mixer.uuid, mixer);
}
// -> SKIP

// 3. Download Mixer Data
for (const mixer of ConnectedMixers.values()) {
    const file = Bun.file("data/InputChannelDataCollection.json");
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
}

// 4. Send Mixer Updates to WebSocket Clients
server.publish(
    WSSubscription.GENERAL,
    JSON.stringify({
        type: NodeMessageType.MixerConnectionsUpdate,
        data: Array.from(ConnectedMixers.values()),
    } as NodeMessage)
);
