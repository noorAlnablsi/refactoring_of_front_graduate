/**
 * Minimal wiring helper for future Student Exam Attempt UI.
 *
 * Example (when the attempt page is ready):
 *
 *   const { bootstrap, startMonitoring, finishAndSubmit, proctoring } =
 *     useExamProctoringBootstrap({ testId })
 *
 *   const onEnterExam = async () => {
 *     const result = await bootstrap()
 *     await startMonitoring(result)
 *   }
 *
 *   const onSubmit = async () => {
 *     await finishAndSubmit()
 *   }
 *
 * This file documents the integration contract without inventing a final Figma UI.
 */

export { useExamProctoringBootstrap } from '../../hooks/proctoring/useExamProctoringBootstrap'
export { useProctoring } from '../../hooks/proctoring/useProctoring'
export { useCamera } from '../../hooks/proctoring/useCamera'
export { default as ProctoringWarning } from './ProctoringWarning'
export { default as CameraPreview } from './CameraPreview'
export { ProctoringProvider, useProctoringContext } from './ProctoringProvider'
