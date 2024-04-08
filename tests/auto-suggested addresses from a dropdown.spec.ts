import { test } from '@playwright/test'

test('Access auto-suggested addresses from a dropdown through test automation', async ({ page }) => {
    await page.goto('https://www.voma.ai/');
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Try a demo' }).click();
    const page1 = await page1Promise;
    await page1.getByTestId('email').click();
    await page1.getByTestId('email').fill('cerosh@cerosh.com');
    await page1.getByTestId('phone').fill('0470225569');


    let billingInfoFrame: string = "";
    await page1.locator('#StripeAddressField').waitFor();
    try {
        const billingInfoFrameElement = await page1.waitForSelector('#StripeAddressField iframe');
        billingInfoFrame = await billingInfoFrameElement.evaluate(iframe => iframe.getAttribute('name')) || "";
    } catch (error) {
        console.error('Could not find first iFrame".', error);
    }

    const locator = page1.locator(`iframe[name="${billingInfoFrame}"]`);
    const billingInfoFrameLocator = locator.contentFrame();
    await billingInfoFrameLocator.getByLabel('First name').fill('Cerosh');
    await page1.frame(billingInfoFrame)?.fill('#Field-lastNameInput', 'jacob')
    await billingInfoFrameLocator.getByLabel('Country or region').selectOption('AU');
    await billingInfoFrameLocator.getByPlaceholder('Street address').pressSequentially('123 Pitt Street', { delay: 500 })

    const frames = page1.frames();
    let visibleFrameNames: string[] = []
    for (const frame of frames) {
        const frameName = frame.name();
        const visibleFrames = await page1.frameLocator(`iframe[name="${frameName}"]`).locator('.p-Fade-item ul').isVisible()
        if (visibleFrames) {
            visibleFrameNames.push(frameName)

        }
    }
    const addressFrameName = visibleFrameNames[1];
    const options = await page1.frameLocator(`iframe[name="${addressFrameName}"]`).locator('.p-Fade-item ul li').all();
    for (const option of options) {
        await option.dispatchEvent('click')
        break;
    }
});