import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:bloc/bloc.dart';

import '../models/chat.dart';
import '../env.g.dart';
import 'bloc.dart';

/// After 9 minutes without any communication, we should refresh a connection
/// because the server can disconnect it when there is no messages about 10 minutes.
const maxKeepAliveMinutes = 9;

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final _codec = JsonCodec();
  final _messages = <ChatReply>[];

  WebSocket _socket; // ignore:close_sinks
  StreamSubscription _subs; // ignore:cancel_subscriptions
  final _pending = <Chat>[];

  Timer _keepAliveTimer;
  DateTime _lastActivated;

  @override
  ChatState get initialState => InitialChatState();

  @override
  Stream<ChatState> mapEventToState(
    ChatEvent event,
  ) async* {
    if (event is Connect) {
      await this._connect();
    } else if (event is SendChat) {
      this._send(event.chat);
    } else if (event is ChatReceived) {
      this._messages.add(event.chat);
      yield MessagingChatState(messages: []..addAll(this._messages));
    }
  }

  @override
  void dispose() {
    super.dispose();
    this._disconnect();
  }

  Future<void> _connect() async {
    assert(this._socket == null);
    this._installKeepAliveTimer();
    this._connectSocket();
  }

  void _disconnect() {
    this._resetKeepAliveTimer();
    this._resetSocket();
  }

  void _installKeepAliveTimer() {
    this._keepAliveTimer = Timer.periodic(Duration(minutes: 1), (timer) {
      if (timer.isActive &&
          DateTime.now().difference(this._lastActivated).inMinutes >
              maxKeepAliveMinutes) {
        this._resetSocket();
        this._connectSocket();
      }
    });
  }

  void _connectSocket() async {
    this._lastActivated = DateTime.now();
    this._socket = await WebSocket.connect(EnvironmentVariables.serverUrl);
    print('Connect with a server at $_lastActivated');

    this._subs = this
        ._socket
        .map(this._decodeChatFromBackend)
        .listen(this._onChatFromBackend);

    // Send pending messages while connecting.
    if (this._pending.length > 0) {
      final pending = []..addAll(this._pending);
      this._pending.clear();
      for (final each in pending) {
        this._send(each);
      }
    }
  }

  void _resetSocket() {
    if (this._socket == null) {
      return;
    }
    print('Reset a socket at ${DateTime.now()}');
    this._subs.cancel();
    this._socket.close();
    this._socket = null;
  }

  void _resetKeepAliveTimer() {
    if (this._keepAliveTimer == null) {
      return;
    }
    this._keepAliveTimer.cancel();
    this._keepAliveTimer = null;
    this._lastActivated = null;
  }

  void _send(Chat chat) {
    if (this._socket == null) {
      this._pending.add(chat);
      return;
    }
    final text = this._codec.encode(chat.toJson());
    this._socket.add(text);
    this._lastActivated = DateTime.now();
  }

  ChatReply _decodeChatFromBackend(dynamic value) {
    this._lastActivated = DateTime.now();
    try {
      return ChatReply.fromJson(this._codec.decode(value));
    } catch (error) {
      print('Invalid message: $error');
      return null;
    }
  }

  void _onChatFromBackend(ChatReply chat) {
    if (chat == null) {
      return;
    }
    this.dispatch(ChatReceived(chat: chat));
  }
}
