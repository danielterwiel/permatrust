export const canisterIdMain = process.env.CANISTER_ID_MAIN_CANISTER as string;
export const canisterIdUpgrade = process.env.CANISTER_ID_UPGRADE_CANISTER as string;
export const canisterIdInternetIdentitiy = process.env.CANISTER_ID_INTERNET_IDENTITY as string;

if (!canisterIdMain) {
  throw new Error('Environment variable CANISTER_ID_MAIN_CANISTER not found');
}

if (!canisterIdUpgrade) {
  throw new Error('Environment variable CANISTER_ID_UPGRADE_CANISTER not found');
}

if (!canisterIdInternetIdentitiy) {
  throw new Error('Environment variable CANISTER_ID_INTERNET_IDENTITY_CANISTER not found');
}
