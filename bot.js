const mineflayer = require('mineflayer');
const express = require('express');

// Express keep-alive web server
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('FaintedBot is running 24/7!'));
app.listen(PORT, () => console.log(`Keep-alive server listening on port ${PORT}`));

let bot = null;

function createBotInstance() {
  console.log('🛸 Connecting Fainted Bot to Mineberry...');

  bot = mineflayer.createBot({
    host: 'mc.mineberry.org',
    port: 25565,
    username: process.env.MC_USERNAME || 'FaintedBot',
    version: '1.18.2',
    physicsEnabled: false, // Prevents engine movement packets from triggering ECONNRESET
    checkTimeoutInterval: 120000
  });

  bot.on('login', () => {
    console.log('🔑 Logged into proxy! Registering / Logging in...');
    setTimeout(() => {
      bot.chat('/register FaintedPass123 FaintedPass123');
      bot.chat('/login FaintedPass123');
    }, 1500);

    setTimeout(() => {
      console.log('⚔️ Transferring to KitPvP sub-server...');
      bot.chat('/server pvp');
    }, 3500);
  });

  bot.on('spawn', () => {
    console.log('👑 FaintedBot successfully joined sub-server!');
  });

  // Combat loop
  setInterval(() => {
    if (!bot || !bot.entity) return;
    const target = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
    if (!target) return;

    const distance = bot.entity.position.distanceTo(target.position);
    bot.lookAt(target.position.offset(0, 1.6, 0), true);

    if (distance <= 3.5) {
      bot.setControlState('sprint', true);
      bot.setControlState('forward', true);

      if (bot.attackCooldown === 0 && distance <= 2.99) {
        bot.attack(target);
      }
    } else {
      bot.setControlState('forward', false);
    }
  }, 50);

  bot.on('kicked', (reason) => {
    console.log('⚠️ Bot was kicked:', reason);
  });

  bot.on('end', () => {
    console.log('🔄 Disconnected. Reconnecting in 15 seconds...');
    setTimeout(createBotInstance, 15000);
  });

  bot.on('error', (err) => {
    // Suppress datacenter socket resets to prevent rapid reconnect spam
    if (err.code === 'ECONNRESET' || err.message.includes('ECONNRESET')) {
      return;
    }
    console.error('❌ Connection error:', err.message);
  });
}

createBotInstance();