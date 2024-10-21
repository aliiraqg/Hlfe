
console.log("Remote Changes from GitHub");
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
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

// بدء تشغيل البوت
bot.launch();
console.log('البوت يعمل...');

// تشغيل الخادم على المنفذ 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
=======
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// إعداد الخادم
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد CORS للسماح بالطلبات من الواجهة الأمامية
app.use(cors());
app.use(express.json()); // للتعامل مع البيانات بصيغة JSON

// الاتصال بقاعدة البيانات (استبدل الرابط بمعلوماتك)
const MONGO_URI = 'mongodb+srv://alifakarr:Aliliwaa00@ali.wweyt.mongodb.net/?retryWrites=true&w=majority&appName=Ali';
let db, usersCollection;

async function connectDB() {
    try {
        const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db('telegram_mini_app');  // استبدل هذا باسم قاعدة بياناتك
        usersCollection = db.collection('users');  // تعيين مجموعة "users"
        console.log('تم الاتصال بقاعدة البيانات بنجاح');
    } catch (error) {
        console.error('خطأ أثناء الاتصال بقاعدة البيانات:', error);
    }
}

connectDB();

// تحديث النقاط للمستخدم
app.post('/updatePoints', async (req, res) => {
    const { userId, points } = req.body;
    try {
        await usersCollection.updateOne({ userId: userId }, { $set: { points: points } });
        res.json({ message: 'تم تحديث النقاط بنجاح' });
    } catch (error) {
        console.error('خطأ في تحديث النقاط:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء تحديث النقاط' });
    }
});

// استرجاع النقاط للمستخدم
app.get('/getUserPoints', async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await usersCollection.findOne({ userId: userId });
        if (user) {
            res.json({ points: user.points });
        } else {
            res.status(404).json({ message: 'المستخدم غير موجود' });
        }
    } catch (error) {
        console.error('خطأ في استرجاع النقاط:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء استرجاع النقاط' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
