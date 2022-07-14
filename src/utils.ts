import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export function logScan(title: string, txId: string) {
    console.log(title, `https://solscan.io/tx/${txId}?cluster=devnet`);
    console.log(); // newline
}

export const airDropSol = async (connection: Connection, publicKey: PublicKey, amount = 1 * LAMPORTS_PER_SOL) => {
    try {
        const airdropSignature = await connection.requestAirdrop(
            publicKey,
            amount,
        );
        const latestBlockHash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature,
        });
        logScan('Airdropping SOL to devnet wallet', airdropSignature)
    } catch (error) {
        console.error(error);
        throw error;
    }
};