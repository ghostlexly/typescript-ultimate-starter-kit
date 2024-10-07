import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/common/providers/database/database.service";

@Injectable()
export class SharedService {
  constructor(private db: DatabaseService) {}
}
