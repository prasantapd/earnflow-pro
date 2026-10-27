# 🚀 Render Deployment & Admin Security Guide — EarnFlow Pro

EarnFlow Pro is fully configured and ready for live production hosting on **[Render](https://render.com/)** with **zero hosting cost (100% Free)**, automatic HTTPS/SSL, and global CDN distribution.

---

## 🔒 1. Admin Access Security (সম্পূর্ণ গোপনীয়তা)

### সাধারণ ইউজারদের জন্য:
- **Navbar**: কোন Admin Panel বাটন নেই।
- **Mobile Bottom Nav**: কোন Admin ট্যাব নেই (তার বদলে Payout ট্যাব রয়েছে)।
- **Footer**: কোন Admin Control লিঙ্ক নেই।
- **Suspended Account**: কোন Resolve in Admin বাটন নেই (সরাসরি Support helpdesk দেওয়া)।
- **Matured Principal**: সাধারণ ইউজাররা শুধুমাত্র ইনভেস্টর ড্যাশবোর্ড, টাস্ক সেন্টার, ২:১ বাইনারি এবং পেআউট দেখতে পাবে।

### সাইট ওনার / অ্যাডমিনের জন্য সিক্রেট লগইন পদ্ধতি:
আপনি (অ্যাডমিন) ৩টি গোপন উপায়ে অ্যাডমিন সিকিউরিটি গেট খুলতে পারবেন:
1. **URL Parameter (সবচেয়ে সহজ)**:
   আপনার লাইভ সাইটের লিঙ্কের শেষে `?portal=admin` যোগ করুন:
   > উদাহরণ: `https://your-app.onrender.com/?portal=admin` (বা `/#admin`)
2. **Secret Triple Click**:
   টপ ন্যাভবারের লোগোর পাশে ছোট সবুজ **"PRO"** ব্যাজে পর পর ৩ বার ক্লিক করুন।
3. **Keyboard Shortcut (কম্পিউটার/ল্যাপটপে)**:
   কীবোর্ডে `Ctrl + Shift + A` (Mac এ `Cmd + Shift + A`) প্রেস করুন।

🔐 **Default Master Key / Passcode**: `admin123` (বা `earnflow@2026`)  
পাসকোড দেওয়ার পর অ্যাডমিন প্যানেল খুলে যাবে। কাজ শেষ হলে উপরে লাল **"Exit Admin Mode"** বাটনে ক্লিক করে আবার সাধারণ ইউজার মোডে ফিরে যেতে পারবেন।

---

## 🌐 2. Render এ লাইভ করার সহজ ৩টি ধাপ (Step-by-Step Live Deployment)

### ধাপ ১: GitHub এ কোড পুশ করুন (Push to GitHub)
টার্মিনালে প্রজেক্ট ফোল্ডারে রান করুন:
```bash
git init
git add .
git commit -m "EarnFlow Pro Live Production Release"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

### ধাপ ২: Render এ ডিপ্লয় করুন (Deploy on Render)

#### পদ্ধতি A (সুপার ইজি & 100% Free Forever): Static Site
1. [render.com](https://render.com) এ লগইন বা সাইন আপ করুন।
2. ড্যাশবোর্ডে উপরে ডানে **New +** বাটনে ক্লিক করে **Static Site** সিলেক্ট করুন।
3. আপনার GitHub রিপোজিটরি কানেক্ট করুন।
4. নিচের সেটিংসগুলো দিন:
   - **Name**: `earnflow-pro` (বা আপনার পছন্দের নাম)
   - **Branch**: `main`
   - **Root Directory**: ফাঁকা রাখুন (Leave blank)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. নিচে **Redirects / Rewrites** সেকশনে ক্লিক করুন:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
   *(প্রজেক্টের ভেতর `render.yaml` থাকায় ব্লুপ্রিন্ট দিয়েও ১ ক্লিকে ডিপ্লয় হতে পারে)*
6. **Create Static Site** বাটনে ক্লিক করুন!
   - ২ মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে (যেমন: `https://earnflow-pro.onrender.com`)।

---

#### পদ্ধতি B: Web Service (Node.js Express Server সহ)
প্রজেক্টে `server.js` এবং `package.json` এ `"start": "node server.js"` কনফিগার করা আছে। আপনি যদি Render এ **Web Service** সিলেক্ট করেন:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- পোর্ট স্বয়ংক্রিয়ভাবে `0.0.0.0:$PORT` এ ডিটেক্ট হবে।

---

## 📱 3. Android APK Build (Capacitor)
Android Studio দিয়ে APK তৈরি করতে:
```bash
npm run cap:sync
npx cap open android
```
Android Studio ওপেন হলে: `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
