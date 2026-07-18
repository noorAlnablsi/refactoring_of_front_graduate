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
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import StudentPlaceholderPage from './pages/student/StudentPlaceholderPage'
import ExamAttemptPage from './pages/student/ExamAttemptPage'
import StudentResultStatusPage from './pages/student/StudentResultStatusPage'
import StudentDashboardGuard from './components/student/dashboard/StudentDashboardGuard'
import StudentDashboardLayout from './components/student/dashboard/StudentDashboardLayout'
import SubjectsPage from './pages/subjects/SubjectsPage'
import SubjectDetailsPage from './pages/subjects/SubjectDetailsPage'
import QuestionBanksPage from './pages/question-banks/QuestionBanksPage'
import QuestionBankEditorPage from './pages/question-banks/QuestionBankEditorPage'
import ExamsPage from './pages/exams/ExamsPage'
import ExamWizardPage, { ExamCreatePage } from './pages/exams/ExamWizardPage'
import InvitePreviewPage from './pages/invites/InvitePreviewPage'
import InviteRegisterPage from './pages/invites/InviteRegisterPage'
import InviteAcceptPage from './pages/invites/InviteAcceptPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ForgotPasswordOtpPage from './pages/auth/ForgotPasswordOtpPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ResetPasswordSuccessPage from './pages/auth/ResetPasswordSuccessPage'
import SettingsPage from './pages/settings/SettingsPage'
import ChangePasswordPage from './pages/settings/ChangePasswordPage'
import CreateWorkspacePage from './pages/settings/CreateWorkspacePage'
import MembersPage from './pages/members/MembersPage'
import TeachersPage from './pages/members/TeachersPage'
import StudentsPage from './pages/members/StudentsPage'
import { ROUTES } from './constants/routes'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD_OTP} element={<ForgotPasswordOtpPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD_SUCCESS} element={<ResetPasswordSuccessPage />} />
      <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
      <Route path={ROUTES.JOIN} element={<JoinPage />} />
      <Route path={ROUTES.PATH_SELECTION} element={<PathSelectionPage />} />
      <Route path={ROUTES.SETTINGS_CREATE_WORKSPACE} element={<CreateWorkspacePage />} />

      <Route element={<DashboardGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.SUBJECTS} element={<SubjectsPage />} />
          <Route path={`${ROUTES.SUBJECTS}/:id`} element={<SubjectDetailsPage />} />
          <Route path={ROUTES.MEMBERS} element={<MembersPage />} />
          <Route path={ROUTES.MEMBERS_TEACHERS} element={<TeachersPage />} />
          <Route path={ROUTES.MEMBERS_STUDENTS} element={<StudentsPage />} />
          <Route path={ROUTES.QUESTION_BANKS} element={<QuestionBanksPage />} />
          <Route path={`${ROUTES.QUESTION_BANKS}/:id/editor`} element={<QuestionBankEditorPage />} />
          <Route path={ROUTES.EXAMS} element={<ExamsPage />} />
          <Route path={ROUTES.EXAM_CREATE} element={<ExamCreatePage />} />
          <Route path={ROUTES.EXAM_EDIT} element={<ExamWizardPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.SETTINGS_CHANGE_PASSWORD} element={<ChangePasswordPage />} />
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

      <Route element={<StudentDashboardGuard />}>
        <Route path={ROUTES.STUDENT_EXAM_ATTEMPT} element={<ExamAttemptPage />} />

        <Route element={<StudentDashboardLayout />}>
          <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboardPage />} />
          <Route
            path={ROUTES.STUDENT_EXAMS}
            element={<StudentPlaceholderPage page="exams" />}
          />
          <Route
            path={ROUTES.STUDENT_RESULTS}
            element={<StudentResultStatusPage mode="results" />}
          />
          <Route
            path={ROUTES.STUDENT_RESULTS_PENDING}
            element={<StudentResultStatusPage mode="pending" />}
          />
          <Route
            path={ROUTES.STUDENT_SETTINGS}
            element={<StudentPlaceholderPage page="settings" />}
          />
        </Route>
      </Route>

      <Route path={ROUTES.INVITE_PREVIEW} element={<InvitePreviewPage />} />
      <Route path={ROUTES.INVITE_REGISTER} element={<InviteRegisterPage />} />
      <Route path={ROUTES.INVITE_ACCEPT} element={<InviteAcceptPage />} />

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}

export default App
