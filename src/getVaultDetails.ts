import VaultImpl from '@mercurial-finance/vault-sdk';
import fetch from 'node-fetch';

import { KEEPER_URL, SOL_TOKEN_INFO } from './constants';
import { VaultStateAPI } from './types';

// Get onchain data from the vault and offchain apy data from the api
export const getVaultDetails = async (vaultImpl: VaultImpl) => {
    const vaultUnlockedAmount = (await vaultImpl.getWithdrawableAmount()).toNumber();
    const virtualPrice = (vaultUnlockedAmount / vaultImpl.lpSupply.toNumber()) || 0;

    const URL = KEEPER_URL['devnet'];
    const vaultStateAPI: VaultStateAPI = await (await fetch(`${URL}/vault_state/${SOL_TOKEN_INFO.address}`)).json();
    const totalAllocation = vaultStateAPI.strategies.reduce((acc, item) => acc + item.liquidity, vaultStateAPI.token_amount)

    return {
        lpSupply: (await vaultImpl.getVaultSupply()).toString(),
        withdrawableAmount: vaultUnlockedAmount,
        virtualPrice,
        usd_rate: vaultStateAPI.usd_rate,
        closest_apy: vaultStateAPI.closest_apy,
        average_apy: vaultStateAPI.average_apy,
        long_apy: vaultStateAPI.long_apy,
        earned_amount: vaultStateAPI.earned_amount,
        virtual_price: vaultStateAPI.virtual_price,
        total_amount: vaultStateAPI.total_amount,
        total_amount_with_profit: vaultStateAPI.total_amount_with_profit,
        token_amount: vaultStateAPI.token_amount,
        fee_amount: vaultStateAPI.fee_amount,
        lp_supply: vaultStateAPI.lp_supply,
        strategyAllocation: vaultStateAPI.strategies
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
            .sort((a, b) => b.liquidity - a.liquidity),
    }
}