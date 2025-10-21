import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function sendTelegramNotification(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
        console.log('Telegram credentials not set');
        return;
    }

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Telegram error:', error);
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            await client.connect();
            const database = client.db('menang888');
            const users = database.collection('users');
            
            const { action, username, password, email, phone } = req.body;
            
            if (action === 'register') {
                const existingUser = await users.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({ success: false, message: 'Username sudah terdaftar' });
                }
                
                const newUser = {
                    username,
                    password,
                    email,
                    phone,
                    balance: 0,
                    totalDeposit: 0,
                    totalWithdraw: 0,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    status: 'active',
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                };
                
                const result = await users.insertOne(newUser);
                
                await sendTelegramNotification(
                    `🆕 <b>USER BARU DAFTAR!</b>\n\n` +
                    `👤 <b>Username:</b> ${username}\n` +
                    `📧 <b>Email:</b> ${email}\n` +
                    `📱 <b>Phone:</b> ${phone}\n` +
                    `🆔 <b>User ID:</b> ${result.insertedId}\n` +
                    `📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
                    `🌐 <b>IP:</b> ${newUser.ip}\n\n` +
                    `🎉 Selamat datang di MENANG888!`
                );
                
                return res.json({ 
                    success: true, 
                    message: 'Registrasi berhasil!',
                    user: {
                        id: result.insertedId,
                        username: newUser.username,
                        balance: newUser.balance,
                        totalDeposit: newUser.totalDeposit,
                        totalWithdraw: newUser.totalWithdraw
                    }
                });
            }
            
            if (action === 'login') {
                const user = await users.findOne({ username, password });
                if (!user) {
                    return res.status(400).json({ success: false, message: 'Username atau password salah' });
                }
                
                await users.updateOne(
                    { username }, 
                    { $set: { 
                        lastLogin: new Date(),
                        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                    } }
                );
                
                await sendTelegramNotification(
                    `🔐 <b>USER LOGIN</b>\n\n` +
                    `👤 <b>Username:</b> ${user.username}\n` +
                    `💰 <b>Balance:</b> Rp ${user.balance.toLocaleString('id-ID')}\n` +
                    `📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
                    `🌐 <b>IP:</b> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`
                );
                
                return res.json({ 
                    success: true, 
                    user: {
                        id: user._id,
                        username: user.username,
                        balance: user.balance,
                        totalDeposit: user.totalDeposit,
                        totalWithdraw: user.totalWithdraw
                    }
                });
            }
            
            res.status(400).json({ success: false, message: 'Action tidak valid' });
            
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
