const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = '/home/blaze/.gemini/antigravity-ide/brain/8317031f-54c5-42d9-86ab-aff2a38c89e5';

async function run() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:3000/chat.html...');
  await page.goto('http://localhost:3000/chat.html', { waitUntil: 'networkidle0' });

  // 1. Initial Fullscreen State Screenshot (Desktop 1920x1080)
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_fullscreen_initial.png') });
  console.log('Saved chat_fullscreen_initial.png');

  // Verify elements:
  const navbarCheck = await page.$('.site-header');
  console.log('Marketing site-header present?', navbarCheck !== null); // Should be false!

  const fullscreenAppCheck = await page.$('.chat-fullscreen-app');
  console.log('.chat-fullscreen-app present?', fullscreenAppCheck !== null); // Should be true!

  // 2. Open Model Dropdown
  console.log('Opening Model Dropdown...');
  const dropdownTrigger = await page.waitForSelector('#model-dropdown-trigger');
  await dropdownTrigger.click();
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_fullscreen_dropdown.png') });
  console.log('Saved chat_fullscreen_dropdown.png');

  // 3. Select English to Telugu Translator
  console.log('Switching to Translator...');
  const teluguItem = await page.waitForSelector('.dropdown-menu-item[data-model="translator"]');
  await teluguItem.click();
  await new Promise(r => setTimeout(r, 400));

  // 4. Send a prompt
  console.log('Sending message...');
  const promptInput = await page.waitForSelector('#chat-prompt-input');
  await promptInput.type('Translate: Knowledge is supreme power.');
  const sendBtn = await page.waitForSelector('#btn-send-message');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 2200));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_fullscreen_conversation.png') });
  console.log('Saved chat_fullscreen_conversation.png');

  // 5. Test Mobile Viewport (390x844)
  console.log('Testing Mobile Viewport...');
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_fullscreen_mobile.png') });
  console.log('Saved chat_fullscreen_mobile.png');

  // 6. Test Mobile Drawer Toggle
  console.log('Opening Mobile Drawer...');
  const mobileToggle = await page.waitForSelector('#btn-toggle-mobile-drawer');
  await mobileToggle.click();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_fullscreen_mobile_drawer.png') });
  console.log('Saved chat_fullscreen_mobile_drawer.png');

  await browser.close();
  console.log('Verification script completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
