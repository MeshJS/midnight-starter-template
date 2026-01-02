import { CombinedTokenTransfer } from '@midnight-ntwrk/wallet-sdk-facade';
import * as api from '../../api';
import * as ledger from '@midnight-ntwrk/ledger-v6';
import { tokenValue } from './utils';
import { MidnightBech32m, ShieldedAddress, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';

//allows to transfer unshielded tokens
//TODO: correct error with address
export async function sendUnshieldedToken(wallet: api.WalletContext, address: string, amount: bigint): Promise<string> {

  const tokenTransfer: CombinedTokenTransfer[] = [
    {
      type: 'unshielded',
      outputs: [
        {
          type: ledger.unshieldedToken().raw,
          amount: tokenValue(amount),
          receiverAddress: address,
        },
      ],
    },
  ];  

  const txTtl = new Date(Date.now() + 300 * 60 * 1000); // 30 min

  const transferRecipe = await wallet.wallet.transferTransaction(
    wallet.shieldedSecretKeys,
    wallet.dustSecretKey,
    tokenTransfer,
    txTtl,
  );

  const signedTx = await wallet.wallet.signTransaction(transferRecipe.transaction, (payload) =>
    wallet.unshieldedKeystore.signData(payload),
  );

  const finalizedTx = await wallet.wallet.finalizeTransaction({
    ...transferRecipe,
    transaction: signedTx,
  });

  const submittedTxHash = await wallet.wallet.submitTransaction(finalizedTx);

  // return txId;
  return submittedTxHash;
}

//allows to transfer arbitrary unshielded tokens
export async function sendArbitraryUnshieldedToken(wallet: api.WalletContext, address: string, amount: bigint): Promise<string> {

  //address Hex format
  const addressBech32m = MidnightBech32m.parse(address);
  const addressHex = UnshieldedAddress.codec.decode("undeployed", addressBech32m);

  const outputs = [
    {
      type: ledger.unshieldedToken().raw,
      value: tokenValue(amount),
      // owner: wallet.unshieldedKeystore.getAddress(),
      owner: addressHex.hexString,
    },
  ];

  const intent = ledger.Intent.new(new Date(Date.now() + 30 * 60 * 1000));
  intent.guaranteedUnshieldedOffer = ledger.UnshieldedOffer.new([], outputs, []);

  const arbitraryTx = ledger.Transaction.fromParts("undeployed", undefined, undefined, intent);

   const recipe = await wallet.wallet.balanceTransaction(
      wallet.shieldedSecretKeys,
      wallet.dustSecretKey,
      arbitraryTx,
      new Date(Date.now() + 30 * 60 * 1000),
    );

     if (recipe.type !== 'TransactionToProve') {
      throw new Error('Expected a transaction to prove');
    }

    const signedTx = await wallet.wallet.signTransaction(recipe.transaction, (payload) =>
      wallet.unshieldedKeystore.signData(payload),
    );

     const finalizedTx = await wallet.wallet.finalizeTransaction({
      ...recipe,
      transaction: signedTx,
    });

    const submittedTxHash = await wallet.wallet.submitTransaction(finalizedTx);

    return submittedTxHash;
}
