// Commitlint Configuration - الامتثال للقاعدة 42
// يضمن أن جميع رسائل الـ commit تتبع صيغة Conventional Commits

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // نوع الـ commit مطلوب
    'type-enum': [
      2,
      'always',
      [
        'feat',     // ميزة جديدة
        'fix',      // إصلاح خطأ
        'docs',     // توثيق
        'style',    // تنسيق (لا يؤثر على الكود)
        'refactor', // إعادة هيكلة
        'perf',     // تحسين الأداء
        'test',     // اختبارات
        'build',    // تغييرات البناء
        'ci',       // تغييرات CI/CD
        'chore',    // مهام صيانة
        'revert',   // التراجع عن commit
      ],
    ],
    // الموضوع مطلوب
    'subject-empty': [2, 'never'],
    // الموضوع لا يتجاوز 100 حرف
    'subject-max-length': [2, 'always', 100],
    // النوع مطلوب
    'type-empty': [2, 'never'],
    // النوع بأحرف صغيرة
    'type-case': [2, 'always', 'lower-case'],
  },
};
