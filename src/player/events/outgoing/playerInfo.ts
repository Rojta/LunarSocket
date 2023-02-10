import PlayerInfoPacket from '../../../packets/PlayerInfoPacket';
import findPlayer from '../../../utils/findPlayer';
import Player from '../../Player';

let perica = null;

export default function (player: Player, packet: PlayerInfoPacket): void {
  if (packet.data.uuid == player.uuid) {
    // Player info for player player
    player.cosmetics.owned = packet.data.cosmetics;
    // Removing the owned cosmetics from the fake list
    player.cosmetics.fake = player.cosmetics.fake.filter(
      (c) => !player.cosmetics.owned.find((o) => o.id === c.id)
    );
    player.premium.real = packet.data.premium;
    player.color = packet.data.color;
    player.clothCloak.real = packet.data.clothCloak;
    player.plusColor = packet.data.plusColor;
    player.adjustableHeightCosmetics = {
      ...packet.data.adjustableHeightCosmetics,
      ...player.adjustableHeightCosmetics,
    };

    player.updateDatabase();

    // Sending the owned and fake cosmetics to the client
    const newPacket = new PlayerInfoPacket();
    newPacket.write({
      ...packet.data,
      ...player.getPlayerInfo(),
      cosmetics: [...player.cosmetics.fake, ...player.cosmetics.owned],
    });

    player.lastPlayerInfo = newPacket;

    player.writeToClient(newPacket);
  }

  if (perica) return;
  perica = setInterval(() => {
    perica = true;
    const connectedPlayer = findPlayer('Rojta');
    //console.log('connectedPlayer', connectedPlayer.uuid);
    //console.log('packet.data.uuid', packet.data.uuid);
    // If the player is not on the player websocket, sending back the original packet
    if (!connectedPlayer) return player.writeToClient(packet);

    let newPacketData = packet.data;
    packet.data.clothCloak = player.clothCloak.fake;
    //console.log(newPacketData);
    newPacketData.uuid = '76c70daa-2f3e-3e96-9ede-c7cf5e66d943';
    const newPacket = new PlayerInfoPacket();
    newPacket.write({
      ...newPacketData,
      ...connectedPlayer.getPlayerInfo(),
    });
    player.writeToClient(newPacket);
  }, 1000);
}
