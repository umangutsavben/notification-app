import 'package:appwrite/appwrite.dart';
import 'package:appwrite/models.dart' as models;

class AppwriteAuthService {
  final Client client = Client();
  late final Account account;

  AppwriteAuthService() {
    client
        // TODO: Update to real config or load from .env
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('your-appwrite-project-id');
    account = Account(client);
  }

  Future<models.Token> createPhoneToken(String phone) async {
    try {
      return await account.createPhoneToken(
        userId: ID.unique(),
        phone: phone,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<models.Session> updatePhoneSession(String userId, String secret) async {
    try {
      return await account.updatePhoneSession(
        userId: userId,
        secret: secret,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<models.Jwt> createJWT() async {
    try {
      return await account.createJWT();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await account.deleteSession(sessionId: 'current');
    } catch (e) {
      // Ignored if already logged out
    }
  }
}
