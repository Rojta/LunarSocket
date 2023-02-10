import DoEmotePacket from '../../../packets/DoEmotePacket';
import Player from '../../Player';

export default function (player: Player, packet: DoEmotePacket): void {
  console.log(player.username, packet.data.id);
  player.playEmote(packet.data.id);
}
