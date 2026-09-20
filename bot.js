const mineflayer = require('mineflayer');
const express = require('express');

// Start Express web server for Render keep-alive
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('FaintedBot is running 24/7!'));
app.listen(PORT, () => console.log(`Keep-alive server listening on port ${PORT}`));

let bot = null;

function createBotInstance() {
  console.log('🛸 Connecting Fainted Bot to Mineberry...');

  bot = mineflayer.createBot({
    host: process.env.MC_HOST || 'mc.mineberry.org',
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.MC_USERNAME || 'FaintedBot',
    version: '1.8.9', // Native protocol bypasses connection timeouts & chunk bugs
    checkTimeoutInterval: 60000,
    physicsEnabled: false // Safely disables physics without crashing startup
  });

  bot.on('spawn', () => {
    console.log('👑 FaintedBot successfully joined Mineberry!');
    
    // Auto-login / register
    setTimeout(() => {
      bot.chat('/register FaintedPass123 FaintedPass123');
      bot.chat('/login FaintedPass123');
    }, 2000);
  });

  // Combat loop running on a fixed interval
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
    console.log('🔄 Bot disconnected. Reconnecting in 15 seconds...');
    setTimeout(createBotInstance, 15000);
  });

  bot.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
  });
}

createBotInstance();