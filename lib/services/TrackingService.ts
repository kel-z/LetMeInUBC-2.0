import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class TrackingService extends Construct {
  public readonly createEndpointHandler: lambda.Function;
  public readonly deleteEndpointHandler: lambda.Function;
  public readonly deleteHandler: lambda.Function;
  public readonly getEndpointHandler: lambda.Function;
  public readonly getByEmailHandler: lambda.Function;
  public readonly getByCourseHandler: lambda.Function;
  public readonly getByAllCoursesHandler: lambda.Function;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    const RESOURCE_FOLDER = 'resources/TrackingService';

    this.getByEmailHandler = new lambda.Function(this, 'GetTrackingByEmailHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'GetTrackingByEmail.handler',
      code: lambda.Code.fromAsset(`${RESOURCE_FOLDER}`),
      environment: {
        TRACKING_TABLE_NAME: props.TRACKING_TABLE_NAME,
        EMAIL_INDEX_NAME: props.EMAIL_INDEX_NAME
      }
    });

    this.getByCourseHandler = new lambda.Function(this, 'GetTrackingByCourseHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'GetTrackingByCourse.handler',
      code: lambda.Code.fromAsset(`${RESOURCE_FOLDER}`),
      environment: {
        TRACKING_TABLE_NAME: props.TRACKING_TABLE_NAME,
        COURSE_INDEX_NAME: props.COURSE_INDEX_NAME,
      }
    });

    this.getByAllCoursesHandler = new lambda.Function(this, 'GetTrackingByAllCoursesHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'GetTrackingByAllCourses.handler',
      code: lambda.Code.fromAsset(`${RESOURCE_FOLDER}`),
      environment: {
        TRACKING_TABLE_NAME: props.TRACKING_TABLE_NAME
      }
    });

    this.createEndpointHandler = new lambda.Function(this, 'CreateEndpointTrackingHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'createTracking/index.handler',
      code: lambda.Code.fromAsset(`${RESOURCE_FOLDER}`),
      environment: {
        GET_COURSE_DATA_FUNCTION_NAME: props.GET_COURSE_DATA_FUNCTION_NAME,
        TRACKING_TABLE_NAME: props.TRACKING_TABLE_NAME,
        COURSES_TABLE_NAME: props.COURSES_TABLE_NAME
      }
    });

    this.deleteHandler = new lambda.Function(this, 'DeleteTrackingHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'DeleteTracking.handler',
      code: lambda.Code.fromAsset(`${RESOURCE_FOLDER}`),
      environment: {
        TRACKING_TABLE_NAME: props.TRACKING_TABLE_NAME
      }
    });

    this.deleteEndpointHandler = new lambda.Function(this, 'DeleteEndpointTrackingHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'DeleteEndpointTracking.handler',
      code: lambda.Code.fromAsset(`${RESOURCE_FOLDER}`),
      environment: {
        DELETE_TRACKING_FUNCTION_NAME: this.deleteHandler.functionName
      }
    });

    this.getEndpointHandler = new lambda.Function(this, 'GetEndpointTrackingHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'GetEndpointTracking.handler',
      code: lambda.Code.fromAsset(`${RESOURCE_FOLDER}`),
      environment: {
        getByEmailFunctionName: this.getByEmailHandler.functionName,
        getByCourseFunctionName: this.getByCourseHandler.functionName,
        getByAllCoursesFunctionName: this.getByAllCoursesHandler.functionName,
      }
    });

    this.getByAllCoursesHandler.grantInvoke(this.getEndpointHandler);
    this.getByCourseHandler.grantInvoke(this.getEndpointHandler);
    this.getByEmailHandler.grantInvoke(this.getEndpointHandler);
    this.deleteHandler.grantInvoke(this.deleteEndpointHandler);
  }
}
