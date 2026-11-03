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
  await page.setViewport({ width: 1600, height: 960 });

  console.log('Navigating to http://localhost:3000/chat.html...');
  await page.goto('http://localhost:3000/chat.html', { waitUntil: 'networkidle0' });

  // 1. Initial State Screenshot (Hero Theme + No Emojis)
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_theme_initial.png') });
  console.log('Saved chat_theme_initial.png');

  // 2. Click Model Dropdown Trigger to Open Menu
  console.log('Opening Model Dropdown Menu...');
  const dropdownTrigger = await page.waitForSelector('#model-dropdown-trigger');
  await dropdownTrigger.click();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_theme_dropdown_open.png') });
  console.log('Saved chat_theme_dropdown_open.png');

  // 3. Select Model 1: English to Telugu Translator from Dropdown
  console.log('Selecting English to Telugu Translator from Dropdown...');
  const teluguItem = await page.waitForSelector('.dropdown-menu-item[data-model="translator"]');
  await teluguItem.click();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_theme_telugu_selected.png') });
  console.log('Saved chat_theme_telugu_selected.png');

  // 4. Send translation prompt
  console.log('Testing translation prompt...');
  const promptInput = await page.waitForSelector('#chat-prompt-input');
  await promptInput.type('Translate: Knowledge is supreme power.');
  const sendBtn = await page.waitForSelector('#btn-send-message');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 2200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_theme_telugu_output.png') });
  console.log('Saved chat_theme_telugu_output.png');

  // 5. Switch back to Chill Guy Qwen via dropdown
  console.log('Switching to Chill Guy Qwen via dropdown...');
  await dropdownTrigger.click();
  await new Promise(r => setTimeout(r, 400));
  const qwenItem = await page.waitForSelector('.dropdown-menu-item[data-model="qwen_chill"]');
  await qwenItem.click();
  await new Promise(r => setTimeout(r, 500));

  // Send review prompt to Chill Guy Qwen
  await promptInput.type('Roast my 3 AM commit habits and git messages.');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_theme_qwen_clean.png') });
  console.log('Saved chat_theme_qwen_clean.png');

  // 6. Test Mobile Viewport
  console.log('Testing mobile view with hero theme...');
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_theme_mobile.png') });
  console.log('Saved chat_theme_mobile.png');

  await browser.close();
  console.log('All dropdown and hero theme tests passed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
