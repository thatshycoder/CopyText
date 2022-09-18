import { DeviceDetectorResult } from "device-detector-js";
export interface ActiveDevices {
	id: string;
	username: string;
	userAgent: string | DeviceDetectorResult;
	clientIp: string | string[] | null;
}
