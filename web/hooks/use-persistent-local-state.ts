import { safeJsonParse } from 'common/util/json'
import { useEffect } from 'react'
import { safeLocalStorage } from 'web/lib/util/local'
import { isFunction } from 'web/hooks/use-persistent-in-memory-state'
import { useStateCheckEquality } from 'web/hooks/use-state-check-equality'
import { useEvent } from 'web/hooks/use-event'
import { useIsClient } from 'web/hooks/use-is-client'

export const usePersistentLocalState = <T>(initialValue: T, key: string) => {
  const isClient = useIsClient()
  const [state, setState] = useStateCheckEquality<T>(
    (isClient && safeJsonParse(safeLocalStorage?.getItem(key))) || initialValue
  )

  useEffect(() => {
    const storedJson = safeJsonParse(safeLocalStorage?.getItem(key))
    const storedValue = storedJson ?? initialValue
    setState(storedValue as T)
  }, [key])

  const saveState = useEvent((newState: T | ((prevState: T) => T)) => {
    setState((prevState: T) => {
      const updatedState = isFunction(newState) ? newState(prevState) : newState
      safeLocalStorage?.setItem(key, JSON.stringify(newState))
      return updatedState
    })
  })

  return [state, saveState] as const
}
