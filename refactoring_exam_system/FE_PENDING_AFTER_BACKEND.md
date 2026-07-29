# نقص فرونت معلّق — بانتظار باكند قائمة الاختبارات

تاريخ التوثيق: 2026-07-28  
المصدر: Network → `GET .../tests?page=1&per_page=50&include_archived=false`

## مؤكّد من Response

في كل عنصر داخل `tests[]` موجود حالياً:

- `average_score`
- `participants_count`
- `graded_attempts_count`
- `submitted_attempts_count`
- `total_score`
- `duration_minutes`

**غير موجود:**

- `questions_count` (ولا `question_count` / `questions[]`)

لذلك بطاقة `/exams` تعرض «٠ سؤال» — الفرونت جاهز عبر `getTestQuestionsCount` في `src/lib/testDisplay.js` بمجرد وصول الحقل.

## عمل فرونت بعد وصول الباك

1. **عدد الأسئلة** — لا تغيير مطلوب إذا الاسم `questions_count`؛ تحقق فقط بعد التحديث.
2. **عرض على البطاقة (جاهز للربط الآن أو بعد الباك):**
   - `average_score` → متوسط الدرجة
   - `participants_count` → عدد المشاركين  
   الملفات المتوقعة: `ExamCard` / أي عرض ميتاداتا البطاقة + مفاتيح i18n في `exams.json` إن لزم.
3. لا تخترع طلبات `getTestById` لكل بطاقة من أجل العدد.

## رسالة باك (مختصر)

إضافة `questions_count` (integer) لكل عنصر في `tests[]` لقائمة الاختبارات.

---

## نقص باك مؤكد — اسم الطالب في قائمة المحاولات

`GET /tests/{test_id}/attempts` يرجع `student_membership_id` و `user_id` فقط — بدون `student_name` / `full_name` / كائن `student`.  
الفرونت جاهز في `attemptGradingModel.js`؛ عند وصول الاسم يظهر مباشرة.

---

## سؤال منتج معلّق — إغلاق تلقائي لـ SCHEDULED

توقّع المنتج (من المستخدم): في وضع غير مرن (`availability_time_mode = SCHEDULED`)، بعد انتهاء نافذة الامتحان (`starts_at` + `duration_minutes` أو `global_end_at`) يجب أن يصبح `status = CLOSED` تلقائياً بدون انتظار زر «إغلاق الامتحان».  
الفرونت حالياً يعرض الحالة كما يرسلها الباك فقط؛ لا يوجد job/إغلاق تلقائي من الفرونت (وهذا صحيح — مصدر الحقيقة الباك).
