import { Cluster, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { StaticTokenListResolutionStrategy, TokenInfo } from "@solana/spl-token-registry";
import { Wallet, AnchorProvider } from '@project-serum/anchor';

export const mockWallet = new Wallet(new Keypair());
export const devnetConnection = new Connection('https://api.devnet.solana.com/', { commitment: 'confirmed' });

export const KEEPER_URL: Record<Cluster, string> = {
    testnet: 'https://staging-keeper.raccoons.dev',
    devnet: 'https://dev-keeper.raccoons.dev',
    'mainnet-beta': 'https://merv2-api.mercurial.finance/api',
};
