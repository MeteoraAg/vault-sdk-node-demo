import VaultImpl from "@mercurial-finance/vault-sdk";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

import { devnetConnection, mockWallet, provider, SOL_TOKEN_INFO } from "./constants";
import { getVaultDetails } from "./getVaultDetails";
import { airDropSol, logScan } from "./utils";

async function main() {
    // Getting a Vault Implementation instance (SOL)
    const vaultImpl: VaultImpl = await VaultImpl.create(
        devnetConnection,
        SOL_TOKEN_INFO,
        {
            cluster: 'devnet',
            affiliateId: new PublicKey('7236FoaWTXJyzbfFPZcrzg3tBpPhGiTgXsGWvjwrYfiF') // Replace with your own Partner ID
        }
    );

    // Airdrop to devnet wallet
    await airDropSol(devnetConnection, mockWallet.publicKey);

    // Get vault details
    const details = await getVaultDetails(vaultImpl);
    console.log('Vault details', JSON.stringify(details, null, 2))

    // Deposits into the vault 
    const depositAmount = 0.1;
    console.log(`Depositing ${depositAmount} into vault`)
    const depositTx = await vaultImpl.deposit(mockWallet.publicKey, new BN(depositAmount * 10 ** SOL_TOKEN_INFO.decimals)); // 0.1 SOL
    const depositResult = await provider.sendAndConfirm(depositTx);
    logScan('Deposit result: ', depositResult)

    // Withdraw from the vault
    const withdrawAmount = 0.05;
    console.log(`Withrawing ${withdrawAmount} from vault`)
    const withdrawTx = await vaultImpl.withdraw(mockWallet.publicKey, new BN(withdrawAmount * 10 ** SOL_TOKEN_INFO.decimals)); // 0.05 SOL
    const withdrawResult = await provider.sendAndConfirm(withdrawTx); // Transaction hash    
    logScan('Withdraw result: ', withdrawResult)

    const partnerInfo = await vaultImpl.getAffiliateInfo();
    console.log('Result:', {
        publicKey: mockWallet.publicKey.toString(),
        balance: (await vaultImpl.getUserBalance(mockWallet.publicKey)).toString(),
        'Partner Token': partnerInfo.partnerToken.toString(),
        'Vault': partnerInfo.vault.toString(),
        'Outstanding Fee': partnerInfo.outstandingFee.toString(),
        'Fee Ratio': partnerInfo.feeRatio.toString(),
        'Cumulative Fee': partnerInfo.cummulativeFee.toString(),
    })
}

main();
