import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const ROLES_METADATA_KEY = "Roles";
export const Roles = (...roles: Role[]) =>
  SetMetadata(ROLES_METADATA_KEY, roles);
