import { NodeMessageType, type MixerRouting } from "./types/node/NodeTypes";

const socket = new WebSocket("ws://localhost:80");

socket.onopen = () => {
    console.log("Connected to remote-mix-node");
};
socket.onmessage = (event) => {
    console.log(
        "Message received from remote-mix-node: ",
        JSON.parse(event.data)
    );

    const msg = JSON.parse(event.data);
    if (msg.type == NodeMessageType.MixerConnectionsUpdate) {
        msg.data.forEach((mixer: MixerRouting) => {
            socket.send(
                JSON.stringify({
                    type: NodeMessageType.GetAndSubscribeMixerData,
                    data: mixer.uuid,
                })
            );
        });
    }
};
socket.onclose = () => {
    console.log("Disconnected from remote-mix-node");
};
socket.onerror = (error) => {
    console.log("Error connecting to remote-mix-node: ", error);
};

await Bun.sleep(Infinity);
