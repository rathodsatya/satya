import allure from '@wdio/allure-reporter';
import { expect } from 'chai';
import { WDIO } from '../core/wdio';
import { AllureReporterInterface } from '../interfaces/allureReporter.interface';

export class BasePage {
    protected wd: WDIO;
    protected expect: Chai.ExpectStatic;
    protected allure: AllureReporterInterface;

    constructor() {
        this.wd = new WDIO();
        this.expect = expect;
        this.allure = allure;
    }

    /** Wait Actions **/

    waitForPageToLoad() {
        this.wd.waitForPageToLoad();
    }

    waitForWindowsCount(count: number) {
        browser.waitUntil(() => browser.getWindowHandles().length === count);
        return this;
    }

    wait(time: any) {
        browser.pause(parseInt(time) * 1000);
        return this;
    }
}
