import { connectedPlayers } from '..';
import Player from '../player/Player';

export default function findPlayer(uuidOrUsername: string): Player {
  // console.log(
  //   'connectedPlayers',
  //   connectedPlayers.map((p) => ({ uuid: p.uuid, username: p.username }))
  // );
  return connectedPlayers.find(
    (p) => p.uuid === uuidOrUsername || p.username === uuidOrUsername
  );
}
