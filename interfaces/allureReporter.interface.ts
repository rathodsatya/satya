export interface AllureReporterInterface {
    addFeature(featureName: string): void;
    addLabel(name: string, value: string): void;
    addSeverity(severity: string): void;
    addIssue(issue: string): void;
    addTestId(testId: string): void;
    addStory(storyName: string): void;
    addEnvironment(name: string, value: string): void;
    addDescription(description: string, descriptionType: string): void;
    addAttachment(name: string, content: string | Buffer, type?: string): void;
    startStep(title: string): void;
    endStep(status?: string): void;
    addStep(title: string, attachmentObject?: object, status?: string): void;
    addArgument(name: string, value: string): void;
}
