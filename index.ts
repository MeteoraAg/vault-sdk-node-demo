import { StaticTokenListResolutionStrategy, TokenInfo } from "@solana/spl-token-registry";
import { AnchorProvider } from '@project-serum/anchor';
import VaultImpl from '@mercurial-finance/vault-sdk';
import { BN } from 'bn.js';
import fetch from 'node-fetch';

import { devnetConnection, KEEPER_URL, mockWallet } from './constants';
import { VaultStateAPI } from './types';
import { airDropSol, logScan } from './utils';

const tokenMap = new StaticTokenListResolutionStrategy().resolve();
const SOL_TOKEN_INFO = tokenMap.find(token => token.symbol === 'SOL') as TokenInfo;

const provider = new AnchorProvider(devnetConnection, mockWallet, {
    commitment: 'confirmed',
});

// Get onchain data from the vault and offchain apy data from the api
const getVaultDetails = async (vaultImpl: VaultImpl) => {
    const vaultUnlockedAmount = (await vaultImpl.getWithdrawableAmount()).toNumber();
    const virtualPrice = (vaultUnlockedAmount / vaultImpl.lpSupply.toNumber()) || 0;

    const strategyAllocation = (async () => {
        const vaultStateAPI: VaultStateAPI = await (await fetch(`${KEEPER_URL['devnet']}/vault_state/${SOL_TOKEN_INFO.address}`)).json();
        console.log('##', vaultStateAPI)

        // Vault reserves + all strategy allocations
        const totalAllocation = vaultStateAPI.strategies.reduce((acc, item) => acc + item.liquidity, vaultStateAPI.token_amount)

        return vaultStateAPI.strategies
            .map(item => ({
                name: item.strategy_name,
                liquidity: item.liquidity,
                allocation: ((item.liquidity / totalAllocation) * 100).toFixed(0),
                maxAllocation: item.max_allocation,
            }))
            .concat({
                name: 'Vault Reserves',
                liquidity: vaultStateAPI.token_amount,
                allocation: ((vaultStateAPI.token_amount / totalAllocation) * 100).toFixed(0),
                maxAllocation: 0,
            })
            .sort((a, b) => b.liquidity - a.liquidity);
    })()

    return {
        lpSupply: (await vaultImpl.getVaultSupply()).toString(),
        withdrawableAmount: vaultUnlockedAmount,
        virtualPrice,
        strategyAllocation,
    }
}

async function main() {
    // Getting a Vault Implementation instance (SOL)
    const vault: VaultImpl = await VaultImpl.create(
        devnetConnection,
        SOL_TOKEN_INFO,
        {
            cluster: 'devnet'
        }
    );

    // Airdrop to devnet wallet
    await airDropSol(devnetConnection, mockWallet.publicKey);

    // Get vault details
    const details = await getVaultDetails(vault);
    console.log('Vault details', JSON.stringify(details, null, 2))

    // Deposits into the vault 
    const depositAmount = 0.1;
    console.log(`Depositing ${depositAmount} into vault`)
    const depositTx = await vault.deposit(mockWallet.publicKey, new BN(depositAmount * 10 ** SOL_TOKEN_INFO.decimals)); // 0.1 SOL
    const depositResult = await provider.sendAndConfirm(depositTx);
    logScan('Deposit result: ', depositResult)

    // Withdraw from the vault
    const withdrawAmount = 0.05;
    console.log(`Withrawing ${withdrawAmount} from vault`)
    const withdrawTx = await vault.withdraw(mockWallet.publicKey, new BN(withdrawAmount * 10 ** SOL_TOKEN_INFO.decimals)); // 0.05 SOL
    const withdrawResult = await provider.sendAndConfirm(withdrawTx); // Transaction hash    
    logScan('Withdraw result: ', withdrawResult)
}

main();
