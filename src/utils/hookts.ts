import { DependencyList, EffectCallback, useCallback, useEffect, useRef, useState } from 'react'
import useAsyncEffect from 'use-async-effect'
import { ContractCallHookReturn, ContractInteractionMethod, ContractOperationStatus } from '../types/Contracts'

export function useIsMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(() => isMounted.current, [])
}

export const useClientEffect = (effect: EffectCallback, dependencies?: DependencyList): void => {
  if (typeof window !== "undefined") {
    useEffect(effect, dependencies)
  }
}

export const useClientAsyncEffect = (effect: (isMounted: () => boolean) => unknown, dependencies?: any[]): void => {
  if (typeof window !== "undefined") {
    useAsyncEffect(effect, dependencies)
  }
}

/**
 * Designed to interract with generic contract methods residing in the Wallet service.
 */
export function useContractCall<T>(contractMethod: ContractInteractionMethod<T>): ContractCallHookReturn<T> {
  const [state, setState] = useState<ContractOperationStatus>(ContractOperationStatus.NONE)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const counter = useRef<number>(0)
  const isMounted = useIsMounted()

  const clear = () => {
    setLoading(false)
    setSuccess(false)
    setError(false)
    setState(ContractOperationStatus.NONE)
  }

  const call = (data: T) => {
    setLoading(true)
    setSuccess(false)
    setError(false)
    setState(ContractOperationStatus.NONE)
    
    // assign the ID to this call and increment it to prevent overlaps
    counter.current++
    const id = counter.current
    contractMethod(data, (opState) => {
      if (counter.current === id && isMounted()) {
        setState(opState)
        if (opState === ContractOperationStatus.INJECTED) {
          setSuccess(true)
          setLoading(false)
        }
        else if (opState === ContractOperationStatus.ERROR) {
          setLoading(false)
          setError(true)
        }
      }
    })
  }

  return {
    state,
    loading,
    success,
    call,
    clear,
    error
  }
}