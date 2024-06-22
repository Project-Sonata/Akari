import {randomString} from "./Utils";

export class SonataClient {

    readonly REQUIRED_ID_LENGTH: number = 16;

    constructor(private readonly details: ConnectionDetails) {
    }

    connect(): Promise<any> {

        const deviceDetails = {
            id: randomString(this.REQUIRED_ID_LENGTH),
            name: this.details.name,
            device_type: "COMPUTER",
            volume: this.details.volume
        }

        const requestDetails: RequestInit = {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${this.details.getOauth2AccessToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(deviceDetails)
        };

        return fetch("http://localhost:8080/v1/player/device/connect", requestDetails)
            .then(resp => {
                if (resp.status == 204) {
                    return true;
                }
                return this.handleRequestError(resp);
            })
    }

    play(contextUri: string) {
        const requestBody = {
            "context_uri": contextUri
        };

        const requestDetails: RequestInit = {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${this.details.getOauth2AccessToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        };

        return fetch("http://localhost:8080/v1/player/play", requestDetails)
            .then(resp => {
                if (resp.status == 204) {
                    return true;
                }
                return this.handleRequestError(resp);
            })
    }

    private handleRequestError(resp: Response) {
        return resp.json()
            .then(body => {
                // We got binding exception when device details are wrong. As result, we get an array of errors that occurred
                if (body.messages) {
                    return this.invalidDeviceDetailsException(body);
                }
                // Generic exception(missing access token, etc.)
                return Promise.reject(
                    new SonataApiException(`Failed to connect the device to Sonata Web API:\n${body.description}`)
                )
            })
    }

    private invalidDeviceDetailsException(body) {
        let exceptionMessage = "Failed to connect the device to Sonata Web API: \n";

        for (const message of body.messages as ExceptionMessage[]) {
            exceptionMessage += `- ${message.description}\n`;
        }

        return Promise.reject(
            new SonataApiException(exceptionMessage)
        )
    }
}

export class SonataApiException extends TypeError {
}

/**
 * A details about client who wants to connect to Sonata API
 */
export interface ConnectionDetails {
    // Name of the client, will be displayed for user
    name: string,
    // A callback function that returns an access token
    getOauth2AccessToken: () => string,
    // volume for this device
    volume: number
}

interface ExceptionMessage {
    description: String
}
