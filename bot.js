const mineflayer = require('mineflayer');
const express = require('express');

// Start Express web server for Render keep-alive
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('FaintedBot is active!'));
app.listen(PORT, () => console.log(`Keep-alive server listening on port ${PORT}`));

// Mineflayer bot setup
const bot = mineflayer.createBot({
  host: process.env.MC_HOST || 'mc.mineberry.org',
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.MC_USERNAME || 'FaintedBot',
  version: '1.21'
});

console.log('🛸 FAINTED BOT IS INITIALIZING...');

bot.on('spawn', () => {
  console.log('👑 FaintedBot has joined the server!');
});

// PvP loop
bot.on('physicsTick', () => {
  const target = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
  if (!target) return;

  const distance = bot.entity.position.distanceTo(target.position);
  bot.lookAt(target.position.offset(0, 1.6, 0), true);

  if (distance <= 3.5) {
    bot.setControlState('sprint', true);
    bot.setControlState('forward', true);

    if (bot.attackCooldown === 0 && distance <= 2.99) {
      bot.setControlState('sprint', false);
      bot.attack(target);
      bot.setControlState('sprint', true);
    }
  } else {
    bot.setControlState('forward', false);
  }
});

bot.on('end', () => console.log('Bot disconnected.'));
bot.on('error', err => console.error('Bot error:', err));