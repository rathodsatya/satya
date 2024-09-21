import { BasePage } from "./base.page";

export class LandingPage extends BasePage {
    constructor() {
        super();
    }

    /** locators **/

    bannerSection(): string {
        return `//section[@class='bannerSection']`
    }

    titleElement(title: string): string {
        return `${this.bannerSection()}//div[@class='container']//h1[normalize-space(text())='${title}']`;
    }

    /** actions **/

    waitForLandingPageToBeLoaded() {
        this.wd.waitForPageToLoad();
        this.wait(1);
        return this;
    }

    navigateToHomePage() {
        this.allure.startStep(`Navigate to the "${process.env.BASE_URL}$" page`);
        this.wd.open(`${process.env.BASE_URL}`);
        try {
            this.waitForLandingPageToBeLoaded();
        }
        catch (e) {
            const screenShot = browser.takeScreenshot();
            const image = Buffer.from(screenShot, 'base64');
            this.allure.addAttachment('screenshot', image, 'image/png');
            throw new Error(e);
        }
        this.allure.endStep();
        return this;
    }

    verifyHomePage(text = 'Is your website') {
        this.allure.startStep(`Verify that landing page is being displayed.`);
        this.wd.waitForText(this.titleElement(text), text, 30000);
        this.allure.endStep();
        return this;
    }

}
export const landingPage = new LandingPage();
