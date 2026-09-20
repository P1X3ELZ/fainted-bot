const mineflayer = require('mineflayer');
const express = require('express');

// Express keep-alive server
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('FaintedBot is active!'));
app.listen(PORT, () => console.log(`Keep-alive server listening on port ${PORT}`));

let bot = null;

function createBotInstance() {
  console.log('🛸 Connecting Fainted Bot to Mineberry...');

  bot = mineflayer.createBot({
    host: process.env.MC_HOST || 'mc.mineberry.org',
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.MC_USERNAME || 'FaintedBot',
    version: '1.18.2',
    checkTimeoutInterval: 60000
  });

  // Intercept and swallow corrupt chunk/map packets from Mineberry Bungee proxy
  bot._client.on('packet', (data, metadata, buffer, fullBuffer) => {
    if (metadata.name === 'map_chunk' || metadata.name === 'unload_chunk') {
      metadata.name = 'keep_alive'; // Remap chunk packets so parser skips them
    }
  });

  // Stop physics engine from trying to check blocks below bot
  bot.physics.enabled = false;

  bot.on('spawn', () => {
    console.log('👑 FaintedBot successfully joined Mineberry!');
    
    // Auto-login / register
    setTimeout(() => {
      bot.chat('/register FaintedPass123 FaintedPass123');
      bot.chat('/login FaintedPass123');
    }, 2000);
  });

  // Custom combat target tracking (without physics engine)
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
    if (err.message && err.message.includes('managed data')) return;
    console.error('❌ Connection error:', err.message);
  });
}

createBotInstance();