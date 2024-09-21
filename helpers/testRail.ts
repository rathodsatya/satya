import btoa = require('btoa');
import FormData = require('form-data');
import axios, { AxiosInstance } from 'axios';

interface Options {
    readonly _user: string;
    readonly _password: string;
    readonly _baseUrl: string;
    readonly projectId?: number;
    readonly suiteId?: number;
    readonly runName?: string;
}

interface CreateRunRequestData {
    readonly suite_id: number;
    readonly name: string;
    readonly assignedto_id: string;
    readonly include_all: boolean;
    readonly case_ids: [number] | [];
    readonly description?: string;
}

interface UpdateRequest {
    caseId: string;
    runId?: string;
    passed?: boolean;
    errorMessage?: string;
    resultId?: string;
    changeStatusTo?: string;
    url?: string;
    stack: any;
}

export class TestRailHelper {
    constructor(options: Options) {
        this._user = process.env.TESTRAIL_USER;
        this._password = process.env.TESTRAIL_PASSWORD;
        this._baseUrl = process.env.TESTRAIL_BASE_URL;
        this.projectId = options.projectId;
        this.suiteId = options.suiteId;
        this.runName = options.runName;
    }

    private readonly _user: string;
    private readonly _password: string;
    private readonly _baseUrl: string;
    private readonly projectId: number;
    private readonly suiteId: number;
    private readonly runName: string;

    private apiClient(contentType = 'application/json'): AxiosInstance {
        const errorCode = '\x1b[31m%s\x1b[0m';
        const message = (property: string) => ` TESTRAIL API - ${property} is not defined. Please check .env`;

        if (!this._user) {
            throw new Error(errorCode + message('User email'));
        }
        if (!this._password) {
            throw new Error(errorCode + message('API Token'));
        }
        if (!this._baseUrl) {
            throw new Error(errorCode + message('Base url'));
        }

        return axios.create({
            baseURL: this._baseUrl,
            headers: {
                'Content-Type': contentType,
                Authorization: 'Basic ' + btoa(`${this._user}:${this._password}`)
            }
        });
    }

    async addAttachment(testInfo: UpdateRequest, image: string, imageName = 'browserScreenshot.png'): Promise<void> {
        const url = `add_attachment_to_result_for_case/${testInfo.resultId}/${testInfo.caseId}`;
        const formData = new FormData();

        formData.append('attachment', image, imageName);
        return await this.apiClient(`multipart/form-data; boundary=${formData.getBoundary()}`).post(url, formData);
    }

    async getResultsForCase(testInfo: UpdateRequest): Promise<string> {
        const url = `get_results_for_case/${testInfo.runId}/${testInfo.caseId}`;
        const response = await this.apiClient().get(url);
        return response.data.results[0].id as string;
    }

    async createRun(ids: [number] | []): Promise<string> {
        const url = `add_run/${this.projectId}`;
        const data: CreateRunRequestData = {
            suite_id: this.suiteId,
            name: this.runName,
            assignedto_id: '',
            include_all: false,
            case_ids: ids
        };
        try {
            const response = await this.apiClient().post(url, data);
            return response.data;
        } catch (e) {
            console.log(e);
        }
    }

    async updateRun(runId, config: CreateRunRequestData): Promise<string> {
        const url = `update_run/${runId}`;
        try {
            const response = await this.apiClient().post(url, config);
            return response.data;
        } catch (e) {
            console.log(e);
        }
    }
    async markTestCaseAsBlocked(testInfo: UpdateRequest): Promise<void> {
        const url = `add_result_for_case/${testInfo.runId}/${testInfo.caseId}`;
        let statusId = null;

        // Implement the logic to mark the test case as xit in TestRail
        // You would typically use TestRail API to update the status of the test case
        // For example:
        //  - Find the test case by ID or title in TestRail
        //  - Update its status to "xit" (or equivalent status in TestRail)
        try {
            // Make the API call to update the status of the test case
            const response = await this.apiClient().post(url, {
                status_id: 3,
                comment: 'Status: Blocked'
            });
        
            // If the request was successful, return the response data
            return response.data;
        } catch (error) {
            // If an error occurs during the API call, log the error and any response data
            console.error('Error occurred:', error.response.data);
        }

    }
    async addCaseResult(testInfo: UpdateRequest, image = null): Promise<void> {
        const url = `add_result_for_case/${testInfo.runId}/${testInfo.caseId}`;
        let statusId = null;
        if (!testInfo.changeStatusTo) {
            statusId = testInfo.passed ? 1 : 5;
        }
        await this.apiClient().post(url, {
            status_id: statusId,
            comment: testInfo.passed
                ? 'Status: Passed'
                : `Status: Failed \n Case Id: [C${testInfo.caseId}] \n Error message: ${testInfo.errorMessage} \n URL: ${testInfo.url} \n Stack:\n${testInfo.stack}`
        });

        if (image) {
            const resultId = await this.getResultsForCase(testInfo);
            await this.addAttachment({ ...testInfo, resultId }, image);
        }
    }

    async addCommentToTestCase(testInfo: { runId; caseId }, comment: string): Promise<void> {
        const url = `add_result_for_case/${testInfo.runId}/${testInfo.caseId}`;
        return await this.apiClient().post(url, {
            comment
        });
    }
}
