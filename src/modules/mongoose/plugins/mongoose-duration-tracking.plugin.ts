import { Query, Schema } from 'mongoose';
import { mongooseEventEmitter } from '../modules/mongoose-monitoring-db/mongoose-monitoring-db.service';

export interface IMongooseTracking {
  op: string;
  collection: string;
  query?: any;
  update?: any
  options?: any;
  piplines?: any;
  aggregate?: boolean;
  duration: number;
}

// Plugin to add duration tracking to all schemas
export const mongooseTrackingPlugin = (schema: Schema) => {
  // List of operations to track
  const operations = ['find', 'findOne', 'insertMany', 'findOneAndUpdate', 'findOneAndDelete', 'updateOne', 'deleteOne', 'deleteMany', 'save', 'countDocuments'];

  operations.forEach((op: any) => {
    // Pre hook for tracking start time
    schema.pre(op, function (next) {
      try {
        this._startTime = Date.now();
      } catch (_) { }
      next();
    });

    // Post hook for tracking end time and logging duration
    schema.post(op, function (result, next) {
      try {
        const duration = Date.now() - (this["_startTime"] as any);
        const iTracking: IMongooseTracking = { op, collection: this.model().collection.name, duration };
        if (this instanceof Query) {
          iTracking.query = this.getQuery();
          iTracking.options = this.getOptions();
          if (this.getUpdate) {
            iTracking.update = this.getUpdate();
          }
        } else {
          iTracking.query = this;
        }
        mongooseEventEmitter?.emit("IMongooseTracking", iTracking);
      } catch (_) { }
      next();
    });
  });

  // Specific handling for aggregate
  schema.pre('aggregate', function (next) {
    try {
      this["_startTime"] = Date.now();
    } catch (_) { }
    next();
  });

  schema.post('aggregate', function (result, next) {
    try {
      const duration = Date.now() - this["_startTime"];
      const iTracking: IMongooseTracking = {
        duration,
        op: 'aggregate',
        collection: this.model().collection.name,
        piplines: this.pipeline(),
        aggregate: true,
      };
      mongooseEventEmitter?.emit("IMongooseTracking", iTracking);
    } catch (_) { }

    next();
  });
}