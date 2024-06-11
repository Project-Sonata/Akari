
export class SonataClient {

    constructor(private readonly details: ConnectionDetails) {
    }

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