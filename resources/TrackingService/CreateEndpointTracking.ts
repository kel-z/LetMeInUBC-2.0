import { Lambda } from 'aws-sdk';

const invokeLambdaAndGetData = async (params: Lambda.InvocationRequest): Promise<string> => {
    const invokeLambda = (params: Lambda.InvocationRequest) => {
        const lambda = new Lambda();

        return lambda.invoke(params).promise();
    };

    const getDataFromLambdaResponse = (response: Lambda.InvocationResponse): string => {
        return response.Payload ? response.Payload?.toString() : "";
    }

    const response = await invokeLambda(params);

    return JSON.parse(getDataFromLambdaResponse(response));
};

interface courseParams {
  department: string,
  section: string,
  number: string,
  session: string,
  email: string,
  restricted: string,
}

exports.handler = async (event: any): Promise<any> => {
  const { department, section, number, session, email, restricted } = JSON.parse(event.body);

  const courseParams: courseParams = {
    department: department,
    section: section,
    number: number,
    session: session,
    email: email,
    restricted: restricted,
  }

  const invokeParams = {
    FunctionName: process.env.createTrackingFunctionName ? process.env.createTrackingFunctionName : "",
    Payload: Buffer.from(JSON.stringify(courseParams)),
  }

  const response: string = await invokeLambdaAndGetData(invokeParams);

  return {
    statusCode: 200,
    body: response
  }
}
