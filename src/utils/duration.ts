import { Duration } from "luxon";

export const formatDuration = (value: number) => {
    const duration = Duration.fromMillis(value*1000);
    return `${Math.floor(duration.as('hours'))}h ${String(Math.floor(duration.as('minutes') % 60)).padStart(2, '0')}m`;
};
  
export default formatDuration;