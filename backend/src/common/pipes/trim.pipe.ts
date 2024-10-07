import { Injectable, PipeTransform, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class TrimPipe implements PipeTransform {
  private isObj(obj: any): boolean {
    return typeof obj === "object" && obj !== null;
  }

  private trim(values) {
    Object.keys(values).forEach((key) => {
      if (key !== "password") {
        if (this.isObj(values[key])) {
          values[key] = this.trim(values[key]);
        } else {
          if (typeof values[key] === "string") {
            values[key] = values[key].trim();
          }
        }
      }
    });
    return values;
  }

  transform(value: any, metadata: ArgumentMetadata) {
    // --------------------------------------------------
    // If the metadata type is not 'body', simply return the value without validation.
    // We only want to validate the body of the request, not the query parameters or the params.
    // --------------------------------------------------
    if (metadata.type !== "body") {
      return value;
    }

    if (this.isObj(value) && metadata.type === "body") {
      return this.trim(value);
    }

    return value;
  }
}
