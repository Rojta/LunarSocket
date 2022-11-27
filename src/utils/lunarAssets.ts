import axios from 'axios';

async function getLunarMetadata(): Promise<any> {
  return axios
    .post('https://api.lunarclientprod.com/launcher/launch', {
      hwid: 'not supplied',
      os: 'win32',
      arch: 'x64',
      version: '1.8.9',
      branch: 'master',
      launch_type: 'OFFLINE',
      classifier: 'optifine',
    })
    .then((res) => res.data);
}

async function getAssetsIndex(): Promise<AssetsIndex> {
  const textures = (await getLunarMetadata()).textures;

  return axios.get(textures.indexUrl).then((res) => {
    const files = res.data.split('\n').map((line) => {
      const parts = line.split(' ');
      return {
        path: parts[0],
        sha1: parts[1],
      };
    });

    return { baseUrl: textures.baseUrl, files };
  });
}

async function fetchCosmeticsIndex(): Promise<Cosmetic[]> {
  const assetsIndex = await getAssetsIndex();
  const entry = assetsIndex.files.find(
    (f) => f.path == 'assets/lunar/cosmetics/index'
  );
  const url = assetsIndex.baseUrl + entry.sha1;

  return axios
    .get(url)
    .then((res) => res.data)
    .then((data) =>
      data.split('\n').map((line) => {
        const parts = line.split(' ');
        return {
          id: parseInt(parts[0]),
          resource: parts[8],
          name: parts[3],
          type: parts[4],
          animated: !!parts[5],
          category: parts[6],
          indexType: parts[7],
        };
      })
    );
}

let cosmeticsIndex: Cosmetic[];

export async function getCosmeticsIndex(): Promise<Cosmetic[]> {
  if (cosmeticsIndex) return cosmeticsIndex;

  cosmeticsIndex = await fetchCosmeticsIndex();
  return Promise.resolve(cosmeticsIndex);
}

export interface Cosmetic {
  id: number;
  resource: string;
  name: string;
  type: string;
  animated: boolean;
  category:
    | 'cloak'
    | 'hat'
    | 'bodywear'
    | 'neckwear'
    | 'mask'
    | 'bandanna'
    | 'dragon_wings'
    | 'backpack';
  indexType: string;
}

interface AssetsIndexEntry {
  path: string;
  sha1: string;
}

interface AssetsIndex {
  baseUrl: string;
  files: AssetsIndexEntry[];
}
