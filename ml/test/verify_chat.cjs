const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = '/home/blaze/.gemini/antigravity-ide/brain/8317031f-54c5-42d9-86ab-aff2a38c89e5';

async function run() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 960 });

  console.log('Navigating to http://localhost:3000/chat.html...');
  await page.goto('http://localhost:3000/chat.html', { waitUntil: 'networkidle0' });

  // 1. Initial State
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_step1_initial.png') });
  console.log('Saved chat_step1_initial.png');

  // 2. Test Model 3: Chill Guy Qwen - Click first suggestion
  console.log('Testing Chill Guy Qwen suggestion...');
  const suggestion1 = await page.waitForSelector('.suggestion-card');
  await suggestion1.click();
  await new Promise(r => setTimeout(r, 3800));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_step2_qwen_response.png') });
  console.log('Saved chat_step2_qwen_response.png');

  // 3. Switch to Model 1: English to Telugu Translator
  console.log('Switching to English to Telugu Translator...');
  const translatorCard = await page.waitForSelector('.model-option-card[data-model="translator"]');
  await translatorCard.click();
  await new Promise(r => setTimeout(r, 600));

  // Type translation prompt in prompt input
  const promptInput = await page.waitForSelector('#chat-prompt-input');
  await promptInput.type('Translate: Knowledge is supreme power.');
  const sendBtn = await page.waitForSelector('#btn-send-message');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_step3_telugu_translator.png') });
  console.log('Saved chat_step3_telugu_translator.png');

  // 4. Switch to Model 2: GPT-124M Parameters
  console.log('Switching to GPT-124M Parameters...');
  const gptCard = await page.waitForSelector('.model-option-card[data-model="gpt124m"]');
  await gptCard.click();
  await new Promise(r => setTimeout(r, 600));

  // Type GPT prompt
  await promptInput.type('Write a PyTorch SDPA causal attention block with flash attention.');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 5500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_step4_gpt124m_code.png') });
  console.log('Saved chat_step4_gpt124m_code.png');

  // 5. Test New Chat button
  console.log('Testing New Chat creation...');
  const newChatBtn = await page.waitForSelector('#btn-create-new-chat');
  await newChatBtn.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_step5_new_chat.png') });
  console.log('Saved chat_step5_new_chat.png');

  // 6. Mobile Responsiveness Test
  console.log('Testing Mobile Viewport...');
  await page.setViewport({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_step6_mobile.png') });
  console.log('Saved chat_step6_mobile.png');

  // Open mobile drawer
  const mobileToggle = await page.waitForSelector('#btn-toggle-mobile-drawer');
  await mobileToggle.click();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'chat_step7_mobile_drawer.png') });
  console.log('Saved chat_step7_mobile_drawer.png');

  await browser.close();
  console.log('All chat interface tests finished successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
