import { Stack, type StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_ENV_VARS = ["DATABASE_URL", "AGENT_DATABASE_URL", "ANTHROPIC_API_KEY", "JWT_SECRET"];

interface BackendStackProps extends StackProps {
  clientOrigin: string;
}

export class BackendStack extends Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    for (const key of REQUIRED_ENV_VARS) {
      if (!process.env[key]) {
        throw new Error(
          `${key} is not set in the shell environment — export the values from server/.env before running cdk deploy`,
        );
      }
    }

    const fn = new lambdaNode.NodejsFunction(this, "ApiFunction", {
      functionName: "signal-api",
      entry: path.resolve(__dirname, "../../server/src/lambda.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_24_X,
      memorySize: 512,
      timeout: Duration.seconds(30),
      bundling: {
        format: lambdaNode.OutputFormat.ESM,
        target: "node24",
        // Some bundled CJS dependencies still call require() internally;
        // this keeps those working inside an ESM output bundle.
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        AGENT_DATABASE_URL: process.env.AGENT_DATABASE_URL!,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
        JWT_SECRET: process.env.JWT_SECRET!,
        CLIENT_ORIGIN: props.clientOrigin,
      },
    });

    // No corsPreflight here — CORS is handled exclusively by @fastify/cors
    // inside the app itself. Configuring it at both layers is a reliable
    // way to get duplicate/conflicting CORS headers.
    const httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      apiName: "signal-api",
      defaultIntegration: new HttpLambdaIntegration("LambdaIntegration", fn),
    });

    this.apiUrl = httpApi.apiEndpoint;

    new CfnOutput(this, "ApiUrl", { value: httpApi.apiEndpoint });
    new CfnOutput(this, "FunctionName", { value: fn.functionName! });
  }
}
