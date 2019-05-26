import 'package:equatable/equatable.dart';
import 'package:meta/meta.dart';

import '../models/chat.dart';

@immutable
abstract class ChatEvent extends Equatable {
  ChatEvent([List props = const []]) : super(props);
}

class Connect extends ChatEvent {}

class SendChat extends ChatEvent {
  final Chat chat;

  SendChat({@required this.chat})
      : assert(chat != null),
        super([chat]);
}

class ChatReceived extends ChatEvent {
  final ChatReply chat;

  ChatReceived({@required this.chat})
      : assert(chat != null),
        super([chat]);
}
