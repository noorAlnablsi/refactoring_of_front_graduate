import { createContext, useContext, useMemo, useState } from 'react'

const ProctoringContext = createContext(null)


export function ProctoringProvider({ children, value }) {
  const [internalWarning, setInternalWarning] = useState(null)
  const [connectionState, setConnectionState] = useState('DISCONNECTED')
  const [cameraReady, setCameraReady] = useState(false)

  const merged = useMemo(
    () => ({
      warning: value?.warning ?? internalWarning,
      setWarning: value?.setWarning ?? setInternalWarning,
      connectionState: value?.connectionState ?? connectionState,
      setConnectionState: value?.setConnectionState ?? setConnectionState,
      cameraReady: value?.cameraReady ?? cameraReady,
      setCameraReady: value?.setCameraReady ?? setCameraReady,
      ...value,
    }),
    [value, internalWarning, connectionState, cameraReady],
  )

  return <ProctoringContext.Provider value={merged}>{children}</ProctoringContext.Provider>
}

export function useProctoringContext() {
  return useContext(ProctoringContext)
}
