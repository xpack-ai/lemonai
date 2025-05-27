import os
from dotenv import load_dotenv
import base64
from datetime import datetime
import asyncio
from browser_use.browser.browser import Browser, BrowserConfig

load_dotenv()


async def test_take_full_page_screenshot():
    browser = Browser(config=BrowserConfig(
        browser_instance_path=r"D:\soft\Google\Chrome\Application\chrome.exe",
        headless=False, disable_security=True))

    async with await browser.new_context() as context:
        page = await context.get_current_page()
        # Go to a test page
        await page.goto('https://www.google.com')

        await asyncio.sleep(3)
        # Take full page screenshot
        screenshot_b64 = await context.take_screenshot(full_page=True)
        await asyncio.sleep(3)

        # 创建screenshots目录（如果不存在）
        screenshots_dir = os.path.join(os.path.dirname(__file__), 'screenshots')
        os.makedirs(screenshots_dir, exist_ok=True)

        # 生成带时间戳的文件名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        screenshot_path = os.path.join(screenshots_dir, f'screenshot_{timestamp}.png')

        # 将base64字符串解码并保存为图片文件
        with open(screenshot_path, 'wb') as f:
            f.write(base64.b64decode(screenshot_b64))

        print(f'Screenshot saved to: {screenshot_path}')

        # Verify screenshot is not empty and is valid base64
        assert screenshot_b64 is not None
        assert isinstance(screenshot_b64, str)
        assert len(screenshot_b64) > 0

        # Test we can decode the base64 string
        try:
            base64.b64decode(screenshot_b64)
        except Exception as e:
            print(f'Error decoding base64 string: {e}')

    await browser.close()

asyncio.run(test_take_full_page_screenshot())