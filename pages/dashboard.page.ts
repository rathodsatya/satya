import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
    constructor() {
        super();
    }

    /** locators **/

    defaultLinkButton(link: string): string {
        return `//a[@id='dynamicLink' and text()='${link}']`;
    }

    /** actions **/

    clickOnDefaultSearchLink(link: string) {
        this.allure.startStep(`Click on ${link} button`);
        this.wd.click(this.defaultLinkButton(link));
        this.allure.endStep();
        return this;
    }

    verifyDashboardPage(text = 'Dashboard') {
        this.allure.startStep(`Verify that "${text}" page is displayed to the user.`);

        this.wd.waitForPageToLoad();
        const currentUrl = browser.getUrl();

        this.expect(
            currentUrl.includes(text.toLowerCase()),
            `"${text}" should be included in the URL "${currentUrl}"`
        ).to.be.true;

        this.allure.endStep();
        return this;
    }
}
export const dashboardPage = new DashboardPage();
