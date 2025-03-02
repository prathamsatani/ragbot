import { Int32, ObjectId, UUID } from "mongodb";

interface EventLogInterface {
  insertId: UUID;
  timestamp: Date;
  severity: string;
  testPayload: string;
  source: string;
}

interface APILogInterface {
  method: string;
  endpoint: string;
  status: number;
  timestamp: Date;
  ip: string;
}

interface UserInterface {
  email: string;
  password: string;
  fname: string;
  lname: string;
  date_added: Date;
  access: string[];
}

interface ChatbotSettingsInterface {
  _id: ObjectId;
  systemPrompt: string;
  retrieverPrompt: string;
  collectionName: string;
  dateCreated: Date;
  isActive: boolean;
  lastUpdated: Date;
  name: string;
  contextFile: {
    name: string;
    size: Int32;
    type: string;
    lastModified: Date;
  };
}

export class EventLogModel {
  constructor(
    protected insertId: UUID,
    protected timestamp: Date,
    protected severity: string,
    protected testPayload: string,
    protected source: string
  ) {}

  public serialize(log: EventLogInterface) {
    this.insertId = log.insertId;
    this.timestamp = log.timestamp;
    this.severity = log.severity;
    this.testPayload = log.testPayload;
    this.source = log.source;
  }

  public getLog() {
    return {
      insertId: this.insertId,
      timestamp: this.timestamp,
      severity: this.severity,
      testPayload: this.testPayload,
      source: this.source,
    };
  }
}

export class APILogModel {
  constructor(
    protected method: string,
    protected endpoint: string,
    protected status: number,
    protected timestamp: Date,
    protected ip: string
  ) {}

  public serialize(log: APILogInterface) {
    this.method = log.method;
    this.endpoint = log.endpoint;
    this.status = log.status;
    this.timestamp = log.timestamp;
    this.ip = log.ip;
  }

  public getLog() {
    return {
      method: this.method,
      endpoint: this.endpoint,
      status: this.status,
      timestamp: this.timestamp,
      ip: this.ip,
    };
  }
}

export class UserModel {
  constructor(
    protected email: string,
    protected password: string,
    protected fname: string,
    protected lname: string,
    protected date_added: Date,
    protected access: string[]
  ) {}

  public serialize(user: UserInterface) {
    this.email = user.email;
    this.password = user.password;
    this.fname = user.fname;
    this.lname = user.lname;
    this.date_added = user.date_added;
    this.access = user.access;
  }

  public getUser() {
    return {
      email: this.email,
      password: this.password,
      fname: this.fname,
      lname: this.lname,
      date_added: this.date_added,
      access: this.access,
    };
  }
}

export class ChatbotSettingsModel implements ChatbotSettingsInterface {
  public _id!: ObjectId;
  public systemPrompt!: string;
  public retrieverPrompt!: string;
  public collectionName!: string;
  public dateCreated!: Date;
  public isActive!: boolean;
  public lastUpdated!: Date;
  public name!: string;
  public contextFile!: {
    name: string;
    size: Int32;
    type: string;
    lastModified: Date;
  };

  public serialize(chatbotSettings: ChatbotSettingsInterface) {
    this._id = chatbotSettings._id;
    this.systemPrompt = chatbotSettings.systemPrompt;
    this.retrieverPrompt = chatbotSettings.retrieverPrompt;
    this.collectionName = chatbotSettings.collectionName;
    this.dateCreated = chatbotSettings.dateCreated;
    this.isActive = chatbotSettings.isActive;
    this.lastUpdated = chatbotSettings.lastUpdated;
    this.name = chatbotSettings.name;
    this.contextFile = chatbotSettings.contextFile;
  }

  public getChatbotSettings() {
    return {
      _id: this._id,
      systemPrompt: this.systemPrompt,
      retrieverPrompt: this.retrieverPrompt,
      collectionName: this.collectionName,
      dateCreated: this.dateCreated,
      isActive: this.isActive,
      lastUpdated: this.lastUpdated,
      name: this.name,
      contextFile: this.contextFile,
    };
  }
}
