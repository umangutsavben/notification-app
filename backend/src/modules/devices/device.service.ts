import prisma from '../../database';
import { Platform } from '@prisma/client';

export interface RegisterDeviceDto {
  userId: string;
  deviceId: string;
  platform: Platform;
  pushToken?: string;
  appVersion?: string;
}

export interface UpdateDeviceDto {
  userId: string;
  deviceId: string;
  pushToken?: string;
  appVersion?: string;
  isActive?: boolean;
}

export class DeviceService {
  static async registerDevice(data: RegisterDeviceDto) {
    const { userId, deviceId, platform, pushToken, appVersion } = data;

    const device = await prisma.device.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        }
      },
      update: {
        platform,
        pushToken,
        appVersion,
        isActive: true,
        lastActive: new Date(),
      },
      create: {
        userId,
        deviceId,
        platform,
        pushToken,
        appVersion,
        isActive: true,
      },
    });

    return device;
  }

  static async updateDevice(data: UpdateDeviceDto) {
    const { userId, deviceId, ...updateFields } = data;

    const device = await prisma.device.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });

    if (!device) {
      return null;
    }

    return await prisma.device.update({
      where: { id: device.id },
      data: {
        ...updateFields,
        lastActive: new Date(),
      },
    });
  }

  static async deactivateDevice(userId: string, deviceId: string) {
    const device = await prisma.device.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });

    if (!device) {
      return false;
    }

    await prisma.device.update({
      where: { id: device.id },
      data: { isActive: false, lastActive: new Date() },
    });

    return true;
  }
}
