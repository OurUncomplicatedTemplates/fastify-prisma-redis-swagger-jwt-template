export default class TimeUtil {
	public static getNowUnixTimeStamp(): number {
		return Math.floor(Date.now() / 1000);
	}
}
