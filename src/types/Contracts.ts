import type { WalletOperation } from "@taquito/taquito"

// a value for the state of the transaction
export enum ContractOperationStatus {
  NONE                    = "NONE",
  CALLING                 = "CALLING",
  WAITING_CONFIRMATION    = "WAITING_CONFIRMATION",
  INJECTED                = "INJECTED",
  ERROR                   = "ERROR"
}

// generic method to handle updates made on a call to a contract
export type ContractOperationCallback = (status: ContractOperationStatus, data?: any) => any

// generic signature for any contract-interraction method
export type ContractInteractionMethod<T> = (data: T, operationCallback?: ContractOperationCallback, currentTry?: number) => any

export const FxhashContracts = {
  ISSUER            : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_ISSUER!,
  MARKETPLACE_V1    : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_GENTK_V1!,
  MARKETPLACE_V2    : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_GENTK_V2!,
  GENTK_V1          : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_USERREGISTER!,
  GENTK_V2          : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_TOK_MODERATION!,
  REGISTER          : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_USER_MODERATION!,
  MODERATION        : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_MARKETPLACE_V1!,
  USER_MODERATION   : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_MARKETPLACE_V2!,
  COLLAB_FACTORY    : process.env.NEXT_PUBLIC_TZ_CT_ADDRESS_COLLAB_FACTORY!,
}

export const FxhashCollabFactoryCalls = {
  MINT_ISSUER:  0,
}

export type ContractCallHookReturn<T> = {
  state: ContractOperationStatus,
  loading: boolean,
  success: boolean,
  error: boolean,
  transactionHash: string|null,
  call: (data: T) => void,
  clear: () => void
}

export type TContractOperationHookReturn<Params> = {
  state: ContractOperationStatus,
  loading: boolean,
  success: boolean,
  error: boolean,
  opHash: string|null,
  operation: WalletOperation|null
  call: (data: Params) => void,
  clear: () => void
}