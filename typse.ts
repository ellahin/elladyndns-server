export interface auth {
    id: string
    secret: string
    zoneID: string
    domain: string
}

export interface authFile {
    [key: string]: auth
}

export interface postRequest {
    id: string,
    secret: string
}