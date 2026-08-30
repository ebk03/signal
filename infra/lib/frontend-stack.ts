import { Stack, type StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// No client-side routing exists in this app (no react-router, by deliberate
// choice), so there's no SPA-fallback-to-index.html rewrite to configure —
// the usual CloudFront/S3 SPA gotcha doesn't apply here.
export class FrontendStack extends Stack {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "SiteBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // client/dist must exist by the time this synths — see the README's
    // deployment section for the required build-before-deploy order.
    const distPath = path.resolve(__dirname, "../../client/dist");

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset(distPath)],
      destinationBucket: bucket,
      distribution: this.distribution,
      distributionPaths: ["/*"],
    });

    new CfnOutput(this, "DistributionDomain", {
      value: this.distribution.domainName,
    });
  }
}
