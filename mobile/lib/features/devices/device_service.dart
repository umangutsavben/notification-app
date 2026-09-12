import 'dart:io';
import 'package:dio/dio.dio';
import '../../core/network/api_client.dart';

class DeviceService {
  final ApiClient _apiClient;

  DeviceService(this._apiClient);

  Future<void> registerDevice(String deviceId) async {
    final platform = Platform.isIOS ? 'IOS' : (Platform.isAndroid ? 'ANDROID' : 'WEB');
    
    // In Step 3, we use a placeholder push token since FCM/APNS is not implemented yet.
    final pushToken = 'placeholder-token-\$deviceId';
    final appVersion = '1.0.0';

    try {
      await _apiClient.dio.post('/devices', data: {
        'deviceId': deviceId,
        'platform': platform,
        'pushToken': pushToken,
        'appVersion': appVersion,
      });
    } on DioException catch (e) {
      print('Failed to register device: \${e.message}');
      // Don't rethrow, device registration failure shouldn't block the app
    }
  }
}
