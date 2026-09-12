import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  final Dio _dio;
  final SecureStorage _storage = SecureStorage();

  ApiClient({required String baseUrl}) : _dio = Dio(BaseOptions(baseUrl: baseUrl)) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        return handler.next(response);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          // Clear token on 401
          await _storage.deleteToken();
          // TODO: Trigger app logout event
        }
        return handler.next(e);
      },
    ));
  }

  Dio get dio => _dio;
}
