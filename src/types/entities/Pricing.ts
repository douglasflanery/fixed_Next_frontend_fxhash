export interface IPricingFixed<N = number> {
  price: N
  opensAt?: Date|null
}

export interface IPricingDutchAuction<N = number> {
  levels: N[]
  restingPrice?: number
  finalPrice?: number
  decrementDuration: N
  opensAt?: Date|null
}