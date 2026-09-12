import 'package:dio/dio.dio';
import '../../../core/network/api_client.dart';

class NotificationService {
  final ApiClient _apiClient;

  NotificationService(this._apiClient);

  Future<Map<String, dynamic>> getNotifications({int limit = 20, int offset = 0}) async {
    final response = await _apiClient.dio.get('/notifications', queryParameters: {
      'limit': limit,
      'offset': offset,
    });
    return response.data;
  }

  Future<void> markAsRead(String id) async {
    await _apiClient.dio.patch('/notifications/\$id/read');
  }

  Future<void> markAllAsRead() async {
    await _apiClient.dio.patch('/notifications/read-all');
  }
}
