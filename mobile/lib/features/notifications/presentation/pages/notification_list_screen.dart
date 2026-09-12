import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../services/notification_service.dart';

class NotificationListScreen extends StatefulWidget {
  @override
  _NotificationListScreenState createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  final NotificationService _service = NotificationService(ApiClient(baseUrl: 'http://10.0.2.2:3000/api/v1'));
  
  List<dynamic> _notifications = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _offset = 0;
  final int _limit = 20;
  
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      if (!_isLoading && _hasMore) {
        _fetchNotifications();
      }
    }
  }

  Future<void> _fetchNotifications({bool refresh = false}) async {
    if (refresh) {
      _offset = 0;
      _notifications.clear();
      _hasMore = true;
    }

    if (!_hasMore) return;

    setState(() { _isLoading = true; });

    try {
      final data = await _service.getNotifications(limit: _limit, offset: _offset);
      final fetched = data['notifications'] as List;
      
      setState(() {
        _offset += fetched.length;
        _notifications.addAll(fetched);
        _hasMore = data['pagination']['hasMore'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _isLoading = false; });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load notifications')));
    }
  }

  Future<void> _markAsRead(String id, int index) async {
    if (_notifications[index]['isRead'] == true) return;

    setState(() {
      _notifications[index]['isRead'] = true;
    });

    try {
      await _service.markAsRead(id);
    } catch (e) {
      setState(() { _notifications[index]['isRead'] = false; });
    }
  }

  Future<void> _markAllAsRead() async {
    setState(() {
      for (var n in _notifications) {
        n['isRead'] = true;
      }
    });
    
    try {
      await _service.markAllAsRead();
    } catch (e) {
      _fetchNotifications(refresh: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Notifications'),
        actions: [
          IconButton(
            icon: Icon(Icons.done_all),
            onPressed: _markAllAsRead,
            tooltip: 'Mark all as read',
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _fetchNotifications(refresh: true),
        child: _notifications.isEmpty && !_isLoading
            ? Center(child: Text('No notifications yet.'))
            : ListView.builder(
                controller: _scrollController,
                itemCount: _notifications.length + (_hasMore ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == _notifications.length) {
                    return Center(child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: CircularProgressIndicator(),
                    ));
                  }

                  final notif = _notifications[index];
                  final isRead = notif['isRead'] == true;
                  final content = notif['notification'];

                  return ListTile(
                    tileColor: isRead ? null : Colors.blue.withOpacity(0.1),
                    title: Text(content['title'] ?? 'Notification', style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold)),
                    subtitle: Text(content['body'] ?? ''),
                    onTap: () => _markAsRead(content['id'], index),
                  );
                },
              ),
      ),
    );
  }
}
