import { Lambda } from 'aws-sdk';

const invokeLambdaAndGetData = async (params: Lambda.InvocationRequest): Promise<string[]> => {
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
  restricted: string,
}

interface emailParams {
  email: string,
}

exports.handler = async (event: any): Promise<any> => {
  const { key } = event.queryStringParameters;

  let invokeParams: Lambda.InvocationRequest;

  switch (key) {
    // get by course
    case 'courseName':
      const { department, section, number, session, restricted } = event.queryStringParameters;

      const courseParams: courseParams = {
        department: department,
        section: section,
        number: number,
        session: session,
        restricted: restricted,
      }

      invokeParams = {
        FunctionName: process.env.getByCourseFunctionName ? process.env.getByCourseFunctionName : "",
        Payload: Buffer.from(JSON.stringify(courseParams)),
      }

      const emails: string[] = await invokeLambdaAndGetData(invokeParams);

      if (emails.length === 0) 
        return {
          statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': "*" },    
        };

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': "*" },
        body: JSON.stringify(emails),
      };

    // get by email
    case 'email':
      const { email } = event.queryStringParameters;

      const emailParams: emailParams = { email: email };

      invokeParams = {
        FunctionName: process.env.getByEmailFunctionName ? process.env.getByEmailFunctionName : "",
        Payload: Buffer.from(JSON.stringify(emailParams)),
      }

      const courses: string[] = await invokeLambdaAndGetData(invokeParams);

      if (courses.length === 0) 
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': "*" },
          body: JSON.stringify(courses),
        };

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(courses),
      };

    // get all courses being tracked
    case 'allCourses':

    invokeParams = {
      FunctionName: process.env.getByAllCoursesFunctionName ? process.env.getByAllCoursesFunctionName : ""
    }

    const allCourses: string[] = await invokeLambdaAndGetData(invokeParams);

    if (allCourses.length === 0) 
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(allCourses),
    };
    
    // bad request, must specify key to query by
    default:
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: "Your key should be one of 'courseName', 'email', or 'allCourses'.",
      };
  }
}
