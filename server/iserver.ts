import { DeviceDetectorResult } from "device-detector-js";
export interface ActiveDevices {
	id: string;
	username: string;
	platform: string | DeviceDetectorResult;
	clientIp: string | string[] | null;
}
