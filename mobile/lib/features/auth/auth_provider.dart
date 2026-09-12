import 'package:flutter/foundation.dart';
import '../../core/storage/secure_storage.dart';
import '../../core/network/api_client.dart';
import '../devices/device_service.dart';
import 'appwrite_auth_service.dart';

enum AuthState { unauthenticated, authenticating, authenticated, authError, loggingOut }

class AuthProvider extends ChangeNotifier {
  final AppwriteAuthService _appwriteService = AppwriteAuthService();
  final SecureStorage _storage = SecureStorage();
  late final ApiClient _apiClient;
  
  AuthState _state = AuthState.unauthenticated;
  String? _errorMessage;

  AuthState get state => _state;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _apiClient = ApiClient(baseUrl: 'http://10.0.2.2:3000/api/v1'); // Emulator localhost
  }

  Future<void> checkAuthStatus() async {
    final token = await _storage.getToken();
    if (token != null) {
      try {
        // Verify token with backend /auth/me
        await _apiClient.dio.get('/auth/me');
        _setState(AuthState.authenticated);
      } catch (e) {
        // Token invalid or expired
        await _storage.deleteToken();
        _setState(AuthState.unauthenticated);
      }
    } else {
      _setState(AuthState.unauthenticated);
    }
  }

  Future<String> requestOtp(String phone) async {
    _setState(AuthState.authenticating);
    try {
      final token = await _appwriteService.createPhoneToken(phone);
      _setState(AuthState.unauthenticated); // Waiting for OTP
      return token.userId;
    } catch (e) {
      _errorMessage = 'Failed to send OTP. Please check the number.';
      _setState(AuthState.authError);
      rethrow;
    }
  }

  Future<void> verifyOtpAndLogin(String userId, String secret) async {
    _setState(AuthState.authenticating);
    try {
      // 1. Appwrite Session
      await _appwriteService.updatePhoneSession(userId, secret);
      
      // 2. Get Appwrite JWT
      final jwt = await _appwriteService.createJWT();
      
      // 3. Exchange with Backend
      final response = await _apiClient.dio.post('/auth/exchange', data: {
        'sessionToken': jwt.jwt
      });
      
      // 4. Save local token
      final accessToken = response.data['accessToken'];
      await _storage.saveToken(accessToken);
      
      // 5. Register Device
      final deviceService = DeviceService(_apiClient);
      final deviceId = 'device-\${DateTime.now().millisecondsSinceEpoch}'; // Placeholder device ID
      await deviceService.registerDevice(deviceId);
      
      _setState(AuthState.authenticated);
    } catch (e) {
      _errorMessage = 'Invalid OTP or authentication failed.';
      _setState(AuthState.authError);
      rethrow;
    }
  }

  Future<void> logout() async {
    _setState(AuthState.loggingOut);
    try {
      await _apiClient.dio.post('/auth/logout');
    } catch (_) {} // Ignore backend logout failure
    
    await _appwriteService.logout();
    await _storage.deleteToken();
    _setState(AuthState.unauthenticated);
  }

  void _setState(AuthState newState) {
    _state = newState;
    notifyListeners();
  }
}
