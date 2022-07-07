import VaultImpl from '@mercurial-finance/vault-sdk';
import { StaticTokenListResolutionStrategy, TokenInfo } from "@solana/spl-token-registry";
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Wallet, AnchorProvider } from '@project-serum/anchor';
import { BN } from 'bn.js';
import fetch from 'node-fetch';
import fs from 'fs';

// Connection, Wallet, and AnchorProvider to interact with the network
const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com');

const tokenMap = new StaticTokenListResolutionStrategy().resolve();
const SOL_TOKEN_INFO = tokenMap.find(token => token.symbol === 'SOL') as TokenInfo;
const data:[number] = JSON.parse(fs.readFileSync('./mock.json', 'utf8'))

const key = Uint8Array.from(data)

const SOL_VAULT_ADDRESS = "FERjPVNEa7Udq8CEv68h6tPL46Tq7ieE49HrE2wea3XT"

//  should be from file
const mockWallet = new Wallet(Keypair.fromSecretKey(key))

const provider = new AnchorProvider(mainnetConnection, mockWallet, {
    commitment: 'confirmed',
});

interface Dictionary<T> {
    [Key: string]: T;
}

// connecting to the vault
const getVault = async ()  => { 
    return VaultImpl.create(mainnetConnection, SOL_TOKEN_INFO);
}

// Get onchain data from the vault and offchain apy data from the api
const getVaultDetails = async(vault: VaultImpl) => {

    console.log("Vault Data For SOL")

    const lpSupply = await vault.getVaultSupply();
    console.log ("LP supply is " + lpSupply);
    const unlockedAmount = await vault.getWithdrawableAmount()
    console.log ("Unlocked Amount is " + unlockedAmount);
    
    const response = await fetch(`https://vaults.mercurial.finance/api/apy_state/${SOL_TOKEN_INFO.address}`);
    const data = await response.json();
    const closest_apy = data.closest_apy;

    // TODO: needs to update the apy formatting
    const display = closest_apy.filter( (w: Dictionary<String>) =>  w["strategy"] == SOL_VAULT_ADDRESS)[0];
    console.log(`Current APY is ${display.apy}`)

}

// Deposits into the vault 
const depositIntoVault = async (wallet: Wallet, amount:number, vault: VaultImpl) => {
    console.log("\nDespositing SOL")

    const amountInBN = new BN(amount)
    console.log(`Depositing ${amountInBN} into vault`)
    const depositTx = await vault.deposit(mockWallet.publicKey, amountInBN); // Web3 Transaction Object
    console.log(`Waiting for confirmation...`)
    const depositResult = await provider.sendAndConfirm(depositTx); // Transaction hash    
    console.log(depositResult)       
}

(async () => {
    const vault: VaultImpl = await getVault();

    // print vault details
    await getVaultDetails(vault);

    // deposit into vault
    const amountInLamports = 0.1 * 10 ** SOL_TOKEN_INFO.decimals; // 1.0 SOL
    await depositIntoVault(mockWallet, amountInLamports, vault)

    // withdraws from vault
})()