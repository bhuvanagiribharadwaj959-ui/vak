const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = '/home/blaze/.gemini/antigravity-ide/brain/8317031f-54c5-42d9-86ab-aff2a38c89e5';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 960 });

  await page.goto('http://localhost:3000/chat.html', { waitUntil: 'networkidle0' });

  // Switch to GPT-124M
  const gptCard = await page.waitForSelector('.model-option-card[data-model="gpt124m"]');
  await gptCard.click();
  await new Promise(r => setTimeout(r, 400));

  // Click PyTorch Code suggestion
  const cards = await page.$$('.suggestion-card');
  if (cards.length >= 2) {
    await cards[1].click(); // "PyTorch Code"
  } else {
    const promptInput = await page.waitForSelector('#chat-prompt-input');
    await promptInput.type('Write a PyTorch SDPA causal attention block with flash attention.');
    const sendBtn = await page.waitForSelector('#btn-send-message');
    await sendBtn.click();
  }

  // Wait 7.5s for full streaming and markdown code block rendering
  await new Promise(r => setTimeout(r, 7500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_gpt124m_complete_code.png') });
  console.log('Saved chat_gpt124m_complete_code.png');

  // Test mobile drawer toggle
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 300));
  const mobileToggle = await page.waitForSelector('#btn-toggle-mobile-drawer');
  await mobileToggle.click();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_mobile_drawer_open.png') });
  console.log('Saved chat_mobile_drawer_open.png');

  await browser.close();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
