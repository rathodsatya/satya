import { dashboardPage } from "../../pages/dashboard.page";
import { landingPage } from "../../pages/landing.page";

describe('Dashboard UI tests', () => {

    it('[C63] Check that user is able to check ranking for default weblinks', () => {
        landingPage.navigateToHomePage().verifyHomePage();
        dashboardPage.clickOnDefaultSearchLink('youtube.com').verifyDashboardPage();
    });

});
