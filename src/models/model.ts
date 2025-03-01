import { UUID } from "mongodb"

export class EventLogModel{
    constructor(
        public insertId: UUID,
        public timestamp: Date,
        public severity: string,
        public testPayload: string,
        public source: string,
    ){}

    getLog(){
        return {
            insertId: this.insertId,
            timestamp: this.timestamp,
            severity: this.severity,
            testPayload: this.testPayload,
            source: this.source
        }
    }
}

export class APILogModel{
    constructor(
        public method: string,
        public endpoint: string,
        public status: number,
        public timestamp: Date,
        public ip: string
    ){}

    getLog(){
        return {
            method: this.method,
            endpoint: this.endpoint,
            status: this.status,
            timestamp: this.timestamp,
            ip: this.ip
        }
    }
}

export class UserModel{
    constructor(
        public email: string,
        public password: string,
        public fname: string,
        public lname: string,
        public date_added: Date,
        public access: string[]
    ){}

    getUser(){
        return {
            email: this.email,
            password: this.password,
            fname: this.fname,
            lname: this.lname,
            date_added: this.date_added,
            access: this.access
        }
    }
}