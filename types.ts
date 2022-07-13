import { types } from "@mercurial-finance/vault-sdk";

export type VaultStateAPI = {
    enable: boolean;
    token_amount: number;
    total_amount: number;
    lp_supply: number;
    strategies: Array<{
        pubkey: string;
        reserve: string;
        strategy_type: types.StrategyType;
        strategy_name: string;
        liquidity: number;
        reward: number;
        max_allocation: number;
    }>;
};