import { types } from "@mercurial-finance/vault-sdk";

export type VaultStateAPI = {
    symbol: string;
    token_address: string;
    pubkey: string;
    is_monitoring: boolean;
    usd_rate: number;
    closest_apy: number;
    average_apy: number;
    long_apy: number;
    earned_amount: number;
    virtual_price: string;
    enabled: number;
    lp_mint: string;
    fee_pubkey: string;
    total_amount: number;
    total_amount_with_profit: number;
    token_amount: number;
    fee_amount: number;
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
