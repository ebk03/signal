import { App } from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack.js";
import { BackendStack } from "../lib/backend-stack.js";

const app = new App();

const frontendStack = new FrontendStack(app, "SignalFrontendStack");

new BackendStack(app, "SignalBackendStack", {
  clientOrigin: `https://${frontendStack.distribution.domainName}`,
});
