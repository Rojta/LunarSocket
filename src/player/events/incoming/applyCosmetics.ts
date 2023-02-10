import ApplyCosmeticsPacket from '../../../packets/ApplyCosmeticsPacket';
import findPlayer from '../../../utils/findPlayer';
import Player from '../../Player';

export default function (player: Player, packet: ApplyCosmeticsPacket): void {
  //console.log('ApplyCosmeticsPacket');
  for (const cosmetic of packet.data.cosmetics) {
    player.setCosmeticState(cosmetic.id, cosmetic.equipped);
  }
  player.clothCloak.fake = packet.data.clothCloak;

  player.adjustableHeightCosmetics = packet.data.adjustableHeightCosmetics;
  const newAdjustableHeightCosmetics: { [key: string]: number } = {};
  for (const cosmetic in packet.data.adjustableHeightCosmetics)
    if (
      Object.prototype.hasOwnProperty.call(
        packet.data.adjustableHeightCosmetics,
        cosmetic
      )
    )
      if (player.cosmetics.owned.find((c) => c.id === parseInt(cosmetic)))
        newAdjustableHeightCosmetics[cosmetic] =
          packet.data.adjustableHeightCosmetics[cosmetic];

  // Sending the new state of the cosmetics to lunar

  let newPacketData = packet.data;
  newPacketData.cosmetics = [
    ...player.cosmetics.fake,
    ...player.cosmetics.owned,
  ];
  const newPacket = new ApplyCosmeticsPacket();
  newPacket.write({
    ...newPacketData,
    cosmetics: player.cosmetics.fake,
    // Non premium users can't change clothCloak
    clothCloak: true,
    adjustableHeightCosmetics: newAdjustableHeightCosmetics,
  });

  player.writeToServer(newPacket);

  player.updateDatabase();

  // No need to send the PlayerInfoPacket to other players because lunar is doing it for us :D
}
