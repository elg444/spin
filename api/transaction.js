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
            const transactions = database.collection('transactions');
            
            const { action, userId, username, amount, method, phone } = req.body;
            
            if (action === 'deposit') {
                const transaction = {
                    userId: new ObjectId(userId),
                    username,
                    type: 'deposit',
                    amount: parseInt(amount),
                    method,
                    phone,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                await transactions.insertOne(transaction);
                
                await sendTelegramNotification(
                    `💰 <b>PERMINTAAN DEPOSIT!</b>\n\n` +
                    `👤 <b>User:</b> ${username}\n` +
                    `💳 <b>Method:</b> ${method}\n` +
                    `📱 <b>Phone:</b> ${phone}\n` +
                    `💵 <b>Amount:</b> Rp ${parseInt(amount).toLocaleString('id-ID')}\n` +
                    `📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
                    `🆔 <b>Trx ID:</b> ${transaction._id}\n\n` +
                    `⚠️ <b>BUTUH KONFIRMASI ADMIN!</b>`
                );
                
                return res.json({ 
                    success: true, 
                    message: 'Permintaan deposit berhasil. Menunggu konfirmasi admin.',
                    transactionId: transaction._id
                });
            }
            
            if (action === 'withdraw') {
                const user = await users.findOne({ _id: new ObjectId(userId) });
                if (!user) {
                    return res.status(400).json({ success: false, message: 'User tidak ditemukan' });
                }
                
                if (user.balance < parseInt(amount)) {
                    return res.status(400).json({ success: false, message: 'Saldo tidak cukup' });
                }
                
                const transaction = {
                    userId: new ObjectId(userId),
                    username,
                    type: 'withdraw',
                    amount: parseInt(amount),
                    method,
                    phone,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                await transactions.insertOne(transaction);
                
                await sendTelegramNotification(
                    `💸 <b>PERMINTAAN WITHDRAW!</b>\n\n` +
                    `👤 <b>User:</b> ${username}\n` +
                    `💳 <b>Method:</b> ${method}\n` +
                    `📱 <b>Phone:</b> ${phone}\n` +
                    `💵 <b>Amount:</b> Rp ${parseInt(amount).toLocaleString('id-ID')}\n` +
                    `📅 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n` +
                    `🆔 <b>Trx ID:</b> ${transaction._id}\n\n` +
                    `⚠️ <b>BUTUH KONFIRMASI ADMIN!</b>`
                );
                
                return res.json({ 
                    success: true, 
                    message: 'Permintaan withdraw berhasil. Menunggu konfirmasi admin.',
                    transactionId: transaction._id
                });
            }
            
            res.status(400).json({ success: false, message: 'Action tidak valid' });
            
        } catch (error) {
            console.error('Transaction error:', error);
            res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
