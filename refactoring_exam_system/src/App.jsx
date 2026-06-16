import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardGuard from './components/dashboard/DashboardGuard'
import DashboardLayout from './components/dashboard/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import WelcomePage from './pages/WelcomePage'
import JoinPage from './pages/JoinPage'
import PathSelectionPage from './pages/PathSelectionPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import RegisterSelectRolePage from './pages/register/RegisterSelectRolePage'
import RegisterDetailsPage from './pages/register/RegisterDetailsPage'
import RegisterPasswordPage from './pages/register/RegisterPasswordPage'
import RegisterOtpPage from './pages/register/RegisterOtpPage'
import RegisterSuccessPage from './pages/register/RegisterSuccessPage'
import StudentRegisterPage from './pages/student/StudentRegisterPage'
import StudentJoinCodePage from './pages/student/StudentJoinCodePage'
import SubjectsPage from './pages/subjects/SubjectsPage'
import SubjectDetailsPage from './pages/subjects/SubjectDetailsPage'
import QuestionBanksPage from './pages/question-banks/QuestionBanksPage'
import QuestionBankEditorPage from './pages/question-banks/QuestionBankEditorPage'
import { ROUTES } from './constants/routes'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
      <Route path={ROUTES.JOIN} element={<JoinPage />} />
      <Route path={ROUTES.PATH_SELECTION} element={<PathSelectionPage />} />

      <Route element={<DashboardGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.SUBJECTS} element={<SubjectsPage />} />
          <Route path={`${ROUTES.SUBJECTS}/:id`} element={<SubjectDetailsPage />} />
          <Route path={ROUTES.QUESTION_BANKS} element={<QuestionBanksPage />} />
          <Route path={`${ROUTES.QUESTION_BANKS}/:id/editor`} element={<QuestionBankEditorPage />} />
        </Route>
      </Route>

      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.REGISTER_SELECT_ROLE} element={<RegisterSelectRolePage />} />
      <Route path={ROUTES.REGISTER_DETAILS} element={<RegisterDetailsPage />} />
      <Route path={ROUTES.REGISTER_PASSWORD} element={<RegisterPasswordPage />} />
      <Route path={ROUTES.REGISTER_OTP} element={<RegisterOtpPage />} />
      <Route path={ROUTES.REGISTER_SUCCESS} element={<RegisterSuccessPage />} />

      <Route path={ROUTES.STUDENT_REGISTER} element={<StudentRegisterPage />} />
      <Route path={ROUTES.STUDENT_JOIN_CODE} element={<StudentJoinCodePage />} />

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}

export default App
