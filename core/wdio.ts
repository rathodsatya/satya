/* eslint-disable @typescript-eslint/ban-ts-comment */
import path = require('path');
import fs = require('fs');

export class WDIO {
    public get defaultWaitTime(): number {
        return browser.options.waitforTimeout;
    }

    /** actions **/

    open(path: string) {
        browser.url(path);
    }

    refresh() {
        browser.refresh();
    }

    reload() {
        browser.reloadSession();
    }

    selectFromDropDown(dropdownSelector: string, itemSelector: string) {
        this.click(dropdownSelector);
        browser.pause(500);
        this.click(itemSelector);
    }

    clearFilledText(selector: string) {
        this.selectText(selector);
        this.pressBackspace();
    }

    customClick(selector: string) {
        browser.execute(`arguments[0].click()`, $(selector));
    }

    focusElement(selector: string) {
        browser.execute(`arguments[0].focus()`, $(selector));
    }

    switchToWindowByUrlOrTitle(windowTitle: string) {
        browser.switchWindow(windowTitle);
    }

    switchToSecondWindow() {
        const actualWindow = browser.getWindowHandle();
        const allWindows = browser.getWindowHandles();
        const index = allWindows.indexOf(actualWindow);
        allWindows.splice(index, 1);
        browser.switchToWindow(allWindows[0]);
    }

    closeOtherWindows() {
        const windows = browser.getWindowHandles();
        windows.forEach((w, i) => {
            if (i !== 0) {
                browser.switchToWindow(windows[i]);
                browser.closeWindow();
            }
        });
    }

    selectText(selector: string) {
        this.click(selector);
        browser.execute(`document.execCommand("selectall",null,false);`);
        this.pause(300);
    }

    pressBackspace() {
        browser.keys('Backspace');
    }

    pressEscape() {
        browser.keys('Escape');
        this.pause(300);
    }

    pressEnter() {
        browser.keys('Enter');
    }

    pressTab() {
        browser.keys('Tab');
    }

    pressKey(key: string) {
        browser.keys(key);
    }

    sendValue(value: string, field: string) {
        this.click(field);
        browser.keys(value);
    }

    executeScrollDown() {
        browser.execute('document.documentElement.scrollTop = document.body.scrollTop = 1000000000');
    }

    scrollDown() {
        this.executeScrollDown();
        this.pause(300);
        this.executeScrollDown();
    }

    clearAndFill(selector: string, value: string) {
        try {
            this.click(selector);
            this.pause(150);
            this.selectText(selector);
            this.pressBackspace();
            $(selector).setValue(value);
        } catch (e) {
            console.log('ELEMENT ERROR\n', selector);
            $(selector).click();
            this.clearFilledText(selector);
            value.split('').forEach((value) => {
                $(selector).addValue(value);
            });
        }
    }


    browserFill(selector: string, value: string) {
        try {
            this.click(selector);
            this.pause(150);
            this.selectText(selector);
            this.pressBackspace();
            $(selector).keys(value);
        } catch (e) {
            console.log('ELEMENT ERROR\n', selector);
            $(selector).click();
            this.clearFilledText(selector);
            value.split('').forEach((value) => {
                $(selector).addValue(value);
            });
        }
    }


    addValue(value: string, selector: string, withWait = false, waitTime = 300) {
        value.split('').forEach((value) => {
            $(selector).addValue(value);
            if (withWait) browser.pause(waitTime);
        });
    }

    sendKeys(selector: string, value: string) {
        const elementId = this.getElementId(selector);
        browser.elementSendKeys(elementId, value);
    }

    pasteValueFromClipboard(selector: string) {
        $(selector).addValue(['Control', 'v']);
    }

    setValue(selector: string, value: string, clickBeforeSetValue = true, timeout = this.defaultWaitTime) {
        this.waitForEnabled(selector, timeout);
        if (clickBeforeSetValue) {
            $(selector).click();
        }
        $(selector).setValue(value);
    }

    clickUntilBecomesClickable(selector: string, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        this.waitForEnabled(selector, timeout);
        let state = false;
        for (let i = 0; i < 10; i++) {
            if (!state) {
                try {
                    $(selector).click();
                    state = true;
                } catch (e) {
                    state = false;
                }
            }
        }
    }

    scrollIntoView(selector: string, timeout = 60000) {
        $(selector).waitForExist({ timeout });
        $(selector).scrollIntoView();
    }

    click(selector: string, customClick = false, timeout = this.defaultWaitTime) {
        this.waitForClickable(selector, timeout);
        if (!customClick) {
            this.waitForVisible(selector, timeout);
            this.waitForEnabled(selector, timeout);
        }
        if (customClick) {
            this.customClick(selector);
        } else {
            return $(selector).click();
        }
    }

    doubleClick(selector: string, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        this.waitForEnabled(selector, timeout);
        $(selector).doubleClick();
    }

    pause(pauseTime: number) {
        browser.pause(pauseTime);
    }

    setDropDownValue(selector: string, value: string, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        this.waitForEnabled(selector, timeout);
        return $(selector).selectByAttribute('value', value);
    }

    setDropDownValueByText(selector: string, text: string, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        this.waitForEnabled(selector, timeout);
        return $(selector).selectByVisibleText(text);
    }

    switchToFrame(selector: string) {
        $(selector).waitForDisplayed();
        const element = $(selector);
        return browser.switchToFrame(element);
    }

    closeFrame() {
        return browser.switchToFrame(null);
    }

    openNewWindow(url: string) {
        return browser.newWindow(url);
    }

    reloadSessionAndRefresh() {
        browser.reloadSession();
        browser.refresh();
    }

    switchWindow(urlOrTitleToMatchOrHandle: string) {
        if (urlOrTitleToMatchOrHandle.includes('http')) {
            browser.switchWindow(urlOrTitleToMatchOrHandle);
        } else {
            browser.switchToWindow(urlOrTitleToMatchOrHandle);
        }
    }

    deleteAllCookies() {
        browser.deleteAllCookies();
    }

    scrollToElement(selector: string, timeout = this.defaultWaitTime) {
        this.scrollDown();
        $(selector).waitForExist({ timeout });
        $(selector).scrollIntoView();
        this.pause(300);
    }

    horizontalScrollToElement(selectorToBeVisible: string, scrolledTableSelector: string) {
        let i = 0;
        const fullScrollWidth = Number(this.getAttribute(scrolledTableSelector, 'scrollWidth'));
        while (this.isElementVisible(selectorToBeVisible) === false && i < 2) {
            browser.execute(
                function (selector, fullScrollWidth: number) {
                    const element = selector.match(/\/|\(/g)
                        ? document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                        : document.querySelector(selector);
                    //@ts-ignore
                    element.scrollLeft += fullScrollWidth / 2;
                },
                scrolledTableSelector,
                fullScrollWidth
            );
            i++;
        }
    }

    clickOutsideElement(selector: string, x = 500, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        this.waitForEnabled(selector, timeout);
        return $(selector).click({ x });
    }

    clearLocalStorage() {
        browser.execute('window.sessionStorage.clear(); window.localStorage.clear();');
    }

    clickByCoordinates(selector: string, x = 0, y = 0, timeout = this.defaultWaitTime, waitForElement = true) {
        if (waitForElement) {
            this.waitForVisible(selector, timeout);
            this.waitForEnabled(selector, timeout);
        }
        return $(selector).click({ x: x, y: y });
    }

    back() {
        browser.back();
    }

    moveToElement(selector: string, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        this.waitForEnabled(selector, timeout);
        return $(selector).moveTo();
    }

    switchToWindowHandle(windowCount: number) {
        const handles = browser.getWindowHandles();
        browser.switchToWindow(handles[windowCount]);
    }

    setCssAtribute(selector: string, property: string, value: string) {
        browser.execute(`arguments[0].setAttribute("${property}", "${value}");`, $(`${selector}`));
    }

    switchToWindowByName(windowName: string) {
        const handles = browser.getWindowHandles();
        for (const handle of handles) {
            browser.switchToWindow(handle);
            const currentWindowName = browser.getTitle();
            if (currentWindowName === windowName) break;
        }
    }

    switchToWindowWithLink(link: string) {
        const handles = browser.getWindowHandles();
        for (const handle of handles) {
            browser.switchToWindow(handle);
            const currentWindowURL = browser.getUrl();
            if (currentWindowURL.includes(link)) break;
        }
        return this;
    }

    setWindowSize(width: number, height: number) {
        browser.setWindowSize(width, height);
    }

    fileUpload(fileName: string, selector = 'input[type="file"]', timeout: number = this.defaultWaitTime) {
        const correctPath = path.join(__dirname.replace(path.normalize('core'), ''), path.normalize('/testData/files') + `/${fileName}`);
        $(selector).waitForExist({ timeout });
        this.scrollToElement(selector);
        this.removeAttribute(selector);
        try {
            browser.execute(
                `arguments[0].setAttribute("style", "display: block !important");`,
                $(`div[class*="drag-and-drop-file-input"]>div[class*="root"]`)
            );
        } catch (error) {
            /* empty */
        }

        try {
            // browser.execute(
            //     `arguments[0].setAttribute("style", "display: block !important");`,
            //     $(`div[class*="MuiFormControl-root MuiTextField-root"]`)
            // );

            const elements = $$('div[class*="MuiFormControl-root MuiTextField-root"]');
            for (const element of elements) {
                browser.execute(
                    `arguments[0].setAttribute("style", "display: block !important");`,
                    element
                );
            }

        } catch (error) {
            console.log(error);
            /* empty */
        }
        browser.execute(`arguments[0].setAttribute("style", "display: block !important");`, $(selector));
        this.setValue(selector, correctPath, false);
    }

    removeAttribute(selector: string, attribute = 'class') {
        browser.execute(`arguments[0].removeAttribute("${attribute}");`, $(selector));
    }

    closeCurrentWindow() {
        browser.closeWindow();
    }

    dragAndDrop(selector: string, destinationSelector: string, duration = 1000) {
        this.waitForElement(selector);
        $(selector).dragAndDrop($(destinationSelector), { duration: duration });
    }

    dragAndDropCoordinates(selector: string, destinationX: number, destinationY: number) {
        this.waitForElement(selector);
        $(selector).dragAndDrop({ x: destinationX, y: destinationY }, { duration: 1000 });
    }

    dragAndDropCustom(selector: string, destinationSelector: string, offset = 0) {
        $(selector).moveTo();
        browser.buttonDown(0);
        $(destinationSelector).moveTo({ xOffset: offset, yOffset: 0 });
        browser.buttonUp(0);
    }

    customDragNDrop(baseSelector: string, destinationSelector: string) {
        $(baseSelector).moveTo();
        browser.buttonDown(0);
        browser.pause(2000);
        $(destinationSelector).moveTo();
        browser.pause(2000);
        browser.buttonUp(0);
        browser.pause(2000);
    }

    maximizeWindow() {
        browser.maximizeWindow();
    }

    scrollToTop() {
        browser.execute('window.scroll(0,0);');
    }

    clearSiteDataAndRefresh() {
        browser.reloadSession();
        browser.url('');
    }

    clearValue(selector: string) {
        $(selector).clearValue();
    }

    clickOnElementById(selector: string, timeout = this.defaultWaitTime) {
        this.waitForDisplayed(selector, false, timeout);
        browser.elementClick($(selector).elementId);
    }

    interactWithCheckbox(checkbox: string, action: string) {
        const state = this.getAttribute(checkbox, 'class').includes('checked');
        if ((state && action === 'Uncheck') || (!state && action === 'Check')) {
            this.click(checkbox);
        }
    }

    toTitleCase(text: string): string {
        return text
            .split(' ')
            .map((i) => i[0].toUpperCase() + i.substring(1).toLowerCase())
            .join(' ');
    }

    /** Wait Actions **/

    waitForText(selector: string, text: string, timeout = 5000, reverse = false) {
        try {
            browser.waitUntil(
                () => (reverse ? this.getText(selector, false, timeout) !== text : this.getElementText(selector) === text),
                { timeout }
            );
        } catch (e) {
            console.log(`The '${text}' text still not presented got '${$(selector).getText()}'`);
        }
    }

    waitForElementContainsText(selector: string, text: string, timeout = this.defaultWaitTime) {
        try {
            browser.waitUntil(() => $(selector).getText().includes(text), { timeout });
        } catch (e) {
            console.log(`The '${text}' text still not presented got '${$(selector).getText()}'`);
        }
    }

    waitForCss(selector: string, cssProperty: string, expectedValue: string, timeout = this.defaultWaitTime) {
        this.waitForElement(selector);
        browser.waitUntil(() => $(selector).getCSSProperty(cssProperty).value === expectedValue, {
            timeout
        });
    }

    waitForElement(selector: string, timeout = this.defaultWaitTime, waitForEnabled = true) {
        $(selector).waitForExist({ timeout });
        $(selector).waitForDisplayed({ timeout });
        if (waitForEnabled) $(selector).waitForEnabled({ timeout });
    }

    waitForDisplayed(selector: string, reverse = false, timeout = this.defaultWaitTime) {
        browser.waitUntil(
            function () {
                const elementValue = $(selector).isDisplayed();
                if (typeof elementValue === 'object') {
                    if (!Object.values(elementValue)[0]) {
                        throw new Error(
                            `type of ${selector} is ${typeof elementValue}. element value should be boolean but got - ${elementValue}. Failed on waitForDisplayed method. IE specific error`
                        );
                    }
                    // @ts-ignore
                    return browser.isElementDisplayed(Object.values(elementValue)[0]);
                }
                return elementValue === !reverse;
            },
            {
                timeout,
                timeoutMsg: `${selector} - still${!reverse ? ' not' : ''} displayed after ${timeout}ms`
            }
        );
    }

    waitForVisible(selector: string, timeout = this.defaultWaitTime) {
        return browser.waitUntil(
            () => {
                try {
                    return $(selector).isDisplayed();
                } catch (e) {
                    return false;
                }
            },
            { timeout, timeoutMsg: `${selector} still not displayed after ${timeout}ms` }
        );
    }

    waitForExists(selector: string, reverse = false, timeout = this.defaultWaitTime) {
        return $(selector).waitForExist({ timeout, reverse });
    }

    waitForClickable(selector: string, timeout = this.defaultWaitTime) {
        return browser.waitUntil(() => $(selector).isClickable(), {
            timeout,
            timeoutMsg: `element with ${selector} selector still not clickable after ${timeout} ms`
        });
    }

    waitForInVisible(selector: string, timeout = this.defaultWaitTime) {
        return browser.waitUntil(
            () => {
                try {
                    return $(selector).isDisplayed() === false;
                } catch (e) {
                    return false;
                }
            },
            { timeout, timeoutMsg: `Element ${selector} still displayed after ${timeout}` }
        );
    }

    waitForEnabled(selector: string, timeout = this.defaultWaitTime) {
        $(selector).waitForEnabled({ timeout });
    }

    waitForExist(selector: string, timeout = this.defaultWaitTime) {
        return $(selector).waitForExist({ timeout });
    }

    waitForInputHasValue(selector: string, reverse = false) {
        this.waitForElement(selector);
        try {
            browser.waitUntil(function () {
                const value = $(selector).getValue();
                return reverse ? value == '' : value !== '';
            });
        } catch (e) {
            /* empty */
        }
    }

    waitForExactValue(selector: string, value: string, timeout: number = this.defaultWaitTime) {
        try {
            browser.waitUntil(
                () => {
                    return $(selector).getValue() == value;
                },
                { timeout }
            );
        } catch (e) {
            throw new Error(`"${value}" value is not displayed in element with "${selector}" selector after ${timeout} ms`);
        }
    }

    waitForElementHasText(selector: string, text?: string, timeout = this.defaultWaitTime) {
        this.waitForElement(selector, timeout);
        try {
            browser.waitUntil(
                () => {
                    const elemText = $(selector).getText();
                    return text ? elemText == text : elemText !== '';
                },
                { timeout }
            );
        } catch (e) {
            throw new Error(`"${text}" text is not displayed in element with "${selector}" selector`);
        }
    }

    waitForPageToLoad() {
        try {
            browser.waitUntil(
                function () {
                    return browser.execute(`return document.readyState === 'complete'`);
                },
                { timeout: 90000 }
            );
        } catch (e) {
            console.log('Page is not loaded');
        }
    }

    waitForSelected(selector: string, timeout = this.defaultWaitTime) {
        browser.waitUntil(() => $(selector).isSelected() === true, {
            timeout,
            timeoutMsg: `"${selector}" element is not selected after ${timeout}`
        });
    }

    waitForUnselected(selector: string, timeout = this.defaultWaitTime) {
        browser.waitUntil(() => $(selector).isSelected() === false, {
            timeout,
            timeoutMsg: `"${selector}" element is not unselected after ${timeout}`
        });
    }

    waitForDisabled(selector: string, timeout = this.defaultWaitTime) {
        browser.waitUntil(() => $(selector).isEnabled() === false, {
            timeout,
            timeoutMsg: `"${selector}" element is not disabled after ${timeout}`
        });
    }

    waitUntil(func, timeout = this.defaultWaitTime) {
        browser.waitUntil(() => func), { timeout };
    }

    waitForElementHasAttribute(
        selector: string,
        attribute: string,
        value: string,
        timeout = this.defaultWaitTime,
        reverse = false
    ) {
        browser.waitUntil(
            () =>
                reverse
                    ? !this.getAttribute(selector, attribute).includes(value)
                    : this.getAttribute(selector, attribute).includes(value),
            {
                timeout,
                timeoutMsg: `"${value}" value still not displayed after in the ${attribute} after ${timeout}, got "${this.getAttribute(
                    selector,
                    attribute
                )}"`
            }
        );
    }

    waitForUrlToHasText(text: string, timeout = this.defaultWaitTime) {
        browser.waitUntil(() => browser.getUrl().includes(text), {
            timeout,
            timeoutMsg: `"${text}" still not displayed after in the URL after ${timeout}`
        });
    }

    waitForFileToBePresent(path, timeout = this.defaultWaitTime) {
        browser.waitUntil(() => fs.existsSync(path), {
            timeout: timeout,
            timeoutMsg: `File was not found by "${path}" path`
        });
    }

    /** Getters **/

    getCssProperty(selector: string, cssProperty: string, timeout = this.defaultWaitTime) {
        this.waitForElement(selector, timeout);
        return $(selector).getCSSProperty(cssProperty).value;
    }

    elements(selector: string, timeout = this.defaultWaitTime): WebdriverIO.ElementArray {
        try {
            this.waitForElement(selector, timeout);
        } catch (e) {
            /* empty */
        }
        return $$(selector);
    }

    getArrayOfValues(selector: string, replaceWord = '') {
        const array = [];
        $$(selector).forEach((elem) => {
            array.push(elem.getText().replace(replaceWord, ''));
        });
        return array;
    }

    getElementAttributeViaQuerySelector(selector: string, attribute: string): string {
        return browser.execute(
            function (selector, attribute) {
                const element = selector.match(/\/|\(/g)
                    ? document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                    : document.querySelector(selector);
                return element.parentElement.getAttribute(attribute);
            },
            selector,
            attribute
        );
    }

    getAttributeByName(selector: string, attribute: string, waitForEnabled = true) {
        if (waitForEnabled) this.waitForElement(selector);
        return $(selector).getAttribute(attribute);
    }

    getElementId(selector: string) {
        let elementId: string = null;
        browser.waitUntil(
            () => {
                elementId = $(selector).elementId;
                return elementId !== undefined;
            },
            { timeout: 6000 }
        );
        return elementId;
    }

    getValueByScript(selector: string) {
        return browser.execute(`arguments[0].value`, $(selector));
    }

    getLocation(selector: string, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        return $(selector).getLocation();
    }

    getText(selector: string, waitForDisplayed = true, timeout = this.defaultWaitTime) {
        if (waitForDisplayed) {
            this.waitForVisible(selector, timeout);
        }
        return $(selector).getText();
    }

    getHTML(selector = 'html', include = true) {
        return $(selector).getHTML(include);
    }

    getValue(selector: string) {
        return $(selector).getValue();
    }

    getElementText(selector: string): string {
        return this.getText(selector) || this.getValue(selector);
    }

    getAttribute(selector: string, attribute: string) {
        return $(selector).getAttribute(attribute);
    }

    getUrl() {
        return browser.getUrl();
    }

    getLastWindowId(initialWindows: Array<string>): string {
        // should be applied after opening new window
        const windows = browser.getWindowHandles();
        if (windows.length === 1) {
            console.warn('Only 1 window is opened');
            return windows[0];
        }
        return windows.find((w) => initialWindows.indexOf(w) === -1);
    }

    getAllCookies() {
        return browser.getAllCookies();
    }

    getWindowHandles() {
        return browser.getWindowHandles();
    }

    getCoordinatesForElement(selector: string) {
        return $(selector).getLocation();
    }

    getBaseUrl() {
        return browser.options.baseUrl;
    }

    getWindowSize(): { height: number; width: number; x: number; y: number } {
        return browser.getWindowSize();
    }
    getViewportSize() {
        return browser.getWindowSize();
    }

    getPageTitle(): string {
        return browser.getTitle();
    }

    getWindowInfo(): { allOpenedWindows: Array<string>; currentWindow: string } {
        return {
            allOpenedWindows: this.getWindowHandles(),
            currentWindow: browser.getWindowHandle()
        };
    }

    getSelectedOption(selector) {
        const element = $(selector);
        const option = element.$(`[value='${element.getValue()}']`);
        return option.getText();
    }

    getPropertyValueViaScript(selector: string, propertyValue: string, timeout = this.defaultWaitTime) {
        this.waitForVisible(selector, timeout);
        return browser.execute(
            `return window.getComputedStyle(document.querySelector('${selector}'), ':after').getPropertyValue('${propertyValue}')`
        );
    }

    getWindowTitle() {
        return browser.getTitle();
    }

    getElementSize(selector: string) {
        return $(selector).getSize();
    }

    /** Checks **/

    isElementVisible(selector: string, timeout = this.defaultWaitTime): boolean {
        try {
            this.waitForElement(selector, timeout);
        } catch (error) {
            /* empty */
        }
        return $(selector).isDisplayed();
    }

    isElementEnabled(selector: string, timeout = this.defaultWaitTime): boolean {
        try {
            this.waitForElement(selector, timeout, false);
        } catch (error) {
            /* empty */
        }
        return $(selector).isEnabled();
    }

    isElementExisting(selector: string, timeout = this.defaultWaitTime, withWait = true): boolean {
        try {
            if (withWait) {
                this.waitForElement(selector, timeout, false);
            } else {
                this.waitForInVisible(selector, timeout);
            }
        } catch (error) {
            /* empty */
        }
        return $(selector).isExisting();
    }

    isElementClickable(selector: string, timeout = this.defaultWaitTime) {
        $(selector).waitForExist({ timeout });
        try {
            this.waitForClickable(selector, timeout);
        } catch (error) {
            /* empty */
        }
        return $(selector).isClickable();
    }

    isElementInteractive(selector: string) {
        try {
            const isPresent = $(selector).isExisting();
            const isVisible = $(selector).isDisplayed();
            const isDisabled = $(selector).getAttribute('disabled') === 'true';
            const isReadOnly = $(selector).getAttribute('readonly') === 'true';

            return (isPresent && isVisible && !isDisabled && !isReadOnly);

        } catch (error) {
            /* handle error if needed */
            return false;
        }
    }

    isCheckboxSelected(selector: string) {
        return $(selector).isSelected();
    }

    isFileDownloaded(fileName: string) {
        const path = `${process.env.DEFAULT_DOWNLOAD_DIR}/${fileName}`;
        this.waitForFileToBePresent(path);
        return fs.existsSync(path);
    }

    isChecked(selector: string) {
        return this.getAttribute(selector, 'class').includes('checked');
    }
}
