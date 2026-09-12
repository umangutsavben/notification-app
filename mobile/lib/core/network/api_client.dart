import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;

  ApiClient({required String baseUrl}) : _dio = Dio(BaseOptions(baseUrl: baseUrl)) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // TODO: Add auth token to headers
        return handler.next(options);
      },
      onResponse: (response, handler) {
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        // TODO: Handle global errors (e.g., 401 Unauthorized)
        return handler.next(e);
      },
    ));
  }

  Dio get dio => _dio;
}
