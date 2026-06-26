# QuizHub — PROJECT_DOCUMENTATION

## محتويات الملف

1. نظرة عامة — Tech stack، مبادئ المعمارية  
2. التشغيل المحلي — npm، env variables  
3. Design System — ألوان، typography، UI Kit  
4. هيكل المجلدات — شجرة كاملة لـ `src/`  
5. المسارات — كل routes + `DashboardGuard`  
6. Stores — auth، registration، password reset، toast  
7. المصادقة وتجديد التوكن — تدفق كامل مع الملفات  
8. تدفقات التسجيل — institution + student  
9. نسيان كلمة المرور — 4 خطوات  
10. Dashboard Layout — TopBar + Sidebar + أبعاد Figma  
11. الصلاحيات — جدول `workspaceContext.js`  
12. إدارة المواد — APIs، tabs، assign teacher  
13. بنوك الأسئلة — tabs، محرر، rich text toolbar  
14. ملخص APIs — كل endpoints  
15. TODO — ما لم يُنفَّذ بعد  
16. Backend — مستودع منفصل + تعديل `membership_id`  
17. أخطاء شائعة  
18. Welcome Page — تخطيط UI  
19. كيف تستكمل على جهاز آخر  
20. خريطة المكونات

---

## نظرة عامة — Tech stack، مبادئ المعمارية

- React + Vite + React Router + Zustand + Axios + Tailwind + lucide-react
- المشروع RTL عربي، ومبدأ الفصل هو:
  - `pages`: تجميع الشاشات
  - `components`: UI
  - `hooks`: منطق التدفقات
  - `services`: API calls
  - `store`: Zustand state
  - `lib`: البنية المشتركة (axios/auth/permissions/helpers)
  - `constants`: ثوابت المسارات والقيم
- bootstrap عند بدء التطبيق يمر عبر:
  - `waitForAuthHydration()` ثم `bootstrapAuth()` ثم `initAuthSession()`  
  (في `src/main.jsx` + `src/lib/authSession.js`)

---

## التشغيل المحلي — npm، env variables

```bash
cd refactoring_exam_system
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

`.env` (اختياري لكن مهم):

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

- إذا لم يوجد هذا المتغير، الكود يستخدم fallback إلى `http://127.0.0.1:5000`
- بدون backend شغال، ستظهر أخطاء شبكة/401 في المصادقة

---

## Design System — ألوان، typography، UI Kit

### الألوان الأساسية

- Primary: `#2AA8A2`
- Backgrounds: `#F6F8F9`, `#EEF2F3`, `#F3F5F6`
- Text: `#374151`, `#64748B`, `#94A3B8`
- Borders: `#E5E9EB`

### Typography

- الخطوط من `src/index.css`: `Cairo`, `Tajawal`
- نمط الحقول المتكرر: rounded-xl + placeholder muted + focus ring بـ primary

### UI Kit Patterns

- `src/components/auth/AuthShell.jsx`: shell موحد لواجهات auth
- `src/components/auth/password-reset/PasswordResetShell.jsx`: shell خاص بإعادة التعيين
- استعمال متكرر لـ buttons/inputs بنفس spacings والارتفاعات عبر صفحات التسجيل/الدخول

---

## هيكل المجلدات — شجرة كاملة لـ `src/`

```text
src/
  App.css
  App.jsx
  index.css
  main.jsx
  assets/
    react.svg
    vite.svg
  constants/
    auth.js
    passwordReset.js
    routes.js
  store/
    authStore.js
    passwordResetStore.js
    registrationStore.js
    toastStore.js
  services/
    auth.service.js
    join.service.js
    questionBanks.service.js
    subjects.service.js
    workspaces.service.js
  lib/
    apiError.js
    authSession.js
    axios.js
    membershipLabel.js
    postLoginNavigation.js
    questionBanks.js
    richText.js
    slug.js
    subjectDisplay.js
    token.js
    workspaceContext.js
    workspaceTeachers.js
  hooks/
    useForgotPassword.js
    useInstitutionApprovalPolling.js
    useOtpVerification.js
    usePasswordResetOtp.js
    usePasswordValidation.js
    useRegisterFlow.js
    useResetPassword.js
    useStudentRegisterFlow.js
    question-banks/
      useQuestionBanks.js
    subjects/
      useSubjectDetails.js
      useSubjects.js
  pages/
    DashboardPage.jsx
    JoinPage.jsx
    LandingPage.jsx
    LoginPage.jsx
    PathSelectionPage.jsx
    RegisterPage.jsx
    WelcomePage.jsx
    auth/
      ForgotPasswordOtpPage.jsx
      ForgotPasswordPage.jsx
      ResetPasswordPage.jsx
      ResetPasswordSuccessPage.jsx
    question-banks/
      QuestionBankEditorPage.jsx
      QuestionBanksPage.jsx
    register/
      RegisterDetailsPage.jsx
      RegisterOtpPage.jsx
      RegisterPasswordPage.jsx
      RegisterSelectRolePage.jsx
      RegisterSuccessPage.jsx
    student/
      StudentJoinCodePage.jsx
      StudentRegisterPage.jsx
    subjects/
      SubjectDetailsPage.jsx
      SubjectsPage.jsx
  components/
    common/
      Toast.jsx
    dashboard/
      DashboardGuard.jsx
      DashboardLayout.jsx
      Sidebar.jsx
      TopBar.jsx
      UserAvatar.jsx
    landing/
      CtaSection.jsx
      FeaturesSection.jsx
      Footer.jsx
      Header.jsx
      HeroSection.jsx
      TrustedSection.jsx
    auth/
      AuthHeroPanel.jsx
      AuthShell.jsx
      MembershipSelector.jsx
      OtpInput.jsx
      PasswordField.jsx
      RegisterProgress.jsx
      RoleSelector.jsx
      WelcomeOptionSelector.jsx
      password-reset/
        BackToLoginLink.jsx
        PasswordResetDescription.jsx
        PasswordResetIcon.jsx
        PasswordResetShell.jsx
        PasswordResetTitle.jsx
    subjects/
      AssignTeacherModal.jsx
      CreateSubjectModal.jsx
      EditSubjectModal.jsx
      SubjectStatsCards.jsx
      SubjectsTable.jsx
      details/
        SubjectDetailsBreadcrumb.jsx
        SubjectDetailsHeader.jsx
        SubjectDetailsStats.jsx
        SubjectDetailsTabs.jsx
        SubjectExamsTab.jsx
        SubjectOverviewTab.jsx
        SubjectQuestionBanksTab.jsx
        SubjectTeachersTab.jsx
        TeacherAvatar.jsx
    question-banks/
      ArchiveQuestionBankDialog.jsx
      CommunityBanksPlaceholder.jsx
      CreateQuestionBankModal.jsx
      EditQuestionBankModal.jsx
      QuestionBankCard.jsx
      QuestionBanksEmptyState.jsx
      QuestionBanksSkeleton.jsx
      VisibilityBadge.jsx
      editor/
        BankInfoSummary.jsx
        PreviewQuestionsModal.jsx
        PublishQuestionBankModal.jsx
        QuestionBodyEditor.jsx
        QuestionBuilderForm.jsx
        QuestionsList.jsx
        TopicsPlaceholder.jsx
```

---

## المسارات — كل routes + DashboardGuard

### Routes Map

- `/` → `LandingPage`
- `/login` → `LoginPage`
- `/forgot-password` → `ForgotPasswordPage`
- `/forgot-password/otp` → `ForgotPasswordOtpPage`
- `/reset-password` → `ResetPasswordPage`
- `/reset-password/success` → `ResetPasswordSuccessPage`
- `/welcome` → `WelcomePage`
- `/join` → `JoinPage`
- `/path-selection` → `PathSelectionPage`
- `/dashboard` → `DashboardPage` (guarded)
- `/subjects` → `SubjectsPage` (guarded)
- `/subjects/:id` → `SubjectDetailsPage` (guarded)
- `/question-banks` → `QuestionBanksPage` (guarded)
- `/question-banks/:id/editor` → `QuestionBankEditorPage` (guarded)
- `/register` → `RegisterPage`
- `/register/select-role` → `RegisterSelectRolePage`
- `/register/details` → `RegisterDetailsPage`
- `/register/password` → `RegisterPasswordPage`
- `/register/otp` → `RegisterOtpPage`
- `/register/success` → `RegisterSuccessPage`
- `/student/register` → `StudentRegisterPage`
- `/student/join-code` → `StudentJoinCodePage`
- `*` → redirect `/`

### DashboardGuard

من `src/components/dashboard/DashboardGuard.jsx`:
1. إذا لا يوجد `access_token` → redirect `/login`
2. إذا memberships متعددة وبدون اختيار → redirect `/path-selection`
3. إذا المستخدم لا يملك dashboard access (مثل STUDENT) → redirect `/`

---

## Stores — auth، registration، password reset، toast

### `authStore` (`src/store/authStore.js`)

- `access_token`, `refresh_token`, `user`
- `memberships`, `selected_membership_id`, `requires_workspace_selection`
- actions: `setAuth`, `setTokens`, `setSelectedMembership`, `clearAuth`
- persisted في localStorage key: `quizhub-auth`

### `registrationStore` (`src/store/registrationStore.js`)

- بيانات flow التسجيل بالكامل (institution/solo/student)
- يحتفظ ببيانات OTP ومحاولات التحقق وبيانات التسجيل المؤقتة

### `passwordResetStore` (`src/store/passwordResetStore.js`)

- `email`, `otpVerified`, `resetCompleted`

### `toastStore` (`src/store/toastStore.js`)

- `showToast()` + إخفاء تلقائي
- يتم عرض الـ toast عبر `src/components/common/Toast.jsx`

---

## المصادقة وتجديد التوكن — تدفق كامل مع الملفات

### ملفات التدفق

- `src/main.jsx`
- `src/lib/authSession.js`
- `src/lib/axios.js`
- `src/lib/token.js`
- `src/services/auth.service.js`

### التدفق

1. تشغيل التطبيق: hydration ثم bootstrap session
2. إذا access token منتهي ومعه refresh token: `POST /auth/refresh`
3. request interceptor:
   - `ensureValidAccessToken()` قبل إرسال الطلبات المحمية
   - إضافة `Authorization` و `X-Workspace-Id`
4. response interceptor:
   - عند `401`: retry مرة واحدة بعد `enqueueTokenRefresh()`
   - عند فشل refresh: logout/redirect إلى `/login`
5. scheduling:
   - refresh قبل انتهاء access token
   - refresh عند العودة للتبويب

---

## تدفقات التسجيل — institution + student

### Institution / Solo

`/welcome` → `/register/select-role` → `/register/password` → `/register/otp` → `/register/success`

- register API: `POST /auth/register`
- verify OTP: `POST /auth/verify-otp`
- resend OTP: `POST /auth/resend-otp`

### Student

`/welcome` → `/student/register` → `/student/join-code` → `/register/otp`

- join/register API: `POST /join-codes/register-student`
- بعد verify OTP: redirect لتسجيل الدخول

---

## نسيان كلمة المرور — 4 خطوات

1. `Forgot Password` (`/forgot-password`)  
   API: `POST /auth/forgot-password`
2. `OTP Verification` (`/forgot-password/otp`)  
   API: `POST /auth/verify-otp`
3. `Reset Password` (`/reset-password`)  
   API: `POST /auth/reset-password`
4. `Success` (`/reset-password/success`)

الملفات:  
`src/pages/auth/*` + hooks:
`useForgotPassword`, `usePasswordResetOtp`, `useResetPassword`

---

## Dashboard Layout — TopBar + Sidebar + أبعاد Figma

- `src/components/dashboard/DashboardLayout.jsx`: wrapper عام (Sidebar + TopBar + Outlet + Toast)
- `src/components/dashboard/Sidebar.jsx`:
  - عرض sidebar: `w-[260px]`
  - logo/header height: `h-20`
- `src/components/dashboard/TopBar.jsx`:
  - height: `h-20`
  - content container: `max-w-[1024px]`
  - search area: `w-[697px]`
  - search input: `w-[448px]`
  - user info block: `w-[154px]`

> ملاحظة: لا يوجد ملف Figma داخل المستودع، لذلك الأبعاد موثقة من كود Tailwind الحالي.

---

## الصلاحيات — جدول `workspaceContext.js`

| الدالة | الوصف |
|---|---|
| `canAccessDashboard()` | يمنع STUDENT من dashboard |
| `canAccessQuestionBanks()` | يمنع STUDENT، ويمنع superadmin حسب المنطق الحالي |
| `canAccessSubjectsModule()` | يمنع STUDENT وTeacher داخل workspace نوعه INSTITUTION |
| `canCreateSubject()` | SOLO مسموح، وINSTITUTION فقط owner/admin |
| `canEditSubject()` | نفس create |
| `canAssignTeachers()` | INSTITUTION + owner/admin |
| `canManageQuestionBank(bank)` | creator أو owner/admin |

الملف: `src/lib/workspaceContext.js`

---

## إدارة المواد — APIs، tabs، assign teacher

### Subjects List (`/subjects`)

- load: `GET /subjects`
- create: `POST /subjects`
- edit: `PATCH /subjects/:subjectId`
- UI: `SubjectsTable`, `CreateSubjectModal`, `EditSubjectModal`

### Subject Details (`/subjects/:id`)

- `GET /subjects/:subjectId`
- `GET /subjects/:subjectId/teachers`
- `GET /subjects/:subjectId/question-banks`
- `GET /subjects/:subjectId/students`

### Tabs

- `overview`
- `teachers`
- `banks`
- `exams` (placeholder حاليًا)

### Assign Teacher

- fetch teachers: `GET /workspaces/teachers`
- assign: `POST /subjects/:subjectId/teachers` body فيه `membership_id`
- remove: `DELETE /subjects/:subjectId/teachers/:membershipId`
- normalization helpers: `src/lib/workspaceTeachers.js`

---

## بنوك الأسئلة — tabs، محرر، rich text toolbar

### Tabs في صفحة البنوك (`/question-banks`)

- `my` → `GET /question-banks/my`
- `workspace` → `GET /question-banks/workspace` (يظهر حسب الصلاحية)
- `community` → `GET /question-banks/community`

### إجراءات

- إنشاء: `POST /question-banks`
- تعديل: `PATCH /question-banks/:bankId`
- أرشفة/حذف: `DELETE /question-banks/:bankId`
- محرر: `/question-banks/:id/editor`

### محرر البنك

الملف الأساسي: `src/pages/question-banks/QuestionBankEditorPage.jsx`

- load bank + questions
- edit local questions
- publish (visibility + questions)

### Rich Text Toolbar

من `src/components/question-banks/editor/QuestionBodyEditor.jsx`:
- Bold / Italic / Underline
- Bullet List
- Sigma insertion
- Paragraph direction RTL/LTR
- helpers في `src/lib/richText.js`

---

## ملخص APIs — كل endpoints

### Auth

- `POST /auth/register`
- `POST /auth/verify-otp`
- `POST /auth/resend-otp`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/refresh`

### Join

- `POST /join-codes/register-student`
- `POST /join-codes/join`

### Subjects

- `GET /subjects`
- `POST /subjects`
- `GET /subjects/:subjectId`
- `PATCH /subjects/:subjectId`
- `GET /subjects/:subjectId/teachers`
- `POST /subjects/:subjectId/teachers`
- `DELETE /subjects/:subjectId/teachers/:membershipId`
- `GET /subjects/:subjectId/question-banks`
- `GET /subjects/:subjectId/students`

### Question Banks

- `GET /question-banks/my`
- `GET /question-banks/workspace`
- `GET /question-banks/community`
- `POST /question-banks`
- `PATCH /question-banks/:bankId`
- `DELETE /question-banks/:bankId`
- `GET /question-banks/:bankId/questions`
- `POST /question-banks/:bankId/questions`

### Workspaces

- `GET /workspaces/teachers`

---

## TODO — ما لم يُنفَّذ بعد

- TopBar search UI غير مربوط بـ API
- أزرار الإشعارات/المساعدة غير مكتملة logic
- عناصر Sidebar التالية disabled: الامتحانات، الإحصائيات، الإعدادات
- `SubjectExamsTab` placeholder
- `TopicsPlaceholder` في محرر بنوك الأسئلة غير مربوط
- dropdown الموضوع في toolbar معطل
- بعض إحصائيات المواد placeholder

---

## Backend — مستودع منفصل + تعديل `membership_id`

- backend موجود في مستودع منفصل (ليس داخل هذا workspace)
- frontend يعتمد على وجود `membership_id` لإسناد المدرسين للمواد
- التعديل المطلوب في backend: التأكد أن teacher serialization يعيد `membership_id`

---

## أخطاء شائعة

- `Network Error`: backend غير شغّال أو `VITE_API_BASE_URL` خطأ
- `401` متكرر: refresh token منتهي/غير صالح
- فشل Assign Teacher: بيانات teachers لا تحتوي `membership_id`
- CORS: backend لا يسمح بـ origin الخاص بالواجهة

---

## Welcome Page — تخطيط UI

الملفات:
- `src/pages/WelcomePage.jsx`
- `src/components/auth/WelcomeOptionSelector.jsx`
- `src/components/auth/AuthShell.jsx`

الترتيب:
- عنوان + وصف في أعلى المحتوى
- خياران رئيسيان (إنشاء مساحة / الانضمام كطالب)
- زر "التالي" في الأسفل
- صفحة auth تستخدم `AuthShell` مع محاذاة علوية

---

## كيف تستكمل على جهاز آخر

1. انسخ المشروع وافتحه في Cursor
2. ادخل على `refactoring_exam_system` ثم شغّل:
   - `npm install`
   - `npm run dev`
3. اضبط `.env` (إن لزم): `VITE_API_BASE_URL`
4. تأكد أن backend المنفصل شغال
5. اقرأ هذا الملف قبل أي تعديل

على الجهاز الجديد: افتح المشروع في Cursor وقل:
"اقرأ `PROJECT_DOCUMENTATION.md` واستكمل من حيث توقفنا"
أو أرفق الملف في المحادثة الجديدة.

---

## خريطة المكونات

### Auth & Registration

- `pages/LoginPage.jsx`
- `pages/WelcomePage.jsx`
- `pages/register/*`
- `pages/student/*`
- `pages/auth/*`
- `components/auth/*`
- `hooks/useRegisterFlow.js`
- `hooks/useStudentRegisterFlow.js`

### Dashboard Shell

- `components/dashboard/DashboardLayout.jsx`
- `components/dashboard/TopBar.jsx`
- `components/dashboard/Sidebar.jsx`
- `components/dashboard/UserAvatar.jsx`
- `components/dashboard/DashboardGuard.jsx`

### Subjects

- `pages/subjects/*`
- `components/subjects/*`
- `hooks/subjects/*`
- `services/subjects.service.js`

### Question Banks

- `pages/question-banks/*`
- `components/question-banks/*`
- `components/question-banks/editor/*`
- `hooks/question-banks/useQuestionBanks.js`
- `services/questionBanks.service.js`
- `lib/richText.js`
