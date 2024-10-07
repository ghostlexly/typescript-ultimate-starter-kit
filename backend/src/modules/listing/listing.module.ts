import { Module } from "@nestjs/common";
import { ListingService } from "./listing.service";
import { CustomerListingController } from "./controllers/customer-listing.controller";

@Module({
  imports: [],
  providers: [ListingService],
  controllers: [CustomerListingController],
  exports: [],
})
export class ListingModule {}
