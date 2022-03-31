import type { BigNumber } from "bignumber.js"
import { EBuildableParams, unpackBytes } from "../../services/parameters-builder/BuildParameters"
import { TInputMintIssuer } from "../../services/parameters-builder/mint-issuer/input"
import { TInputPricingDetails } from "../../services/parameters-builder/pricing/input"
import { transformMintIssuerBigNumbers } from "../unpack-transformers/mint-issuer"
import { unpackPricingDetails } from "./pricing"

export function unpackMintIssuer(bytes: string): TInputMintIssuer<number, TInputPricingDetails<number>> {
  // unpack (get BigNumbers)
  const unpacked = unpackBytes<TInputMintIssuer<BigNumber, string>>(
    bytes,
    EBuildableParams.MINT_ISSUER
  )
  
  // unpack the pricing too (still big numbers)
  const withPricingUnpacked: TInputMintIssuer<
    BigNumber, TInputPricingDetails<BigNumber>
  > = {
    ...unpacked,
    pricing: {
      pricing_id: unpacked.pricing.pricing_id,
      details: unpackPricingDetails(unpacked.pricing)
    }
  }

  // turns all the BigNumbers into JS numbers to consume easily
  return transformMintIssuerBigNumbers(withPricingUnpacked)
}