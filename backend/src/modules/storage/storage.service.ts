import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StorageDocument, StorageRecord } from "./storage.schema";

@Injectable()
export class StorageService {
  constructor(
    @InjectModel(StorageRecord.name)
    private readonly storageModel: Model<StorageDocument>
  ) {}

  async get(key: string) {
    return this.storageModel.findOne({ key }, { _id: 0, __v: 0 }).lean();
  }

  async set(key: string, value: string) {
    await this.storageModel.updateOne(
      { key },
      { $set: { key, value } },
      { upsert: true }
    );
    return { key, saved: true };
  }
}
