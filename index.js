// استيراد الحزم اللازمة
const express = require('express');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const cors = require('cors');
require('dotenv').config();

mongoose.set('strictQuery', true);  // لمنع تحذير strictQuery

// إنشاء تطبيق Express
const app = express();
app.use(cors()); // تمكين CORS للسماح بالطلبات من الواجهة الأمامية
app.use(express.json()); // للسماح باستقبال JSON

// الاتصال بقاعدة بيانات MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('تم الاتصال بقاعدة البيانات MongoDB'))
  .catch(err => console.log('حدث خطأ في الاتصال بقاعدة البيانات:', err));

// مسار افتراضي لمعالجة الطلبات إلى الصفحة الرئيسية "/"
app.get('/', (req, res) => {
  res.send('الخادم يعمل بنجاح!');  // رسالة عند زيارة الصفحة الرئيسية
});

// نقطة API لحفظ أو تحديث بيانات المستخدم
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // معرف المستخدم من Telegram
  first_name: String,
  last_name: String,
  username: String,
  points: { type: Number, default: 0 }, // النقاط
  level: { type: Number, default: 1 },  // المستوى
  tasks: { type: Array, default: [] }   // المهام
});

const User = mongoose.model('User', UserSchema);

app.post('/save-user-data', async (req, res) => {
  try {
    const { id, first_name, last_name, username, points, level, tasks } = req.body;

    // تحقق مما إذا كان المستخدم موجودًا بالفعل
    let user = await User.findOne({ id });
    if (!user) {
      // إنشاء مستخدم جديد إذا لم يكن موجودًا
      user = new User({ id, first_name, last_name, username, points, level, tasks });
      await user.save();
      res.status(200).json({ message: 'تم إضافة المستخدم وحفظ بياناته بنجاح' });
    } else {
      // تحديث بيانات المستخدم إذا كان موجودًا
      user.points = points || user.points;
      user.level = level || user.level;
      user.tasks = tasks || user.tasks;
      await user.save();
      res.status(200).json({ message: 'تم تحديث بيانات المستخدم بنجاح' });
    }
  } catch (error) {
    console.error('حدث خطأ أثناء حفظ بيانات المستخدم:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حفظ البيانات' });
  }
});

// إعداد Telegraf للبوت باستخدام Long Polling (لـ Termux)
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('مرحباً! اضغط على الزر لفتح تطبيق الويب:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'افتح التطبيق', web_app: { url: 'https://tatle-xsll.vercel.app' } }]
        ]
      }
    }
  );
});

// إذا كانت بيئة التشغيل ليست Vercel (يعني أنك تستخدم Termux) نستخدم Long Polling
if (!process.env.VERCEL) {
  bot.launch();  // تشغيل البوت باستخدام Long Polling في بيئات مثل Termux
  console.log('البوت يعمل باستخدام Long Polling...');
} else {
  console.log('يتم تشغيل الخادم بدون البوت في Vercel.');
}

// تشغيل الخادم على المنفذ 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
