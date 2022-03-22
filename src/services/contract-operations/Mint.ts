import { ContractAbstraction, TransactionWalletOperation, Wallet } from "@taquito/taquito"
import { FxhashContract } from "../../types/Contracts"
import { GenerativeToken } from "../../types/entities/GenerativeToken"
import { ContractOperation } from "./ContractOperation"

export type TMintOperationParams = {
  token: GenerativeToken
  price: number
}

/**
 * Mint an unique iteration of a Generative Token
 * todo: setup the price stuff
 */
export class MintOperation extends ContractOperation<TMintOperationParams> {
  issuerContract: ContractAbstraction<Wallet>|null = null

  async prepare() {
    this.issuerContract = await this.manager.getContract(FxhashContract.ISSUER)
  }

  async call(): Promise<TransactionWalletOperation> {
    return this.issuerContract!.methodsObject.mint({
      issuer_id: this.params.token.id,
      referrer: null,
      reserve_input: null
    }).send({
      amount: 20000000,
      mutez: true,
      storageLimit: 450
    })
  }

  success(): string {
    return `Minted your unique iteration of ${this.params.token.name}`
  }
}