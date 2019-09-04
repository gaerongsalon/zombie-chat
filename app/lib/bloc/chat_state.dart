import 'package:equatable/equatable.dart';
import 'package:meta/meta.dart';

import '../models/chat.dart';

@immutable
abstract class ChatState extends Equatable {
  ChatState([List props = const []]) : super(props);
}

class InitialChatState extends ChatState {}

class MessagingChatState extends ChatState {
  final List<ChatReply> messages;

  MessagingChatState({@required this.messages})
      : assert(messages != null),
        super([messages]);
}
