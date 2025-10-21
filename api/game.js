import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

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
            const gameHistory = database.collection('game_history');
            
            const { action, userId, gameId, gameName, betAmount } = req.body;
            
            if (action === 'play') {
                const user = await users.findOne({ _id: new ObjectId(userId) });
                if (!user) {
                    return res.status(400).json({ success: false, message: 'User tidak ditemukan' });
                }
                
                const bet = parseInt(betAmount);
                if (user.balance < bet) {
                    return res.status(400).json({ success: false, message: 'Saldo tidak cukup' });
                }
                
                const isWin = Math.random() * 100 < 45;
                const winAmount = isWin ? Math.floor(bet * (1 + Math.random() * 4)) : 0;
                
                const newBalance = user.balance - bet + winAmount;
                await users.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { balance: newBalance } }
                );
                
                await gameHistory.insertOne({
                    userId: new ObjectId(userId),
                    username: user.username,
                    gameId,
                    gameName,
                    betAmount: bet,
                    winAmount,
                    isWin,
                    balanceBefore: user.balance,
                    balanceAfter: newBalance,
                    timestamp: new Date()
                });
                
                return res.json({
                    success: true,
                    result: {
                        isWin,
                        winAmount,
                        newBalance
                    }
                });
            }
            
            res.status(400).json({ success: false, message: 'Action tidak valid' });
            
        } catch (error) {
            console.error('Game error:', error);
            res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
