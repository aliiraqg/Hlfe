// استيراد الحزم اللازمة
const express = require('express');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const cors = require('cors');
require('dotenv').config();

// إنشاء تطبيق Express
const app = express();
app.use(cors()); // تمكين CORS للسماح بالطلبات من الواجهة الأمامية
app.use(express.json()); // للسماح باستقبال JSON

// الاتصال بقاعدة بيانات MongoDB
mongoose.connect('mongodb+srv://alifakarr:Aliliwaa00@ali.wweyt.mongodb.net/?retryWrites=true&w=majority&appName=Ali', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('تم الاتصال بقاعدة البيانات MongoDB'))
  .catch(err => console.log('حدث خطأ في الاتصال بقاعدة البيانات:', err));

// نموذج المستخدم لتخزين البيانات
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

// نقطة API لحفظ أو تحديث بيانات المستخدم
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

// إعداد Telegraf للبوت
const bot = new Telegraf('7891399266:AAEDdHQbEzH42ZAZqxzgrnSnGdU2Lr1L0BI');

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

// بدء تشغيل البوت
bot.launch();
console.log('البوت يعمل...');

// تشغيل الخادم على المنفذ 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
