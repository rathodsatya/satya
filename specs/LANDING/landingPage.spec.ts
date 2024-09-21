import { landingPage } from "../../pages/landing.page";

describe('Tests for landing page of the website ranking', () => {

    it('[C62] Check that landing page is displayed to the user', () => {
        landingPage.navigateToHomePage().verifyHomePage();
    });

});
