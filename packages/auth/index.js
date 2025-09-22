// Load environment variables from .env so Prisma can read DATABASE_URL
try {
    require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
} catch (e) {
    // Fallback to default .env in project root if above fails
    try { require('dotenv').config(); } catch (_) {}
}

const { PrismaClient } = require('.prisma/client')
const bcrypt = require('bcryptjs'); 

const prisma = new PrismaClient()


// Attempt to connect early to surface DB issues in logs
prisma.$connect()
    .then(() => {
        console.log('[Prisma] Connected to database');
    })
    .catch((err) => {
        console.error('[Prisma] Failed to connect to database:', err && err.message ? err.message : err);
    });


mp.events.add('loginConnectPlayer', async (player, state, pass, age, email, gender) => {
    try {
        switch (state) {
            case 0: {
                const existing = await prisma.user.findUnique({ where: { email } });
                if (existing) {
                    player.call('updateText', ['error', 'Email deja folosit.']);
                    return;
                }
                await prisma.user.create({
                    data: {
                        password: bcrypt.hashSync(pass, 10),
                        age: parseInt(age, 10) || 0,
                        name: player.name,
                        email,
                        gender,
                        money: 1000,
                        admin: 0,
                        helper: 0,
                        level: 1
                    }
                });
                player.call('updateText', ['success', 'Cont creat cu succes!']);
                player.data.gender = gender
                player.data.money = 1000
                player.data.admin = 0
                player.data.helper = 0
                player.data.level = 1
                setTimeout(() => player.call('destroyLoginBrowser'), 2000);
                console.log(player.name)
                console.log(mp.players.length)
                player.call("activateHud", [player.name, 1000, 1, mp.players.length])
                break;
            }
            case 1: {
                const name = player.name;
                const user = await prisma.user.findFirst({ where: { name } });
                if (!user) {
                    player.call('updateText', ['error', 'Cont inexistent.']);
                    return;
                }
                if (bcrypt.compareSync(pass, user.password)) {
                    player.call('updateText', ['success', 'Autentificare reușită!']);
                player.data.gender = user.gender
                player.data.money = user.money
                player.data.admin = user.admin
                player.data.helper = user.helper
                player.data.level = user.level
                setTimeout(() => player.call('destroyLoginBrowser'), 2000);
                console.log(player.name)
                console.log(mp.players.length)
                player.call("activateHud", [player.name, user.money, user.level,mp.players.length]);
                } else {
                    player.call('updateText', ['error', 'Parola incorectă.']);
                }
                console.log(user)
                
                break;
            }
            default:
                player.call('updateText', ['error', 'Cerere invalidă.']);
        }
    } catch (err) {
        console.error('[Auth] Eroare la procesarea autentificării:', err && err.message ? err.message : err);
        try {
            player.call('updateText', ['error', 'Eroare de server. Încearcă din nou.']);
        } catch (_) {}
    }
})
