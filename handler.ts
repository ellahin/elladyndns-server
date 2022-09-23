import AWS from "aws-sdk"

const route53 = new AWS.Route53();

import type { postRequest } from "./typse";

import auth from "./auth.js"


import type { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2, } from "aws-lambda"


export const post: APIGatewayProxyHandlerV2 = async (event, context): Promise<APIGatewayProxyResultV2> => {

    // checking there is body

    if (!event.body){
        return{
            statusCode: 400,
            body: "Malformed request"
        }
    }

    const res: postRequest = JSON.parse(event.body)

    // checking correct json format

    if(!res.id || !res.secret) {
        return{
            statusCode: 400,
            body: "Malformed request"
        }
    }

    // checking id exist in authfile

    if(!auth[res.id]){
        return {
            statusCode: 401,
            body: "not authorized"
        }
    }

    // checking secret is correct

    if(auth[res.id].secret != res.secret){
        return {
            statusCode: 401,
            body: "not authorized"
        }
    }

    const authObj = auth[res.id]

    await new Promise((res, rej) => {

        route53.changeResourceRecordSets({
            HostedZoneId: authObj.zoneID,
            ChangeBatch: {
                Changes: [{ 
                Action: 'UPSERT',
                ResourceRecordSet: {
                    Name: authObj.domain,
                    Type: 'A',
                    TTL: 60 * 5, // 5 minutes
                    ResourceRecords: [{ Value: event.requestContext.http.sourceIp }]
                }
                }]
      }
        }, ((err, data)=> {
            if(err) console.log(err)
            console.log(data)
            res(true)
        }))

    }) 

    return {
        statusCode: 200,
        body: event.requestContext.http.sourceIp
    }
    
}

export const get: APIGatewayProxyHandlerV2 = async (event, context): Promise<APIGatewayProxyResultV2> => {

    return {
        statusCode: 200,
        body: "ping"
    }
    
}