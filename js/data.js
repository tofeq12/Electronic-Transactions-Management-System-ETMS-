// data.js — بيانات تجريبية مشتركة (تُستبدل بقاعدة البيانات عند الانتقال إلى Laravel)
window.ITQAN = (function () {
  const CURRENT_USER = { id: 1, name: 'أحمد محمد', username: 'ahmed', email: 'ahmed@example.com', role: 'مدير', phone: '0500000001' };
  const STATUS = {
    done: { label: 'مكتملة', cls: 'badge-green' },
    pending: { label: 'قيد الانتظار', cls: 'badge-orange' },
    rejected: { label: 'مرفوضة', cls: 'badge-red' },
    draft: { label: 'مسودة', cls: 'badge-gray' }
  };
  const transactions = [
    {
      id: 'TRX-2024-0001', type: 'تحويل مبلغ', subject: 'تحويل مبلغ مالي', date: '2024/05/20', time: '10:30 ص', from: 'شركة النور', to: 'الإدارة المالية', amount: '15,000.00', desc: 'تحويل مبلغ مالي لتغطية تكاليف المشروع', status: 'done',
      files: ['invoice.pdf', 'receipt.jpg', 'contract.docx'],
      log: [{ t: 'تم إنشاء المعاملة', by: 'أحمد محمد', at: '2024/05/20 - 10:30' }, { t: 'تم إرسال المعاملة', by: 'أحمد محمد', at: '2024/05/20 - 10:35' }, { t: 'تمت الموافقة', by: 'محمد علي', at: '2024/05/20 - 11:20' }]
    },
    {
      id: 'TRX-2024-0002', type: 'شراء أجهزة', subject: 'شراء أجهزة كمبيوتر', date: '2024/05/19', time: '09:10 ص', from: 'الإدارة المالية', to: 'شركة الأفق', amount: '42,500.00', desc: 'شراء أجهزة كمبيوتر لقسم التشغيل', status: 'pending',
      files: ['quotation.pdf'],
      log: [{ t: 'تم إنشاء المعاملة', by: 'أحمد محمد', at: '2024/05/19 - 09:10' }, { t: 'تم إرسال المعاملة', by: 'أحمد محمد', at: '2024/05/19 - 09:15' }]
    },
    {
      id: 'TRX-2024-0003', type: 'دفع فواتير', subject: 'دفع فواتير الكهرباء', date: '2024/05/18', time: '12:00 م', from: 'الإدارة المالية', to: 'مؤسسة البناء الحديث', amount: '3,200.00', desc: 'دفع فواتير الكهرباء للربع الحالي', status: 'rejected',
      files: [],
      log: [{ t: 'تم إنشاء المعاملة', by: 'أحمد محمد', at: '2024/05/18 - 12:00' }, { t: 'تم إرسال المعاملة', by: 'أحمد محمد', at: '2024/05/18 - 12:05' }, { t: 'تم رفض المعاملة', by: 'محمد علي', at: '2024/05/18 - 14:30' }]
    },
    {
      id: 'TRX-2024-0004', type: 'تعاقد', subject: 'تعاقد صيانة سنوي', date: '2024/05/17', time: '08:45 ص', from: 'الإدارة المالية', to: 'شركة الأفق', amount: '18,000.00', desc: 'عقد صيانة سنوي للمعدات', status: 'done',
      files: ['contract.docx'],
      log: [{ t: 'تم إنشاء المعاملة', by: 'أحمد محمد', at: '2024/05/17 - 08:45' }, { t: 'تم إرسال المعاملة', by: 'أحمد محمد', at: '2024/05/17 - 08:50' }, { t: 'تمت الموافقة', by: 'محمد علي', at: '2024/05/17 - 10:00' }]
    },
    {
      id: 'TRX-2024-0005', type: 'تحويل مبلغ', subject: 'تحويل راتب موظفين', date: '2024/05/16', time: '11:15 ص', from: 'الإدارة المالية', to: 'شركة النور', amount: '96,000.00', desc: 'تحويل رواتب الموظفين لشهر مايو', status: 'done',
      files: ['payroll.pdf'],
      log: [{ t: 'تم إنشاء المعاملة', by: 'أحمد محمد', at: '2024/05/16 - 11:15' }, { t: 'تم إرسال المعاملة', by: 'أحمد محمد', at: '2024/05/16 - 11:20' }, { t: 'تمت الموافقة', by: 'محمد علي', at: '2024/05/16 - 13:00' }]
    },
    {
      id: 'TRX-2024-0006', type: 'شراء أجهزة', subject: 'شراء طابعات مكتبية', date: '2024/05/21', time: '09:00 ص', from: 'الإدارة المالية', to: 'شركة الأفق', amount: '7,800.00', desc: 'شراء طابعات مكتبية لقسم الأرشفة', status: 'pending',
      files: [],
      log: [{ t: 'تم إنشاء المعاملة', by: 'أحمد محمد', at: '2024/05/21 - 09:00' }, { t: 'تم إرسال المعاملة', by: 'أحمد محمد', at: '2024/05/21 - 09:05' }]
    }
  ];
  transactions.forEach(t => { if (!t.priority) t.priority = 'normal'; });
  const PRIORITY = { normal: { label: 'عادية', cls: 'badge-gray' }, urgent: { label: 'عاجلة', cls: 'badge-red' } };
  const OVERDUE_DAYS = 3;   // معاملة قيد الانتظار تُعدّ متأخرة بعد هذا العدد من الأيام
  const users = [
    { id: 1, name: 'أحمد محمد', username: 'ahmed', email: 'ahmed@example.com', phone: '0500000001', status: 'active', role: 'مدير' },
    { id: 2, name: 'محمد علي', username: 'mohamed', email: 'mohamed@example.com', phone: '0500000002', status: 'active', role: 'موظف' },
    { id: 3, name: 'سارة خالد', username: 'sara', email: 'sara@example.com', phone: '0500000003', status: 'inactive', role: 'موظف' },
    { id: 4, name: 'علي حسين', username: 'ali', email: 'ali@example.com', phone: '0500000004', status: 'active', role: 'مراجع' }
  ];
  const param = k => new URLSearchParams(location.search).get(k);
  return {
    CURRENT_USER, STATUS, PRIORITY, OVERDUE_DAYS, transactions, users, param,
    trx: id => transactions.find(t => t.id === id),
    user: id => users.find(u => String(u.id) === String(id))
  };
})();
