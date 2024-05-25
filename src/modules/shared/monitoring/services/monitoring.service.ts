import { MonitoringBaseFilterDto } from "../dtos/base-filter.dto";
import moment from "moment-timezone";

export abstract class MonitoringService {
  public getPaginationData(object: any) {
    const perPage = Math.min(+(object.per_page ?? 20), 50);
    const page = +(object.page ?? 1);
    const skip = perPage * page - perPage;
    return { perPage, skip };
  }

  public getFilterDates(filterDto: Partial<MonitoringBaseFilterDto>): {
    fromDate: Date;
    toDate: Date;
  } {
    const fromDate = filterDto.fromDate
      ? moment(filterDto.fromDate).toDate()
      : moment().subtract(1, "d").toDate();
    const toDate = filterDto.toDate ? moment(filterDto.toDate).toDate() : moment().toDate();

    return { fromDate, toDate };
  }

  /**
   * @param {moment.MomentInput} startDate The start date
   * @param {moment.MomentInput} endDate The end date
   */
  public getRange(startDate: moment.MomentInput, endDate: moment.MomentInput): any[] {
    let type: moment.unitOfTime.Diff = "hours";
    if (moment(startDate).isSame(endDate, "hour")) {
      type = "minutes";
    } else if (
      moment(startDate).isSame(endDate, "day") ||
      moment(endDate).diff(startDate, "hour") <= 24
    ) {
      type = "hours";
    } else if (
      moment(startDate).isSame(endDate, "month") ||
      moment(endDate).diff(startDate, "days") < 31
    ) {
      type = "days";
    } else {
      type = "month";
    }

    const fromDate = moment(startDate);
    const toDate = moment(endDate);
    const diff = toDate.diff(fromDate, type);

    const range = [];
    for (let i = 0; i < diff; i++) {
      range.push(moment(startDate).add(i, type).toDate());
    }
    if (range.length == 1) {
      range.push(moment(endDate).toDate());
    }

    return range;
  }
}
