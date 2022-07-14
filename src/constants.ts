import { Cluster, Connection, Keypair } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@project-serum/anchor';
import { StaticTokenListResolutionStrategy, TokenInfo } from '@solana/spl-token-registry';

export const mockWallet = new Wallet(new Keypair());
export const devnetConnection = new Connection('https://api.devnet.solana.com/', { commitment: 'confirmed' });

export const KEEPER_URL: Record<Cluster, string> = {
    testnet: 'https://staging-keeper.raccoons.dev',
    devnet: 'https://dev-keeper.raccoons.dev',
    'mainnet-beta': 'https://merv2-api.mercurial.finance/api',
};

export const tokenMap = new StaticTokenListResolutionStrategy().resolve();
export const SOL_TOKEN_INFO = tokenMap.find(token => token.symbol === 'SOL') as TokenInfo;
export const provider = new AnchorProvider(devnetConnection, mockWallet, {
    commitment: 'confirmed',
});
